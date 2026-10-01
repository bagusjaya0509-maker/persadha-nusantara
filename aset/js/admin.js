// Panel pengurus: kabar, aduan & aspirasi, anggota, pengguna, sistem.
import { $, $$, BASE, ASAL, MODE, KONFIG, esc, ikon, roti, denganMemuat, pesanGalat, tanggal, tanggalPendek, tanggalJam, waktuLalu, inisial } from './inti.js';
import { L, pantauSesi } from './layanan.js';
import { PROVINSI, KATEGORI_ADUAN, BIDANG, STATUS_LAPORAN, STATUS_ANGGOTA, namaKategori, namaBidang, namaBantuan } from './rujukan.js';
import { pilStatus, langkahStatus, rincianLaporan, liniTanggapan, lampiranHtml, bukaDataUrl, waIntl } from './laporan-tampil.js';
import { KATEGORI_KABAR, buatSlug, deltaKeTeks } from './isi.js';
import { susunArtikel } from './artikel.js';
import { kompres, ukuranDataUrl, formatUkuran } from './gambar.js';
import { buatXlsx, unduhBlob } from './xlsx.js';
import { kartuAnggota } from './kartu-anggota.js';
import { KABAR_AWAL } from './kabar-awal.js';
import { kartuMati } from './gerbang.js';

const isi = $('[data-adm-isi]');
const judul = $('[data-adm-judul]');
const aksi = $('[data-adm-aksi]');
let saya = null;
const cache = { laporan: null, anggota: null };
let adaPerubahan = false; // editor kabar
let ruteKini = '';

// ======================================================================
// gerbang akses
// ======================================================================
const gerbang = $('[data-adm-gerbang]');
function tampilGerbang(html) {
  gerbang.innerHTML = `<div class="kartu kartu-gerbang" style="max-width:560px">${html}</div>`;
  gerbang.hidden = false;
  $('[data-adm]').hidden = true;
}

if (MODE === 'mati') {
  gerbang.innerHTML = `<div style="max-width:620px;display:grid;gap:16px">${kartuMati()}<div class="kartu"><h2 style="font-size:1.3rem">Untuk pengelola situs</h2><p style="color:var(--tinta-2)">Panel ini aktif setelah konfigurasi Firebase diisi di <span class="kode">situs.config.json</span> dan situs dibangun ulang. Langkah lengkapnya ada di berkas <span class="kode">PANDUAN.md</span> pada repositori.</p></div></div>`;
} else {
  let mulaiSekali = false;
  pantauSesi((p) => {
    if (!p) {
      const lanjut = encodeURIComponent(location.pathname + location.hash);
      return tampilGerbang(`${ikon('lock', 'ikon ikon-besar')}<h2>Masuk sebagai pengurus</h2><p>Panel ini hanya untuk pengurus DPP yang sudah diberi akses.</p><div class="aksi-formulir"><a class="tombol tombol-utama" href="${BASE}masuk/?lanjut=${lanjut}">Masuk</a><a class="tombol tombol-garis" href="${BASE}">Ke beranda</a></div>`);
    }
    if (!p.admin) {
      return tampilGerbang(`${ikon('shield', 'ikon ikon-besar')}<h2>Akun ini belum memiliki akses pengurus</h2><p>Anda masuk sebagai <b>${esc(p.email)}</b>. Minta pengurus yang sudah memiliki akses untuk menambahkan email ini di menu <i>Pengguna &amp; pengurus</i>.</p>${
        (KONFIG.adminUtama || []).includes(p.email) && !p.terverifikasi ? '<p class="pesan pesan-peringatan">Email ini terdaftar sebagai pengurus utama, tetapi belum diverifikasi. Buka tautan verifikasi di email Anda, lalu muat ulang halaman ini.</p>' : ''
      }<div class="aksi-formulir"><a class="tombol tombol-garis" href="${BASE}akun/">Buka akun saya</a></div>`);
    }
    saya = p;
    gerbang.hidden = true;
    $('[data-adm]').hidden = false;
    $('[data-adm-nama]').innerHTML = `<span class="inisial">${esc(inisial(p.nama))}</span><span><b>${esc(p.nama)}</b><small>${esc(p.email)}</small></span>`;
    if (!mulaiSekali) {
      mulaiSekali = true;
      rute();
      segarkanLencana();
    }
  });
}

$('[data-adm-keluar]').addEventListener('click', async () => {
  if (adaPerubahan && !confirm('Ada perubahan kabar yang belum disimpan. Tetap keluar?')) return;
  await L.keluar();
  location.href = BASE;
});

// menu samping di layar kecil
const sisi = $('[data-adm-sisi]');
const latar = $('[data-adm-latar]');
const tutupSisi = () => { sisi.classList.remove('terbuka'); latar.hidden = true; };
$('[data-adm-menu]').addEventListener('click', () => { sisi.classList.add('terbuka'); latar.hidden = false; });
latar.addEventListener('click', tutupSisi);

// ======================================================================
// rute
// ======================================================================
addEventListener('hashchange', () => rute());
addEventListener('beforeunload', (e) => { if (adaPerubahan) { e.preventDefault(); e.returnValue = ''; } });

async function rute() {
  if (!saya) return;
  const [bagian = 'ringkasan', a, b] = location.hash.slice(1).split('/');
  const ruteBaru = [bagian, a, b].filter(Boolean).join('/');
  if (adaPerubahan && ruteBaru !== ruteKini) {
    if (!confirm('Ada perubahan kabar yang belum disimpan. Tinggalkan halaman editor?')) {
      history.replaceState(null, '', '#' + ruteKini);
      return;
    }
    adaPerubahan = false;
  }
  ruteKini = ruteBaru;
  tutupSisi();
  $$('[data-rute]').forEach((el) => el.toggleAttribute('aria-current', el.dataset.rute === (bagian === 'laporan' ? (cache.laporan?.find((l) => l.id === a)?.jenis || 'aduan') : bagian)));
  aksi.innerHTML = '';
  isi.innerHTML = '<div class="kerangka" style="height:120px"></div><div class="kerangka" style="height:320px;margin-top:16px"></div>';
  try {
    if (bagian === 'ringkasan') await vRingkasan();
    else if (bagian === 'kabar' && a === 'baru') await vEditor(null);
    else if (bagian === 'kabar' && a === 'edit') await vEditor(b);
    else if (bagian === 'kabar') await vKabar();
    else if (bagian === 'aduan' || bagian === 'aspirasi') await vLaporan(bagian);
    else if (bagian === 'laporan') await vDetailLaporan(a);
    else if (bagian === 'anggota') await vAnggota(a);
    else if (bagian === 'pengguna') await vPengguna();
    else if (bagian === 'sistem') await vSistem();
    else location.hash = 'ringkasan';
  } catch (e) {
    console.error(e);
    isi.innerHTML = `<div class="pesan pesan-galat">${ikon('triangle-alert')}<div><p><b>Data tidak bisa dimuat.</b> ${esc(pesanGalat(e))}</p>${e.tautanIndeks ? `<p><a href="${esc(e.tautanIndeks)}" target="_blank" rel="noopener">Buat indeks Firestore yang dibutuhkan</a></p>` : ''}</div></div>`;
  }
  isi.focus({ preventScroll: true });
  scrollTo({ top: 0 });
}

const PIL_TERBIT = '<span class="status" data-status="terbit">Terbit</span>';
const pilAnggota = (st) => `<span class="status" data-status="${esc(st)}">${esc(STATUS_ANGGOTA[st] || st)}</span>`;
const setJudul = (t) => { judul.textContent = t; document.title = `${t} — Panel Pengurus Persadha Nusantara`; };

async function ambilLaporan(paksa = false) {
  if (!cache.laporan || paksa) cache.laporan = await L.semuaLaporan();
  return cache.laporan;
}
async function ambilAnggota(paksa = false) {
  if (!cache.anggota || paksa) cache.anggota = await L.semuaAnggota();
  return cache.anggota;
}
const perluPerhatian = (l) => l.status === 'baru' || (l.balasanPelapor && (!l.dibacaAdmin || l.balasanPelapor > l.dibacaAdmin));

async function segarkanLencana() {
  try {
    const [lap, ang] = await Promise.all([ambilLaporan(), ambilAnggota()]);
    const set = (k, n) => { const el = $(`[data-lencana="${k}"]`); el.textContent = n; el.hidden = !n; };
    set('aduan', lap.filter((l) => l.jenis === 'aduan' && perluPerhatian(l)).length);
    set('aspirasi', lap.filter((l) => l.jenis === 'aspirasi' && perluPerhatian(l)).length);
    set('anggota', ang.filter((a) => a.status === 'menunggu').length);
  } catch (e) { console.warn(e); }
}

// ======================================================================
// modal
// ======================================================================
const modal = $('[data-modal]');
$('[data-modal-tutup]').addEventListener('click', () => modal.close());
modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
function bukaModal(judulModal, html, kaki = '', lebar = 560) {
  $('[data-modal-judul]').textContent = judulModal;
  $('[data-modal-isi]').innerHTML = html;
  $('[data-modal-kaki]').innerHTML = kaki;
  $('[data-modal-kaki]').hidden = !kaki;
  modal.style.width = `min(${lebar}px, calc(100vw - 32px))`;
  modal.showModal();
  return modal;
}

