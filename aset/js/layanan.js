// Layanan yang butuh akun: masuk/daftar, aduan & aspirasi, keanggotaan,
// dan seluruh pekerjaan panel pengurus.
//
// Dua mesin dengan antarmuka yang sama:
//   - firebase : Firebase Authentication + Cloud Firestore (dimuat saat perlu)
//   - demo     : localStorage, untuk mencoba di komputer sendiri
// Halaman cukup memanggil fungsi di bawah tanpa peduli mesin mana yang aktif.
import { KONFIG, MODE, ASAL, sesiLokal } from './inti.js';
import { nomorTiket, namaKategori, namaBidang } from './rujukan.js';

const VERSI_FB = '12.19.0';
const ADMIN_UTAMA = (KONFIG.adminUtama || []).map((e) => e.toLowerCase());
const galat = (code, pesan) => Object.assign(new Error(pesan || code), { code });

// ======================================================================
// Sesi
// ======================================================================
let penggunaKini; // undefined = belum diketahui, null = tamu
const pendengar = new Set();
let siapSelesai;
const sesiSiap = new Promise((r) => (siapSelesai = r));

function umumkan(p) {
  penggunaKini = p;
  sesiLokal.simpan(p);
  siapSelesai(p);
  pendengar.forEach((fn) => fn(p));
}

/** Panggil fn setiap status masuk berubah. Mengembalikan fungsi berhenti. */
export function pantauSesi(fn) {
  pendengar.add(fn);
  if (penggunaKini !== undefined) fn(penggunaKini);
  mulai();
  return () => pendengar.delete(fn);
}
export const tungguSesi = () => (mulai(), sesiSiap);
export const pengguna = () => penggunaKini || null;
function wajibMasuk() {
  if (!penggunaKini) throw galat('BELUM_MASUK');
  return penggunaKini;
}
function wajibAdmin() {
  const p = wajibMasuk();
  if (!p.admin) throw galat('permission-denied');
  return p;
}

let sudahMulai = false;
function mulai() {
  if (sudahMulai) return;
  sudahMulai = true;
  if (MODE === 'firebase') fbMulai();
  else if (MODE === 'demo') demoMulai();
  else umumkan(null);
}

// ======================================================================
// MESIN FIREBASE
// ======================================================================
let fbJanji;
function fb() {
  fbJanji ??= (async () => {
    const akar = `https://www.gstatic.com/firebasejs/${VERSI_FB}`;
    const [app, A, F] = await Promise.all([import(`${akar}/firebase-app.js`), import(`${akar}/firebase-auth.js`), import(`${akar}/firebase-firestore.js`)]);
    const aplikasi = app.initializeApp(KONFIG.firebase);
    const auth = A.getAuth(aplikasi);
    auth.languageCode = 'id';
    const db = F.getFirestore(aplikasi);
    return { A, F, auth, db };
  })();
  return fbJanji;
}

const keMs = (v) => (v && typeof v.toMillis === 'function' ? v.toMillis() : v);
function rapikan(snap) {
  const o = { id: snap.id };
  for (const [k, v] of Object.entries(snap.data() || {})) o[k] = keMs(v);
  return o;
}

async function fbMulai() {
  const { A, auth } = await fb();
  A.onAuthStateChanged(auth, (u) => fbMuatProfil(u));
}

async function fbMuatProfil(u) {
  const { F, db } = await fb();
  {
    if (!u) return umumkan(null);
    try {
      const email = (u.email || '').toLowerCase();
      let admin = ADMIN_UTAMA.includes(email) && u.emailVerified;
      if (!admin) admin = (await F.getDoc(F.doc(db, 'admin', u.uid)).catch(() => null))?.exists() || false;
      const ref = F.doc(db, 'pengguna', u.uid);
      let profil = await F.getDoc(ref).catch(() => null);
      if (profil && !profil.exists() && !sedangDaftar) {
        await F.setDoc(ref, {
          nama: u.displayName || email.split('@')[0], email, wa: '', provinsi: '', kota: '',
          dibuat: F.serverTimestamp(), diubah: F.serverTimestamp(),
        }).catch(() => {});
        profil = await F.getDoc(ref).catch(() => null);
      }
      const data = profil?.exists() ? profil.data() : {};
      const diblokir = (await F.getDoc(F.doc(db, 'blokir', u.uid)).catch(() => null))?.exists() || false;
      umumkan({
        uid: u.uid, email, nama: data.nama || u.displayName || email, wa: data.wa || '', provinsi: data.provinsi || '', kota: data.kota || '',
        terverifikasi: u.emailVerified, penyedia: u.providerData[0]?.providerId || 'password', admin, diblokir,
      });
    } catch (e) {
      console.error(e);
      umumkan({ uid: u.uid, email: u.email, nama: u.displayName || u.email, terverifikasi: u.emailVerified, admin: false });
    }
  }
}

