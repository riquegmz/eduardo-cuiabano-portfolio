# MEMORY — Portfólio Eduardo Cuiabano

Estado vivo do projeto. Manter < 200 linhas; detalhe longo vai para `docs/topics/`.

## Estado atual

- **2026-06-06** — Projeto reinicializado (`/hm-init`) de site estático para **Vite + TS strict + Three.js + Lenis + GSAP/ScrollTrigger**.
- Design original (paleta quente, Fraunces/Outfit, hero/sobre/trabalhos/contato) **migrado e preservado**.
- Espiral 3D real (hélice → tubo, draw-on-scroll) implementada em `src/scene/`.
- Conteúdo ainda é placeholder do Eduardo (projetos "Nome do Projeto", e-mail `seuemail@exemplo.com`, foto `public/img/fotosite.jpg`).

## Decisões cravadas

- **Sem Docker/backend/banco** — site estático puro; Docker não resolveria nada aqui (ver ARCHITECTURE.md).
- **Vanilla Three (sem React)** — página única; R3F seria peso desnecessário.
- **Lenis dirige o ticker do GSAP** — fonte única de scroll/tempo; não duplicar rAF de scroll.
- **Espiral = decorativa** (`aria-hidden`); site funciona sem WebGL.

## Gotchas aprendidos

- Tentativas anteriores de "3D" com CSS-blob e Three via `<script>`/CDN **não atingiram** o nível desejado (robinpayot). O salto de qualidade exigiu bundler + Lenis + ScrollTrigger.
- `#scene` (canvas) fica em `z-index:0`; todo conteúdo (`nav/header/section/footer`) em `z-index:1`, senão o canvas cobre o texto.
- `RoomEnvironment` no Three atual: construtor **sem** argumento de renderer.

## Iterações de design (3D do hero)

Jornada até o elemento certo (todos rejeitados até o último):
1. Blob CSS → raso. 2. Blob 3D metálico → "não gostei". 3. Espiral coil (tubo grosso) → "parece mola/coco". 4. Espiral linha fina → ainda estranha. 5. Esfera com ruído → "parece um coco gigante". 6. **Galáxia espiral de partículas** (`galaxy-scene.ts`) — direção atual: 14k pontos, rotação diferencial (núcleo mais rápido), gradiente dourado→brasa, glow aditivo, reage a scroll/mouse. Reconecta com a ideia de "espiral" do briefing original.

Estado de layout/UX cravado:
- **F-pattern**: tudo alinhado à esquerda; faixa (`--lane`) reservada à direita só pro 3D; 3D some no mobile.
- Loader, tema claro/escuro (dark-first, anti-flash), scrollbar escondida, motion via GSAP (entradas em stagger).
- Barra: o fundador quer nível Awwwards/"outro mundo". Não shippar nada que pareça template.

## Pendências / próximos passos

- Eduardo: preencher projetos reais, e-mail, Instagram, foto definitiva.
- Avaliar deploy (Vercel recomendado) quando o conteúdo estiver pronto.
- Rodar `/hm-security` L1 para validar a fundação (mesmo sendo estático: headers de hosting, CSP).
