"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { HkMonogram } from "@/components/icons/HkMonogram";
import { useChapters } from "@/components/Track/ChapterContext";
import { CHAPTERS } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { useReducedMotion, useStoryboardLayout } from "@/lib/useMediaQuery";
import styles from "./Header.module.css";
import { MobileMenu } from "./MobileMenu";
import { SoundToggle } from "./SoundToggle";

export function Header() {
  const { active, goTo } = useChapters();
  const reduced = useReducedMotion();
  const storyboard = useStoryboardLayout();
  // About opens with a 72px "← Home" strip on its left edge; the logo steps aside for it
  const besideStrip = storyboard && CHAPTERS[active]?.id === "about";
  const navRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const [pill, setPill] = useState({ x: 0, width: 0 });

  // Slide the pill under the active link (and follow resizes)
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = () => {
      const link = nav.querySelectorAll<HTMLElement>("button")[active];
      if (link) setPill({ x: link.offsetLeft, width: link.offsetWidth });
    };
    place();
    const observer = new ResizeObserver(place);
    observer.observe(nav);
    return () => observer.disconnect();
  }, [active]);

  const spin = () => {
    if (reduced || !markRef.current) return;
    gsap.fromTo(markRef.current, { rotation: 0 }, { rotation: 360, duration: 0.7, ease: "back.out(1.6)", overwrite: true });
  };

  return (
    <header className={besideStrip ? `${styles.header} ${styles.besideStrip}` : styles.header} data-header>
      <button
        type="button"
        data-go="home"
        className={styles.brand}
        aria-label="Harnish Kapoor — home"
        onClick={() => goTo(0)}
        onMouseEnter={spin}
        onFocus={spin}
      >
        <span ref={markRef} className={styles.brandMark} data-reveal="header">
          <HkMonogram />
        </span>
      </button>

      <div className={styles.right}>
      <nav ref={navRef} aria-label="Main" className={styles.nav}>
        <span
          aria-hidden="true"
          className={styles.indicator}
          style={{
            width: pill.width,
            transform: `translateX(${pill.x}px)`,
            backgroundColor: CHAPTERS[active].pill ?? CHAPTERS[active].color,
          }}
        />
        {CHAPTERS.map((chapter, index) => (
          <button
            type="button"
            key={chapter.id}
            data-go={chapter.id}
            aria-current={index === active ? "page" : undefined}
            className={styles.navLink}
            onClick={() => goTo(index)}
            data-reveal="header"
          >
            {/* the label rolls up on hover; the copy below it is decorative */}
            <span className={styles.roll}>
              <span className={styles.rollText}>
                {chapter.number} {chapter.label}
              </span>
              <span className={styles.rollText} aria-hidden="true">
                {chapter.number} {chapter.label}
              </span>
            </span>
          </button>
        ))}
      </nav>

      <MobileMenu active={active} onSelect={goTo} />
      <SoundToggle />
      </div>
    </header>
  );
}
