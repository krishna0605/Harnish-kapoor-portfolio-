"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { startScratch, stopScratch, updateScratch } from "@/lib/sound";
import { STORYBOARD_QUERY } from "@/lib/useMediaQuery";
import { StrokePainter, type SketchPoint } from "./brush";
import styles from "./Sketch.module.css";
import { SIZES, sketchStore, type Stroke } from "./sketchStore";

const TILE = 1024;
const START_DISTANCE = 4; // a press that moves less than this stays a click
const IGNORE = "input, textarea, select, [contenteditable='true'], [data-sketch-ignore], dialog";

/** Which layout marks belong to: they are only shown in the layout they were drawn in. */
export function currentLayout() {
  const board = window.matchMedia(STORYBOARD_QUERY).matches;
  return board ? "board" : `${innerWidth > innerHeight ? "land" : "port"}-${innerWidth < 600 ? "s" : "m"}`;
}

/** One design unit (--u) in px, measured with a probe element. */
function measureU(probe: HTMLElement) {
  return probe.getBoundingClientRect().width / 1000;
}

export function currentU() {
  const probe = document.querySelector<HTMLElement>("[data-sketch-probe]");
  return probe ? measureU(probe) : 1;
}

/**
 * The charcoal pencil layer. Marks are painted into 1024-px tiles in track coordinates
 * (so they move with the page as it scrolls sideways) and composited onto one fixed,
 * screen-sized canvas every frame. A press that moves draws; a press that doesn't is a
 * normal click.
 */
