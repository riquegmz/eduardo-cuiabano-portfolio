# CLAUDE.md — Portfólio Eduardo Cuiabano

Contexto específico deste projeto. As regras globais (padrão world-class, segurança como fundação) continuam valendo por cima.

## O que é

Site de portfólio de **Eduardo Cuiabano** (designer 3D/motion). Henrique constrói; Eduardo refina conteúdo depois. Estático, sem backend.

## Stack cravada (não trocar sem motivo forte)

- **Vite** + **TypeScript strict** — build e linguagem.
- **Three.js** — o 3D.
- **Lenis** — scroll suave.
- **GSAP + ScrollTrigger** — animação ligada ao scroll.

Detalhes e justificativas em `ARCHITECTURE.md`.

## Invariantes (quebrar = bug)

- **CSS e JS separados.** Estilo em `src/styles/`, lógica em `src/`. Nunca misturar.
- **Boundaries:** `scene/` não importa scroll; `scroll/` não importa 3D. A ponte é só no `main.ts`.
- **Uma fonte de tempo:** o ticker do GSAP roda o Lenis. Não criar um segundo `requestAnimationFrame` de scroll.
- **Canvas é decorativo** (`aria-hidden`). O site precisa funcionar sem WebGL.
- **`prefers-reduced-motion` é respeitado** em toda animação nova.
- **`max_*` / limites explícitos** em qualquer loop 3D (segmentos, pixelRatio). Sem `pixelRatio` solto.
- Strict TS: zero `any`, zero `@ts-ignore`. Tipa-se de verdade.

## Glossário do domínio

- **espiral / hélice** = `HelixCurve` → `TubeGeometry`.
- **progress** = scroll normalizado `0..1` (0 = topo, 1 = fim da página).
- **tip** = esfera luminosa na ponta do tubo desenhado.

## Onde mexer

- Texto/seções → `index.html` (procure `👉 EDITE`).
- Cores/tipografia → `:root` em `src/styles/main.css`.
- Comportamento da espiral → `src/scene/spiral-scene.ts` (forma em `helix-curve.ts`).
- Sensação do scroll → `duration`/`smoothWheel` em `src/scroll/smooth-scroll.ts`.

## Deploy

`npm run build` → publicar `dist/` em hosting estático (Vercel/Netlify/GitHub Pages). Sem variáveis de ambiente, sem secrets.
