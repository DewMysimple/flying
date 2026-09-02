import p5 from 'p5';
import './style.css';

const STORAGE_KEY = 'flying-lab:cuckoo-blood-flowers:settings:v1';
const SCENE_NAMES = {
  death: '暮山',
  transform: '化羽',
  flowers: '染春',
};

const DEFAULTS = Object.freeze({
  playbackSpeed: 1,
  deathDuration: 8,
  transformDuration: 9,
  flowersDuration: 13,
  kingScale: 1,
  kingX: 0.36,
  kingY: 0.68,
  birdScale: 1,
  birdFlightHeight: 0.34,
  moonX: 0.78,
  moonY: 0.22,
  mountainLayers: 5,
  contourPoints: 190,
  featherCount: 220,
  morphTurbulence: 1,
  gatherStrength: 1,
  goldRatio: 0.34,
  mistCount: 48,
  mistSpeed: 1,
  flowStrength: 0.82,
  wind: 0.14,
  grain: 0.7,
  callCount: 3,
  rippleSpeed: 190,
  rippleWidth: 26,
  rippleOpacity: 0.82,
  redIntensity: 1,
  flowerCount: 96,
  petalCount: 140,
  stainSpeed: 1,
  hitRadius: 22,
  flowerHeight: 0.32,
  nightColor: '#0a1022',
  inkColor: '#11141c',
  goldColor: '#c5a56a',
  mistColor: '#64788b',
  flowerColor: '#d7d1c5',
  redColor: '#b63a3f',
  seed: 1234,
});

const CONTROL_GROUPS = [
  {
    title: '叙事节奏',
    open: true,
    controls: [
      ['playbackSpeed', '播放速度', 0.25, 2, 0.05],
      ['deathDuration', '暮山时长', 4, 14, 0.5],
      ['transformDuration', '化羽时长', 5, 15, 0.5],
      ['flowersDuration', '染春时长', 8, 24, 0.5],
    ],
  },
  {
    title: '人物与构图',
    controls: [
      ['kingScale', '望帝大小', 0.7, 1.35, 0.05],
      ['kingX', '望帝横位', 0.26, 0.52, 0.01],
      ['kingY', '望帝纵位', 0.56, 0.79, 0.01],
      ['birdScale', '杜鹃大小', 0.7, 1.45, 0.05],
      ['birdFlightHeight', '飞行高度', 0.22, 0.48, 0.01],
      ['moonX', '残月横位', 0.58, 0.9, 0.01],
      ['moonY', '残月纵位', 0.1, 0.38, 0.01],
      ['mountainLayers', '山体层次', 3, 8, 1],
    ],
  },
  {
    title: '化羽重组',
    controls: [
      ['contourPoints', '轮廓采样', 90, 320, 10],
      ['featherCount', '羽片数量', 80, 420, 10],
      ['morphTurbulence', '旋流扰动', 0, 2, 0.05],
      ['gatherStrength', '汇聚力度', 0.45, 1.8, 0.05],
      ['goldRatio', '暗金碎纹', 0, 0.8, 0.02],
    ],
  },
  {
    title: '雾气与风',
    controls: [
      ['mistCount', '雾气数量', 16, 96, 4],
      ['mistSpeed', '雾气流速', 0, 2.2, 0.05],
      ['flowStrength', '旋流强度', 0, 1.8, 0.05],
      ['wind', '横向风力', -0.8, 0.8, 0.02],
      ['grain', '前景颗粒', 0, 1.8, 0.05],
    ],
  },
  {
    title: '视觉啼鸣',
    controls: [
      ['callCount', '鸣叫次数', 1, 5, 1],
      ['rippleSpeed', '波纹速度', 90, 360, 5],
      ['rippleWidth', '波纹宽度', 10, 58, 2],
      ['rippleOpacity', '波纹明度', 0.2, 1, 0.05],
      ['redIntensity', '朱红强度', 0.45, 1.65, 0.05],
    ],
  },
  {
    title: '山花染色',
    controls: [
      ['flowerCount', '山花数量', 40, 180, 4],
      ['petalCount', '落瓣数量', 40, 280, 10],
      ['stainSpeed', '染色速度', 0.25, 2.8, 0.05],
      ['hitRadius', '染色范围', 8, 48, 2],
      ['flowerHeight', '花海高度', 0.2, 0.48, 0.01],
    ],
  },
  {
    title: '导演色板',
    controls: [
      ['nightColor', '深靛夜色', 'color'],
      ['inkColor', '墨黑剪影', 'color'],
      ['goldColor', '暗金月色', 'color'],
      ['mistColor', '灰青雾气', 'color'],
      ['flowerColor', '灰白山花', 'color'],
      ['redColor', '朱红染色', 'color'],
    ],
  },
  {
    title: '随机构图',
    controls: [
      ['seed', '随机种子', 1, 9999, 1],
    ],
  },
];

const CONTROL_MAP = new Map(
  CONTROL_GROUPS.flatMap((group) => group.controls).map((definition) => [definition[0], definition]),
);

const DURATION_KEYS = new Set(['deathDuration', 'transformDuration', 'flowersDuration']);
const REBUILD_KEYS = new Set([
  'seed', 'kingScale', 'kingX', 'kingY', 'birdScale', 'birdFlightHeight', 'moonX', 'moonY',
  'mountainLayers', 'contourPoints', 'featherCount', 'mistCount', 'flowerCount', 'petalCount',
  'flowerHeight', 'goldRatio',
]);

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function smootherstep(value) {
  const t = clamp(value, 0, 1);
  return t * t * t * (t * (t * 6 - 15) + 10);
}

function totalDuration(settings) {
  return settings.deathDuration + settings.transformDuration + settings.flowersDuration;
}

function sceneAt(settings, time) {
  const deathEnd = settings.deathDuration;
  const transformEnd = deathEnd + settings.transformDuration;

  if (time < deathEnd) {
    return { key: 'death', local: time, duration: settings.deathDuration, progress: time / settings.deathDuration };
  }
  if (time < transformEnd) {
    const local = time - deathEnd;
    return { key: 'transform', local, duration: settings.transformDuration, progress: local / settings.transformDuration };
  }
  const local = time - transformEnd;
  return { key: 'flowers', local, duration: settings.flowersDuration, progress: local / settings.flowersDuration };
}

function timeForScene(settings, key, progress = 0) {
  if (key === 'death') return settings.deathDuration * progress;
  if (key === 'transform') return settings.deathDuration + settings.transformDuration * progress;
  return settings.deathDuration + settings.transformDuration + settings.flowersDuration * progress;
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60);
  const remainder = Math.floor(safe % 60);
  return `${minutes}:${String(remainder).padStart(2, '0')}`;
}

