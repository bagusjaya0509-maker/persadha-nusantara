import { $, BASE, esc, param, denganMemuat } from './inti.js';
import { daftarKabar } from './publik.js';
import { kartuKabar, kerangkaKartu } from './kartu.js';
import { KATEGORI_KABAR } from './isi.js';

const UKURAN = 12;
const kisi = $('[data-kisi]');
const tLagi = $('[data-lagi]');
const cari = $('[data-cari]');
let kategori = KATEGORI_KABAR.includes(param('kategori')) ? param('kategori') : null;
let semua = [];
let habis = false;

function chip() {
  const pilihan = [null, ...KATEGORI_KABAR];
  $('[data-chip]').innerHTML = pilihan
    .map((k) => `<a class="chip" href="${BASE}kabar/${k ? `?kategori=${encodeURIComponent(k)}` : ''}" data-kat="${esc(k || '')}" aria-current="${k === kategori}">${esc(k || 'Semua')}</a>`)
    .join('');
}

function tampil() {
  const q = cari.value.trim().toLowerCase();
  const hasil = q ? semua.filter((k) => `${k.judul} ${k.ringkasan || ''}`.toLowerCase().includes(q)) : semua;
  if (!hasil.length) {
    kisi.innerHTML = `<div class="kosong" style="grid-column:1/-1"><h3>${q ? 'Tidak ada kabar yang cocok' : 'Belum ada kabar di kategori ini'}</h3><p>${
      q ? 'Coba kata lain, atau muat kabar sebelumnya lalu cari lagi.' : 'Pilih kategori lain atau kembali ke semua kabar.'
    }</p></div>`;
  } else kisi.innerHTML = hasil.map(kartuKabar).join('');
  tLagi.hidden = habis;
}

async function muat(lanjut = false) {
  if (!lanjut) kisi.innerHTML = kerangkaKartu(6);
  try {
    const setelah = lanjut && semua.length ? semua[semua.length - 1].terbitPada : null;
    const baru = await daftarKabar({ batas: UKURAN, setelah, kategori });
    semua = lanjut ? semua.concat(baru) : baru;
    habis = baru.length < UKURAN;
    tampil();
  } catch (e) {
    console.error(e);
    kisi.innerHTML = `<div class="kosong" style="grid-column:1/-1"><h3>Kabar belum bisa dimuat</h3><p>Periksa koneksi internet, lalu muat ulang halaman.</p></div>`;
  }
}

$('[data-chip]').addEventListener('click', (e) => {
  const a = e.target.closest('a[data-kat]');
  if (!a) return;
  e.preventDefault();
  kategori = a.dataset.kat || null;
  history.replaceState(null, '', a.href);
  chip();
  muat();
});
cari.addEventListener('input', tampil);
tLagi.addEventListener('click', () => denganMemuat(tLagi, () => muat(true)));

chip();
muat();
