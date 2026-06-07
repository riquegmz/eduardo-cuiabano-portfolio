import { gsap } from 'gsap';

const STRENGTH = 0.4;

/**
 * Botões magnéticos: deslizam levemente em direção ao cursor no hover e voltam
 * com easing ao sair. Aplica-se a `.btn` e `.theme-toggle`.
 */
export function initMagnetic(reduceMotion: boolean): void {
  if (reduceMotion) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  const els = document.querySelectorAll<HTMLElement>('.btn, .theme-toggle');
  els.forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.5, ease: 'power3' });

    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - (r.left + r.width / 2)) * STRENGTH);
      yTo((e.clientY - (r.top + r.height / 2)) * STRENGTH);
    });
    el.addEventListener('pointerleave', () => {
      xTo(0);
      yTo(0);
    });
  });
}