function formatValue(key, value) {
  if (typeof value === 'string') return value.toUpperCase();
  if (['mountainLayers', 'contourPoints', 'featherCount', 'mistCount', 'callCount', 'flowerCount', 'petalCount', 'seed'].includes(key)) {
    return String(Math.round(value));
  }
  if (DURATION_KEYS.has(key)) return `${Number(value).toFixed(1)}s`;
  if (key === 'rippleSpeed') return `${Math.round(value)}px/s`;
  if (key === 'rippleWidth' || key === 'hitRadius') return `${Math.round(value)}px`;
  if (['kingX', 'kingY', 'birdFlightHeight', 'moonX', 'moonY', 'flowerHeight', 'goldRatio'].includes(key)) {
    return `${Math.round(value * 100)}%`;
  }
  if (key === 'wind') return Number(value).toFixed(2);
  return Number(value).toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
}

function loadSettings() {
  const settings = { ...DEFAULTS };
  try {
    const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '{}');
    for (const [key, fallback] of Object.entries(DEFAULTS)) {
      const definition = CONTROL_MAP.get(key);
      const candidate = saved[key];
      if (!definition) continue;
      if (definition[2] === 'color') {
        if (typeof candidate === 'string' && /^#[0-9a-f]{6}$/i.test(candidate)) settings[key] = candidate;
      } else if (Number.isFinite(Number(candidate))) {
        settings[key] = clamp(Number(candidate), Number(definition[2]), Number(definition[3]));
      } else {
        settings[key] = fallback;
      }
    }
  } catch {
    return settings;
  }
  return settings;
}

function saveSettings(settings) {
  try {
    const saved = {};
    Object.keys(DEFAULTS).forEach((key) => { saved[key] = settings[key]; });
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Blocked storage must not stop the artwork.
  }
}

function samplePolyline(points, count, closed = false) {
  const source = closed ? [...points, points[0]] : points;
  const lengths = [];
  let total = 0;
  for (let index = 1; index < source.length; index += 1) {
    const [x1, y1] = source[index - 1];
    const [x2, y2] = source[index];
    total += Math.hypot(x2 - x1, y2 - y1);
    lengths.push(total);
  }
  if (total === 0) return Array.from({ length: count }, () => ({ x: source[0][0], y: source[0][1] }));

  return Array.from({ length: count }, (_, sampleIndex) => {
    const distance = (sampleIndex / Math.max(1, count - (closed ? 0 : 1))) * total;
    let segment = lengths.findIndex((length) => length >= distance);
    if (segment < 0) segment = lengths.length - 1;
    const previousLength = segment === 0 ? 0 : lengths[segment - 1];
    const segmentLength = Math.max(0.0001, lengths[segment] - previousLength);
    const amount = (distance - previousLength) / segmentLength;
    const start = source[segment];
    const end = source[segment + 1];
    return {
      x: start[0] + (end[0] - start[0]) * amount,
      y: start[1] + (end[1] - start[1]) * amount,
    };
  });
}

