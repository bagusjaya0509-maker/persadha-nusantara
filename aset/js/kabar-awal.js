// Kabar pertama, disusun dari dokumen resmi: SK DPP No. 04/SK/DPP PERSADHA
// NUSANTARA/VIII/2026 (pengurus DPD NTB) dan SK Menteri Hukum
// AHU-0002242.AH.01.08.TAHUN 2025 (pengurus DPP). Mode demo memakainya sebagai
// isi awal; di panel pengurus ada tombol untuk menerbitkannya ke Firebase.

const p = (teks, a) => [{ insert: teks, ...(a ? { attributes: a } : {}) }, { insert: '\n' }];
const h2 = (teks) => [{ insert: teks }, { insert: '\n', attributes: { header: 2 } }];
const li = (teks) => [{ insert: teks }, { insert: '\n', attributes: { list: 'bullet' } }];
const jadi = (...potong) => JSON.stringify(potong.flat());
const wib = (t) => Date.parse(t + 'T09:00:00+07:00');
// Paragraf berpotongan: teks biasa (string) dicampur potongan bergaya, mis. tautan atau miring.
const pp = (...potong) => [...potong.map((s) => (typeof s === 'string' ? { insert: s } : s)), { insert: '\n' }];
const tautan = (teks, link) => ({ insert: teks, attributes: { link } });
const miring = (teks) => ({ insert: teks, attributes: { italic: true } });
const gambar = (src, alt) => [{ insert: { image: src }, attributes: { alt } }, { insert: '\n' }];

// Foto kabar awal ada di aset/img/kabar/<slug>/. Awalan situs dibaca dari <html data-base> di peramban,
// dan dari globalThis.BASE_SITUS (diisi skrip/bangun.mjs) saat build.
const BASE_AWAL = (typeof document !== 'undefined' && document.documentElement.dataset.base) || globalThis.BASE_SITUS || '/';
const media = (slug, berkas) => `${BASE_AWAL}aset/img/kabar/${slug}/${berkas}`;

const PELANTIKAN = 'pengurus-dpd-persadha-nusantara-ntb-dilantik-siap-kawal-advokasi-umat';

