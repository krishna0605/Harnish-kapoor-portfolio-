/**
 * Puts a new photo into the two portrait composites, leaving every other pixel alone:
 *   public/images/portrait-collage.png — the Home collage: the photo sits in a circle with a
 *     torn white edge, two tapes overlapping it
 *   public/images/portrait-stamp.png   — the About stamp: the photo sits inside the ink frame
 *
 *   npm run portrait -- <photo.png|jpg> <x> <y> <size>
 *
 * <x> <y> <size> is the square crop of the photo to use (head and shoulders, face centred).
 * Phone photos (HEIC) need converting to PNG/JPEG first. No metadata (EXIF, GPS) is written.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const COLLAGE = path.join(root, "public", "images", "portrait-collage.png");
const STAMP = path.join(root, "public", "images", "portrait-stamp.png");

const [photoPath, cx, cy, cs] = process.argv.slice(2);
if (!photoPath || cs === undefined) {
  console.error("usage: npm run portrait -- <photo.png|jpg> <x> <y> <size>");
  process.exit(1);
}
const crop = { left: Math.round(+cx), top: Math.round(+cy), width: Math.round(+cs), height: Math.round(+cs) };
const photo = sharp(photoPath).rotate().extract(crop);

async function load(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

async function save(img, file) {
  await sharp(img.data, { raw: { width: img.width, height: img.height, channels: 4 } }).png({ compressionLevel: 9 }).toFile(file);
}

/** Blends `photo` (same size as img) into img wherever mask > 0 (0–1). */
function blend(img, photoPixels, mask) {
  for (let i = 0; i < mask.length; i++) {
    const m = mask[i];
    if (m <= 0) continue;
    for (let c = 0; c < 3; c++) img.data[i * 4 + c] = Math.round(img.data[i * 4 + c] * (1 - m) + photoPixels[i * 4 + c] * m);
  }
}

