/**
 * Índice de seções fixo na lateral: acende a seção ativa conforme o scroll
 * (IntersectionObserver com banda central) e leva até ela ao clicar.
 */
export function initSectionIndex(scrollTo: (target: string) => void): void {
  const index = document.querySelector<HTMLElement>('.section-index');
  if (!index) return;

  const links = Array.from(index.querySelectorAll<HTMLAnchorElement>('a'));
  const byId = new Map<string, HTMLAnchorElement>();
  for (const a of links) {
    const id = a.dataset.target;
    if (id) byId.set(id, a);

    a.addEventListener('click', (e) => {
      const href = a.getAttribute('href');
      if (href?.startsWith('#')) {
        e.preventDefault();
        scrollTo(href);
      }
    });
  }

  // ativa o item cuja seção está na banda central da tela
  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const a = byId.get(entry.target.id);
        a?.classList.toggle('is-active', entry.isIntersecting);
      }
    },
    { rootMargin: '-45% 0px -45% 0px', threshold: 0 },
  );

  for (const id of byId.keys()) {
    const section = document.getElementById(id);
    if (section) io.observe(section);
  }
}
