import p5 from 'p5';
import './style.css';

const CONTROL_FORMATTERS = {
  leafCount: (value) => String(Math.round(value)),
  colonyRotation: (value) => `${Math.round(value)}°`,
  koiCount: (value) => String(Math.round(value)),
  trailLength: (value) => String(Math.round(value)),
  collisionRadius: (value) => `${Math.round(value)}px`,
};

const LAYOUT_KEYS = new Set([
  'colonyScale',
  'density',
  'colonyGap',
  'spread',
  'shapeNoise',
  'colonyRotation',
]);

export function mount(container) {
  const root = document.createElement('section');
  root.className = 'lotus-project';
  root.setAttribute('aria-label', '莲花小池生成艺术');
  root.innerHTML = `
    <div class="lotus-canvas-host" data-role="canvas-host" aria-label="荷叶群落与锦鲤互动画布"></div>
    <div class="lotus-hint" data-role="hint" aria-hidden="true">
      <span>MOVE</span>
      <strong>移动鼠标，引鱼入池</strong>
      <small>点击水面，让荷叶染上粉色</small>
    </div>
    <button class="lotus-panel-toggle" data-role="panel-toggle" type="button" aria-expanded="true" aria-controls="lotus-control-panel">
      <span class="lotus-toggle-dot" aria-hidden="true"></span>
      <span data-role="toggle-label">收起参数</span>
    </button>
    <aside class="lotus-control-panel is-open" id="lotus-control-panel" data-role="control-panel" aria-label="莲花小池实时参数">
      <header class="lotus-panel-heading">
        <div>
          <p>INTERACTIVE POND</p>
          <h1>莲花小池</h1>
        </div>
        <div class="lotus-live-count" aria-label="荷叶状态统计">
          <span><strong data-role="pink-count">0</strong> 染色</span>
          <span><strong data-role="leaf-count">620</strong> 荷叶</span>
        </div>
      </header>

      <div class="lotus-control-groups">
        <details class="lotus-control-group" open>
          <summary>双群落结构</summary>
          <div class="lotus-control-grid">
            <label class="lotus-control-row"><span>荷叶数量</span><output>620</output><input data-control="leafCount" type="range" min="240" max="900" value="620" step="20" /></label>
            <label class="lotus-control-row"><span>群落大小</span><output>1.0</output><input data-control="colonyScale" type="range" min="0.55" max="1.45" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>内部密度</span><output>1.0</output><input data-control="density" type="range" min="0.65" max="1.55" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>群落间距</span><output>1.0</output><input data-control="colonyGap" type="range" min="0.3" max="1.65" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>扩散范围</span><output>1.0</output><input data-control="spread" type="range" min="0.55" max="1.55" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>形态扰动</span><output>1.0</output><input data-control="shapeNoise" type="range" min="0" max="2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>群落旋转</span><output>-18°</output><input data-control="colonyRotation" type="range" min="-55" max="30" value="-18" step="1" /></label>
          </div>
        </details>

        <details class="lotus-control-group">
          <summary>荷叶质感</summary>
          <div class="lotus-control-grid">
            <label class="lotus-control-row"><span>叶片尺寸</span><output>1.0</output><input data-control="leafSize" type="range" min="0.55" max="1.65" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>深浅层次</span><output>1.0</output><input data-control="leafDepth" type="range" min="0" max="2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>摆动幅度</span><output>1.0</output><input data-control="sway" type="range" min="0" max="2.2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>漂移速度</span><output>1.0</output><input data-control="drift" type="range" min="0" max="2.4" value="1" step="0.05" /></label>
          </div>
        </details>

        <details class="lotus-control-group">
          <summary>锦鲤路径</summary>
          <div class="lotus-control-grid">
            <label class="lotus-control-row"><span>锦鲤数量</span><output>18</output><input data-control="koiCount" type="range" min="4" max="34" value="18" step="1" /></label>
            <label class="lotus-control-row"><span>游动速度</span><output>1.0</output><input data-control="koiSpeed" type="range" min="0.35" max="2.2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>鱼体长度</span><output>1.0</output><input data-control="koiLength" type="range" min="0.55" max="1.8" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>尾迹长度</span><output>28</output><input data-control="trailLength" type="range" min="8" max="64" value="28" step="2" /></label>
            <label class="lotus-control-row"><span>跟随灵敏</span><output>1.0</output><input data-control="follow" type="range" min="0.35" max="2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>游动随机</span><output>1.0</output><input data-control="wander" type="range" min="0" max="2.2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>碰撞半径</span><output>76px</output><input data-control="collisionRadius" type="range" min="28" max="150" value="76" step="2" /></label>
            <label class="lotus-control-row"><span>碰撞力度</span><output>1.0</output><input data-control="collisionForce" type="range" min="0.2" max="2.4" value="1" step="0.05" /></label>
          </div>
        </details>

        <details class="lotus-control-group">
          <summary>水面色彩</summary>
          <div class="lotus-control-grid">
            <label class="lotus-control-row"><span>背景暖度</span><output>1.0</output><input data-control="backgroundWarmth" type="range" min="0" max="2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>绿色浓度</span><output>1.0</output><input data-control="greenSaturation" type="range" min="0.45" max="1.7" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>粉色浓度</span><output>1.0</output><input data-control="pinkIntensity" type="range" min="0.45" max="1.7" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>纸面噪点</span><output>1.0</output><input data-control="grain" type="range" min="0" max="2" value="1" step="0.05" /></label>
            <label class="lotus-control-row"><span>动画速度</span><output>1.0</output><input data-control="animationSpeed" type="range" min="0.2" max="2" value="1" step="0.05" /></label>
          </div>
        </details>
      </div>

      <div class="lotus-actions">
        <button class="lotus-action lotus-action-primary" data-role="reset" type="button">洗去粉色</button>
        <button class="lotus-action" data-role="regenerate" type="button">重排群落</button>
        <button class="lotus-action" data-role="pause" type="button" aria-pressed="false">暂停水面</button>
      </div>
    </aside>
  `;
  container.append(root);

  const state = {
    leafCount: 620,
    colonyScale: 1,
    density: 1,
    colonyGap: 1,
    spread: 1,
    shapeNoise: 1,
    colonyRotation: -18,
    leafSize: 1,
    leafDepth: 1,
    sway: 1,
    drift: 1,
    koiCount: 18,
    koiSpeed: 1,
    koiLength: 1,
    trailLength: 28,
    follow: 1,
    wander: 1,
    collisionRadius: 76,
    collisionForce: 1,
    backgroundWarmth: 1,
    greenSaturation: 1,
    pinkIntensity: 1,
    grain: 1,
    animationSpeed: 1,
    paused: false,
    panelOpen: true,
  };

  const controls = {
    ranges: [...root.querySelectorAll('[data-control]')],
    canvasHost: root.querySelector('[data-role="canvas-host"]'),
    panel: root.querySelector('[data-role="control-panel"]'),
    panelToggle: root.querySelector('[data-role="panel-toggle"]'),
    toggleLabel: root.querySelector('[data-role="toggle-label"]'),
    hint: root.querySelector('[data-role="hint"]'),
    pinkCount: root.querySelector('[data-role="pink-count"]'),
    leafCount: root.querySelector('[data-role="leaf-count"]'),
    reset: root.querySelector('[data-role="reset"]'),
    regenerate: root.querySelector('[data-role="regenerate"]'),
    pause: root.querySelector('[data-role="pause"]'),
  };

  const listeners = new AbortController();
  let rebuildLeaves = () => {};
  let layoutLeaves = () => {};
  let rebuildKoi = () => {};
  let rebuildGrain = () => {};
  let resetArtwork = () => {};
  let regenerateArtwork = () => {};
  let setPaused = () => {};
  let redrawArtwork = () => {};
  let cleanupSketch = () => {};

  function formatValue(key, value) {
    return CONTROL_FORMATTERS[key]?.(value) ?? Number(value).toFixed(1);
  }

  controls.ranges.forEach((input) => {
    input.addEventListener('input', () => {
      const key = input.dataset.control;
      const value = Number(input.value);
      state[key] = value;
      const output = input.parentElement.querySelector('output');
      output.value = formatValue(key, value);
      output.textContent = formatValue(key, value);

      if (key === 'leafCount') rebuildLeaves();
      else if (key === 'koiCount') rebuildKoi();
      else if (key === 'grain') rebuildGrain();
      else if (LAYOUT_KEYS.has(key)) layoutLeaves();
      redrawArtwork();
    }, { signal: listeners.signal });
  });

  controls.panelToggle.addEventListener('click', () => {
    state.panelOpen = !state.panelOpen;
    controls.panel.classList.toggle('is-open', state.panelOpen);
    controls.panelToggle.classList.toggle('is-collapsed', !state.panelOpen);
    controls.panelToggle.setAttribute('aria-expanded', String(state.panelOpen));
    controls.toggleLabel.textContent = state.panelOpen ? '收起参数' : '展开参数';
  }, { signal: listeners.signal });

  controls.reset.addEventListener('click', () => resetArtwork(), { signal: listeners.signal });
  controls.regenerate.addEventListener('click', () => regenerateArtwork(), { signal: listeners.signal });
  controls.pause.addEventListener('click', () => {
    state.paused = !state.paused;
    controls.pause.setAttribute('aria-pressed', String(state.paused));
    controls.pause.textContent = state.paused ? '继续水面' : '暂停水面';
    setPaused(state.paused);
  }, { signal: listeners.signal });

  const sketch = (p) => {
    const leaves = [];
    const koi = [];
    const pointerHistory = [];
    const pointer = { x: 0, y: 0, seen: false };
    let grainLayer;
    let canvasElement;
    let seed = 4281;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let pinkCountFrame = 0;

    function backgroundColor() {
      const warmth = p.constrain(state.backgroundWarmth, 0, 2);
      return {
        r: p.lerp(241, 248, warmth / 2),
        g: p.lerp(243, 239, warmth / 2),
        b: p.lerp(238, 226, warmth / 2),
      };
    }

    function greenPalette(depth, alpha = 255) {
      const saturation = state.greenSaturation;
      return {
        outer: [p.lerp(113, 68, saturation / 1.7), p.lerp(186, 190, saturation / 1.7), p.lerp(119, 91, saturation / 1.7), alpha],
        inner: [p.lerp(80, 35, saturation / 1.7), p.lerp(162, 157, saturation / 1.7), p.lerp(90, 66, saturation / 1.7), alpha * (0.78 + depth * 0.12)],
        halo: [92, 201, 111, alpha * 0.14],
      };
    }

    function pinkPalette(depth, alpha = 255) {
      const intensity = state.pinkIntensity;
      return {
        outer: [p.lerp(245, 248, intensity / 1.7), p.lerp(178, 126, intensity / 1.7), p.lerp(196, 168, intensity / 1.7), alpha],
        inner: [p.lerp(240, 241, intensity / 1.7), p.lerp(151, 92, intensity / 1.7), p.lerp(183, 139, intensity / 1.7), alpha * (0.76 + depth * 0.12)],
        halo: [246, 124, 173, alpha * 0.14],
      };
    }

    class Leaf {
      constructor(index, colony) {
        this.index = index;
        this.colony = colony;
        this.angle = p.random(p.TWO_PI);
        this.radius = Math.sqrt(p.random());
        this.depth = p.random();
        this.seed = p.random(1000);
        this.sizeVariance = p.random(0.62, 1.45);
        this.notched = p.random() > 0.31;
        this.notchAngle = p.random(p.TWO_PI);
        this.x = p.width / 2;
        this.y = p.height / 2;
        this.baseX = this.x;
        this.baseY = this.y;
        this.vx = 0;
        this.vy = 0;
        this.hit = false;
        this.hitMix = 0;
      }

      layout(immediate = false) {
        const compactness = p.map(state.density, 0.65, 1.55, 1.16, 0.76);
        const spread = state.spread * compactness;
        const minSide = Math.min(p.width, p.height);
        const diagonal = minSide * 0.19 * state.colonyGap;
        const centerX = p.width * 0.5 + (this.colony === 0 ? diagonal : -diagonal);
        const centerY = p.height * 0.5 + (this.colony === 0 ? -diagonal * 0.92 : diagonal * 0.92);
        const angle = this.angle + p.noise(this.seed) * state.shapeNoise * 0.65;
        const boundaryWave = 1 + Math.sin(angle * 3 + this.seed) * 0.12 * state.shapeNoise;
        const radius = this.radius * boundaryWave;
        const radiusX = minSide * 0.43 * state.colonyScale * spread;
        const radiusY = minSide * 0.36 * state.colonyScale * spread;
        let localX = Math.cos(angle) * radius * radiusX;
        let localY = Math.sin(angle) * radius * radiusY;
        localX += (p.noise(this.seed, 3.1) - 0.5) * minSide * 0.085 * state.shapeNoise;
        localY += (p.noise(this.seed, 7.7) - 0.5) * minSide * 0.085 * state.shapeNoise;

        const rotation = p.radians(state.colonyRotation * (this.colony === 0 ? 1 : -0.72));
        const rotatedX = localX * Math.cos(rotation) - localY * Math.sin(rotation);
        const rotatedY = localX * Math.sin(rotation) + localY * Math.cos(rotation);
        this.baseX = centerX + rotatedX;
        this.baseY = centerY + rotatedY;
        if (immediate) {
          this.x = this.baseX;
          this.y = this.baseY;
          this.vx = 0;
          this.vy = 0;
        }
      }

      update(time, motion) {
        const depthDrift = 0.45 + this.depth * 0.8;
        const driftX = (p.noise(this.seed, time * 0.00012 * state.drift) - 0.5) * 14 * state.drift;
        const driftY = (p.noise(this.seed + 90, time * 0.00012 * state.drift) - 0.5) * 14 * state.drift;
        const sway = Math.sin(time * 0.00075 + this.seed) * 3.8 * state.sway * depthDrift;
        const targetX = this.baseX + driftX + sway;
        const targetY = this.baseY + driftY + Math.cos(time * 0.00066 + this.seed) * 2.8 * state.sway;
        const spring = 0.012 * motion;
        this.vx += (targetX - this.x) * spring;
        this.vy += (targetY - this.y) * spring;
        this.vx *= 0.91;
        this.vy *= 0.91;
        this.x += this.vx * motion;
        this.y += this.vy * motion;
        this.hitMix += ((this.hit ? 1 : 0) - this.hitMix) * 0.055;
      }

      disturb(x, y, radius, force, stain = false) {
        const dx = this.x - x;
        const dy = this.y - y;
        const distance = Math.hypot(dx, dy);
        if (distance >= radius || distance < 0.001) return;
        const strength = (1 - distance / radius) * force;
        this.vx += (dx / distance) * strength;
        this.vy += (dy / distance) * strength;
        if (stain) this.hit = true;
      }

      draw() {
        const baseSize = p.constrain(Math.min(p.width, p.height) * 0.021, 13, 29);
        const depthScale = p.lerp(0.68, 1.28, this.depth * state.leafDepth * 0.72 + (1 - state.leafDepth) * 0.5);
        const size = baseSize * this.sizeVariance * state.leafSize * depthScale;
        const green = greenPalette(this.depth, p.lerp(205, 245, this.depth));
        const pink = pinkPalette(this.depth, p.lerp(205, 245, this.depth));
        const palette = {
          outer: green.outer.map((value, index) => p.lerp(value, pink.outer[index], this.hitMix)),
          inner: green.inner.map((value, index) => p.lerp(value, pink.inner[index], this.hitMix)),
          halo: green.halo.map((value, index) => p.lerp(value, pink.halo[index], this.hitMix)),
        };

        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.notchAngle + Math.sin(this.seed) * 0.18 * state.sway);
        p.noStroke();
        p.fill(...palette.halo);
        p.circle(0, 0, size * 1.34);
        p.fill(...palette.outer);
        if (this.notched) p.arc(0, 0, size, size, 0.28, p.TWO_PI - 0.28, p.PIE);
        else p.circle(0, 0, size);
        p.fill(...palette.inner);
        const innerSize = size * p.lerp(0.32, 0.54, this.depth);
        if (this.notched) p.arc(0, 0, innerSize, innerSize, 0.32, p.TWO_PI - 0.32, p.PIE);
        else p.circle(0, 0, innerSize);
        p.pop();
      }
    }

    class Koi {
      constructor(index) {
        this.index = index;
        this.seed = p.random(1000);
        this.x = p.width * 0.5 + p.random(-90, 90);
        this.y = p.height * 0.5 + p.random(-70, 70);
        this.vx = p.random(-1, 1);
        this.vy = p.random(-1, 1);
        this.scale = p.random(0.7, 1.25);
        this.delay = Math.round(index * p.random(2.6, 4.8));
        this.trail = [];
      }

      update(time, motion) {
        const historyIndex = Math.max(0, pointerHistory.length - 1 - this.delay);
        const historyTarget = pointerHistory[historyIndex] ?? pointer;
        const angle = Math.atan2(this.vy, this.vx);
        const formation = Math.sin(time * 0.0022 + this.seed) * (8 + this.index * 0.32) * state.wander;
        const targetX = historyTarget.x + Math.cos(angle + p.HALF_PI) * formation;
        const targetY = historyTarget.y + Math.sin(angle + p.HALF_PI) * formation;
        const dx = targetX - this.x;
        const dy = targetY - this.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const speed = p.constrain(distance * 0.045, 1.2, 7.4) * state.koiSpeed;
        const wander = (p.noise(this.seed, time * 0.0008) - 0.5) * 0.22 * state.wander;
        const desiredX = (dx / distance) * speed + Math.cos(angle + p.HALF_PI) * wander;
        const desiredY = (dy / distance) * speed + Math.sin(angle + p.HALF_PI) * wander;
        const steering = p.constrain(0.042 * state.follow * motion, 0.008, 0.16);
        this.vx = p.lerp(this.vx, desiredX, steering);
        this.vy = p.lerp(this.vy, desiredY, steering);
        this.x += this.vx * motion;
        this.y += this.vy * motion;
        this.trail.push({ x: this.x, y: this.y });
        while (this.trail.length > state.trailLength) this.trail.shift();
      }

      draw(time) {
        if (this.trail.length > 2) {
          p.noFill();
          p.strokeWeight(0.9);
          for (let i = 1; i < this.trail.length; i += 1) {
            const alpha = (i / this.trail.length) ** 2 * 72;
            p.stroke(198, 51, 37, alpha);
            const previous = this.trail[i - 1];
            const point = this.trail[i];
            p.line(previous.x, previous.y, point.x, point.y);
          }
        }

        const angle = Math.atan2(this.vy, this.vx);
        const size = 9.5 * this.scale * state.koiLength;
        const tailWave = Math.sin(time * 0.015 * state.koiSpeed + this.seed) * 0.45;
        p.push();
        p.translate(this.x, this.y);
        p.rotate(angle);
        p.noStroke();
        p.fill(198, 47, 32, 236);
        p.beginShape();
        p.vertex(size * 0.58, 0);
        p.bezierVertex(size * 0.2, -size * 0.14, -size * 0.28, -size * 0.12, -size * 0.48, 0);
        p.bezierVertex(-size * 0.28, size * 0.12, size * 0.2, size * 0.14, size * 0.58, 0);
        p.endShape(p.CLOSE);
        p.push();
        p.translate(-size * 0.42, 0);
        p.rotate(tailWave);
        p.triangle(0, 0, -size * 0.46, -size * 0.3, -size * 0.32, 0);
        p.triangle(0, 0, -size * 0.46, size * 0.3, -size * 0.32, 0);
        p.pop();
        p.fill(225, 72, 54, 205);
        p.triangle(size * 0.02, -size * 0.04, -size * 0.2, -size * 0.34, -size * 0.13, -size * 0.02);
        p.triangle(size * 0.02, size * 0.04, -size * 0.2, size * 0.34, -size * 0.13, size * 0.02);
        p.fill(255, 221, 169, 230);
        p.circle(size * 0.4, -size * 0.055, Math.max(1.2, size * 0.09));
        p.pop();
      }
    }

    function buildLeaves({ keepSeed = true } = {}) {
      if (!keepSeed) seed += 101;
      leaves.length = 0;
      p.randomSeed(seed);
      for (let index = 0; index < state.leafCount; index += 1) {
        const colony = index % 2;
        const leaf = new Leaf(index, colony);
        leaf.layout(true);
        leaves.push(leaf);
      }
      controls.leafCount.textContent = String(leaves.length);
      controls.pinkCount.textContent = '0';
    }

    function positionLeaves(immediate = false) {
      leaves.forEach((leaf) => leaf.layout(immediate));
    }

    function buildKoi() {
      koi.length = 0;
      p.randomSeed(seed + 77);
      for (let index = 0; index < state.koiCount; index += 1) koi.push(new Koi(index));
    }

    function buildGrainLayer() {
      if (grainLayer) grainLayer.resizeCanvas(Math.max(1, p.width), Math.max(1, p.height));
      else grainLayer = p.createGraphics(Math.max(1, p.width), Math.max(1, p.height));
      grainLayer.pixelDensity(1);
      grainLayer.clear();
      grainLayer.noStroke();
      p.randomSeed(seed + 902);
      const count = Math.round(Math.min(5000, p.width * p.height * 0.0022 * state.grain));
      for (let index = 0; index < count; index += 1) {
        const alpha = p.random(4, 19);
        grainLayer.fill(p.random() > 0.5 ? 60 : 255, alpha);
        grainLayer.circle(p.random(grainLayer.width), p.random(grainLayer.height), p.random(0.35, 1.4));
      }
    }

    function resetPointer() {
      pointer.x = p.width * 0.5;
      pointer.y = p.height * 0.5;
      pointer.seen = false;
      pointerHistory.length = 0;
      for (let index = 0; index < 90; index += 1) pointerHistory.push({ x: pointer.x, y: pointer.y });
    }

    function resetScene() {
      leaves.forEach((leaf) => {
        leaf.hit = false;
        leaf.hitMix = 0;
        leaf.vx = 0;
        leaf.vy = 0;
        leaf.x = leaf.baseX;
        leaf.y = leaf.baseY;
      });
      controls.pinkCount.textContent = '0';
      resetPointer();
      buildKoi();
      if (state.paused) p.redraw();
    }

    function stainAt(x, y) {
      leaves.forEach((leaf) => leaf.disturb(x, y, state.collisionRadius, 6.8 * state.collisionForce, true));
      koi.forEach((fish) => {
        leaves.forEach((leaf) => leaf.disturb(fish.x, fish.y, state.collisionRadius * 0.42, 3.8 * state.collisionForce, true));
      });
    }

    function updatePointer(event) {
      const bounds = canvasElement.getBoundingClientRect();
      pointer.x = p.constrain((event.clientX - bounds.left) * (p.width / bounds.width), 0, p.width);
      pointer.y = p.constrain((event.clientY - bounds.top) * (p.height / bounds.height), 0, p.height);
      if (!pointer.seen) controls.hint.classList.add('is-hidden');
      pointer.seen = true;
    }

    function onPointerMove(event) {
      updatePointer(event);
    }

    function onPointerDown(event) {
      updatePointer(event);
      stainAt(pointer.x, pointer.y);
    }

    function bindCanvasPointer() {
      canvasElement.addEventListener('pointermove', onPointerMove, { passive: true });
      canvasElement.addEventListener('pointerdown', onPointerDown);
    }

    function unbindCanvasPointer() {
      canvasElement?.removeEventListener('pointermove', onPointerMove);
      canvasElement?.removeEventListener('pointerdown', onPointerDown);
    }

    p.setup = () => {
      const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
      canvas.parent(controls.canvasHost);
      canvasElement = canvas.elt;
      p.pixelDensity(Math.min(window.devicePixelRatio, 2));
      p.randomSeed(seed);
      resetPointer();
      buildGrainLayer();
      buildLeaves();
      buildKoi();
      bindCanvasPointer();
    };

    p.draw = () => {
      const background = backgroundColor();
      p.background(background.r, background.g, background.b);
      const time = p.millis();
      const motion = (reducedMotion ? 0.18 : 1) * state.animationSpeed;
      if (!pointer.seen) {
        pointer.x = p.width * 0.5 + Math.cos(time * 0.00037) * Math.min(p.width, p.height) * 0.12;
        pointer.y = p.height * 0.5 + Math.sin(time * 0.00051) * Math.min(p.width, p.height) * 0.1;
      }
      pointerHistory.push({ x: pointer.x, y: pointer.y });
      while (pointerHistory.length > 260) pointerHistory.shift();

      koi.forEach((fish) => fish.update(time, motion));
      leaves.forEach((leaf) => {
        koi.forEach((fish) => leaf.disturb(fish.x, fish.y, 34 * state.collisionForce, 0.035 * state.collisionForce));
        leaf.update(time, motion);
        leaf.draw();
      });
      koi.forEach((fish) => fish.draw(time));
      if (state.grain > 0) p.image(grainLayer, 0, 0, p.width, p.height);

      pinkCountFrame += 1;
      if (pinkCountFrame % 8 === 0) controls.pinkCount.textContent = String(leaves.filter((leaf) => leaf.hit).length);
    };

    p.windowResized = () => {
      p.resizeCanvas(window.innerWidth, window.innerHeight);
      buildGrainLayer();
      positionLeaves(true);
      resetPointer();
      buildKoi();
    };

    const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotionPreferenceChange = (event) => {
      reducedMotion = event.matches;
    };
    motionMedia.addEventListener('change', onMotionPreferenceChange);

    cleanupSketch = () => {
      unbindCanvasPointer();
      motionMedia.removeEventListener('change', onMotionPreferenceChange);
    };

    rebuildLeaves = () => buildLeaves();
    layoutLeaves = () => positionLeaves();
    rebuildKoi = () => buildKoi();
    rebuildGrain = () => buildGrainLayer();
    resetArtwork = () => resetScene();
    regenerateArtwork = () => {
      buildLeaves({ keepSeed: false });
      buildGrainLayer();
      resetPointer();
      buildKoi();
      if (state.paused) p.redraw();
    };
    setPaused = (paused) => {
      if (paused) p.noLoop();
      else p.loop();
    };
    redrawArtwork = () => {
      if (state.paused) p.redraw();
    };
  };

  const instance = new p5(sketch, controls.canvasHost);

  return () => {
    listeners.abort();
    cleanupSketch();
    instance.remove();
    root.remove();
  };
}
