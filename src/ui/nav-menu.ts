import type { SmoothScroll } from '../scroll/smooth-scroll';

/**
 * Menu mobile (hambúrguer → overlay). Trava o scroll quando aberto e leva à
 * seção (scroll suave do Lenis) ao clicar, fechando em seguida.
 */
export function initNavMenu(smooth: SmoothScroll): void {
  const burger = document.getElementById('nav-burger');
  const menu = document.getElementById('nav-menu');
  if (!burger || !menu) return;

  const setOpen = (open: boolean): void => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    menu.setAttribute('aria-hidden', String(!open));
    if (open) smooth.lenis.stop();
    else smooth.lenis.start();
  };

  burger.addEventListener('click', () => {
    setOpen(!document.body.classList.contains('menu-open'));
  });

  menu.querySelectorAll<HTMLAnchorElement>('a').forEach((a) => {
    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (!href?.startsWith('#')) return;
      e.preventDefault();
      setOpen(false); // destrava o scroll ANTES de navegar
      smooth.scrollTo(href);
    });
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && document.body.classList.contains('menu-open')) setOpen(false);
  });
}
