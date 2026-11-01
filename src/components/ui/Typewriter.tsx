"use client";

import { useEffect, useMemo, useState } from "react";
import { useReducedMotion } from "@/lib/useMediaQuery";
import styles from "./ui.module.css";

export type TypeSegment = { text: string; className?: string };
export type TypeLine = TypeSegment[];

type Phase = "waiting" | "typing" | "holding" | "deleting";

/** The first `shown` characters of the lines (a line break counts as one), and the caret's line. */
function sliceLines(lines: TypeLine[], shown: number) {
  let remaining = shown;
  let caretLine = 0;
  const visibleLines: TypeLine[] = [];
  lines.forEach((line, lineIndex) => {
    visibleLines.push(
      line.map((seg) => {
        const take = Math.max(0, Math.min(seg.text.length, remaining));
        remaining -= take;
        return { ...seg, text: seg.text.slice(0, take) };
      }),
    );
    if (lineIndex < lines.length - 1 && remaining > 0) {
      remaining -= 1;
      caretLine = lineIndex + 1;
    }
  });
  return { visibleLines, caretLine };
}

type Props = {
  lines: TypeLine[];
  /** ms before the first characters appear */
  startDelay?: number;
  /** stop advancing (e.g. while the chapter is off-screen); resumes where it left off */
  paused?: boolean;
  typeMs?: number;
  deleteMs?: number;
  holdMs?: number;
  gapMs?: number;
};

/**
 * Types its lines, holds, deletes them and types again. An invisible copy of the
 * full text reserves the space, so nothing around it moves. Screen readers get the
 * full text once. With reduced motion the full text is shown, without a loop.
 */
export function Typewriter({
  lines,
  startDelay = 0,
  paused = false,
  typeMs = 55,
  deleteMs = 25,
  holdMs = 3000,
  gapMs = 600,
}: Props) {
  const reduced = useReducedMotion();
  // a line break counts as one step, so the caret visibly moves to the next line
  const total = useMemo(
    () => lines.reduce((sum, line) => sum + line.reduce((n, seg) => n + seg.text.length, 0), 0) + lines.length - 1,
    [lines],
  );

  // Server render and first paint show the full text (also the no-JS state)
  const [count, setCount] = useState(total);
  const [phase, setPhase] = useState<Phase>("holding");
  const [started, setStarted] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Clear the text, then begin after the start delay
  useEffect(() => {
    if (reduced) return;
    const reset = setTimeout(() => {
      setCount(0);
      setPhase("waiting");
    }, 0);
    const start = setTimeout(() => setStarted(true), startDelay);
    return () => {
      clearTimeout(reset);
      clearTimeout(start);
    };
  }, [reduced, startDelay]);

  useEffect(() => {
    if (reduced || !started || paused || hidden) return;
    let delay: number;
    let step: () => void;
    if (phase === "waiting") {
      delay = gapMs;
      step = () => setPhase("typing");
    } else if (phase === "typing") {
      delay = typeMs * (0.6 + Math.random() * 0.8);
      step = () => (count + 1 >= total ? (setCount(total), setPhase("holding")) : setCount(count + 1));
    } else if (phase === "holding") {
      delay = holdMs;
      step = () => setPhase("deleting");
    } else {
      delay = deleteMs;
      step = () => (count - 1 <= 0 ? (setCount(0), setPhase("waiting")) : setCount(count - 1));
    }
    const timer = setTimeout(step, delay);
    return () => clearTimeout(timer);
  }, [reduced, started, paused, hidden, phase, count, total, typeMs, deleteMs, holdMs, gapMs]);

  const { visibleLines, caretLine } = sliceLines(lines, reduced ? total : count);

  const renderLine = (line: TypeLine, index: number, withCaret: boolean) => (
    <span key={index} className={styles.typeLine}>
      {line.map((seg, i) => (
        <span key={i} className={seg.className}>
          {seg.text}
        </span>
      ))}
      {withCaret && (
        <span className={`${styles.caret} ${phase === "typing" || phase === "deleting" ? "" : styles.caretBlink}`} />
      )}
    </span>
  );

  const fullText = lines.map((line) => line.map((seg) => seg.text).join("")).join(" ");

  return (
    <span className={styles.typewriter}>
      <span className="sr-only">{fullText}</span>
      <span className={styles.typeSizer} aria-hidden="true">
        {lines.map((line, i) => renderLine(line, i, false))}
      </span>
      <span className={styles.typeText} aria-hidden="true">
        {visibleLines.map((line, i) => renderLine(line, i, !reduced && i === caretLine))}
      </span>
    </span>
  );
}
