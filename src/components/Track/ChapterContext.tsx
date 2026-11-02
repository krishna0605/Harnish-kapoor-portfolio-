"use client";

import { createContext, useContext } from "react";

export type ChapterState = {
  /** Index of the chapter currently in view (see CHAPTERS). */
  active: number;
  /** Scrolls to a chapter by index. */
  goTo: (index: number, immediate?: boolean) => void;
  /** The horizontal scroll tween — chapters use it as containerAnimation for their reveals. */
  containerAnimation: gsap.core.Tween | null;
  /** Freezes the sideways scroll (wheel, keys, drag) while a dialog is open. */
  lockScroll: (locked: boolean) => void;
};

export const ChapterContext = createContext<ChapterState>({
  active: 0,
  goTo: () => {},
  containerAnimation: null,
  lockScroll: () => {},
});

export const useChapters = () => useContext(ChapterContext);
