// Build situs statis Persadha Nusantara -> folder _site/
//
//   node skrip/bangun.mjs
//
// Langkah:
//  1. Salin aset/ dan tulis aset/js/konfigurasi.js dari situs.config.json.
//  2. Rakit setiap halaman di src/halaman/ ke dalam templat.
//  3. Bila Firebase sudah diisi: tarik kabar terbit lewat REST, lalu buat
//     satu halaman statis per kabar (supaya pratinjau WhatsApp/Facebook dan
//     Google membaca judul & gambar yang benar). Gambar di dalam kabar
//     dipindah dari data URL ke berkas .jpg.
//  4. Tulis sitemap.xml, robots.txt, .nojekyll.
//
// Variabel lingkungan (diisi otomatis oleh GitHub Actions):
//   SITUS_URL  alamat situs, mis. https://contoh.github.io/persadha-nusantara
//   BASE_PATH  awalan jalur, mis. /persadha-nusantara (kosong untuk domain sendiri)

import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath, pathToFileURL } from 'node:url';

const AKAR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const KELUAR = path.join(AKAR, '_site');
const baca = (p) => fs.readFile(path.join(AKAR, p), 'utf8');

const konfig = JSON.parse(await baca('situs.config.json'));
const urlSitus = new URL(process.env.SITUS_URL || konfig.situs.url);
let BASE = process.env.BASE_PATH ?? urlSitus.pathname;
if (!BASE.startsWith('/')) BASE = '/' + BASE;
if (!BASE.endsWith('/')) BASE += '/';
const ASAL = urlSitus.origin + BASE; // berakhiran "/"

const { susunArtikel } = await import(pathToFileURL(path.join(AKAR, 'aset/js/artikel.js')));
const { esc, deltaKeTeks } = await import(pathToFileURL(path.join(AKAR, 'aset/js/isi.js')));
const { kueriKabar, ambilDokumen } = await import(pathToFileURL(path.join(AKAR, 'aset/js/rest.js')));

// ---------- 1. aset ----------
await fs.rm(KELUAR, { recursive: true, force: true });
await fs.mkdir(KELUAR, { recursive: true });
await fs.cp(path.join(AKAR, 'aset'), path.join(KELUAR, 'aset'), { recursive: true });

const konfigPublik = {
  situs: konfig.situs,
  kontak: konfig.kontak,
  sosial: konfig.sosial,
  firebase: konfig.firebase,
  adminUtama: konfig.adminUtama,
  notifikasi: konfig.notifikasi,
  base: BASE,
  asal: ASAL,
  versi: '',
};
await fs.writeFile(
  path.join(KELUAR, 'aset/js/konfigurasi.js'),
  `// Dibuat otomatis oleh skrip/bangun.mjs dari situs.config.json. Jangan disunting di sini.\nexport const KONFIG = ${JSON.stringify(konfigPublik, null, 2)};\n`,
);

// Sidik versi dari seluruh isi aset -> dipakai sebagai ?v= agar peramban
// tidak memakai CSS/JS lama sesudah situs diperbarui.
async function daftarBerkas(dir) {
  const hasil = [];
  for (const e of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) hasil.push(...(await daftarBerkas(p)));
    else hasil.push(p);
  }
  return hasil;
}
const sidik = crypto.createHash('sha1');
const berkasAset = (await daftarBerkas(path.join(KELUAR, 'aset'))).sort();
for (const f of berkasAset) sidik.update(await fs.readFile(f));
const V = sidik.digest('hex').slice(0, 8);
konfigPublik.versi = V;
await fs.writeFile(
  path.join(KELUAR, 'aset/js/konfigurasi.js'),
  `// Dibuat otomatis oleh skrip/bangun.mjs dari situs.config.json. Jangan disunting di sini.
export const KONFIG = ${JSON.stringify(konfigPublik, null, 2)};
`,
);

