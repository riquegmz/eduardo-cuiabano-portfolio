interface ParallaxItem {
  el: HTMLElement;
  speed: number;
}

/**
 * Parallax leve por profundidade: elementos com data-parallax="0.5" deslizam
 * conforme a posição na viewport (ex.: a foto dentro da máscara). Ligado ao
 * scroll nativo (o Lenis rola nativamente), com gate por rAF.
 */
export function initParallax(reduceMotion: boolean): void {
  if (reduceMotion) return;

  const items: ParallaxItem[] = Array.from(
    document.querySelectorAll<HTMLElement>('[data-parallax]'),
  ).map((el) => ({ el, speed: parseFloat(el.dataset.parallax ?? '0') }));
  if (items.length === 0) return;

  let ticking = false;
  const update = (): void => {
    ticking = false;
    const vh = window.innerHeight;
    for (const { el, speed } of items) {
      const rect = el.getBoundingClientRect();
      const fromCenter = (rect.top + rect.height / 2 - vh / 2) / vh; // ~ -1..1
      el.style.transform = `translate3d(0, ${(fromCenter * speed * 100).toFixed(2)}px, 0)`;
    }
  };
  const onScroll = (): void => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
}
