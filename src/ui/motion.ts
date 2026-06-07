import { gsap } from 'gsap';

const EASE = 'power4.out';

/* =====================================================================
   Split de palavras (estilo SplitText editorial)
   Cada palavra vira <span class="word"><span class="word-i">…</span></span>.
   Respeita markup inline (<em>), quebras (<br>) e trata .flip-wrap como
   um bloco único (não quebra o word-flip do hero).
   ===================================================================== */
function splitElement(el: HTMLElement): HTMLElement[] {
  const inners: HTMLElement[] = [];

  const addWord = (text: string, parent: Node): void => {
    const mask = document.createElement('span');
    mask.className = 'word';
    const inner = document.createElement('span');
    inner.className = 'word-i';
    inner.textContent = text;
    mask.appendChild(inner);
    parent.appendChild(mask);
    inners.push(inner);
  };

  const addUnit = (node: Node, parent: Node): void => {
    const mask = document.createElement('span');
    mask.className = 'word';
    const inner = document.createElement('span');
    inner.className = 'word-i';
    inner.appendChild(node.cloneNode(true));
    mask.appendChild(inner);
    parent.appendChild(mask);
    inners.push(inner);
  };

  const process = (node: Node, parent: Node): void => {
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? '').split(/(\s+)/);
        for (const part of parts) {
          if (part.length === 0) continue;
          if (part.trim() === '') parent.appendChild(document.createTextNode(part));
          else addWord(part, parent);
        }
      } else if (child.nodeName === 'BR') {
        parent.appendChild(child.cloneNode(false));
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const elc = child as HTMLElement;
        if (elc.classList.contains('flip-wrap')) {
          addUnit(elc, parent); // bloco único (mantém o word-flip)
        } else {
          const clone = elc.cloneNode(false);
          process(child, clone);
          parent.appendChild(clone);
        }
      }
    });
  };

  const frag = document.createDocumentFragment();
  process(el, frag);
  el.textContent = '';
  el.appendChild(frag);
  return inners;
}

/** Libera a máscara (overflow) pós-reveal → descendentes (g, p, y) não cortam. */
function unmask(inners: HTMLElement[]): void {
  for (const i of inners) if (i.parentElement) i.parentElement.style.overflow = 'visible';
}

const HEADINGS = ['.hero h1', '#sobre h2', '#trabalhos h2', '#contato h2'] as const;
const heroInners: HTMLElement[] = [];
const sectionInners: Record<string, HTMLElement[]> = {};

/** Divide os títulos em palavras mascaradas. Roda no init (antes do word-flip). */
export function prepareReveals(reduceMotion: boolean): void {
  for (const sel of HEADINGS) {
    const el = document.querySelector<HTMLElement>(sel);
    if (!el) continue;
    const inners = splitElement(el);
    if (sel === '.hero h1') heroInners.push(...inners);
    else sectionInners[sel] = inners;
  }

  if (reduceMotion) {
    // sem movimento: tudo visível e máscaras liberadas
    const all = [heroInners, ...Object.values(sectionInners)].flat();
    unmask(all);
    return;
  }

  // Esconde as palavras das SEÇÕES já (entram no scroll). O hero é escondido
  // só quando a intro chama revealHero (até lá fica coberto pela intro).
  const sectionAll = Object.values(sectionInners).flat();
  if (sectionAll.length) gsap.set(sectionAll, { yPercent: 110 });
}

/** Entrada do hero — disparada quando a intro abre o site. */
export function revealHero(reduceMotion: boolean): void {
  const fade = ['.hero .eyebrow', '.hero p.sub', '.hero .cta'];
  if (reduceMotion) {
    gsap.set([...fade, '.hero .word-i'], { opacity: 1, y: 0, yPercent: 0 });
    return;
  }

  const tl = gsap.timeline();
  tl.from('.hero .eyebrow', { y: 20, opacity: 0, duration: 0.8, ease: EASE }, 0);
  if (heroInners.length) {
    tl.from(
      heroInners,
      { yPercent: 110, duration: 1, ease: EASE, stagger: 0.08, onComplete: () => unmask(heroInners) },
      0.15,
    );
  }
  tl.from('.hero p.sub', { y: 24, opacity: 0, duration: 0.9, ease: EASE }, 0.55);
  tl.from('.hero .cta', { y: 24, opacity: 0, duration: 0.9, ease: EASE }, 0.7);
}

/* =====================================================================
   Reveals por seção via IntersectionObserver (à prova de falhas — observa
   a visibilidade real do elemento, sem depender de ScrollTrigger/Lenis).
   ===================================================================== */
interface RevealGroup {
  words?: string; // seletor de um título já dividido (em sectionInners)
  fade?: string[]; // seletores de elementos para fade-up
  distance?: number;
}

function collectFade(group: RevealGroup): HTMLElement[] {
  return group.fade ? group.fade.flatMap((s) => gsap.utils.toArray<HTMLElement>(s)) : [];
}

function hideGroup(group: RevealGroup): void {
  const inners = group.words ? sectionInners[group.words] : undefined;
  if (inners?.length) gsap.set(inners, { yPercent: 110 });
  const fades = collectFade(group);
  if (fades.length) gsap.set(fades, { opacity: 0, y: group.distance ?? 44 });
}

function revealGroup(group: RevealGroup): void {
  const inners = group.words ? sectionInners[group.words] : undefined;
  if (inners?.length) {
    gsap.to(inners, {
      yPercent: 0,
      duration: 1,
      ease: EASE,
      stagger: 0.06,
      onComplete: () => unmask(inners),
    });
  }
  const fades = collectFade(group);
  if (fades.length) {
    // clearProps no fim → remove o opacity/transform inline para o CSS (ex.: o
    // dim de hover dos projetos) voltar a controlar o elemento.
    gsap.to(fades, {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: EASE,
      stagger: 0.1,
      clearProps: 'transform,opacity',
    });
  }
}

function observeReveal(triggerSel: string, groups: RevealGroup[]): void {
  const trigger = document.querySelector(triggerSel);
  if (!trigger) return;
  groups.forEach(hideGroup); // esconde já (síncrono, antes de pintar)
  const io = new IntersectionObserver(
    (entries, obs) => {
      if (entries.some((e) => e.isIntersecting)) {
        groups.forEach(revealGroup);
        obs.disconnect();
      }
    },
    { threshold: 0.1, rootMargin: '0px 0px -8% 0px' },
  );
  io.observe(trigger);
}

/** Reveals por seção. */
export function initScrollReveals(reduceMotion: boolean): void {
  if (reduceMotion) return;

  observeReveal('#sobre', [
    { words: '#sobre h2' },
    {
      fade: ['#sobre .photo-frame', '#sobre .section-label', '#sobre .about p', '#sobre .tags'],
      distance: 44,
    },
  ]);

  observeReveal('#trabalhos', [
    { words: '#trabalhos h2' },
    { fade: ['#trabalhos .section-label'], distance: 36 },
  ]);
  observeReveal('#trabalhos .project-list', [{ fade: ['#trabalhos .project'], distance: 40 }]);

  observeReveal('#contato', [
    { words: '#contato h2' },
    {
      fade: ['#contato .section-label', '#contato p', '#contato .contact-email', '#contato .contact-foot'],
      distance: 44,
    },
  ]);
}