export function mount(container) {
  const settings = loadSettings();
  const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = {
    time: 0,
    paused: motionMedia.matches,
    complete: false,
    panelOpen: false,
    reducedMotion: motionMedia.matches,
    timelineActive: false,
    sceneKey: 'death',
  };

  const root = document.createElement('section');
  root.className = 'cuckoo-project';
  root.setAttribute('aria-label', '杜鹃啼血诗意动态叙事');
  root.innerHTML = `
    <div class="cuckoo-canvas-host" data-role="canvas-host" aria-label="望帝化为杜鹃并染红山花的动态画布"></div>
    <div class="cuckoo-story-copy" data-role="story-copy" aria-hidden="true">
      <p class="cuckoo-eyebrow">AN EASTERN MYTH IN MOTION</p>
      <h1 class="cuckoo-title">杜鹃啼血</h1>
    </div>
    <p class="cuckoo-scene-label" data-role="scene-label" aria-live="polite">暮山</p>
    <button class="cuckoo-panel-toggle" data-role="panel-toggle" type="button" aria-expanded="false" aria-controls="cuckoo-control-panel">
      <span class="cuckoo-toggle-mark" aria-hidden="true"></span>
      <span data-role="toggle-label">展开参数</span>
    </button>
    <aside class="cuckoo-control-panel" id="cuckoo-control-panel" data-role="control-panel" aria-label="杜鹃啼血创作参数">
      <header class="cuckoo-panel-heading">
        <div><p>POETIC STORYBOARD</p><h1>杜鹃啼血</h1></div>
        <div class="cuckoo-live-state"><strong data-role="live-scene">暮山</strong><span data-role="flower-state">0 / 96 染红</span></div>
      </header>
      <div class="cuckoo-transport">
        <div class="cuckoo-scene-buttons" data-role="scene-buttons"></div>
        <div class="cuckoo-time-row">
          <span data-role="current-time">0:00</span>
          <input class="cuckoo-timeline" data-role="timeline" type="range" min="0" max="30" value="0" step="0.01" aria-label="叙事时间轴" />
          <span data-role="total-time">0:30</span>
        </div>
      </div>
      <div class="cuckoo-control-groups" data-role="control-groups"></div>
      <div class="cuckoo-actions">
        <button class="cuckoo-action cuckoo-action-primary" data-role="replay" type="button">重新播放</button>
        <button class="cuckoo-action" data-role="pause" type="button" aria-pressed="false">暂停</button>
        <button class="cuckoo-action" data-role="regenerate" type="button">重排构图</button>
        <button class="cuckoo-action" data-role="defaults" type="button">导演默认</button>
      </div>
    </aside>
  `;
  container.append(root);

  const controls = {
    canvasHost: root.querySelector('[data-role="canvas-host"]'),
    storyCopy: root.querySelector('[data-role="story-copy"]'),
    sceneLabel: root.querySelector('[data-role="scene-label"]'),
    panelToggle: root.querySelector('[data-role="panel-toggle"]'),
    toggleLabel: root.querySelector('[data-role="toggle-label"]'),
    panel: root.querySelector('[data-role="control-panel"]'),
    sceneButtons: root.querySelector('[data-role="scene-buttons"]'),
    groups: root.querySelector('[data-role="control-groups"]'),
    timeline: root.querySelector('[data-role="timeline"]'),
    currentTime: root.querySelector('[data-role="current-time"]'),
    totalTime: root.querySelector('[data-role="total-time"]'),
    liveScene: root.querySelector('[data-role="live-scene"]'),
    flowerState: root.querySelector('[data-role="flower-state"]'),
    replay: root.querySelector('[data-role="replay"]'),
    pause: root.querySelector('[data-role="pause"]'),
    regenerate: root.querySelector('[data-role="regenerate"]'),
    defaults: root.querySelector('[data-role="defaults"]'),
    inputs: new Map(),
  };
  const listeners = new AbortController();
  let rebuildArtwork = () => {};
  let redrawArtwork = () => {};
  let replayArtwork = () => {};
  let cleanupSketch = () => {};

  function syncPalette() {
    root.style.setProperty('--cuckoo-night', settings.nightColor);
    root.style.setProperty('--cuckoo-ink', settings.inkColor);
    root.style.setProperty('--cuckoo-gold', settings.goldColor);
    root.style.setProperty('--cuckoo-mist', settings.mistColor);
    root.style.setProperty('--cuckoo-flower', settings.flowerColor);
    root.style.setProperty('--cuckoo-red', settings.redColor);
  }

  function updateTransport() {
    const total = totalDuration(settings);
    controls.timeline.max = String(total);
    if (!state.timelineActive) controls.timeline.value = String(clamp(state.time, 0, total));
    controls.currentTime.textContent = formatTime(state.time);
    controls.totalTime.textContent = formatTime(total);
    controls.liveScene.textContent = SCENE_NAMES[state.sceneKey];
    [...controls.sceneButtons.children].forEach((button) => {
      button.setAttribute('aria-current', String(button.dataset.scene === state.sceneKey));
    });
    controls.pause.textContent = state.complete ? '再次播放' : state.paused ? '继续' : '暂停';
    controls.pause.setAttribute('aria-pressed', String(state.paused));
  }

  Object.entries(SCENE_NAMES).forEach(([key, title]) => {
    const button = document.createElement('button');
    button.className = 'cuckoo-scene-button';
    button.type = 'button';
    button.dataset.scene = key;
    button.textContent = title;
    button.addEventListener('click', () => {
      state.time = timeForScene(settings, key, 0);
      state.complete = false;
      state.sceneKey = key;
      updateTransport();
      redrawArtwork();
    }, { signal: listeners.signal });
    controls.sceneButtons.append(button);
  });

  CONTROL_GROUPS.forEach((groupDefinition) => {
    const group = document.createElement('details');
    const summary = document.createElement('summary');
    const grid = document.createElement('div');
    group.className = 'cuckoo-control-group';
    group.open = Boolean(groupDefinition.open);
    summary.textContent = groupDefinition.title;
    grid.className = 'cuckoo-control-grid';
    group.append(summary, grid);

    groupDefinition.controls.forEach(([key, label, minOrType, max, step]) => {
      const row = document.createElement('label');
      const name = document.createElement('span');
      const output = document.createElement('output');
      const input = document.createElement('input');
      row.className = 'cuckoo-control-row';
      name.textContent = label;
      output.textContent = formatValue(key, settings[key]);
      output.value = formatValue(key, settings[key]);
      input.dataset.control = key;

      if (minOrType === 'color') {
        input.type = 'color';
        input.className = 'cuckoo-color-input';
        input.value = settings[key];
      } else {
        input.type = 'range';
        input.min = String(minOrType);
        input.max = String(max);
        input.step = String(step);
        input.value = String(settings[key]);
      }

      input.addEventListener('input', () => {
        const previousScene = sceneAt(settings, state.time);
        settings[key] = minOrType === 'color' ? input.value : Number(input.value);
        if (DURATION_KEYS.has(key)) state.time = timeForScene(settings, previousScene.key, previousScene.progress);
        output.textContent = formatValue(key, settings[key]);
        output.value = formatValue(key, settings[key]);
        if (minOrType === 'color') syncPalette();
        saveSettings(settings);
        if (REBUILD_KEYS.has(key)) rebuildArtwork();
        updateTransport();
        redrawArtwork();
      }, { signal: listeners.signal });

      row.append(name, output, input);
      grid.append(row);
      controls.inputs.set(key, { input, output });
    });
    controls.groups.append(group);
  });

  controls.panelToggle.addEventListener('click', () => {
    state.panelOpen = !state.panelOpen;
    controls.panel.classList.toggle('is-open', state.panelOpen);
    controls.panelToggle.setAttribute('aria-expanded', String(state.panelOpen));
    controls.toggleLabel.textContent = state.panelOpen ? '收起参数' : '展开参数';
  }, { signal: listeners.signal });

  controls.timeline.addEventListener('pointerdown', () => { state.timelineActive = true; }, { signal: listeners.signal });
  window.addEventListener('pointerup', () => { state.timelineActive = false; }, { signal: listeners.signal });
  controls.timeline.addEventListener('input', () => {
    state.time = Number(controls.timeline.value);
    state.complete = state.time >= totalDuration(settings);
    state.sceneKey = sceneAt(settings, state.time).key;
    updateTransport();
    redrawArtwork();
  }, { signal: listeners.signal });

  controls.replay.addEventListener('click', () => replayArtwork(), { signal: listeners.signal });
  controls.pause.addEventListener('click', () => {
    if (state.complete) replayArtwork();
    else {
      state.paused = !state.paused;
      updateTransport();
    }
  }, { signal: listeners.signal });
  controls.regenerate.addEventListener('click', () => {
    settings.seed = settings.seed >= 9999 ? 1 : settings.seed + 1;
    const seedControl = controls.inputs.get('seed');
    seedControl.input.value = String(settings.seed);
    seedControl.output.textContent = String(settings.seed);
    saveSettings(settings);
    rebuildArtwork();
  }, { signal: listeners.signal });
  controls.defaults.addEventListener('click', () => {
    Object.assign(settings, DEFAULTS);
    try { window.localStorage.removeItem(STORAGE_KEY); } catch { /* Ignore blocked storage. */ }
    controls.inputs.forEach(({ input, output }, key) => {
      input.value = String(settings[key]);
      output.textContent = formatValue(key, settings[key]);
      output.value = formatValue(key, settings[key]);
    });
    syncPalette();
    state.time = 0;
    state.complete = false;
    state.paused = state.reducedMotion;
    rebuildArtwork();
    updateTransport();
  }, { signal: listeners.signal });

  syncPalette();
  updateTransport();

  const sketch = (p) => {
    const mountains = [];
    const stars = [];
    const mistBands = [];
    const flowers = [];
    const petals = [];
    const morphParticles = [];
    const pointer = { x: 0, y: 0, seen: false };
    let canvasElement;
    let frameCounter = 0;

    function hexRgb(hex) {
      const parsed = Number.parseInt(hex.slice(1), 16);
      return [(parsed >> 16) & 255, (parsed >> 8) & 255, parsed & 255];
    }

    function colorWithAlpha(hex, alpha) {
      const [red, green, blue] = hexRgb(hex);
      return p.color(red, green, blue, alpha);
    }

    function curlAt(x, y, z = 0) {
      const epsilon = 0.008;
      const scale = 0.0045;
      const nx = x * scale;
      const ny = y * scale;
      const dPsiDx = (p.noise(nx + epsilon, ny, z) - p.noise(nx - epsilon, ny, z)) / (2 * epsilon);
      const dPsiDy = (p.noise(nx, ny + epsilon, z) - p.noise(nx, ny - epsilon, z)) / (2 * epsilon);
      const magnitude = Math.hypot(dPsiDy, -dPsiDx) || 1;
      return { x: dPsiDy / magnitude, y: -dPsiDx / magnitude };
    }

    function hash(index, salt = 0) {
      const value = Math.sin((index + 1) * 12.9898 + (settings.seed + salt) * 78.233) * 43758.5453;
      return value - Math.floor(value);
    }

    function transformBirdAnchor() {
      return { x: p.width * 0.575, y: p.height * settings.birdFlightHeight };
    }

    function birdPosition(localTime) {
      const start = transformBirdAnchor();
      const flightDuration = Math.max(2.4, settings.flowersDuration * 0.34);
      const amount = smootherstep(localTime / flightDuration);
      const hover = Math.max(0, localTime - flightDuration);
      return {
        x: p.lerp(start.x, p.width * 0.71, amount) + Math.sin(hover * 0.55) * p.width * 0.008,
        y: p.lerp(start.y, p.height * (settings.birdFlightHeight - 0.035), amount) + Math.sin(hover * 1.05) * p.height * 0.009,
      };
    }

    function callTimes() {
      if (settings.callCount === 3 && settings.flowersDuration >= 9.4) return [1.8, 4.6, 7.8];
      const end = Math.min(settings.flowersDuration - 1.8, 8.8);
      if (settings.callCount === 1) return [Math.min(2.2, end)];
      return Array.from({ length: settings.callCount }, (_, index) => p.lerp(1.6, end, index / (settings.callCount - 1)));
    }

    function buildMountains() {
      mountains.length = 0;
      stars.length = 0;
      p.randomSeed(Math.round(settings.seed));
      p.noiseSeed(Math.round(settings.seed));

      for (let index = 0; index < settings.mountainLayers; index += 1) {
        const depth = index / Math.max(1, settings.mountainLayers - 1);
        const baseY = p.height * p.lerp(0.38, 0.78, depth);
        const amplitude = p.height * p.lerp(0.13, 0.06, depth);
        const points = [];
        for (let step = -1; step <= 25; step += 1) {
          const x = (step / 24) * p.width;
          const noiseValue = p.noise(step * 0.16 + index * 5.7, settings.seed * 0.001);
          const ridge = Math.pow(noiseValue, 1.45) * amplitude;
          points.push({ x, y: baseY - ridge });
        }
        mountains.push({ depth, points });
      }

      for (let index = 0; index < 72; index += 1) {
        stars.push({
          x: p.random(p.width * 0.08, p.width * 0.97),
          y: p.random(p.height * 0.04, p.height * 0.49),
          size: p.random(0.45, 1.65),
          alpha: p.random(18, 72),
          phase: p.random(p.TWO_PI),
        });
      }
    }

    function buildMist() {
      mistBands.length = 0;
      p.randomSeed(Math.round(settings.seed) + 203);
      for (let index = 0; index < settings.mistCount; index += 1) {
        mistBands.push({
          x: p.random(-0.12, 1.12),
          y: p.random(0.24, 0.9),
          width: p.random(0.08, 0.24),
          height: p.random(0.012, 0.045),
          alpha: p.random(5, 17),
          speed: p.random(0.4, 1.1),
          phase: p.random(100),
        });
      }
    }

    function buildFlowers() {
      flowers.length = 0;
      p.randomSeed(Math.round(settings.seed) + 911);
      const startY = 1 - settings.flowerHeight;
      for (let index = 0; index < settings.flowerCount; index += 1) {
        const depth = p.random();
        const yNorm = p.lerp(startY, 1.035, Math.pow(depth, 0.72));
        flowers.push({
          x: p.random(0.055, 1.02),
          y: yNorm,
          depth,
          size: p.lerp(6, 25, depth) * p.random(0.78, 1.22),
          rotation: p.random(p.TWO_PI),
          phase: p.random(p.TWO_PI),
          hitDelay: p.random(0.45, 1.8),
        });
      }
      flowers.sort((a, b) => a.depth - b.depth);
    }

    function buildPetals() {
      petals.length = 0;
      p.randomSeed(Math.round(settings.seed) + 1771);
      for (let index = 0; index < settings.petalCount; index += 1) {
        petals.push({
          callIndex: index % Math.max(1, settings.callCount),
          delay: p.random(0.22, 2.1),
          xOffset: p.randomGaussian(0, 68),
          yOffset: p.random(-20, 24),
          fallSpeed: p.random(33, 76),
          drift: p.random(-28, 34),
          size: p.random(2.2, 6.5),
          spin: p.random(-2.6, 2.6),
          phase: p.random(100),
        });
      }
    }

    function semanticShapes() {
      const kScale = Math.min(p.width, p.height) * 0.16 * settings.kingScale;
      const kx = p.width * settings.kingX;
      const ky = p.height * settings.kingY;
      const bird = transformBirdAnchor();
      const bScale = Math.min(p.width, p.height) * 0.12 * settings.birdScale;
      const source = {
        crown: [[-0.25, -1.08], [-0.19, -1.35], [-0.06, -1.12], [0.03, -1.42], [0.15, -1.12], [0.25, -1.3], [0.29, -1.02]],
        head: [[0.29, -1.02], [0.38, -0.88], [0.34, -0.72], [0.25, -0.63], [0.23, -0.48]],
        torso: [[0.23, -0.48], [0.5, -0.12], [0.55, 0.35], [0.38, 0.88], [0.02, 1.12], [-0.27, 0.72], [-0.3, -0.12], [-0.14, -0.51]],
        sleeve: [[-0.12, -0.43], [-0.6, -0.18], [-0.82, 0.18], [-0.55, 0.38], [-0.16, 0.08], [0.18, 0.02], [0.48, 0.22]],
        robe: [[-0.27, 0.24], [-0.62, 0.8], [-0.76, 1.3], [-0.35, 1.22], [0.03, 1.34], [0.46, 1.22], [0.72, 1.28], [0.52, 0.74], [0.38, 0.36]],
      };
      const target = {
        crown: [[0.24, -0.2], [0.34, -0.34], [0.48, -0.29], [0.55, -0.18], [0.67, -0.16]],
        head: [[0.45, -0.25], [0.67, -0.16], [0.87, -0.1], [0.66, -0.02], [0.47, 0.02], [0.33, 0.18]],
        torso: [[0.34, -0.06], [0.38, 0.2], [0.14, 0.39], [-0.2, 0.34], [-0.43, 0.12], [-0.28, -0.12], [0.02, -0.22]],
        sleeve: [[0.08, -0.1], [-0.08, -0.65], [-0.45, -1.04], [-0.74, -0.96], [-0.57, -0.44], [-0.22, -0.02], [0.12, 0.18]],
        robe: [[-0.18, 0.22], [-0.57, 0.58], [-0.94, 0.77], [-0.62, 0.31], [-1.08, 0.43], [-0.7, 0.02], [-0.39, -0.08], [-0.08, 0.11]],
      };
      const sourceAbsolute = {};
      const targetAbsolute = {};
      Object.keys(source).forEach((key) => {
        sourceAbsolute[key] = source[key].map(([x, y]) => [kx + x * kScale, ky + y * kScale]);
        targetAbsolute[key] = target[key].map(([x, y]) => [bird.x + x * bScale, bird.y + y * bScale]);
      });
      return { source: sourceAbsolute, target: targetAbsolute };
    }

    function buildMorphParticles() {
      morphParticles.length = 0;
      const shapes = semanticShapes();
      const weights = { crown: 0.12, head: 0.12, torso: 0.24, sleeve: 0.24, robe: 0.28 };
      p.randomSeed(Math.round(settings.seed) + 2711);

      Object.keys(weights).forEach((key) => {
        const count = Math.max(8, Math.round(settings.contourPoints * weights[key]));
        const source = samplePolyline(shapes.source[key], count, key === 'torso');
        const target = samplePolyline(shapes.target[key], count, key === 'torso');
        for (let index = 0; index < count; index += 1) {
          morphParticles.push({
            source: source[index],
            target: target[index],
            phase: p.random(100),
            size: p.random(2.1, 5.8),
            gold: p.random() < settings.goldRatio,
          });
        }
      });

      while (morphParticles.length < settings.featherCount) {
        const original = morphParticles[Math.floor(p.random(morphParticles.length))];
        morphParticles.push({
          source: { x: original.source.x + p.random(-8, 8), y: original.source.y + p.random(-8, 8) },
          target: { x: original.target.x + p.random(-7, 7), y: original.target.y + p.random(-7, 7) },
          phase: p.random(100),
          size: p.random(1.7, 4.8),
          gold: p.random() < settings.goldRatio,
        });
      }
      if (morphParticles.length > settings.featherCount) {
        const evenlySampled = Array.from({ length: settings.featherCount }, (_, index) => (
          morphParticles[Math.floor((index / settings.featherCount) * morphParticles.length)]
        ));
        morphParticles.splice(0, morphParticles.length, ...evenlySampled);
      }
    }

    function rebuild() {
      p.randomSeed(Math.round(settings.seed));
      p.noiseSeed(Math.round(settings.seed));
      buildMountains();
      buildMist();
      buildFlowers();
      buildPetals();
      buildMorphParticles();
    }

    function drawSky(time) {
      const context = p.drawingContext;
      const gradient = context.createLinearGradient(0, 0, 0, p.height);
      const night = hexRgb(settings.nightColor);
      gradient.addColorStop(0, `rgb(${Math.max(0, night[0] - 5)}, ${Math.max(0, night[1] - 4)}, ${Math.max(0, night[2] - 1)})`);
      gradient.addColorStop(0.55, `rgb(${night[0] + 7}, ${night[1] + 8}, ${night[2] + 12})`);
      gradient.addColorStop(1, `rgb(${Math.max(0, night[0] - 2)}, ${Math.max(0, night[1] - 1)}, ${night[2] + 4})`);
      context.fillStyle = gradient;
      context.fillRect(0, 0, p.width, p.height);

      p.noStroke();
      stars.forEach((star) => {
        const twinkle = state.reducedMotion ? 0.75 : 0.55 + Math.sin(time * 0.8 + star.phase) * 0.25;
        p.fill(216, 207, 181, star.alpha * twinkle);
        p.circle(star.x, star.y, star.size);
      });
    }

    function drawMoon() {
      const x = p.width * settings.moonX;
      const y = p.height * settings.moonY;
      const radius = Math.min(p.width, p.height) * 0.092;
      const gold = hexRgb(settings.goldColor);
      p.noStroke();
      for (let ring = 4; ring >= 1; ring -= 1) {
        p.fill(gold[0], gold[1], gold[2], 3 + ring * 2);
        p.circle(x, y, radius * (1 + ring * 0.18));
      }
      p.fill(gold[0], gold[1], gold[2], 176);
      p.circle(x, y, radius);
      p.fill(colorWithAlpha(settings.nightColor, 244));
      p.circle(x + radius * 0.28, y - radius * 0.12, radius * 0.96);
    }

    function drawMountains() {
      const night = p.color(settings.nightColor);
      const mist = p.color(settings.mistColor);
      mountains.forEach((mountain) => {
        const tone = p.lerpColor(night, mist, 0.12 + mountain.depth * 0.25);
        tone.setAlpha(205 + mountain.depth * 36);
        p.noStroke();
        p.fill(tone);
        p.beginShape();
        p.vertex(-10, p.height + 10);
        mountain.points.forEach((point) => p.vertex(point.x, point.y));
        p.vertex(p.width + 10, p.height + 10);
        p.endShape(p.CLOSE);

        p.noFill();
        p.stroke(210, 204, 185, 5 + (1 - mountain.depth) * 8);
        p.strokeWeight(0.7);
        p.beginShape();
        mountain.points.forEach((point) => p.vertex(point.x, point.y));
        p.endShape();
      });
    }

    function drawMist(time, foreground = false) {
      const mist = hexRgb(settings.mistColor);
      const reducedFactor = state.reducedMotion ? 0.12 : 1;
      p.noStroke();
      mistBands.forEach((band, index) => {
        if ((index % 3 === 0) !== foreground) return;
        const drift = time * settings.mistSpeed * band.speed * 0.012 * reducedFactor + settings.wind * time * 0.005;
        let x = ((band.x + drift + 0.2) % 1.4) - 0.2;
        let y = band.y + (p.noise(band.phase, time * 0.025 * reducedFactor) - 0.5) * 0.045;
        x *= p.width;
        y *= p.height;
        if (pointer.seen && !state.reducedMotion) {
          const distance = Math.hypot(pointer.x - x, pointer.y - y);
          const influence = clamp(1 - distance / 180, 0, 1);
          if (influence > 0) {
            x += ((x - pointer.x) / Math.max(distance, 1)) * influence * 28;
            y += ((y - pointer.y) / Math.max(distance, 1)) * influence * 10;
          }
        }
        const alpha = band.alpha * (foreground ? 1.35 : 1);
        p.fill(mist[0], mist[1], mist[2], alpha);
        p.ellipse(x, y, p.width * band.width, p.height * band.height);
      });
    }

    function drawKing(alpha, time) {
      if (alpha <= 0.01) return;
      const scale = Math.min(p.width, p.height) * 0.16 * settings.kingScale;
      const x = p.width * settings.kingX;
      const y = p.height * settings.kingY;
      const ink = hexRgb(settings.inkColor);
      const gold = hexRgb(settings.goldColor);
      const sway = state.reducedMotion ? 0 : Math.sin(time * 0.55) * 0.018;
      p.push();
      p.translate(x, y);
      p.rotate(sway);
      p.scale(scale);
      p.noStroke();
      p.fill(ink[0], ink[1], ink[2], 245 * alpha);

      p.beginShape();
      p.vertex(-0.24, -1.03);
      p.vertex(-0.2, -1.34);
      p.vertex(-0.07, -1.12);
      p.vertex(0.03, -1.43);
      p.vertex(0.14, -1.12);
      p.vertex(0.25, -1.31);
      p.vertex(0.28, -1.03);
      p.bezierVertex(0.45, -0.9, 0.37, -0.69, 0.23, -0.61);
      p.bezierVertex(0.2, -0.48, 0.46, -0.28, 0.52, 0.05);
      p.bezierVertex(0.62, 0.55, 0.45, 0.93, 0.3, 1.24);
      p.vertex(0.7, 1.3);
      p.vertex(0.35, 1.37);
      p.vertex(0.02, 1.3);
      p.vertex(-0.34, 1.38);
      p.vertex(-0.74, 1.3);
      p.bezierVertex(-0.62, 0.75, -0.35, 0.17, -0.31, -0.27);
      p.bezierVertex(-0.3, -0.52, -0.16, -0.62, -0.1, -0.67);
      p.endShape(p.CLOSE);

      p.beginShape();
      p.vertex(-0.12, -0.43);
      p.bezierVertex(-0.52, -0.3, -0.76, -0.05, -0.82, 0.2);
      p.bezierVertex(-0.63, 0.4, -0.47, 0.4, -0.24, 0.22);
      p.bezierVertex(0.02, 0.02, 0.26, 0.03, 0.5, 0.24);
      p.vertex(0.55, 0.07);
      p.bezierVertex(0.28, -0.18, 0.07, -0.33, -0.12, -0.43);
      p.endShape(p.CLOSE);

      p.noFill();
      p.stroke(gold[0], gold[1], gold[2], 120 * alpha);
      p.strokeWeight(0.012);
      p.arc(0.02, 0.17, 0.55, 0.72, -1.15, 1.25);
      p.arc(-0.06, 0.65, 0.82, 0.42, 0.05, 2.85);
      p.line(-0.42, 1.16, 0.45, 1.16);
      p.pop();
    }

    function drawMorph(progress, time) {
      const amount = smootherstep(progress);
      const turbulence = settings.morphTurbulence * Math.sin(Math.PI * amount) * Math.min(p.width, p.height) * 0.055;
      const gather = p.lerp(0.72, 1, settings.gatherStrength / 1.8);
      const ink = hexRgb(settings.inkColor);
      const gold = hexRgb(settings.goldColor);
      const alphaIn = smootherstep((progress - 0.02) / 0.18);
      const alphaOut = 1 - smootherstep((progress - 0.88) / 0.12) * 0.58;

      morphParticles.forEach((particle, index) => {
        const stagger = (hash(index, 73) - 0.5) * 0.08;
        const localAmount = smootherstep(clamp((progress + stagger) * gather, 0, 1));
        const baseX = p.lerp(particle.source.x, particle.target.x, localAmount);
        const baseY = p.lerp(particle.source.y, particle.target.y, localAmount);
        const curl = curlAt(baseX, baseY, time * 0.035 + particle.phase);
        const offset = turbulence * (0.45 + hash(index, 31) * 0.75);
        const x = baseX + curl.x * offset;
        const y = baseY + curl.y * offset;
        const velocityAngle = Math.atan2(particle.target.y - particle.source.y + curl.y * 20, particle.target.x - particle.source.x + curl.x * 20);
        const color = particle.gold ? gold : ink;
        p.push();
        p.translate(x, y);
        p.rotate(velocityAngle);
        p.noStroke();
        p.fill(color[0], color[1], color[2], 220 * alphaIn * alphaOut);
        p.ellipse(0, 0, particle.size * 2.8, particle.size * 0.72);
        p.stroke(220, 210, 185, 58 * alphaIn);
        p.strokeWeight(0.55);
        p.line(-particle.size, 0, particle.size * 1.4, 0);
        p.pop();
      });
    }

    function drawBird(x, y, scaleFactor, alpha, wingPhase, callPulse = 0) {
      if (alpha <= 0.01) return;
      const size = Math.min(p.width, p.height) * 0.12 * settings.birdScale * scaleFactor;
      const ink = hexRgb(settings.inkColor);
      const gold = hexRgb(settings.goldColor);
      const red = hexRgb(settings.redColor);
      const flap = state.reducedMotion ? 0.15 : Math.sin(wingPhase) * 0.17;
      p.push();
      p.translate(x, y);
      p.scale(size);
      p.rotate(-0.08 + Math.sin(wingPhase * 0.23) * 0.025);
      p.fill(ink[0], ink[1], ink[2], 248 * alpha);
      p.stroke(gold[0], gold[1], gold[2], 66 * alpha);
      p.strokeWeight(0.009);

      p.beginShape();
      p.vertex(0.45, -0.23);
      p.bezierVertex(0.62, -0.27, 0.69, -0.17, 0.72, -0.1);
      p.vertex(0.95, -0.05);
      p.vertex(0.7, 0.04);
      p.bezierVertex(0.56, 0.2, 0.37, 0.34, 0.12, 0.38);
      p.bezierVertex(-0.19, 0.42, -0.46, 0.28, -0.51, 0.08);
      p.bezierVertex(-0.54, -0.12, -0.24, -0.28, 0.02, -0.27);
      p.bezierVertex(0.19, -0.3, 0.31, -0.35, 0.45, -0.23);
      p.endShape(p.CLOSE);

      p.beginShape();
      p.vertex(0.12, -0.1);
      p.bezierVertex(-0.06, -0.45 - flap, -0.4, -0.91 - flap, -0.82, -1.02 - flap * 0.4);
      p.bezierVertex(-0.74, -0.55, -0.47, -0.08, -0.05, 0.22);
      p.endShape(p.CLOSE);

      p.beginShape();
      p.vertex(-0.07, 0.19);
      p.bezierVertex(-0.38, 0.47 + flap, -0.72, 0.65 + flap, -1.02, 0.72 + flap * 0.5);
      p.bezierVertex(-0.78, 0.35, -0.51, 0.06, -0.16, -0.03);
      p.endShape(p.CLOSE);

      p.beginShape();
      p.vertex(-0.43, 0.13);
      p.vertex(-1.08, 0.5);
      p.vertex(-0.7, 0.08);
      p.vertex(-1.18, 0.27);
      p.vertex(-0.58, -0.06);
      p.endShape(p.CLOSE);

      p.beginShape();
      p.vertex(0.43, -0.24);
      p.vertex(0.5, -0.38);
      p.vertex(0.55, -0.24);
      p.vertex(0.62, -0.34);
      p.vertex(0.62, -0.19);
      p.endShape(p.CLOSE);

      p.noStroke();
      p.fill(gold[0], gold[1], gold[2], 150 * alpha);
      p.circle(0.53, -0.16, 0.035);
      p.fill(red[0], red[1], red[2], 210 * alpha * callPulse * settings.redIntensity);
      p.ellipse(0.42, 0.02, 0.18 + callPulse * 0.06, 0.13 + callPulse * 0.04);
      p.noFill();
      p.stroke(gold[0], gold[1], gold[2], 55 * alpha);
      p.strokeWeight(0.008);
      p.bezier(-0.34, -0.02, -0.02, 0.03, 0.18, 0.18, 0.39, 0.13);
      p.bezier(-0.12, -0.13, -0.27, -0.46 - flap, -0.52, -0.72 - flap, -0.72, -0.88 - flap * 0.4);
      p.bezier(-0.18, -0.04, -0.34, -0.3 - flap, -0.55, -0.52 - flap, -0.72, -0.68 - flap * 0.4);
      p.bezier(-0.18, 0.15, -0.4, 0.32 + flap, -0.66, 0.48 + flap, -0.88, 0.59 + flap * 0.45);
      p.line(0.69, -0.1, 0.91, -0.05);
      p.pop();
    }

    function flowerTiming(flower, localTime) {
      let awakenTime = Number.POSITIVE_INFINITY;
      const x = flower.x * p.width;
      const y = flower.y * p.height;
      callTimes().forEach((callTime) => {
        const origin = birdPosition(callTime);
        const distance = Math.hypot(x - origin.x, y - origin.y);
        const arrival = callTime + distance / Math.max(1, settings.rippleSpeed);
        awakenTime = Math.min(awakenTime, arrival);
      });
      const awakened = localTime >= awakenTime;
      const hitTime = awakenTime + flower.hitDelay + settings.hitRadius / 120;
      const stain = localTime > hitTime
        ? 1 - Math.exp(-settings.stainSpeed * 0.9 * (localTime - hitTime))
        : 0;
      return { awakened, stain: clamp(stain, 0, 1) };
    }

    function drawFlower(flower, stain, awakened, time, premonition = 0) {
      const x = flower.x * p.width;
      const y = flower.y * p.height;
      const size = flower.size;
      const base = p.color(settings.flowerColor);
      const red = p.color(settings.redColor);
      const pigment = clamp(stain * settings.redIntensity + premonition, 0, 1);
      const petalColor = p.lerpColor(base, red, pigment);
      const pulse = awakened && stain < 0.08 ? 1 + Math.sin(time * 5 + flower.phase) * 0.035 : 1;
      p.push();
      p.translate(x, y);
      p.rotate(flower.rotation);
      p.scale(pulse);
      p.noStroke();
      for (let petal = 0; petal < 5; petal += 1) {
        p.push();
        p.rotate((petal / 5) * p.TWO_PI);
        petalColor.setAlpha(150 + flower.depth * 92);
        p.fill(petalColor);
        p.ellipse(size * 0.29, 0, size * 0.72, size * 0.43);
        p.pop();
      }
      const gold = hexRgb(settings.goldColor);
      p.fill(gold[0], gold[1], gold[2], 120 + flower.depth * 90);
      p.circle(0, 0, size * 0.2);
      if (flower.depth > 0.62) {
        p.stroke(gold[0], gold[1], gold[2], 90);
        p.strokeWeight(0.7);
        for (let stamen = 0; stamen < 4; stamen += 1) {
          const angle = flower.phase + stamen * p.HALF_PI;
          p.line(0, 0, Math.cos(angle) * size * 0.22, Math.sin(angle) * size * 0.22);
        }
      }
      p.pop();
    }

    function drawFlowerField(scene, time) {
      let stained = 0;
      flowers.forEach((flower) => {
        let stain = 0;
        let awakened = false;
        let premonition = 0;
        if (scene.key === 'flowers') {
          const timing = flowerTiming(flower, scene.local);
          stain = timing.stain;
          awakened = timing.awakened;
        } else if (scene.key === 'transform') {
          premonition = smootherstep((scene.progress - 0.82) / 0.18) * 0.055;
        }
        if (stain > 0.34) stained += 1;
        drawFlower(flower, stain, awakened, time, premonition);
      });
      controls.flowerState.textContent = `${stained} / ${flowers.length} 染红`;
    }

    function drawRipples(localTime) {
      const red = hexRgb(settings.redColor);
      callTimes().forEach((callTime, index) => {
        const age = localTime - callTime;
        if (age < 0) return;
        const origin = birdPosition(callTime);
        const radius = settings.rippleSpeed * age;
        const maxRadius = Math.hypot(p.width, p.height) * 0.82;
        if (radius > maxRadius) return;
        const fade = Math.pow(1 - radius / maxRadius, 1.45) * settings.rippleOpacity;
        p.noFill();
        for (let echo = 0; echo < 3; echo += 1) {
          p.stroke(red[0], red[1], red[2], 120 * fade * (1 - echo * 0.24) * settings.redIntensity);
          p.strokeWeight(Math.max(0.6, settings.rippleWidth * 0.045 - echo * 0.18));
          p.ellipse(origin.x, origin.y, (radius - echo * settings.rippleWidth * 0.32) * 2, (radius - echo * settings.rippleWidth * 0.32) * 1.22);
        }
        p.noStroke();
        p.fill(red[0], red[1], red[2], 18 * fade);
        p.circle(origin.x, origin.y, settings.rippleWidth * (1.4 + index * 0.08));
      });
    }

    function drawPetals(localTime) {
      const calls = callTimes();
      const red = hexRgb(settings.redColor);
      petals.forEach((petal, index) => {
        const callTime = calls[petal.callIndex % calls.length];
        const age = localTime - callTime - petal.delay;
        if (age < 0 || age > 6.4) return;
        const origin = birdPosition(callTime);
        const curl = curlAt(origin.x + petal.xOffset, origin.y + age * petal.fallSpeed, petal.phase + localTime * 0.03);
        let x = origin.x + petal.xOffset + petal.drift * age + settings.wind * 46 * age + curl.x * settings.flowStrength * 18;
        let y = origin.y + petal.yOffset + petal.fallSpeed * Math.pow(age, 1.18) + curl.y * settings.flowStrength * 11;
        if (pointer.seen && !state.reducedMotion) {
          const distance = Math.hypot(pointer.x - x, pointer.y - y);
          const influence = clamp(1 - distance / 120, 0, 1);
          x += ((x - pointer.x) / Math.max(distance, 1)) * influence * 20;
          y += ((y - pointer.y) / Math.max(distance, 1)) * influence * 8;
        }
        const fade = smootherstep(age / 0.3) * (1 - smootherstep((age - 5.7) / 0.7));
        p.push();
        p.translate(x, y);
        p.rotate(petal.spin * age + index * 0.4);
        p.noStroke();
        p.fill(red[0], red[1], red[2], 176 * fade * settings.redIntensity);
        p.ellipse(0, 0, petal.size * 1.8, petal.size * 0.72);
        p.pop();
      });
    }

    function callPulse(localTime) {
      let pulse = 0;
      callTimes().forEach((callTime) => {
        const distance = Math.abs(localTime - callTime);
        pulse = Math.max(pulse, 1 - clamp(distance / 0.42, 0, 1));
      });
      return smootherstep(pulse);
    }

    function drawGrain(time) {
      const count = Math.round(settings.grain * 110);
      if (count <= 0) return;
      p.stroke(230, 222, 202, 15);
      p.strokeWeight(0.7);
      for (let index = 0; index < count; index += 1) {
        const frameSalt = state.reducedMotion ? 0 : Math.floor(time * 5);
        const x = hash(index, 2001 + frameSalt) * p.width;
        const y = hash(index, 3001 + frameSalt) * p.height;
        p.point(x, y);
      }
    }

    function updateStoryCopy(scene) {
      controls.storyCopy.classList.toggle('is-title-visible', scene.key === 'death' && scene.local < 3.2);
      controls.sceneLabel.textContent = SCENE_NAMES[scene.key];
      const sceneLabelVisible = scene.local < 1.7 && !(scene.key === 'death' && scene.local < 0.7);
      controls.sceneLabel.classList.toggle('is-visible', sceneLabelVisible);
    }

    function drawStory() {
      const scene = sceneAt(settings, state.time);
      state.sceneKey = scene.key;
      updateStoryCopy(scene);
      drawSky(state.time);
      drawMoon();
      drawMountains();
      drawMist(state.time, false);

      if (scene.key === 'death') {
        drawKing(1, state.time);
      } else if (scene.key === 'transform') {
        const kingAlpha = 1 - smootherstep(scene.progress / 0.66);
        drawKing(kingAlpha, state.time);
        drawMorph(scene.progress, state.time);
        const birdAlpha = smootherstep((scene.progress - 0.58) / 0.35);
        const anchor = transformBirdAnchor();
        drawBird(anchor.x, anchor.y, 1, birdAlpha, state.time * 3.8);
      } else {
        const position = birdPosition(scene.local);
        drawBird(position.x, position.y, 1, 1, state.time * 4.2, callPulse(scene.local));
      }

      drawFlowerField(scene, state.time);
      if (scene.key === 'flowers') {
        drawRipples(scene.local);
        drawPetals(scene.local);
      }
      drawMist(state.time, true);
      drawGrain(state.time);
    }

    function onPointerMove(event) {
      const rect = canvasElement.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.seen = true;
    }

    function onPointerDown() {
      if (state.complete) replayArtwork();
    }

    p.setup = () => {
      const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      canvas.parent(controls.canvasHost);
      canvasElement = canvas.elt;
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 1.5));
      p.noiseDetail(4, 0.52);
      canvasElement.addEventListener('pointermove', onPointerMove, { passive: true, signal: listeners.signal });
      canvasElement.addEventListener('pointerdown', onPointerDown, { signal: listeners.signal });
      rebuild();
    };

    p.draw = () => {
      const delta = clamp(p.deltaTime / 1000, 0, 0.05);
      if (!state.paused && !state.complete) {
        state.time += delta * settings.playbackSpeed;
        const total = totalDuration(settings);
        if (state.time >= total) {
          state.time = total;
          state.complete = true;
          state.paused = true;
        }
      }
      drawStory();
      frameCounter += 1;
      if (frameCounter % 4 === 0 || state.timelineActive) updateTransport();
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      rebuild();
    };

    rebuildArtwork = () => rebuild();
    redrawArtwork = () => p.redraw();
    replayArtwork = () => {
      state.time = 0;
      state.complete = false;
      state.paused = false;
      state.sceneKey = 'death';
      updateTransport();
    };
    cleanupSketch = () => {
      mountains.length = 0;
      stars.length = 0;
      mistBands.length = 0;
      flowers.length = 0;
      petals.length = 0;
      morphParticles.length = 0;
    };
  };

  const instance = new p5(sketch, controls.canvasHost);

  function onMotionPreferenceChange(event) {
    state.reducedMotion = event.matches;
    if (event.matches) state.paused = true;
    updateTransport();
  }
  motionMedia.addEventListener('change', onMotionPreferenceChange);

  return () => {
    listeners.abort();
    motionMedia.removeEventListener('change', onMotionPreferenceChange);
    cleanupSketch();
    instance.remove();
    root.remove();
  };
}
