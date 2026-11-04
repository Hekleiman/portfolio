/*
 * BUG HUNT: a small fixed-shooter easter egg for hekdev.com.
 *
 * Loaded on demand (dynamic import from Base.astro), so none of this ships
 * in the main page bundle. Plain canvas, no dependencies. Sprites are
 * original pixel art in the site palette.
 *
 * Controls: Left/Right or A/D move, Space or Z fires, P pauses, Esc exits.
 * Touch: drag to move, holding a finger down auto-fires.
 */

const W = 240; // logical playfield width
const H = 320; // logical playfield height
const SCORE_KEY = 'hekdev.bughunt.scores';
const MAX_SCORES = 5;

type Sprite = string[];

const PAL: Record<string, string> = {
  c: '#00e5ff', // neon cyan
  w: '#ffffff',
  y: '#ffe600', // pixel yellow
  p: '#b45cff', // bright snes purple
  o: '#ff6b00', // atari orange
  g: '#39ff14', // neon green
  r: '#ff2244', // hp red
};

const SHIP: Sprite = [
  '....c....',
  '...ccc...',
  '...cwc...',
  '.c.ccc.c.',
  'ccccccccc',
  'cc.ccc.cc',
  'c..y.y..c',
];

// Two-frame bug, recoloured per enemy kind. "X" is the body colour, "e" the eyes.
const BUG_A: Sprite = [
  '..y...y..',
  '...y.y...',
  '..XXXXX..',
  '.XeXXXeX.',
  'XXXXXXXXX',
  'X.X.X.X.X',
  '.X.....X.',
];
const BUG_B: Sprite = [
  '..y...y..',
  '...y.y...',
  '..XXXXX..',
  '.XeXXXeX.',
  'XXXXXXXXX',
  '.X.X.X.X.',
  'X.......X',
];

const KINDS = [
  { body: 'p', points: 100 }, // rows 2-3
  { body: 'o', points: 200 }, // row 1
  { body: 'g', points: 400 }, // row 0
] as const;

type Kind = 0 | 1 | 2;
type EnemyState = 'enter' | 'form' | 'dive' | 'return';

interface Enemy {
  kind: Kind;
  col: number;
  row: number;
  x: number;
  y: number;
  state: EnemyState;
  t: number;
  delay: number;
  fromX: number;
  fromY: number;
  targetX: number;
  dir: number;
  shots: number;
  alive: boolean;
}

interface Bullet {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: string;
}

interface Star {
  x: number;
  y: number;
  speed: number;
  color: string;
}

interface ScoreEntry {
  i: string;
  s: number;
}

type Phase = 'title' | 'playing' | 'dying' | 'wave' | 'over';

const DEFAULT_SCORES: ScoreEntry[] = [
  { i: 'HEK', s: 20000 },
  { i: 'NPM', s: 12000 },
  { i: 'GIT', s: 8000 },
  { i: 'CSS', s: 5000 },
  { i: 'API', s: 2000 },
];

function loadScores(): ScoreEntry[] {
  try {
    const raw = localStorage.getItem(SCORE_KEY);
    if (!raw) return DEFAULT_SCORES.slice();
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return DEFAULT_SCORES.slice();
    const clean = parsed
      .filter(
        (e): e is ScoreEntry =>
          typeof e === 'object' && e !== null &&
          typeof (e as ScoreEntry).i === 'string' &&
          typeof (e as ScoreEntry).s === 'number' &&
          Number.isFinite((e as ScoreEntry).s),
      )
      .map((e) => ({ i: e.i.slice(0, 3).toUpperCase(), s: Math.max(0, Math.floor(e.s)) }))
      .sort((a, b) => b.s - a.s)
      .slice(0, MAX_SCORES);
    return clean.length ? clean : DEFAULT_SCORES.slice();
  } catch {
    return DEFAULT_SCORES.slice();
  }
}

function saveScores(list: ScoreEntry[]): void {
  try {
    localStorage.setItem(SCORE_KEY, JSON.stringify(list));
  } catch {
    /* private mode or blocked storage: the table just won't persist */
  }
}

function pad(n: number, len = 6): string {
  return String(Math.max(0, Math.floor(n))).padStart(len, '0');
}