// Tambahkan ?v= pada setiap impor relatif di modul JS.
for (const f of berkasAset.filter((f) => f.endsWith('.js') && !f.includes(`${path.sep}vendor${path.sep}`))) {
  const isi = await fs.readFile(f, 'utf8');
  const baru = isi.replace(/((?:from|import)\s*\(?\s*['"])(\.\.?\/[\w./-]+?\.js)(['"])/g, `$1$2?v=${V}$3`);
  if (baru !== isi) await fs.writeFile(f, baru);
}

// ---------- 2. halaman ----------
const templat = {
  dasar: await baca('src/templat/dasar.html'),
  admin: await baca('src/templat/admin.html'),
  kepala: await baca('src/templat/kepala.html'),
  kaki: await baca('src/templat/kaki.html'),
};

const tautanSosial = Object.entries(konfig.sosial)
  .filter(([, url]) => url)
  .map(([nama, url]) => `<a href="${esc(url)}" target="_blank" rel="noopener" aria-label="${nama}"><svg class="ikon"><use href="${BASE}aset/img/ikon.svg#i-${nama}"/></svg></a>`)
  .join('');

const dataUmum = {
  BASE,
  ASAL,
  V,
  tahun: String(new Date().getFullYear()),
  situs: konfig.situs,
  kontak: konfig.kontak,
  tautan_sosial: tautanSosial,
};

function ambil(obj, kunci) {
  return kunci.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
}
function isiTemplat(teks, data, nama) {
  return teks.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k) => {
    const v = ambil(data, k);
    if (v === undefined) {
      console.warn(`  ! ${nama}: penanda {{${k}}} tidak dikenal`);
      return m;
    }
    return String(v);
  });
}

function bacaMeta(sumber, nama) {
  const m = sumber.match(/^\s*<!--(\{[\s\S]*?\})-->\s*/);
  if (!m) throw new Error(`${nama}: baris meta <!--{...}--> tidak ada`);
  return { meta: JSON.parse(m[1]), badan: sumber.slice(m[0].length) };
}

const ORGANISASI_LD = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Persadha Nusantara',
  alternateName: [konfig.situs.namaLengkap, konfig.situs.namaBadanHukum],
  url: ASAL,
  logo: ASAL + 'aset/img/lambang-512.png',
  email: konfig.kontak.email,
  telephone: '+' + konfig.kontak.whatsapp,
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Jl. Sawah Lunto No. 50, Pasar Manggis, Setiabudi',
    addressLocality: 'Jakarta Selatan',
    postalCode: '12970',
    addressCountry: 'ID',
  },
  sameAs: Object.values(konfig.sosial).filter(Boolean),
};

function rakit({ meta, badan, nama, sisip = {} }) {
  const tpl = templat[meta.templat || 'dasar'];
  const kanonik = meta.path === '404.html' ? '' : ASAL + (meta.path || '');
  const judulLengkap = meta.judulPenuh || `${meta.judul} — Persadha Nusantara`;
  const skrip = (meta.skrip || [])
    .map((s) => `<script type="module" src="${BASE}aset/js/${s}?v=${V}"></script>`)
    .join('\n');
  const data = {
    ...dataUmum,
    ...(meta.data || {}),
    ...sisip,
    judul: meta.judul,
    halaman: meta.nav || '',
  };
  const isi = isiTemplat(badan, data, nama);
  const ld = meta.jsonLd || (meta.path === '' ? ORGANISASI_LD : null);
  let html = isiTemplat(
    tpl,
    {
      ...data,
      judul_lengkap: esc(judulLengkap),
      deskripsi: esc(meta.deskripsi || konfig.situs.deskripsi),
      kanonik: kanonik ? `<link rel="canonical" href="${kanonik}">\n<meta property="og:url" content="${kanonik}">` : '',
      og_gambar: meta.ogGambar || ASAL + 'aset/img/og-persadha.jpg',
      og_jenis: meta.ogJenis || 'website',
      robots: meta.robots || 'index,follow',
      json_ld: ld ? `<script type="application/ld+json">${JSON.stringify(ld)}</script>` : '',
      meta_tambahan: meta.metaTambahan || '',
      kepala: isiTemplat(templat.kepala, data, 'kepala'),
      kaki: isiTemplat(templat.kaki, data, 'kaki'),
      kelas_body: meta.kelasBody || '',
      skrip,
      isi,
    },
    nama,
  );
  for (const [token, nilai] of Object.entries(sisip.__mentah || {})) html = html.replace(token, () => nilai);
  return html.replaceAll(`${BASE}aset/img/ikon.svg#`, `${BASE}aset/img/ikon.svg?v=${V}#`);
}

