"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { useChapters } from "@/components/Track/ChapterContext";
import { playSound } from "@/lib/sound";
import { useMediaQuery } from "@/lib/useMediaQuery";
import { saveNotes, saveView } from "./exportSketch";
import { currentLayout, currentU } from "./SketchLayer";
import styles from "./Sketch.module.css";
import { SIZES, sketchStore, type SketchSize } from "./sketchStore";

const SIZE_LABELS: Record<SketchSize, string> = { fine: "Fine", medium: "Medium", bold: "Bold" };

/** The pencil's toolbox: size, undo, clear, and the two PNG downloads. */
export function SketchDock() {
  const state = useSyncExternalStore(sketchStore.subscribe, sketchStore.get, sketchStore.get);
  const touch = useMediaQuery("(pointer: coarse)");
  const [confirming, setConfirming] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<number | undefined>(undefined);

  const marks = state.strokes.filter((stroke) => stroke.points.length && stroke.layout === currentLayout()).length;
  const drawing = state.drawing;
  // tools show in sketch mode, and afterwards while there are marks to save or clear
  const expanded = drawing || marks > 0;
  const { lockScroll } = useChapters();

  // sketch mode freezes the page: no scrolling, no keys, no drag (clicks are blocked in SketchLayer)
  useEffect(() => {
    lockScroll(drawing);
  }, [drawing, lockScroll]);

  const say = (message: string) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2600);
  };

  // Ctrl / Cmd + Z undoes the last mark
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === "z") {
        if ((event.target as Element | null)?.closest?.("input, textarea")) return;
        if (!sketchStore.get().strokes.length) return;
        event.preventDefault();
        sketchStore.undo();
      }
      if (event.key === "Escape") {
        setConfirming(false);
        sketchStore.setDrawing(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const onPencil = () => {
    const on = !drawing;
    sketchStore.setDrawing(on);
    playSound(on ? "quick" : "slide", { volume: 0.5 });
    if (!on) say(touch ? "Scrolling again" : "Back to browsing");
  };

  const onClear = () => {
    sketchStore.clear();
    setConfirming(false);
    playSound("slide", { volume: 0.6 });
  };

  const onSaveNotes = async () => {
    if (!(await saveNotes(currentLayout(), currentU()))) say("Draw something first");
  };

  const onSaveView = async () => {
    const layer = document.querySelector<HTMLCanvasElement>("[data-sketch-layer]");
    if (!layer) return;
    await saveView(layer);
  };

  return (
    <div className={styles.dock} data-sketch-ignore data-expanded={expanded || undefined} data-drawing={drawing || undefined}>
      {drawing && (
        <div className={styles.modePill} role="status">
          Sketch mode · page paused · {touch ? "tap the pencil to exit" : "Esc or the pencil to exit"}
        </div>
      )}
      <button
        type="button"
        className={styles.pencil}
        aria-label={drawing ? "Stop sketching" : "Sketch on the page"}
        aria-pressed={drawing}
        title={drawing ? "Stop sketching" : "Sketch on the page"}
        onClick={onPencil}
      >
        <svg viewBox="0 0 32 32" aria-hidden="true">
          <g stroke="#2A2733" strokeWidth="1.6" strokeLinejoin="round">
            <path d="M24.5 3.5 L28.5 7.5 L11 25 L7 21 Z" fill="#F7DDA4" />
            <path d="M24.5 3.5 L26.6 1.4 Q27.6 0.5 28.6 1.4 L30.6 3.4 Q31.5 4.4 30.6 5.4 L28.5 7.5 Z" fill="#F5C9C6" />
            <path d="M7 21 L11 25 L4.5 27.6 Z" fill="#FFFDF6" />
          </g>
          <path className={styles.pencilTip} d="M4.6 27.5 L2 30 L3.4 26.4 Z" fill="#2A2733" />
        </svg>
      </button>

      <div className={styles.tools} aria-hidden={!expanded} inert={!expanded}>
        <div className={styles.sizes} role="radiogroup" aria-label="Pencil size">
          {(Object.keys(SIZES) as SketchSize[]).map((size) => (
            <button
              key={size}
              type="button"
              role="radio"
              aria-checked={state.size === size}
              aria-label={`${SIZE_LABELS[size]} pencil`}
              title={SIZE_LABELS[size]}
              className={styles.size}
              onClick={() => sketchStore.setSize(size)}
            >
              <span style={{ width: SIZES[size] * 2.2, height: SIZES[size] * 2.2 }} />
            </button>
          ))}
        </div>
        <span className={styles.divider} />
        <button type="button" className={styles.tool} onClick={() => sketchStore.undo()} disabled={!marks} aria-label="Undo last mark" title="Undo (Ctrl+Z)">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M9 7 L4 12 L9 17 M4.5 12 H14 Q20 12 20 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <div className={styles.clearWrap}>
          <button
            type="button"
            className={styles.tool}
            onClick={() => setConfirming((value) => !value)}
            disabled={!marks}
            aria-label="Clear all drawings"
            aria-expanded={confirming}
            title="Clear"
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 15 L12 7 L18 13 L13 18 H7 Z M10 9 L16 15 M7 18 H20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {confirming && (
            <div className={styles.confirm} role="dialog" aria-label="Clear all drawings?">
              <span>Clear all drawings?</span>
              <button type="button" className={styles.confirmYes} onClick={onClear}>
                Clear
              </button>
              <button type="button" className={styles.confirmNo} onClick={() => setConfirming(false)}>
                Keep
              </button>
            </div>
          )}
        </div>
        <span className={styles.divider} />
        <button type="button" className={styles.save} onClick={onSaveView} disabled={!marks} aria-label="Save view as PNG" title="Your marks where you drew them, with the logo">
          Save view
        </button>
        <button type="button" className={styles.save} onClick={onSaveNotes} disabled={!marks} aria-label="Save notes as PNG" title="Just your marks, cropped, with the logo">
          Save notes
        </button>
      </div>

      {toast && (
        <div className={styles.toast} role="status">
          {toast}
        </div>
      )}
    </div>
  );
}
