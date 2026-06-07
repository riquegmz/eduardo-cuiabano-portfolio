import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export interface SmoothScroll {
  lenis: Lenis;
  scrollTo(target: string | HTMLElement): void;
}

/**
 * Inicia o scroll suave (Lenis) e o casa com o GSAP ScrollTrigger:
 * o ScrollTrigger passa a ser atualizado pelo Lenis e a contar o tempo
 * pelo ticker do GSAP — fonte única de verdade para tudo ligado ao scroll.
 */
export function initSmoothScroll(reduceMotion: boolean): SmoothScroll {
  const lenis = new Lenis({
    duration: 1.1,
    smoothWheel: !reduceMotion,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time: number) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  return {
    lenis,
    scrollTo(target) {
      lenis.scrollTo(target, { offset: -80 });
    },
  };
}