async function tulis(relatif, html) {
  const tujuan = relatif.endsWith('.html') ? path.join(KELUAR, relatif) : path.join(KELUAR, relatif, 'index.html');
  await fs.mkdir(path.dirname(tujuan), { recursive: true });
  await fs.writeFile(tujuan, html);
}

const peta = []; // untuk sitemap
const daftarHalaman = (await fs.readdir(path.join(AKAR, 'src/halaman'))).filter((f) => f.endsWith('.html'));
let templatBaca = null;
for (const f of daftarHalaman) {
  const { meta, badan } = bacaMeta(await baca(`src/halaman/${f}`), f);
  if (f === 'kabar-baca.html') {
    templatBaca = { meta, badan };
    continue;
  }
  await tulis(meta.path || '', rakit({ meta, badan, nama: f }));
  if (meta.peta !== false && meta.path !== '404.html') peta.push({ loc: ASAL + (meta.path || ''), prioritas: meta.prioritas || '0.6' });
}
console.log(`✓ ${daftarHalaman.length} halaman dirakit (base ${BASE}, versi ${V})`);

// 404.html merangkap pembaca kabar yang belum ikut build.
if (!templatBaca) throw new Error('src/halaman/kabar-baca.html tidak ada');
await tulis(
  '404.html',
  rakit({
    meta: { ...templatBaca.meta, judul: 'Halaman tidak ditemukan', path: '404.html', robots: 'noindex' },
    badan: templatBaca.badan,
    nama: '404',
    sisip: { slug: '', prerender: '0', __mentah: { '@@ARTIKEL@@': '' } },
  }),
);

