import { defineConfig } from 'vite';

// Site estático (sem backend). Deploy padrão em root (Vercel/Netlify) → base '/'.
// Para hospedar sob subcaminho (ex.: GitHub Pages /repo/), defina
// `base: '/nome-do-repo/'` aqui.
export default defineConfig({
  base: '/',
  build: {
    target: 'es2022',
    sourcemap: true,
  },
});