let sedangDaftar = false;

const fbMesin = {
  async masuk(email, sandi) {
    const { A, auth } = await fb();
    await A.signInWithEmailAndPassword(auth, email.trim(), sandi);
  },
  async daftar({ nama, email, sandi, wa, provinsi, kota }) {
    const { A, F, auth, db } = await fb();
    sedangDaftar = true;
    try {
      const { user } = await A.createUserWithEmailAndPassword(auth, email.trim(), sandi);
      await A.updateProfile(user, { displayName: nama });
      await F.setDoc(F.doc(db, 'pengguna', user.uid), {
        nama, email: email.trim().toLowerCase(), wa: wa || '', provinsi: provinsi || '', kota: kota || '',
        dibuat: F.serverTimestamp(), diubah: F.serverTimestamp(),
      });
      A.sendEmailVerification(user).catch(() => {});
    } finally {
      sedangDaftar = false;
    }
    await fbMuatProfil(auth.currentUser);
  },
  async masukGoogle() {
    const { A, auth } = await fb();
    const p = new A.GoogleAuthProvider();
    p.setCustomParameters({ prompt: 'select_account' });
    await A.signInWithPopup(auth, p);
  },
  async keluar() {
    const { A, auth } = await fb();
    await A.signOut(auth);
  },
  async lupaSandi(email) {
    const { A, auth } = await fb();
    await A.sendPasswordResetEmail(auth, email.trim(), { url: ASAL + 'masuk/' });
  },
  async kirimUlangVerifikasi() {
    const { A, auth } = await fb();
    if (auth.currentUser) await A.sendEmailVerification(auth.currentUser, { url: ASAL + 'akun/' });
  },
  async muatUlangSesi() {
    const { auth } = await fb();
    if (!auth.currentUser) return;
    await auth.currentUser.reload();
    await auth.currentUser.getIdToken(true);
    await fbMuatProfil(auth.currentUser);
  },
  async simpanProfil({ nama, wa, provinsi, kota }) {
    const p = wajibMasuk();
    const { A, F, auth, db } = await fb();
    await F.setDoc(F.doc(db, 'pengguna', p.uid), { nama, wa, provinsi, kota, diubah: F.serverTimestamp() }, { merge: true });
    if (auth.currentUser && nama !== auth.currentUser.displayName) await A.updateProfile(auth.currentUser, { displayName: nama });
    umumkan({ ...p, nama, wa, provinsi, kota });
  },

  // ---------- laporan (aduan & aspirasi) ----------
  async kirimLaporan(data, berkas = []) {
    const p = wajibMasuk();
    if (p.diblokir) throw galat('DIBLOKIR');
    const { F, db } = await fb();
    const ref = F.doc(F.collection(db, 'laporan'));
    const nomor = nomorTiket(data.jenis, ref.id);
    await F.setDoc(ref, {
      ...data, nomor, uid: p.uid,
      pelapor: { nama: p.nama, email: p.email, wa: data.wa || p.wa || '' },
      status: 'baru', jumlahLampiran: berkas.length,
      dibuat: F.serverTimestamp(), diubah: F.serverTimestamp(), balasanPelapor: null, dibacaAdmin: null,
    });
    let lampiranGagal = 0;
    for (const [i, b] of berkas.entries()) {
      try {
        await F.setDoc(F.doc(db, 'laporan', ref.id, 'lampiran', String(i)), { ...b, dibuat: F.serverTimestamp() });
      } catch (e) {
        console.error(e);
        lampiranGagal++;
      }
    }
    kabariPengurus({ ...data, id: ref.id, nomor });
    return { id: ref.id, nomor, lampiranGagal };
  },
  async laporanSaya() {
    const p = wajibMasuk();
    const { F, db } = await fb();
    const s = await F.getDocs(F.query(F.collection(db, 'laporan'), F.where('uid', '==', p.uid)));
    return s.docs.map(rapikan).sort((a, b) => (b.dibuat || 0) - (a.dibuat || 0));
  },
  async ambilLaporan(id) {
    wajibMasuk();
    const { F, db } = await fb();
    const s = await F.getDoc(F.doc(db, 'laporan', id));
    return s.exists() ? rapikan(s) : null;
  },
  async tanggapan(id) {
    const { F, db } = await fb();
    const s = await F.getDocs(F.query(F.collection(db, 'laporan', id, 'tanggapan'), F.orderBy('dibuat', 'asc')));
    return s.docs.map(rapikan);
  },
  async kirimTanggapan(id, pesan, { status } = {}) {
    const p = wajibMasuk();
    const { F, db } = await fb();
    const sebagaiAdmin = p.admin && status !== undefined ? true : p.admin && !(await this._milikSendiri(id));
    await F.addDoc(F.collection(db, 'laporan', id, 'tanggapan'), {
      oleh: sebagaiAdmin ? 'admin' : 'pelapor', uid: p.uid, nama: sebagaiAdmin ? `${p.nama} (Pengurus)` : p.nama,
      pesan, statusBaru: sebagaiAdmin && status ? status : null, dibuat: F.serverTimestamp(),
    });
    const ref = F.doc(db, 'laporan', id);
    if (sebagaiAdmin) {
      const patch = { diubah: F.serverTimestamp(), dibacaAdmin: F.serverTimestamp(), ditangani: p.nama };
      if (status) patch.status = status;
      await F.updateDoc(ref, patch);
    } else {
      await F.updateDoc(ref, { balasanPelapor: F.serverTimestamp() });
    }
  },
  async _milikSendiri(id) {
    const l = await this.ambilLaporan(id);
    return l?.uid === penggunaKini?.uid;
  },
  async lampiran(id) {
    const { F, db } = await fb();
    const s = await F.getDocs(F.collection(db, 'laporan', id, 'lampiran'));
    return s.docs.map(rapikan).sort((a, b) => Number(a.id) - Number(b.id));
  },

  // ---------- keanggotaan ----------
  async ajukanAnggota(data) {
    const p = wajibMasuk();
    if (p.diblokir) throw galat('DIBLOKIR');
    const { F, db } = await fb();
    const ref = F.doc(db, 'anggota', p.uid);
    const lama = await F.getDoc(ref);
    const isi = { ...data, uid: p.uid, email: p.email, status: 'menunggu', diubah: F.serverTimestamp() };
    if (lama.exists()) await F.updateDoc(ref, isi);
    else await F.setDoc(ref, { ...isi, nomorAnggota: '', catatanAdmin: '', dibuat: F.serverTimestamp() });
  },
  async keanggotaanSaya() {
    const p = wajibMasuk();
    const { F, db } = await fb();
    const s = await F.getDoc(F.doc(db, 'anggota', p.uid));
    return s.exists() ? rapikan(s) : null;
  },

  // ---------- panel pengurus ----------
  async semuaLaporan() {
    wajibAdmin();
    const { F, db } = await fb();
    const s = await F.getDocs(F.query(F.collection(db, 'laporan'), F.orderBy('dibuat', 'desc'), F.limit(2000)));
    return s.docs.map(rapikan);
  },
  async ubahLaporan(id, patch) {
    wajibAdmin();
    const { F, db } = await fb();
    const p = { ...patch, diubah: F.serverTimestamp() };
    if (patch.dibacaAdmin) p.dibacaAdmin = F.serverTimestamp();
    await F.updateDoc(F.doc(db, 'laporan', id), p);
  },
  async catatanInternal(id) {
    wajibAdmin();
    const { F, db } = await fb();
    const s = await F.getDocs(F.query(F.collection(db, 'laporan', id, 'internal'), F.orderBy('dibuat', 'asc')));
    return s.docs.map(rapikan);
  },
  async tambahCatatan(id, teks) {
    const p = wajibAdmin();
    const { F, db } = await fb();
    await F.addDoc(F.collection(db, 'laporan', id, 'internal'), { teks, oleh: p.nama, uid: p.uid, dibuat: F.serverTimestamp() });
  },
  async semuaAnggota() {
    wajibAdmin();
    const { F, db } = await fb();
    const s = await F.getDocs(F.query(F.collection(db, 'anggota'), F.orderBy('dibuat', 'desc')));
    return s.docs.map(rapikan);
  },
  async putuskanAnggota(uid, { status, catatanAdmin = '' }) {
    wajibAdmin();
    const { F, db } = await fb();
    const ref = F.doc(db, 'anggota', uid);
    const lama = rapikan(await F.getDoc(ref));
    const patch = { status, catatanAdmin, diubah: F.serverTimestamp(), diputuskan: F.serverTimestamp() };
    if (status === 'diterima' && !lama.nomorAnggota) {
      const hitung = await F.getCountFromServer(F.query(F.collection(db, 'anggota'), F.where('status', '==', 'diterima')));
      patch.nomorAnggota = nomorAnggota(hitung.data().count + 1);
    }
    await F.updateDoc(ref, patch);
    return patch.nomorAnggota || lama.nomorAnggota;
  },
  async semuaPengguna() {
    wajibAdmin();
    const { F, db } = await fb();
    const [pg, bl, ad] = await Promise.all([
      F.getDocs(F.query(F.collection(db, 'pengguna'), F.orderBy('dibuat', 'desc'), F.limit(2000))),
      F.getDocs(F.collection(db, 'blokir')),
      F.getDocs(F.collection(db, 'admin')),
    ]);
    const blokir = new Set(bl.docs.map((d) => d.id));
    const admin = new Set(ad.docs.map((d) => d.id));
    return pg.docs.map(rapikan).map((u) => ({ ...u, diblokir: blokir.has(u.id), admin: admin.has(u.id) || ADMIN_UTAMA.includes(u.email) }));
  },
  async aturBlokir(uid, blokir) {
    const p = wajibAdmin();
    const { F, db } = await fb();
    const ref = F.doc(db, 'blokir', uid);
    if (blokir) await F.setDoc(ref, { oleh: p.email, dibuat: F.serverTimestamp() });
    else await F.deleteDoc(ref);
  },
  async daftarAdmin() {
    wajibAdmin();
    const { F, db } = await fb();
    const s = await F.getDocs(F.collection(db, 'admin'));
    return s.docs.map(rapikan);
  },
  async tambahAdmin(email) {
    const p = wajibAdmin();
    const { F, db } = await fb();
    const s = await F.getDocs(F.query(F.collection(db, 'pengguna'), F.where('email', '==', email.trim().toLowerCase())));
    if (s.empty) throw galat('TIDAK_ADA', 'Belum ada akun dengan email itu. Minta yang bersangkutan mendaftar di situs dulu, lalu tambahkan lagi.');
    const u = s.docs[0];
    await F.setDoc(F.doc(db, 'admin', u.id), { email: u.data().email, nama: u.data().nama, oleh: p.email, ditambahkan: F.serverTimestamp() });
  },
  async hapusAdmin(uid) {
    wajibAdmin();
    const { F, db } = await fb();
    await F.deleteDoc(F.doc(db, 'admin', uid));
  },

  // ---------- kabar ----------
  async semuaKabarAdmin() {
    wajibAdmin();
    const { F, db } = await fb();
    const [terbit, draf] = await Promise.all([F.getDocs(F.collection(db, 'kabar')), F.getDocs(F.collection(db, 'draf'))]);
    return gabungKabar(terbit.docs.map(rapikan), draf.docs.map(rapikan));
  },
  async ambilKabarEdit(slug) {
    wajibAdmin();
    const { F, db } = await fb();
    const [d, k, i] = await Promise.all([F.getDoc(F.doc(db, 'draf', slug)), F.getDoc(F.doc(db, 'kabar', slug)), F.getDoc(F.doc(db, 'kabarIsi', slug))]);
    const terbit = k.exists();
    if (d.exists()) return { ...rapikan(d), slug, terbit };
    if (terbit) return { ...rapikan(k), ...(i.exists() ? rapikan(i) : {}), slug, terbit };
    return null;
  },
  async slugTerpakai(slug) {
    const { F, db } = await fb();
    const [a, b] = await Promise.all([F.getDoc(F.doc(db, 'kabar', slug)), F.getDoc(F.doc(db, 'draf', slug))]);
    return a.exists() || b.exists();
  },
  async simpanDraf(k) {
    wajibAdmin();
    const { F, db } = await fb();
    await F.setDoc(F.doc(db, 'draf', k.slug), { ...potongKabar(k), terbitPada: k.terbitPada ? F.Timestamp.fromMillis(k.terbitPada) : null, diubah: F.serverTimestamp() });
  },
  async terbitkan(k) {
    wajibAdmin();
    const { F, db } = await fb();
    const b = F.writeBatch(db);
    const m = potongKabar(k);
    b.set(F.doc(db, 'kabar', k.slug), {
      judul: m.judul, kategori: m.kategori, ringkasan: m.ringkasan, penulis: m.penulis, sampulKecil: m.sampulKecil, unggulan: m.unggulan,
      terbitPada: F.Timestamp.fromMillis(k.terbitPada || Date.now()), diubah: F.serverTimestamp(),
    });
    b.set(F.doc(db, 'kabarIsi', k.slug), { delta: m.delta, sampul: m.sampul, keteranganSampul: m.keteranganSampul, diubah: F.serverTimestamp() });
    b.delete(F.doc(db, 'draf', k.slug));
    await b.commit();
  },
  async tarikKabar(slug) {
    wajibAdmin();
    const k = await this.ambilKabarEdit(slug);
    const { F, db } = await fb();
    const b = F.writeBatch(db);
    b.set(F.doc(db, 'draf', slug), { ...potongKabar(k), terbitPada: k.terbitPada ? F.Timestamp.fromMillis(k.terbitPada) : null, diubah: F.serverTimestamp() });
    b.delete(F.doc(db, 'kabar', slug));
    b.delete(F.doc(db, 'kabarIsi', slug));
    await b.commit();
  },
  async hapusKabar(slug) {
    wajibAdmin();
    const { F, db } = await fb();
    const b = F.writeBatch(db);
    ['kabar', 'kabarIsi', 'draf'].forEach((c) => b.delete(F.doc(db, c, slug)));
    await b.commit();
  },
};

