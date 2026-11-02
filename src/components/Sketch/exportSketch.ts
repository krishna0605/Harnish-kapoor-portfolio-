"use client";

import { StrokePainter } from "./brush";
import { sketchStore } from "./sketchStore";

const MARGIN = 48;

function download(canvas: HTMLCanvasElement, filename: string) {
  return new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.dataset.sketchAllow = ""; // sketch mode blocks clicks, but not this one
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      resolve();
    }, "image/png");
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

/** Fills a canvas with rice paper and the collage paper texture. */
async function paintPaper(ctx: CanvasRenderingContext2D, width: number, height: number, scale: number) {
  ctx.fillStyle = "#F7F3EC";
  ctx.fillRect(0, 0, width, height);
  try {
    const texture = await loadImage("/textures/paper-grain.png");
    const pattern = ctx.createPattern(texture, "repeat")!;
    pattern.setTransform(new DOMMatrix().scale(scale * 0.5));
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = pattern;
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
  } catch {
    // plain paper colour if the texture can't load
  }
}

/** The HK logo (the same file as the favicon), drawn into an export. */
async function paintLogo(ctx: CanvasRenderingContext2D, x: number, y: number, size: number) {
  try {
    const logo = await loadImage("/icon.svg");
    ctx.drawImage(logo, x, y, size, size);
  } catch {
    // the marks are still saved without it
  }
}

/** On-screen box of the header logo, so "Save view" puts it exactly where it was. */
function logoBox() {
  const mark = document.querySelector("[data-header] a[aria-label^='Harnish Kapoor'] span")?.getBoundingClientRect();
  return mark && mark.width ? { x: mark.left, y: mark.top, size: mark.width } : { x: 24, y: 24, size: 60 };
}

/**
 * Downloads contain ONLY the pencil layer and the HK logo, on plain paper. Nothing from
 * the page itself (text, photos, artwork) is ever captured.
 */

/** "Save notes": just the marks, cropped to what was drawn, with the logo top-left. */
export async function saveNotes(layout: string, u: number) {
  const strokes = sketchStore.get().strokes.filter((stroke) => stroke.layout === layout && stroke.points.length);
  if (!strokes.length) return false;
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const stroke of strokes) {
    const k = u / stroke.u;
    for (const p of stroke.points) {
      minX = Math.min(minX, (p.x - p.w * 2) * k);
      minY = Math.min(minY, (p.y - p.w * 2) * k);
      maxX = Math.max(maxX, (p.x + p.w * 2) * k);
      maxY = Math.max(maxY, (p.y + p.w * 2) * k);
    }
  }
  const LOGO = 48;
  const top = MARGIN + LOGO + 24; // room for the logo above the marks
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.ceil(Math.max(maxX - minX + MARGIN * 2, 320));
  const height = Math.ceil(maxY - minY + top + MARGIN + 28);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  await paintPaper(ctx, canvas.width, canvas.height, scale);
  await paintLogo(ctx, MARGIN * scale, MARGIN * scale, LOGO * scale);

  // the same brush and seeds, so the marks look exactly as on the page
  const ox = minX - MARGIN;
  const oy = minY - top;
  for (const stroke of strokes) {
    const k = u / stroke.u;
    const painter = new StrokePainter(stroke.seed, () => [{ ctx, ox: ox / k, oy: oy / k, scale: k * scale }]);
    stroke.points.forEach((point) => painter.add(point));
    painter.end();
  }

  ctx.fillStyle = "rgba(42, 39, 51, 0.6)";
  ctx.font = `${11 * scale}px "DM Mono", monospace`;
  const date = new Date().toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  ctx.fillText(`NOTES ON HARNISH KAPOOR'S PORTFOLIO · ${date.toUpperCase()}`, MARGIN * scale, (height - 22) * scale);
  await download(canvas, "harnish-kapoor-notes.png");
  return true;
}

/**
 * "Save view": the screen as a blank sheet of paper with the marks exactly where they
 * were drawn and the logo where it sits in the header.
 */
export async function saveView(sketchCanvas: HTMLCanvasElement) {
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(innerWidth * scale);
  canvas.height = Math.round(innerHeight * scale);
  const ctx = canvas.getContext("2d")!;
  await paintPaper(ctx, canvas.width, canvas.height, scale);
  ctx.save();
  ctx.globalCompositeOperation = "multiply";
  ctx.drawImage(sketchCanvas, 0, 0, canvas.width, canvas.height);
  ctx.restore();
  const logo = logoBox();
  await paintLogo(ctx, logo.x * scale, logo.y * scale, logo.size * scale);
  await download(canvas, "harnish-kapoor-sketch-view.png");
  return true;
}
