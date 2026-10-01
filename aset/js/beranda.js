import { $, BASE, MODE, KONFIG, esc } from './inti.js';
import { daftarKabar } from './publik.js';
import { utamaKabar, barisKabar } from './kartu.js';

const wadah = $('[data-kabar-portal]');

async function muat() {
  try {
    const semua = await daftarKabar({ batas: 6 });
    wadah.removeAttribute('aria-busy');
    if (!semua.length) {
      wadah.outerHTML = `<div class="kosong"><h3>Kabar pertama sedang disiapkan</h3><p>${
        MODE === 'mati'
          ? 'Kegiatan dan berita organisasi akan tampil di sini.'
          : 'Kegiatan dan berita yang diterbitkan pengurus akan tampil di sini.'
      }</p></div>`;
      return;
    }
    const iUtama = Math.max(0, semua.findIndex((k) => k.unggulan));
    const [utama] = semua.splice(iUtama, 1);
    wadah.innerHTML = `${utamaKabar(utama)}${semua.length ? `<ul class="kabar-daftar">${semua.slice(0, 4).map(barisKabar).join('')}</ul>` : ''}`;
  } catch (e) {
    console.error(e);
    wadah.removeAttribute('aria-busy');
    wadah.innerHTML = `<div class="kosong" style="grid-column:1/-1"><h3>Kabar belum bisa dimuat</h3><p>Periksa koneksi internet lalu muat ulang halaman. Kabar juga bisa dibaca di <a href="${BASE}kabar/">halaman kabar</a>.</p></div>`;
  }
}
muat();

// Tautan WhatsApp sekretariat untuk pengunjung saat layanan daring belum aktif
if (MODE === 'mati') {
  const d = $('.catatan-darurat p');
  if (d) d.insertAdjacentHTML('beforeend', ` Sekretariat: <a href="https://wa.me/${esc(KONFIG.kontak.whatsapp)}">${esc(KONFIG.kontak.telepon)}</a>.`);
}
