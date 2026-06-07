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
- **Reveals de seção usam IntersectionObserver, NÃO ScrollTrigger por-elemento** (`motion.ts`). O ScrollTrigger por-elemento não disparava confiável com Lenis aqui (texto/cards ficavam presos escondidos). O gatilho global da galáxia (start:0/end:max) funciona normal.
- **`prefers-reduced-motion`**: no Windows é ligado pela config "Efeitos de animação". Quando o dev tava com isso OFF, o site "não carregava" (modo reduzido escondia tudo). Por isso os reveals nunca escondem de forma que possa ficar presa, e há failsafes (body aparece sozinho em 3s; intro se remove em 7s; galáxia em try/catch).
- **Anti-FOUC**: `<body>` invisível (CSS inline no `<head>`) até `main.ts` marcar `<html class="app-ready">` (CSS é injetado via JS em dev).
- **Reload sempre no topo**: `history.scrollRestoration='manual'` + `scrollTo(0)` (senão a galáxia da intro cobria conteúdo no F5).
- Eduardo é do **Rio de Janeiro** (relógio do Contato usa fuso `America/Sao_Paulo`) — não Cuiabá apesar do sobrenome.

## Iterações de design (3D do hero)

Jornada até o elemento certo (todos rejeitados até o último):
1. Blob CSS → raso. 2. Blob 3D metálico → "não gostei". 3. Espiral coil (tubo grosso) → "parece mola/coco". 4. Espiral linha fina → ainda estranha. 5. Esfera com ruído → "parece um coco gigante". 6. **Galáxia espiral de partículas** (`galaxy-scene.ts`) — direção atual: 14k pontos, rotação diferencial (núcleo mais rápido), gradiente dourado→brasa, glow aditivo, reage a scroll/mouse. Reconecta com a ideia de "espiral" do briefing original.

Estado de layout/UX cravado:
- **F-pattern**: tudo alinhado à esquerda; faixa (`--lane`) reservada à direita só pro 3D; 3D some no mobile.
- Galáxia: **persistente em opacidade baixa**, confinada à direita por **shader animado** (uConfine/uDim por `placement`) — não máscara CSS (que dava corte seco). Intro cinematográfica (galáxia nasce no centro → nome → voa pro hero).
- Tema claro/escuro (dark-first, anti-flash), scrollbar escondida, reveals palavra-por-palavra com máscara + fade-up (stagger).
- **Nível Awwwards** (pedido do fundador, via `/hm-designer`). Já feito: Trabalhos como **índice editorial** com preview no cursor (estrutura pronta pra mídia via `data-preview`); Contato **statement** (e-mail gigante + hora local do RJ ao vivo); botões **magnéticos** (GSAP); labels de seção numerados `(01)/(02)/(03)`; **Sobre** com lista de skills editorial (matou as pills de SaaS); **parallax** na foto (imagem na máscara, `data-parallax`); **índice de seção** fixo na lateral direita (acende a ativa via IO). Cursor customizado foi testado e **removido** (fundador preferiu o padrão).
- **Marquee** (faixa horizontal reativa ao scroll) criada mas **desativada** por enquanto — comentada no HTML e no `main.ts` (módulo `marquee.ts` + estilos `.marquee` dormentes; reativar = descomentar os dois pontos).
- Barra: não shippar nada que pareça template.

## Pendências / próximos passos

- Eduardo: preencher projetos reais, e-mail, Instagram, foto definitiva.
- Avaliar deploy (Vercel recomendado) quando o conteúdo estiver pronto.
- Rodar `/hm-security` L1 para validar a fundação (mesmo sendo estático: headers de hosting, CSP).