export const KABAR_AWAL = [
  // 23 Nov 2026: dikembangkan dari pemberitaan Nusantara Satu (21/8/2026) & Filter News (22/8/2026),
  // dilengkapi data SK DPD NTB. Foto dari pemilik (pelantikan di Fizz Hotel Mataram).
  {
    slug: PELANTIKAN,
    judul: 'Pengurus DPD Persadha Nusantara NTB Dilantik, Siap Kawal Advokasi Umat Hindu',
    kategori: 'Kegiatan',
    penulis: 'Sekretariat DPD NTB',
    terbitPada: wib('2026-08-21'),
    unggulan: true,
    ringkasan: 'Pengurus DPD Persadha Nusantara Provinsi NTB masa bhakti 2026–2031 resmi dilantik di Mataram, Jumat (21/8/2026). DPP, Kemenag NTB, dan PHDI NTB menitipkan pesan soal konsolidasi, sinergi, dan integritas kepemimpinan.',
    sampul: media(PELANTIKAN, 'sampul.jpg'),
    sampulKecil: media(PELANTIKAN, 'sampul-kecil.jpg'),
    keteranganSampul: 'Penyerahan pataka Persadha Nusantara dalam pelantikan pengurus DPD Provinsi NTB di Mataram, 21 Agustus 2026.',
    delta: jadi(
      p('Jajaran pengurus Dewan Pimpinan Daerah (DPD) Persadha Nusantara Provinsi Nusa Tenggara Barat masa bhakti 2026–2031 resmi dilantik di Fizz Hotel Mataram pada Jumat, 21 Agustus 2026. Pelantikan bertema “Meneguhkan Arah, Memperluas Gerak” ini menandai dimulainya kerja pengurus yang susunannya ditetapkan Dewan Pimpinan Pusat (DPP) sehari sebelumnya.'),
      p('Susunan pengurus tersebut disahkan melalui Surat Keputusan DPP Nomor 04/SK/DPP PERSADHA NUSANTARA/VIII/2026 tertanggal 20 Agustus 2026. DPD NTB diketuai I Putu Alit Arsana, S.H., M.Kn., dan menjalankan programnya melalui enam bidang kerja, mulai dari organisasi dan kaderisasi hingga pergerakan sosial politik, hukum, dan advokasi.'),
      p('Pelantikan dihadiri Bendahara Umum DPP Persadha Nusantara, Komang Juli Agustawan, yang hadir mewakili DPP. Hadir pula Ketua Parisada Hindu Dharma Indonesia (PHDI) Provinsi NTB serta Ketua Tim Kelembagaan dan Sistem Informasi yang mewakili Kepala Bidang Bimas Hindu Kantor Wilayah Kementerian Agama Provinsi NTB.'),
      gambar(media(PELANTIKAN, 'pelantikan.jpg'), 'Jajaran pengurus DPD Persadha Nusantara NTB berdiri memegang bunga dalam prosesi pelantikan'),
      p('Jajaran pengurus DPD Persadha Nusantara NTB dalam prosesi pelantikan di Fizz Hotel Mataram.', { italic: true }),
      h2('Komitmen mengawal advokasi umat'),
      p('Dalam sambutan perdananya setelah dilantik, Ketua DPD Persadha Nusantara NTB, I Putu Alit Arsana, menyatakan komitmen pengurus untuk bersinergi memperjuangkan kemajuan umat Hindu di Nusa Tenggara Barat. Sesuai amanat DPP, DPD NTB akan mengisi ruang-ruang pengabdian yang selama ini belum tersentuh secara optimal dan bersikap proaktif mengawal advokasi umat.'),
      pp('Salah satu wujud komitmen itu adalah ', tautan('layanan pengaduan', `${BASE_AWAL}layanan/aduan/`), ' di situs ini. Umat yang menghadapi persoalan, seperti hambatan beribadah, sengketa tanah pura, atau perlakuan diskriminatif, dapat melapor secara daring lalu memantau tindak lanjutnya dari akun masing-masing.'),
      h2('DPP: rapikan konsolidasi, jadikan kritik bahan bakar'),
      p('Komang Juli Agustawan mengibaratkan kepengurusan yang baru dilantik sebagai bayi yang baru lahir. Karena itu, ia meminta pengurus lebih dulu merapikan konsolidasi internal dan memaksimalkan latar belakang profesi para anggotanya.'),
      p('Ia juga mengingatkan agar masukan dan kritik diterima sebagai bahan bakar untuk maju, bukan dibalas dengan kebencian. Menurutnya, organisasi yang terus diisi energi baik dari berbagai pihak akan menjadi motor penggerak kemajuan umat.'),
      h2('Kemenag NTB: energi penyegar bagi pelayanan umat'),
      p('Mewakili Kepala Bidang Bimas Hindu Kanwil Kementerian Agama Provinsi NTB, Ketua Tim Kelembagaan dan Sistem Informasi menyebut pelantikan ini sebagai peneguhan komitmen dalam tugas pelayanan umat. Ia berharap pengurus baru menjadi energi penyegar dan menjalin sinergi yang harmonis dengan organisasi kemasyarakatan Hindu yang sudah ada.'),
      h2('PHDI NTB: pegang teguh Asta Brata'),
      pp('Ketua PHDI Provinsi NTB menekankan pentingnya memperkuat kapasitas kepemimpinan generasi muda. Ia meminta pengurus menanamkan nilai Asta Brata, delapan sifat kepemimpinan dalam ajaran Hindu, sebagai kompetensi keras (', miring('hard competency'), ') sekaligus kompetensi lunak (', miring('soft competency'), ') dalam mengelola organisasi.'),
      p('Menurutnya, pemimpin sejati memiliki integritas yang teruji, yaitu selaras antara ucapan dan perbuatan. Pemimpin juga harus berani berkorban, tidak bermental cengeng, dan siap memikul tanggung jawab di lapangan. Ia mengingatkan bahwa keberhasilan program adalah hasil kerja tim, sedangkan kegagalan menjadi tanggung jawab pemimpin, bukan sebaliknya.'),
      h2('Membangun jejaring keumatan'),
      p('Di akhir acara, seluruh pihak berharap setiap pengurus mengoptimalkan posisi dan perannya masing-masing untuk membangun jejaring keumatan. Pengabdian di jalan Dharma diyakini akan membawa kemajuan bagi umat Hindu di Nusa Tenggara Barat.'),
      pp('Susunan lengkap pengurus DPD NTB masa bhakti 2026–2031 dapat dibaca di ', tautan('halaman Tentang', `${BASE_AWAL}tentang/#pengurus`), '.'),
      pp(miring('Diolah dari pemberitaan '), tautan('Nusantara Satu', 'https://nusantarasatu.com/2026/08/21/tanamkan-integritas-dan-kepemimpinan-berkualitas-pengurus-baru-persadha-nusantara-ntb-resmi-mengabdi/'), miring(' (21 Agustus 2026) dan '), tautan('Filter News', 'https://filter-news.com/tanamkan-integritas-dan-kepemimpinan-berkualitas-pengurus-baru-persadha-nusantara-ntb-resmi-mengabdi'), miring(' (22 Agustus 2026).')),
    ),
  },
  {
    slug: 'dpp-tetapkan-pengurus-dpd-persadha-nusantara-ntb-2026-2031',
    judul: 'DPP Tetapkan Pengurus DPD Persadha Nusantara NTB Masa Bhakti 2026–2031',
    kategori: 'Berita',
    penulis: 'Sekretariat DPD NTB',
    terbitPada: wib('2026-08-20'),
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
