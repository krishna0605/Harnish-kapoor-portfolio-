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
 * The About chapter is laid out as the full 4500×1080 storyboard (and Projects as its desk)
 * wherever that still reads (≈ 0.55 design px per CSS px or more, with px floors on the
 * smallest text); everything else gets the sequence layout, which needs far more scrolling.
 * Keep in sync with the same query in About, Stamp, Projects and Folder .module.css.
 */
export const STORYBOARD_QUERY = "(orientation: landscape) and (min-width: 1100px) and (min-height: 640px)";
export const useStoryboardLayout = () => useMediaQuery(STORYBOARD_QUERY);
