"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { HkMonogram } from "@/components/icons/HkMonogram";
import { useChapters } from "@/components/Track/ChapterContext";
import { CHAPTERS } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMediaQuery";
import styles from "./Header.module.css";
import { MobileMenu } from "./MobileMenu";

export function Header() {
  const { active, goTo } = useChapters();
  const reduced = useReducedMotion();
  const navRef = useRef<HTMLElement>(null);
  const markRef = useRef<HTMLSpanElement>(null);
  const [pill, setPill] = useState({ x: 0, width: 0 });

  // Slide the pill under the active link (and follow resizes)
  useLayoutEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const place = () => {
      const link = nav.querySelectorAll<HTMLElement>("a")[active];
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

  const onNav = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    goTo(index);
  };

  return (
    <header className={styles.header} data-header>
      <a
        href="#home"
        className={styles.brand}
        aria-label="Harnish Kapoor — home"
        onClick={(event) => onNav(event, 0)}
        onMouseEnter={spin}
        onFocus={spin}
      >
        <span ref={markRef} className={styles.brandMark} data-reveal="header">
          <HkMonogram />
        </span>
      </a>

      <nav ref={navRef} aria-label="Main" className={styles.nav}>
        <span
          aria-hidden="true"
          className={styles.indicator}
          style={{
            width: pill.width,
            transform: `translateX(${pill.x}px)`,
            backgroundColor: CHAPTERS[active].color,
          }}
        />
        {CHAPTERS.map((chapter, index) => (
          <a
            key={chapter.id}
            href={`#${chapter.id}`}
            aria-current={index === active ? "page" : undefined}
            className={styles.navLink}
            onClick={(event) => onNav(event, index)}
            data-reveal="header"
          >
            {chapter.number} {chapter.label}
          </a>
        ))}
      </nav>

      <MobileMenu active={active} onSelect={goTo} />
    </header>
  );
}
