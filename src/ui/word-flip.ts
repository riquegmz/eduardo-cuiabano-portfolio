const WORDS = ['experiências digitais', 'animações', 'motion design', 'modelos 3D'] as const;
const HOLD = 2400; // tempo exibindo a palavra (ms)
const FLIP = 380; // duração de cada meio-giro (ms)

/** Loop de troca de palavra no hero, com o efeito de flip 3D do CSS. */
export function initWordFlip(reduceMotion: boolean): void {
  const el = document.getElementById('flip-word');
  if (!el) return;

  if (reduceMotion) {
    el.textContent = WORDS[0];
    return;
  }

  let idx = 0;

  const next = (): void => {
    el.style.animation = `flipOut ${FLIP}ms cubic-bezier(.4,0,.6,1) forwards`;
    window.setTimeout(() => {
      idx = (idx + 1) % WORDS.length;
      el.textContent = WORDS[idx] ?? WORDS[0];
      el.style.animation = `flipIn ${FLIP}ms cubic-bezier(.4,0,.6,1) forwards`;
      window.setTimeout(() => {
        el.style.animation = 'none';
        window.setTimeout(next, HOLD);
      }, FLIP);
    }, FLIP);
  };

  window.setTimeout(next, HOLD);
}