// Pemberitahuan surel untuk pengurus lewat FormSubmit (gratis, tanpa server).
// Hanya nomor & kategori yang dikirim — isi aduan tetap di Firestore.
function kabariPengurus(lap) {
  const tujuan = KONFIG.notifikasi?.emailAduanBaru;
  if (!tujuan || MODE !== 'firebase' || ['localhost', '127.0.0.1'].includes(location.hostname)) return;
  const jenis = lap.jenis === 'aspirasi' ? 'Aspirasi' : 'Aduan';
  fetch(`https://formsubmit.co/ajax/${encodeURIComponent(tujuan)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      _subject: `[Persadha Nusantara] ${jenis} baru ${lap.nomor}${lap.mendesak ? ' — MENDESAK' : ''}`,
      _template: 'table',
      _captcha: 'false',
      Nomor: lap.nomor,
      Jenis: jenis,
      Kategori: lap.jenis === 'aspirasi' ? namaBidang(lap.bidang) : namaKategori(lap.kategori),
      Provinsi: lap.lokasi?.provinsi || lap.provinsi || '-',
      Mendesak: lap.mendesak ? 'Ya' : 'Tidak',
      'Buka di panel': `${ASAL}admin/#laporan/${lap.id}`,
    }),
  }).catch(() => {});
}

