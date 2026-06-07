# Arquitetura — Portfólio Eduardo Cuiabano

Site de portfólio com uma **espiral 3D dirigida por scroll**. Estático, sem backend.

## Stack — e por quê

| Camada            | Escolha                  | Por que esta, e não outra                                                                                       |
| ----------------- | ------------------------ | --------------------------------------------------------------------------------------------------------------- |
| Build / dev       | **Vite**                 | HMR instantâneo e build estático enxuto. Next.js seria peso morto: não há SSR, rotas nem backend.               |
| Linguagem         | **TypeScript (strict)**  | A espiral é matemática 3D (curvas, vetores, índices de geometria). Tipos eliminam uma classe inteira de bugs.   |
| 3D                | **Three.js**             | Padrão de fato para WebGL. Controle total sobre geometria/material/shading — o teto de qualidade do robinpayot. |
| Scroll suave      | **Lenis**                | É o que dá o "peso" cinematográfico ao scroll. Sem ele, scroll-driven 3D fica seco e travado.                   |
| Animação @ scroll | **GSAP + ScrollTrigger** | Liga progresso de scroll → estado da cena com precisão. Casado com o Lenis via ticker único.                    |

Sem React: para uma página única, vanilla + Three é mais leve e direto que React Three Fiber.

## Por que NÃO tem Docker / backend / banco

É um site **estático**. Não há dados, auth nem API. Deploy = subir `dist/` em Vercel/Netlify/GitHub Pages (CDN). Docker e Compose só adicionariam superfície e complexidade sem resolver nada. Engenharia world-class é também não construir o que o projeto não precisa.

## Estrutura

```
index.html              Entry do Vite. Markup semântico + #scene (canvas) + #src/main.ts
public/img/             Imagens servidas como estão (foto do perfil)
src/
├── main.ts             Bootstrap: scroll suave → cena 3D → reveals → micro-interações
├── styles/main.css     Design (paleta, tipografia, layout, animações)
├── scroll/
│   └── smooth-scroll.ts  Lenis + ponte com o ScrollTrigger (fonte única de tempo/scroll)
├── scene/
│   ├── helix-curve.ts    Curva paramétrica da hélice (espinha da espiral)
│   └── spiral-scene.ts   Cena Three.js: tubo 3D, materiais, luzes, draw-on-scroll
└── ui/
    ├── reveal.ts         Revela seções ao entrarem na viewport
    ├── word-flip.ts      Troca de palavra no hero
    └── discord-copy.ts   Copiar ID do Discord + toast
```

Boundaries: `scene/` não sabe o que é scroll; `scroll/` não sabe o que é 3D. O `main.ts` é o único ponto que liga os dois (`ScrollTrigger.onUpdate → spiral.setProgress`). Trocar a fonte de progresso ou a cena não vaza para o outro lado.

## A espiral 3D (núcleo)

1. `HelixCurve` gera uma hélice do topo (`y+`) à base (`y−`).
2. `TubeGeometry` extruda um tubo sólido ao longo dela (3D real, com sombreamento PBR).
3. O progresso de scroll (`0..1`) controla `geometry.setDrawRange` → o tubo **se desenha de cima para baixo** conforme você rola, até o fim da página.
4. O grupo translada em `y` para manter a **ponta luminosa** centralizada — a espiral parece "cair" pela tela.
5. `RoomEnvironment` (PMREM) dá reflexos críveis ao material metálico.

## Performance & custo

- `pixelRatio` limitado a 2 (telas Retina não explodem o fill-rate).
- `requestAnimationFrame` **pausa** quando a aba fica oculta (`visibilitychange`).
- Custo de operação: **zero** — sem APIs, sem servidores. Só hosting estático (faixa gratuita basta).
- `prefers-reduced-motion`: desliga rotação automática e o flip; o scroll vira nativo.

## Acessibilidade

Canvas é decorativo (`aria-hidden`). Conteúdo e navegação funcionam sem ele. Âncoras roteadas pelo Lenis com `offset` para não esconder o título sob a nav fixa.

## Rodar

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # gera dist/ (tsc --noEmit + vite build)
npm run preview    # serve o build
npm run lint       # eslint
npm run format     # prettier
```
