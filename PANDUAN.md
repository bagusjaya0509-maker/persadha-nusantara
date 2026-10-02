# Panduan situs Persadha Nusantara NTB

Situs ini milik DPD Persadha Nusantara Provinsi Nusa Tenggara Barat. Versi untuk DPP pusat
tersimpan di cabang `situs-dpp-pusat`; buat repositori baru dari cabang itu bila DPP memintanya.

Situs ini statis (HTML, CSS, JavaScript) dan disajikan **GitHub Pages** tanpa server sendiri.
Fitur yang butuh penyimpanan — akun, aduan, aspirasi, keanggotaan, dan kabar dari panel
pengurus — memakai **Firebase** (Authentication + Cloud Firestore) paket gratis Spark.

```
situs.config.json   ← satu-satunya berkas yang perlu disunting untuk pemasangan
firestore.rules     ← aturan akses data (ditempel ke Firebase Console)
src/halaman/        ← isi tiap halaman
src/templat/        ← kepala, kaki, dan kerangka halaman
aset/               ← CSS, JavaScript, gambar, ikon
skrip/bangun.mjs    ← merakit halaman ke folder _site/
skrip/sajikan.mjs   ← server pratinjau lokal
```

## Menjalankan di komputer sendiri

```bash
node skrip/bangun.mjs
node skrip/sajikan.mjs
```

Buka `http://localhost:8930/persadha-nusantara/`. Selama Firebase belum diisi, situs berjalan
dalam **mode demo**: akun dan aduan hanya tersimpan di peramban itu. Di halaman Masuk ada tombol
"Masuk sebagai pengurus (demo)" untuk mencoba panel pengurus.

Di situs yang sudah tayang, formulir layanan menampilkan pesan "Layanan daring sedang disiapkan"
beserta WhatsApp sekretariat sampai Firebase diisi — pengunjung tidak akan mengirim aduan ke
tempat yang tidak dibaca siapa pun.

## Menyambungkan Firebase (sekali saja, sekitar 15 menit)

1. Buka <https://console.firebase.google.com> dengan akun Google organisasi
   (disarankan `dpppersadhanusantara@gmail.com`), lalu **Add project** → nama `persadha-nusantara`.
   Google Analytics boleh dimatikan.
2. **Build → Authentication → Get started.** Di tab *Sign-in method* aktifkan **Email/Password**
   dan **Google**. Di tab *Settings → Authorized domains* tambahkan
   `bagusjaya0509-maker.github.io` (dan nanti domain sendiri).
3. **Build → Firestore Database → Create database.** Pilih lokasi **asia-southeast2 (Jakarta)**,
   mode *production*. Buka tab **Rules**, hapus isinya, tempel seluruh isi `firestore.rules`,
   lalu **Publish**.
4. **Project settings (ikon gerigi) → General → Your apps → Web (`</>`).** Beri nama `situs`,
   tidak perlu Hosting. Salin nilai `firebaseConfig` ke bagian `"firebase"` di
   `situs.config.json`.
5. Bangun ulang situs (atau push ke GitHub). Masuk ke situs dengan Google memakai email
   `dpppersadhanusantara@gmail.com` → otomatis menjadi pengurus utama → buka **Panel pengurus**.
6. Di panel: **Kabar → Terbitkan kabar awal** (tiga kabar dari dokumen legal), lalu
   **Sistem → Periksa koneksi**. Bila ada tautan "buat indeks", klik sekali; indeks selesai
   dalam beberapa menit.
7. Tambahkan pengurus lain lewat **Pengguna & pengurus → Tambah pengurus** (orangnya harus
   sudah membuat akun di situs).

> Nilai `apiKey` Firebase memang terlihat publik di situs — itu normal untuk aplikasi web.
> Data terlindungi oleh `firestore.rules`, bukan oleh kerahasiaan kunci. Untuk lapisan
> tambahan, batasi kunci itu ke domain situs di Google Cloud Console → APIs & Services →
> Credentials (HTTP referrers).

Untuk menambah pengurus utama selain email organisasi, ubah **dua tempat** sekaligus:
`adminUtama` di `situs.config.json` dan fungsi `adminUtama()` di `firestore.rules`
(lalu Publish ulang rules).

## Pemberitahuan email aduan baru

