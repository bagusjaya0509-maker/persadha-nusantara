import { $, $$, BASE, MODE, esc, ikon, roti, denganMemuat, pesanGalat, tanggalPendek, waktuLalu, inisial } from './inti.js';
import { L } from './layanan.js';
import { jagaAkun } from './gerbang.js';
import { PROVINSI, STATUS_ANGGOTA, namaKategori, namaBidang } from './rujukan.js';
import { pilStatus, langkahStatus, rincianLaporan, liniTanggapan, lampiranHtml, bukaDataUrl } from './laporan-tampil.js';
import { kartuAnggota } from './kartu-anggota.js';

const panel = { laporan: $('[data-panel="laporan"]'), anggota: $('[data-panel="anggota"]'), profil: $('[data-panel="profil"]') };
const fProfil = $('[data-form-profil]');
$('[data-provinsi]', fProfil).insertAdjacentHTML('beforeend', PROVINSI.map((p) => `<option>${p}</option>`).join(''));

let pengguna = null;
let laporan = [];

// ---------- kepala & verifikasi ----------
function kepala(p) {
  $('[data-akun-kepala]').innerHTML = `
    <div class="akun-identitas"><span class="inisial-besar" aria-hidden="true">${esc(inisial(p.nama))}</span><div><h1>${esc(p.nama)}</h1><p>${esc(p.email)}</p></div></div>
    <div class="aksi-formulir">
      ${p.admin ? `<a class="tombol tombol-emas" href="${BASE}admin/">${ikon('layout-dashboard')}Panel pengurus</a>` : ''}
      <a class="tombol tombol-terang" href="${BASE}layanan/aduan/">${ikon('plus')}Aduan baru</a>
    </div>`;
  const v = $('[data-verifikasi]');
  if (MODE === 'firebase' && !p.terverifikasi && p.penyedia === 'password') {
    v.innerHTML = `<div class="pesan pesan-peringatan" style="margin-bottom:24px">${ikon('mail')}<div><p><b>Email belum diverifikasi.</b> Kami mengirim tautan verifikasi ke ${esc(p.email)}. Verifikasi membantu pengurus memastikan aduan berasal dari pemilik email.</p><p style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="tombol tombol-garis kecil" type="button" data-kirim-verif>Kirim ulang tautan</button><button class="tombol tombol-garis kecil" type="button" data-cek-verif>Saya sudah verifikasi</button></p></div></div>`;
    $('[data-kirim-verif]', v).addEventListener('click', (e) => denganMemuat(e.currentTarget, async () => {
      try { await L.kirimUlangVerifikasi(); roti('Tautan verifikasi dikirim ulang.', 'berhasil'); } catch (err) { roti(pesanGalat(err), 'galat'); }
    }));
    $('[data-cek-verif]', v).addEventListener('click', (e) => denganMemuat(e.currentTarget, () => L.muatUlangSesi()));
  } else v.innerHTML = '';
}

// ---------- tab & rute hash ----------
function pilihTab(nama) {
  $$('[data-tab]').forEach((t) => t.setAttribute('aria-selected', String(t.dataset.tab === nama)));
  Object.entries(panel).forEach(([k, el]) => (el.hidden = k !== nama));
}
$$('[data-tab]').forEach((t) => t.addEventListener('click', () => (location.hash = t.dataset.tab)));

async function rute() {
  if (!pengguna) return;
  const [bagian, id] = location.hash.slice(1).split('/');
  if (bagian === 'anggota') { pilihTab('anggota'); return tampilAnggota(); }
  if (bagian === 'profil') { pilihTab('profil'); return isiProfil(); }
  pilihTab('laporan');
  if (bagian === 'laporan' && id) return tampilDetail(id);
  return tampilDaftar();
}
addEventListener('hashchange', rute);

// ---------- laporan ----------
async function muatLaporan() {
  laporan = await L.laporanSaya();
  $('[data-hitung-laporan]').textContent = laporan.length;
}