function renderSprite(rows: Sprite, map: Record<string, string>): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = rows[0].length;
  c.height = rows.length;
  const g = c.getContext('2d');
  if (!g) return c;
  rows.forEach((row, y) => {
    [...row].forEach((ch, x) => {
      const col = map[ch];
      if (col) {
        g.fillStyle = col;
        g.fillRect(x, y, 1, 1);
      }
    });
  });
  return c;
}

const CSS = `
.arcade-overlay{position:fixed;inset:0;z-index:10050;background:rgba(10,0,21,.96);display:flex;align-items:center;justify-content:center;touch-action:none;}
.arcade-overlay canvas{display:block;image-rendering:pixelated;outline:none;border:2px solid var(--snes-purple,#6a0dad);box-shadow:0 0 40px rgba(106,13,173,.5);}
.arcade-overlay canvas:focus-visible{border-color:var(--neon-cyan,#00e5ff);}
.arcade-close{position:fixed;top:12px;right:12px;z-index:2;font:10px 'Press Start 2P',monospace;color:var(--pixel-yellow,#ffe600);background:var(--snes-dark,#1a0030);border:2px solid var(--pixel-yellow,#ffe600);padding:10px 12px;cursor:pointer;}
.arcade-close:focus-visible,.arcade-panel button:focus-visible,.arcade-panel input:focus-visible{outline:3px dashed var(--neon-cyan,#00e5ff);outline-offset:3px;}
.arcade-panel{position:absolute;z-index:1;width:min(300px,calc(100vw - 32px));max-height:calc(100vh - 32px);overflow:auto;background:var(--snes-dark,#1a0030);border:2px solid var(--neon-cyan,#00e5ff);box-shadow:6px 6px 0 #006b80;padding:20px 16px;text-align:center;font-family:'Press Start 2P',monospace;color:var(--ps1-grey,#a0a0b0);}
.arcade-panel[hidden]{display:none;}
.arcade-panel h2{font-size:16px;color:var(--hp-red,#ff2244);margin-bottom:14px;letter-spacing:2px;}
.arcade-panel .ap-score{font-size:9px;color:#fff;margin-bottom:16px;line-height:1.6;}
.arcade-panel .ap-new{font-size:8px;color:var(--pixel-yellow,#ffe600);margin-bottom:10px;line-height:1.8;}
.arcade-panel form{display:flex;gap:8px;justify-content:center;margin-bottom:16px;}
.arcade-panel form[hidden]{display:none;}
.arcade-panel input{width:84px;font:14px 'Press Start 2P',monospace;text-transform:uppercase;text-align:center;letter-spacing:4px;color:var(--neon-green,#39ff14);background:#0a0015;border:2px solid var(--neon-green,#39ff14);padding:8px 4px;}
.arcade-panel ol{list-style:none;font-size:8px;line-height:2.2;margin:0 auto 18px;max-width:200px;text-align:left;}
.arcade-panel li{display:flex;justify-content:space-between;}
.arcade-panel li.me{color:var(--neon-green,#39ff14);}
.arcade-panel .ap-label{font-size:8px;color:var(--neon-cyan,#00e5ff);margin-bottom:8px;}
.arcade-panel .ap-btns{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;}
.arcade-panel button{font:9px 'Press Start 2P',monospace;padding:12px 14px;cursor:pointer;border:2px solid currentColor;background:transparent;}
.arcade-panel .ap-primary{color:#0a0015;background:var(--neon-green,#39ff14);border-color:var(--neon-green,#39ff14);box-shadow:4px 4px 0 #1a8c00;}
.arcade-panel .ap-secondary{color:var(--neon-cyan,#00e5ff);box-shadow:4px 4px 0 #006b80;}
.arcade-panel .ap-save{color:#0a0015;background:var(--pixel-yellow,#ffe600);border-color:var(--pixel-yellow,#ffe600);}
`;

class BugHunt {
  private overlay: HTMLDivElement;
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private panel: HTMLDivElement;
  private closeBtn: HTMLButtonElement;
  private prevFocus: Element | null;
  private prevOverflow: string;
  private reduced: boolean;
  private inerted: HTMLElement[] = [];

  private sprShip: HTMLCanvasElement;
  private sprBugs: HTMLCanvasElement[][]; // [kind][frame]

  private scale = 1;
  private raf = 0;
  private last = 0;
  private time = 0;
  private paused = false;
  private closed = false;

  private phase: Phase = 'title';
  private phaseT = 0;
  private score = 0;
  private lives = 3;
  private wave = 1;
  private scores: ScoreEntry[];

