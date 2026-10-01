import { $, $$, BASE, esc, ikon, roti, denganMemuat, pesanGalat, tanggal } from './inti.js';
import { L } from './layanan.js';
import { jagaAkun } from './gerbang.js';
import { PROVINSI, BIDANG, STATUS_ANGGOTA } from './rujukan.js';
import { kartuAnggota } from './kartu-anggota.js';

const f = $('[data-form-anggota]');
const status = $('[data-status-anggota]');
$('[data-provinsi]', f).insertAdjacentHTML('beforeend', PROVINSI.map((p) => `<option>${p}</option>`).join(''));
$('[data-bidang-minat]', f).innerHTML = BIDANG.map((b) => `<label class="pilihan"><input type="checkbox" name="bidang" value="${b.kunci}"><span><b>${esc(b.nama)}</b></span></label>`).join('');

let pengguna = null;

function isiForm(data) {
  for (const [k, v] of Object.entries(data || {})) {
    const el = f.elements[k];
    if (!el || typeof v === 'object') continue;
    el.value = v;
  }
  (data?.bidang || []).forEach((v) => { const i = $(`input[name=bidang][value="${v}"]`, f); if (i) i.checked = true; });
}

function tampilStatus(a) {
  status.hidden = false;
  if (a.status === 'diterima') {
    f.hidden = true;
    status.innerHTML = `<div class="kartu" style="display:grid;gap:20px;justify-items:start">
      <p class="label">Anggota terverifikasi</p>
      ${kartuAnggota(a)}
      <p style="margin:0">Kartu ini juga tersimpan di <a href="${BASE}akun/#anggota">akun Anda</a>. Tunjukkan saat menghadiri kegiatan organisasi.</p>
    </div>`;
    return;
  }
  if (a.status === 'menunggu') {
    f.hidden = true;
    status.innerHTML = `<div class="kartu kartu-gerbang">${ikon('hourglass', 'ikon ikon-besar')}<h2>Pendaftaran sedang diverifikasi</h2><p>Dikirim ${tanggal(a.dibuat)}. Pengurus akan memeriksa data Anda; hasilnya muncul di akun.</p><div class="aksi-formulir"><button class="tombol tombol-garis" type="button" data-ubah>Perbaiki data pendaftaran</button><a class="tombol-teks" href="${BASE}akun/#anggota">Buka akun saya</a></div></div>`;
    $('[data-ubah]', status).addEventListener('click', () => { status.hidden = true; f.hidden = false; isiForm(a); });
    return;
  }
  // ditolak
  f.hidden = false;
  status.innerHTML = `<div class="pesan pesan-peringatan" style="margin-bottom:24px">${ikon('info')}<div><p><b>${esc(STATUS_ANGGOTA.ditolak)}.</b> ${esc(a.catatanAdmin || 'Data pendaftaran perlu dilengkapi.')}</p><p>Perbaiki data di bawah lalu kirim ulang.</p></div></div>`;
  isiForm(a);
}

f.addEventListener('submit', (e) => {
  e.preventDefault();
  const E = f.elements;
  const galat = $('[data-galat]', f);
  const masalah = [];
  if (E.nama.value.trim().length < 3) masalah.push('Isi nama lengkap.');
  if (!E.jenisKelamin.value) masalah.push('Pilih jenis kelamin.');
  if (!E.tanggalLahir.value) masalah.push('Isi tanggal lahir.');
  if (!/^(\+?62|0)8\d{7,12}$/.test(E.wa.value.replace(/[\s-]/g, ''))) masalah.push('Nomor WhatsApp diawali 08 atau +628.');
  if (!E.provinsi.value || !E.kota.value.trim()) masalah.push('Isi provinsi dan kabupaten/kota domisili.');
  const bidang = $$('input[name=bidang]:checked', f).map((i) => i.value);
  if (!bidang.length) masalah.push('Pilih minimal satu bidang.');
  if (!E.pernyataan.checked || !E.setuju.checked) masalah.push('Centang kedua pernyataan.');
  if (masalah.length) {
    galat.textContent = masalah.join(' ');
    galat.hidden = false;
    return;
  }
  galat.hidden = true;
  const data = {
    nama: E.nama.value.trim(), jenisKelamin: E.jenisKelamin.value, tanggalLahir: E.tanggalLahir.value, wa: E.wa.value.replace(/[\s-]/g, ''),
    pekerjaan: E.pekerjaan.value.trim(), provinsi: E.provinsi.value, kota: E.kota.value.trim(), alamat: E.alamat.value.trim(),
    bidang, alasan: E.alasan.value.trim(),
  };
  denganMemuat($('[type=submit]', f), async () => {
    try {
      await L.ajukanAnggota(data);
      roti('Pendaftaran terkirim.', 'berhasil');
      tampilStatus(await L.keanggotaanSaya());
      scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      galat.textContent = pesanGalat(err);
      galat.hidden = false;
    }
  });
});

jagaAkun({
  wadah: f,
  pesan: $('[data-pesan-gerbang]'),
  keperluan: 'mendaftar sebagai anggota',
  async saatMasuk(p) {
    pengguna = p;
    f.hidden = true;
    try {
      const a = await L.keanggotaanSaya();
      if (a) return tampilStatus(a);
    } catch (e) {
      console.error(e);
    }
    status.hidden = true;
    f.hidden = false;
    if (!f.elements.nama.value) isiForm({ nama: p.nama, wa: p.wa, provinsi: p.provinsi, kota: p.kota });
  },
});
