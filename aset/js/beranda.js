import { $, $$, BASE, MODE, KONFIG, esc, ikon, tanggal } from './inti.js';
import { daftarKabar, daftarPengumuman, gambarPengumuman } from './publik.js';
import { utamaKabar, barisKabar, urlKabar } from './kartu.js';

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
  const k = KONFIG.kontak?.whatsapp ? KONFIG.kontak : KONFIG.induk;
  if (d && k?.whatsapp) d.insertAdjacentHTML('beforeend', ` Sekretariat: <a href="https://wa.me/${esc(k.whatsapp)}">${esc(k.telepon)}</a>.`);
}

// Enam bidang kerja: di HP menjadi daftar lipat supaya beranda tidak memanjang; di layar lebar selalu terbuka.
const bidang = $$('.kisi-bidang details.bidang');
const hp = matchMedia('(max-width: 640px)');
const aturBidang = () => bidang.forEach((d) => { d.open = !hp.matches; });
aturBidang();
hp.addEventListener('change', aturBidang);
bidang.forEach((d) => $('summary', d).addEventListener('click', (e) => { if (!hp.matches) e.preventDefault(); }));

// ======================================================================
// Papan pengumuman di hero (carousel). Slaid 0 = sapaan; berikutnya baliho dari
// panel > Pengumuman, atau tiga kabar terbaru bila belum ada pengumuman aktif.
// ======================================================================
const LAMA = 7000; // ms per slaid
const papan = $('[data-papan]');
const kendali = $('[data-papan-kendali]');
const geraknyaDikurangi = matchMedia('(prefers-reduced-motion: reduce)');

// Hanya tautan situs sendiri (/...), https, atau mailto yang dipakai; selain itu diabaikan.
function tautanAman(t) {
  const u = String(t || '').trim();
  if (!u) return '';
  if (/^(https:\/\/|mailto:)/i.test(u)) return u;
  if (u.startsWith('/')) return BASE + u.replace(/^\/+/, '');
  return '';
}

function baliho(s, i) {
  const tag = s.tautan ? 'a' : 'div';
  const luar = /^https:/i.test(s.tautan) && !s.tautan.startsWith(location.origin) ? ' target="_blank" rel="noopener"' : '';
  const foto = s.gambar || s.idGambar;
  return `<div class="papan-slaid" role="group" aria-roledescription="slide" aria-label="${esc(s.judul)}" data-judul-slaid="${esc(s.judul)}" inert aria-hidden="true">
    <${tag} class="baliho${foto ? '' : ' tanpa-foto'}"${s.tautan ? ` href="${esc(s.tautan)}"${luar}` : ''}>
      ${foto ? `<figure class="baliho-foto"><img alt="" decoding="async"${s.gambar ? ` data-src="${esc(s.gambar)}"` : ''} data-id-gambar="${esc(s.idGambar || '')}"></figure>` : ''}
      <div class="baliho-isi">
        ${s.label ? `<p class="baliho-label">${esc(s.label)}</p>` : ''}
        <h2>${esc(s.judul)}</h2>
        ${s.teks ? `<p>${esc(s.teks)}</p>` : ''}
        ${s.tautan ? `<span class="baliho-ajak">${esc(s.tombol || 'Selengkapnya')}${ikon('arrow-right')}</span>` : ''}
      </div>
    </${tag}>
  </div>`;
}

async function isiPapan() {
  let slaid = [];
  try {
    const p = await daftarPengumuman();
    slaid = p.map((x) => ({
      judul: x.judul, teks: x.teks, label: x.label || 'Pengumuman', tombol: x.tombol,
      tautan: tautanAman(x.tautan), idGambar: x.adaGambar ? x.id : '',
    }));
  } catch (e) { console.warn('Pengumuman belum bisa dimuat:', e); }
  if (!slaid.length) {
    try {
      // kabar unggulan (mis. pelantikan) lebih dulu, lalu dua kabar/opini terbaru
      const k = await daftarKabar({ batas: 10 });
      const iU = k.findIndex((x) => x.unggulan);
      if (iU > 0) k.unshift(...k.splice(iU, 1));
      slaid = k.slice(0, 3).map((x) => ({
        judul: x.judul, teks: x.ringkasan, label: `${x.kategori || 'Kabar'} · ${tanggal(x.terbitPada)}`,
        tautan: urlKabar(x), tombol: x.kategori === 'Opini' ? 'Baca opini' : 'Baca kabar', gambar: x.sampul || x.sampulKecil || '',
      }));
    } catch (e) { console.warn(e); }
  }
  if (!slaid.length) return;
  papan.insertAdjacentHTML('beforeend', slaid.map(baliho).join(''));
  jalankanPapan();
}

