import {
  AdditiveBlending,
  BufferAttribute,
  BufferGeometry,
  CanvasTexture,
  Clock,
  Color,
  Group,
  NormalBlending,
  PerspectiveCamera,
  Points,
  Scene,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  WebGLRenderer,
} from 'three';

type Theme = 'light' | 'dark';

/** Handle público da cena 3D. */
export interface Scene3D {
  /** progress 0..1 vindo do scroll da página. */
  setProgress(progress: number): void;
  /** dispara a formação da galáxia (partículas convergindo). */
  form(): void;
  /** 0 = pose de intro (centro, maior, mais de frente); 1 = pose de repouso (faixa direita). */
  setPlacement(t: number): void;
  /** força o visual de um tema (a intro usa 'dark' como palco). */
  setVisualTheme(theme: Theme): void;
  resize(): void;
  dispose(): void;
}

// --- Parâmetros da galáxia (afináveis) ---
const COUNT = 14000;
const GALAXY_RADIUS = 4.2;
const BRANCHES = 4;
const SPIN = 0.85;
const RANDOMNESS = 0.4;
const RANDOMNESS_POWER = 3.2;
const FORM_DURATION = 1900; // ms da convergência

// Cores por tema.
const THEME_COLORS: Record<Theme, { inside: string; outside: string }> = {
  dark: { inside: '#fff0d2', outside: '#b23a14' }, // brilho: núcleo dourado → brasa
  light: { inside: '#3a1206', outside: '#b4521e' }, // poeira: núcleo escuro → chocolate
};

const VERT = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform float uSpin;
  uniform float uFormation;
  uniform vec3 uInside;
  uniform vec3 uOutside;
  attribute float aScale;
  attribute float aMix;
  attribute vec3 aStart;
  varying vec3 vColor;
  varying float vForm;
  varying float vScreenX;
  void main(){
    vec3 p = position;
    float radius = length(p.xz);
    float angle = atan(p.z, p.x);
    // rotação diferencial: o núcleo gira mais rápido → galáxia viva
    angle += (1.0 / (radius + 0.35)) * uTime * uSpin;
    p.x = cos(angle) * radius;
    p.z = sin(angle) * radius;

    // formação: parte do ponto disperso (aStart) e converge p/ a galáxia
    vec3 finalPos = mix(aStart, p, uFormation);

    vec4 mv = modelViewMatrix * vec4(finalPos, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * aScale * (1.0 / -mv.z) * mix(0.35, 1.0, uFormation);
    vColor = mix(uInside, uOutside, aMix);
    vForm = uFormation;
    vScreenX = gl_Position.x / gl_Position.w; // -1 (esq) .. +1 (dir)
  }
`;

const FRAG = /* glsl */ `
  uniform float uAlpha;
  uniform float uConfine; // 0 = galáxia inteira (intro); 1 = confinada à direita
  uniform float uDim;     // brilho geral (menor em repouso)
  varying vec3 vColor;
  varying float vForm;
  varying float vScreenX;
  void main(){
    float d = length(gl_PointCoord - vec2(0.5));
    float a = 1.0 - smoothstep(0.0, 0.5, d);
    a = pow(a, 1.7);
    a *= smoothstep(0.0, 0.25, vForm); // fade-in durante a formação
    // confinamento à direita: some suavemente à esquerda da tela
    float conf = mix(1.0, smoothstep(-0.05, 0.55, vScreenX), uConfine);
    a *= conf * uDim;
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * uAlpha);
  }
