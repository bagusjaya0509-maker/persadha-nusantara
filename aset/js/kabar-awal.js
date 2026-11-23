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
const tebal = (teks) => ({ insert: teks, attributes: { bold: true } });
const lis = (...potong) => [...potong.map((s) => (typeof s === 'string' ? { insert: s } : s)), { insert: '\n', attributes: { list: 'bullet' } }];
const gambar = (src, alt) => [{ insert: { image: src }, attributes: { alt } }, { insert: '\n' }];

// Foto kabar awal ada di aset/img/kabar/<slug>/. Awalan situs dibaca dari <html data-base> di peramban,
// dan dari globalThis.BASE_SITUS (diisi skrip/bangun.mjs) saat build.
const BASE_AWAL = (typeof document !== 'undefined' && document.documentElement.dataset.base) || globalThis.BASE_SITUS || '/';
const media = (slug, berkas) => `${BASE_AWAL}aset/img/kabar/${slug}/${berkas}`;

const PELANTIKAN = 'pengurus-dpd-persadha-nusantara-ntb-dilantik-siap-kawal-advokasi-umat';
const DPP_NTB = 'dpp-tetapkan-pengurus-dpd-persadha-nusantara-ntb-2026-2031';
const KEMENKUM = 'kemenkum-sahkan-susunan-pengurus-persadha-nusantara-2025-2030';

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
  // 23 Nov 2026: ditulis ulang lebih bercerita (pemilik), fakta tetap dari SK DPP No. 04 dan halaman Tentang.
  {
    slug: DPP_NTB,
    judul: 'DPP Tetapkan 35 Pengurus DPD Persadha Nusantara NTB Masa Bhakti 2026–2031',
    kategori: 'Berita',
    penulis: 'Sekretariat DPD NTB',
    terbitPada: wib('2026-08-20'),
    ringkasan: 'Lewat SK Nomor 04/SK/DPP PERSADHA NUSANTARA/VIII/2026, DPP menetapkan 35 pengurus DPD Provinsi NTB yang diketuai I Putu Alit Arsana, S.H., M.Kn. Mereka akan bekerja lewat enam bidang selama lima tahun ke depan.',
    sampul: media(DPP_NTB, 'sampul.jpg'),
    sampulKecil: media(DPP_NTB, 'sampul-kecil.jpg'),
    keteranganSampul: 'Jajaran pengurus DPD Persadha Nusantara NTB masa bhakti 2026–2031 saat pelantikan di Mataram, 21 Agustus 2026.',
    delta: jadi(
      p('Umat Hindu di Nusa Tenggara Barat kini memiliki wadah pergerakan di tingkat provinsi. Dewan Pimpinan Pusat (DPP) Persadha Nusantara menetapkan susunan pengurus Dewan Pimpinan Daerah (DPD) Provinsi NTB masa bhakti 2026–2031 melalui Surat Keputusan Nomor 04/SK/DPP PERSADHA NUSANTARA/VIII/2026. SK itu ditetapkan di Jakarta pada 20 Agustus 2026 dan ditandatangani Ketua Umum DPP, D. Sures Kumar, S.Ag., M.Si.'),
      p('Sebanyak 35 orang tercantum dalam susunan tersebut: tujuh pengurus harian, tujuh anggota Dewan Penasihat dan Pengawas, serta 21 orang yang tersebar di enam bidang kerja. Kepengurusan ini berlaku sampai Agustus 2031. Sesudahnya, DPD NTB wajib menggelar pemilihan kembali.'),
      h2('Dari mandat ke pelantikan dalam empat hari'),
      p('Penetapan ini berawal dari Surat Mandat DPP Nomor 001/SM/DPP PERSADHA Nusantara/VIII/2026. Prosesnya berlangsung cepat:'),
      li('18 Agustus 2026: rapat penyusunan pengurus DPD NTB digelar berdasarkan surat mandat DPP.'),
      li('20 Agustus 2026: DPP mengesahkan hasil rapat melalui SK Nomor 04.'),
      lis('21 Agustus 2026: pengurus ', tautan('dilantik di Fizz Hotel Mataram', `${BASE_AWAL}kabar/${PELANTIKAN}/`), ' dengan tema “Meneguhkan Arah, Memperluas Gerak”.'),
      h2('Pengurus harian'),
      li('Ketua: I Putu Alit Arsana, S.H., M.Kn.'),
      li('Wakil Ketua I: Ida Bagus Benny Surya Adi Pramana, M.I.Kom.'),
      li('Wakil Ketua II: Nyoman Loji Sagita'),
      li('Sekretaris: Bagus Jaye Puspite, S.H.'),
      li('Wakil Sekretaris: Wayan Widyatmaja, S.Pd., M.Pd.'),
      li('Bendahara: Komang Agus Alit Putra, S.M.'),
      li('Wakil Bendahara: I Gede Pasek Artana, S.H.'),
      p('Dewan Penasihat dan Pengawas diketuai Nyoman Widhiarsana, S.T., bersama enam anggota.'),
      h2('Enam bidang, enam pintu pengabdian'),
      p('Setiap bidang dipimpin seorang koordinator dan membawa fokus kerjanya sendiri:'),
      lis(tebal('Organisasi, Keanggotaan, dan Kaderisasi'), ' (Putu Witendra Mahardika, S.Pd.H.): pendataan anggota, pelatihan kader muda, dan kepemimpinan di kabupaten dan kota.'),
      lis(tebal('Sosial Ekonomi'), ' (I Ketut Kasih Adnyana, S.TP.): penguatan UMKM umat Hindu, pelatihan kewirausahaan, serta bakti sosial dan tanggap bencana.'),
      lis(tebal('Penelitian dan Pengembangan'), ' (I Gede Wira Aditya Tanaya, S.I.Kom.): riset sosial-keagamaan, kajian hukum dan kelembagaan Hindu, serta literasi digital.'),
      lis(tebal('Agama, Budaya, dan Lingkungan'), ' (Ida Bagus Ary Siswantara, S.H., M.I.Kom.): pelestarian tradisi Hindu Nusantara, dokumentasi warisan budaya, dan gerakan pelestarian lingkungan.'),
      lis(tebal('Hubungan Masyarakat dan Antarlembaga Hindu'), ' (I Wayan Sutawa, S.Pd., S.H., M.I.Kom.): media dan publikasi organisasi, kerja sama dengan lembaga Hindu, serta dialog lintas agama.'),
      lis(tebal('Pergerakan Sosial Politik, Hukum, dan Advokasi'), ' (I Made Agus Artana, S.H., M.H.): pendampingan hukum lewat layanan pengaduan, rekomendasi kebijakan untuk pemerintah daerah, dan forum diskusi kebijakan publik.'),
      h2('Apa artinya bagi umat'),
      p('Dengan terbentuknya DPD NTB, umat Hindu dari Lombok sampai Sumbawa memiliki saluran resmi untuk menyampaikan persoalan dan gagasan. Melalui situs ini, umat dapat:'),
      lis('Melaporkan persoalan seperti hambatan beribadah atau sengketa tanah pura lewat ', tautan('layanan pengaduan', `${BASE_AWAL}layanan/aduan/`), '.'),
      lis('Menyampaikan usulan dan kritik kepada pengurus lewat ', tautan('layanan aspirasi', `${BASE_AWAL}layanan/aspirasi/`), '.'),
      lis('Mendaftar sebagai anggota dan memilih bidang yang ingin diikuti lewat ', tautan('layanan keanggotaan', `${BASE_AWAL}layanan/anggota/`), '.'),
      pp('Susunan lengkap pengurus, termasuk anggota tiap bidang, dapat dibaca di ', tautan('halaman Tentang', `${BASE_AWAL}tentang/#pengurus`), '.'),
    ),
  },
  // 23 Nov 2026: ditulis ulang (pemilik), sampul = ilustrasi buatan sendiri (skrip/ilustrasi-kemenkum.html).
  {
    slug: KEMENKUM,
    judul: 'Kemenkum Sahkan Kepengurusan Baru DPP Persadha Nusantara, Sekretariat Pusat Pindah ke Jakarta',
    kategori: 'Berita',
    penulis: 'Sekretariat DPD NTB',
    terbitPada: wib('2025-12-08'),
    ringkasan: 'Keputusan Menteri Hukum Nomor AHU-0002242.AH.01.08.TAHUN 2025 mengesahkan kepengurusan DPP masa bhakti 2025–2030 di bawah Ketua Umum D. Sures Kumar sekaligus perpindahan sekretariat pusat dari Denpasar ke Jakarta Selatan.',
    sampul: media(KEMENKUM, 'sampul.jpg'),
    sampulKecil: media(KEMENKUM, 'sampul-kecil.jpg'),
    keteranganSampul: 'Ilustrasi: pengesahan perubahan perkumpulan oleh Menteri Hukum, 8 Desember 2025.',
    delta: jadi(
      p('Persadha Nusantara memasuki babak baru. Pada 8 Desember 2025, Menteri Hukum menyetujui perubahan Perkumpulan Pergerakan Sanatana Dharma Nusantara (Persadha Nusantara) melalui Keputusan Nomor AHU-0002242.AH.01.08.TAHUN 2025. Persetujuan ini mengesahkan kepengurusan Dewan Pimpinan Pusat (DPP) masa bhakti 2025–2030 sekaligus perpindahan sekretariat pusat dari Denpasar ke Jakarta Selatan.'),
      h2('Dari rapat pengurus ke keputusan menteri'),
      p('Perubahan itu diputuskan dalam Rapat Pengurus pada 29 November 2025. Hasil rapat dituangkan dalam Akta Nomor 01 tanggal 4 Desember 2025 yang dibuat di hadapan Notaris Siti Susyanthi, S.H., M.Kn. Empat hari kemudian, Menteri Hukum menerbitkan persetujuannya.'),
      p('Sejak itu, sekretariat DPP beralamat di Jl. Sawah Lunto No. 50, Pasar Manggis, Setiabudi, Jakarta Selatan.'),
      h2('Pengurus DPP 2025–2030'),
      li('Ketua Umum: D. Sures Kumar, S.Ag., M.Si.'),
      li('Wakil Ketua Umum: Gede Suardana'),
      li('Sekretaris Jenderal: Anak Agung Ayu Ari Widhyasari, S.H., M.Kn.'),
      li('Bendahara Umum: Komang Juli Agustawan'),
      li('Wakil Ketua: I Gede Ariawan, Yan Mitha Djaksana, I Made Sudanayasa, dan I Made Bawayasa'),
      li('Pengawas: Gede Pasek Suardika, S.H., M.H., I Wayan Jondra, dan I Ketut Wiriana'),
      h2('Jejak legalitas Persadha Nusantara'),
      li('28 Desember 2018: Persadha Nusantara didirikan di Denpasar dengan Akta Nomor 15 di hadapan Notaris I Wayan Gede Darma Yuda, S.H., M.Kn.'),
      li('2 Januari 2019: Menteri Hukum dan HAM mengesahkan pendirian perkumpulan lewat Surat Keputusan AHU-0016053.AH.01.07.TAHUN 2018.'),
      li('29 November 2025: Rapat Pengurus memilih kepengurusan DPP 2025–2030 dan memindahkan sekretariat pusat ke Jakarta Selatan.'),
      li('8 Desember 2025: Menteri Hukum menyetujui perubahan perkumpulan lewat Keputusan AHU-0002242.AH.01.08.TAHUN 2025.'),
      lis('20 Agustus 2026: DPP ', tautan('menetapkan pengurus DPD Provinsi NTB', `${BASE_AWAL}kabar/${DPP_NTB}/`), ' masa bhakti 2026–2031.'),
      h2('Mengapa penting bagi DPD NTB'),
      p('Keputusan Menteri Hukum ini menjadi dasar hukum bagi DPP untuk membentuk kepengurusan di daerah. Atas dasar itulah DPP menetapkan pengurus DPD Provinsi Nusa Tenggara Barat pada Agustus 2026. Setiap langkah DPD NTB dalam mendampingi umat berpijak pada legalitas organisasi yang sah dan tercatat di negara.'),
      pp('Rincian dokumen legal organisasi dapat dilihat di ', tautan('halaman Tentang', `${BASE_AWAL}tentang/#legalitas`), '.'),
    ),
  },
];
