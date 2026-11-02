/**
 * Charcoal brush. A stroke is painted as many small textured "dabs" stamped along a
 * smoothed path, each slightly rotated and translucent, so overlaps build up darker the
 * way charcoal does. Everything is seeded, so repainting a stroke gives the same marks.
 */

export type SketchPoint = { x: number; y: number; w: number };

const INK = [42, 39, 51];
const DAB_SIZE = 64;
let dabs: HTMLCanvasElement[] | null = null;

/** Small deterministic random number generator (mulberry32). */
export function seeded(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Four irregular, grainy charcoal dabs, made once. */
function getDabs() {
  if (dabs) return dabs;
  dabs = [0, 1, 2, 3].map((variant) => {
    const rand = seeded(1000 + variant);
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = DAB_SIZE;
    const ctx = canvas.getContext("2d")!;
    const image = ctx.createImageData(DAB_SIZE, DAB_SIZE);
    const c = DAB_SIZE / 2;
    // a lumpy outline: radius wobbles with angle
    const lumps = [rand(), rand(), rand(), rand()].map((v) => v * Math.PI * 2);
    for (let y = 0; y < DAB_SIZE; y++) {
      for (let x = 0; x < DAB_SIZE; x++) {
        const dx = x - c + 0.5;
        const dy = y - c + 0.5;
        const angle = Math.atan2(dy, dx);
        const radius = c * (0.8 + 0.1 * Math.sin(angle * 3 + lumps[0]) + 0.07 * Math.sin(angle * 5 + lumps[1]));
        const d = Math.hypot(dx, dy) / radius;
        if (d >= 1) continue;
        if (rand() < 0.14) continue; // speckle: paper showing through
        const alpha = Math.pow(1 - d, 0.4) * (0.6 + rand() * 0.4);
        const o = (y * DAB_SIZE + x) * 4;
        image.data[o] = INK[0];
        image.data[o + 1] = INK[1];
        image.data[o + 2] = INK[2];
        image.data[o + 3] = Math.round(alpha * 255);
      }
    }
    ctx.putImageData(image, 0, 0);
    return canvas;
  });
  return dabs;
}

/**
 * Paints one stroke incrementally: feed it points as they arrive (or all at once to
 * repaint). Draws into one or more target contexts, each with its own offset.
 */
export class StrokePainter {
  private rand: () => number;
  private points: SketchPoint[] = [];
  private carry = 0; // distance left over until the next dab
  private dabCount = 0;

  constructor(
    seed: number,
    private targets: () => { ctx: CanvasRenderingContext2D; ox: number; oy: number; scale: number }[],
  ) {
    this.rand = seeded(seed);
  }

  add(point: SketchPoint) {
    const pts = this.points;
    pts.push(point);
    const n = pts.length;
    if (n === 1) {
      this.dab(point.x, point.y, point.w);
      return;
    }
    // smoothed with midpoint quadratics: paint from the previous midpoint to the new one
    if (n === 2) {
      const m = mid(pts[0], pts[1]);
      this.line(pts[0], m);
      return;
    }
    const a = mid(pts[n - 3], pts[n - 2]);
    const b = mid(pts[n - 2], pts[n - 1]);
    this.curve(a, pts[n - 2], b);
  }

  /** Finishes the tail of the stroke (from the last midpoint to the last point). */
  end() {
    const pts = this.points;
    if (pts.length >= 2) this.line(mid(pts[pts.length - 2], pts[pts.length - 1]), pts[pts.length - 1]);
  }

  private line(a: SketchPoint, b: SketchPoint) {
    this.curve(a, mid(a, b), b);
  }

  private curve(a: SketchPoint, control: SketchPoint, b: SketchPoint) {
    const length = Math.hypot(control.x - a.x, control.y - a.y) + Math.hypot(b.x - control.x, b.y - control.y);
    const samples = Math.max(2, Math.ceil(length / 0.5));
    let prev = a;
    for (let i = 1; i <= samples; i++) {
      const t = i / samples;
      const u = 1 - t;
      const p = {
        x: u * u * a.x + 2 * u * t * control.x + t * t * b.x,
        y: u * u * a.y + 2 * u * t * control.y + t * t * b.y,
        w: a.w + (b.w - a.w) * t,
      };
      const step = Math.hypot(p.x - prev.x, p.y - prev.y);
      const spacing = Math.max(0.5, p.w * 0.35);
      this.carry += step;
      while (this.carry >= spacing) {
        this.carry -= spacing;
        const back = this.carry / (step || 1);
        this.dab(p.x - (p.x - prev.x) * back, p.y - (p.y - prev.y) * back, p.w);
      }
      prev = p;
    }
  }

  private dab(x: number, y: number, w: number) {
    const rand = this.rand;
    const image = getDabs()[Math.floor(rand() * 4)];
    const size = w * (1.7 + rand() * 0.4);
    const rotation = rand() * Math.PI * 2;
    const alpha = 0.42 + rand() * 0.2;
    const dust = ++this.dabCount % 4 === 0;
    const dustA = [rand(), rand(), rand(), rand(), rand(), rand()];
    for (const { ctx, ox, oy, scale } of this.targets()) {
      const px = (x - ox) * scale;
      const py = (y - oy) * scale;
      const s = size * scale;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.translate(px, py);
      ctx.rotate(rotation);
      ctx.drawImage(image, -s / 2, -s / 2, s, s);
      ctx.restore();
      // graphite dust scattered just off the line
      if (dust) {
        ctx.save();
        ctx.fillStyle = "rgb(42, 39, 51)";
        for (let i = 0; i < 2; i++) {
          const angle = dustA[i * 3] * Math.PI * 2;
          const distance = w * (0.9 + dustA[i * 3 + 1] * 0.9) * scale;
          ctx.globalAlpha = 0.18 + dustA[i * 3 + 2] * 0.15;
          const r = Math.max(0.4, (0.35 + dustA[i * 3 + 2] * 0.45) * scale);
          ctx.beginPath();
          ctx.arc(px + Math.cos(angle) * distance, py + Math.sin(angle) * distance, r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }
    }
  }
}

function mid(a: SketchPoint, b: SketchPoint): SketchPoint {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: (a.w + b.w) / 2 };
}