export function SketchLayer() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const probeRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const probe = probeRef.current!;
    const screen = canvas.getContext("2d")!;
    const root = document.documentElement;
    const tiles = new Map<string, { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D; x: number; y: number }>();
    let dpr = 1;
    let u = measureU(probe);
    let layout = currentLayout();
    let dirty = true;
    let lastOrigin = { x: NaN, y: NaN };

    const track = () => document.querySelector<HTMLElement>("[data-track]");
    const origin = () => {
      const rect = track()?.getBoundingClientRect();
      return { x: rect?.left ?? 0, y: rect?.top ?? 0 };
    };

    const resize = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(innerWidth * dpr);
      canvas.height = Math.round(innerHeight * dpr);
      u = measureU(probe);
      layout = currentLayout();
      rebuild();
    };

    // ---------- tiles ----------
    const tileAt = (tx: number, ty: number) => {
      const key = `${tx},${ty}`;
      let tile = tiles.get(key);
      if (!tile) {
        const c = document.createElement("canvas");
        c.width = c.height = Math.round(TILE * dpr);
        tile = { canvas: c, ctx: c.getContext("2d")!, x: tx * TILE, y: ty * TILE };
        tiles.set(key, tile);
      }
      return tile;
    };

    /** Targets for a painter: every tile within reach of the point being painted. */
    const painterFor = (stroke: Stroke) => {
      const scale = u / stroke.u; // stroke px → current px
      let near: ReturnType<typeof tileAt>[] = [];
      const painter = new StrokePainter(stroke.seed, () =>
        near.map((tile) => ({ ctx: tile.ctx, ox: tile.x / scale, oy: tile.y / scale, scale: scale * dpr })),
      );
      return {
        add(point: SketchPoint) {
          const x = point.x * scale;
          const y = point.y * scale;
          const reach = point.w * scale * 3;
          near = [];
          for (let tx = Math.floor((x - reach) / TILE); tx <= Math.floor((x + reach) / TILE); tx++)
            for (let ty = Math.floor((y - reach) / TILE); ty <= Math.floor((y + reach) / TILE); ty++) near.push(tileAt(tx, ty));
          painter.add(point);
          dirty = true;
        },
        end() {
          painter.end();
          dirty = true;
        },
      };
    };

    const rebuild = () => {
      tiles.clear();
      for (const stroke of sketchStore.get().strokes) {
        if (stroke.layout !== layout || !stroke.points.length) continue;
        const painter = painterFor(stroke);
        stroke.points.forEach((point) => painter.add(point));
        painter.end();
      }
      dirty = true;
    };

    // ---------- compositing, every frame the page or the marks moved ----------
    const composite = () => {
      const o = origin();
      if (!dirty && o.x === lastOrigin.x && o.y === lastOrigin.y) return;
      dirty = false;
      lastOrigin = o;
      screen.setTransform(1, 0, 0, 1, 0, 0);
      screen.clearRect(0, 0, canvas.width, canvas.height);
      for (const tile of tiles.values()) {
        const sx = (tile.x + o.x) * dpr;
        const sy = (tile.y + o.y) * dpr;
        const size = TILE * dpr;
        if (sx > canvas.width || sy > canvas.height || sx + size < 0 || sy + size < 0) continue;
        screen.drawImage(tile.canvas, sx, sy);
      }
    };
    gsap.ticker.add(composite);

    // ---------- input ----------
    let pending: { id: number; x: number; y: number; type: string } | null = null;
    let active: { stroke: Stroke; painter: ReturnType<typeof painterFor>; last: { x: number; y: number; t: number }; w: number } | null = null;
    let swallowClick = false;

    const canDraw = (event: PointerEvent) => {
      if (event.button !== 0 || document.querySelector("dialog[open]")) return false;
      if ((event.target as Element | null)?.closest?.(IGNORE)) return false;
      return sketchStore.get().drawing; // only in sketch mode (the pencil button)
    };

    const toWorld = (event: PointerEvent) => {
      const o = origin();
      return { x: event.clientX - o.x, y: event.clientY - o.y };
    };

    const widthFor = (event: PointerEvent, speed: number) => {
      const base = SIZES[sketchStore.get().size] * u;
      if (event.pointerType === "pen" && event.pressure > 0) return base * (0.4 + event.pressure * 1.1);
      return base * gsap.utils.clamp(0.55, 1.25, 1.25 - speed * 0.3); // faster = thinner
    };

    const onDown = (event: PointerEvent) => {
      if (!canDraw(event)) return;
      pending = { id: event.pointerId, x: event.clientX, y: event.clientY, type: event.pointerType };
      if (event.pointerType === "touch") event.preventDefault();
    };

    const begin = (event: PointerEvent) => {
      const stroke = sketchStore.begin(u, layout);
      const painter = painterFor(stroke);
      const start = toWorld({ clientX: pending!.x, clientY: pending!.y } as PointerEvent);
      const w = widthFor(event, 0);
      const first = { x: start.x, y: start.y, w };
      stroke.points.push(first);
      painter.add(first);
      active = { stroke, painter, last: { ...start, t: event.timeStamp }, w };
      pending = null;
      root.setAttribute("data-sketching", "");
      window.getSelection()?.removeAllRanges();
      try {
        (event.target as Element).setPointerCapture?.(event.pointerId);
      } catch {
        // capture is a nicety
      }
      startScratch();
    };

    const onMove = (event: PointerEvent) => {
      if (pending && event.pointerId === pending.id) {
        if (Math.hypot(event.clientX - pending.x, event.clientY - pending.y) < START_DISTANCE) return;
        begin(event);
      }
      if (!active) return;
      event.preventDefault();
      const samples = event.getCoalescedEvents?.().length ? event.getCoalescedEvents() : [event];
      for (const sample of samples) {
        const p = toWorld(sample);
        const dt = Math.max(1, sample.timeStamp - active.last.t);
        const distance = Math.hypot(p.x - active.last.x, p.y - active.last.y);
        if (distance < 1.5) continue;
        const speed = distance / dt; // px per ms
        active.w += (widthFor(sample, speed) - active.w) * 0.3;
        const point = { x: p.x, y: p.y, w: active.w };
        active.stroke.points.push(point);
        active.painter.add(point);
        active.last = { ...p, t: sample.timeStamp };
        updateScratch(speed);
      }
    };

    const onUp = () => {
      pending = null;
      if (!active) return;
      active.painter.end();
      // the stroke is final now: let the dock and others know
      sketchStore.touch();
      active = null;
      swallowClick = true;
      root.removeAttribute("data-sketching");
      stopScratch();
      setTimeout(() => (swallowClick = false), 0);
    };

    // a press that turned into a stroke must not also click a link or a stamp; and in
    // sketch mode nothing may change the page — only the toolbar (and sound) still click
    const onClick = (event: MouseEvent) => {
      const allowed = (event.target as Element | null)?.closest?.("[data-sketch-ignore], [data-sketch-allow]");
      if (!swallowClick && (!sketchStore.get().drawing || allowed)) return;
      swallowClick = false;
      event.preventDefault();
      event.stopPropagation();
    };
    const noDrag = (event: DragEvent) => event.preventDefault();
    const noSelect = (event: Event) => {
      if (active) event.preventDefault();
    };

    window.addEventListener("pointerdown", onDown, { passive: false });
    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("click", onClick, true);
    document.addEventListener("dragstart", noDrag);
    document.addEventListener("selectstart", noSelect);

    // repaint when marks change (undo / clear) or the layout changes size
    let strokeCount = sketchStore.get().strokes.length;
    const unsubscribe = sketchStore.subscribe(() => {
      const count = sketchStore.get().strokes.length;
      if (count < strokeCount) rebuild();
      strokeCount = count;
    });
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(resize, 120);
    };
    window.addEventListener("resize", onResize);
    resize();

    return () => {
      gsap.ticker.remove(composite);
      unsubscribe();
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("click", onClick, true);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("dragstart", noDrag);
      document.removeEventListener("selectstart", noSelect);
      stopScratch();
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className={styles.layer} aria-hidden="true" data-sketch-layer />
      <span ref={probeRef} className={styles.probe} aria-hidden="true" data-sketch-probe />
    </>
  );
}
