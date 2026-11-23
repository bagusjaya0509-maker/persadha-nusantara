// Tujuh opini sikap DPD Persadha Nusantara NTB (23 Nov 2026, permintaan pemilik).
// Setiap opini berangkat dari persoalan nyata yang ada sumbernya (dicantumkan di akhir tulisan),
// memuat dasar hukum dan ajaran Hindu. Foto sampul = foto nyata berlisensi bebas dari Wikimedia Commons;
// kredit fotografer + lisensi WAJIB tetap di keteranganSampul. Fakta yang tidak ada sumbernya jangan ditambahkan.

const BASE = (typeof document !== 'undefined' && document.documentElement.dataset.base) || globalThis.BASE_SITUS || '/';
const media = (slug, berkas) => `${BASE}aset/img/kabar/${slug}/${berkas}`;
// Opini yang fotonya sudah ada di aset/img/kabar/<slug>/. Yang belum memakai sampul gerbang bawaan (sampul kosong).
// 23 Nov: Wikimedia memblokir unduhan (429); tambahkan slug ke sini begitu fotonya masuk.
const ADA_FOTO = new Set(['opini-suara-umat-hindu-ntb-bukan-lumbung-suara-musiman']);
const foto = (slug, berkas) => (ADA_FOTO.has(slug) ? media(slug, berkas) : '');
const ket = (slug, teks) => (ADA_FOTO.has(slug) ? teks : '');
const s = (x) => (typeof x === 'string' ? { insert: x } : x);
const p = (...potong) => [...potong.map(s), { insert: '\n' }];
const h2 = (teks) => [{ insert: teks }, { insert: '\n', attributes: { header: 2 } }];
const li = (...potong) => [...potong.map(s), { insert: '\n', attributes: { list: 'bullet' } }];
const kutip = (...potong) => [...potong.map(s), { insert: '\n', attributes: { blockquote: true } }];
const tautan = (teks, link) => ({ insert: teks, attributes: { link } });
const miring = (teks) => ({ insert: teks, attributes: { italic: true } });
const tebal = (teks) => ({ insert: teks, attributes: { bold: true } });
const gambar = (src, alt) => [{ insert: { image: src }, attributes: { alt } }, { insert: '\n' }];
const jadi = (...potong) => JSON.stringify(potong.flat());
const wita = (tgl, jam) => Date.parse(`${tgl}T${jam}:00+08:00`);
const sumber = (...daftar) => [h2('Sumber'), ...daftar.map(([teks, url]) => li(tautan(teks, url)))];

const penulis = 'DPD Persadha Nusantara NTB';
const kategori = 'Opini';
const S1 = 'opini-hak-beribadah-tidak-boleh-menunggu-restu-mayoritas';
const S2 = 'opini-anak-hindu-di-sekolah-negeri-berhak-atas-guru-agamanya';
const S3 = 'opini-pura-tanpa-sertifikat-adalah-pura-yang-menunggu-digugat';
const S4 = 'opini-ogoh-ogoh-di-bulan-ramadan-toleransi-harus-dua-arah';
const S5 = 'opini-suara-umat-hindu-ntb-bukan-lumbung-suara-musiman';
const S6 = 'opini-sawah-menyusut-tri-hita-karana-dipertaruhkan';
const S7 = 'opini-penyuluh-agama-hindu-garda-depan-yang-dibayar-setengah-hati';

