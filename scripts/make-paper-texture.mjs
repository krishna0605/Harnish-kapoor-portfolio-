/**
 * Builds the site's paper texture from the real torn-paper scrap in the Home collage
 * (public/images/portrait-collage.png) and writes public/textures/paper-grain.png.
 *
 * 1. Crop a clean 300×300 patch of the cream scrap.
 * 2. Keep only its darker fibres/speckle as grey on white, scaled so that, multiplied onto
 *    a page colour (`background-blend-mode: multiply`), the grain is as strong as on the
 *    scrap itself (luminance spread ≈ GRAIN). Works the same on rice paper and marigold.
 * 3. Make it seamless: blend the patch with a half-offset copy of itself, so the edges
 *    of the tile come from the middle of the patch.
 *
 * Uses Playwright's Chromium as the image tool. Run with `npm run texture`.
 */
import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const root = path.resolve(import.meta.dirname, "..");
const SOURCE = path.join(root, "public", "images", "portrait-collage.png");
const OUT = path.join(root, "public", "textures", "paper-grain.png");

// clean cream area of the scrap behind "Graphic Designer at Accenture"
const CROP = { x: 840, y: 1160, size: 300 };
const GRAIN = 7; // grain spread in the tile, tuned so the page matches the scrap on screen
const TONE = 251.5; // average tile brightness: keeps the page as light as the scrap

const source = `data:image/png;base64,${(await fs.readFile(SOURCE)).toString("base64")}`;
const browser = await chromium.launch();
const page = await browser.newPage();

const dataUrl = await page.evaluate(
  async ({ source, CROP, GRAIN, TONE }) => {
    const img = new Image();
    img.src = source;
    await img.decode();
    const n = CROP.size;
    const canvas = document.createElement("canvas");
    canvas.width = canvas.height = n;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, CROP.x, CROP.y, n, n, 0, 0, n, n);
    const src = ctx.getImageData(0, 0, n, n).data;

    // luminance, then keep only what is darker than the paper's light tone
    const lum = new Float32Array(n * n);
    let mean = 0;
    for (let i = 0; i < n * n; i++) {
      lum[i] = 0.299 * src[i * 4] + 0.587 * src[i * 4 + 1] + 0.114 * src[i * 4 + 2];
      mean += lum[i];
    }
    mean /= n * n;
    let sd = 0;
    for (let i = 0; i < n * n; i++) sd += (lum[i] - mean) ** 2;
    sd = Math.sqrt(sd / (n * n));
    const light = mean + 1.5 * sd;
    const dark = Array.from(lum, (l) => Math.max(0, light - l));
    const darkMean = dark.reduce((a, b) => a + b, 0) / dark.length;
    const darkSd = Math.sqrt(dark.reduce((a, b) => a + (b - darkMean) ** 2, 0) / dark.length);
    const scale = GRAIN / darkSd;
    const offset = TONE - (255 - darkMean * scale);
    for (let i = 0; i < n * n; i++) lum[i] = Math.min(255, 255 - dark[i] * scale + offset);

    // seamless: weight 1 in the middle, 0 at the edges; edges come from the half-offset copy
    const out = ctx.createImageData(n, n);
    const half = n / 2;
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < n; x++) {
        const w = Math.min(1, Math.min(x, n - 1 - x, y, n - 1 - y) / (n * 0.25));
        const shifted = lum[((y + half) % n) * n + ((x + half) % n)];
        const v = Math.max(0, Math.min(255, lum[y * n + x] * w + shifted * (1 - w)));
        const o = (y * n + x) * 4;
        out.data[o] = out.data[o + 1] = out.data[o + 2] = v;
        out.data[o + 3] = 255;
      }
    }
    ctx.putImageData(out, 0, 0);
    return canvas.toDataURL("image/png");
  },
  { source, CROP, GRAIN, TONE },
);

await browser.close();
await fs.mkdir(path.dirname(OUT), { recursive: true });
await fs.writeFile(OUT, Buffer.from(dataUrl.split(",")[1], "base64"));
console.log(`wrote ${path.relative(root, OUT)}`);