// ---------- 3. kabar statis ----------
const fb = konfig.firebase || {};
const pakaiFirebase = Boolean(fb.projectId && fb.apiKey);
let jumlahKabar = 0;
{
  try {
    const semua = [];
    let ambilIsi;
    if (pakaiFirebase) {
      let setelah = null;
      for (;;) {
        const satu = await kueriKabar({ projectId: fb.projectId, apiKey: fb.apiKey, batas: 100, setelah });
        semua.push(...satu);
        if (satu.length < 100) break;
        setelah = satu[satu.length - 1].terbitPada;
      }
      ambilIsi = async (slug) => (await ambilDokumen({ projectId: fb.projectId, apiKey: fb.apiKey, jalur: `kabarIsi/${slug}` })) || {};
    } else {
      // Firebase belum diisi: terbitkan kabar awal dari dokumen legal.
      const { KABAR_AWAL } = await import(pathToFileURL(path.join(AKAR, 'aset/js/kabar-awal.js')));
      for (const { delta, ...k } of KABAR_AWAL) semua.push({ id: k.slug, ...k });
      ambilIsi = async (slug) => ({ delta: KABAR_AWAL.find((k) => k.slug === slug).delta });
    }
    for (const kabar of semua) {
      const slug = kabar.id;
      if (!/^[a-z0-9-]{1,90}$/.test(slug)) continue;
      const isi = await ambilIsi(slug);
      const dirMedia = path.join(KELUAR, 'media/kabar', slug);
      await fs.mkdir(dirMedia, { recursive: true });
      const simpanData = async (dataUrl, namaDasar) => {
        const m = /^data:image\/(jpeg|png|webp|gif);base64,(.+)$/i.exec(dataUrl || '');
        if (!m) return dataUrl;
        const ext = m[1].toLowerCase() === 'jpeg' ? 'jpg' : m[1].toLowerCase();
        await fs.writeFile(path.join(dirMedia, `${namaDasar}.${ext}`), Buffer.from(m[2], 'base64'));
        return `${BASE}media/kabar/${slug}/${namaDasar}.${ext}`;
      };
      const urlSampul = isi.sampul ? await simpanData(isi.sampul, 'sampul') : '';
      const tertunda = [];
      const urlHalaman = `${ASAL}kabar/${slug}/`;
      let html = susunArtikel({
        kabar,
        isi,
        base: BASE,
        urlHalaman,
        sampul: urlSampul,
        gantiGambar: (src, n) => {
          if (!src.startsWith('data:')) return src;
          const m = /^data:image\/(jpeg|png|webp|gif);/i.exec(src);
          const ext = m && m[1].toLowerCase() !== 'jpeg' ? m[1].toLowerCase() : 'jpg';
          tertunda.push(simpanData(src, `isi-${n + 1}`));
          return `${BASE}media/kabar/${slug}/isi-${n + 1}.${ext}`;
        },
      });
      await Promise.all(tertunda);
      const ringkas = kabar.ringkasan || deltaKeTeks(isi.delta || '[]').slice(0, 160);
      const iso = kabar.terbitPada ? new Date(kabar.terbitPada).toISOString() : '';
      const ogGambar = urlSampul ? urlSitus.origin + urlSampul : ASAL + 'aset/img/og-persadha.jpg';
      await tulis(
        `kabar/${slug}/`,
        rakit({
          meta: {
            ...templatBaca.meta,
            judul: kabar.judul,
            judulPenuh: `${kabar.judul} — Persadha Nusantara`,
            deskripsi: ringkas,
            path: `kabar/${slug}/`,
            ogGambar,
            ogJenis: 'article',
            metaTambahan: iso ? `<meta property="article:published_time" content="${iso}">` : '',
            jsonLd: {
              '@context': 'https://schema.org',
              '@type': 'NewsArticle',
              headline: kabar.judul,
              description: ringkas,
              image: [ogGambar],
              datePublished: iso,
              dateModified: kabar.diubah ? new Date(kabar.diubah).toISOString() : iso,
              author: { '@type': 'Organization', name: kabar.penulis || 'Persadha Nusantara' },
              publisher: { '@type': 'Organization', name: 'Persadha Nusantara', logo: { '@type': 'ImageObject', url: ASAL + 'aset/img/lambang-512.png' } },
              mainEntityOfPage: urlHalaman,
            },
          },
          badan: templatBaca.badan,
          nama: `kabar/${slug}`,
          sisip: { slug, prerender: '1', __mentah: { '@@ARTIKEL@@': html } },
        }),
      );
      peta.push({ loc: urlHalaman, prioritas: '0.7', lastmod: (kabar.diubah || kabar.terbitPada) && new Date(kabar.diubah || kabar.terbitPada).toISOString().slice(0, 10) });
      jumlahKabar++;
    }
    console.log(`✓ ${jumlahKabar} kabar statis dibuat dari ${pakaiFirebase ? 'Firestore' : 'kabar awal (Firebase belum diisi)'}`);
  } catch (e) {
    // Build tetap jalan: kabar masih terbaca lewat 404.html (dirender di peramban).
    console.warn(`! Gagal menarik kabar dari Firestore: ${e.message}`);
    if (e.tautanIndeks) console.warn(`  Buat indeks: ${e.tautanIndeks}`);
  }
}

// ---------- 4. sitemap, robots ----------
await fs.writeFile(
  path.join(KELUAR, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${peta
    .map((p) => `  <url><loc>${p.loc}</loc>${p.lastmod ? `<lastmod>${p.lastmod}</lastmod>` : ''}<priority>${p.prioritas}</priority></url>`)
    .join('\n')}\n</urlset>\n`,
);
await fs.writeFile(
  path.join(KELUAR, 'robots.txt'),
  `User-agent: *\nDisallow: ${BASE}admin/\nDisallow: ${BASE}akun/\nDisallow: ${BASE}masuk/\nSitemap: ${ASAL}sitemap.xml\n`,
);
await fs.writeFile(path.join(KELUAR, '.nojekyll'), '');
console.log(`✓ Selesai → ${path.relative(AKAR, KELUAR)}/ (${peta.length} URL di sitemap)`);
