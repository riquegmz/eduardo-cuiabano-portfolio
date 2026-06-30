// Controle mínimo de scroll que o lightbox precisa (Lenis expõe stop/start).
export interface ScrollLock {
  stop(): void;
  start(): void;
}

/**
 * Lightbox cinematográfico para os projetos: ao clicar num `.project-link`,
 * abre um modal em tela cheia que toca o vídeo full-res (com áudio quando há).
 *
 * Acessível: role="dialog" + aria-modal, foco preso no modal, Escape e clique no
 * fundo fecham, e o foco volta para o projeto de origem ao fechar. O scroll da
 * página é travado (Lenis) enquanto o modal está aberto.
 *
 * Progressive enhancement: o href do projeto aponta para o próprio vídeo, então
 * sem JS o clique ainda abre o arquivo. Com JS, interceptamos e abrimos o modal.
 */
export function initLightbox(reduceMotion: boolean, lock: ScrollLock): void {
  const links = Array.from(
    document.querySelectorAll<HTMLAnchorElement>('.project-list .project-link'),
  );
  if (links.length === 0) return;

  // ----- monta o modal uma única vez -----
  const overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-label', 'Visualização do projeto');
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML = `
    <div class="lightbox__backdrop" data-close></div>
    <div class="lightbox__dialog">
      <button class="lightbox__close" type="button" aria-label="Fechar">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
             stroke-linecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>
      <div class="lightbox__stage">
        <video class="lightbox__video" controls playsinline preload="metadata"></video>
      </div>
      <p class="lightbox__caption"></p>
    </div>`;
  document.body.appendChild(overlay);

  const dialog = overlay.querySelector<HTMLElement>('.lightbox__dialog')!;
  const video = overlay.querySelector<HTMLVideoElement>('.lightbox__video')!;
  const caption = overlay.querySelector<HTMLElement>('.lightbox__caption')!;
  const closeBtn = overlay.querySelector<HTMLButtonElement>('.lightbox__close')!;

  let lastFocused: HTMLElement | null = null;
  let isOpen = false;

  const focusable = (): HTMLElement[] =>
    Array.from(
      dialog.querySelectorAll<HTMLElement>(
        'button, [href], video, [tabindex]:not([tabindex="-1"])',
      ),
    ).filter((el) => !el.hasAttribute('disabled'));

  const open = (src: string, poster: string, title: string): void => {
    if (isOpen) return;
    isOpen = true;
    lastFocused = document.activeElement as HTMLElement | null;

    if (poster) video.poster = poster;
    video.src = src;
    caption.textContent = title;

    overlay.setAttribute('aria-hidden', 'false');
    overlay.classList.add('is-open');
    document.documentElement.classList.add('lightbox-open');
    lock.stop();

    closeBtn.focus();
    video.currentTime = 0;
    void video.play().catch(() => {
      /* navegador pode exigir gesto p/ áudio; controles cobrem o caso */
    });
  };

  const close = (): void => {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('lightbox-open');
    video.pause();
    lock.start();

    // libera a mídia após a transição de saída
    const cleanup = (): void => {
      if (!isOpen) {
        video.removeAttribute('src');
        video.load();
      }
    };
    if (reduceMotion) cleanup();
    else overlay.addEventListener('transitionend', cleanup, { once: true });

    lastFocused?.focus?.();
  };

  // ----- abre a partir de cada projeto -----
  for (const link of links) {
    link.addEventListener('click', (e) => {
      const src = link.getAttribute('href');
      if (!src || src === '#') return; // sem destino → deixa o clique seguir
      e.preventDefault();
      const project = link.closest<HTMLElement>('.project');
      const poster = project?.dataset.previewPoster ?? '';
      const title =
        link.querySelector('.project-title')?.textContent?.trim() ?? 'Projeto';
      open(src, poster, title);
    });
  }

  // ----- fechar: botão, fundo, Escape -----
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if ((e.target as HTMLElement).hasAttribute('data-close')) close();
  });

  document.addEventListener('keydown', (e) => {
    if (!isOpen) return;
    if (e.key === 'Escape') {
      close();
      return;
    }
    // foco preso dentro do modal
    if (e.key === 'Tab') {
      const items = focusable();
      if (items.length === 0) return;
      const first = items[0]!;
      const last = items[items.length - 1]!;
      const active = document.activeElement;
      if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });
}
