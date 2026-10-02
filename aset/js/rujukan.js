// Daftar baku yang dipakai formulir, akun, dan panel pengurus.

export const PROVINSI = [
  'Aceh', 'Sumatera Utara', 'Sumatera Barat', 'Riau', 'Kepulauan Riau', 'Jambi', 'Sumatera Selatan', 'Kepulauan Bangka Belitung',
  'Bengkulu', 'Lampung', 'DKI Jakarta', 'Banten', 'Jawa Barat', 'Jawa Tengah', 'DI Yogyakarta', 'Jawa Timur', 'Bali',
  'Nusa Tenggara Barat', 'Nusa Tenggara Timur', 'Kalimantan Barat', 'Kalimantan Tengah', 'Kalimantan Selatan', 'Kalimantan Timur',
  'Kalimantan Utara', 'Sulawesi Utara', 'Gorontalo', 'Sulawesi Tengah', 'Sulawesi Barat', 'Sulawesi Selatan', 'Sulawesi Tenggara',
  'Maluku', 'Maluku Utara', 'Papua', 'Papua Barat', 'Papua Barat Daya', 'Papua Tengah', 'Papua Pegunungan', 'Papua Selatan', 'Luar negeri',
];

export const KATEGORI_ADUAN = [
  { kunci: 'rumah-ibadah', nama: 'Rumah ibadah', contoh: 'Izin pura ditahan, pembangunan dihentikan, pura dirusak' },
  { kunci: 'tanah-aset', nama: 'Tanah dan aset keagamaan', contoh: 'Sengketa tanah pura, setra, atau laba pura' },
  { kunci: 'upacara-pemakaman', nama: 'Upacara dan pemakaman', contoh: 'Upacara dibubarkan, kremasi atau pemakaman ditolak' },
  { kunci: 'diskriminasi', nama: 'Diskriminasi dan intoleransi', contoh: 'Dipersulit di layanan publik, tempat kerja, atau lingkungan' },
  { kunci: 'pendidikan', nama: 'Pendidikan agama', contoh: 'Tidak ada guru agama Hindu, siswa diminta ikut pelajaran agama lain' },
  { kunci: 'administrasi', nama: 'Kependudukan dan perkawinan', contoh: 'Kolom agama di KTP, akta perkawinan, catatan sipil' },
  { kunci: 'kekerasan', nama: 'Kekerasan atau ancaman', contoh: 'Penganiayaan, intimidasi, ujaran kebencian' },
  { kunci: 'adat', nama: 'Sengketa adat atau internal umat', contoh: 'Konflik desa adat, banjar, atau kepengurusan pura' },
  { kunci: 'lainnya', nama: 'Lainnya', contoh: 'Persoalan lain yang menimpa umat Hindu' },
];

export const BANTUAN = [
  { kunci: 'pendampingan-hukum', nama: 'Pendampingan hukum' },
  { kunci: 'mediasi', nama: 'Mediasi dengan pihak terkait' },
  { kunci: 'advokasi', nama: 'Membawa persoalan ke instansi pemerintah' },
  { kunci: 'konsultasi', nama: 'Konsultasi dan informasi' },
];

// Bidang DPD NTB sesuai lampiran SK DPP No. 04/SK/DPP PERSADHA NUSANTARA/VIII/2026.
export const BIDANG = [
  { kunci: 'organisasi', nama: 'Organisasi, keanggotaan, dan kaderisasi', ikon: 'users' },
  { kunci: 'sosial-ekonomi', nama: 'Sosial ekonomi', ikon: 'trending-up' },
  { kunci: 'litbang', nama: 'Penelitian dan pengembangan', ikon: 'file-search' },
  { kunci: 'agama-budaya', nama: 'Agama, budaya, dan lingkungan', ikon: 'landmark' },
  { kunci: 'humas', nama: 'Hubungan masyarakat dan antarlembaga Hindu', ikon: 'handshake' },
  { kunci: 'advokasi', nama: 'Pergerakan sosial politik, hukum, dan advokasi', ikon: 'scale' },
];

export const PROVINSI_UTAMA = 'Nusa Tenggara Barat';
export const KOTA_NTB = [
  'Kota Mataram', 'Kabupaten Lombok Barat', 'Kabupaten Lombok Tengah', 'Kabupaten Lombok Timur', 'Kabupaten Lombok Utara',
  'Kabupaten Sumbawa Barat', 'Kabupaten Sumbawa', 'Kabupaten Dompu', 'Kabupaten Bima', 'Kota Bima',
];

/** Isi otomatis provinsi NTB dan saran kabupaten/kota NTB pada formulir. */
export function pasangWilayahNtb(akar = document) {
  if (!document.getElementById('kota-ntb')) {
    const dl = document.createElement('datalist');
    dl.id = 'kota-ntb';
    dl.innerHTML = KOTA_NTB.map((k) => `<option value="${k}">`).join('');
    document.body.append(dl);
  }
  akar.querySelectorAll('input[name=kota]').forEach((i) => i.setAttribute('list', 'kota-ntb'));
  akar.querySelectorAll('select[name=provinsi]').forEach((s) => { if (!s.value) s.value = PROVINSI_UTAMA; });
}

export const STATUS_LAPORAN = {
  baru: 'Baru masuk',
  ditinjau: 'Sedang ditinjau',
  diproses: 'Ditindaklanjuti',
  selesai: 'Selesai',
  ditutup: 'Ditutup',
};
export const STATUS_ANGGOTA = { menunggu: 'Menunggu verifikasi', diterima: 'Diterima', ditolak: 'Belum diterima' };

export const namaKategori = (k) => KATEGORI_ADUAN.find((x) => x.kunci === k)?.nama || k || '-';
export const namaBidang = (k) => BIDANG.find((x) => x.kunci === k)?.nama || k || '-';
export const namaBantuan = (k) => BANTUAN.find((x) => x.kunci === k)?.nama || k;

/** Nomor tiket yang mudah dibacakan lewat telepon: ADU-2610-7K2QF */
export function nomorTiket(jenis, id, ms = Date.now()) {
  const d = new Date(ms + 8 * 3600e3);
  const yymm = String(d.getUTCFullYear()).slice(2) + String(d.getUTCMonth() + 1).padStart(2, '0');
  const kode = String(id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase().replace(/[O]/g, '0').replace(/[I]/g, '1');
  return `${jenis === 'aspirasi' ? 'ASP' : 'ADU'}-${yymm}-${kode}`;
}
