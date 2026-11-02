"use client";

import type { SketchPoint } from "./brush";

/**
 * Pencil marks for this page view only (nothing is saved: a refresh clears them).
 * Points are in track pixels at the time of drawing; `u` (px per design unit) lets
 * them rescale with the layout, and `layout` hides them in a different layout.
 */
export type Stroke = { id: number; seed: number; u: number; layout: string; points: SketchPoint[] };

export const SIZES = { fine: 2.8, medium: 4.2, bold: 7.5 } as const;
export type SketchSize = keyof typeof SIZES;

type State = {
  strokes: Stroke[];
  size: SketchSize;
  /** sketch mode: the page is locked in place and dragging draws */
  drawing: boolean;
};

let state: State = { strokes: [], size: "medium", drawing: false };
const listeners = new Set<() => void>();
let nextId = 1;

const emit = () => listeners.forEach((listener) => listener());
const set = (patch: Partial<State>) => {
  state = { ...state, ...patch };
  emit();
};

export const sketchStore = {
  get: () => state,
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  /** Starts a stroke; the caller keeps pushing points into its array. */
  begin(u: number, layout: string): Stroke {
    const stroke = { id: nextId++, seed: Math.floor(Math.random() * 2 ** 31), u, layout, points: [] };
    set({ strokes: [...state.strokes, stroke] });
    return stroke;
  },
  /** A stroke finished: tells listeners (the dock) without changing anything. */
  touch() {
    set({ strokes: [...state.strokes] });
  },
  /** Drops a stroke that never got far enough to leave a mark. */
  discard(id: number) {
    set({ strokes: state.strokes.filter((stroke) => stroke.id !== id) });
  },
  undo() {
    set({ strokes: state.strokes.slice(0, -1) });
  },
  clear() {
    set({ strokes: [] });
  },
  setSize(size: SketchSize) {
    set({ size });
  },
  setDrawing(on: boolean) {
    if (state.drawing === on) return;
    set({ drawing: on });
    document.documentElement.toggleAttribute("data-sketch-mode", on);
  },
};
