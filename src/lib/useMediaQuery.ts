"use client";

import { useSyncExternalStore } from "react";

/** Live match of a CSS media query; false during server rendering. */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", onChange);
      return () => media.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");
export const useFinePointer = () => useMediaQuery("(hover: hover) and (pointer: fine)");

/**
 * The About chapter is laid out as the full 3840×1080 storyboard only where it stays
 * readable (≈ 0.69 design px per CSS px or more); everything else gets the sequence layout.
 * Keep in sync with the same query in About.module.css.
 */
export const STORYBOARD_QUERY = "(orientation: landscape) and (min-width: 1325px) and (min-height: 745px)";
export const useStoryboardLayout = () => useMediaQuery(STORYBOARD_QUERY);
