// Bacaan publik (kabar). Mode firebase memakai REST supaya ringan;
// mode demo membaca localStorage.
import { KONFIG, MODE } from './inti.js';
import { kueriKabar, ambilDokumen } from './rest.js';
import { KABAR_AWAL } from './kabar-awal.js';

// Sebelum Firebase disambungkan, situs yang tayang tetap menampilkan tiga
// kabar awal (disusun dari dokumen legal) supaya tidak kosong.
const awal = () => KABAR_AWAL.map(({ delta, ...k }) => ({ id: k.slug, ...k })).sort((a, b) => b.terbitPada - a.terbitPada);

const fb = () => ({ projectId: KONFIG.firebase.projectId, apiKey: KONFIG.firebase.apiKey });

// Selama koleksi kabar di Firestore masih kosong (pengurus belum menerbitkan
// apa pun), tampilkan kabar awal. Begitu ada satu kabar terbit, Firestore menang.
let janjiKosong;
const firestoreKosong = () => (janjiKosong ??= kueriKabar({ ...fb(), batas: 1 }).then((d) => d.length === 0).catch(() => false));
function saringAwal({ batas, setelah, kategori }) {
  let d = awal();
  if (kategori) d = d.filter((k) => k.kategori === kategori);
  if (setelah) d = d.filter((k) => k.terbitPada < setelah);
  return d.slice(0, batas);
}

async function daftarDemo({ batas, setelah, kategori }) {
  const { bacaDemo, tunda } = await import('./demo.js');
  await tunda(120);
  let semua = Object.values(bacaDemo().kabar).sort((a, b) => b.terbitPada - a.terbitPada);
  if (kategori) semua = semua.filter((k) => k.kategori === kategori);
  if (setelah) semua = semua.filter((k) => k.terbitPada < setelah);
  return semua.slice(0, batas).map((k) => ({ id: k.slug, ...k }));
}

/** Daftar kabar terbit, terbaru dulu. */
export async function daftarKabar({ batas = 12, setelah = null, kategori = null } = {}) {
  if (MODE === 'demo') return daftarDemo({ batas, setelah, kategori });
  if (MODE !== 'firebase') return saringAwal({ batas, setelah, kategori });
  try {
    const hasil = await kueriKabar({ ...fb(), batas, setelah, kategori });
    if (!hasil.length && (await firestoreKosong())) return saringAwal({ batas, setelah, kategori });
    return hasil;
  } catch (e) {
    // Filter kategori butuh indeks gabungan. Sebelum indeksnya dibuat,
    // ambil kabar terbaru lalu saring di peramban.
    if (kategori && /index/i.test(e.message)) {
      console.warn('Indeks kategori belum dibuat:', e.tautanIndeks || e.message);
      const banyak = await kueriKabar({ ...fb(), batas: 60, setelah });
      return banyak.filter((k) => k.kategori === kategori).slice(0, batas);
    }
    throw e;
  }
}

/** Satu kabar beserta isinya; null bila tidak ada / belum terbit. */
export async function ambilKabar(slug) {
  if (!/^[a-z0-9-]{1,90}$/.test(slug)) return null;
  if (MODE === 'demo') {
    const { bacaDemo, tunda } = await import('./demo.js');
    await tunda(120);
    const s = bacaDemo();
    return s.kabar[slug] ? { kabar: { id: slug, ...s.kabar[slug] }, isi: s.kabarIsi[slug] || {} } : null;
  }
  if (MODE !== 'firebase') {
    const k = KABAR_AWAL.find((x) => x.slug === slug);
    return k ? { kabar: awal().find((x) => x.id === slug), isi: { delta: k.delta } } : null;
  }
  const [kabar, isi] = await Promise.all([
    ambilDokumen({ ...fb(), jalur: `kabar/${slug}` }),
    ambilDokumen({ ...fb(), jalur: `kabarIsi/${slug}` }),
  ]);
  if (kabar) return { kabar, isi: isi || {} };
  const k = KABAR_AWAL.find((x) => x.slug === slug);
  if (k && (await firestoreKosong())) return { kabar: awal().find((x) => x.id === slug), isi: { delta: k.delta } };
  return null;
}
