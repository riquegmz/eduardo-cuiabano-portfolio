type Theme = 'light' | 'dark';

const STORAGE_KEY = 'theme';
const root = document.documentElement;

function current(): Theme {
  return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function apply(theme: Theme): void {
  root.setAttribute('data-theme', theme);
  // Avisa quem precisa reagir (ex.: a galáxia 3D adapta cores/blend).
  window.dispatchEvent(new CustomEvent<Theme>('themechange', { detail: theme }));
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    /* localStorage indisponível (modo privado): só não persiste. */
  }
}

/**
 * Liga o botão de tema. O tema inicial já foi aplicado pelo script inline
 * do <head> (anti-flash); aqui só tratamos a alternância no clique.
 */
export function initTheme(): void {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    apply(current() === 'dark' ? 'light' : 'dark');
  });
}
