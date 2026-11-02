"use client";

import { useId, useLayoutEffect, useRef, useState } from "react";
import { seeded } from "@/components/Sketch/brush";
import styles from "./TornPaper.module.css";

type Edges = { top?: boolean; right?: boolean; bottom?: boolean; left?: boolean };

type Props = {
  /** colour of the paper face */
  color: string;
  /** same seed = same tear, every time and at every size */
  seed: number;
  /** which edges are torn (the rest are cut straight); all by default */
  edges?: Edges;
  /** how ragged the tear is (1 = fine strip, ~1.8 = big scrap) */
  roughness?: number;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
};

const BLEED = 8; // the torn outline may reach this far outside the box

/**
 * A hand-torn outline around a w×h box: each torn edge walks in small steps with random
 * in/out jitter plus a slow wobble; cut edges stay straight. `inset` pulls it inwards.
 */
function tornPath(w: number, h: number, seed: number, edges: Required<Edges>, inset: number, roughness: number) {
  const rand = seeded(seed);
  const points: [number, number][] = [];
  const side = (from: [number, number], to: [number, number], torn: boolean, normal: [number, number]) => {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    if (!torn) {
      points.push([from[0] + normal[0] * inset, from[1] + normal[1] * inset]);
      return;
    }
    const phase = rand() * Math.PI * 2;
    for (let d = 0; d < length; d += 2.5 + rand() * 3.5) {
      const t = d / length;
      const wobble = Math.sin(t * length * 0.035 + phase) * roughness * 0.6;
      const jitter = (rand() - 0.5) * 2 * roughness;
      const off = inset + Math.abs(wobble + jitter * 0.7);
      points.push([from[0] + (to[0] - from[0]) * t + normal[0] * off, from[1] + (to[1] - from[1]) * t + normal[1] * off]);
    }
  };
  // clockwise from the top-left corner; normals point inwards
  side([0, 0], [w, 0], edges.top, [0, 1]);
  side([w, 0], [w, h], edges.right, [-1, 0]);
  side([w, h], [0, h], edges.bottom, [0, -1]);
  side([0, h], [0, 0], edges.left, [1, 0]);
  return `M${points.map(([x, y]) => `${(x + BLEED).toFixed(1)} ${(y + BLEED).toFixed(1)}`).join(" L")} Z`;
}

/** A surface cut from paper like the Home collage scraps: white torn core, coloured face, grain. */
export function TornPaper({ color, seed, edges, roughness = 1, className, style, children }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w: number; h: number } | null>(null);
  const id = useId().replace(/:/g, "");
  const all = { top: true, right: true, bottom: true, left: true, ...edges };

  useLayoutEffect(() => {
    const el = ref.current!;
    const measure = () => setSize((prev) => {
      const w = Math.round(el.offsetWidth);
      const h = Math.round(el.offsetHeight);
      return prev && prev.w === w && prev.h === h ? prev : { w, h };
    });
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className ? `${styles.paper} ${className}` : styles.paper}
      style={{ "--paper-face": color, ...style } as React.CSSProperties}
    >
      {size && (
        <svg
          className={styles.shape}
          width={size.w + BLEED * 2}
          height={size.h + BLEED * 2}
          viewBox={`0 0 ${size.w + BLEED * 2} ${size.h + BLEED * 2}`}
          aria-hidden="true"
          data-torn
        >
          <defs>
            <pattern id={`grain${id}`} patternUnits="userSpaceOnUse" width="150" height="150">
              <image href="/textures/paper-grain.png" width="150" height="150" />
            </pattern>
          </defs>
          {/* the white paper core showing along the tear */}
          <path d={tornPath(size.w, size.h, seed, all, -1.5, 3.2 * roughness)} fill="#FBF8F1" />
          <path d={tornPath(size.w, size.h, seed, all, -1.5, 3.2 * roughness)} fill={`url(#grain${id})`} className={styles.grain} />
          {/* the coloured face, torn a little further in */}
          <path d={tornPath(size.w, size.h, seed + 1, all, 2.5 * roughness, 2.4 * roughness)} className={styles.face} data-face />
          <path d={tornPath(size.w, size.h, seed + 1, all, 2.5 * roughness, 2.4 * roughness)} fill={`url(#grain${id})`} className={styles.grain} />
        </svg>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