// ======================================================================
// grafik batang sederhana (satu seri; label & nilai memakai warna teks)
// ======================================================================
function grafikBatang(data, { kosong = 'Belum ada data.', nol = false } = {}) {
  const ada = nol ? data : data.filter((d) => d.nilai > 0);
  if (!ada.some((d) => d.nilai > 0)) return `<p class="petunjuk" style="color:var(--tinta-2)">${esc(kosong)}</p>`;
  const maks = Math.max(1, ...ada.map((d) => d.nilai));
  return `<ul class="grafik-batang">${ada
    .map((d) => `<li title="${esc(d.label)}: ${d.nilai}"><span class="gb-label">${esc(d.label)}</span><span class="gb-jalur"><span class="gb-batang" style="width:${d.nilai ? Math.max(2, (d.nilai / maks) * 100) : 0}%"></span></span><span class="gb-nilai">${d.nilai.toLocaleString('id-ID')}</span></li>`)
    .join('')}</ul>`;
}
const hitungMenurut = (daftar, kunci) => {
  const m = new Map();
  for (const x of daftar) { const k = kunci(x) || 'Tidak diisi'; m.set(k, (m.get(k) || 0) + 1); }
  return [...m.entries()].map(([label, nilai]) => ({ label, nilai })).sort((a, b) => b.nilai - a.nilai);
};
function perBulan(daftar, n = 6) {
  const hasil = [];
  const kini = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(kini.getFullYear(), kini.getMonth() - i, 1);
    const akhir = new Date(d.getFullYear(), d.getMonth() + 1, 1);
    hasil.push({
      label: d.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
      nilai: daftar.filter((l) => l.dibuat >= d.getTime() && l.dibuat < akhir.getTime()).length,
    });
  }
  return hasil;
}

// ======================================================================
// RINGKASAN
// ======================================================================
async function vRingkasan() {
  setJudul('Ringkasan');
  aksi.innerHTML = `<button class="tombol tombol-garis kecil" type="button" data-segarkan>${ikon('refresh-cw')}Muat ulang</button>`;
  $('[data-segarkan]').addEventListener('click', async () => { cache.laporan = cache.anggota = null; await segarkanLencana(); vRingkasan(); });
  const [lap, ang, kabar] = await Promise.all([ambilLaporan(), ambilAnggota(), L.semuaKabarAdmin()]);
  const aduan = lap.filter((l) => l.jenis === 'aduan');
  const aspirasi = lap.filter((l) => l.jenis === 'aspirasi');
  const terbuka = (l) => !['selesai', 'ditutup'].includes(l.status);
  const ubin = [
    { n: aduan.filter((l) => l.status === 'baru').length, t: 'Aduan baru', k: 'Belum ditinjau', href: '#aduan' },
    { n: aduan.filter((l) => ['ditinjau', 'diproses'].includes(l.status)).length, t: 'Aduan berjalan', k: 'Ditinjau atau ditindaklanjuti', href: '#aduan' },
    { n: aduan.filter((l) => l.mendesak && terbuka(l)).length, t: 'Mendesak', k: 'Aduan mendesak yang belum selesai', href: '#aduan', tanda: true },
    { n: aspirasi.filter((l) => l.status === 'baru').length, t: 'Aspirasi baru', k: 'Belum dibaca', href: '#aspirasi' },
    { n: ang.filter((a) => a.status === 'menunggu').length, t: 'Calon anggota', k: 'Menunggu verifikasi', href: '#anggota' },
    { n: kabar.filter((k) => k.terbit).length, t: 'Kabar terbit', k: `${kabar.filter((k) => !k.terbit).length} draf`, href: '#kabar' },
  ];
  const perhatian = lap.filter(perluPerhatian).sort((a, b) => (b.mendesak - a.mendesak) || (b.dibuat - a.dibuat)).slice(0, 8);
  isi.innerHTML = `
    <div class="adm-ubin">${ubin.map((u) => `<a class="ubin ${u.tanda && u.n ? 'ubin-tanda' : ''}" href="${u.href}"><span class="ubin-angka">${u.n}</span><span class="ubin-judul">${u.t}</span><span class="ubin-ket">${u.k}</span></a>`).join('')}</div>
    ${!kabar.length ? `<div class="pesan" style="margin-top:20px">${ikon('newspaper')}<div><p><b>Belum ada kabar terbit.</b> Tiga kabar awal sudah disiapkan dari dokumen legal organisasi (SK Menteri Hukum, perpindahan sekretariat, dan NIB).</p><p><a href="#kabar">Buka menu Kabar untuk menerbitkannya</a></p></div></div>` : ''}
    <div class="adm-kisi-2">
      <section class="adm-kartu">
        <h2>Perlu perhatian</h2>
        ${perhatian.length ? `<ul class="adm-daftar">${perhatian.map((l) => `<li><a href="#laporan/${l.id}"><span class="kode">${esc(l.nomor)}</span><b>${esc(l.judul)}</b><span class="meta-kecil">${l.jenis === 'aduan' ? esc(namaKategori(l.kategori)) : 'Aspirasi'} · ${esc(l.lokasi?.provinsi || '-')} · ${esc(waktuLalu(l.dibuat))}</span><span class="adm-daftar-tanda">${l.mendesak ? '<span class="status" data-status="mendesak">Mendesak</span>' : ''}${l.status === 'baru' ? pilStatus('baru') : '<span class="status" data-status="ditinjau">Balasan pelapor</span>'}</span></a></li>`).join('')}</ul>` : '<p class="petunjuk" style="color:var(--tinta-2)">Tidak ada aduan atau aspirasi yang menunggu. Semua sudah ditinjau.</p>'}
      </section>
      <section class="adm-kartu">
        <h2>Aduan masuk per bulan</h2>
        ${grafikBatang(perBulan(aduan), { kosong: 'Belum ada aduan dalam enam bulan terakhir.', nol: true })}
      </section>
      <section class="adm-kartu">
        <h2>Aduan per jenis persoalan</h2>
        ${grafikBatang(hitungMenurut(aduan, (l) => namaKategori(l.kategori)))}
      </section>
      <section class="adm-kartu">
        <h2>Aduan per provinsi</h2>
        ${grafikBatang(hitungMenurut(aduan, (l) => l.lokasi?.provinsi).slice(0, 10))}
      </section>
    </div>`;
}

// ======================================================================
// KABAR
// ======================================================================
async function vKabar() {
  setJudul('Kabar');
  aksi.innerHTML = `<a class="tombol tombol-utama kecil" href="#kabar/baru">${ikon('plus')}Tulis kabar</a>`;
  const daftar = await L.semuaKabarAdmin();
  const awalBelum = KABAR_AWAL.filter((k) => !daftar.some((d) => d.slug === k.slug));
  isi.innerHTML = `
    ${awalBelum.length ? `<div class="pesan" style="margin-bottom:20px">${ikon('newspaper')}<div><p><b>${awalBelum.length} kabar awal siap terbit.</b> Disusun dari SK Menteri Hukum, Akta No. 01/2025, dan NIB: ${awalBelum.map((k) => `“${esc(k.judul)}”`).join(', ')}.</p><p style="margin-top:10px;display:flex;gap:8px;flex-wrap:wrap"><button class="tombol tombol-utama kecil" type="button" data-terbit-awal>Terbitkan kabar awal</button><button class="tombol tombol-garis kecil" type="button" data-lihat-awal>Lihat isinya dulu</button></p></div></div>` : ''}
    ${daftar.length ? `<div class="tabel-wadah"><table class="tabel adm-tabel">
      <thead><tr><th>Judul</th><th>Kategori</th><th>Status</th><th>Tanggal terbit</th><th>Diubah</th><th><span class="sr-only">Aksi</span></th></tr></thead>
      <tbody>${daftar.map((k) => `<tr>
        <td><a class="adm-tautan-judul" href="#kabar/edit/${esc(k.slug)}">${esc(k.judul || '(tanpa judul)')}</a><small class="kode">/kabar/${esc(k.slug)}/</small></td>
        <td>${esc(k.kategori || '-')}</td>
        <td>${k.terbit ? PIL_TERBIT : ''}${k.terbit && k.adaDraf ? ' <span class="status" data-status="draf">Ada draf perubahan</span>' : ''}${!k.terbit ? '<span class="status" data-status="draf">Draf</span>' : ''}</td>
        <td>${esc(tanggalPendek(k.terbitPada))}</td>
        <td>${esc(waktuLalu(k.diubah))}</td>
        <td class="adm-aksi-sel"><a class="tombol tombol-garis kecil" href="#kabar/edit/${esc(k.slug)}">${ikon('pencil')}Sunting</a>${k.terbit ? `<a class="tombol-ikon" href="${BASE}kabar/${esc(k.slug)}/" target="_blank" rel="noopener" title="Lihat di situs">${ikon('external-link')}</a>` : ''}</td>
      </tr>`).join('')}</tbody></table></div>` : '<div class="kosong"><h3>Belum ada kabar</h3><p>Tulis kabar pertama tentang kegiatan organisasi. Foto sampul dan gambar di dalam kabar otomatis diperkecil.</p></div>'}
    <p class="petunjuk adm-catatan">${ikon('info')} Kabar yang diterbitkan langsung muncul di beranda. Halaman statisnya (untuk pratinjau tautan WhatsApp/Facebook dan Google) dibangun ulang otomatis paling lambat satu jam kemudian.</p>`;
  $('[data-lihat-awal]')?.addEventListener('click', () => {
    bukaModal('Kabar awal', awalBelum.map((k) => `<article class="baca" style="padding:0 0 28px;border-bottom:1px solid var(--garis);margin-bottom:28px">${susunArtikel({ kabar: k, isi: { delta: k.delta }, base: BASE })}</article>`).join(''), '', 820);
  });
  $('[data-terbit-awal]')?.addEventListener('click', (e) => denganMemuat(e.currentTarget, async () => {
    try {
      for (const k of awalBelum) await L.terbitkan({ ...k, sampul: '', sampulKecil: '', keteranganSampul: '' });
      roti(`${awalBelum.length} kabar awal terbit.`, 'berhasil');
      vKabar();
    } catch (err) { roti(pesanGalat(err), 'galat'); }
  }));
}

