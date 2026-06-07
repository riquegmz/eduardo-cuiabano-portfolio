const DISCORD_ID = 'frinzada';

const TOAST_HTML =
  '<span class="toast-check"><svg viewBox="0 0 12 12"><polyline points="2,6 5,9 10,3"/></svg></span>' +
  `ID <span class="toast-id">${DISCORD_ID}</span>&nbsp;copiado!`;

/** Botão "Discord": copia o ID e mostra um toast de confirmação. */
export function initDiscordCopy(): void {
  const btn = document.getElementById('discord-btn');
  const toast = document.getElementById('copy-toast');
  if (!btn || !toast) return;

  let timer: number | undefined;

  const showToast = (): void => {
    toast.innerHTML = TOAST_HTML;
    toast.classList.add('visible');
    window.clearTimeout(timer);
    timer = window.setTimeout(() => toast.classList.remove('visible'), 2800);
  };

  const fallbackCopy = (): void => {
    // Navegadores que bloqueiam a Clipboard API fora de HTTPS.
    const ta = document.createElement('textarea');
    ta.value = DISCORD_ID;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    showToast();
  };

  btn.addEventListener('click', (e) => {
    e.preventDefault();
    if (navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(DISCORD_ID).then(showToast).catch(fallbackCopy);
    } else {
      fallbackCopy();
    }
  });
}
