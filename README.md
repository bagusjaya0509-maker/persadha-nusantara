# Persadha Nusantara

Situs resmi Dewan Pimpinan Pusat **Persadha Nusantara** (Pergerakan Sanathana Dharma Nusantara):
kabar kegiatan, profil dan legalitas organisasi, program kerja 2025–2030, serta layanan umat —
pengaduan, aspirasi, dan keanggotaan — dengan panel pengurus untuk menulis kabar dan merekap aduan.

- Situs statis di GitHub Pages, dibangun oleh `skrip/bangun.mjs` (Node 20+, tanpa dependensi).
- Akun dan data layanan di Firebase Authentication + Cloud Firestore.
- Panduan pemasangan, batas paket gratis, dan pindah domain: **[PANDUAN.md](PANDUAN.md)**.

```bash
node skrip/bangun.mjs && node skrip/sajikan.mjs   # http://localhost:8930/persadha-nusantara/
```
