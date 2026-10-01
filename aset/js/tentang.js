// Tandai bagian yang sedang dibaca di daftar isi.
import { $$ } from './inti.js';

const tautan = $$('.daftar-isi a');
const bagian = tautan.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
if ('IntersectionObserver' in window && bagian.length) {
  const io = new IntersectionObserver(
    (entri) => {
      const terlihat = entri.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (!terlihat) return;
      tautan.forEach((a) => a.classList.toggle('aktif', a.getAttribute('href') === `#${terlihat.target.id}`));
    },
    { rootMargin: '-20% 0px -65% 0px' },
  );
  bagian.forEach((b) => io.observe(b));
}
