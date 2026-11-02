"use client";

import Lenis from "lenis";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header/Header";
import { SketchDock } from "@/components/Sketch/SketchDock";
import { SketchLayer } from "@/components/Sketch/SketchLayer";
import { CHAPTERS } from "@/content/site";
import { gsap, Observer, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMediaQuery";
import { ChapterContext } from "./ChapterContext";
import styles from "./Track.module.css";

const EDITABLE = "input, textarea, select, [contenteditable='true']";

/**
 * The sideways site. The track is pinned and moved horizontally while the page
 * scrolls vertically (wheel, trackpad, touch, keyboard). Mouse drag and horizontal
 * swipes move it too. After scrolling stops it snaps to the nearest chapter start
 * (or project card), in the direction of travel.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [active, setActive] = useState(0);
  const [containerAnimation, setContainerAnimation] = useState<gsap.core.Tween | null>(null);

  // the hash the page was opened with; the URL isn't touched until the scroll setup has jumped to it
  const [openingHash] = useState(() => (typeof window === "undefined" ? "" : window.location.hash));
  const hashPending = useRef(true);

  // filled in by the GSAP setup below; stable wrappers are handed to the context
  const scrollToChapter = useRef<(index: number, immediate?: boolean) => void>(() => {});
  const goTo = useCallback((index: number, immediate?: boolean) => scrollToChapter.current(index, immediate), []);
  const setScrollLock = useRef<(locked: boolean) => void>(() => {});
  const lockScroll = useCallback((locked: boolean) => setScrollLock.current(locked), []);

  useGSAP(
    () => {
      const viewport = viewportRef.current!;
      const track = trackRef.current!;
      const chapters = gsap.utils.toArray<HTMLElement>("[data-chapter]", track);

      ScrollTrigger.config({ ignoreMobileResize: true });
      history.scrollRestoration = "manual";

      // Smooth scrolling for wheel / trackpad (touch keeps native scrolling)
      let lenis: Lenis | null = null;
      const tick = (time: number) => lenis?.raf(time * 1000);
      const lenisResize = () => lenis?.resize();
      if (!reduced) {
        lenis = new Lenis({ autoRaf: false });
        lenis.on("scroll", ScrollTrigger.update);
        ScrollTrigger.addEventListener("refresh", lenisResize);
        gsap.ticker.add(tick);
        gsap.ticker.lagSmoothing(0);
      }

      const distance = () => Math.max(0, track.scrollWidth - window.innerWidth);
      const leftOf = (el: HTMLElement) => el.getBoundingClientRect().left - track.getBoundingClientRect().left;

      let chapterX: number[] = [];
      let snapPoints: number[] = [0, 1];
      const measure = () => {
        const d = distance() || 1;
        chapterX = chapters.map((el) => Math.min(leftOf(el), d));
        const points = gsap.utils
          .toArray<HTMLElement>("[data-snap]", track)
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => Math.min(1, Math.round((leftOf(el) / d) * 10000) / 10000));
        snapPoints = [...new Set([0, ...points, 1])].sort((a, b) => a - b);
      };

      const tween = gsap.to(track, {
        x: () => -distance(),
        ease: "none",
        scrollTrigger: {
          trigger: viewport,
          start: "top top",
          end: () => `+=${distance()}`,
          pin: true,
          scrub: true,
          invalidateOnRefresh: true,
          onRefresh: measure,
          snap: {
            snapTo: (value, self) => ScrollTrigger.snapDirectional(snapPoints)(value, self?.direction),
            duration: reduced ? 0 : { min: 0.3, max: 0.8 },
            delay: 0.12,
            ease: "power2.inOut",
            inertia: false,
          },
          onUpdate: (self) => {
            const x = self.progress * distance();
            const edge = x + window.innerWidth * 0.45;
            let index = 0;
            chapterX.forEach((left, i) => {
              if (left <= edge) index = i;
            });
            setActive((prev) => (prev === index ? prev : index));
          },
        },
      });
      const trigger = tween.scrollTrigger!;
      measure();
      setContainerAnimation(tween);

      // destination of the scroll animation in progress (Lenis only reports the animated position)
      let destination: number | null = null;
      const scrollTo = (y: number, immediate = false) => {
        lenis?.resize(); // Lenis clamps to the page height it last measured
        if (!lenis || immediate) {
          destination = null;
          if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
          else window.scrollTo({ top: y, behavior: "auto" });
          return;
        }
        destination = y;
        lenis.scrollTo(y, { duration: 1.1, force: true, onComplete: () => (destination = null) });
      };
      const scrollToX = (x: number, immediate?: boolean) => scrollTo(trigger.start + Math.min(x, distance()), immediate);
      // where the scroll is heading (not where it is mid-animation), as 0–1 progress
      const targetProgress = () => {
        const y = destination ?? window.scrollY;
        return gsap.utils.clamp(0, 1, (y - trigger.start) / (trigger.end - trigger.start || 1));
      };

      // While a dialog is open the page underneath must not move
      let locked = false;
      setScrollLock.current = (on) => {
        locked = on;
        if (on) lenis?.stop();
        else lenis?.start();
        document.documentElement.style.overflow = on ? "hidden" : "";
      };

      scrollToChapter.current = (index, immediate) => {
        measure();
        scrollToX(chapterX[index] ?? 0, immediate);
      };

      // ← → keys move between snap points
      const onKey = (event: KeyboardEvent) => {
        if (locked) return;
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        if ((event.target as Element | null)?.closest?.(EDITABLE)) return;
        event.preventDefault();
        const progress = targetProgress();
        const next =
          event.key === "ArrowRight"
            ? snapPoints.find((p) => p > progress + 0.001)
            : [...snapPoints].reverse().find((p) => p < progress - 0.001);
        if (next !== undefined) scrollToX(next * distance());
      };
      window.addEventListener("keydown", onKey);

      // in-page hash links (#about, #experience, …) scroll to their chapter
      const onHash = () => {
        const index = CHAPTERS.findIndex((c) => `#${c.id}` === window.location.hash);
        if (index >= 0) scrollToChapter.current(index);
      };
      window.addEventListener("hashchange", onHash);

      // Tabbing into something off-screen brings it into view
      const onFocus = (event: FocusEvent) => {
        const target = event.target as HTMLElement;
        const rect = target.getBoundingClientRect();
        if (rect.left >= 0 && rect.right <= window.innerWidth) return;
        const anchor = target.closest<HTMLElement>("[data-snap]") ?? target.closest<HTMLElement>("[data-chapter]");
        if (anchor) scrollToX(leftOf(anchor), reduced);
      };
      viewport.addEventListener("focusin", onFocus);

      // Horizontal finger swipes: the track follows the finger from where the press started,
      // then snaps onward. (A mouse drag draws with the pencil instead — see SketchLayer.)
      let dragged = 0;
      let pressY = 0;
      const observer = Observer.create({
        target: viewport,
        type: "pointer",
        lockAxis: true,
        dragMinimum: 4,
        onPress: () => {
          dragged = 0;
          pressY = window.scrollY;
          destination = null;
        },
        onDrag: (self) => {
          if (locked) return;
          if ((self.event as PointerEvent).pointerType !== "touch") return; // mouse / pen draw
          if (document.documentElement.hasAttribute("data-touch-drawing")) return; // finger draws
          if (self.axis !== "x") return; // vertical swipes scroll natively
          const dx = self.x! - self.startX!;
          dragged = Math.abs(dx);
          const y = gsap.utils.clamp(trigger.start, trigger.end, pressY - dx * 1.8);
          if (lenis) lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        },
        onDragEnd: (self) => {
          if (dragged < 6) return;
          const direction = self.x! < self.startX! ? 1 : -1;
          const next = ScrollTrigger.snapDirectional(snapPoints)(targetProgress(), direction);
          scrollToX(next * distance());
        },
      });
      const blockClickAfterDrag = (event: MouseEvent) => {
        if (dragged > 6) {
          event.preventDefault();
          event.stopPropagation();
          dragged = 0;
        }
      };
      viewport.addEventListener("click", blockClickAfterDrag, true);

      // Recalculate once fonts and images have settled, then honour a deep link
      // (#about, #projects, #contact) — after the browser's own anchor jump is done
      let alive = true;
      const loaded = new Promise<void>((resolve) =>
        document.readyState === "complete" ? resolve() : window.addEventListener("load", () => resolve(), { once: true }),
      );
      Promise.all([document.fonts?.ready, loaded]).then(() => {
        if (!alive) return;
        ScrollTrigger.refresh();
        if (!hashPending.current) return;
        hashPending.current = false;
        const fromHash = CHAPTERS.findIndex((c) => `#${c.id}` === openingHash);
        if (fromHash > 0) scrollToChapter.current(fromHash, true);
      });

      return () => {
        alive = false;
        window.removeEventListener("keydown", onKey);
        window.removeEventListener("hashchange", onHash);
        viewport.removeEventListener("focusin", onFocus);
        viewport.removeEventListener("click", blockClickAfterDrag, true);
        observer.kill();
        ScrollTrigger.removeEventListener("refresh", lenisResize);
        gsap.ticker.remove(tick);
        lenis?.destroy();
        setContainerAnimation(null);
      };
    },
    { dependencies: [reduced], revertOnUpdate: true },
  );

  // Keep the URL in step with the chapter in view (not before a deep link has been honoured)
  useEffect(() => {
    if (hashPending.current && openingHash) return;
    const id = CHAPTERS[active]?.id;
    const url = id === "home" ? window.location.pathname : `#${id}`;
    if (url !== window.location.pathname + window.location.hash) history.replaceState(null, "", url);
  }, [active, openingHash]);

  const value = useMemo(() => ({ active, goTo, containerAnimation, lockScroll }), [active, goTo, containerAnimation, lockScroll]);

  return (
    <ChapterContext.Provider value={value}>
      <Header />
      <main>
        <div ref={viewportRef} className={styles.viewport}>
          <div ref={trackRef} className={styles.track} data-track>
            {children}
          </div>
        </div>
      </main>
      <SketchLayer />
      <SketchDock />
    </ChapterContext.Provider>
  );
}
