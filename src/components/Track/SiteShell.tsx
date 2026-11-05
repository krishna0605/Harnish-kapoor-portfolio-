"use client";

import Lenis from "lenis";
import { useCallback, useMemo, useRef, useState } from "react";
import { Header } from "@/components/Header/Header";
import { SketchDock } from "@/components/Sketch/SketchDock";
import { SketchLayer } from "@/components/Sketch/SketchLayer";
import { CHAPTERS } from "@/content/site";
import { gsap, Observer, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMediaQuery";
import { ChapterContext } from "./ChapterContext";
import styles from "./Track.module.css";

const EDITABLE = "input, textarea, select, [contenteditable='true']";

// The address bar only ever shows the site itself: chapters never put #about etc. in the URL.
// An old link opened with a hash is remembered here, wiped from the address as soon as the
// page is set up, and honoured once the scroll setup is ready.
const openingHash = typeof window === "undefined" ? "" : window.location.hash;

/** Removes any #… from the address bar without adding a history entry. */
function clearHash() {
  if (window.location.hash) history.replaceState(null, "", window.location.pathname + window.location.search);
}

/**
 * The sideways site. The track is pinned and moved horizontally while the page
 * scrolls vertically (wheel, trackpad, touch, keyboard). Mouse drag and horizontal
 * swipes move it too, gliding on a little after a quick release. Wherever scrolling
 * stops, the track stays: nothing snaps. Only deliberate moves jump to a place: the
 * nav (goTo), the ← → keys stepping through [data-snap] stops, and tabbing to
 * something off-screen.
 */
export function SiteShell({ children }: { children: React.ReactNode }) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const [active, setActive] = useState(0);
  const [containerAnimation, setContainerAnimation] = useState<gsap.core.Tween | null>(null);

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
      clearHash();

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
      let stops: number[] = [0, 1]; // [data-snap] positions as 0–1 progress, for the ← → keys
      const measure = () => {
        const d = distance() || 1;
        chapterX = chapters.map((el) => Math.min(leftOf(el), d));
        const points = gsap.utils
          .toArray<HTMLElement>("[data-snap]", track)
          .filter((el) => el.getClientRects().length > 0)
          .map((el) => Math.min(1, Math.round((leftOf(el) / d) * 10000) / 10000));
        stops = [...new Set([0, ...points, 1])].sort((a, b) => a - b);
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

      // ← → keys move between stops
      const onKey = (event: KeyboardEvent) => {
        if (locked) return;
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
        if ((event.target as Element | null)?.closest?.(EDITABLE)) return;
        event.preventDefault();
        const progress = targetProgress();
        const next =
          event.key === "ArrowRight"
            ? stops.find((p) => p > progress + 0.001)
            : [...stops].reverse().find((p) => p < progress - 0.001);
        if (next !== undefined) scrollToX(next * distance());
      };
      window.addEventListener("keydown", onKey);

      // a typed or pasted #about, #contact, … still scrolls to its chapter; the address is then wiped
      const onHash = () => {
        const index = CHAPTERS.findIndex((c) => `#${c.id}` === window.location.hash);
        clearHash();
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

      // Mouse drag and horizontal swipes: the track follows the pointer from where the press
      // started; a quick release glides on a little and eases to a stop, a slow one just stops.
      // In sketch mode the page is locked and drags draw instead.
      let dragged = 0;
      let pressY = 0;
      let dragScale = 1; // scroll px per pointer px for the drag in progress
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
          const mouse = (self.event as PointerEvent).pointerType === "mouse";
          if (!mouse && self.axis !== "x") return; // vertical swipes scroll natively
          if (mouse) track.classList.add(styles.dragging);
          const dx = self.x! - self.startX!;
          dragged = Math.abs(dx);
          dragScale = mouse ? 1.4 : 1.8;
          const y = gsap.utils.clamp(trigger.start, trigger.end, pressY - dx * dragScale);
          if (lenis) lenis.scrollTo(y, { immediate: true });
          else window.scrollTo(0, y);
        },
        onDragEnd: (self) => {
          track.classList.remove(styles.dragging);
          if (dragged < 6 || locked || !lenis) return;
          // the track's speed at release, in scroll px per second
          const speed = -self.velocityX * dragScale;
          if (Math.abs(speed) < 300) return; // a slow release just stops
          // an ease-out-cubic glide starts at 3 × distance / duration, i.e. at the release speed;
          // it goes at most one screen and never past either end of the track
          const duration = 0.75;
          const from = window.scrollY;
          const throwBy = gsap.utils.clamp(-window.innerWidth, window.innerWidth, (speed * duration) / 3);
          const y = gsap.utils.clamp(trigger.start, trigger.end, from + throwBy);
          if (Math.abs(y - from) < 1) return;
          destination = y;
          lenis.scrollTo(y, {
            duration,
            easing: (t) => 1 - (1 - t) ** 3,
            force: true,
            onComplete: () => (destination = null),
          });
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

      // Recalculate once fonts and images have settled, then honour an old deep link
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
