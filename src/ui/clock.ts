/**
 * Relógio ao vivo do horário local do Eduardo (Rio de Janeiro).
 * Usa o fuso fixo America/Sao_Paulo — mostra a hora dele, não a de quem visita.
 */
export function initClock(): void {
  const el = document.getElementById('local-time');
  if (!el) return;

  const fmt = new Intl.DateTimeFormat('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const update = (): void => {
    el.textContent = fmt.format(new Date());
  };
  update();
  window.setInterval(update, 1000);
}
