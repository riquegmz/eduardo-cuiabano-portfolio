import { gsap } from 'gsap';
import type { Scene3D } from '../scene/galaxy-scene';

function realTheme(): 'light' | 'dark' {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

interface IntroCallbacks {
  /** chamado quando o site é revelado (galáxia indo pro hero) — anima o hero. */
  onReveal: () => void;
  /** chamado no fim da intro — destrava o scroll. */
  onDone: () => void;
}

/**
 * Intro cinematográfica:
 *  1. palco escuro; a galáxia nasce no centro (partículas convergindo)
 *  2. o nome revela por cima
 *  3. o nome sai, a galáxia voa para o hero, o fundo abre e o site surge
 *
 * Desacoplada do load real (load é instantâneo) — é uma experiência, não espera.
 */
export function initIntro(
  reduceMotion: boolean,
  galaxy: Scene3D | null,
  { onReveal, onDone }: IntroCallbacks,
): void {
  const bg = document.getElementById('intro-bg');
  const wrap = document.getElementById('intro');

  let done = false;
  let revealed = false;

  const reveal = (): void => {
    if (revealed) return;
    revealed = true;
    document.body.classList.add('ready');
    onReveal();
  };

  const finish = (): void => {
    if (done) return;
    done = true;
    clearTimeout(failsafe);
    reveal();
    document.body.classList.remove('intro-active');
    galaxy?.setVisualTheme(realTheme());
    bg?.remove();
    wrap?.remove();
    onDone();
  };

  // FAILSAFE: aconteça o que acontecer, a intro nunca trava a tela.
  const failsafe = window.setTimeout(finish, 7000);

  // Sem intro possível / sem movimento: revela direto.
  if (!bg || !wrap || reduceMotion) {
    galaxy?.setPlacement(1);
    galaxy?.form();
    finish();
    return;
  }

  try {
    document.body.classList.add('intro-active');
    galaxy?.setVisualTheme('dark'); // palco escuro: galáxia brilhante
    galaxy?.setPlacement(0); // centro, maior
    galaxy?.form(); // partículas convergindo

    const placement = { v: 0 };
    const tl = gsap.timeline({ onComplete: finish });

    // 1) nome revela sobre a galáxia nascendo
    tl.from('.intro-name', { yPercent: 60, opacity: 0, duration: 1.1, ease: 'power3.out' }, 0.35);
    tl.from('.intro-sub', { y: 16, opacity: 0, duration: 0.9, ease: 'power2.out' }, 0.85);

    // 2) segura enquanto a galáxia se forma e gira

    // 3) nome sai → galáxia voa pro hero → fundo abre → site surge
    tl.to('.intro-title', { opacity: 0, yPercent: -40, duration: 0.8, ease: 'power2.in' }, 2.6);
    tl.to(
      placement,
      { v: 1, duration: 1.5, ease: 'power2.inOut', onUpdate: () => galaxy?.setPlacement(placement.v) },
      2.9,
    );
    tl.add(reveal, 3.1); // hero entra junto com a abertura do palco
    tl.to('#intro-bg', { opacity: 0, duration: 1.1, ease: 'power2.inOut' }, 3.2);

    // clique pula a intro (fast-forward suave)
    bg.addEventListener('click', () => gsap.to(tl, { timeScale: 5, duration: 0.4 }), { once: true });
  } catch (err) {
    console.error('[intro] falhou — revelando o site direto:', err);
    finish();
  }
}
