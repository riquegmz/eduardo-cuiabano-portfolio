// Gradientes placeholder (paleta quente) usados enquanto não há mídia real.
// Quando o projeto tiver data-preview="/img/...", a imagem/vídeo é usada no lugar.
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
 * Cada `.project` aceita:
 *   data-preview="/img/work/arquivo.webp"          → imagem  (data-preview-type="image" ou omitido)
 *   data-preview="/img/work/arquivo.mp4"           → vídeo   (data-preview-type="video")
 *   data-preview-poster="/img/work/arquivo.webp"   → frame estático do vídeo
 *                                                     (usado com prefers-reduced-motion / enquanto carrega)
 *
 * Sem data-preview → gradiente placeholder. O vídeo só baixa quando entra em hover
 * e pausa ao sair (performance é restrição de design, não otimização posterior).
 */
export function initWorkPreview(reduceMotion: boolean): void {
  const list = document.querySelector<HTMLElement>('.project-list');
  if (!list) return;

  const projects = Array.from(list.querySelectorAll<HTMLElement>('.project'));
  if (projects.length === 0) return;

  // O preview que segue o cursor só faz sentido com mouse (em touch não há hover).
  // O clique nos projetos é tratado pelo lightbox (ver src/ui/lightbox.ts).
  if (!window.matchMedia('(hover: hover)').matches) return;

  const preview = document.querySelector<HTMLElement>('.work-preview');
  if (!preview) return;

  // Camada de vídeo dentro do preview (sobreposta à imagem/gradiente de fundo).
  const video = document.createElement('video');
  video.className = 'work-preview__video';
  video.muted = true;
  video.loop = true;
  video.playsInline = true;
  video.preload = 'none';
  video.setAttribute('aria-hidden', 'true');
  preview.appendChild(video);

  let loadedSrc = '';

  /** Define a mídia exibida no preview conforme o projeto em hover. */
  const setMedia = (project: HTMLElement, i: number): void => {
    const src = project.dataset.preview;
    const type = project.dataset.previewType;
    const poster = project.dataset.previewPoster;

    if (src && type === 'video') {
      // Vídeo: fundo recebe o poster (frame estático) como base; o <video> entra por cima.
      preview.style.backgroundImage = poster ? `url("${poster}")` : (FALLBACK ?? '');
      if (loadedSrc !== src) {
        video.src = src;
        loadedSrc = src;
      }
      if (reduceMotion) {
        // Movimento reduzido: nada de autoplay. Mostra só o poster (ou 1º frame).
        video.classList.remove('is-shown');
        video.pause();
      } else {
        video.classList.add('is-shown');
        video.currentTime = 0;
        void video.play().catch(() => {
          /* play pode ser bloqueado; o poster cobre o caso */
        });
      }
      return;
    }

    // Imagem ou placeholder: garante o vídeo escondido/pausado.
    video.classList.remove('is-shown');
    video.pause();
    preview.style.backgroundImage = src
      ? `url("${src}")`
      : (PLACEHOLDERS[i % PLACEHOLDERS.length] ?? FALLBACK ?? '');
  };

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
      video.pause(); // libera o decode quando o preview some
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

      setMedia(project, i);

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