async function tampilDaftar() {
  panel.laporan.innerHTML = `<div class="kerangka" style="height:96px"></div><div class="kerangka" style="height:96px;margin-top:12px"></div>`;
  try {
    await muatLaporan();
  } catch (e) {
    panel.laporan.innerHTML = `<div class="pesan pesan-galat">${ikon('triangle-alert')}<p>${esc(pesanGalat(e))}</p></div>`;
    return;
  }
  if (!laporan.length) {
    panel.laporan.innerHTML = `<div class="kosong"><h3>Belum ada aduan atau aspirasi</h3><p>Aduan dan aspirasi yang Anda kirim akan tercatat di sini lengkap dengan statusnya.</p><p class="pintu-aksi" style="margin-top:20px"><a class="tombol tombol-utama" href="${BASE}layanan/aduan/">Buat aduan</a><a class="tombol tombol-garis" href="${BASE}layanan/aspirasi/">Kirim aspirasi</a></p></div>`;
    return;
  }
  panel.laporan.innerHTML = `<ul class="daftar-laporan">${laporan
    .map((l) => {
      // pengurus bertindak sesudah pesan terakhir pelapor
      const balasanBaru = l.ditangani && (!l.balasanPelapor || (l.dibacaAdmin || 0) > l.balasanPelapor);
      return `<li><a class="butir-laporan" href="#laporan/${esc(l.id)}">
        <div><span class="kode">${esc(l.nomor)} · ${l.jenis === 'aduan' ? esc(namaKategori(l.kategori)) : esc(namaBidang(l.bidang))}</span><h3>${esc(l.judul)}</h3><span class="meta-kecil">Dikirim ${esc(tanggalPendek(l.dibuat))} · diperbarui ${esc(waktuLalu(l.diubah))}</span></div>
        <div style="display:grid;gap:6px;justify-items:end;align-content:start">${pilStatus(l.status)}${l.mendesak ? '<span class="status" data-status="mendesak">Mendesak</span>' : ''}${balasanBaru && l.status !== 'baru' ? '<span class="ada-balasan">Ada tanggapan pengurus</span>' : ''}</div>
      </a></li>`;
    })
    .join('')}</ul>`;
}

async function tampilDetail(id) {
  panel.laporan.innerHTML = `<div class="kerangka" style="height:240px"></div>`;
  try {
    const [l, tg] = await Promise.all([L.ambilLaporan(id), L.tanggapan(id)]);
    if (!l) {
      panel.laporan.innerHTML = `<div class="kosong"><h3>Laporan tidak ditemukan</h3><p>Mungkin tautannya keliru. <a href="#laporan">Kembali ke daftar laporan</a>.</p></div>`;
      return;
    }
    const bisaBalas = !['selesai', 'ditutup'].includes(l.status);
    panel.laporan.innerHTML = `
      <p><a class="tombol-teks" href="#laporan">${ikon('arrow-left')}Semua laporan</a></p>
      <div class="detail-laporan">
        <div>
          <div class="detail-kepala"><span class="kode">${esc(l.nomor)}</span>${pilStatus(l.status)}${l.mendesak ? '<span class="status" data-status="mendesak">Mendesak</span>' : ''}</div>
          <h2 class="detail-judul">${esc(l.judul)}</h2>
          ${langkahStatus(l.status)}
          <h3 class="sub-judul">${l.jenis === 'aduan' ? 'Kronologi' : 'Uraian'}</h3>
          <p class="teks-panjang">${esc(l.uraian)}</p>
          <h3 class="sub-judul">Lampiran</h3>
          <div data-lampiran>${l.jumlahLampiran ? '<div class="kerangka" style="height:90px"></div>' : '<p class="petunjuk" style="color:var(--tinta-2)">Tidak ada lampiran.</p>'}</div>
          <h3 class="sub-judul">Percakapan dengan pengurus</h3>
          ${liniTanggapan(tg, { kosong: 'Pengurus belum menanggapi. Anda akan melihat tanggapan di sini.' })}
          ${bisaBalas ? `<form class="formulir" data-balas style="margin-top:20px;gap:12px"><div class="medan"><label for="balas">Tambahkan keterangan atau jawab pertanyaan pengurus</label><textarea id="balas" name="pesan" rows="4" maxlength="3000" required></textarea></div><div class="aksi-formulir"><button class="tombol tombol-utama" type="submit">${ikon('send')}Kirim balasan</button></div></form>` : '<p class="petunjuk" style="color:var(--tinta-2);margin-top:16px">Laporan ini sudah ditutup. Kirim laporan baru bila persoalannya muncul kembali.</p>'}
        </div>
        <aside class="kartu">${rincianLaporan(l)}</aside>
      </div>`;
    if (l.jumlahLampiran) {
      L.lampiran(id).then((daftar) => {
        const w = $('[data-lampiran]', panel.laporan);
        w.innerHTML = lampiranHtml(daftar);
        w.addEventListener('click', (e) => { const b = e.target.closest('[data-buka-lampiran]'); if (b) bukaDataUrl(daftar[Number(b.dataset.bukaLampiran)].data); });
      }).catch(() => ($('[data-lampiran]', panel.laporan).innerHTML = '<p class="medan-galat">Lampiran gagal dimuat.</p>'));
    }
    $('[data-balas]', panel.laporan)?.addEventListener('submit', (e) => {
      e.preventDefault();
      const f = e.currentTarget;
      const pesan = f.pesan.value.trim();
      if (pesan.length < 3) return;
      denganMemuat($('[type=submit]', f), async () => {
        try {
          await L.kirimTanggapan(id, pesan);
          roti('Balasan terkirim.', 'berhasil');
          tampilDetail(id);
        } catch (err) { roti(pesanGalat(err), 'galat'); }
      });
    });
    scrollTo({ top: 0, behavior: 'smooth' });
  } catch (e) {
    console.error(e);
    panel.laporan.innerHTML = `<div class="pesan pesan-galat">${ikon('triangle-alert')}<p>${esc(pesanGalat(e))}</p></div>`;
  }
}