// ---------- Home collage: the circle ----------
async function collage() {
  const img = await load(COLLAGE);
  const at = (x, y) => {
    const i = (Math.round(y) * img.width + Math.round(x)) * 4;
    return [img.data[i], img.data[i + 1], img.data[i + 2], img.data[i + 3]];
  };
  // the torn ring is a warm paper white; the old photo's wall is a cool off-white
  const isRing = ([r, g, b, a]) => a > 200 && r > 236 && g > 232 && b > 224 && r >= b + 2 && r >= g - 3;
  // the two tapes over the circle: pale yellow (top left) and pale lilac (bottom right)
  const isTape = ([r, g, b], x, y) => {
    if (Math.min(r, g, b) < 165) return false;
    const yellow = x < 520 && y < 500 && r > 225 && g > 195 && r - b > 40;
    const lilac = x > 780 && y > 700 && b > g + 10 && r > g + 4;
    return yellow || lilac;
  };

  // centre and the photo's inner radius at every angle: walk inward from the pink paper,
  // through the white ring; the first pixel past the ring is the photo's edge
  const centre = { x: 637, y: 601 };
  const STEPS = 1440;
  const radius = new Array(STEPS).fill(null);
  for (let s = 0; s < STEPS; s++) {
    const a = (s / STEPS) * Math.PI * 2;
    let run = 0;
    let inRing = false;
    for (let r = 350; r > 260; r -= 0.5) {
      const p = at(centre.x + Math.cos(a) * r, centre.y + Math.sin(a) * r);
      if (isRing(p)) {
        run++;
        if (run >= 4) inRing = true;
      } else {
        if (inRing) {
          radius[s] = r + 0.5;
          break;
        }
        run = 0;
      }
    }
  }
  // the torn edge wanders a few px; a reading far from the typical radius hit something
  // ring-white inside the old photo (a white shirt) or missed the ring under a tape: drop it
  const sorted = radius.filter((r) => r !== null).sort((a, b) => a - b);
  const typical = sorted[Math.floor(sorted.length / 2)];
  for (let s = 0; s < STEPS; s++) if (radius[s] !== null && Math.abs(radius[s] - typical) > 12) radius[s] = null;
  // where nothing was read (tapes), carry the edge across from the nearest angles either side
  const found = radius.filter((r) => r !== null).length;
  for (let s = 0; s < STEPS; s++) {
    if (radius[s] !== null) continue;
    let back = 1;
    let fwd = 1;
    while (radius[(s - back + STEPS) % STEPS] === null) back++;
    while (radius[(s + fwd) % STEPS] === null) fwd++;
    const r0 = radius[(s - back + STEPS) % STEPS];
    const r1 = radius[(s + fwd) % STEPS];
    radius[s] = r0 + ((r1 - r0) * back) / (back + fwd);
  }
  // smooth the edge (median over ±2°) so single noisy readings can't leave slivers
  const WINDOW = 8;
  const smooth = radius.map((_, s) => {
    const around = [];
    for (let k = -WINDOW; k <= WINDOW; k++) around.push(radius[(s + k + STEPS) % STEPS]);
    return around.sort((a, b) => a - b)[WINDOW];
  });
  const maxR = Math.max(...smooth) + 6;

  // the new photo, scaled to cover the whole circle
  const size = Math.ceil(maxR * 2 + 8);
  const placed = await photo
    .clone()
    .resize(size, size, { kernel: "lanczos3" })
    .extend({
      left: Math.round(centre.x - size / 2),
      top: Math.round(centre.y - size / 2),
      right: img.width - Math.round(centre.x - size / 2) - size,
      bottom: img.height - Math.round(centre.y - size / 2) - size,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .raw()
    .toBuffer();

  // mask: well inside the edge, every pixel but the tapes is the photo; in a band around the
  // edge, only pixels that aren't the white ring are — so the real torn edge stays as it was
  const mask = new Float32Array(img.width * img.height);
  for (let y = Math.floor(centre.y - maxR - 2); y <= centre.y + maxR + 2; y++) {
    for (let x = Math.floor(centre.x - maxR - 2); x <= centre.x + maxR + 2; x++) {
      const dx = x - centre.x;
      const dy = y - centre.y;
      const d = Math.hypot(dx, dy);
      const s = Math.round(((Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2)) / (Math.PI * 2) * STEPS) % STEPS;
      const edge = smooth[s];
      if (d > edge + 6) continue;
      const p = at(x, y);
      if (isTape(p, x, y)) continue;
      if (d > edge - 4 && isRing(p)) continue;
      mask[y * img.width + x] = 1;
    }
  }
  blend(img, placed, mask);
  await save(img, COLLAGE);
  console.log(`collage: edge found at ${((found / STEPS) * 100).toFixed(0)}% of angles, radius ${Math.min(...radius).toFixed(0)}–${maxR.toFixed(0)}px`);
}

// ---------- About stamp: inside the ink frame ----------
async function stamp() {
  const img = await load(STAMP);
  const at = (x, y) => img.data[(y * img.width + x) * 4]; // red channel is enough to find ink
  const mid = Math.round(img.height / 2);
  const centreX = Math.round(img.width / 2);
  // from each side, past the transparent margin and the white perforated border, to the ink line
  const inkFrom = (start, step, read) => {
    let i = start;
    while (read(i)[3] < 200 || read(i)[0] < 120) i += step; // transparent margin, edge shadow
    while (read(i)[0] > 120) i += step; // white border
    // the ink line is ~3px; never walk further, or a dark photo edge would read as ink
    for (let k = 0; k < 4 && read(i)[0] <= 120; k++) i += step;
    return i;
  };
  const row = (x) => [at(x, mid), 0, 0, img.data[(mid * img.width + x) * 4 + 3]];
  const col = (y) => [at(centreX, y), 0, 0, img.data[(y * img.width + centreX) * 4 + 3]];
  const left = inkFrom(0, 1, row);
  const right = inkFrom(img.width - 1, -1, row);
  const top = inkFrom(0, 1, col);
  const bottom = inkFrom(img.height - 1, -1, col);
  const w = right - left + 1;
  const h = bottom - top + 1;

  const placed = await photo
    .clone()
    .resize(w, h, { kernel: "lanczos3", fit: "cover" })
    .extend({ left, top, right: img.width - left - w, bottom: img.height - top - h, background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .ensureAlpha()
    .raw()
    .toBuffer();
  const mask = new Float32Array(img.width * img.height);
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) mask[y * img.width + x] = 1;
  blend(img, placed, mask);
  await save(img, STAMP);
  console.log(`stamp: photo area ${w}×${h} at (${left}, ${top})`);
}

await collage();
await stamp();