function muatQuill() {
  if (window.Quill) return Promise.resolve(window.Quill);
  return new Promise((ok, gagal) => {
    const s = document.createElement('script');
    s.src = `${BASE}aset/vendor/quill/quill.js`;
    s.onload = () => ok(window.Quill);
    s.onerror = () => gagal(new Error('Editor gagal dimuat. Periksa koneksi internet.'));
    document.head.append(s);
  });
}

const BATAS_ISI = 900_000; // bita; batas dokumen Firestore 1 MiB

async function rampingkanGambar(ops) {
  // Gambar tempelan (paste) bisa berukuran beberapa MB; kecilkan sebelum disimpan.
  for (const op of ops) {
    const src = op.insert?.image;
    if (typeof src === 'string' && src.startsWith('data:') && ukuranDataUrl(src) > 320_000) {
      const blob = await (await fetch(src)).blob();
      op.insert.image = await kompres(blob, { maks: 1280, mutu: 0.74 });
    }
  }
  return ops;
}

const keLokal = (ms) => {
  const d = new Date(ms - new Date(ms).getTimezoneOffset() * 60000);
  return d.toISOString().slice(0, 16);
};

async function vEditor(slug) {
  const lama = slug ? await L.ambilKabarEdit(slug) : null;
  if (slug && !lama) { isi.innerHTML = `<div class="kosong"><h3>Kabar tidak ditemukan</h3><p><a href="#kabar">Kembali ke daftar kabar</a></p></div>`; return; }
  setJudul(lama ? 'Sunting kabar' : 'Tulis kabar');
  const k = {
    slug: lama?.slug || '', judul: lama?.judul || '', kategori: lama?.kategori || 'Kegiatan', ringkasan: lama?.ringkasan || '',
    penulis: lama?.penulis || saya.nama, unggulan: Boolean(lama?.unggulan), sampul: lama?.sampul || '', sampulKecil: lama?.sampulKecil || '',
    keteranganSampul: lama?.keteranganSampul || '', delta: lama?.delta || '[]', terbitPada: lama?.terbitPada || Date.now(), terbit: Boolean(lama?.terbit),
  };
  let slugTerkunci = Boolean(lama);
  aksi.innerHTML = `<a class="tombol tombol-garis kecil" href="#kabar">${ikon('arrow-left')}Daftar kabar</a>`;
  isi.innerHTML = `
    <div class="editor-tata">
      <div class="editor-utama">
        <textarea class="editor-judul" data-e="judul" rows="1" maxlength="160" placeholder="Judul kabar" aria-label="Judul kabar">${esc(k.judul)}</textarea>
        <textarea class="editor-ringkasan" data-e="ringkasan" maxlength="300" rows="2" placeholder="Ringkasan satu-dua kalimat (tampil di kartu kabar dan pratinjau tautan)" aria-label="Ringkasan">${esc(k.ringkasan)}</textarea>
        <div class="editor-quill"><div data-quill></div></div>
      </div>
      <aside class="editor-sisi">
        <section class="adm-kartu">
          <h2>Terbitkan</h2>
          <p class="editor-status">${k.terbit ? `${PIL_TERBIT} <a href="${BASE}kabar/${esc(k.slug)}/" target="_blank" rel="noopener">Lihat</a>` : '<span class="status" data-status="draf">Belum terbit</span>'}</p>
          <p class="editor-simpan-info" data-info-simpan>${lama ? `Terakhir diubah ${esc(waktuLalu(lama.diubah))}` : 'Belum disimpan'}</p>
          <div class="editor-tombol">
            <button class="tombol tombol-utama lebar" type="button" data-terbit>${ikon('send')}${k.terbit ? 'Perbarui kabar terbit' : 'Terbitkan'}</button>
            <button class="tombol tombol-garis lebar" type="button" data-draf>${ikon('bookmark')}Simpan sebagai draf</button>
            <button class="tombol tombol-garis lebar" type="button" data-pratinjau>${ikon('eye')}Pratinjau</button>
          </div>
          <p class="editor-ukuran" data-ukuran></p>
        </section>
        <section class="adm-kartu medan-kecil">
          <h2>Pengaturan</h2>
          <div class="medan"><label for="e-kategori">Kategori</label><select id="e-kategori" data-e="kategori">${KATEGORI_KABAR.map((x) => `<option ${x === k.kategori ? 'selected' : ''}>${x}</option>`).join('')}</select></div>
          <div class="medan"><label for="e-tanggal">Tanggal terbit</label><input id="e-tanggal" data-e="terbitPada" type="datetime-local" value="${keLokal(k.terbitPada)}"><p class="petunjuk">Bisa diisi tanggal kegiatan berlangsung.</p></div>
          <div class="medan"><label for="e-penulis">Penulis</label><input id="e-penulis" data-e="penulis" type="text" maxlength="80" value="${esc(k.penulis)}"></div>
          <label class="centang"><input type="checkbox" data-e="unggulan" ${k.unggulan ? 'checked' : ''}><span>Jadikan kabar utama di beranda</span></label>
          <div class="medan"><label for="e-slug">Alamat halaman</label><div class="slug-medan"><span class="kode">/kabar/</span><input id="e-slug" data-e="slug" type="text" maxlength="80" value="${esc(k.slug)}" ${slugTerkunci ? 'readonly' : ''} pattern="[a-z0-9-]+"></div><p class="petunjuk">${slugTerkunci ? 'Alamat dikunci sesudah disimpan agar tautan yang sudah dibagikan tidak rusak.' : 'Terisi otomatis dari judul. Alamat dikunci setelah pertama kali disimpan.'}</p></div>
        </section>
        <section class="adm-kartu medan-kecil">
          <h2>Foto sampul</h2>
          <label class="unggah sampul-unggah" data-sampul-unggah>
            <input type="file" accept="image/*" hidden data-sampul-berkas>
            <div data-sampul-pratinjau>${k.sampul ? `<img src="${k.sampul}" alt="">` : `${ikon('image')}<p><b>Pilih foto</b> (dipotong 16:9)</p>`}</div>
          </label>
          ${k.sampul ? '' : ''}
          <div class="medan"><label for="e-ket">Keterangan foto</label><input id="e-ket" data-e="keteranganSampul" type="text" maxlength="200" value="${esc(k.keteranganSampul)}" placeholder="Contoh: Bakti sosial di Pura Agung, Lampung Tengah"></div>
          <button class="tombol-teks" type="button" data-hapus-sampul ${k.sampul ? '' : 'hidden'}>${ikon('trash-2')}Hapus foto sampul</button>
        </section>
        ${lama ? `<section class="adm-kartu medan-kecil"><h2>Lainnya</h2><div class="editor-tombol">${k.terbit ? `<button class="tombol tombol-garis lebar" type="button" data-tarik>${ikon('eye-off')}Tarik dari situs</button>` : ''}<button class="tombol tombol-hapus lebar" type="button" data-hapus-kabar>${ikon('trash-2')}Hapus kabar</button></div></section>` : ''}
      </aside>
    </div>`;

  const Quill = await muatQuill();
  const q = new Quill($('[data-quill]'), {
    theme: 'snow',
    placeholder: 'Tulis isi kabar di sini. Pakai tombol gambar untuk menyisipkan foto kegiatan.',
    modules: {
      toolbar: {
        container: [[{ header: [2, 3, false] }], ['bold', 'italic', 'underline'], [{ list: 'ordered' }, { list: 'bullet' }], ['blockquote', 'link', 'image'], ['clean']],
        handlers: {
          image() {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async () => {
              const file = input.files[0];
              if (!file) return;
              try {
                const data = await kompres(file, { maks: 1280, mutu: 0.75 });
                const r = q.getSelection(true);
                q.insertEmbed(r.index, 'image', data, 'user');
                q.setSelection(r.index + 1, 0);
              } catch { roti('Gambar tidak bisa dibaca.', 'galat'); }
            };
            input.click();
          },
        },
      },
    },
  });
  try { q.setContents(JSON.parse(k.delta || '[]')); } catch { q.setContents([]); }
  // label bahasa Indonesia untuk tombol editor
  const label = { 'ql-bold': 'Tebal', 'ql-italic': 'Miring', 'ql-underline': 'Garis bawah', 'ql-blockquote': 'Kutipan', 'ql-link': 'Tautan', 'ql-image': 'Sisipkan gambar', 'ql-clean': 'Hapus format' };
  $$('.ql-toolbar button').forEach((b) => {
    const kls = [...b.classList].find((c) => label[c]);
    if (kls) b.setAttribute('aria-label', label[kls]), b.title = label[kls];
    if (b.classList.contains('ql-list')) { const t = b.value === 'ordered' ? 'Daftar bernomor' : 'Daftar butir'; b.setAttribute('aria-label', t); b.title = t; }
  });

  const E = (n) => $(`[data-e="${n}"]`);
  const kumpulkan = () => ({
    ...k,
    judul: E('judul').value.trim(),
    ringkasan: E('ringkasan').value.trim(),
    kategori: E('kategori').value,
    penulis: E('penulis').value.trim(),
    unggulan: E('unggulan').checked,
    keteranganSampul: E('keteranganSampul').value.trim(),
    slug: E('slug').value.trim(),
    terbitPada: E('terbitPada').value ? new Date(E('terbitPada').value).getTime() : Date.now(),
    delta: JSON.stringify(q.getContents().ops),
  });
  const ukurIsi = () => {
    const n = new Blob([JSON.stringify(q.getContents().ops)]).size + (k.sampul?.length || 0);
    const el = $('[data-ukuran]');
    el.textContent = `Ukuran isi ${formatUkuran(n)} dari batas ${formatUkuran(BATAS_ISI)}`;
    el.classList.toggle('lewat', n > BATAS_ISI);
    return n;
  };
  const tandaiUbah = () => { adaPerubahan = true; $('[data-info-simpan]').textContent = 'Ada perubahan yang belum disimpan'; ukurIsi(); };
  q.on('text-change', tandaiUbah);
  $$('[data-e]').forEach((el) => el.addEventListener('input', tandaiUbah));
  const tumbuh = () => { E('judul').style.height = 'auto'; E('judul').style.height = `${E('judul').scrollHeight}px`; };
  E('judul').addEventListener('input', () => { tumbuh(); if (!slugTerkunci) E('slug').value = buatSlug(E('judul').value); });
  E('judul').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.preventDefault(); });
  tumbuh();
  E('slug').addEventListener('input', () => { E('slug').value = buatSlug(E('slug').value); });
  ukurIsi();

  // sampul
  const pratinjauSampul = $('[data-sampul-pratinjau]');
  $('[data-sampul-berkas]').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    pratinjauSampul.innerHTML = `${ikon('loader-circle', 'ikon berputar')}<p>Memperkecil foto…</p>`;
    try {
      k.sampul = await kompres(file, { maks: 1600, mutu: 0.8, rasio: 16 / 9 });
      k.sampulKecil = await kompres(file, { maks: 640, mutu: 0.72, rasio: 16 / 10 });
      pratinjauSampul.innerHTML = `<img src="${k.sampul}" alt="">`;
      $('[data-hapus-sampul]').hidden = false;
      tandaiUbah();
    } catch {
      pratinjauSampul.innerHTML = `${ikon('image')}<p>Foto tidak bisa dibaca. Coba foto lain.</p>`;
    }
  });
  $('[data-hapus-sampul]').addEventListener('click', (e) => {
    k.sampul = k.sampulKecil = '';
    pratinjauSampul.innerHTML = `${ikon('image')}<p><b>Pilih foto</b> (dipotong 16:9)</p>`;
    e.currentTarget.hidden = true;
    tandaiUbah();
  });

  async function siapkan(untukTerbit) {
    const d = kumpulkan();
    if (d.judul.length < 8) throw Object.assign(new Error('Judul minimal 8 karakter.'), { pesan: 'Judul minimal 8 karakter.' });
    if (untukTerbit && deltaKeTeks(d.delta).trim().length < 40) throw Object.assign(new Error('Isi kabar masih terlalu pendek untuk diterbitkan.'), {});
    d.delta = JSON.stringify(await rampingkanGambar(q.getContents().ops));
    if (!d.ringkasan) {
      const teks = deltaKeTeks(d.delta).replace(/\s+/g, ' ').trim();
      d.ringkasan = teks.length > 180 ? `${teks.slice(0, 180).replace(/\s+\S*$/, '')}…` : teks;
    }
    if (!slugTerkunci) {
      let s = buatSlug(d.slug || d.judul) || `kabar-${Date.now()}`;
      let calon = s;
      for (let i = 2; await L.slugTerpakai(calon); i++) calon = `${s}-${i}`;
      d.slug = calon;
    }
    const ukuran = new Blob([d.delta]).size + d.sampul.length + d.sampulKecil.length;
    if (ukuran > BATAS_ISI) throw new Error(`Isi kabar ${formatUkuran(ukuran)}, melebihi batas ${formatUkuran(BATAS_ISI)}. Kurangi jumlah gambar di dalam isi.`);
    return d;
  }
  function sesudahSimpan(d, terbit) {
    adaPerubahan = false;
    Object.assign(k, d, { terbit: terbit || k.terbit });
    if (!slugTerkunci) {
      slugTerkunci = true;
      history.replaceState(null, '', `#kabar/edit/${d.slug}`);
      ruteKini = `kabar/edit/${d.slug}`;
    }
  }

  $('[data-draf]').addEventListener('click', (e) => denganMemuat(e.currentTarget, async () => {
    try {
      const d = await siapkan(false);
      await L.simpanDraf(d);
      sesudahSimpan(d, false);
      roti(k.terbit ? 'Draf perubahan disimpan. Versi terbit belum berubah.' : 'Draf disimpan.', 'berhasil');
      vEditor(d.slug);
    } catch (err) { roti(pesanGalat(err), 'galat'); }
  }));
  $('[data-terbit]').addEventListener('click', (e) => denganMemuat(e.currentTarget, async () => {
    try {
      const d = await siapkan(true);
      await L.terbitkan(d);
      sesudahSimpan(d, true);
      roti('Kabar terbit dan sudah tampil di situs.', 'berhasil');
      vEditor(d.slug);
    } catch (err) { roti(pesanGalat(err), 'galat'); }
  }));
  $('[data-pratinjau]').addEventListener('click', () => {
    const d = kumpulkan();
    bukaModal('Pratinjau kabar', `<div class="baca" style="padding:0">${susunArtikel({ kabar: { ...d, terbitPada: d.terbitPada }, isi: { delta: d.delta, sampul: k.sampul, keteranganSampul: d.keteranganSampul }, base: BASE })}</div>`, '', 860);
  });
  $('[data-tarik]')?.addEventListener('click', (e) => {
    if (!confirm('Tarik kabar ini dari situs? Kabar kembali menjadi draf dan tautannya tidak bisa dibuka pengunjung.')) return;
    denganMemuat(e.currentTarget, async () => {
      try { await L.tarikKabar(k.slug); adaPerubahan = false; roti('Kabar ditarik menjadi draf.', 'berhasil'); vEditor(k.slug); } catch (err) { roti(pesanGalat(err), 'galat'); }
    });
  });
  $('[data-hapus-kabar]')?.addEventListener('click', (e) => {
    if (!confirm(`Hapus kabar “${k.judul}” secara permanen? Tindakan ini tidak bisa dibatalkan.`)) return;
    denganMemuat(e.currentTarget, async () => {
      try { await L.hapusKabar(k.slug); adaPerubahan = false; roti('Kabar dihapus.', 'berhasil'); location.hash = 'kabar'; } catch (err) { roti(pesanGalat(err), 'galat'); }
    });
  });
}

