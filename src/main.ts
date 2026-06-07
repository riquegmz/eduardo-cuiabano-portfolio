// Fontes self-hosted (variáveis: Fraunces com opsz/italic, Outfit wght).
import '@fontsource-variable/fraunces/standard.css';
import '@fontsource-variable/fraunces/standard-italic.css';
import '@fontsource-variable/outfit/index.css';
import './styles/main.css';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initSmoothScroll } from './scroll/smooth-scroll';
import { createGalaxyScene } from './scene/galaxy-scene';
import type { Scene3D } from './scene/galaxy-scene';
import { prepareReveals, revealHero, initScrollReveals } from './ui/motion';
import { initWordFlip } from './ui/word-flip';
import { initDiscordCopy } from './ui/discord-copy';
import { initTheme } from './ui/theme';
import { initIntro } from './ui/intro';
import { initWorkPreview } from './ui/work-preview';
import { initMagnetic } from './ui/magnetic';
import { initClock } from './ui/clock';
import { initParallax } from './ui/parallax';
import { initSectionIndex } from './ui/section-index';
// import { initMarquee } from './ui/marquee'; // faixa horizontal desativada por enquanto

// O CSS principal já foi importado/injetado acima → seguro revelar o <body>.
// (Anti-FOUC: o HTML mantém o body invisível até esta marca.)
document.documentElement.classList.add('app-ready');

// A intro é sempre do topo: não deixa o navegador restaurar o scroll no meio
// da página (senão a galáxia, acima na intro, cobre o conteúdo no F5).
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1) Scroll suave + ponte com o ScrollTrigger (travado durante o loading).
const smooth = initSmoothScroll(reduceMotion);
smooth.lenis.scrollTo(0, { immediate: true });
smooth.lenis.stop();

// Âncoras da nav/CTA roteadas pelo Lenis.
document.querySelectorAll<HTMLAnchorElement>('a[data-scroll-to]').forEach((anchor) => {
  anchor.addEventListener('click', (event) => {
    const href = anchor.getAttribute('href');
    if (href?.startsWith('#')) {
      event.preventDefault();
      smooth.scrollTo(href);
    }
  });
});

// 2) Galáxia 3D — isolada: se o WebGL falhar nesta máquina/GPU, o site
//    segue normalmente sem o 3D (em vez de travar tudo).
const mount = document.getElementById('scene');
let galaxy: Scene3D | null = null;
if (mount) {
  try {
    galaxy = createGalaxyScene(mount, reduceMotion);
    window.addEventListener('resize', () => galaxy?.resize());
    ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => galaxy?.setProgress(self.progress),
    });
  } catch (err) {
    console.error('[galáxia] WebGL indisponível — seguindo sem o 3D:', err);
    mount.remove();
    galaxy = null;
  }
}

// Divide os títulos em palavras mascaradas ANTES do word-flip (que precisa
// achar o #flip-word já no DOM final) e prepara os reveals de seção
// (IntersectionObserver — escondem o conteúdo já e revelam ao entrar na tela).
prepareReveals(reduceMotion);
initScrollReveals(reduceMotion);

// 0) Intro cinematográfica: orquestra a galáxia e revela o site.
//    onReveal → anima o hero; onDone → destrava o scroll.
initIntro(reduceMotion, galaxy, {
  onReveal: () => revealHero(reduceMotion),
  onDone: () => {
    smooth.lenis.start();
    ScrollTrigger.refresh(); // recalcula o gatilho da galáxia (altura final)
  },
});

// 3) Micro-interações.
initTheme();
initWordFlip(reduceMotion);
initDiscordCopy();
initWorkPreview(reduceMotion);
initMagnetic(reduceMotion);
initClock();
initParallax(reduceMotion);
initSectionIndex(smooth.scrollTo);
// initMarquee(smooth.lenis, reduceMotion); // faixa horizontal desativada por enquanto

// A foto do "Sobre" carrega depois → recalcula o gatilho da galáxia (altura
// da página) quando ela chega.
const aboutPhoto = document.querySelector<HTMLImageElement>('#sobre .photo-frame img');
if (aboutPhoto && !aboutPhoto.complete) {
  aboutPhoto.addEventListener('load', () => ScrollTrigger.refresh(), { once: true });
}

// Recalcula a altura após carregar fontes/imagens; e garante topo no reload.
window.addEventListener('load', () => {
  window.scrollTo(0, 0);
  ScrollTrigger.refresh();
});