  private px = W / 2;
  private invuln = 0;
  private cooldown = 0;
  private bullets: Bullet[] = [];
  private enemyBullets: Bullet[] = [];
  private enemies: Enemy[] = [];
  private particles: Particle[] = [];
  private stars: Star[] = [];
  private diveTimer = 2;
  private fireTimer = 3;

  private keys = new Set<string>();
  private touching = false;
  private touchX = W / 2;

  constructor() {
    this.prevFocus = document.activeElement;
    this.prevOverflow = document.body.style.overflow;
    this.reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.scores = loadScores();

    if (!document.getElementById('arcade-style')) {
      const style = document.createElement('style');
      style.id = 'arcade-style';
      style.textContent = CSS;
      document.head.appendChild(style);
    }

    this.overlay = document.createElement('div');
    this.overlay.className = 'arcade-overlay';
    this.overlay.setAttribute('role', 'dialog');
    this.overlay.setAttribute('aria-modal', 'true');
    this.overlay.setAttribute('aria-label', 'Bug Hunt, a mini arcade game');

    this.canvas = document.createElement('canvas');
    this.canvas.tabIndex = 0;
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute(
      'aria-label',
      'Bug Hunt game screen. Left and right arrows move, Space fires, P pauses, Escape exits.',
    );

    this.closeBtn = document.createElement('button');
    this.closeBtn.type = 'button';
    this.closeBtn.className = 'arcade-close';
    this.closeBtn.textContent = 'X EXIT';
    this.closeBtn.setAttribute('aria-label', 'Exit game');

    this.panel = document.createElement('div');
    this.panel.className = 'arcade-panel';
    this.panel.hidden = true;

    this.overlay.append(this.canvas, this.closeBtn, this.panel);
    // Make the page behind the game unreachable by Tab / screen readers while open.
    for (const el of Array.from(document.body.children)) {
      if (el instanceof HTMLElement && !el.inert && el.tagName !== 'SCRIPT') {
        el.inert = true;
        this.inerted.push(el);
      }
    }
    document.body.appendChild(this.overlay);
    document.body.style.overflow = 'hidden';

    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D not supported');
    this.ctx = ctx;

    this.sprShip = renderSprite(SHIP, PAL);
    this.sprBugs = KINDS.map((k) => {
      const map = { ...PAL, X: PAL[k.body], e: '#ffffff' };
      return [renderSprite(BUG_A, map), renderSprite(BUG_B, map)];
    });

    for (let i = 0; i < 60; i++) {
      this.stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        speed: 8 + Math.random() * 30,
        color: ['#ffffff', '#00e5ff', '#b45cff', '#a0a0b0'][i % 4],
      });
    }

    this.closeBtn.addEventListener('click', this.close);
    window.addEventListener('keydown', this.onKeyDown);
    window.addEventListener('keyup', this.onKeyUp);
    window.addEventListener('resize', this.resize);
    window.addEventListener('blur', this.onBlur);
    document.addEventListener('visibilitychange', this.onVisibility);
    this.canvas.addEventListener('pointerdown', this.onPointerDown);
    this.canvas.addEventListener('pointermove', this.onPointerMove);
    window.addEventListener('pointerup', this.onPointerUp);
    window.addEventListener('pointercancel', this.onPointerUp);

    this.resize();
    this.canvas.focus();
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  /* ---------- lifecycle ---------- */

  close = (): void => {
    if (this.closed) return;
    this.closed = true;
    cancelAnimationFrame(this.raf);
    window.removeEventListener('keydown', this.onKeyDown);
    window.removeEventListener('keyup', this.onKeyUp);
    window.removeEventListener('resize', this.resize);
    window.removeEventListener('blur', this.onBlur);
    document.removeEventListener('visibilitychange', this.onVisibility);
    window.removeEventListener('pointerup', this.onPointerUp);
    window.removeEventListener('pointercancel', this.onPointerUp);
    this.overlay.remove();
    for (const el of this.inerted) el.inert = false;
    this.inerted = [];
    document.body.style.overflow = this.prevOverflow;
    if (this.prevFocus instanceof HTMLElement) this.prevFocus.focus();
    if (active === this) active = null;
  };

  private resize = (): void => {
    const dpr = window.devicePixelRatio || 1;
    const margin = 16;
    const s = Math.max(1, Math.min((window.innerWidth - margin * 2) / W, (window.innerHeight - margin * 2) / H));
    this.scale = s;
    this.canvas.style.width = `${Math.floor(W * s)}px`;
    this.canvas.style.height = `${Math.floor(H * s)}px`;
    this.canvas.width = Math.floor(W * s * dpr);
    this.canvas.height = Math.floor(H * s * dpr);
    this.ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = false;
  };

  /* ---------- input ---------- */

  private onKeyDown = (e: KeyboardEvent): void => {
    const inInput = e.target instanceof HTMLInputElement;
    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
      return;
    }
    if (inInput || e.target === this.closeBtn || (e.target instanceof HTMLButtonElement && !this.panel.hidden)) return;

    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    const handled = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 'd', 'z', 'p', 'Enter'];
    if (handled.includes(k)) e.preventDefault();

    if (k === 'p' && this.phase !== 'title' && this.phase !== 'over') {
      this.paused = !this.paused;
      return;
    }
    if (this.paused && (k === ' ' || k === 'Enter')) {
      this.paused = false;
      return;
    }
    if (this.phase === 'title' && (k === ' ' || k === 'Enter')) {
      this.start();
      return;
    }
    this.keys.add(k);
  };

  private onKeyUp = (e: KeyboardEvent): void => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    this.keys.delete(k);
  };

  private toLogicalX(clientX: number): number {
    const r = this.canvas.getBoundingClientRect();
    return ((clientX - r.left) / r.width) * W;
  }

  private onPointerDown = (e: PointerEvent): void => {
    e.preventDefault();
    this.canvas.focus();
    if (this.paused) {
      this.paused = false;
      return;
    }
    if (this.phase === 'title') {
      this.start();
      return;
    }
    if (e.pointerType === 'mouse') return; // mouse users play with the keyboard
    this.touching = true;
    this.touchX = this.toLogicalX(e.clientX);
  };

  private onPointerMove = (e: PointerEvent): void => {
    if (!this.touching) return;
    this.touchX = this.toLogicalX(e.clientX);
  };

  private onPointerUp = (): void => {
    this.touching = false;
  };

  private onBlur = (): void => {
    this.keys.clear();
    this.touching = false;
    if (this.phase !== 'title' && this.phase !== 'over') this.paused = true;
  };

  private onVisibility = (): void => {
    if (document.hidden) this.onBlur();
  };

  /* ---------- game flow ---------- */

  private start(): void {
    this.score = 0;
    this.lives = 3;
    this.wave = 1;
    this.px = W / 2;
    this.bullets = [];
    this.enemyBullets = [];
    this.particles = [];
    this.panel.hidden = true;
    this.setPhase('wave');
  }

  private setPhase(p: Phase): void {
    this.phase = p;
    this.phaseT = 0;
    if (p === 'wave') this.spawnWave();
  }

  private spawnWave(): void {
    this.enemies = [];
    const rows: Kind[] = [2, 1, 0, 0];
    rows.forEach((kind, row) => {
      for (let col = 0; col < 8; col++) {
        const dir = col < 4 ? -1 : 1;
        this.enemies.push({
          kind,
          col,
          row,
          x: W / 2 + dir * 140,
          y: -20,
          state: 'enter',
          t: 0,
          delay: row * 0.25 + (col < 4 ? 3 - col : col - 4) * 0.08,
          fromX: W / 2 + dir * 140,
          fromY: -20,
          targetX: 0,
          dir,
          shots: 0,
          alive: true,
        });
      }
    });
    this.diveTimer = 2.2;
    this.fireTimer = 3;
  }

  private sway(): number {
    return Math.sin(this.time * 0.8) * 24;
  }

  private slot(e: Enemy): { x: number; y: number } {
    return { x: W / 2 + (e.col - 3.5) * 20 + this.sway(), y: 44 + e.row * 18 };
  }

  private godMode(): boolean {
    return document.documentElement.classList.contains('god-mode');
  }

  private fire(): void {
    const max = this.godMode() ? 6 : 2;
    if (this.cooldown > 0 || this.bullets.length >= max) return;
    const y = H - 30;
    this.bullets.push({ x: this.px, y, vx: 0, vy: -260 });
    if (this.godMode()) {
      this.bullets.push({ x: this.px, y, vx: -60, vy: -250 }, { x: this.px, y, vx: 60, vy: -250 });
    }
    this.cooldown = 0.22;
  }

  private explode(x: number, y: number, colors: string[], n: number): void {
    const count = this.reduced ? Math.ceil(n / 2) : n;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 20 + Math.random() * 70;
      this.particles.push({
        x,
        y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        life: 0,
        max: 0.4 + Math.random() * 0.4,
        color: colors[i % colors.length],
      });
    }
  }

  private killPlayer(): void {
    this.explode(this.px, H - 24, ['#00e5ff', '#ffffff', '#ffe600'], 28);
    this.lives -= 1;
    this.bullets = [];
    this.setPhase('dying');
  }

  private gameOver(): void {
    this.setPhase('over');
    this.showPanel();
  }

  /* ---------- update ---------- */

  private frame = (now: number): void => {
    if (this.closed) return;
    // Schedule first so one bad frame can never stop the loop.
    this.raf = requestAnimationFrame(this.frame);
    // rAF's timestamp can be earlier than the performance.now() taken in the
    // constructor, so clamp at 0 as well as capping long gaps.
    const dt = Math.max(0, Math.min(0.05, (now - this.last) / 1000));
    this.last = now;
    if (!this.paused) this.update(dt);
    this.draw();
  };

  private update(dt: number): void {
    this.time += dt;
    this.phaseT += dt;

    if (!this.reduced) {
      for (const s of this.stars) {
        s.y += s.speed * dt;
        if (s.y > H) {
          s.y = 0;
          s.x = Math.random() * W;
        }
      }
    }

    for (const p of this.particles) {
      p.life += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
    this.particles = this.particles.filter((p) => p.life < p.max);

    if (this.phase === 'title' || this.phase === 'over') return;

    if (this.phase === 'wave' && this.phaseT > 1.6) this.setPhase('playing');

    // player
    const alive = this.phase === 'playing' || this.phase === 'wave';
    if (alive) {
      let move = 0;
      if (this.keys.has('ArrowLeft') || this.keys.has('a')) move -= 1;
      if (this.keys.has('ArrowRight') || this.keys.has('d')) move += 1;
      const speed = 115;
      if (this.touching) {
        const diff = this.touchX - this.px;
        this.px += Math.sign(diff) * Math.min(Math.abs(diff), speed * 1.6 * dt);
      } else {
        this.px += move * speed * dt;
      }
      this.px = Math.max(8, Math.min(W - 8, this.px));
      this.cooldown = Math.max(0, this.cooldown - dt);
      this.invuln = Math.max(0, this.invuln - dt);
      if (this.phase === 'playing' && (this.keys.has(' ') || this.keys.has('z') || this.touching)) this.fire();
    }

    if (this.phase === 'dying' && this.phaseT > 1.6) {
      if (this.lives <= 0) {
        this.gameOver();
        return;
      }
      this.enemyBullets = [];
      this.px = W / 2;
      this.invuln = 2;
      this.setPhase('playing');
    }

    // bullets
    for (const b of this.bullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
    this.bullets = this.bullets.filter((b) => b.y > -6 && b.x > -4 && b.x < W + 4);
    for (const b of this.enemyBullets) {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
    }
    this.enemyBullets = this.enemyBullets.filter((b) => b.y < H + 6);

    this.updateEnemies(dt);
    this.collide();

    if (this.phase === 'playing' && this.enemies.length > 0 && this.enemies.every((e) => !e.alive)) {
      this.wave += 1;
      this.setPhase('wave');
    }
  }

  private updateEnemies(dt: number): void {
    const level = this.wave - 1;
    const formed = this.enemies.filter((e) => e.alive && e.state === 'form');

    if (this.phase === 'playing') {
      this.diveTimer -= dt;
      if (this.diveTimer <= 0 && formed.length) {
        const n = this.wave >= 3 && formed.length > 1 && Math.random() < 0.4 ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const pool = this.enemies.filter((e) => e.alive && e.state === 'form');
          if (!pool.length) break;
          const e = pool[Math.floor(Math.random() * pool.length)];
          e.state = 'dive';
          e.t = 0;
          e.fromX = e.x;
          e.fromY = e.y;
          e.targetX = this.px;
          e.dir = Math.random() < 0.5 ? -1 : 1;
          e.shots = 0;
        }
        this.diveTimer = Math.max(0.7, 2.6 - level * 0.25) * (0.7 + Math.random() * 0.6);
      }

      if (this.wave >= 2) {
        this.fireTimer -= dt;
        if (this.fireTimer <= 0 && formed.length) {
          const shooter = formed[Math.floor(Math.random() * formed.length)];
          this.enemyShot(shooter.x, shooter.y + 4, 0);
          this.fireTimer = Math.max(0.8, 2.6 - level * 0.2);
        }
      }
    }

    const diveSpeed = 95 + level * 10;

    for (const e of this.enemies) {
      if (!e.alive) continue;
      const s = this.slot(e);
      e.t += dt;
      switch (e.state) {
        case 'enter': {
          const p = Math.min(1, Math.max(0, (e.t - e.delay) / 1.1));
          const ease = 1 - (1 - p) * (1 - p);
          e.x = e.fromX + (s.x - e.fromX) * ease;
          e.y = e.fromY + (s.y - e.fromY) * ease - Math.sin(p * Math.PI) * 30;
          if (p >= 1) e.state = 'form';
          break;
        }
        case 'form':
          e.x = s.x;
          e.y = s.y;
          break;
        case 'dive': {
          e.y = e.fromY + diveSpeed * e.t;
          const prog = Math.min(1, (e.y - e.fromY) / (H * 0.65));
          e.x = e.fromX + (e.targetX - e.fromX) * prog + Math.sin(e.t * 3.2) * 34 * e.dir;
          if (e.shots < (this.wave >= 2 ? 2 : 1) && e.y > 90 + e.shots * 60 && Math.random() < 0.04) {
            e.shots += 1;
            this.enemyShot(e.x, e.y + 4, (this.px - e.x) * 0.25);
          }
          if (e.y > H + 12) {
            e.state = 'return';
            e.t = 0;
            e.fromX = s.x;
            e.fromY = -14;
          }
          break;
        }
        case 'return': {
          const p = Math.min(1, e.t / 1.0);
          e.x = e.fromX + (s.x - e.fromX) * p;
          e.y = e.fromY + (s.y - e.fromY) * p;
          if (p >= 1) e.state = 'form';
          break;
        }
      }
    }
  }

  private enemyShot(x: number, y: number, vx: number): void {
    if (this.phase !== 'playing') return;
    this.enemyBullets.push({ x, y, vx: Math.max(-40, Math.min(40, vx)), vy: 120 + (this.wave - 1) * 8 });
  }

  private collide(): void {
    // player bullets vs enemies (9x7 sprite, hitbox slightly forgiving)
    for (const b of this.bullets) {
      for (const e of this.enemies) {
        if (!e.alive || e.state === 'enter') continue;
        if (Math.abs(b.x - e.x) < 6 && Math.abs(b.y - e.y) < 6) {
          e.alive = false;
          b.y = -100;
          const base = KINDS[e.kind].points;
          this.score += e.state === 'dive' ? base * 2 : base;
          this.explode(e.x, e.y, [PAL[KINDS[e.kind].body], '#ffe600', '#ffffff'], 14);
          break;
        }
      }
    }

    if (this.phase !== 'playing' || this.invuln > 0) return;
    const py = H - 24;
    for (const b of this.enemyBullets) {
      if (Math.abs(b.x - this.px) < 4.5 && Math.abs(b.y - py) < 4) {
        b.y = H + 100;
        this.killPlayer();
        return;
      }
    }
    for (const e of this.enemies) {
      if (!e.alive || e.state !== 'dive') continue;
      if (Math.abs(e.x - this.px) < 8 && Math.abs(e.y - py) < 7) {
        e.alive = false;
        this.explode(e.x, e.y, [PAL[KINDS[e.kind].body], '#ffffff'], 10);
        this.killPlayer();
        return;
      }
    }
  }

  /* ---------- draw ---------- */

  private text(str: string, x: number, y: number, color: string, size = 8, align: CanvasTextAlign = 'left'): void {
    const c = this.ctx;
    c.font = `${size}px "Press Start 2P", monospace`;
    c.textAlign = align;
    c.textBaseline = 'top';
    c.fillStyle = color;
    c.fillText(str, x, y);
  }

  private animFrame(): number {
    return Math.abs(Math.floor(this.time * 3)) % 2;
  }

  private blinkOn(rate = 0.5): boolean {
    return this.reduced || Math.floor(this.time / rate) % 2 === 0;
  }

  private draw(): void {
    const c = this.ctx;
    c.fillStyle = '#0a0015';
    c.fillRect(0, 0, W, H);

    for (const s of this.stars) {
      c.fillStyle = s.color;
      c.globalAlpha = 0.35 + (s.speed / 38) * 0.5;
      c.fillRect(Math.round(s.x), Math.round(s.y), 1, 1);
    }
    c.globalAlpha = 1;

    const hi = Math.max(this.score, this.scores[0]?.s ?? 0);

    if (this.phase === 'title') {
      this.drawTitle(hi);
      return;
    }

    // enemies
    const frameIdx = this.animFrame();
    for (const e of this.enemies) {
      if (!e.alive) continue;
      c.drawImage(this.sprBugs[e.kind][frameIdx], Math.round(e.x - 4.5), Math.round(e.y - 3.5));
    }

    // player
    const playerVisible =
      (this.phase === 'playing' || this.phase === 'wave') &&
      (this.invuln <= 0 || Math.floor(this.time * 10) % 2 === 0);
    if (playerVisible) c.drawImage(this.sprShip, Math.round(this.px - 4.5), H - 28);

    // bullets
    c.fillStyle = this.godMode() ? '#ffe600' : '#ffffff';
    for (const b of this.bullets) c.fillRect(Math.round(b.x), Math.round(b.y), 1, 4);
    c.fillStyle = '#ff2244';
    for (const b of this.enemyBullets) c.fillRect(Math.round(b.x) - 1, Math.round(b.y), 2, 3);

    // particles
    for (const p of this.particles) {
      c.globalAlpha = 1 - p.life / p.max;
      c.fillStyle = p.color;
      c.fillRect(Math.round(p.x), Math.round(p.y), 2, 2);
    }
    c.globalAlpha = 1;

    // HUD
    this.text('1UP', 6, 6, '#ff2244');
    this.text(pad(this.score), 6, 16, '#ffffff');
    this.text('HI-SCORE', W / 2, 6, '#ff2244', 8, 'center');
    this.text(pad(hi), W / 2, 16, '#ffffff', 8, 'center');
    for (let i = 0; i < Math.max(0, this.lives - 1); i++) c.drawImage(this.sprShip, 6 + i * 12, H - 12);
    this.text(`WAVE ${this.wave}`, W - 6, H - 12, '#00e5ff', 8, 'right');
    if (this.godMode()) this.text('GOD', W - 6, 6, '#ffe600', 8, 'right');

    if (this.phase === 'wave' && this.blinkOn(0.3)) {
      this.text(`WAVE ${this.wave}`, W / 2, H / 2 + 20, '#ffe600', 10, 'center');
    }
    if (this.phase === 'over') {
      this.text('GAME OVER', W / 2, H / 2 - 30, '#ff2244', 12, 'center');
    }
    if (this.paused) {
      c.fillStyle = 'rgba(10,0,21,0.7)';
      c.fillRect(0, 0, W, H);
      this.text('PAUSED', W / 2, H / 2 - 16, '#ffe600', 12, 'center');
      this.text('P OR TAP TO RESUME', W / 2, H / 2 + 6, '#a0a0b0', 6, 'center');
    }
  }

  private drawTitle(hi: number): void {
    const c = this.ctx;
    this.text('HI-SCORE', W / 2, 6, '#ff2244', 8, 'center');
    this.text(pad(hi), W / 2, 16, '#ffffff', 8, 'center');

    this.text('BUG', W / 2, 46, '#b45cff', 24, 'center');
    this.text('HUNT', W / 2, 76, '#00e5ff', 24, 'center');

    // little legend of what each bug is worth
    const legend: Array<[Kind, string]> = [
      [2, '400 PTS'],
      [1, '200 PTS'],
      [0, '100 PTS'],
    ];
    legend.forEach(([kind, label], i) => {
      const y = 122 + i * 16;
      c.drawImage(this.sprBugs[kind][this.animFrame()], W / 2 - 46, y - 1);
      this.text(label, W / 2 - 30, y, '#a0a0b0', 7);
    });
    this.text('DIVING BUGS X2', W / 2, 174, '#ffe600', 6, 'center');

    const touch = window.matchMedia('(pointer: coarse)').matches;
    if (this.blinkOn(0.6)) {
      this.text(touch ? 'TAP TO START' : 'PRESS ENTER', W / 2, 196, '#39ff14', 9, 'center');
    }
    const controls = touch
      ? ['DRAG TO MOVE', 'HOLD TO FIRE']
      : ['ARROWS / A D  MOVE', 'SPACE / Z  FIRE', 'P PAUSE   ESC EXIT'];
    controls.forEach((line, i) => this.text(line, W / 2, 218 + i * 11, '#a0a0b0', 6, 'center'));

    this.text('HIGH SCORES', W / 2, 258, '#ff6b00', 7, 'center');
    this.scores.slice(0, 3).forEach((s, i) => {
      this.text(`${s.i}  ${pad(s.s)}`, W / 2, 270 + i * 11, '#ffffff', 7, 'center');
    });
    this.text('NOT AFFILIATED WITH ANY ARCADE', W / 2, H - 10, '#4a3a60', 5, 'center');
  }

  /* ---------- game over panel ---------- */

  private qualifies(): boolean {
    return this.score > 0 && (this.scores.length < MAX_SCORES || this.score > this.scores[this.scores.length - 1].s);
  }

  private showPanel(): void {
    const p = this.panel;
    p.replaceChildren();

    const h = document.createElement('h2');
    h.textContent = 'GAME OVER';
    const sc = document.createElement('p');
    sc.className = 'ap-score';
    sc.textContent = `SCORE ${pad(this.score)}  WAVE ${this.wave}`;
    p.append(h, sc);

    const list = document.createElement('ol');
    const label = document.createElement('p');
    label.className = 'ap-label';
    label.textContent = 'HIGH SCORES';

    const renderList = (mine?: ScoreEntry): void => {
      list.replaceChildren(
        ...this.scores.map((s) => {
          const li = document.createElement('li');
          if (s === mine) li.className = 'me';
          const a = document.createElement('span');
          a.textContent = s.i;
          const b = document.createElement('span');
          b.textContent = pad(s.s);
          li.append(a, b);
          return li;
        }),
      );
    };

    const btns = document.createElement('div');
    btns.className = 'ap-btns';
    const again = document.createElement('button');
    again.type = 'button';
    again.className = 'ap-secondary';
    again.textContent = 'PLAY AGAIN';
    again.addEventListener('click', () => {
      this.start();
      this.canvas.focus();
    });
    const hire = document.createElement('button');
    hire.type = 'button';
    hire.className = 'ap-primary';
    hire.textContent = 'CONTINUE? HIRE ME';
    hire.addEventListener('click', () => {
      this.close();
      const target = document.getElementById('contact');
      if (target) target.scrollIntoView({ behavior: this.reduced ? 'auto' : 'smooth' });
    });
    btns.append(again, hire);

    if (this.qualifies()) {
      const note = document.createElement('p');
      note.className = 'ap-new';
      note.textContent = 'NEW HIGH SCORE! ENTER YOUR INITIALS';
      const form = document.createElement('form');
      const input = document.createElement('input');
      input.maxLength = 3;
      input.autocomplete = 'off';
      input.spellcheck = false;
      input.setAttribute('aria-label', 'Your initials, up to 3 letters');
      input.addEventListener('input', () => {
        input.value = input.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 3);
      });
      const save = document.createElement('button');
      save.type = 'submit';
      save.className = 'ap-save';
      save.textContent = 'SAVE';
      form.append(input, save);
      form.addEventListener('submit', (ev) => {
        ev.preventDefault();
        const entry: ScoreEntry = { i: (input.value || 'YOU').padEnd(3, ' ').slice(0, 3), s: this.score };
        this.scores = [...this.scores, entry].sort((a, b) => b.s - a.s).slice(0, MAX_SCORES);
        saveScores(this.scores);
        form.hidden = true;
        note.hidden = true;
        renderList(entry);
        again.focus();
      });
      p.append(note, form);
      renderList();
      p.append(label, list, btns);
      p.hidden = false;
      input.focus();
    } else {
      renderList();
      p.append(label, list, btns);
      p.hidden = false;
      again.focus();
    }
  }
}

let active: BugHunt | null = null;

export function openBugHunt(): void {
  if (active) return;
  try {
    active = new BugHunt();
    if (import.meta.env.DEV) (window as unknown as { __bughunt: BugHunt }).__bughunt = active;
  } catch (err) {
    active = null;
    console.error('[bug-hunt] could not start', err);
  }
}
