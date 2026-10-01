// Penjaga halaman layanan: tampilkan formulir hanya untuk yang sudah masuk.
import { MODE, KONFIG, BASE, esc, ikon } from './inti.js';
import { pantauSesi } from './layanan.js';

const wa = () => `<a href="https://wa.me/${esc(KONFIG.kontak.whatsapp)}" target="_blank" rel="noopener">${esc(KONFIG.kontak.telepon)}</a>`;

export function kartuMati() {
  return `<div class="kartu kartu-gerbang">
    ${ikon('clock', 'ikon ikon-besar')}
    <h2>Layanan daring sedang disiapkan</h2>
    <p>Formulir ini belum tersambung ke server. Sementara itu, sampaikan aduan, aspirasi, atau pendaftaran anggota lewat WhatsApp sekretariat ${wa()} atau email <a href="mailto:${esc(KONFIG.kontak.email)}">${esc(KONFIG.kontak.email)}</a>.</p>
  </div>`;
}

export function kartuMasuk(keperluan) {
  const lanjut = encodeURIComponent(location.pathname + location.search + location.hash);
  return `<div class="kartu kartu-gerbang">
    ${ikon('lock', 'ikon ikon-besar')}
    <h2>Masuk untuk ${esc(keperluan)}</h2>
    <p>Akun membuat pengurus bisa menghubungi Anda kembali, dan Anda bisa memantau statusnya kapan saja. Daftar cukup dengan email atau akun Google.</p>
    <div class="aksi-formulir">
      <a class="tombol tombol-utama" href="${BASE}masuk/?lanjut=${lanjut}">Masuk</a>
      <a class="tombol tombol-garis" href="${BASE}masuk/?tab=daftar&lanjut=${lanjut}">Buat akun baru</a>
    </div>
    <p class="petunjuk">Kesulitan membuat akun? Hubungi sekretariat lewat WhatsApp ${wa()}.</p>
  </div>`;
}

/**
 * wadah   : elemen yang hanya tampil bila sudah masuk
 * pesan   : elemen untuk kartu "silakan masuk" / "layanan belum aktif"
 * saatMasuk(pengguna) dipanggil setiap kali pengguna masuk / berganti
 */
export function jagaAkun({ wadah, pesan, keperluan, saatMasuk }) {
  if (MODE === 'mati') {
    pesan.innerHTML = kartuMati();
    pesan.hidden = false;
    wadah.hidden = true;
    return;
  }
  pesan.innerHTML = `<div class="kartu kartu-gerbang" aria-busy="true">${ikon('loader-circle', 'ikon ikon-besar berputar')}<p>Memeriksa akun…</p></div>`;
  pesan.hidden = false;
  wadah.hidden = true;
  pantauSesi((p) => {
    if (!p) {
      pesan.innerHTML = kartuMasuk(keperluan);
      pesan.hidden = false;
      wadah.hidden = true;
      return;
    }
    if (p.diblokir) {
      pesan.innerHTML = `<div class="kartu kartu-gerbang">${ikon('ban', 'ikon ikon-besar')}<h2>Akun dinonaktifkan</h2><p>Akun ini tidak dapat mengirim aduan atau pendaftaran. Bila menurut Anda ini keliru, hubungi sekretariat lewat WhatsApp ${wa()}.</p></div>`;
      pesan.hidden = false;
      wadah.hidden = true;
      return;
    }
    pesan.hidden = true;
    wadah.hidden = false;
    saatMasuk?.(p);
  });
}
