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

export const BIDANG = [
  { kunci: 'organisasi', nama: 'Transformasi dan penguatan organisasi', ikon: 'network' },
  { kunci: 'sdm', nama: 'Pendidikan, kaderisasi, dan SDM', ikon: 'graduation-cap' },
  { kunci: 'kajian', nama: 'Kajian strategis dan kebijakan publik', ikon: 'file-search' },
  { kunci: 'ekonomi', nama: 'Pemberdayaan ekonomi umat', ikon: 'trending-up' },
  { kunci: 'sosial', nama: 'Sosial, lingkungan, dan pengabdian', ikon: 'hand-heart' },
  { kunci: 'budaya', nama: 'Kebudayaan dan peradaban Hindu Nusantara', ikon: 'landmark' },
  { kunci: 'pemuda', nama: 'Kepemudaan, perempuan, dan inovasi', ikon: 'lightbulb' },
  { kunci: 'komunikasi', nama: 'Komunikasi, hubungan masyarakat, dan diplomasi', ikon: 'globe' },
];

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
  const d = new Date(ms + 7 * 3600e3);
  const yymm = String(d.getUTCFullYear()).slice(2) + String(d.getUTCMonth() + 1).padStart(2, '0');
  const kode = String(id).replace(/[^a-zA-Z0-9]/g, '').slice(0, 5).toUpperCase().replace(/[O]/g, '0').replace(/[I]/g, '1');
  return `${jenis === 'aspirasi' ? 'ASP' : 'ADU'}-${yymm}-${kode}`;
}