Setiap aduan atau aspirasi baru mengirim email berisi nomor, kategori, provinsi, dan tanda
mendesak (tanpa isi kronologi) ke `notifikasi.emailAduanBaru` lewat FormSubmit (gratis).
**Aduan pertama** akan memicu email aktivasi dari FormSubmit ke alamat itu — klik
**Activate Form** sekali. Sebelum diaktifkan, aduan tetap tersimpan; hanya emailnya yang
belum terkirim. Kosongkan nilai `emailAduanBaru` untuk mematikan fitur ini.

## Kabar dan halaman statis

Kabar yang diterbitkan dari panel langsung tampil di beranda dan daftar kabar. GitHub Actions
membangun ulang situs **tiap jam** sehingga setiap kabar juga punya halaman statis sendiri —
ini yang dibaca Google dan pratinjau tautan WhatsApp/Facebook (judul + foto sampul).
Sebelum build berikutnya, tautan kabar tetap bisa dibuka (dirender oleh `404.html`).
Untuk mempercepat: GitHub → tab **Actions → Bangun dan terbitkan situs → Run workflow**.

Alamat kabar (`/kabar/<judul>/`) dikunci setelah pertama kali disimpan. GitHub Pages tidak
bisa mengalihkan alamat lama, jadi mengubah alamat berarti mematahkan tautan yang sudah dibagikan.

GitHub menonaktifkan jadwal tiap jam bila repositori tidak ada aktivitas selama 60 hari.
Bila kabar baru tidak lagi mendapat halaman statis, buka tab Actions dan aktifkan kembali.

## Batas paket gratis Firebase (Spark)

- 50.000 pembacaan dan 20.000 penulisan dokumen per hari, penyimpanan 1 GB.
- Satu dokumen maksimal 1 MB. Karena itu foto otomatis diperkecil di peramban:
  sampul kabar ±150 KB, foto lampiran aduan ±100–300 KB, PDF maksimal 700 KB, maksimal
  4 lampiran per aduan. Editor menampilkan ukuran isi kabar dan menolak penyimpanan di atas 900 KB.
- Unduh rekap Excel aduan dan anggota secara berkala sebagai arsip cadangan.

## Pindah ke domain sendiri

1. Beli domain (mis. `persadha-nusantara.org`).
2. GitHub → Settings → Pages → Custom domain → isi `www.persadha-nusantara.org`.
3. Di DNS: `CNAME www → bagusjaya0509-maker.github.io`, dan empat A record apex
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   Urutannya: pastikan situs tayang di github.io dulu, baru ubah DNS.
4. Ubah `situs.url` di `situs.config.json` ke alamat baru, tambahkan domain itu di
   Firebase → Authentication → Authorized domains, lalu push.
5. Setelah sertifikat HTTPS terbit, centang *Enforce HTTPS*.

## Kontak sekretariat DPD NTB

Kolom `kontak` di `situs.config.json` sengaja kosong sampai alamat, WhatsApp, dan email
sekretariat DPD NTB ditetapkan. Selama kosong, kepala dan kaki halaman tidak menampilkan
kontak, dan halaman Kontak mengarahkan keperluan mendesak ke sekretariat DPP (`induk`).
Isi kolom berikut lalu push: `alamat`, `alamatPendek`, `telepon`, `whatsapp` (format 628…),
`email`, `peta` (tautan Google Maps). Isi juga `notifikasi.emailAduanBaru` agar pengurus
menerima email setiap ada aduan baru.

## Yang perlu diperiksa pengurus

- **Ejaan nama.** Dokumen negara (SK Kemenkum, NIB) menulis *Sanatana*; infografis organisasi
  menulis *Sanathana*. Situs memakai *Sanathana* untuk merek dan menyebut nama resmi
  *Sanatana* di bagian legalitas. Samakan bila organisasi memutuskan satu ejaan.
- **Susunan pengurus** di halaman Tentang diambil dari lampiran SK AHU-0002242.AH.01.08.TAHUN 2025.
  Nomor KTP dan alamat pribadi sengaja tidak ditampilkan.
- **Media sosial.** Tautan Instagram `persadha.nusantara` diambil dari infografis; pastikan
  akunnya benar. Facebook dan YouTube dikosongkan sampai alamatnya pasti
  (isi di `situs.config.json` → `sosial`).
- **Lambang** di `aset/img/lambang.svg` digambar ulang sebagai vektor dari infografis.
  Ganti dengan berkas resmi organisasi bila ada.
