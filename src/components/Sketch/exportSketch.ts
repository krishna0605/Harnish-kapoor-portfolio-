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

/** "Save notes": only the pencil marks, on paper, cropped to what was drawn. */
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
  const scale = Math.min(2, window.devicePixelRatio || 1);
  const width = Math.ceil(maxX - minX + MARGIN * 2);
  const height = Math.ceil(maxY - minY + MARGIN * 2 + 28);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(width * scale);
  canvas.height = Math.round(height * scale);
  const ctx = canvas.getContext("2d")!;
  await paintPaper(ctx, canvas.width, canvas.height, scale);

  // the same brush and seeds, so the marks look exactly as on the page
  const ox = minX - MARGIN;
  const oy = minY - MARGIN;
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
 * "Save view": the page exactly as on screen, with the pencil marks on top.
 * Returns false if the browser can't capture the page (then the caller saves notes).
 */
export async function saveView(sketchCanvas: HTMLCanvasElement) {
  const root = document.documentElement;
  root.setAttribute("data-capturing", "");
  try {
    const { domToCanvas } = await import("modern-screenshot");
    const scale = Math.min(2, window.devicePixelRatio || 1);
    const page = await domToCanvas(document.body, {
      width: innerWidth,
      height: innerHeight,
      scale,
      backgroundColor: "#F7F3EC",
      timeout: 4000, // never let one slow image hold the download up
      // only what is on screen: skipping the off-screen chapters keeps the capture quick
      filter: (node) => {
        if (!(node instanceof Element)) return true;
        if (node.closest("[data-sketch-ignore], [data-sketch-layer], nextjs-portal")) return false;
        const rect = node.getBoundingClientRect();
        if (!rect.width && !rect.height) return true;
        return rect.right > 0 && rect.left < innerWidth && rect.bottom > 0 && rect.top < innerHeight;
      },
    });
    const ctx = page.getContext("2d")!;
    ctx.save();
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(sketchCanvas, 0, 0, page.width, page.height);
    ctx.restore();
    await download(page, "harnish-kapoor-sketch-view.png");
    return true;
  } catch {
    return false;
  } finally {
    root.removeAttribute("data-capturing");
  }
}