export const KABAR_OPINI = [
  // ------------------------------------------------------------------ 1
  {
    slug: S1,
    judul: 'Hak Beribadah Tidak Boleh Menunggu Restu Mayoritas',
    kategori, penulis,
    terbitPada: wita('2026-11-23', '14:00'),
    ringkasan: 'Pembangunan pura di NTB berulang kali terhenti karena urusan izin. Rancangan Perpres Kerukunan masih mempertahankan syarat 90/60. Persadha Nusantara NTB meminta negara menjalankan kewajibannya memfasilitasi, bukan sekadar menunggu persetujuan.',
    sampul: foto(S1, 'sampul.jpg'),
    sampulKecil: foto(S1, 'sampul-kecil.jpg'),
    keteranganSampul: ket(S1, 'Pura Meru, Cakranegara, Kota Mataram. Foto: David Stanley, CC BY 2.0, via Wikimedia Commons.'),
    delta: jadi(
      p('Di Nusa Tenggara Barat, kabar tentang pura yang batal dibangun bukan cerita baru. Pembangunan pura di Bayan pernah diminta berhenti karena panitia tidak dapat menunjukkan izin. Pada 2018, pembangunan Pura Awan Rinjani di Lombok Utara dihentikan setelah rapat FKUB dan Kesbangpol menilai persyaratan teknis dan administratif belum terpenuhi, termasuk status tanahnya. Di Dompu, sebuah pura di Desa Pancasila, Kecamatan Pekat, diprotes dan diminta ditinjau ulang izinnya.'),
      p('Setiap kasus punya duduk perkaranya sendiri, dan Persadha Nusantara tidak membela pembangunan yang menabrak aturan. Namun polanya terlalu jelas untuk diabaikan: bagi umat yang jumlahnya kecil, jalan menuju rumah ibadat selalu lebih panjang, lebih mahal, dan lebih bergantung pada kemurahan hati tetangga.'),
      h2('Aturan yang membuat minoritas menunggu'),
      p('Akar persoalannya ada pada Peraturan Bersama Menteri Agama dan Menteri Dalam Negeri Nomor 9 dan 8 Tahun 2006. Pasal 14 mensyaratkan daftar sedikitnya 90 calon pengguna, dukungan sedikitnya 60 warga setempat yang disahkan lurah atau kepala desa, serta rekomendasi kantor Kementerian Agama dan FKUB. Bagi umat Hindu di Sumbawa, Dompu, atau Bima yang tinggal tersebar dalam kelompok kecil, angka 90 saja sudah berat, apalagi 60 tanda tangan dari warga yang berbeda keyakinan.'),
      p('Pemerintah kini menyiapkan Rancangan Peraturan Presiden tentang Pemeliharaan Kerukunan Umat Beragama untuk menggantikan aturan itu. Sayangnya, versi rancangan yang dapat diakses publik masih mempertahankan syarat 90/60. Menaikkan derajat aturan menjadi Perpres tanpa memperbaiki isinya hanya akan mengawetkan masalah yang sama dengan wibawa yang lebih tinggi.'),
      h2('Dasar hukumnya jelas'),
      li('UUD 1945 Pasal 28E ayat (1) dan Pasal 29 ayat (2): negara menjamin kemerdekaan tiap penduduk untuk memeluk agama dan beribadat menurut agamanya.'),
      li('UUD 1945 Pasal 28I ayat (1): hak beragama termasuk hak yang tidak dapat dikurangi dalam keadaan apa pun. Ayat (4) menegaskan perlindungan hak asasi adalah tanggung jawab negara, terutama pemerintah.'),
      li('UU Nomor 39 Tahun 1999 tentang Hak Asasi Manusia Pasal 22: setiap orang bebas memeluk agamanya dan beribadat, dan negara menjamin kemerdekaan itu.'),
      li('PBM Nomor 9 dan 8 Tahun 2006 Pasal 14 ayat (3): bila syarat 90 pengguna terpenuhi tetapi dukungan 60 warga belum, ', tebal('pemerintah daerah berkewajiban memfasilitasi tersedianya lokasi pembangunan rumah ibadat'), '. Kewajiban ini yang paling sering dilupakan.'),
      h2('Ajaran Hindu: bumi ini rumah bersama'),
      p('Atharwaweda mengingatkan bahwa bumi menopang manusia yang berbeda bahasa dan keyakinan sebagai satu rumah:'),
      kutip(miring('Janaṁ bibhratī bahudhā vivācasaṁ nānādharmāṇaṁ pṛthivī yathaukasam.'), ' (Atharwaweda XII.1.45)'),
      p('Ajaran ini berlaku dua arah. Umat Hindu wajib menghormati tetangga yang berbeda iman, dan tetangga yang berbeda iman tidak berhak menentukan apakah umat Hindu boleh bersembahyang. Rumah ibadat bukan ancaman bagi siapa pun; ia tempat manusia belajar menjadi lebih baik.'),
      h2('Sikap Persadha Nusantara NTB'),
      li('Mendesak pemerintah pusat agar Perpres Kerukunan tidak sekadar memindahkan syarat 90/60, tetapi menjamin jalan keluar ketika dukungan warga tidak tercapai.'),
      li('Meminta pemerintah kabupaten dan kota di NTB menjalankan kewajiban Pasal 14 ayat (3) PBM 2006, yaitu memfasilitasi lokasi, bukan menghentikan proses.'),
      li('Meminta FKUB di setiap daerah memastikan keterwakilan umat Hindu dan memutus permohonan rumah ibadat secara terbuka dan tepat waktu.'),
      li('Mengajak umat Hindu yang membangun atau merenovasi pura untuk lebih dulu merapikan status tanah dan perizinan. Persadha siap mendampingi lewat layanan pengaduan.'),
      p('Kerukunan sejati tidak diukur dari sedikitnya keributan, melainkan dari terpenuhinya hak setiap warga, sekecil apa pun jumlahnya. ', tautan('Laporkan hambatan beribadah di daerah Anda', `${BASE}layanan/aduan/`), '.'),
      ...sumber(
        ['Kemenag: Pembangunan pura terbesar di Asia dihentikan', 'https://kemenag.go.id/nasional/pembangunan-pura-terbesar-di-asia-dihentikan-ec01ay'],
        ['LintasNTB (2018): Belum memenuhi persyaratan, pembangunan Pura Awan Rinjani dihentikan', 'https://www.lintasntb.com/2018/11/belum-memenuhi-persyaratan-pembangunan.html'],
        ['Jurnal Islam: Penolakan pura di Desa Pancasila, Dompu', 'https://jurnalislam.com/umat-islam-tolak-pura-terbesar-se-asia-di-dompu-ntb/'],
        ['KBB (Januari 2026): Mengganti PBM 2006 dengan Ranperpres Kerukunan', 'https://kbb.id/2026/01/13/mengganti-pbm-2006-dengan-ranperpres-kerukunan-patut-didukung-tetapi-sesudah-diperbaiki/'],
        ['Tempo: Aturan penghapusan rekomendasi FKUB menunggu persetujuan Presiden', 'https://www.tempo.co/politik/aturan-penghapusan-rekomendasi-fkub-untuk-bangun-rumah-ibadah-tunggu-persetujuan-presiden-13919'],
      ),
    ),
  },
  // ------------------------------------------------------------------ 2
  {
    slug: S2,
    judul: 'Ketika Polisi Mengajar Agama Hindu di Tambora: Anak Hindu Berhak atas Guru Agamanya',
    kategori, penulis,
    terbitPada: wita('2026-11-23', '13:00'),
    ringkasan: 'Di SDN 02 Labuhan Kananga, Tambora, seorang Bhabinkamtibmas mengisi kekosongan guru agama Hindu bagi 17 siswa. Kepedulian itu patut dihormati, tetapi tidak boleh menjadi pengganti kewajiban negara.',
    sampul: foto(S2, 'sampul.jpg'),
    sampulKecil: foto(S2, 'sampul-kecil.jpg'),
    keteranganSampul: ket(S2, 'Ilustrasi: suasana SMPN 1 Maluk, Sumbawa Barat. Foto: Tdemonite, CC BY-SA 4.0, via Wikimedia Commons.'),
    delta: jadi(
      p('November 2026, seorang anggota Bhabinkamtibmas Polsek Tambora masuk ke kelas SDN 02 Labuhan Kananga, Kecamatan Tambora, Kabupaten Bima. Ia bukan datang untuk urusan keamanan, melainkan untuk mengajar pelajaran agama Hindu kepada 17 siswa yang selama ini tidak memiliki guru agama Hindu.'),
      p('Kami menghormati ketulusan petugas itu. Ia melakukan apa yang seharusnya dilakukan negara. Namun justru di situlah persoalannya: anak-anak Hindu di sekolah negeri tidak boleh menggantungkan pendidikan agamanya pada kebaikan hati seorang polisi.'),
      h2('Kekosongan yang sistemik'),
      p('Kasus Tambora bukan kebetulan. Pemerintah Kabupaten Sumbawa sendiri mengakui kekurangan guru agama dan guru PJOK yang disebut mencapai sekitar 70 persen sekolah, lalu menutupnya dengan guru dari bidang lain atau tenaga tidak tetap. Bila guru agama mayoritas saja kurang, guru agama Hindu untuk siswa yang tersebar dalam jumlah kecil hampir pasti tidak masuk hitungan.'),
      p('Bila dibiarkan, akibatnya mudah ditebak: siswa Hindu terpaksa duduk di kelas agama lain karena tidak punya pilihan, nilai agamanya diambil dari tugas seadanya, atau ia belajar agama hanya dari orang tua tanpa pendampingan pendidik.'),
      h2('Dasar hukumnya tegas'),
      li('UUD 1945 Pasal 31 ayat (1): setiap warga negara berhak mendapat pendidikan.'),
      li('UU Nomor 20 Tahun 2003 tentang Sistem Pendidikan Nasional Pasal 12 ayat (1) huruf a: setiap peserta didik berhak ', tebal('mendapatkan pendidikan agama sesuai dengan agama yang dianutnya dan diajarkan oleh pendidik yang seagama'), '.'),
      li('UU Sisdiknas Pasal 37 ayat (1): kurikulum pendidikan dasar dan menengah wajib memuat pendidikan agama.'),
      li('PP Nomor 55 Tahun 2007 tentang Pendidikan Agama dan Pendidikan Keagamaan, serta PMA Nomor 16 Tahun 2010 tentang Pengelolaan Pendidikan Agama pada Sekolah, mengatur penyelenggaraan pendidikan agama di sekolah, termasuk penyediaan pendidiknya.'),
      p('Kata kuncinya adalah "pendidik yang seagama". Hak itu tidak gugur karena jumlah siswanya sedikit.'),
      h2('Ajaran Hindu: guru adalah tiang peradaban'),
      kutip(miring('Mātṛdevo bhava, pitṛdevo bhava, ācāryadevo bhava.'), ' Hormatilah ibu, ayah, dan guru seperti engkau menghormati dewa. (Taittirīya Upaniṣad I.11.2)'),
      p('Hindu menempatkan guru pada kedudukan yang sangat mulia karena dari guru pengetahuan suci diwariskan. Bhagawadgita IV.38 menyatakan tidak ada yang menyucikan sebanding dengan pengetahuan. Membiarkan anak tumbuh tanpa guru agamanya sama dengan memutus mata rantai Dharma pada generasi berikutnya.'),
      h2('Sikap Persadha Nusantara NTB'),
      li('Mendesak Dinas Pendidikan provinsi dan kabupaten/kota di NTB memetakan secara terbuka sekolah yang memiliki siswa Hindu tetapi tidak memiliki guru agama Hindu.'),
      li('Meminta formasi PPPK guru agama Hindu dibuka sesuai peta kebutuhan itu, terutama untuk Sumbawa, Dompu, dan Bima.'),
      li('Mengusulkan skema guru agama Hindu kunjung (satu guru melayani beberapa sekolah) bekerja sama dengan Kantor Kemenag dan IAHN Gde Pudja Mataram, sambil menunggu formasi tetap terisi.'),
      li('Mengakui pasraman sebagai mitra resmi pendidikan agama Hindu sesuai PMA Nomor 56 Tahun 2014 tentang Pendidikan Keagamaan Hindu.'),
      li('Mengajak orang tua melaporkan sekolah yang tidak menyediakan guru agama Hindu melalui layanan pengaduan Persadha.'),
      p('Terima kasih kepada petugas di Tambora. Kini giliran negara menyelesaikan pekerjaan yang sudah ia mulai. ', tautan('Laporkan sekolah tanpa guru agama Hindu', `${BASE}layanan/aduan/`), '.'),
      ...sumber(
        ['Poros NTB (November 2026): Bhabinkamtibmas Polsek Tambora isi kekosongan guru agama Hindu di SDN 02 Labuhan Kananga', 'https://www.porosntb.com/2026/11/polisi-peduli-pendidikan.html'],
        ['Suara NTB (September 2026): Sumbawa kekurangan guru agama dan PJOK', 'https://suarantb.com/2026/09/11/sumbawa-kekurangan-guru-agama-dan-pjok/'],
        ['Lombok Post: Dikpora NTB petakan kekurangan guru', 'https://lombokpost.jawapos.com/pendidikan/2610130052/dikpora-ntb-petakan-kekurangan-guru-dan-tenaga-tu-usulan-formasi-dimatangkan'],
      ),
    ),
  },
  // ------------------------------------------------------------------ 3
  {
    slug: S3,
    judul: 'Pura Tanpa Sertifikat adalah Pura yang Menunggu Digugat',
    kategori, penulis,
    terbitPada: wita('2026-11-23', '12:00'),
    ringkasan: 'Dari 1.662 pura yang bersertifikat lewat program nasional hingga Oktober 2023, 1.359 berada di Bali. Persoalan aset Pura Lingsar menunjukkan betapa rentannya tanah pura di NTB. Sertifikasi kini gratis, dan umat harus menuntutnya.',
    sampul: foto(S3, 'sampul.jpg'),
    sampulKecil: foto(S3, 'sampul-kecil.jpg'),
    keteranganSampul: ket(S3, 'Pura Suranadi, Lombok Barat. Foto: yeowatzup, CC BY 2.0, via Wikimedia Commons.'),
    delta: jadi(
      p('Banyak pura di Lombok berdiri di atas tanah yang diwariskan turun-temurun tanpa selembar sertifikat. Selama para tetua masih hidup, semua orang tahu tanah itu milik pura. Begitu generasi berganti, ingatan bersama tidak lagi cukup di hadapan hukum.'),
      p('Pura Lingsar, simbol kerukunan Hindu dan Sasak di Lombok Barat, menjadi pengingat paling keras. Pada 2022, Majelis Agung Windu Sesukertaning Jagat Lombok melaporkan dugaan penyelewengan aset pura seluas 18,4 hektare ke kepolisian. Pada November 2023, krama dari lima banjar mendatangi Bupati Lombok Barat karena merasa pengelolaan pura dan kegiatan Pujawali diambil alih sejak 2017. Kompleks Taman Lingsar yang dahulu sekitar empat hektare kini disebut tinggal separuhnya.'),
      ...(ADA_FOTO.has(S3) ? [gambar(media(S3, 'lingsar-1929.jpg'), 'Umat membawa sesaji di Pura Lingsar pada tahun 1929'), p(miring('Umat membawa sesaji di Pura Lingsar, 1929. Foto: W.G.N. van der Sleen, koleksi Tropenmuseum, CC BY-SA 3.0, via Wikimedia Commons.'))] : []),
      p('Kami tidak menghakimi siapa yang benar dalam perkara itu; itu wewenang aparat penegak hukum. Yang kami soroti adalah pelajarannya: aset pura yang tidak tercatat rapi dan tidak dikelola terbuka akan selalu menjadi sumber sengketa, baik dengan pihak luar maupun di antara umat sendiri.'),
      h2('Ketimpangan sertifikasi'),
      p('Program nasional sertifikasi rumah ibadah mencatat 1.662 pura telah bersertifikat hingga Oktober 2023, dan 1.359 di antaranya berada di Bali. Artinya, pura di luar Bali, termasuk di NTB, baru tersentuh sedikit. Di sisi lain, percepatan sertifikasi di NTB selama ini lebih banyak menyasar tanah wakaf dan masjid. Itu baik, tetapi umat Hindu NTB juga warga negara yang berhak atas perlakuan yang sama. Menteri ATR/BPN sendiri pada Agustus 2026 menegaskan sertifikasi rumah ibadah tidak dipungut biaya dan berlaku untuk pura.'),
      h2('Dasar hukum'),
      li('UUD 1945 Pasal 28D ayat (1): setiap orang berhak atas pengakuan, jaminan, perlindungan, dan kepastian hukum yang adil.'),
      li('UU Nomor 5 Tahun 1960 tentang Peraturan Dasar Pokok-Pokok Agraria Pasal 49: hak milik tanah badan keagamaan yang dipergunakan untuk kegiatan keagamaan diakui dan dilindungi, dan untuk keperluan peribadatan dapat diberikan tanah dengan hak pakai.'),
      li('UUPA Pasal 19 dan PP Nomor 24 Tahun 1997 tentang Pendaftaran Tanah: pendaftaran tanah adalah jalan menuju kepastian hukum.'),
      h2('Ajaran Hindu'),
      p('Parhyangan, hubungan harmonis dengan Hyang Widhi, adalah satu dari tiga unsur Tri Hita Karana. Menjaga tanah pura berarti menjaga parhyangan itu sendiri. Pengelolanya pun terikat pada satya, yaitu kejujuran. Aset pura adalah milik Ida Bhatara dan umat, bukan milik pengurus.'),
      kutip(miring('Dharma eva hato hanti, dharmo rakṣati rakṣitaḥ.'), ' Dharma yang dirusak akan menghancurkan; Dharma yang dijaga akan melindungi. (Manawa Dharmasastra VIII.15)'),
      h2('Sikap Persadha Nusantara NTB'),
      li('Meminta Kantor Wilayah BPN NTB membuka program sertifikasi tanah pura dan setra yang setara dengan program tanah wakaf, bekerja sama dengan PHDI NTB dan majelis umat.'),
      li('Mendorong setiap pengempon pura menginventarisasi tanah, batas, dan dokumen yang ada, lalu mengajukan sertifikat.'),
      li('Meminta pengelolaan aset pura, termasuk parkir dan sewa lahan, dicatat dan dilaporkan terbuka kepada krama.'),
      li('Mendorong penyelesaian perkara Pura Lingsar yang adil, transparan, dan tuntas, dengan menghormati proses hukum dan musyawarah adat.'),
      p('Persadha siap membantu pengempon pura yang ingin mengurus sertifikat atau menghadapi klaim atas tanah pura. ', tautan('Hubungi kami lewat layanan pengaduan', `${BASE}layanan/aduan/`), '.'),
      ...sumber(
        ['Topik Terkini (2022): Umat Hindu desak proses hukum penyelewengan aset Pura Lingsar', 'https://topikterkini.com/2022/02/24/umat-hindu-desak-proses-hukum-penyelewengan-aset-pura-lingsar/'],
        ['Inside Lombok (2023): Krama Pura Lingsar datangi Bupati Lombok Barat', 'https://insidelombok.id/lombok-barat/ada-saling-klaim-kepanitiaan-jelang-perayaan-pujawali-dan-perang-topat-krama-pura-lingsar-datangi-bupati/'],
        ['Medcom: Target sertifikasi tanah rumah ibadah, termasuk pura', 'https://www.medcom.id/nasional/daerah/9K5DA1nk-serahkan-sertifikat-pura-menteri-atr-bpn-target-semua-tanah-rumah-ibadah-tersertifikasi'],
        ['RRI (Agustus 2026): Menteri Nusron percepat sertifikasi rumah ibadah', 'https://rri.co.id/ende/asta-cita/2630602/menteri-nusron-percepat-sertipikasi-rumah-ibadah-di-ntt'],
        ['Wikipedia: Pura Lingsar', 'https://en.wikipedia.org/wiki/Pura_Lingsar'],
      ),
    ),
  },
  // ------------------------------------------------------------------ 4
  {
    slug: S4,
    judul: 'Ogoh-Ogoh di Bulan Ramadan: Toleransi Harus Dua Arah',
    kategori, penulis,
    terbitPada: wita('2026-11-23', '11:00'),
    ringkasan: 'Nyepi 2026 di Mataram berlangsung damai di tengah Ramadan, tetapi jumlah ogoh-ogoh turun dari 182 menjadi 105. Kesepakatan yang adil patut dihargai, asalkan tidak berubah menjadi pembatasan yang menetap.',
    sampul: foto(S4, 'sampul.jpg'),
    sampulKecil: foto(S4, 'sampul-kecil.jpg'),
    keteranganSampul: ket(S4, 'Pawai ogoh-ogoh di Lombok, 10 Maret 2024. Foto: Didik Aryawiranata, CC BY-SA 4.0, via Wikimedia Commons.'),
    delta: jadi(
      p('Maret 2026 menghadirkan ujian langka bagi kerukunan di Mataram: Nyepi jatuh di tengah Ramadan, dan malam takbiran Idulfitri berdekatan dengan rangkaian Tawur Kesanga. Hasilnya patut disyukuri. Pawai ogoh-ogoh pada 18 Maret berlangsung tertib, ribuan warga lintas agama menonton, dan Gubernur NTB menyebutnya lancar, aman, dan damai tanpa gesekan.'),
      p('Keberhasilan itu lahir dari kesepakatan. Pawai dijadwalkan sejak pukul 12.00 WITA dan diupayakan selesai sebelum magrib, tanpa pengeras suara, tanpa senjata tajam, minuman keras, dan petasan. Peserta diatur melalui kesepakatan dengan FKUB. Pembatasan juga berlaku bagi saudara Muslim: pawai takbiran dibatasi di tingkat kecamatan, tanpa kendaraan roda tiga dan empat, dan berakhir pukul 22.00 WITA.'),
      h2('Yang patut dihargai, yang patut dicermati'),
      p('Persadha Nusantara NTB menghargai bahwa pembatasan itu berlaku timbal balik dan dirundingkan, bukan dipaksakan. Itulah wujud toleransi yang sehat. Namun ada satu angka yang perlu dicermati bersama: jumlah ogoh-ogoh yang turun ke jalan merosot dari 182 pada tahun sebelumnya menjadi 105. Sebagian karena penyesuaian Ramadan, sebagian karena aturan satu peserta per banjar dan larangan peserta dari luar kota.'),
      p('Pengorbanan seperti itu kami terima dengan ikhlas demi menghormati saudara yang berpuasa. Yang tidak boleh terjadi adalah pembatasan yang sifatnya darurat menjadi kebiasaan, lalu menjadi aturan, lalu menjadi alasan menolak pawai pada tahun-tahun ketika tidak ada lagi irisan hari raya.'),
      h2('Dasar hukum'),
      li('UUD 1945 Pasal 28E ayat (1) dan Pasal 29 ayat (2): kemerdekaan beribadat dijamin negara.'),
      li('UUD 1945 Pasal 28I ayat (3): identitas budaya dan hak masyarakat tradisional dihormati selaras dengan perkembangan zaman. Ogoh-ogoh adalah ekspresi budaya keagamaan yang dilindungi.'),
      li('UU Nomor 5 Tahun 2017 tentang Pemajuan Kebudayaan: negara wajib melindungi, mengembangkan, memanfaatkan, dan membina objek kebudayaan, termasuk ritus dan adat istiadat.'),
      li('Perpres Nomor 58 Tahun 2023 tentang Penguatan Moderasi Beragama: moderasi menuntut sikap adil dan berimbang kepada semua umat.'),
      h2('Ajaran Hindu'),
      p('Ogoh-ogoh melambangkan bhuta kala, kekuatan negatif yang diarak lalu dilebur sebelum umat memasuki Catur Brata Penyepian: amati geni, amati karya, amati lelungan, dan amati lelanguan. Inti Nyepi adalah pengendalian diri. Karena itu, umat Hindu mampu menahan diri ketika diminta. Ajaran ', miring('Tat Twam Asi'), ' (Chandogya Upanisad VI.8.7), "engkau adalah aku", mengajarkan bahwa menghormati puasa saudara kita sama dengan menghormati diri sendiri.'),
      h2('Sikap Persadha Nusantara NTB'),
      li('Menyatakan terima kasih kepada Pemprov NTB, Pemkot Mataram, aparat keamanan, FKUB, dan seluruh warga yang menjaga Nyepi 2026 tetap damai.'),
      li('Meminta setiap pembatasan pawai ogoh-ogoh dituangkan sebagai kesepakatan untuk tahun berjalan saja, bukan aturan tetap.'),
      li('Meminta pemuda Hindu, banjar, dan Majelis dilibatkan sejak awal dalam setiap rapat FKUB yang menyangkut perayaan Hindu.'),
      li('Mengajak banjar menjaga pawai tetap bersih dari minuman keras dan petasan, karena tertib dari dalam adalah pembela terbaik bagi tradisi kita.'),
      p('Toleransi yang hanya diminta dari satu pihak bukan toleransi, melainkan kewajiban sepihak. Mataram 2026 membuktikan toleransi dua arah itu mungkin. Tugas kita menjaganya tetap adil.'),
      ...sumber(
        ['ANTARA Mataram: Ogoh-ogoh Mataram 2026, riuh budaya di tengah harmoni Ramadan', 'https://mataram.antaranews.com/berita/543298/ogoh-ogoh-mataram-2026-riuh-budaya-di-tengah-harmoni-ramadhan'],
        ['Suara NTB (18 Maret 2026): Gubernur NTB lepas parade ogoh-ogoh', 'https://suarantb.com/2026/03/18/lepas-parade-ogoh-ogoh-di-mataram-gubernur-ntb-tekankan-soal-toleransi/'],
        ['Inside Lombok: Ogoh-ogoh tahun ini berkurang drastis', 'https://insidelombok.id/mataram/ogoh-ogoh-tahun-ini-berkurang-drastis-pemuda-hindu-lombok-ingatkan-peserta-jaga-toleransi-saat-ramadan/'],
        ['RRI: Nyepi dan Lebaran berdekatan, aturan perayaan di Kota Mataram', 'https://rri.co.id/mataram/hukum/hukum/2261744/nyepi-dan-lebaran-berdekatan-simak-aturan-perayaannya-di-kota-mataram'],
      ),
    ),
  },
  // ------------------------------------------------------------------ 5
  {
    slug: S5,
    judul: 'Suara Umat Hindu NTB Bukan Lumbung Suara Musiman',
    kategori, penulis,
    terbitPada: wita('2026-11-23', '10:00'),
    ringkasan: 'Lebih dari 133 ribu umat Hindu tinggal di NTB, sebagian besar di Mataram dan Lombok Barat. Menjelang pemilu, mereka selalu didatangi. Persadha Nusantara NTB tidak berpihak pada partai mana pun, tetapi berpihak pada agenda umat.',
    sampul: foto(S5, 'sampul.jpg'),
    sampulKecil: foto(S5, 'sampul-kecil.jpg'),
    keteranganSampul: ket(S5, 'Bale Kambang di Taman Mayura, Cakranegara. Foto: David Stanley, CC BY 2.0, via Wikimedia Commons.'),
    delta: jadi(
      p('Data kependudukan 2024 mencatat 133.597 umat Hindu di Nusa Tenggara Barat, sekitar 2,36 persen penduduk. Lebih dari tiga perempatnya tinggal di dua daerah: 63.067 jiwa di Kota Mataram dan 38.656 jiwa di Lombok Barat. Di sejumlah daerah pemilihan, jumlah itu cukup untuk menentukan siapa yang duduk di kursi wakil rakyat.'),
      p('Karena itu, setiap menjelang pemilu, pura dan banjar ramai didatangi. Ada yang membawa bantuan, ada yang ikut persembahyangan, ada yang menjanjikan perbaikan jalan menuju pura. Setelah hari pemungutan suara, kunjungan itu biasanya berhenti, dan persoalan umat kembali menunggu lima tahun berikutnya.'),
      h2('Persadha tidak berpartai, tetapi tidak netral terhadap ketidakadilan'),
      p('Anggaran Dasar Persadha Nusantara menegaskan organisasi ini tidak terlibat dengan partai politik mana pun. Kami tidak akan mengarahkan umat memilih calon tertentu. Namun tidak berpartai bukan berarti diam. Tugas kami adalah memastikan suara umat ditukar dengan komitmen nyata, bukan dengan amplop dan baliho.'),
      p('Agenda umat Hindu NTB sebenarnya sudah jelas dan bisa ditagih: guru agama Hindu di sekolah negeri, kemudahan izin dan sertifikat tanah pura, perlindungan setra, keadilan dalam bantuan keagamaan, serta jaminan beribadah tanpa rasa cemas. Calon wakil rakyat dan calon kepala daerah yang meminta suara umat Hindu harus berani menjawab agenda itu secara tertulis.'),
      h2('Dasar hukum'),
      li('UUD 1945 Pasal 28D ayat (3): setiap warga negara berhak memperoleh kesempatan yang sama dalam pemerintahan.'),
      li('UU Nomor 7 Tahun 2017 tentang Pemilihan Umum Pasal 280 ayat (1): pelaksana, peserta, dan tim kampanye dilarang menghina agama, menghasut dan mengadu domba, serta menjanjikan atau memberikan uang atau materi lainnya kepada peserta kampanye. Pelanggaran politik uang diancam pidana dalam Pasal 523.'),
      li('UU Nomor 10 Tahun 2016 tentang Pemilihan Kepala Daerah Pasal 187A: memberi uang atau materi untuk memengaruhi pemilih adalah tindak pidana, dan pemilih yang menerima juga dapat dipidana.'),
      h2('Ajaran Hindu: pemimpin dinilai dari lakunya'),
      kutip(miring('Yad yad ācarati śreṣṭhas tat tad evetaro janaḥ.'), ' Apa pun yang dilakukan orang besar akan diikuti orang banyak. (Bhagawadgita III.21)'),
      p('Ajaran Asta Brata dalam Kakawin Ramayana, nasihat Sri Rama kepada Wibisana, menuntut pemimpin meneladani delapan sifat dewa: Indra yang menyejahterakan, Yama yang adil, Surya yang menerangi, Candra yang menyejukkan, Bayu yang memahami rakyat, Kuwera yang mengelola harta dengan bijak, Baruna yang berwawasan luas, dan Agni yang membakar semangat. Ukuran ini kami tawarkan kepada umat saat menimbang calon, apa pun partainya.'),
      h2('Sikap Persadha Nusantara NTB'),
      li('Mengajak umat Hindu NTB menggunakan hak pilih secara cerdas, menolak politik uang, dan melaporkannya kepada Bawaslu.'),
      li('Meminta partai politik dan calon tidak menjadikan pura, upacara, dan banjar sebagai panggung kampanye.'),
      li('Akan menyusun agenda umat Hindu NTB secara terbuka dan menyampaikannya kepada setiap calon menjelang pemilu, lalu memantau pemenuhannya selama masa jabatan.'),
      li('Mendorong anggota DPRD dari dapil yang banyak dihuni umat Hindu untuk membuka ruang aspirasi rutin, bukan hanya pada masa kampanye.'),
      p('Suara umat Hindu NTB terlalu berharga untuk ditukar lima tahun sekali. ', tautan('Sampaikan aspirasi Anda kepada pengurus', `${BASE}layanan/aspirasi/`), '.'),
      ...sumber(
        ['Databoks: Statistik penduduk beragama Hindu di NTB 2019–2024', 'https://databoks.katadata.co.id/en/demographics/statistics/15cfadbb965c1f0/statistics-on-the-hindu-population-in-west-nusa-tenggara-2019-2024'],
        ['detikBali: KPU tetapkan 65 caleg DPRD NTB terpilih periode 2024–2029', 'https://www.detik.com/bali/nusra/d-7392596/kpu-resmi-tetapkan-65-caleg-dprd-ntb-terpilih-periode-2024-2029'],
      ),
    ),
  },
  // ------------------------------------------------------------------ 6
  {
    slug: S6,
    judul: 'Sawah Menyusut, Tri Hita Karana Dipertaruhkan',
    kategori, penulis,
    terbitPada: wita('2026-11-23', '09:00'),
    ringkasan: 'Lahan sawah dilindungi di Mataram tinggal sekitar 509 hektare dan terus tergerus perumahan. Bagi umat Hindu, sawah bukan sekadar lahan produksi, tetapi bagian dari ajaran palemahan. Persadha mendesak perlindungan nyata, bukan sekadar peta.',
    sampul: foto(S6, 'sampul.jpg'),
    sampulKecil: foto(S6, 'sampul-kecil.jpg'),
    keteranganSampul: ket(S6, 'Sawah di Lombok. Foto: Lasthib, CC0, via Wikimedia Commons.'),
    delta: jadi(
      p('Di Mataram, sawah yang tersisa makin sempit. Luas lahan sawah dilindungi di kota ini sekitar 509 hektare, dan Komisi Pemberantasan Korupsi sampai ikut menyoroti penyusutannya. Penyebab utamanya perumahan dan perkantoran. Di Lombok Barat, pemerintah menetapkan 12.331 hektare lahan pertanian pangan berkelanjutan di sepuluh kecamatan, tetapi kawasan yang berbatasan dengan Mataram, seperti Labuapi, terus ditekan perluasan kota.'),
      p('Bagi umat Hindu di Lombok, berita ini menyentuh lebih dari sekadar urusan pangan. Banyak keluarga Hindu di Mataram dan Lombok Barat adalah petani dan anggota subak. Di sawah ada pura subak dan upacara yang mengikuti siklus tanam. Ketika sawah berganti perumahan, yang hilang bukan hanya padi, tetapi juga ruang hidup sebuah tradisi.'),
      h2('Kebijakan sudah ada, keberanian yang kurang'),
      p('Pemerintah Provinsi NTB pada Mei 2025 menyatakan memperketat alih fungsi lahan pertanian dan hanya mengizinkannya untuk kebutuhan mendesak seperti proyek strategis nasional, kepentingan umum, dan bencana. Sikap ini kami dukung. Namun aturan yang ketat di atas kertas tidak berarti apa-apa bila izin perumahan tetap terbit di atas sawah produktif.'),
      h2('Dasar hukum'),
      li('UUD 1945 Pasal 28H ayat (1): setiap orang berhak mendapat lingkungan hidup yang baik dan sehat. Pasal 33 ayat (3): bumi, air, dan kekayaan alam dipergunakan untuk sebesar-besar kemakmuran rakyat.'),
      li('UU Nomor 41 Tahun 2009 tentang Perlindungan Lahan Pertanian Pangan Berkelanjutan: lahan yang sudah ditetapkan sebagai lahan pertanian pangan berkelanjutan dilindungi dan dilarang dialihfungsikan, kecuali untuk kepentingan umum dengan syarat ketat dan kewajiban mengganti lahan.'),
      li('UU Nomor 32 Tahun 2009 tentang Perlindungan dan Pengelolaan Lingkungan Hidup Pasal 65 ayat (1): hak atas lingkungan hidup yang baik dan sehat adalah bagian dari hak asasi manusia.'),
      h2('Ajaran Hindu: palemahan adalah ibadah'),
      p('Tri Hita Karana menyebut tiga sumber kesejahteraan: parhyangan (hubungan dengan Tuhan), pawongan (hubungan dengan sesama), dan palemahan (hubungan dengan alam). Merusak sawah demi keuntungan sesaat berarti mencederai salah satu tiang itu.'),
      kutip(miring('Annād bhavanti bhūtāni parjanyād anna-sambhavaḥ.'), ' Makhluk hidup berasal dari makanan, makanan berasal dari hujan. (Bhagawadgita III.14)'),
      p('Bhagawadgita menempatkan pangan, hujan, dan yajña dalam satu lingkaran kehidupan. Menjaga sawah adalah bagian dari yajña itu.'),
      h2('Sikap Persadha Nusantara NTB'),
      li('Mendesak Pemkot Mataram dan Pemkab Lombok Barat menghentikan penerbitan izin perumahan di atas lahan sawah dilindungi dan lahan pertanian pangan berkelanjutan.'),
      li('Meminta peta lahan pertanian pangan berkelanjutan diumumkan terbuka agar warga dapat ikut mengawasi.'),
      li('Mendorong pemerintah daerah memberi insentif bagi petani dan subak yang mempertahankan sawahnya, termasuk keringanan pajak bumi dan bangunan.'),
      li('Mengajak krama subak dan pengempon pura subak mendokumentasikan wilayah dan tradisinya, sebagai dasar perlindungan budaya.'),
      p('Kota yang maju tidak harus mengubur sawahnya. Persadha mengundang petani, subak, dan warga yang lahannya terancam untuk ', tautan('menyampaikan aspirasi', `${BASE}layanan/aspirasi/`), ' kepada kami.'),
      ...sumber(
        ['detikBali: KPK soroti menyusutnya lahan sawah dilindungi di Mataram', 'https://www.detik.com/bali/nusra/d-7572315/kpk-soroti-menyusutnya-lahan-sawah-dilindungi-di-mataram'],
        ['detikBali: 12.331 ha lahan di Lombok Barat jadi LP2B', 'https://www.detik.com/bali/nusra/d-7708624/12-331-ha-lahan-di-lombok-barat-jadi-lp2b-tak-boleh-dibangun-rumah-industri'],
        ['Suara.com (Mei 2025): Alih fungsi lahan di NTB diperketat', 'https://www.suara.com/news/2025/05/06/185956/alih-fungsi-lahan-di-ntb-diperketat'],
        ['Jurnal Universitas Mataram: tekanan alih fungsi sawah di Labuapi', 'https://journal.unram.ac.id/index.php/jima/en/article/view/10417'],
      ),
    ),
  },
  // ------------------------------------------------------------------ 7
  {
    slug: S7,
    judul: 'Penyuluh Agama Hindu: Garda Depan yang Dibayar Setengah Hati',
    kategori, penulis,
    terbitPada: wita('2026-11-23', '08:00'),
    ringkasan: 'Di Kota Mataram, pembinaan umat Hindu banyak bertumpu pada 21 penyuluh non-PNS, dan kajian menyebut jumlah itu masih jauh dari kebutuhan. Honor mereka bertahun-tahun di kisaran Rp500 ribu per bulan. Negara tidak boleh membiarkan garda depan pembinaan umat bekerja dalam ketidakpastian.',
    sampul: foto(S7, 'sampul.jpg'),
    sampulKecil: foto(S7, 'sampul-kecil.jpg'),
    keteranganSampul: ket(S7, 'Pura Suranadi, Lombok Barat. Foto: yeowatzup, CC BY 2.0, via Wikimedia Commons.'),
    delta: jadi(
      p('Ketika umat Hindu di sebuah banjar kecil membutuhkan pendampingan, entah untuk belajar sembahyang, menyiapkan upacara, menghadapi persoalan keluarga, atau sekadar ingin memahami ajaran agamanya, yang datang biasanya bukan pejabat, melainkan penyuluh agama. Merekalah garda depan pembinaan umat.'),
      p('Kajian tentang penyuluhan agama Hindu di Kota Mataram yang terbit di jurnal IAHN Gde Pudja Mataram mencatat bahwa keterbatasan penyuluh PNS membuat penyuluh non-PNS sangat penting, karena tidak semua wilayah dapat dijangkau. Kajian yang sama menyebut 21 penyuluh non-PNS di Mataram sangat membantu, tetapi jumlahnya masih jauh dari kebutuhan umat. Kajian itu juga mengaitkan tugas penyuluh dengan upaya mencegah umat meninggalkan agamanya karena tidak mendapat pembinaan.'),
      h2('Pengabdian tanpa kepastian'),
      p('Honor penyuluh agama non-PNS bertahun-tahun berada di kisaran Rp500 ribu per bulan. Pada 2023, Menteri Agama mengusulkan kenaikan menjadi Rp1,5 juta per bulan. Usulan itu patut didukung, tetapi persoalannya bukan hanya besaran honor. Penyuluh non-PNS juga hidup tanpa kepastian status, tanpa biaya perjalanan yang memadai untuk menjangkau umat di Sumbawa, Dompu, dan Bima yang tinggal berjauhan, dan tanpa jenjang karier.'),
      h2('Dasar hukum'),
      li('UUD 1945 Pasal 29 ayat (2): negara menjamin kemerdekaan tiap penduduk untuk memeluk agama dan beribadat. Jaminan itu mencakup layanan pembinaan agama yang disediakan negara melalui Kementerian Agama.'),
      li('UUD 1945 Pasal 27 ayat (2): tiap warga negara berhak atas pekerjaan dan penghidupan yang layak bagi kemanusiaan.'),
      li('UU Nomor 20 Tahun 2023 tentang Aparatur Sipil Negara membuka jalur Pegawai Pemerintah dengan Perjanjian Kerja (PPPK) yang dapat dimanfaatkan untuk mengangkat penyuluh agama yang sudah lama mengabdi.'),
      li('Perpres Nomor 58 Tahun 2023 tentang Penguatan Moderasi Beragama menempatkan penyuluh agama sebagai ujung tombak moderasi di tengah masyarakat.'),
      h2('Ajaran Hindu'),
      p('Dalam Hindu, menyebarkan pengetahuan suci adalah ', miring('jnana yajna'), ', persembahan yang paling utama. Bhagawadgita IV.33 mengajarkan bahwa persembahan berupa pengetahuan lebih mulia daripada persembahan berupa benda. Para penyuluh menjalankan yajña itu setiap hari. Sudah sepatutnya negara dan umat membalasnya dengan penghargaan yang layak.'),
      kutip(miring('Śreyān dravyamayād yajñāj jñānayajñaḥ parantapa.'), ' Persembahan berupa pengetahuan lebih utama daripada persembahan berupa benda. (Bhagawadgita IV.33)'),
      h2('Sikap Persadha Nusantara NTB'),
      li('Mendesak Kementerian Agama merealisasikan kenaikan honor penyuluh agama non-PNS dan memberi biaya operasional perjalanan bagi penyuluh di wilayah terpencil.'),
      li('Meminta formasi PPPK penyuluh agama Hindu dibuka untuk NTB, dengan prioritas bagi penyuluh non-PNS yang telah lama mengabdi.'),
      li('Meminta Kanwil Kemenag NTB menambah penyuluh agama Hindu di daerah dengan umat yang tersebar, khususnya Sumbawa, Dompu, dan Bima.'),
      li('Mengajak banjar, pasraman, dan organisasi Hindu di NTB bergotong royong mendukung penyuluh di wilayahnya.'),
      p('Pembinaan umat tidak bisa dijalankan dengan semangat saja. Ia membutuhkan orang, dan orang itu membutuhkan penghidupan yang layak. ', tautan('Sampaikan kebutuhan pembinaan di banjar Anda', `${BASE}layanan/aspirasi/`), '.'),
      ...sumber(
        ['Telaksana, Sumertha, Wirata: Strategi Komunikasi Penyuluh Agama Hindu dalam Meminimalisir Konversi Agama Umat Hindu di Kota Mataram (IAHN Gde Pudja Mataram)', 'https://e-journal.iahn-gdepudja.ac.id/index.php/SN/article/download/231/123'],
        ['NU Online: Honor penyuluh agama non-PNS diusulkan naik', 'https://nu.or.id/nasional/honor-penyuluh-agama-non-pns-diusulkan-naik-ini-besarannya-36btO'],
        ['RMOL (2023): Menag usul honor penyuluh agama non-PNS dinaikkan', 'https://rmol.id/politik/read/2023/09/01/587251/menag-usul-honor-penyuluh-agama-non-pns-dinaikkan'],
      ),
    ),
  },
];
