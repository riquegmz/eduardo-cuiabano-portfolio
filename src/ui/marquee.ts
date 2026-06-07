import type Lenis from 'lenis';

/**
 * Faixa horizontal que rola sozinha e REAGE ao scroll: a velocidade/direção
 * do Lenis empurra o texto, criando o "momento" de profundidade (não é uma
 * barra de progresso — é um elemento editorial). Loop sem emenda via 2 cópias.
 */
export function initMarquee(lenis: Lenis, reduceMotion: boolean): void {
  const track = document.querySelector<HTMLElement>('.marquee-track');
  const group = document.querySelector<HTMLElement>('.marquee-group');
  if (!track || !group) return;

  let groupW = group.offsetWidth;
  window.addEventListener(
    'resize',
    () => {
      groupW = group.offsetWidth;
    },
    { passive: true },
  );

  let offset = 0;
  const base = reduceMotion ? 0 : 0.04; // px/ms — deriva constante para a esquerda
  let last = performance.now();

  const tick = (now: number): void => {
    const dt = Math.min(now - last, 60);
    last = now;

    const vel = reduceMotion ? 0 : (lenis.velocity ?? 0); // assinado (Lenis)
    let move = base * dt + vel * 2.2; // scroll acelera/inverte
    move = Math.max(-44, Math.min(44, move)); // trava picos
    offset -= move;

    if (groupW > 0) {
      while (offset <= -groupW) offset += groupW;
      while (offset > 0) offset -= groupW;
    }
    track.style.transform = `translate3d(${offset}px, 0, 0)`;
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}
