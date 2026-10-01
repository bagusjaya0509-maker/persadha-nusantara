// Formulir aduan & aspirasi (satu skrip, dibedakan atribut data-lapor).
import { $, $$, BASE, esc, ikon, roti, denganMemuat, pesanGalat, lokalBaca, lokalSimpan } from './inti.js';
import { L } from './layanan.js';
import { jagaAkun } from './gerbang.js';
import { PROVINSI, KATEGORI_ADUAN, BANTUAN, BIDANG } from './rujukan.js';
import { kompres, bacaDataUrl, ukuranDataUrl, formatUkuran } from './gambar.js';

const f = $('[data-lapor]');
const jenis = f.dataset.lapor; // 'aduan' | 'aspirasi'
const KUNCI_DRAF = `pn.draf.${jenis}`;
const MAKS_BERKAS = 4;
let berkas = [];

// ---------- isi pilihan ----------
$$('[data-provinsi]', f).forEach((s) => s.insertAdjacentHTML('beforeend', PROVINSI.map((p) => `<option>${p}</option>`).join('')));
$('[data-kategori]', f)?.insertAdjacentHTML(
  'beforeend',
  KATEGORI_ADUAN.map((k) => `<label class="pilihan"><input type="radio" name="kategori" value="${k.kunci}" required><span><b>${esc(k.nama)}</b><small>${esc(k.contoh)}</small></span></label>`).join(''),
);
$('[data-bantuan]', f)?.insertAdjacentHTML(
  'beforeend',
  BANTUAN.map((b) => `<label class="pilihan"><input type="checkbox" name="bantuan" value="${b.kunci}"><span><b>${esc(b.nama)}</b></span></label>`).join(''),
);
$('[data-bidang]', f)?.insertAdjacentHTML('beforeend', [...BIDANG, { kunci: 'umum', nama: 'Umum / lebih dari satu bidang' }].map((b) => `<option value="${b.kunci}">${esc(b.nama)}</option>`).join(''));

// ---------- penghitung karakter ----------
$$('[data-hitung]', f).forEach((p) => {
  const el = f.elements[p.dataset.hitung];
  const maks = el.maxLength;
  const segar = () => (p.textContent = `${el.value.length.toLocaleString('id-ID')} / ${maks.toLocaleString('id-ID')}`);
  el.addEventListener('input', segar);
  segar();
});

// ---------- draf otomatis di perangkat ----------
const MEDAN_DRAF = ['kategori', 'judul', 'uraian', 'tanggalKejadian', 'pihak', 'provinsi', 'kota', 'alamat', 'wa', 'bidang'];
function simpanDraf() {
  const d = {};
  for (const n of MEDAN_DRAF) {
    const el = f.elements[n];
    if (!el) continue;
    d[n] = el instanceof RadioNodeList ? el.value : el.value;
  }
  d.mendesak = f.elements.mendesak?.checked || false;
  d.bantuan = $$('input[name=bantuan]:checked', f).map((i) => i.value);
  d.waktu = Date.now();
  lokalSimpan(KUNCI_DRAF, d);
  const j = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  $('[data-draf]', f).textContent = `Draf tersimpan di perangkat ini pukul ${j}`;
}
function pulihkanDraf() {
  const d = lokalBaca(KUNCI_DRAF);
  if (!d) return;
  for (const n of MEDAN_DRAF) {
    const el = f.elements[n];
    if (el && d[n]) el.value = d[n];
  }
  if (f.elements.mendesak) f.elements.mendesak.checked = Boolean(d.mendesak);
  (d.bantuan || []).forEach((v) => { const i = $(`input[name=bantuan][value="${v}"]`, f); if (i) i.checked = true; });
  $$('[data-hitung]', f).forEach((p) => f.elements[p.dataset.hitung].dispatchEvent(new Event('input')));
  $('[data-draf]', f).textContent = 'Draf terakhir dipulihkan dari perangkat ini.';
}
let tundaDraf;
f.addEventListener('input', () => {
  clearTimeout(tundaDraf);
  tundaDraf = setTimeout(simpanDraf, 700);
});

