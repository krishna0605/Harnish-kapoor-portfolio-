"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { gsap } from "@/lib/gsap";
import styles from "./Projects.module.css";

const noop = () => () => {};

/**
 * The round "OPEN" label from the design. It trails the pencil cursor while a folder in the
 * drawer is hovered (the pencil stays the cursor), and pops away when the pointer leaves.
 * Desktop pointers only; hidden in sketch mode. Rendered into <body>: the sideways track is
 * transformed, which would stop position: fixed from following the screen.
 */
export function OpenBubble({ active }: { active: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  const mounted = useSyncExternalStore(noop, () => true, () => false);

  useEffect(() => {
    const bubble = ref.current;
    if (!bubble) return;
    const toX = gsap.quickTo(bubble, "x", { duration: 0.35, ease: "power3.out" });
    const toY = gsap.quickTo(bubble, "y", { duration: 0.35, ease: "power3.out" });
    // sits below-right of the pencil tip so the tip stays visible
    const follow = (event: PointerEvent) => {
      toX(event.clientX + 18);
      toY(event.clientY + 18);
    };
    window.addEventListener("pointermove", follow);
    return () => window.removeEventListener("pointermove", follow);
  }, [mounted]);

  useEffect(() => {
    const bubble = ref.current;
    if (!bubble) return;
    gsap.to(bubble, active ? { scale: 1, autoAlpha: 1, duration: 0.4, ease: "back.out(2.2)" } : { scale: 0, autoAlpha: 0, duration: 0.25, ease: "power2.in" });
  }, [active, mounted]);

  if (!mounted) return null;
  return createPortal(
    <span ref={ref} className={styles.bubble} aria-hidden="true" data-open-bubble>
      Open
    </span>,
    document.body,
  );
}
