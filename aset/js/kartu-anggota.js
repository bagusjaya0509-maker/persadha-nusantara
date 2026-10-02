import { BASE, esc, tanggal } from './inti.js';

export const kartuAnggota = (a) => `
<div class="kartu-anggota" role="img" aria-label="Kartu anggota ${esc(a.nama)}, nomor ${esc(a.nomorAnggota)}">
  <div class="atas">
    <img src="${BASE}aset/img/lambang-gelap.svg" alt="">
    <p>Kartu anggota<br>Persadha Nusantara NTB</p>
  </div>
  <div>
    <div class="nama">${esc(a.nama)}</div>
    <div class="nomor">${esc(a.nomorAnggota || '—')}</div>
  </div>
  <div class="bawah"><span>${esc([a.kota, a.provinsi].filter(Boolean).join(', '))}</span><span>Sejak ${tanggal(a.diputuskan || a.diubah)}</span></div>
</div>`;