// ---------- keanggotaan ----------
async function tampilAnggota() {
  panel.anggota.innerHTML = `<div class="kerangka" style="height:200px;max-width:440px"></div>`;
  try {
    const a = await L.keanggotaanSaya();
    if (!a) {
      panel.anggota.innerHTML = `<div class="kosong" style="text-align:left"><h3>Anda belum terdaftar sebagai anggota</h3><p>Daftar sebagai anggota untuk ikut kegiatan bidang dan menerima kartu anggota digital.</p><p style="margin-top:16px"><a class="tombol tombol-utama" href="${BASE}layanan/anggota/">Daftar anggota</a></p></div>`;
    } else if (a.status === 'diterima') {
      panel.anggota.innerHTML = `<div style="display:grid;gap:20px;justify-items:start">${kartuAnggota(a)}<p style="margin:0;color:var(--tinta-2)">Nomor anggota: <span class="kode">${esc(a.nomorAnggota)}</span>. Tangkap layar kartu ini atau cetak untuk dibawa ke kegiatan.</p><button class="tombol tombol-garis" type="button" data-cetak-kartu>${ikon('printer')}Cetak kartu</button></div>`;
      $('[data-cetak-kartu]', panel.anggota).addEventListener('click', () => {
        document.body.classList.add('cetak-kartu');
        print();
        setTimeout(() => document.body.classList.remove('cetak-kartu'), 500);
      });
    } else {
      panel.anggota.innerHTML = `<div class="kartu" style="max-width:640px"><p class="label">Status pendaftaran</p><p><span class="status" data-status="${esc(a.status)}">${esc(STATUS_ANGGOTA[a.status] || a.status)}</span></p><p style="color:var(--tinta-2)">${a.status === 'menunggu' ? 'Pengurus sedang memeriksa data Anda.' : esc(a.catatanAdmin || 'Data pendaftaran perlu dilengkapi.')}</p><a class="tombol tombol-garis kecil" href="${BASE}layanan/anggota/">${a.status === 'menunggu' ? 'Lihat atau perbaiki data' : 'Perbaiki dan kirim ulang'}</a></div>`;
    }
  } catch (e) {
    panel.anggota.innerHTML = `<div class="pesan pesan-galat">${ikon('triangle-alert')}<p>${esc(pesanGalat(e))}</p></div>`;
  }
}

// ---------- profil ----------
function isiProfil() {
  const E = fProfil.elements;
  E.email.value = pengguna.email;
  E.nama.value = pengguna.nama || '';
  E.wa.value = pengguna.wa || '';
  E.provinsi.value = pengguna.provinsi || '';
  E.kota.value = pengguna.kota || '';
}
fProfil.addEventListener('submit', (e) => {
  e.preventDefault();
  const E = fProfil.elements;
  const galat = $('[data-galat]', fProfil);
  const wa = E.wa.value.replace(/[\s-]/g, '');
  if (E.nama.value.trim().length < 3) { galat.textContent = 'Isi nama lengkap.'; galat.hidden = false; return; }
  if (wa && !/^(\+?62|0)8\d{7,12}$/.test(wa)) { galat.textContent = 'Nomor WhatsApp diawali 08 atau +628.'; galat.hidden = false; return; }
  galat.hidden = true;
  denganMemuat($('[type=submit]', fProfil), async () => {
    try {
      await L.simpanProfil({ nama: E.nama.value.trim(), wa, provinsi: E.provinsi.value, kota: E.kota.value.trim() });
      roti('Profil disimpan.', 'berhasil');
    } catch (err) { galat.textContent = pesanGalat(err); galat.hidden = false; }
  });
});
$('[data-keluar]').addEventListener('click', (e) => denganMemuat(e.currentTarget, async () => {
  await L.keluar();
  location.href = BASE;
}));

let pertama = true;
jagaAkun({
  wadah: $('[data-akun]'),
  pesan: $('[data-pesan-gerbang]'),
  keperluan: 'membuka akun Anda',
  saatMasuk(p) {
    pengguna = p;
    kepala(p);
    if (pertama) { pertama = false; rute(); muatLaporan().catch(() => {}); }
  },
});