// ======================================================================
// MESIN DEMO
// ======================================================================
let D; // modul demo.js
async function demo() {
  D ??= await import('./demo.js');
  return D;
}

async function demoMulai() {
  const d = await demo();
  const s = d.bacaDemo();
  umumkan(s.sesi ? profilDemo(s, s.sesi) : null);
}
function profilDemo(s, uid) {
  const u = s.pengguna[uid];
  if (!u) return null;
  return {
    uid, email: u.email, nama: u.nama, wa: u.wa || '', provinsi: u.provinsi || '', kota: u.kota || '',
    terverifikasi: true, penyedia: u.penyedia || 'password',
    admin: ADMIN_UTAMA.includes(u.email) || Boolean(s.admin[uid]), diblokir: Boolean(s.blokir[uid]),
  };
}
function segarkanSesi() {
  const s = D.bacaDemo();
  umumkan(s.sesi ? profilDemo(s, s.sesi) : null);
}

const demoMesin = {
  async masuk(email, sandi) {
    const d = await demo();
    await d.tunda();
    const e = email.trim().toLowerCase();
    const s = d.bacaDemo();
    const akun = s.akun[e];
    if (!akun || akun.sandi !== sandi) throw galat('auth/invalid-credential');
    d.ubahDemo((s) => (s.sesi = akun.uid));
    segarkanSesi();
  },
  async daftar({ nama, email, sandi, wa, provinsi, kota }) {
    const d = await demo();
    await d.tunda();
    const e = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(e)) throw galat('auth/invalid-email');
    if ((sandi || '').length < 8) throw galat('auth/weak-password');
    if (d.bacaDemo().akun[e]) throw galat('auth/email-already-in-use');
    const uid = d.idAcak(16);
    d.ubahDemo((s) => {
      s.akun[e] = { uid, sandi };
      s.pengguna[uid] = { nama, email: e, wa: wa || '', provinsi: provinsi || '', kota: kota || '', dibuat: Date.now(), diubah: Date.now() };
      s.sesi = uid;
    });
    segarkanSesi();
  },
  async masukGoogle() {
    const d = await demo();
    await d.tunda();
    const e = 'pengguna.google@contoh.id';
    d.ubahDemo((s) => {
      if (!s.akun[e]) {
        const uid = d.idAcak(16);
        s.akun[e] = { uid, sandi: d.idAcak(12) };
        s.pengguna[uid] = { nama: 'Pengguna Google (demo)', email: e, wa: '', provinsi: '', kota: '', penyedia: 'google.com', dibuat: Date.now(), diubah: Date.now() };
      }
      s.sesi = s.akun[e].uid;
    });
    segarkanSesi();
  },
  /** Khusus demo: masuk sebagai pengurus untuk mencoba panel. */
  async masukPengurusDemo() {
    const d = await demo();
    const e = ADMIN_UTAMA[0] || 'pengurus@contoh.id';
    d.ubahDemo((s) => {
      if (!s.akun[e]) {
        const uid = d.idAcak(16);
        s.akun[e] = { uid, sandi: d.idAcak(12) };
        s.pengguna[uid] = { nama: 'Sekretariat DPP', email: e, wa: KONFIG.kontak?.telepon || '', provinsi: 'DKI Jakarta', kota: 'Jakarta Selatan', dibuat: Date.now(), diubah: Date.now() };
      }
      s.admin[s.akun[e].uid] = { email: e, nama: 'Sekretariat DPP', ditambahkan: Date.now() };
      s.sesi = s.akun[e].uid;
    });
    segarkanSesi();
  },
  async keluar() {
    const d = await demo();
    d.ubahDemo((s) => (s.sesi = null));
    segarkanSesi();
  },
  async lupaSandi(email) {
    const d = await demo();
    await d.tunda();
    if (!d.bacaDemo().akun[email.trim().toLowerCase()]) throw galat('auth/user-not-found');
  },
  async kirimUlangVerifikasi() {},
  async muatUlangSesi() {
    await demo();
    segarkanSesi();
  },
  async simpanProfil({ nama, wa, provinsi, kota }) {
    const p = wajibMasuk();
    const d = await demo();
    d.ubahDemo((s) => Object.assign(s.pengguna[p.uid], { nama, wa, provinsi, kota, diubah: Date.now() }));
    segarkanSesi();
  },

  async kirimLaporan(data, berkas = []) {
    const p = wajibMasuk();
    if (p.diblokir) throw galat('DIBLOKIR');
    const d = await demo();
    await d.tunda(400);
    const id = d.idAcak(20);
    const nomor = nomorTiket(data.jenis, id);
    d.ubahDemo((s) => {
      s.laporan[id] = {
        ...data, nomor, uid: p.uid, pelapor: { nama: p.nama, email: p.email, wa: data.wa || p.wa || '' },
        status: 'baru', jumlahLampiran: berkas.length, dibuat: Date.now(), diubah: Date.now(), balasanPelapor: null, dibacaAdmin: null,
      };
      s.lampiran[id] = berkas.map((b, i) => ({ id: String(i), ...b, dibuat: Date.now() }));
    });
    return { id, nomor, lampiranGagal: 0 };
  },
  async laporanSaya() {
    const p = wajibMasuk();
    const d = await demo();
    await d.tunda(150);
    return Object.entries(d.bacaDemo().laporan).filter(([, l]) => l.uid === p.uid).map(([id, l]) => ({ id, ...l })).sort((a, b) => b.dibuat - a.dibuat);
  },
  async ambilLaporan(id) {
    const p = wajibMasuk();
    const d = await demo();
    const l = d.bacaDemo().laporan[id];
    if (!l || (l.uid !== p.uid && !p.admin)) return null;
    return { id, ...l };
  },
  async tanggapan(id) {
    const d = await demo();
    return (d.bacaDemo().tanggapan[id] || []).slice();
  },
  async kirimTanggapan(id, pesan, { status } = {}) {
    const p = wajibMasuk();
    const d = await demo();
    await d.tunda(200);
    const l = d.bacaDemo().laporan[id];
    const sebagaiAdmin = p.admin && (status !== undefined || l.uid !== p.uid);
    d.ubahDemo((s) => {
      (s.tanggapan[id] ||= []).push({
        id: d.idAcak(10), oleh: sebagaiAdmin ? 'admin' : 'pelapor', uid: p.uid, nama: sebagaiAdmin ? `${p.nama} (Pengurus)` : p.nama,
        pesan, statusBaru: sebagaiAdmin && status ? status : null, dibuat: Date.now(),
      });
      const lp = s.laporan[id];
      if (sebagaiAdmin) Object.assign(lp, { diubah: Date.now(), dibacaAdmin: Date.now(), ditangani: p.nama }, status ? { status } : {});
      else lp.balasanPelapor = Date.now();
    });
  },
  async lampiran(id) {
    const d = await demo();
    return (d.bacaDemo().lampiran[id] || []).slice();
  },

  async ajukanAnggota(data) {
    const p = wajibMasuk();
    if (p.diblokir) throw galat('DIBLOKIR');
    const d = await demo();
    await d.tunda(300);
    d.ubahDemo((s) => {
      const lama = s.anggota[p.uid];
      s.anggota[p.uid] = { nomorAnggota: '', catatanAdmin: '', dibuat: Date.now(), ...lama, ...data, uid: p.uid, email: p.email, status: 'menunggu', diubah: Date.now() };
    });
  },
  async keanggotaanSaya() {
    const p = wajibMasuk();
    const d = await demo();
    const a = d.bacaDemo().anggota[p.uid];
    return a ? { id: p.uid, ...a } : null;
  },

  async semuaLaporan() {
    wajibAdmin();
    const d = await demo();
    await d.tunda(150);
    return Object.entries(d.bacaDemo().laporan).map(([id, l]) => ({ id, ...l })).sort((a, b) => b.dibuat - a.dibuat);
  },
  async ubahLaporan(id, patch) {
    wajibAdmin();
    const d = await demo();
    d.ubahDemo((s) => Object.assign(s.laporan[id], patch, { diubah: Date.now() }, patch.dibacaAdmin ? { dibacaAdmin: Date.now() } : {}));
  },
  async catatanInternal(id) {
    wajibAdmin();
    const d = await demo();
    return (d.bacaDemo().internal[id] || []).slice();
  },
  async tambahCatatan(id, teks) {
    const p = wajibAdmin();
    const d = await demo();
    d.ubahDemo((s) => (s.internal[id] ||= []).push({ id: d.idAcak(10), teks, oleh: p.nama, uid: p.uid, dibuat: Date.now() }));
  },
  async semuaAnggota() {
    wajibAdmin();
    const d = await demo();
    return Object.entries(d.bacaDemo().anggota).map(([id, a]) => ({ id, ...a })).sort((a, b) => b.dibuat - a.dibuat);
  },
  async putuskanAnggota(uid, { status, catatanAdmin = '' }) {
    wajibAdmin();
    const d = await demo();
    return d.ubahDemo((s) => {
      const a = s.anggota[uid];
      Object.assign(a, { status, catatanAdmin, diubah: Date.now(), diputuskan: Date.now() });
      if (status === 'diterima' && !a.nomorAnggota) a.nomorAnggota = nomorAnggota(Object.values(s.anggota).filter((x) => x.status === 'diterima').length);
      return a.nomorAnggota;
    });
  },
  async semuaPengguna() {
    wajibAdmin();
    const d = await demo();
    const s = d.bacaDemo();
    return Object.entries(s.pengguna)
      .map(([id, u]) => ({ id, ...u, diblokir: Boolean(s.blokir[id]), admin: Boolean(s.admin[id]) || ADMIN_UTAMA.includes(u.email) }))
      .sort((a, b) => b.dibuat - a.dibuat);
  },
  async aturBlokir(uid, blokir) {
    const p = wajibAdmin();
    const d = await demo();
    d.ubahDemo((s) => { if (blokir) s.blokir[uid] = { oleh: p.email, dibuat: Date.now() }; else delete s.blokir[uid]; });
  },
  async daftarAdmin() {
    wajibAdmin();
    const d = await demo();
    return Object.entries(d.bacaDemo().admin).map(([id, a]) => ({ id, ...a }));
  },
  async tambahAdmin(email) {
    const p = wajibAdmin();
    const d = await demo();
    const e = email.trim().toLowerCase();
    const s = d.bacaDemo();
    const uid = s.akun[e]?.uid;
    if (!uid) throw galat('TIDAK_ADA', 'Belum ada akun dengan email itu. Minta yang bersangkutan mendaftar di situs dulu, lalu tambahkan lagi.');
    d.ubahDemo((s) => (s.admin[uid] = { email: e, nama: s.pengguna[uid].nama, oleh: p.email, ditambahkan: Date.now() }));
  },
  async hapusAdmin(uid) {
    wajibAdmin();
    const d = await demo();
    d.ubahDemo((s) => delete s.admin[uid]);
  },

  async semuaKabarAdmin() {
    wajibAdmin();
    const d = await demo();
    const s = d.bacaDemo();
    return gabungKabar(
      Object.entries(s.kabar).map(([id, k]) => ({ id, ...k })),
      Object.entries(s.draf).map(([id, k]) => ({ id, ...k })),
    );
  },
  async ambilKabarEdit(slug) {
    wajibAdmin();
    const d = await demo();
    const s = d.bacaDemo();
    const terbit = Boolean(s.kabar[slug]);
    if (s.draf[slug]) return { ...s.draf[slug], slug, terbit };
    if (terbit) return { ...s.kabar[slug], ...s.kabarIsi[slug], slug, terbit };
    return null;
  },
  async slugTerpakai(slug) {
    const d = await demo();
    const s = d.bacaDemo();
    return Boolean(s.kabar[slug] || s.draf[slug]);
  },
  async simpanDraf(k) {
    wajibAdmin();
    const d = await demo();
    d.ubahDemo((s) => (s.draf[k.slug] = { ...potongKabar(k), terbitPada: k.terbitPada || null, diubah: Date.now() }));
  },
  async terbitkan(k) {
    wajibAdmin();
    const d = await demo();
    const m = potongKabar(k);
    d.ubahDemo((s) => {
      s.kabar[k.slug] = { slug: k.slug, judul: m.judul, kategori: m.kategori, ringkasan: m.ringkasan, penulis: m.penulis, sampulKecil: m.sampulKecil, unggulan: m.unggulan, terbitPada: k.terbitPada || Date.now(), diubah: Date.now() };
      s.kabarIsi[k.slug] = { delta: m.delta, sampul: m.sampul, keteranganSampul: m.keteranganSampul, diubah: Date.now() };
      delete s.draf[k.slug];
    });
  },
  async tarikKabar(slug) {
    wajibAdmin();
    const k = await this.ambilKabarEdit(slug);
    D.ubahDemo((s) => {
      s.draf[slug] = { ...potongKabar(k), terbitPada: k.terbitPada || null, diubah: Date.now() };
      delete s.kabar[slug];
      delete s.kabarIsi[slug];
    });
  },
  async hapusKabar(slug) {
    wajibAdmin();
    const d = await demo();
    d.ubahDemo((s) => { delete s.kabar[slug]; delete s.kabarIsi[slug]; delete s.draf[slug]; });
  },
};

