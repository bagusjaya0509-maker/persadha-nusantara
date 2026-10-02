// Kabar pertama, disusun dari dokumen resmi: SK DPP No. 04/SK/DPP PERSADHA
// NUSANTARA/VIII/2026 (pengurus DPD NTB) dan SK Menteri Hukum
// AHU-0002242.AH.01.08.TAHUN 2025 (pengurus DPP). Mode demo memakainya sebagai
// isi awal; di panel pengurus ada tombol untuk menerbitkannya ke Firebase.

const p = (teks, a) => [{ insert: teks, ...(a ? { attributes: a } : {}) }, { insert: '\n' }];
const h2 = (teks) => [{ insert: teks }, { insert: '\n', attributes: { header: 2 } }];
const li = (teks) => [{ insert: teks }, { insert: '\n', attributes: { list: 'bullet' } }];
const jadi = (...potong) => JSON.stringify(potong.flat());
const wib = (t) => Date.parse(t + 'T09:00:00+07:00');

export const KABAR_AWAL = [
  {
    slug: 'dpp-tetapkan-pengurus-dpd-persadha-nusantara-ntb-2026-2031',
    judul: 'DPP Tetapkan Pengurus DPD Persadha Nusantara NTB Masa Bhakti 2026–2031',
    kategori: 'Berita',
    penulis: 'Sekretariat DPD NTB',
    terbitPada: wib('2026-08-20'),
    unggulan: true,
    ringkasan: 'SK DPP Nomor 04/SK/DPP PERSADHA NUSANTARA/VIII/2026 mengesahkan pengurus DPD Provinsi Nusa Tenggara Barat yang diketuai I Putu Alit Arsana, S.H., M.Kn.',
    delta: jadi(
      p('Dewan Pimpinan Pusat Persadha Nusantara mengesahkan susunan pengurus Dewan Pimpinan Daerah Provinsi Nusa Tenggara Barat untuk masa bhakti 2026–2031. Pengesahan itu tertuang dalam Surat Keputusan Nomor 04/SK/DPP PERSADHA NUSANTARA/VIII/2026 yang ditetapkan di Jakarta pada 20 Agustus 2026 dan ditandatangani Ketua Umum DPP, D. Sures Kumar, S.Ag., M.Si.'),
      p('Susunan pengurus disusun dalam rapat pada 18 Agustus 2026 berdasarkan Surat Mandat DPP Nomor 001/SM/DPP PERSADHA Nusantara/VIII/2026. Kepengurusan ini berlaku sampai Agustus 2031. Sesudahnya, DPD NTB wajib menggelar pemilihan kembali.'),
      h2('Pengurus harian'),
      li('Ketua: I Putu Alit Arsana, S.H., M.Kn.'),
      li('Wakil Ketua I: Ida Bagus Benny Surya Adi Pramana, M.I.Kom.'),
      li('Wakil Ketua II: Nyoman Loji Sagita'),
      li('Sekretaris: Bagus Jaye Puspite, S.H.'),
      li('Wakil Sekretaris: Wayan Widyatmaja, S.Pd., M.Pd.'),
      li('Bendahara: Komang Agus Alit Putra, S.M.'),
      li('Wakil Bendahara: I Gede Pasek Artana, S.H.'),
      p('Dewan Penasihat dan Pengawas diketuai Nyoman Widhiarsana, S.T., bersama enam anggota.'),
      h2('Enam bidang kerja'),
      li('Organisasi, Keanggotaan, dan Kaderisasi — koordinator Putu Witendra Mahardika, S.Pd.H.'),
      li('Sosial Ekonomi — koordinator I Ketut Kasih Adnyana, S.TP.'),
      li('Penelitian dan Pengembangan — koordinator I Gede Wira Aditya Tanaya, S.I.Kom.'),
      li('Agama, Budaya, dan Lingkungan — koordinator Ida Bagus Ary Siswantara, S.H., M.I.Kom.'),
      li('Hubungan Masyarakat dan Antarlembaga Hindu — koordinator I Wayan Sutawa, S.Pd., S.H., M.I.Kom.'),
      li('Pergerakan Sosial Politik, Hukum, dan Advokasi — koordinator I Made Agus Artana, S.H., M.H.'),
      p('Susunan lengkap pengurus, termasuk anggota tiap bidang, tercantum di halaman Tentang.'),
    ),
  },
  {
    slug: 'kemenkum-sahkan-susunan-pengurus-persadha-nusantara-2025-2030',
    judul: 'Kemenkum Sahkan Susunan Pengurus DPP Persadha Nusantara 2025–2030',
    kategori: 'Berita',
    penulis: 'Sekretariat DPD NTB',
    terbitPada: wib('2025-12-08'),
    ringkasan: 'Keputusan Menteri Hukum Nomor AHU-0002242.AH.01.08.TAHUN 2025 menyetujui perubahan perkumpulan, termasuk kepengurusan pusat yang dipimpin D Sures Kumar.',
    delta: jadi(
      p('Menteri Hukum menyetujui perubahan Perkumpulan Pergerakan Sanatana Dharma Nusantara (Persadha Nusantara) pada 8 Desember 2025. Persetujuan itu tertuang dalam Keputusan Menteri Hukum Nomor AHU-0002242.AH.01.08.TAHUN 2025. Keputusan ini menjadi dasar hukum bagi Dewan Pimpinan Pusat yang kemudian membentuk kepengurusan di daerah, termasuk DPD Nusa Tenggara Barat.'),
      p('Rapat Pengurus pada 29 November 2025 memilih kepengurusan DPP masa bhakti 2025–2030 dan memindahkan sekretariat pusat dari Denpasar ke Jakarta Selatan. Keputusan rapat dituangkan dalam Akta Nomor 01 tanggal 4 Desember 2025 di hadapan Notaris Siti Susyanthi, S.H., M.Kn.'),
      h2('Pengurus DPP 2025–2030'),
      li('Ketua Umum: D Sures Kumar'),
      li('Wakil Ketua Umum: Gede Suardana'),
      li('Sekretaris Jenderal: Anak Agung Ayu Ari Widhyasari, S.H., M.Kn.'),
      li('Bendahara Umum: Komang Juli Agustawan'),
      li('Wakil Ketua: I Gede Ariawan, Yan Mitha Djaksana, I Made Sudanayasa, dan I Made Bawayasa'),
      li('Pengawas: Gede Pasek Suardika, S.H., M.H., I Wayan Jondra, dan I Ketut Wiriana'),
    ),
  },
];