function jalankanPapan() {
  const semua = $$('.papan-slaid', papan);
  const titik = $('[data-papan-titik]', kendali);
  const jeda = $('[data-papan-jeda]', kendali);
  titik.innerHTML = semua.map((el, i) => `<button type="button" aria-label="Slaid ${i + 1} dari ${semua.length}: ${esc(el.dataset.judulSlaid)}"><span></span></button>`).join('');
  const tombol = $$('button', titik);
  kendali.hidden = false;
  let kini = 0;
  let dihentikan = geraknyaDikurangi.matches; // pengunjung yang meminta gerak dikurangi tidak diputar otomatis
  const tahan = new Set();

  // Gambar dimuat saat slaid itu (atau sesudahnya) akan tampil, supaya beranda tetap ringan.
  const muatGambar = async (el) => {
    const img = $('img:not([src])', el);
    if (!img) return;
    if (img.dataset.src) { img.src = img.dataset.src; return; }
    if (!img.dataset.idGambar) return;
    try {
      const d = await gambarPengumuman(img.dataset.idGambar);
      if (d.startsWith('data:image/')) img.src = d;
    } catch {}
  };

  function aturPutar() {
    papan.classList.toggle('otomatis', !dihentikan);
    papan.classList.toggle('tertahan', tahan.size > 0 || document.hidden);
    jeda.setAttribute('aria-pressed', String(dihentikan));
    jeda.setAttribute('aria-label', dihentikan ? 'Putar otomatis' : 'Hentikan putar otomatis');
    papan.setAttribute('aria-live', dihentikan ? 'polite' : 'off');
  }

  function ke(n) {
    const baru = (n + semua.length) % semua.length;
    semua.forEach((el, i) => {
      const aktif = i === baru;
      el.classList.toggle('aktif', aktif);
      el.toggleAttribute('inert', !aktif);
      if (aktif) el.removeAttribute('aria-hidden'); else el.setAttribute('aria-hidden', 'true');
    });
    tombol.forEach((b, i) => b.setAttribute('aria-current', String(i === baru)));
    // mulai ulang garis waktu slaid aktif
    const garis = $('span', tombol[baru]);
    garis.style.animation = 'none'; void garis.offsetWidth; garis.style.animation = '';
    kini = baru;
    muatGambar(semua[baru]);
    muatGambar(semua[(baru + 1) % semua.length]);
  }

  // Slaid berganti ketika garis waktu slaid aktif penuh, jadi jeda & tahan otomatis ikut terhitung.
  titik.addEventListener('animationend', (e) => { if (e.animationName === 'papan-lama' && !dihentikan) ke(kini + 1); });
  tombol.forEach((b, i) => b.addEventListener('click', () => ke(i)));
  $('[data-papan-maju]', kendali).addEventListener('click', () => ke(kini + 1));
  $('[data-papan-mundur]', kendali).addEventListener('click', () => ke(kini - 1));
  jeda.addEventListener('click', () => { dihentikan = !dihentikan; aturPutar(); if (!dihentikan) ke(kini); });

  const pintu = papan.closest('.pintu');
  pintu.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') { tahan.add('arah'); aturPutar(); } });
  pintu.addEventListener('pointerleave', () => { tahan.delete('arah'); aturPutar(); });
  pintu.addEventListener('focusin', () => { tahan.add('fokus'); aturPutar(); });
  pintu.addEventListener('focusout', (e) => { if (!pintu.contains(e.relatedTarget)) { tahan.delete('fokus'); aturPutar(); } });
  document.addEventListener('visibilitychange', aturPutar);
  pintu.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { ke(kini + 1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { ke(kini - 1); e.preventDefault(); }
  });

  // Geser jari di HP
  let x0 = null, y0 = 0;
  papan.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { x0 = e.clientX; y0 = e.clientY; } });
  papan.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0, dy = e.clientY - y0;
    x0 = null;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) {
      ke(kini + (dx < 0 ? 1 : -1));
      // ketukan sesudah geser jangan sampai membuka tautan baliho
      const cegah = (k) => k.preventDefault();
      papan.addEventListener('click', cegah, { once: true, capture: true });
      setTimeout(() => papan.removeEventListener('click', cegah, { capture: true }), 400);
    }
  });
  papan.addEventListener('pointercancel', () => { x0 = null; });

  kendali.style.setProperty('--lama', `${LAMA}ms`);
  aturPutar();
  ke(0);
}
isiPapan();