// ---------- lampiran ----------
const daftarBerkas = $('[data-daftar-berkas]', f);
function tampilBerkas() {
  if (!daftarBerkas) return;
  daftarBerkas.innerHTML = berkas
    .map((b, i) => `<li>${b.tipe.startsWith('image/') ? `<img src="${b.data}" alt="">` : `<span class="berkas-ikon">${ikon('file-text')}</span>`}<span class="berkas-nama">${esc(b.nama)}</span><small>${formatUkuran(b.ukuran)}</small><button type="button" data-hapus="${i}" aria-label="Hapus ${esc(b.nama)}">${ikon('x')}</button></li>`)
    .join('');
}
async function tambahBerkas(daftar) {
  for (const file of daftar) {
    if (berkas.length >= MAKS_BERKAS) { roti(`Maksimal ${MAKS_BERKAS} berkas.`, 'galat'); break; }
    try {
      if (file.type.startsWith('image/')) {
        const data = await kompres(file, { maks: 1600, mutu: 0.75 });
        berkas.push({ nama: file.name.slice(0, 120), tipe: 'image/jpeg', ukuran: ukuranDataUrl(data), data });
      } else if (file.type === 'application/pdf') {
        if (file.size > 700_000) { roti(`${file.name} lebih dari 700 KB. Perkecil PDF-nya atau kirim sebagai foto.`, 'galat'); continue; }
        const data = await bacaDataUrl(file);
        berkas.push({ nama: file.name.slice(0, 120), tipe: 'application/pdf', ukuran: file.size, data });
      } else {
        roti(`${file.name}: hanya foto dan PDF yang diterima.`, 'galat');
      }
    } catch (e) {
      console.error(e);
      roti(`${file.name} tidak bisa dibaca.`, 'galat');
    }
  }
  tampilBerkas();
}
const unggah = $('[data-unggah]', f);
if (unggah) {
  const input = $('[data-berkas]', unggah);
  input.addEventListener('change', () => { tambahBerkas([...input.files]); input.value = ''; });
  ['dragenter', 'dragover'].forEach((t) => unggah.addEventListener(t, (e) => { e.preventDefault(); unggah.classList.add('seret'); }));
  ['dragleave', 'drop'].forEach((t) => unggah.addEventListener(t, (e) => { e.preventDefault(); unggah.classList.remove('seret'); }));
  unggah.addEventListener('drop', (e) => tambahBerkas([...e.dataTransfer.files]));
  daftarBerkas.addEventListener('click', (e) => {
    const b = e.target.closest('[data-hapus]');
    if (!b) return;
    berkas.splice(Number(b.dataset.hapus), 1);
    tampilBerkas();
  });
}

// ---------- validasi & kirim ----------
function tandai(el, salah) {
  const sasaran = el instanceof RadioNodeList ? el[0]?.closest('[role=radiogroup]') : el;
  sasaran?.setAttribute('aria-invalid', String(salah));
}
function periksa() {
  const E = f.elements;
  const masalah = [];
  const cek = (el, syarat, pesan) => { const ok = syarat; tandai(el, !ok); if (!ok) masalah.push({ el, pesan }); };
  if (jenis === 'aduan') cek(E.kategori, E.kategori.value, 'Pilih jenis persoalan.');
  if (jenis === 'aspirasi') cek(E.bidang, E.bidang.value, 'Pilih bidang yang dituju.');
  cek(E.judul, E.judul.value.trim().length >= 10, 'Ringkasan minimal 10 karakter.');
  cek(E.uraian, E.uraian.value.trim().length >= (jenis === 'aduan' ? 50 : 30), jenis === 'aduan' ? 'Kronologi minimal 50 karakter supaya pengurus memahami kejadiannya.' : 'Uraian minimal 30 karakter.');
  if (jenis === 'aduan') {
    cek(E.provinsi, E.provinsi.value, 'Pilih provinsi.');
    cek(E.kota, E.kota.value.trim(), 'Isi kabupaten/kota.');
  }
  const wa = E.wa.value.replace(/[\s-]/g, '');
  cek(E.wa, !wa || /^(\+?62|0)8\d{7,12}$/.test(wa), 'Nomor WhatsApp diawali 08 atau +628.');
  cek(E.setuju, E.setuju.checked, 'Centang pernyataan persetujuan.');
  return masalah;
}

