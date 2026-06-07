# Portfólio — Eduardo Cuiabano

Site de portfólio com uma espiral 3D que desce pela página conforme o scroll.
Vite · TypeScript · Three.js · Lenis · GSAP.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

## Build

```bash
npm run build      # type-check + bundle em dist/
npm run preview    # serve o dist/ localmente
```

## Editar conteúdo

- **Textos e seções:** `index.html` — procure os comentários `👉 EDITE`.
- **Foto do "Sobre":** troque `public/img/fotosite.jpg` (ou o caminho no HTML).
- **Cores e fontes:** variáveis `:root` em `src/styles/main.css`.
- **A espiral 3D:** `src/scene/` (forma em `helix-curve.ts`, cena em `spiral-scene.ts`).

Visão geral da arquitetura em [`ARCHITECTURE.md`](./ARCHITECTURE.md).

## Deploy

Hosting estático (Vercel, Netlify, GitHub Pages): publique a pasta `dist/`.
Sem backend, sem variáveis de ambiente.