`;

function buildGalaxy(): BufferGeometry {
  const positions = new Float32Array(COUNT * 3);
  const starts = new Float32Array(COUNT * 3);
  const mixes = new Float32Array(COUNT);
  const scales = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    const i3 = i * 3;
    const radius = Math.random() * GALAXY_RADIUS;
    const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
    const spinAngle = radius * SPIN;

    const scatter = (axisScale: number): number =>
      Math.pow(Math.random(), RANDOMNESS_POWER) *
      (Math.random() < 0.5 ? 1 : -1) *
      RANDOMNESS *
      radius *
      axisScale;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + scatter(1);
    positions[i3 + 1] = scatter(0.45);
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + scatter(1);

    // ponto inicial disperso: direção aleatória, longe → converge para dentro
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const dist = 7 + Math.random() * 9;
    starts[i3] = Math.sin(phi) * Math.cos(theta) * dist;
    starts[i3 + 1] = Math.cos(phi) * dist * 0.6;
    starts[i3 + 2] = Math.sin(phi) * Math.sin(theta) * dist;

    mixes[i] = radius / GALAXY_RADIUS;
    scales[i] = 0.4 + Math.random() * 0.9;
  }

  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('aStart', new BufferAttribute(starts, 3));
  geometry.setAttribute('aMix', new BufferAttribute(mixes, 1));
  geometry.setAttribute('aScale', new BufferAttribute(scales, 1));
  return geometry;
}

/** Textura radial quente para o brilho do núcleo (bloom, tema escuro). */
function makeGlowTexture(): CanvasTexture {
  const size = 256;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    g.addColorStop(0, 'rgba(255,244,222,0.95)');
    g.addColorStop(0.18, 'rgba(255,205,140,0.55)');
    g.addColorStop(0.45, 'rgba(220,120,45,0.18)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return new CanvasTexture(canvas);
}

function readTheme(): Theme {
  return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

export function createGalaxyScene(mount: HTMLElement, reduceMotion: boolean): Scene3D {
  const scene = new Scene();
  const camera = new PerspectiveCamera(45, 1, 0.1, 100);
  camera.position.set(0, 0, 6);

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setClearColor(0x000000, 0);
  const pixelRatio = Math.min(window.devicePixelRatio, 2);
  renderer.setPixelRatio(pixelRatio);
  mount.appendChild(renderer.domElement);

  const geometry = buildGalaxy();

  // Uniforms compartilhados entre as camadas (mesmo movimento/cores/formação).
  const shared = {
    uTime: { value: 0 },
    uSpin: { value: 0.16 },
    uFormation: { value: reduceMotion ? 1 : 0 },
    uInside: { value: new Color() },
    uOutside: { value: new Color() },
    uConfine: { value: 1 }, // confinada à direita por padrão (repouso)
    uDim: { value: 0.6 }, // brilho reduzido em repouso (presença sutil)
  };

  const coreMat = new ShaderMaterial({
    uniforms: { ...shared, uSize: { value: 26 * pixelRatio }, uAlpha: { value: 1 } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    depthWrite: false,
    transparent: true,
  });
  const haloMat = new ShaderMaterial({
    uniforms: { ...shared, uSize: { value: 78 * pixelRatio }, uAlpha: { value: 0.16 } },
    vertexShader: VERT,
    fragmentShader: FRAG,
    depthWrite: false,
    transparent: true,
  });

  const corePoints = new Points(geometry, coreMat);
  const haloPoints = new Points(geometry, haloMat);

  const glowTex = makeGlowTexture();
  const glowMat = new SpriteMaterial({
    map: glowTex,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
    opacity: 0.9,
  });
  const coreGlow = new Sprite(glowMat);
  coreGlow.scale.setScalar(5);

  const galaxy = new Group();
  galaxy.add(haloPoints, corePoints, coreGlow);
  scene.add(galaxy);

  // Posicionamento intro→repouso. placement 0 = centro/maior; 1 = faixa direita.
  // Começa em repouso; a intro (se houver) define 0 e anima até 1.
  let placement = 1;
  const REST = { x: 2.5, scale: 0.64, tiltX: -1.0 }; // mais contida e à direita
  const INTRO = { x: 0, scale: 1.15, tiltX: -0.5 };
  const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

  // --- Tema: escuro = bloom aditivo; claro = poeira escura (blend normal) ---
  function applyTheme(theme: Theme): void {
    const c = THEME_COLORS[theme];
    shared.uInside.value.set(c.inside);
    shared.uOutside.value.set(c.outside);

    if (theme === 'dark') {
      coreMat.blending = AdditiveBlending;
      haloMat.blending = AdditiveBlending;
      coreMat.uniforms.uAlpha!.value = 1;
      haloMat.uniforms.uAlpha!.value = 0.16;
      haloPoints.visible = true;
      coreGlow.visible = true;
    } else {
      coreMat.blending = NormalBlending;
      haloMat.blending = NormalBlending;
      coreMat.uniforms.uAlpha!.value = 0.95;
      haloPoints.visible = false; // poeira limpa, sem halo que borraria
      coreGlow.visible = false; // glow não faz sentido sobre fundo claro
    }
    coreMat.needsUpdate = true;
    haloMat.needsUpdate = true;
  }
  applyTheme(readTheme());

  const onThemeChange = (e: Event): void => {
    const detail = (e as CustomEvent<Theme>).detail;
    applyTheme(detail === 'light' ? 'light' : 'dark');
  };
  window.addEventListener('themechange', onThemeChange);

  let targetProgress = 0;
  let renderProgress = 0;
  let formStart = -1;

  let pointerX = 0;
  let pointerY = 0;
  let tiltX = 0;
  let tiltY = 0;
  const onPointer = (e: PointerEvent): void => {
    pointerX = e.clientX / window.innerWidth - 0.5;
    pointerY = e.clientY / window.innerHeight - 0.5;
  };
  if (!reduceMotion) window.addEventListener('pointermove', onPointer);

  function setProgress(input: number): void {
    targetProgress = Math.min(Math.max(input, 0), 1);
  }

  function form(): void {
    if (reduceMotion) {
      shared.uFormation.value = 1;
      return;
    }
    formStart = performance.now();
  }

  function resize(): void {
    const w = mount.clientWidth || window.innerWidth;
    const h = mount.clientHeight || window.innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }

  const clock = new Clock();
  let rafId = 0;
  function tick(): void {
    rafId = requestAnimationFrame(tick);
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = (shared.uTime.value += reduceMotion ? dt * 0.3 : dt);
    renderProgress += (targetProgress - renderProgress) * 0.08;

    if (formStart >= 0) {
      const e = Math.min((performance.now() - formStart) / FORM_DURATION, 1);
      shared.uFormation.value = 1 - Math.pow(1 - e, 3); // easeOutCubic
      if (e >= 1) formStart = -1;
    }

    if (!reduceMotion) {
      tiltX += (pointerY * 0.25 - tiltX) * 0.04;
      tiltY += (pointerX * 0.45 - tiltY) * 0.04;
    }

    // pose intro→repouso interpolada por placement
    galaxy.position.x = lerp(INTRO.x, REST.x, placement);
    galaxy.scale.setScalar(lerp(INTRO.scale, REST.scale, placement));
    galaxy.rotation.x = lerp(INTRO.tiltX, REST.tiltX, placement) + tiltX;
    galaxy.rotation.y = tiltY + renderProgress * Math.PI * 0.6;

    // intro = inteira e brilhante; repouso = confinada à direita e sutil
    // (animado pelo placement → sem corte seco ao terminar a intro)
    shared.uConfine.value = placement;
    shared.uDim.value = 1 - placement * 0.42;

    if (coreGlow.visible) {
      const pulse = 1 + Math.sin(t * 0.8) * 0.06;
      coreGlow.scale.setScalar(5 * pulse * shared.uFormation.value);
      // o glow do núcleo some no repouso (placement→1) p/ ficar sutil
      glowMat.opacity =
        (0.82 + Math.sin(t * 0.8) * 0.08) * shared.uFormation.value * (1 - placement * 0.7);
    }

    renderer.render(scene, camera);
  }
  function start(): void {
    if (!rafId) {
      clock.getDelta();
      tick();
    }
  }
  function stop(): void {
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function setPlacement(t: number): void {
    placement = Math.min(Math.max(t, 0), 1);
  }
  function setVisualTheme(theme: Theme): void {
    applyTheme(theme);
  }

  const onVisibility = (): void => (document.hidden ? stop() : start());
  document.addEventListener('visibilitychange', onVisibility);

  resize();
  start();

  function dispose(): void {
    stop();
    document.removeEventListener('visibilitychange', onVisibility);
    window.removeEventListener('pointermove', onPointer);
    window.removeEventListener('themechange', onThemeChange);
    geometry.dispose();
    coreMat.dispose();
    haloMat.dispose();
    glowMat.dispose();
    glowTex.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  return { setProgress, form, setPlacement, setVisualTheme, resize, dispose };
}
