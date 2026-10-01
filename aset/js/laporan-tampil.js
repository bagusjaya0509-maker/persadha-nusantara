// Potongan tampilan laporan yang dipakai halaman akun dan panel pengurus.
import { esc, ikon, tanggal, tanggalJam } from './inti.js';
import { STATUS_LAPORAN, namaKategori, namaBidang, namaBantuan } from './rujukan.js';

export const pilStatus = (s) => `<span class="status" data-status="${esc(s)}">${esc(STATUS_LAPORAN[s] || s)}</span>`;

const URUTAN = ['baru', 'ditinjau', 'diproses', 'selesai'];
export function langkahStatus(status) {
  if (status === 'ditutup') return `<p class="langkah-tutup">${ikon('circle-x')} Laporan ini ditutup oleh pengurus.</p>`;
  const i = URUTAN.indexOf(status);
  return `<ol class="langkah-status">${URUTAN.map((s, n) => `<li class="${n < i ? 'lewat' : n === i ? 'kini' : ''}"><span>${esc(STATUS_LAPORAN[s])}</span></li>`).join('')}</ol>`;
}

export function rincianLaporan(l, { admin = false } = {}) {
  const baris = [];
  const t = (k, v) => v && baris.push(`<dt>${k}</dt><dd>${v}</dd>`);
  if (l.jenis === 'aduan') t('Jenis persoalan', esc(namaKategori(l.kategori)));
  else t('Bidang', esc(namaBidang(l.bidang)));
  const lok = [l.lokasi?.alamat, l.lokasi?.kota, l.lokasi?.provinsi].filter(Boolean).join(', ');
  t('Lokasi', esc(lok));
  t('Tanggal kejadian', l.tanggalKejadian ? esc(tanggal(Date.parse(l.tanggalKejadian))) : '');
  t('Pihak terlibat', esc(l.pihak));
  t('Bantuan diharapkan', esc((l.bantuan || []).map(namaBantuan).join(', ')));
  if (l.jenis === 'aduan') t('Kerahasiaan', l.rahasia ? 'Nama pelapor tidak disebut tanpa persetujuan' : 'Nama pelapor boleh disebut');
  if (admin) {
    t('Pelapor', `${esc(l.pelapor?.nama)}<br><a href="mailto:${esc(l.pelapor?.email)}">${esc(l.pelapor?.email)}</a>${l.wa || l.pelapor?.wa ? `<br><a href="https://wa.me/${esc(waIntl(l.wa || l.pelapor?.wa))}" target="_blank" rel="noopener">${esc(l.wa || l.pelapor?.wa)}</a>` : ''}`);
    t('Ditangani', esc(l.ditangani));
  }
  t('Dikirim', esc(tanggalJam(l.dibuat)));
  t('Terakhir diperbarui', esc(tanggalJam(l.diubah)));
  return `<dl class="rincian">${baris.join('')}</dl>`;
}

export const waIntl = (n) => String(n || '').replace(/[^\d+]/g, '').replace(/^\+/, '').replace(/^0/, '62');

export function liniTanggapan(daftar, { kosong = 'Belum ada percakapan.' } = {}) {
  if (!daftar.length) return `<p class="petunjuk" style="color:var(--tinta-2)">${esc(kosong)}</p>`;
  return `<ol class="lini">${daftar
    .map((t) => `<li class="${t.oleh === 'admin' ? 'dari-admin' : ''}"><div class="lini-kepala"><b>${esc(t.nama)}</b><span>${esc(tanggalJam(t.dibuat))}</span></div>${t.statusBaru ? `<p class="lini-status">Status diubah menjadi ${pilStatus(t.statusBaru)}</p>` : ''}<p>${esc(t.pesan)}</p></li>`)
    .join('')}</ol>`;
}

export function lampiranHtml(daftar) {
  if (!daftar.length) return '<p class="petunjuk" style="color:var(--tinta-2)">Tidak ada lampiran.</p>';
  return `<ul class="kisi-lampiran">${daftar
    .map((b, i) => `<li><button type="button" data-buka-lampiran="${i}" title="Buka ${esc(b.nama)}">${b.tipe?.startsWith('image/') ? `<img src="${b.data}" alt="${esc(b.nama)}">` : `<span class="berkas-ikon">${ikon('file-text')}</span>`}<span>${esc(b.nama)}</span></button></li>`)
    .join('')}</ul>`;
}

/** Buka data URL di tab baru (Chrome memblokir navigasi langsung ke data:). */
export async function bukaDataUrl(dataUrl) {
  const blob = await (await fetch(dataUrl)).blob();
  const url = URL.createObjectURL(blob);
  window.open(url, '_blank', 'noopener');
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