function tampilHasil({ id, nomor, lampiranGagal }) {
  const hasil = $('[data-hasil]');
  const kata = jenis === 'aduan' ? 'aduan' : 'aspirasi';
  hasil.innerHTML = `
    <div class="kartu hasil-kirim">
      <span class="hasil-ikon">${ikon('circle-check')}</span>
      <p class="label">${jenis === 'aduan' ? 'Aduan terkirim' : 'Aspirasi terkirim'}</p>
      <h2>Simpan nomor ${kata} Anda</h2>
      <p class="nomor-tiket kode">${esc(nomor)}</p>
      <p>Pengurus akan meninjau ${kata} ini. Perubahan status dan balasan pengurus muncul di akun Anda${jenis === 'aduan' ? '; bila perlu, pengurus juga menghubungi nomor WhatsApp yang Anda cantumkan' : ''}.</p>
      ${lampiranGagal ? `<div class="pesan pesan-peringatan">${ikon('triangle-alert')}<p>${lampiranGagal} lampiran gagal terunggah. Kirim ulang lewat kolom balasan di akun Anda.</p></div>` : ''}
      <div class="aksi-formulir">
        <a class="tombol tombol-utama" href="${BASE}akun/#laporan/${esc(id)}">Lihat di akun saya</a>
        <button class="tombol tombol-garis" type="button" data-salin-nomor>${ikon('copy')}Salin nomor</button>
        <a class="tombol-teks" href="${location.pathname}">Kirim ${kata} lain</a>
      </div>
    </div>`;
  hasil.hidden = false;
  f.hidden = true;
  $('[data-salin-nomor]').addEventListener('click', () => navigator.clipboard?.writeText(nomor).then(() => roti('Nomor disalin.', 'berhasil')));
  hasil.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

f.addEventListener('submit', (e) => {
  e.preventDefault();
  const galat = $('[data-galat]', f);
  const masalah = periksa();
  if (masalah.length) {
    galat.textContent = masalah.map((m) => m.pesan).join(' ');
    galat.hidden = false;
    const el = masalah[0].el;
    (el instanceof RadioNodeList ? el[0] : el)?.focus();
    return;
  }
  galat.hidden = true;
  const E = f.elements;
  const data = {
    jenis,
    kategori: jenis === 'aduan' ? E.kategori.value : '',
    bidang: jenis === 'aspirasi' ? E.bidang.value : '',
    judul: E.judul.value.trim(),
    uraian: E.uraian.value.trim(),
    tanggalKejadian: E.tanggalKejadian?.value || '',
    pihak: E.pihak?.value.trim() || '',
    mendesak: Boolean(E.mendesak?.checked),
    lokasi: { provinsi: E.provinsi.value || '', kota: E.kota?.value.trim() || '', alamat: E.alamat?.value.trim() || '' },
    bantuan: $$('input[name=bantuan]:checked', f).map((i) => i.value),
    wa: E.wa.value.replace(/[\s-]/g, ''),
    rahasia: E.rahasia ? E.rahasia.checked : true,
  };
  denganMemuat($('[type=submit]', f), async () => {
    try {
      const hasil = await L.kirimLaporan(data, berkas);
      lokalSimpan(KUNCI_DRAF, null);
      berkas = [];
      tampilHasil(hasil);
    } catch (err) {
      console.error(err);
      galat.textContent = pesanGalat(err);
      galat.hidden = false;
    }
  });
});

let sudahPulih = false;
jagaAkun({
  wadah: f,
  pesan: $('[data-pesan-gerbang]'),
  keperluan: jenis === 'aduan' ? 'mengirim aduan' : 'mengirim aspirasi',
  saatMasuk(p) {
    if (!sudahPulih) { pulihkanDraf(); sudahPulih = true; }
    if (!f.elements.wa.value && p.wa) f.elements.wa.value = p.wa;
    if (!f.elements.provinsi.value && p.provinsi) f.elements.provinsi.value = p.provinsi;
    if (f.elements.kota && !f.elements.kota.value && p.kota) f.elements.kota.value = p.kota;
  },
});
