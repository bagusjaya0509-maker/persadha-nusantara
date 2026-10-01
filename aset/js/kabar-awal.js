// Tiga kabar pertama, disusun dari dokumen legal organisasi (SK Menteri
// Hukum, Akta Notaris No. 01/2025, dan NIB). Mode demo memakainya sebagai
// isi awal; di panel pengurus ada tombol untuk menerbitkannya ke Firebase.

const p = (teks, a) => [{ insert: teks, ...(a ? { attributes: a } : {}) }, { insert: '\n' }];
const h2 = (teks) => [{ insert: teks }, { insert: '\n', attributes: { header: 2 } }];
const li = (teks) => [{ insert: teks }, { insert: '\n', attributes: { list: 'bullet' } }];
const jadi = (...potong) => JSON.stringify(potong.flat());
const wib = (t) => Date.parse(t + 'T09:00:00+07:00');

export const KABAR_AWAL = [
  {
    slug: 'nib-terbit-persadha-nusantara-tercatat-di-oss',
    judul: 'NIB Terbit, Persadha Nusantara Tercatat di Sistem OSS',
    kategori: 'Berita',
    penulis: 'Sekretariat DPP',
    terbitPada: wib('2026-04-28'),
    ringkasan: 'Nomor Induk Berusaha 2804260022115 terbit pada 28 April 2026 untuk kegiatan pelestarian cagar budaya dan wisata budaya.',
    delta: jadi(
      p('Persadha Nusantara kini memiliki Nomor Induk Berusaha (NIB) 2804260022115. NIB itu diterbitkan lewat sistem Online Single Submission (OSS) pada 28 April 2026 atas nama Perkumpulan Pergerakan Sanatana Dharma Nusantara.'),
      p('NIB mencatat dua bidang kegiatan organisasi: peninggalan sejarah atau cagar budaya yang dikelola swasta (KBLI 91024) dan wisata budaya lainnya (KBLI 91029). Keduanya berlokasi di sekretariat DPP, Jalan Sawah Lunto Nomor 50, Jakarta Selatan.'),
      p('NIB berlaku sebagai identitas dan bukti pendaftaran organisasi di OSS untuk menjalankan kegiatan pada kedua bidang tersebut. Dokumen ini melengkapi status badan hukum perkumpulan yang sudah disahkan Kementerian Hukum sejak 2019.'),
    ),
  },
  {
    slug: 'sekretariat-dpp-persadha-nusantara-pindah-ke-jakarta-selatan',
    judul: 'Sekretariat DPP Persadha Nusantara Kini di Jakarta Selatan',
    kategori: 'Pengumuman',
    penulis: 'Sekretariat DPP',
    terbitPada: wib('2025-12-09'),
    ringkasan: 'Surat, undangan, dan kunjungan untuk Dewan Pimpinan Pusat kini ditujukan ke Jl. Sawah Lunto No. 50, Pasar Manggis, Setiabudi.',
    delta: jadi(
      p('Sejak Desember 2025, sekretariat Dewan Pimpinan Pusat Persadha Nusantara berpindah dari Jalan Ciung Wanara I Nomor 36, Denpasar, ke Jakarta Selatan. Perpindahan ini diputuskan dalam Rapat Pengurus 29 November 2025 dan tercatat dalam Akta Nomor 01 tanggal 4 Desember 2025.'),
      h2('Alamat baru'),
      p('Jl. Sawah Lunto No. 50, Kelurahan Pasar Manggis, Kecamatan Setiabudi, Jakarta Selatan 12970', { bold: true }),
      p('Surat resmi, undangan, dan permohonan audiensi untuk DPP mohon dikirim ke alamat tersebut. Untuk pertanyaan cepat, sekretariat dapat dihubungi lewat WhatsApp 0821-1304-3997 atau email dpppersadhanusantara@gmail.com.'),
      p('Umat yang menghadapi persoalan hukum atau konflik dapat mengirim aduan lewat situs ini tanpa harus datang ke sekretariat. Setiap aduan mendapat nomor, dan statusnya bisa dipantau dari akun pelapor.'),
    ),
  },
  {
    slug: 'kemenkum-sahkan-susunan-pengurus-persadha-nusantara-2025-2030',
    judul: 'Kemenkum Sahkan Susunan Pengurus Persadha Nusantara 2025–2030',
    kategori: 'Berita',
    penulis: 'Sekretariat DPP',
    terbitPada: wib('2025-12-08'),
    unggulan: true,
    ringkasan: 'Keputusan Menteri Hukum Nomor AHU-0002242.AH.01.08.TAHUN 2025 menyetujui perubahan perkumpulan, termasuk kepengurusan baru yang dipimpin D Sures Kumar.',
    delta: jadi(
      p('Menteri Hukum menyetujui perubahan Perkumpulan Pergerakan Sanatana Dharma Nusantara (Persadha Nusantara) pada 8 Desember 2025. Persetujuan itu tertuang dalam Keputusan Menteri Hukum Nomor AHU-0002242.AH.01.08.TAHUN 2025 dan berlaku sejak tanggal ditetapkan.'),
      p('Perubahan tersebut berawal dari Rapat Pengurus pada 29 November 2025. Rapat memilih kepengurusan Dewan Pimpinan Pusat masa bhakti 2025–2030 sekaligus memindahkan sekretariat dari Denpasar ke Jakarta Selatan. Keputusan rapat kemudian dituangkan dalam Akta Nomor 01 tanggal 4 Desember 2025 di hadapan Notaris Siti Susyanthi, S.H., M.Kn.'),
      h2('Susunan pengurus dan pengawas'),
      li('Ketua Umum: D Sures Kumar'),
      li('Wakil Ketua Umum: Gede Suardana'),
      li('Sekretaris Jenderal: Anak Agung Ayu Ari Widhyasari, S.H., M.Kn.'),
      li('Bendahara Umum: Komang Juli Agustawan'),
      li('Wakil Ketua: I Gede Ariawan, Yan Mitha Djaksana, I Made Sudanayasa, dan I Made Bawayasa'),
      li('Pengawas: Gede Pasek Suardika, S.H., M.H., I Wayan Jondra, dan I Ketut Wiriana'),
      p('Gede Pasek Suardika memimpin perkumpulan sebagai Ketua Umum pada periode 2019–2025. Pada kepengurusan baru, ia duduk di jajaran pengawas bersama I Wayan Jondra dan I Ketut Wiriana.'),
      p('Rapat juga memberi kuasa kepada Ketua Umum, Sekretaris Jenderal, dan Wakil Ketua I Gede Ariawan untuk mengurus administrasi organisasi di notaris, Kementerian Hukum, dan pihak lain.'),
    ),
  },
];