// ======================================================================
// ADUAN & ASPIRASI
// ======================================================================
const saringan = { aduan: {}, aspirasi: {} };

function terapkanSaring(daftar, s) {
  const q = (s.cari || '').toLowerCase();
  const dari = s.dari ? new Date(s.dari).getTime() : 0;
  const sampai = s.sampai ? new Date(s.sampai).getTime() + 86400000 : Infinity;
  return daftar.filter((l) =>
    (!s.status || l.status === s.status) &&
    (!s.kategori || l.kategori === s.kategori || l.bidang === s.kategori) &&
    (!s.provinsi || l.lokasi?.provinsi === s.provinsi) &&
    (!s.mendesak || l.mendesak) &&
    (!s.perhatian || perluPerhatian(l)) &&
    l.dibuat >= dari && l.dibuat < sampai &&
    (!q || `${l.nomor} ${l.judul} ${l.pelapor?.nama} ${l.pelapor?.email} ${l.lokasi?.kota}`.toLowerCase().includes(q)));
}

async function vLaporan(jenis, paksa = false) {
  setJudul(jenis === 'aduan' ? 'Aduan' : 'Aspirasi');
  const semua = (await ambilLaporan(paksa)).filter((l) => l.jenis === jenis);
  const s = saringan[jenis];
  aksi.innerHTML = `
    <button class="tombol tombol-garis kecil" type="button" data-segarkan>${ikon('refresh-cw')}Muat ulang</button>
    <button class="tombol tombol-garis kecil" type="button" data-cetak>${ikon('printer')}Cetak rekap</button>
    <button class="tombol tombol-utama kecil" type="button" data-unduh>${ikon('file-spreadsheet')}Unduh Excel</button>`;
  const pilihanKat = jenis === 'aduan' ? KATEGORI_ADUAN.map((k) => [k.kunci, k.nama]) : [...BIDANG.map((b) => [b.kunci, b.nama]), ['umum', 'Umum']];
  isi.innerHTML = `
    <form class="adm-saring" data-saring>
      <label class="cari"><span class="sr-only">Cari</span>${ikon('search')}<input type="search" name="cari" placeholder="Cari nomor, judul, pelapor, kota" value="${esc(s.cari || '')}"></label>
      <select name="status" aria-label="Status"><option value="">Semua status</option>${Object.entries(STATUS_LAPORAN).map(([k, v]) => `<option value="${k}" ${s.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <select name="kategori" aria-label="${jenis === 'aduan' ? 'Jenis persoalan' : 'Bidang'}"><option value="">${jenis === 'aduan' ? 'Semua jenis persoalan' : 'Semua bidang'}</option>${pilihanKat.map(([k, v]) => `<option value="${k}" ${s.kategori === k ? 'selected' : ''}>${esc(v)}</option>`).join('')}</select>
      <select name="provinsi" aria-label="Provinsi"><option value="">Semua provinsi</option>${PROVINSI.map((p) => `<option ${s.provinsi === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
      <label class="adm-rentang"><span>Dari</span><input type="date" name="dari" value="${esc(s.dari || '')}"></label>
      <label class="adm-rentang"><span>Sampai</span><input type="date" name="sampai" value="${esc(s.sampai || '')}"></label>
      ${jenis === 'aduan' ? `<label class="centang"><input type="checkbox" name="mendesak" ${s.mendesak ? 'checked' : ''}><span>Mendesak</span></label>` : ''}
      <label class="centang"><input type="checkbox" name="perhatian" ${s.perhatian ? 'checked' : ''}><span>Perlu perhatian</span></label>
      <button class="tombol-teks" type="reset">Hapus saringan</button>
    </form>
    <p class="adm-hitung" data-hitung></p>
    <div data-tabel></div>`;
  const form = $('[data-saring]');
  const gambar = () => {
    const hasil = terapkanSaring(semua, s);
    $('[data-hitung]').textContent = `Menampilkan ${hasil.length} dari ${semua.length} ${jenis}`;
    $('[data-tabel]').innerHTML = hasil.length
      ? `<div class="tabel-wadah"><table class="tabel adm-tabel adm-tabel-klik">
        <thead><tr><th>Nomor</th><th>${jenis === 'aduan' ? 'Aduan' : 'Aspirasi'}</th><th>${jenis === 'aduan' ? 'Jenis' : 'Bidang'}</th><th>Provinsi</th><th>Status</th><th>Masuk</th></tr></thead>
        <tbody>${hasil.map((l) => `<tr data-buka="${l.id}" tabindex="0">
          <td class="kode">${esc(l.nomor)}</td>
          <td><a class="adm-tautan-judul" href="#laporan/${l.id}">${esc(l.judul)}</a><small>${esc(l.pelapor?.nama || '-')}${l.jumlahLampiran ? ` · ${l.jumlahLampiran} lampiran` : ''}</small></td>
          <td>${esc(jenis === 'aduan' ? namaKategori(l.kategori) : namaBidang(l.bidang))}</td>
          <td>${esc(l.lokasi?.provinsi || '-')}</td>
          <td><div class="adm-tanda">${pilStatus(l.status)}${l.mendesak ? '<span class="status" data-status="mendesak">Mendesak</span>' : ''}${l.balasanPelapor && (!l.dibacaAdmin || l.balasanPelapor > l.dibacaAdmin) ? '<span class="status" data-status="ditinjau">Balasan baru</span>' : ''}</div></td>
          <td>${esc(tanggalPendek(l.dibuat))}</td>
        </tr>`).join('')}</tbody></table></div>`
      : `<div class="kosong"><h3>${semua.length ? 'Tidak ada yang cocok dengan saringan' : `Belum ada ${jenis}`}</h3><p>${semua.length ? 'Ubah atau hapus saringan untuk melihat data lain.' : `${jenis === 'aduan' ? 'Aduan' : 'Aspirasi'} yang dikirim umat lewat situs akan muncul di sini.`}</p></div>`;
    return hasil;
  };
  const baca = () => {
    const d = new FormData(form);
    Object.assign(s, { cari: d.get('cari'), status: d.get('status'), kategori: d.get('kategori'), provinsi: d.get('provinsi'), dari: d.get('dari'), sampai: d.get('sampai'), mendesak: d.get('mendesak') === 'on', perhatian: d.get('perhatian') === 'on' });
    gambar();
  };
  form.addEventListener('input', baca);
  form.addEventListener('reset', () => setTimeout(() => { Object.keys(s).forEach((k) => delete s[k]); baca(); }));
  form.addEventListener('submit', (e) => e.preventDefault());
  $('[data-tabel]').addEventListener('click', (e) => { const tr = e.target.closest('[data-buka]'); if (tr && !e.target.closest('a')) location.hash = `laporan/${tr.dataset.buka}`; });
  $('[data-tabel]').addEventListener('keydown', (e) => { const tr = e.target.closest('[data-buka]'); if (tr && e.key === 'Enter') location.hash = `laporan/${tr.dataset.buka}`; });
  gambar();
  $('[data-segarkan]').addEventListener('click', () => { segarkanLencana(); vLaporan(jenis, true); });
  $('[data-unduh]').addEventListener('click', () => unduhLaporan(jenis, terapkanSaring(semua, s)));
  $('[data-cetak]').addEventListener('click', () => cetakRekap(jenis, terapkanSaring(semua, s), s));
}

function barisExcelLaporan(l) {
  return [
    l.nomor, l.jenis === 'aduan' ? 'Aduan' : 'Aspirasi', STATUS_LAPORAN[l.status] || l.status, l.mendesak ? 'Ya' : 'Tidak',
    l.jenis === 'aduan' ? namaKategori(l.kategori) : namaBidang(l.bidang), l.judul, l.uraian,
    l.lokasi?.provinsi || '', l.lokasi?.kota || '', l.lokasi?.alamat || '', l.tanggalKejadian || '', l.pihak || '',
    (l.bantuan || []).map(namaBantuan).join(', '), l.pelapor?.nama || '', l.pelapor?.email || '', l.wa || l.pelapor?.wa || '',
    l.rahasia ? 'Ya' : 'Tidak', tanggalJam(l.dibuat), tanggalJam(l.diubah), l.ditangani || '', l.jumlahLampiran || 0,
  ];
}
function unduhLaporan(jenis, daftar) {
  if (!daftar.length) return roti('Tidak ada data untuk diunduh.', 'galat');
  const kol = [['Nomor', 16], ['Jenis', 10], ['Status', 16], ['Mendesak', 10], [jenis === 'aduan' ? 'Jenis persoalan' : 'Bidang', 26], ['Judul', 40], ['Uraian', 70], ['Provinsi', 18], ['Kab/Kota', 18], ['Tempat', 26], ['Tanggal kejadian', 14], ['Pihak terlibat', 26], ['Bantuan diharapkan', 30], ['Nama pelapor', 22], ['Email', 26], ['WhatsApp', 16], ['Identitas dirahasiakan', 12], ['Dikirim', 20], ['Diperbarui', 20], ['Ditangani', 18], ['Lampiran', 10]].map(([judul, lebar]) => ({ judul, lebar }));
  const rekap = (label, data) => [[label, ''], ...data.map((d) => [d.label, d.nilai]), ['', '']];
  const ringkas = [
    ...rekap('Menurut status', hitungMenurut(daftar, (l) => STATUS_LAPORAN[l.status])),
    ...rekap(jenis === 'aduan' ? 'Menurut jenis persoalan' : 'Menurut bidang', hitungMenurut(daftar, (l) => (jenis === 'aduan' ? namaKategori(l.kategori) : namaBidang(l.bidang)))),
    ...rekap('Menurut provinsi', hitungMenurut(daftar, (l) => l.lokasi?.provinsi)),
  ];
  const blob = buatXlsx([
    { nama: jenis === 'aduan' ? 'Aduan' : 'Aspirasi', kolom: kol, baris: daftar.map(barisExcelLaporan) },
    { nama: 'Ringkasan', kolom: [{ judul: 'Rekap', lebar: 40 }, { judul: 'Jumlah', lebar: 12 }], baris: ringkas },
  ]);
  unduhBlob(blob, `rekap-${jenis}-persadha-${new Date().toISOString().slice(0, 10)}.xlsx`);
  roti(`${daftar.length} ${jenis} diunduh sebagai Excel.`, 'berhasil');
}

function cetakRekap(jenis, daftar, s) {
  const w = window.open('', '_blank');
  if (!w) return roti('Peramban memblokir jendela cetak. Izinkan pop-up lalu coba lagi.', 'galat');
  const keterangan = [s.status && STATUS_LAPORAN[s.status], s.kategori && (jenis === 'aduan' ? namaKategori(s.kategori) : namaBidang(s.kategori)), s.provinsi, s.dari && `dari ${s.dari}`, s.sampai && `sampai ${s.sampai}`, s.mendesak && 'mendesak'].filter(Boolean).join(' · ') || 'Semua data';
  const tabelRekap = (judulR, data) => `<h3>${judulR}</h3><table><tbody>${data.map((d) => `<tr><td>${esc(d.label)}</td><td style="text-align:right">${d.nilai}</td></tr>`).join('')}</tbody></table>`;
  w.document.write(`<!doctype html><html lang="id"><head><meta charset="utf-8"><title>Rekap ${jenis} — Persadha Nusantara</title><style>
    body{font-family:'Segoe UI',Arial,sans-serif;font-size:11px;color:#1d1817;margin:24px}h1{font-size:18px;margin:0}h2{font-size:13px;font-weight:normal;color:#5a514d;margin:4px 0 16px}h3{font-size:12px;margin:16px 0 6px}
    table{border-collapse:collapse;width:100%}td,th{border:1px solid #ccc;padding:5px 6px;text-align:left;vertical-align:top}th{background:#8f1d21;color:#fff}.rekap{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;margin-bottom:16px}.kepala{display:flex;gap:12px;align-items:center;border-bottom:2px solid #8f1d21;padding-bottom:10px;margin-bottom:12px}
    @page{size:A4 landscape;margin:12mm}</style></head><body>
    <div class="kepala"><img src="${ASAL}aset/img/lambang.svg" width="34"><div><h1>Rekap ${jenis === 'aduan' ? 'Aduan' : 'Aspirasi'} — DPP Persadha Nusantara</h1><h2>${esc(keterangan)} · ${daftar.length} data · dicetak ${esc(tanggalJam(Date.now()))} oleh ${esc(saya.nama)}</h2></div></div>
    <div class="rekap">${tabelRekap('Menurut status', hitungMenurut(daftar, (l) => STATUS_LAPORAN[l.status]))}${tabelRekap(jenis === 'aduan' ? 'Menurut jenis persoalan' : 'Menurut bidang', hitungMenurut(daftar, (l) => (jenis === 'aduan' ? namaKategori(l.kategori) : namaBidang(l.bidang))))}${tabelRekap('Menurut provinsi', hitungMenurut(daftar, (l) => l.lokasi?.provinsi).slice(0, 12))}</div>
    <table><thead><tr><th>Nomor</th><th>Masuk</th><th>Judul</th><th>${jenis === 'aduan' ? 'Jenis' : 'Bidang'}</th><th>Lokasi</th><th>Pelapor</th><th>Status</th></tr></thead><tbody>
    ${daftar.map((l) => `<tr><td>${esc(l.nomor)}</td><td>${esc(tanggalPendek(l.dibuat))}</td><td>${esc(l.judul)}${l.mendesak ? ' <b>(mendesak)</b>' : ''}</td><td>${esc(l.jenis === 'aduan' ? namaKategori(l.kategori) : namaBidang(l.bidang))}</td><td>${esc([l.lokasi?.kota, l.lokasi?.provinsi].filter(Boolean).join(', '))}</td><td>${esc(l.rahasia ? `${l.pelapor?.nama} (rahasia)` : l.pelapor?.nama)}</td><td>${esc(STATUS_LAPORAN[l.status])}</td></tr>`).join('')}
    </tbody></table><script>onload=()=>setTimeout(()=>print(),300)<\/script></body></html>`);
  w.document.close();
}

async function vDetailLaporan(id) {
  const lap = await ambilLaporan();
  let l = lap.find((x) => x.id === id) || (await L.ambilLaporan(id));
  if (!l) { isi.innerHTML = `<div class="kosong"><h3>Laporan tidak ditemukan</h3><p><a href="#aduan">Kembali ke daftar aduan</a></p></div>`; return; }
  setJudul(l.nomor);
  $$('[data-rute]').forEach((el) => el.toggleAttribute('aria-current', el.dataset.rute === l.jenis));
  aksi.innerHTML = `<a class="tombol tombol-garis kecil" href="#${l.jenis}">${ikon('arrow-left')}Daftar ${l.jenis}</a>`;
  const [tg, catatan] = await Promise.all([L.tanggapan(id), L.catatanInternal(id)]);
  // tandai sudah dibaca pengurus
  if (perluPerhatian(l) && l.status !== 'baru') L.ubahLaporan(id, { dibacaAdmin: true }).then(() => { l.dibacaAdmin = Date.now(); segarkanLencana(); }).catch(() => {});
  const wa = l.wa || l.pelapor?.wa;
  isi.innerHTML = `
    <div class="detail-laporan adm-detail">
      <div>
        <div class="detail-kepala"><span class="kode">${esc(l.nomor)}</span>${pilStatus(l.status)}${l.mendesak ? '<span class="status" data-status="mendesak">Mendesak</span>' : ''}<span>${l.jenis === 'aduan' ? esc(namaKategori(l.kategori)) : esc(namaBidang(l.bidang))}</span></div>
        <h2 class="detail-judul">${esc(l.judul)}</h2>
        ${langkahStatus(l.status)}
        <h3 class="sub-judul">${l.jenis === 'aduan' ? 'Kronologi' : 'Uraian'}</h3>
        <p class="teks-panjang">${esc(l.uraian)}</p>
        <h3 class="sub-judul">Lampiran</h3>
        <div data-lampiran>${l.jumlahLampiran ? '<div class="kerangka" style="height:90px"></div>' : '<p class="petunjuk" style="color:var(--tinta-2)">Tidak ada lampiran.</p>'}</div>
        <h3 class="sub-judul">Percakapan dengan pelapor</h3>
        ${liniTanggapan(tg, { kosong: 'Belum ada tanggapan. Pesan yang Anda kirim di bawah akan dibaca pelapor di akunnya.' })}
        <form class="formulir adm-tanggap" data-tanggap>
          <div class="medan"><label for="t-pesan">Tanggapi pelapor</label><textarea id="t-pesan" name="pesan" rows="4" maxlength="3000" placeholder="Contoh: Terima kasih, aduan sudah kami terima. Mohon kirimkan foto surat penolakan izin bila ada."></textarea></div>
          <div class="adm-tanggap-baris">
            <div class="medan"><label for="t-status">Ubah status</label><select id="t-status" name="status">${Object.entries(STATUS_LAPORAN).map(([k, v]) => `<option value="${k}" ${k === l.status ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
            <button class="tombol tombol-utama" type="submit">${ikon('send')}Kirim</button>
          </div>
          <p class="petunjuk">Pesan dan perubahan status tampil di akun pelapor.</p>
        </form>
        <h3 class="sub-judul">${ikon('lock')} Catatan internal pengurus</h3>
        <div class="adm-catatan-internal">
          ${catatan.length ? `<ol class="lini">${catatan.map((c) => `<li><div class="lini-kepala"><b>${esc(c.oleh)}</b><span>${esc(tanggalJam(c.dibuat))}</span></div><p>${esc(c.teks)}</p></li>`).join('')}</ol>` : '<p class="petunjuk" style="color:var(--tinta-2)">Belum ada catatan. Catatan ini tidak terlihat oleh pelapor.</p>'}
          <form class="formulir" data-catatan style="gap:10px;margin-top:12px"><div class="medan"><label class="sr-only" for="c-teks">Catatan internal</label><textarea id="c-teks" name="teks" rows="3" maxlength="3000" placeholder="Hasil rapat, nomor surat, kontak pihak terkait…"></textarea></div><div><button class="tombol tombol-garis kecil" type="submit">${ikon('plus')}Tambah catatan</button></div></form>
        </div>
      </div>
      <aside class="adm-kartu">
        ${rincianLaporan(l, { admin: true })}
        <div class="editor-tombol" style="margin-top:16px">
          ${wa ? `<a class="tombol tombol-utama lebar" href="https://wa.me/${esc(waIntl(wa))}?text=${encodeURIComponent(`Salam, kami dari DPP Persadha Nusantara terkait laporan ${l.nomor}.`)}" target="_blank" rel="noopener">${ikon('whatsapp')}Hubungi lewat WhatsApp</a>` : ''}
          <a class="tombol tombol-garis lebar" href="mailto:${esc(l.pelapor?.email)}?subject=${encodeURIComponent(`Laporan ${l.nomor} — Persadha Nusantara`)}">${ikon('mail')}Kirim email</a>
          <button class="tombol tombol-garis lebar" type="button" data-unduh-satu>${ikon('download')}Unduh sebagai Excel</button>
        </div>
      </aside>
    </div>`;
  if (l.jumlahLampiran) {
    L.lampiran(id).then((daftar) => {
      const w = $('[data-lampiran]');
      w.innerHTML = lampiranHtml(daftar);
      w.addEventListener('click', (e) => { const b = e.target.closest('[data-buka-lampiran]'); if (b) bukaDataUrl(daftar[Number(b.dataset.bukaLampiran)].data); });
    }).catch(() => ($('[data-lampiran]').innerHTML = '<p class="medan-galat">Lampiran gagal dimuat.</p>'));
  }
  $('[data-tanggap]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    const pesan = f.pesan.value.trim();
    const status = f.status.value;
    if (!pesan && status === l.status) return roti('Tulis tanggapan atau ubah status terlebih dahulu.', 'galat');
    denganMemuat($('[type=submit]', f), async () => {
      try {
        await L.kirimTanggapan(id, pesan || `Status diperbarui menjadi “${STATUS_LAPORAN[status]}”.`, { status: status !== l.status ? status : null });
        cache.laporan = null;
        roti('Tanggapan terkirim.', 'berhasil');
        segarkanLencana();
        vDetailLaporan(id);
      } catch (err) { roti(pesanGalat(err), 'galat'); }
    });
  });
  $('[data-catatan]').addEventListener('submit', (e) => {
    e.preventDefault();
    const teks = e.currentTarget.teks.value.trim();
    if (!teks) return;
    denganMemuat($('[type=submit]', e.currentTarget), async () => {
      try { await L.tambahCatatan(id, teks); vDetailLaporan(id); } catch (err) { roti(pesanGalat(err), 'galat'); }
    });
  });
  $('[data-unduh-satu]').addEventListener('click', () => unduhLaporan(l.jenis, [l]));
}

// ======================================================================
// ANGGOTA
// ======================================================================
const saringAnggota = {};
async function vAnggota(bukaUid, paksa = false) {
  setJudul('Anggota');
  const semua = await ambilAnggota(paksa);
  aksi.innerHTML = `<button class="tombol tombol-garis kecil" type="button" data-segarkan>${ikon('refresh-cw')}Muat ulang</button><button class="tombol tombol-utama kecil" type="button" data-unduh>${ikon('file-spreadsheet')}Unduh Excel</button>`;
  const s = saringAnggota;
  isi.innerHTML = `
    <div class="adm-ubin adm-ubin-kecil">${Object.entries(STATUS_ANGGOTA).map(([k, v]) => `<div class="ubin"><span class="ubin-angka">${semua.filter((a) => a.status === k).length}</span><span class="ubin-judul">${v}</span></div>`).join('')}</div>
    <form class="adm-saring" data-saring>
      <label class="cari"><span class="sr-only">Cari</span>${ikon('search')}<input type="search" name="cari" placeholder="Cari nama, nomor, email, kota" value="${esc(s.cari || '')}"></label>
      <select name="status" aria-label="Status"><option value="">Semua status</option>${Object.entries(STATUS_ANGGOTA).map(([k, v]) => `<option value="${k}" ${s.status === k ? 'selected' : ''}>${v}</option>`).join('')}</select>
      <select name="provinsi" aria-label="Provinsi"><option value="">Semua provinsi</option>${PROVINSI.map((p) => `<option ${s.provinsi === p ? 'selected' : ''}>${p}</option>`).join('')}</select>
      <select name="bidang" aria-label="Bidang"><option value="">Semua bidang</option>${BIDANG.map((b) => `<option value="${b.kunci}" ${s.bidang === b.kunci ? 'selected' : ''}>${esc(b.nama)}</option>`).join('')}</select>
    </form>
    <p class="adm-hitung" data-hitung></p>
    <div data-tabel></div>`;
  const saring = () => semua.filter((a) => (!s.status || a.status === s.status) && (!s.provinsi || a.provinsi === s.provinsi) && (!s.bidang || (a.bidang || []).includes(s.bidang)) && (!s.cari || `${a.nama} ${a.nomorAnggota} ${a.email} ${a.kota}`.toLowerCase().includes(s.cari.toLowerCase())));
  const gambar = () => {
    const h = saring();
    $('[data-hitung]').textContent = `Menampilkan ${h.length} dari ${semua.length} pendaftar`;
    $('[data-tabel]').innerHTML = h.length ? `<div class="tabel-wadah"><table class="tabel adm-tabel adm-tabel-klik"><thead><tr><th>Nama</th><th>Domisili</th><th>Bidang</th><th>Status</th><th>Daftar</th></tr></thead><tbody>${h.map((a) => `<tr data-buka="${a.id}" tabindex="0"><td><b>${esc(a.nama)}</b><small>${esc(a.nomorAnggota || a.email)}</small></td><td>${esc([a.kota, a.provinsi].filter(Boolean).join(', '))}</td><td>${esc((a.bidang || []).map((b) => namaBidang(b).split(',')[0]).join('; '))}</td><td>${pilAnggota(a.status)}</td><td>${esc(tanggalPendek(a.dibuat))}</td></tr>`).join('')}</tbody></table></div>` : `<div class="kosong"><h3>${semua.length ? 'Tidak ada yang cocok' : 'Belum ada pendaftar'}</h3><p>${semua.length ? 'Ubah saringan untuk melihat pendaftar lain.' : 'Umat yang mendaftar lewat halaman Keanggotaan akan muncul di sini.'}</p></div>`;
  };
  $('[data-saring]').addEventListener('input', (e) => { const d = new FormData(e.currentTarget); Object.assign(s, { cari: d.get('cari'), status: d.get('status'), provinsi: d.get('provinsi'), bidang: d.get('bidang') }); gambar(); });
  $('[data-saring]').addEventListener('submit', (e) => e.preventDefault());
  const buka = (uid) => { const a = semua.find((x) => x.id === uid); if (a) detailAnggota(a); };
  $('[data-tabel]').addEventListener('click', (e) => { const tr = e.target.closest('[data-buka]'); if (tr) buka(tr.dataset.buka); });
  $('[data-tabel]').addEventListener('keydown', (e) => { const tr = e.target.closest('[data-buka]'); if (tr && e.key === 'Enter') buka(tr.dataset.buka); });
  $('[data-segarkan]').addEventListener('click', () => { segarkanLencana(); vAnggota(null, true); });
  $('[data-unduh]').addEventListener('click', () => {
    const h = saring();
    if (!h.length) return roti('Tidak ada data untuk diunduh.', 'galat');
    const kol = ['Nomor anggota', 'Nama', 'Jenis kelamin', 'Tanggal lahir', 'WhatsApp', 'Email', 'Pekerjaan', 'Provinsi', 'Kab/Kota', 'Alamat', 'Bidang', 'Alasan bergabung', 'Status', 'Daftar', 'Diputuskan'].map((judul) => ({ judul, lebar: judul === 'Alasan bergabung' ? 50 : judul === 'Bidang' ? 40 : 20 }));
    unduhBlob(buatXlsx([{ nama: 'Anggota', kolom: kol, baris: h.map((a) => [a.nomorAnggota || '', a.nama, a.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki', a.tanggalLahir || '', a.wa || '', a.email || '', a.pekerjaan || '', a.provinsi || '', a.kota || '', a.alamat || '', (a.bidang || []).map(namaBidang).join('; '), a.alasan || '', STATUS_ANGGOTA[a.status] || a.status, tanggalJam(a.dibuat), tanggalJam(a.diputuskan)]) }]), `anggota-persadha-${new Date().toISOString().slice(0, 10)}.xlsx`);
  });
  gambar();
  if (bukaUid) buka(bukaUid);
}

function detailAnggota(a) {
  const baris = [['Nomor anggota', a.nomorAnggota || '—'], ['Email', a.email], ['WhatsApp', a.wa], ['Jenis kelamin', a.jenisKelamin === 'P' ? 'Perempuan' : 'Laki-laki'], ['Tanggal lahir', a.tanggalLahir ? tanggal(Date.parse(a.tanggalLahir)) : ''], ['Pekerjaan', a.pekerjaan], ['Domisili', [a.alamat, a.kota, a.provinsi].filter(Boolean).join(', ')], ['Bidang', (a.bidang || []).map(namaBidang).join('; ')], ['Alasan', a.alasan], ['Daftar', tanggalJam(a.dibuat)]];
  bukaModal(a.nama, `
    ${a.status === 'diterima' ? `<div style="margin-bottom:20px">${kartuAnggota(a)}</div>` : `<p>${pilAnggota(a.status)}</p>`}
    <dl class="rincian">${baris.filter(([, v]) => v).map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
    <div class="medan" style="margin-top:18px"><label for="m-catatan">Catatan untuk pendaftar</label><textarea id="m-catatan" rows="3" maxlength="500" placeholder="Wajib diisi bila pendaftaran belum diterima, misalnya data yang perlu dilengkapi.">${esc(a.catatanAdmin || '')}</textarea></div>`,
    `${a.wa ? `<a class="tombol tombol-garis kecil" href="https://wa.me/${esc(waIntl(a.wa))}" target="_blank" rel="noopener">${ikon('whatsapp')}WhatsApp</a>` : ''}
     <button class="tombol tombol-hapus kecil" type="button" data-putus="ditolak">Belum diterima</button>
     <button class="tombol tombol-utama kecil" type="button" data-putus="diterima">${a.status === 'diterima' ? 'Simpan' : 'Terima sebagai anggota'}</button>`, 640);
  $$('[data-putus]', modal).forEach((b) => b.addEventListener('click', () => {
    const status = b.dataset.putus;
    const catatanAdmin = $('#m-catatan').value.trim();
    if (status === 'ditolak' && !catatanAdmin) { $('#m-catatan').focus(); return roti('Tulis catatan agar pendaftar tahu apa yang perlu diperbaiki.', 'galat'); }
    denganMemuat(b, async () => {
      try {
        const nomor = await L.putuskanAnggota(a.id, { status, catatanAdmin });
        roti(status === 'diterima' ? `Diterima dengan nomor ${nomor}.` : 'Pendaftar diberi catatan perbaikan.', 'berhasil');
        modal.close();
        segarkanLencana();
        vAnggota(null, true);
      } catch (err) { roti(pesanGalat(err), 'galat'); }
    });
  }));
}

// ======================================================================
// PENGGUNA & PENGURUS
// ======================================================================
async function vPengguna() {
  setJudul('Pengguna & pengurus');
  const [pengguna, admin] = await Promise.all([L.semuaPengguna(), L.daftarAdmin()]);
  aksi.innerHTML = `<button class="tombol tombol-utama kecil" type="button" data-unduh>${ikon('file-spreadsheet')}Unduh Excel</button>`;
  const utama = (KONFIG.adminUtama || []);
  isi.innerHTML = `
    <section class="adm-kartu" style="margin-bottom:24px">
      <h2>Pengurus dengan akses panel</h2>
      <ul class="adm-daftar-admin">
        ${utama.map((e) => `<li><span><b>${esc(e)}</b><small>Pengurus utama (diatur di konfigurasi situs)</small></span></li>`).join('')}
        ${admin.filter((a) => !utama.includes(a.email)).map((a) => `<li><span><b>${esc(a.nama || a.email)}</b><small>${esc(a.email)} · ditambahkan ${esc(tanggalPendek(a.ditambahkan))}${a.oleh ? ` oleh ${esc(a.oleh)}` : ''}</small></span>${a.id !== saya.uid ? `<button class="tombol tombol-hapus kecil" type="button" data-cabut="${a.id}">Cabut akses</button>` : '<span class="status">Anda</span>'}</li>`).join('')}
      </ul>
      <form class="adm-tambah-admin" data-tambah-admin>
        <div class="medan"><label for="ta-email">Tambah pengurus</label><input id="ta-email" name="email" type="email" required placeholder="email@contoh.com"><p class="petunjuk">Orangnya harus sudah membuat akun di situs ini.</p></div>
        <button class="tombol tombol-utama" type="submit">${ikon('user-check')}Beri akses</button>
      </form>
    </section>
    <section>
      <div class="adm-saring"><label class="cari"><span class="sr-only">Cari pengguna</span>${ikon('search')}<input type="search" data-cari-pengguna placeholder="Cari nama atau email"></label></div>
      <p class="adm-hitung" data-hitung></p>
      <div data-tabel></div>
    </section>`;
  const gambar = () => {
    const q = $('[data-cari-pengguna]').value.toLowerCase();
    const h = pengguna.filter((u) => !q || `${u.nama} ${u.email}`.toLowerCase().includes(q));
    $('[data-hitung]').textContent = `${h.length} dari ${pengguna.length} akun terdaftar`;
    $('[data-tabel]').innerHTML = `<div class="tabel-wadah"><table class="tabel adm-tabel"><thead><tr><th>Nama</th><th>WhatsApp</th><th>Domisili</th><th>Daftar</th><th>Status</th><th><span class="sr-only">Aksi</span></th></tr></thead><tbody>${h.map((u) => `<tr><td><b>${esc(u.nama)}</b><small>${esc(u.email)}</small></td><td>${esc(u.wa || '-')}</td><td>${esc([u.kota, u.provinsi].filter(Boolean).join(', ') || '-')}</td><td>${esc(tanggalPendek(u.dibuat))}</td><td><div class="adm-tanda">${u.admin ? '<span class="status" data-status="terbit">Pengurus</span>' : ''}${u.diblokir ? '<span class="status" data-status="mendesak">Diblokir</span>' : ''}</div></td><td class="adm-aksi-sel">${u.id !== saya.uid && !u.admin ? `<button class="tombol ${u.diblokir ? 'tombol-garis' : 'tombol-hapus'} kecil" type="button" data-blokir="${u.id}" data-nilai="${u.diblokir ? '0' : '1'}">${u.diblokir ? 'Buka blokir' : 'Blokir'}</button>` : ''}</td></tr>`).join('')}</tbody></table></div>`;
  };
  $('[data-cari-pengguna]').addEventListener('input', gambar);
  gambar();
  $('[data-tabel]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-blokir]');
    if (!b) return;
    const blokir = b.dataset.nilai === '1';
    if (blokir && !confirm('Blokir akun ini? Pemiliknya tidak bisa lagi mengirim aduan, aspirasi, atau pendaftaran anggota.')) return;
    denganMemuat(b, async () => { try { await L.aturBlokir(b.dataset.blokir, blokir); roti(blokir ? 'Akun diblokir.' : 'Blokir dibuka.', 'berhasil'); vPengguna(); } catch (err) { roti(pesanGalat(err), 'galat'); } });
  });
  $$('[data-cabut]').forEach((b) => b.addEventListener('click', () => {
    if (!confirm('Cabut akses panel pengurus untuk akun ini?')) return;
    denganMemuat(b, async () => { try { await L.hapusAdmin(b.dataset.cabut); roti('Akses dicabut.', 'berhasil'); vPengguna(); } catch (err) { roti(pesanGalat(err), 'galat'); } });
  }));
  $('[data-tambah-admin]').addEventListener('submit', (e) => {
    e.preventDefault();
    const f = e.currentTarget;
    denganMemuat($('[type=submit]', f), async () => { try { await L.tambahAdmin(f.email.value); roti('Akses pengurus diberikan.', 'berhasil'); vPengguna(); } catch (err) { roti(pesanGalat(err), 'galat'); } });
  });
  $('[data-unduh]').addEventListener('click', () => unduhBlob(buatXlsx([{ nama: 'Pengguna', kolom: ['Nama', 'Email', 'WhatsApp', 'Provinsi', 'Kab/Kota', 'Daftar', 'Pengurus', 'Diblokir'].map((judul) => ({ judul, lebar: 24 })), baris: pengguna.map((u) => [u.nama, u.email, u.wa || '', u.provinsi || '', u.kota || '', tanggalJam(u.dibuat), u.admin ? 'Ya' : '', u.diblokir ? 'Ya' : '']) }]), `pengguna-persadha-${new Date().toISOString().slice(0, 10)}.xlsx`));
}

// ======================================================================
// SISTEM
// ======================================================================
async function vSistem() {
  setJudul('Sistem');
  const fb = KONFIG.firebase || {};
  isi.innerHTML = `
    <div class="adm-kisi-2">
      <section class="adm-kartu">
        <h2>Status layanan</h2>
        <dl class="rincian">
          <dt>Mode</dt><dd>${MODE === 'firebase' ? '<span class="status" data-status="terbit">Terhubung ke Firebase</span>' : '<span class="status" data-status="draf">Demo (data di peramban ini)</span>'}</dd>
          <dt>Proyek Firebase</dt><dd class="kode">${esc(fb.projectId || '— belum diisi —')}</dd>
          <dt>Alamat situs</dt><dd><a href="${ASAL}" target="_blank" rel="noopener">${esc(ASAL)}</a></dd>
          <dt>Email notifikasi</dt><dd>${esc(KONFIG.notifikasi?.emailAduanBaru || '— tidak aktif —')}</dd>
        </dl>
        <button class="tombol tombol-garis kecil" type="button" data-periksa style="margin-top:16px">${ikon('shield-check')}Periksa koneksi</button>
        <div data-hasil-periksa style="margin-top:14px"></div>
      </section>
      <section class="adm-kartu">
        <h2>Cara kerja situs</h2>
        <ul class="adm-poin">
          <li>Situs disajikan GitHub Pages tanpa server sendiri. Akun, aduan, dan kabar disimpan di Cloud Firestore.</li>
          <li>Kabar baru langsung tampil di beranda. Halaman statis per kabar dibangun ulang otomatis tiap jam oleh GitHub Actions.</li>
          <li>Aduan hanya bisa dibaca pelapor dan pengurus; aturan aksesnya ada di berkas <span class="kode">firestore.rules</span>.</li>
          <li>Unduh rekap Excel secara berkala sebagai cadangan arsip organisasi.</li>
        </ul>
        ${MODE === 'demo' ? `<div class="pesan pesan-peringatan" style="margin-top:16px">${ikon('triangle-alert')}<div><p>Data demo hanya ada di peramban ini.</p><p style="margin-top:8px"><button class="tombol tombol-hapus kecil" type="button" data-setel-demo>Hapus semua data demo</button></p></div></div>` : ''}
      </section>
    </div>`;
  $('[data-setel-demo]')?.addEventListener('click', async () => {
    if (!confirm('Hapus semua akun, aduan, dan kabar demo di peramban ini?')) return;
    const { setelUlangDemo } = await import('./demo.js');
    setelUlangDemo();
    location.href = BASE;
  });
  $('[data-periksa]').addEventListener('click', (e) => denganMemuat(e.currentTarget, async () => {
    const hasil = [];
    const uji = async (nama, fn) => {
      try { const pesan = await fn(); hasil.push({ nama, ok: true, pesan }); } catch (err) { hasil.push({ nama, ok: false, pesan: pesanGalat(err), tautan: err.tautanIndeks }); }
    };
    const { daftarKabar } = await import('./publik.js');
    await uji('Membaca kabar publik', async () => `${(await daftarKabar({ batas: 3 })).length} kabar terbaca`);
    await uji('Saring kabar per kategori', async () => {
      if (MODE !== 'firebase') return 'mode demo';
      const { kueriKabar } = await import('./rest.js');
      await kueriKabar({ projectId: fb.projectId, apiKey: fb.apiKey, batas: 1, kategori: 'Kegiatan' });
      return 'indeks tersedia';
    });
    await uji('Membaca aduan (akses pengurus)', async () => `${(await L.semuaLaporan()).length} laporan`);
    await uji('Membaca data anggota', async () => `${(await L.semuaAnggota()).length} pendaftar`);
    $('[data-hasil-periksa]').innerHTML = `<ul class="adm-periksa">${hasil.map((h) => `<li class="${h.ok ? 'ok' : 'gagal'}">${ikon(h.ok ? 'circle-check' : 'circle-x')}<span><b>${esc(h.nama)}</b><small>${esc(h.pesan)}${h.tautan ? ` — <a href="${esc(h.tautan)}" target="_blank" rel="noopener">buat indeks</a>` : ''}</small></span></li>`).join('')}</ul>`;
  }));
}
