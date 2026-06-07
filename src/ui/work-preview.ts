// Gradientes placeholder (paleta quente) usados enquanto não há mídia real.
// Quando o projeto tiver data-preview="/img/...", a imagem é usada no lugar.
const PLACEHOLDERS = [
  'linear-gradient(135deg, #c35709, #a33f29)',
  'linear-gradient(135deg, #a33f29, #6d320d)',
  'linear-gradient(135deg, #6d320d, #c35709)',
];
const FALLBACK = PLACEHOLDERS[0];

/**
 * Índice de projetos com preview que segue o cursor (estilo editorial Awwwards):
 * ao passar por um projeto, destaca-o, recua os outros e mostra uma prévia
 * flutuante que persegue o mouse. Posição/escala/opacidade interpoladas no rAF.
 *
 * Estrutura pronta para a mídia real: cada `.project` aceita
 *   data-preview="/img/work/arquivo.webp"   (imagem; vazio = gradiente)
 */
export function initWorkPreview(reduceMotion: boolean): void {
  // Sem cursor (touch) não há hover → não inicia.
  if (!window.matchMedia('(hover: hover)').matches) return;

  const preview = document.querySelector<HTMLElement>('.work-preview');
  const list = document.querySelector<HTMLElement>('.project-list');
  if (!preview || !list) return;

  const projects = Array.from(list.querySelectorAll<HTMLElement>('.project'));
  if (projects.length === 0) return;

  let targetX = 0;
  let targetY = 0;
  let x = 0;
  let y = 0;
  let targetVis = 0;
  let vis = 0;
  let rafId = 0;

  const easePos = reduceMotion ? 1 : 0.16;
  const easeVis = reduceMotion ? 1 : 0.18;

  const render = (): void => {
    x += (targetX - x) * easePos;
    y += (targetY - y) * easePos;
    vis += (targetVis - vis) * easeVis;
    const scale = 0.84 + 0.16 * vis;
    preview.style.transform = `translate(${x}px, ${y}px) translate(-50%, -50%) scale(${scale})`;
    preview.style.opacity = String(vis);
    if (vis < 0.001 && targetVis === 0) {
      rafId = 0;
      return;
    }
    rafId = requestAnimationFrame(render);
  };
  const start = (): void => {
    if (!rafId) rafId = requestAnimationFrame(render);
  };

  list.addEventListener('pointermove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  projects.forEach((project, i) => {
    project.addEventListener('pointerenter', (e) => {
      list.classList.add('is-hovering');
      for (const p of projects) p.classList.toggle('is-active', p === project);

      const src = project.dataset.preview;
      preview.style.backgroundImage = src
        ? `url("${src}")`
        : (PLACEHOLDERS[i % PLACEHOLDERS.length] ?? FALLBACK ?? '');

      // primeira aparição: posiciona no cursor sem "voar" da origem
      if (vis < 0.01) {
        targetX = x = e.clientX;
        targetY = y = e.clientY;
      }
      targetVis = 1;
      start();
    });
  });

  list.addEventListener('pointerleave', () => {
    list.classList.remove('is-hovering');
    for (const p of projects) p.classList.remove('is-active');
    targetVis = 0;
    start();
  });
}
