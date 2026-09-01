import p5 from 'p5';
import './style.css';

export function mount(container) {
  const root = document.createElement('section');
  root.id = 'app';
  root.setAttribute('aria-label', '飞鸟蒲公英生成艺术');
  root.innerHTML = `
    <div id="canvas-host" aria-label="飞鸟组成的动态蒲公英画布"></div>
    <header class="masthead">
      <p class="kicker">GENERATIVE STUDY</p>
      <h1>飞鸟<br />蒲公英</h1>
      <p class="intro">三百五十只飞鸟，沿黄金角生长，再随风离开。</p>
    </header>
    <button class="panel-toggle" id="panel-toggle" type="button" aria-expanded="false" aria-controls="control-panel">参数</button>
    <aside class="control-panel" id="control-panel" aria-label="动画参数">
      <div class="panel-heading">
        <div><p class="panel-label">实时控制</p><h2>风与种子</h2></div>
        <span class="bird-count"><strong id="visible-count">350</strong> / <span id="total-count">350</span></span>
      </div>
      <div class="control-groups">
        <details class="control-group" open>
          <summary>鸟群结构</summary>
          <div class="group-content">
            <label class="control-row" for="bird-count"><span>数量</span><output id="bird-count-output">350</output><input id="bird-count" data-control="birdCount" type="range" min="120" max="520" value="350" step="10" /></label>
            <label class="control-row" for="bird-size"><span>鸟体大小</span><output id="bird-size-output">1.0</output><input id="bird-size" data-control="birdSize" type="range" min="0.65" max="1.8" value="1" step="0.05" /></label>
            <label class="control-row" for="wing-span"><span>翼展</span><output id="wing-span-output">1.0</output><input id="wing-span" data-control="wingSpan" type="range" min="0.65" max="1.7" value="1" step="0.05" /></label>
            <label class="control-row" for="radius"><span>冠幅</span><output id="radius-output">1.0</output><input id="radius" data-control="radius" type="range" min="0.65" max="1.35" value="1" step="0.05" /></label>
            <label class="control-row" for="golden-angle"><span>排列角</span><output id="golden-angle-output">137.5°</output><input id="golden-angle" data-control="goldenAngle" type="range" min="125" max="150" value="137.508" step="0.1" /></label>
          </div>
        </details>
        <details class="control-group">
          <summary>风场运动</summary>
          <div class="group-content">
            <label class="control-row" for="wind"><span>风力</span><output id="wind-output">1.0</output><input id="wind" data-control="wind" type="range" min="0.35" max="2" value="1" step="0.05" /></label>
            <label class="control-row" for="direction"><span>飞行方向</span><output id="direction-output">-45°</output><input id="direction" data-control="direction" type="range" min="-80" max="-10" value="-45" step="1" /></label>
            <label class="control-row" for="turbulence"><span>气流扰动</span><output id="turbulence-output">1.0</output><input id="turbulence" data-control="turbulence" type="range" min="0" max="2.5" value="1" step="0.05" /></label>
            <label class="control-row" for="scatter"><span>离散程度</span><output id="scatter-output">1.0</output><input id="scatter" data-control="scatter" type="range" min="0.15" max="2.2" value="1" step="0.05" /></label>
            <label class="control-row" for="delay"><span>停留</span><output id="delay-output">3.0s</output><input id="delay" data-control="delay" type="range" min="0.5" max="7" value="3" step="0.1" /></label>
            <label class="control-row" for="launch-window"><span>起飞波次</span><output id="launch-window-output">2.6s</output><input id="launch-window" data-control="launchWindow" type="range" min="0.2" max="6" value="2.6" step="0.1" /></label>
          </div>
        </details>
        <details class="control-group">
          <summary>画面细节</summary>
          <div class="group-content">
            <label class="control-row" for="sway"><span>整体摇曳</span><output id="sway-output">1.0</output><input id="sway" data-control="sway" type="range" min="0" max="2" value="1" step="0.05" /></label>
            <label class="control-row" for="flap-speed"><span>振翅速度</span><output id="flap-speed-output">1.0</output><input id="flap-speed" data-control="flapSpeed" type="range" min="0.15" max="2.5" value="1" step="0.05" /></label>
            <label class="control-row" for="grain"><span>星尘密度</span><output id="grain-output">1.0</output><input id="grain" data-control="grain" type="range" min="0" max="2" value="1" step="0.1" /></label>
            <label class="control-row" for="core-size"><span>花芯大小</span><output id="core-size-output">1.0</output><input id="core-size" data-control="coreSize" type="range" min="0.6" max="1.7" value="1" step="0.05" /></label>
          </div>
        </details>
      </div>
      <div class="actions"><button id="replay" class="primary-action" type="button">再飞一次</button><button id="pause" class="secondary-action" type="button" aria-pressed="false">暂停</button></div>
    </aside>
    <footer class="footer-note"><span>Vogel's Phyllotaxis</span><span>137.508°</span></footer>
    <div class="loading-state" id="loading-state" role="status" aria-live="polite"><span></span><span></span><span></span><p>正在聚拢鸟群</p></div>
  `;
  container.append(root);

const CONFIG = {
  background: '#3168B5',
  coreColor: '#F49B9B',
  grainCount: 2600,
  cycleDuration: 14_000,
};

const state = {
  birdCount: 350,
  birdSize: 1,
  wingSpan: 1,
  radius: 1,
  goldenAngle: 137.508,
  wind: 1,
  direction: -45,
  turbulence: 1,
  scatter: 1,
  sway: 1,
  flapSpeed: 1,
  grain: 1,
  coreSize: 1,
  delay: 3000,
  launchWindow: 2600,
  paused: false,
  panelOpen: false,
};

  const controls = {
  ranges: [...root.querySelectorAll('[data-control]')],
  replay: root.querySelector('#replay'),
  pause: root.querySelector('#pause'),
  count: root.querySelector('#visible-count'),
  total: root.querySelector('#total-count'),
  loading: root.querySelector('#loading-state'),
  panel: root.querySelector('#control-panel'),
    panelToggle: root.querySelector('#panel-toggle'),
  };
  const canvasHost = root.querySelector('#canvas-host');

let restartArtwork = () => {};
let setArtworkPaused = () => {};
let rebuildArtwork = () => {};
let rebuildGrain = () => {};
let repositionArtwork = () => {};
let redrawArtwork = () => {};

const formatters = {
  birdCount: (value) => String(Math.round(value)),
  goldenAngle: (value) => `${Number(value).toFixed(1)}°`,
  direction: (value) => `${Math.round(value)}°`,
  delay: (value) => `${Number(value).toFixed(1)}s`,
  launchWindow: (value) => `${Number(value).toFixed(1)}s`,
};

function bindRange(input) {
  const key = input.dataset.control;
  const output = root.querySelector(`#${input.id}-output`);
  const formatter = formatters[key] || ((value) => Number(value).toFixed(1));
  input.addEventListener('input', () => {
    const value = Number(input.value);
    state[key] = key === 'delay' || key === 'launchWindow' ? value * 1000 : value;
    output.value = formatter(value);
    output.textContent = formatter(value);
    if (key === 'birdCount') rebuildArtwork();
    if (key === 'radius' || key === 'goldenAngle') repositionArtwork();
    if (key === 'grain') rebuildGrain();
    redrawArtwork();
  });
}

controls.ranges.forEach(bindRange);

controls.replay.addEventListener('click', () => restartArtwork());
controls.pause.addEventListener('click', () => {
  state.paused = !state.paused;
  controls.pause.textContent = state.paused ? '继续' : '暂停';
  controls.pause.setAttribute('aria-pressed', String(state.paused));
  setArtworkPaused(state.paused);
});

controls.panelToggle.addEventListener('click', () => {
  state.panelOpen = !state.panelOpen;
  controls.panel.classList.toggle('is-open', state.panelOpen);
  controls.panelToggle.setAttribute('aria-expanded', String(state.panelOpen));
  controls.panelToggle.textContent = state.panelOpen ? '收起' : '参数';
});

const sketch = (p) => {
  const birds = [];
  let grains;
  let startTime = 0;
  let pausedAt = 0;
  let pauseOffset = 0;
  let countUpdateFrame = 0;
  let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  class Bird {
    constructor(index) {
      this.index = index;
      this.seed = p.random(1000);
      this.depth = p.random(0.03, 1.6);
      this.scale = p.map(this.depth, 0.03, 1.6, 0.34, 1.22);
      this.flapOffset = p.random(p.TWO_PI);
      this.launchRatio = p.random();
      this.baseSpeed = p.random(1.35, 3.35);
      this.drift = p.random(-0.25, 0.65);
      this.asymmetry = p.random(-0.16, 0.16);
      this.resetPosition();
    }

    resetPosition() {
      const theta = p.radians(this.index * state.goldenAngle);
      const maxRadius = Math.min(p.width, p.height) * (p.width < 700 ? 0.25 : 0.285) * state.radius;
      const radius = maxRadius * Math.sqrt(this.index / Math.max(1, state.birdCount));
      this.radiusRatio = radius / maxRadius;
      this.baseX = Math.cos(theta) * radius * 1.05;
      this.baseY = Math.sin(theta) * radius * 0.83;
      this.x = this.baseX;
      this.y = this.baseY;
      this.vx = 0;
      this.vy = 0;
      this.alpha = 220;
      this.launched = false;
    }

    update(elapsed, center, sway) {
      const launchAt = state.delay + this.launchRatio * state.launchWindow + this.index * 2.2;
      if (!reducedMotion && elapsed > launchAt) {
        if (!this.launched) {
          this.launched = true;
          const heading = p.radians(state.direction + p.random(-13, 13) * state.scatter);
          const speed = this.baseSpeed * p.random(0.82, 1.2);
          this.vx = Math.cos(heading) * speed;
          this.vy = Math.sin(heading) * speed;
        }
        const turbulence = p.noise(this.seed, elapsed * 0.00024) - 0.5;
        const liveHeading = p.radians(state.direction);
        this.vx += Math.cos(liveHeading) * (0.007 + this.radiusRatio * 0.004) * state.wind;
        this.vy += Math.sin(liveHeading) * 0.006 * state.wind + turbulence * 0.055 * state.turbulence + this.drift * 0.003 * state.scatter;
        this.x += this.vx * state.wind;
        this.y += this.vy * state.wind;
        const edge = Math.max(p.width, p.height) * 0.62;
        if (Math.abs(this.x) > edge || Math.abs(this.y) > edge) this.alpha = Math.max(0, this.alpha - 7);
      } else {
        this.x = this.baseX + sway * (0.14 + this.radiusRatio * 0.72);
        this.y = this.baseY + Math.sin(elapsed * 0.0015 + this.seed) * state.sway * 0.6;
      }
    }

    drawSilhouette(flap, alpha) {
      const lift = 4.5 + flap * 2.2;
      const span = state.wingSpan;
      p.noStroke();
      p.fill(210, 233, 255, alpha);

      // Far wing: a broad leading edge and three feather tips.
      p.beginShape();
      p.vertex(0.8, -0.45);
      p.bezierVertex(-0.1, -1.1, -0.8, -3.7 * span, -2.4, -lift * span);
      p.bezierVertex(-3.2, -(lift + 1.4) * span, -4.6, -(lift + 1.9) * span, -5.5, -(lift + 1.4) * span);
      p.vertex(-4.1, -(lift - 0.2) * span);
      p.vertex(-5.0, -(lift - 0.65) * span);
      p.vertex(-3.3, -(lift - 1.5) * span);
      p.bezierVertex(-2.3, -2.2 * span, -1.2, -0.7, 0.5, 0.35);
      p.endShape(p.CLOSE);

      // Near wing uses a slightly different outline so the flock does not read as repeated icons.
      const nearLift = (lift + this.asymmetry * 4) * span;
      p.beginShape();
      p.vertex(0.65, 0.35);
      p.bezierVertex(-0.25, 1.1, -1.05, nearLift * 0.72, -2.8, nearLift);
      p.bezierVertex(-3.75, nearLift + 0.75, -5.0, nearLift + 0.9, -5.75, nearLift + 0.35);
      p.vertex(-4.25, nearLift - 0.35);
      p.vertex(-5.05, nearLift - 0.95);
      p.vertex(-3.15, nearLift - 1.35);
      p.bezierVertex(-2.1, 2.1 * span, -1.0, 0.7, 0.5, -0.15);
      p.endShape(p.CLOSE);

      // Body, head, beak and forked tail remain readable while the wings flap.
      p.ellipse(-0.1, 0, 6.2, 2.25);
      p.circle(2.65, -0.12, 1.8);
      p.triangle(3.35, -0.45, 4.75, -0.05, 3.35, 0.2);
      p.triangle(-2.55, -0.35, -5.25, -1.55, -4.25, 0.1);
      p.triangle(-2.55, 0.35, -5.1, 1.65, -4.1, -0.05);
    }

    draw(elapsed, center) {
      if (this.alpha <= 0) return;
      const screenX = center.x + this.x;
      const screenY = center.y + this.y;
      const velocityAngle = this.launched
        ? Math.atan2(this.vy, this.vx)
        : Math.atan2(this.baseY, this.baseX) + p.HALF_PI;
      const flap = Math.sin(elapsed * 0.014 * state.flapSpeed + this.flapOffset) * (this.launched ? 0.9 : 0.42);
      const size = p.constrain(Math.min(p.width, p.height) * 0.0115 * this.scale * state.birdSize, 3.4, 16.5);

      p.push();
      p.translate(screenX, screenY);
      p.rotate(velocityAngle);
      p.scale(size / 10);
      this.drawSilhouette(flap, this.alpha);
      p.pop();
    }

    isVisible(center) {
      return this.alpha > 0 && center.x + this.x > -20 && center.x + this.x < p.width + 20 && center.y + this.y > -20 && center.y + this.y < p.height + 20;
    }
  }

  function buildGrain() {
    grains = p.createGraphics(Math.max(1, p.width), Math.max(1, p.height));
    grains.pixelDensity(1);
    grains.clear();
    grains.noStroke();
    for (let i = 0; i < Math.round(CONFIG.grainCount * state.grain); i += 1) {
      const x = p.random(grains.width);
      const y = p.random(grains.height);
      const alpha = p.random(10, 40);
      grains.fill(230, 243, 255, alpha);
      grains.circle(x, y, p.random(0.5, 1.8));
    }
  }

  function centerPoint(elapsed) {
    const compact = p.width < 700;
    const x = compact ? p.width * 0.54 : p.width * 0.62;
    const y = compact ? p.height * 0.46 : p.height * 0.43;
    const sway = Math.sin(elapsed * 0.00115) * Math.min(p.width, p.height) * 0.012 * state.sway;
    return { x: x + sway, y, sway };
  }

  function drawStem(center, elapsed) {
    const bottomY = p.height + 18;
    const controlShift = Math.sin(elapsed * 0.00115 + 0.6) * 13 * state.sway;
    p.noFill();
    p.stroke(132, 165, 111, 225);
    p.strokeWeight(p.width < 700 ? 2.2 : 3.2);
    p.bezier(
      center.x,
      center.y + 10,
      center.x - 4 + controlShift,
      center.y + (bottomY - center.y) * 0.38,
      center.x - 22 + controlShift,
      center.y + (bottomY - center.y) * 0.72,
      center.x - 18,
      bottomY,
    );
  }

  function drawCore(center) {
    p.noStroke();
    for (let radius = 54; radius >= 12; radius -= 7) {
      const alpha = p.map(radius, 54, 12, 4, 40);
      p.fill(244, 155, 155, alpha);
      p.circle(center.x, center.y, radius * state.coreSize);
    }
    p.fill(CONFIG.coreColor);
    p.circle(center.x, center.y, (p.width < 700 ? 18 : 22) * state.coreSize);
    p.fill(255, 225, 216, 235);
    p.circle(center.x - 2.5 * state.coreSize, center.y - 3 * state.coreSize, (p.width < 700 ? 5 : 6) * state.coreSize);
  }

  function reset() {
    startTime = p.millis();
    pauseOffset = 0;
    birds.forEach((bird) => bird.resetPosition());
    controls.count.textContent = String(state.birdCount);
    controls.total.textContent = String(state.birdCount);
  }

  function buildBirds() {
    birds.length = 0;
    p.randomSeed(508);
    for (let i = 0; i < state.birdCount; i += 1) birds.push(new Bird(i));
    reset();
  }

  restartArtwork = () => {
    if (state.paused) {
      state.paused = false;
      controls.pause.textContent = '暂停';
      controls.pause.setAttribute('aria-pressed', 'false');
      p.loop();
    }
    reset();
  };

  setArtworkPaused = (paused) => {
    if (paused) {
      pausedAt = p.millis();
      p.noLoop();
    } else {
      pauseOffset += p.millis() - pausedAt;
      p.loop();
    }
  };

  rebuildArtwork = () => buildBirds();
  rebuildGrain = () => buildGrain();
  repositionArtwork = () => reset();
  redrawArtwork = () => {
    if (state.paused) p.redraw();
  };

  p.setup = () => {
    const canvas = p.createCanvas(window.innerWidth, window.innerHeight);
    canvas.parent(canvasHost);
    p.pixelDensity(Math.min(window.devicePixelRatio, 2));
    p.angleMode(p.RADIANS);
    p.randomSeed(508);
    buildGrain();
    buildBirds();
    controls.loading.classList.add('is-hidden');
  };

  p.draw = () => {
    p.background(CONFIG.background);
    p.image(grains, 0, 0, p.width, p.height);
    const elapsed = p.millis() - startTime - pauseOffset;
    const center = centerPoint(elapsed);

    drawStem(center, elapsed);
    let visible = 0;
    birds.forEach((bird) => {
      bird.update(elapsed, center, center.sway);
      bird.draw(elapsed, center);
      if (bird.isVisible(center)) visible += 1;
    });
    drawCore(center);

    countUpdateFrame += 1;
    if (countUpdateFrame % 8 === 0) controls.count.textContent = String(visible);
    if (!reducedMotion && elapsed > Math.max(CONFIG.cycleDuration, state.delay + state.launchWindow + 6500)) reset();
  };

  p.windowResized = () => {
    p.resizeCanvas(window.innerWidth, window.innerHeight);
    buildGrain();
    birds.forEach((bird) => bird.resetPosition());
  };

  const reduceMotionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
  const onReduceMotionChange = (event) => {
    reducedMotion = event.matches;
    reset();
  };
  reduceMotionMedia.addEventListener('change', onReduceMotionChange);

  };
  const instance = new p5(sketch, canvasHost);

  return () => {
    reduceMotionMedia.removeEventListener('change', onReduceMotionChange);
    instance.remove();
    root.remove();
  };
};