// ======================================================================
// bersama
// ======================================================================
function potongKabar(k) {
  return {
    slug: k.slug, judul: k.judul || '', kategori: k.kategori || 'Kegiatan', ringkasan: k.ringkasan || '', penulis: k.penulis || '',
    unggulan: Boolean(k.unggulan), sampul: k.sampul || '', sampulKecil: k.sampulKecil || '', keteranganSampul: k.keteranganSampul || '',
    delta: typeof k.delta === 'string' ? k.delta : JSON.stringify(k.delta || []),
  };
}
function gabungKabar(terbit, draf) {
  const peta = new Map();
  for (const k of terbit) peta.set(k.id, { ...k, slug: k.id, terbit: true, adaDraf: false });
  for (const k of draf) {
    const ada = peta.get(k.id);
    if (ada) ada.adaDraf = true;
    else peta.set(k.id, { ...k, slug: k.id, terbit: false, adaDraf: true });
  }
  return [...peta.values()].sort((a, b) => (b.diubah || 0) - (a.diubah || 0));
}
export function nomorAnggota(urut) {
  return `PN-${new Date().getFullYear()}-${String(urut).padStart(5, '0')}`;
}

const MATI = new Proxy({}, { get: () => async () => { throw galat('LAYANAN_MATI'); } });
const mesin = MODE === 'firebase' ? fbMesin : MODE === 'demo' ? demoMesin : MATI;

export const L = new Proxy(mesin, {
  get(target, nama) {
    const fn = target[nama];
    if (typeof fn !== 'function') return fn;
    return async (...arg) => {
      mulai();
      if (nama !== 'masuk' && nama !== 'daftar' && nama !== 'masukGoogle' && nama !== 'lupaSandi' && nama !== 'masukPengurusDemo') await sesiSiap;
      return fn.apply(target, arg);
    };
  },
});
