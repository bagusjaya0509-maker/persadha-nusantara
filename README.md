# Persadha Nusantara NTB

Situs resmi **DPD Persadha Nusantara Provinsi Nusa Tenggara Barat** (Pergerakan Sanathana Dharma Nusantara):
kabar kegiatan, profil, susunan pengurus 2026–2031, program kerja, serta layanan umat —
pengaduan, aspirasi, dan keanggotaan — dengan panel pengurus untuk menulis kabar dan merekap aduan.

- Situs statis di GitHub Pages, dibangun oleh `skrip/bangun.mjs` (Node 20+, tanpa dependensi).
- Akun dan data layanan di Firebase Authentication + Cloud Firestore.
- Panduan pemasangan, batas paket gratis, dan pindah domain: **[PANDUAN.md](PANDUAN.md)**.
- Versi untuk DPP pusat disimpan di cabang `situs-dpp-pusat` (tag `dpp-pusat-v1`), siap dipakai bila DPP meminta situs sendiri.

```bash
node skrip/bangun.mjs && node skrip/sajikan.mjs   # http://localhost:8930/persadha-nusantara/
```
