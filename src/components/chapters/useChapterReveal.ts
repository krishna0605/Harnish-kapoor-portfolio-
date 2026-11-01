"use client";

import { type RefObject } from "react";
import { useChapters } from "@/components/Track/ChapterContext";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMediaQuery";

/**
 * Plays a chapter's entrance as it slides into view: title letters rise in,
 * then every [data-reveal="block"] fades up, staggered.
 */
export function useChapterReveal(ref: RefObject<HTMLElement | null>) {
  const { containerAnimation } = useChapters();
  const reduced = useReducedMotion();

  useGSAP(
    () => {
      if (reduced || !containerAnimation || !ref.current) return;
      const q = gsap.utils.selector(ref);
      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: {
            trigger: ref.current,
            containerAnimation,
            start: "left 75%",
            toggleActions: "play none none none",
          },
        })
        .fromTo(
          q("[data-letter]"),
          { autoAlpha: 0, yPercent: 55, rotate: 5 },
          { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 1, stagger: 0.03 },
          0,
        )
        .fromTo(q('[data-reveal="block"]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.2);
    },
    { scope: ref, dependencies: [reduced, containerAnimation], revertOnUpdate: true },
  );
}
