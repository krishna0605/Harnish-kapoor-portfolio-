"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ArrowLong } from "@/components/icons/Arrows";
import { useChapters } from "@/components/Track/ChapterContext";
import { Typewriter } from "@/components/ui/Typewriter";
import { ABOUT, chapterIndex } from "@/content/site";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { mediaUrl } from "@/lib/media";
import { playSound } from "@/lib/sound";
import { useReducedMotion, useStoryboardLayout } from "@/lib/useMediaQuery";
import styles from "./About.module.css";
import { Postmark } from "./Postmark";
import { EnvelopeDialog } from "./EnvelopeDialog";
import { StampDialog } from "./StampDialog";
import { StoryCard } from "./StoryCard";

const ABOUT_INDEX = chapterIndex("about");
const STORY_INDEX = chapterIndex("experience");

// story line on the 3840×1080 board — the export's dashed wave and its markers
const LINE =
  "M1236 578 C 1307 532 1369 624 1440 578 C 1556 624 1654 532 1770 578 C 1886 532 1984 624 2100 578 C 2216 624 2314 532 2430 578 C 2546 532 2644 624 2760 578 C 2876 624 2974 532 3090 578 C 3160 532 3220 624 3290 578";
const MARKERS = [
  { x: 1440, up: true },
  { x: 1770, up: false },
  { x: 2100, up: true },
  { x: 2430, up: false },
  { x: 2760, up: true },
  { x: 3090, up: false, now: true },
];
const LINE_START = 1236;
const LINE_LENGTH = 2080;

/** Chapter 02 — About: "Frame by frame." The storyboard is also "03 Experience" in the nav. */
export function About() {
  const ref = useRef<HTMLElement>(null);
  const { active, containerAnimation, goTo } = useChapters();
  const reduced = useReducedMotion();
  const storyboard = useStoryboardLayout();
  const inView = active === ABOUT_INDEX || active === STORY_INDEX;

  const [focused, setFocused] = useState<number | null>(null);
  const [touchFocus, setTouchFocus] = useState(false);
  const [opened, setOpened] = useState<number | null>(null);
  const [stampOpen, setStampOpen] = useState(false);
  const hoverTimer = useRef<number | undefined>(undefined);
  const lastFocused = useRef<number | null>(null);
  // the click event does not reliably say whether it came from a finger (iOS never does)
  const lastPointer = useRef("mouse");

  // ---------- focus: the card comes forward, everything else blurs ----------
  const focusCard = (index: number | null, touch = false) => {
    setTouchFocus(touch);
    setFocused(index);
    if (index !== null) playSound("quick", { volume: 0.3, throttle: 400 });
  };

  const onEnter = (index: number) => (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => focusCard(index), 120); // hover intent
  };
  const onLeave = (index: number) => (event: React.PointerEvent) => {
    if (event.pointerType !== "mouse") return;
    window.clearTimeout(hoverTimer.current);
    setFocused((current) => (current === index ? null : current));
  };
  // touch: first tap focuses, second tap opens. Mouse / keyboard: click opens.
  const onActivate = (index: number) => (event: React.MouseEvent<HTMLButtonElement>) => {
    const touch = lastPointer.current === "touch" && event.detail > 0;
    if (touch && focused !== index) {
      focusCard(index, true);
      return;
    }
    window.clearTimeout(hoverTimer.current);
    setFocused(null);
    setOpened(index);
  };
  const onKeyFocus = (index: number) => (event: React.FocusEvent<HTMLButtonElement>) => {
    if (event.currentTarget.matches(":focus-visible")) focusCard(index);
  };
  const onKeyBlur = (index: number) => () => setFocused((current) => (current === index ? null : current));

  // a tap anywhere outside the focused card lets it go
  useEffect(() => {
    if (focused === null || !touchFocus) return;
    const onDown = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.(`[data-card="${focused}"]`)) setFocused(null);
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, [focused, touchFocus]);

  // lift the newly focused card, settle the one that was focused
  useGSAP(
    () => {
      const previous = lastFocused.current;
      lastFocused.current = focused;
      const cards = gsap.utils.toArray<HTMLElement>("[data-card]", ref.current);
      [previous, focused].forEach((index) => {
        if (index === null || index === undefined || !cards[index]) return;
        const on = index === focused;
        gsap.to(cards[index], {
          scale: on ? 1.06 : 1,
          rotation: on ? 0 : ABOUT.scenes[index].tilt,
          "--shadow": on ? 12 : 6,
          duration: reduced ? 0 : on ? 0.5 : 0.4,
          ease: on ? "back.out(1.6)" : "power3.out",
          overwrite: "auto",
        });
      });
    },
    { scope: ref, dependencies: [focused, reduced] },
  );

  // ---------- reveals tied to the sideways scroll ----------
  useGSAP(
    () => {
      if (reduced || !containerAnimation || !ref.current) return;
      const q = gsap.utils.selector(ref);
      const enter = (trigger: Element, start = "left 88%") => ({
        trigger,
        containerAnimation,
        start,
        toggleActions: "play none none none",
      });

      // intro: bio and chips, then the portrait stamp drops in (the postmark stays still)
      gsap
        .timeline({ scrollTrigger: enter(ref.current, "left 70%"), defaults: { ease: "expo.out" } })
        .fromTo(q('[data-reveal="bio"]'), { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.1)
        .fromTo(q('[data-reveal="chip"]'), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.08, ease: "back.out(2)" }, 0.3)
        .fromTo(q('[data-reveal="hint"]'), { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.7 }, 0.6)
        .fromTo(
          q('[data-reveal="stamp"]'),
          { autoAlpha: 0, y: -70, rotation: 16 },
          { autoAlpha: 1, y: 0, rotation: 4, duration: 1.1, ease: "back.out(1.3)", clearProps: "transform" },
          0.2,
        )

      // each stamp drops onto the board, then its tapes slap on
      q("[data-card]").forEach((card, index) => {
        const tilt = ABOUT.scenes[index].tilt;
        gsap
          .timeline({ scrollTrigger: enter(card) })
          .fromTo(card, { autoAlpha: 0, y: -40, rotation: tilt + 6 }, { autoAlpha: 1, y: 0, rotation: tilt, duration: 0.9, ease: "back.out(1.4)" })
          .fromTo(card.querySelectorAll("[data-tape]"), { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.08, ease: "power2.out" }, "-=0.3");
      });

      // toolkit tags pop in, the closing line rises
      const toolkit = q("[data-toolkit]")[0];
      gsap
        .timeline({ scrollTrigger: enter(toolkit, "left 90%"), defaults: { ease: "expo.out" } })
        .fromTo(toolkit, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8 })
        .fromTo(q('[data-reveal="tool"]'), { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.4, stagger: 0.03, ease: "back.out(2)" }, 0.2)
        .fromTo(q('[data-reveal="closing"]'), { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.12 }, 0.35);

      // the story line unrolls as the board slides past; markers pop as it reaches them
      if (storyboard) {
        const wipe = q("[data-line-wipe]")[0];
        const markers = q("[data-marker]");
        const width = ref.current.getBoundingClientRect().width;
        q("[data-line]")[0]?.setAttribute("data-wiping", "");
        ScrollTrigger.create({
          trigger: ref.current,
          containerAnimation,
          start: "left right",
          end: "right right",
          onUpdate: (self) => {
            // right edge of the screen, in board units (the board is 3752 units wide)
            const viewRight = (self.progress * width) / (width / 3752);
            const drawn = gsap.utils.clamp(0, LINE_LENGTH, viewRight - 120 - LINE_START);
            wipe.setAttribute("width", String(drawn + 20));
            markers.forEach((marker) => marker.classList.toggle(styles.markerOn, LINE_START + drawn >= Number(marker.dataset.x)));
          },
        });
      }
    },
    { scope: ref, dependencies: [containerAnimation, reduced, storyboard], revertOnUpdate: true },
  );

  const closeScene = () => setOpened(null);

  return (
    <section
      id="about"
      ref={ref}
      className={styles.about}
      aria-labelledby="about-title"
      data-chapter
      data-snap
      data-focusing={focused !== null || undefined}
    >
      <a
        href="#home"
        className={styles.backStrip}
        aria-label="Previous chapter: Home"
        onClick={(event) => {
          event.preventDefault();
          goTo(0);
        }}
      >
        <span className={styles.backNumber}>01</span>
        <span className={styles.backLabel}>← Home</span>
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#F7F3EC" stroke="#2A2733" strokeWidth="2" />
          <path d="M25 18 H12 M17 13 L11 18 L17 23" fill="none" stroke="#2A2733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </a>

      <div className={styles.frost} aria-hidden="true" />

      <div className={styles.canvas}>
        <svg className={styles.line} viewBox="0 0 3840 1080" aria-hidden="true" data-line>
          <defs>
            <clipPath id="aboutLineWipe">
              <rect data-line-wipe x={LINE_START - 20} y="0" width={LINE_LENGTH + 40} height="1080" />
            </clipPath>
          </defs>
          <g clipPath="url(#aboutLineWipe)">
            <path d={LINE} fill="none" stroke="#2A2733" strokeWidth="2.5" strokeDasharray="10 9" strokeLinecap="round" />
            <circle cx="1236" cy="578" r="7" fill="#2A2733" />
            <path d="M3290 569 L3306 578 L3290 587 Z" fill="#2A2733" />
          </g>
          {MARKERS.map((marker) => (
            <g key={marker.x} className={marker.now ? `${styles.marker} ${styles.markerNow}` : styles.marker} data-marker data-x={marker.x}>
              {marker.now && <circle className={styles.halo} cx={marker.x} cy="578" r="20" fill="#F5C9C6" />}
              <path
                d={marker.up ? `M${marker.x} 534 V564` : `M${marker.x} 592 V622`}
                stroke="#2A2733"
                strokeWidth="2"
                strokeDasharray="2 5"
                strokeLinecap="round"
              />
              <rect
                x={marker.x - 11}
                y="567"
                width="22"
                height="22"
                transform={`rotate(45 ${marker.x} 578)`}
                fill={marker.now ? "#F5C9C6" : "#FFFDF9"}
                stroke="#2A2733"
                strokeWidth="2.5"
              />
            </g>
          ))}
        </svg>

        {/* ---------- intro ---------- */}
        <div className={styles.intro}>
          <h2 id="about-title" className={styles.title}>
            <Typewriter
              lines={[[{ text: ABOUT.title[0] }], [{ text: ABOUT.title[1], className: styles.titleAccent }]]}
              startDelay={400}
              holdMs={12000}
              paused={!inView}
            />
          </h2>
          <p className={styles.bio} data-reveal="bio">
            {ABOUT.bio}
          </p>
          <ul className={styles.chips}>
            {ABOUT.chips.map((chip) => (
              <li key={chip.label} className={chip.accent ? `${styles.chip} ${styles.chipAccent}` : styles.chip} data-reveal="chip">
                {chip.label}
              </li>
            ))}
          </ul>
          <div className={styles.hint} data-reveal="hint">
            <span>{ABOUT.hint}</span>
            <ArrowLong />
          </div>
          <div className={styles.stampWrap}>
            <button
              type="button"
              className={styles.stamp}
              aria-label="Open the portrait stamp"
              aria-haspopup="dialog"
              data-stamp
              data-reveal="stamp"
              onClick={() => setStampOpen(true)}
            >
              <Image src={mediaUrl("/images/portrait-stamp.png")} alt={ABOUT.stampAlt} width={394} height={394} draggable={false} unoptimized loading="eager" />
            </button>
            <Postmark id="aboutPostmark" text={ABOUT.postmark} className={styles.postmark} />
          </div>
        </div>

        {/* ---------- the storyboard ("03 Experience") ---------- */}
        <span id="experience" className={styles.storyAnchor} data-chapter data-snap aria-hidden="true" />
        <div className={styles.storyRow}>
          {ABOUT.scenes.map((scene, index) => (
            <div key={scene.id} className={styles.cell} data-snap>
              <StoryCard
                scene={scene}
                index={index}
                focused={focused === index}
                touchHint={touchFocus}
                onPointerEnter={onEnter(index)}
                onPointerLeave={onLeave(index)}
                onPointerDown={(event) => (lastPointer.current = event.pointerType)}
                onActivate={onActivate(index)}
                onKeyFocus={onKeyFocus(index)}
                onKeyBlur={onKeyBlur(index)}
              />
            </div>
          ))}
        </div>

        {/* ---------- toolkit + closing ---------- */}
        <div className={styles.endScreen} data-snap>
          <section className={styles.toolkit} aria-labelledby="toolkit-title" data-toolkit data-reveal="toolkit">
            <h3 id="toolkit-title" className={styles.toolkitTitle}>
              {ABOUT.toolkit.title}
            </h3>
            <span className={styles.toolkitLabel}>Skills</span>
            <ul className={styles.tags}>
              {ABOUT.toolkit.skills.map((skill) => (
                <li key={skill} className={`${styles.tag} ${styles.tagSkill}`} data-reveal="tool">
                  {skill}
                </li>
              ))}
            </ul>
            <span className={styles.toolkitLabel}>Software</span>
            <ul className={styles.tags}>
              {ABOUT.toolkit.software.map((tool) => (
                <li key={tool} className={styles.tag} data-reveal="tool">
                  {tool}
                </li>
              ))}
            </ul>
          </section>

          <div className={styles.closing}>
            <p className={styles.closingLine} data-reveal="closing">
              {ABOUT.closing.line[0]}
              <br />
              {ABOUT.closing.line[1]}
            </p>
            <div className={styles.closingActions} data-reveal="closing">
              <a href={ABOUT.closing.cvHref} className={styles.cv}>
                {ABOUT.closing.cv}
                <svg viewBox="0 0 18 22" aria-hidden="true">
                  <path d="M9 2 V17 M3 11 L9 18 L15 11 M2 20.5 H16" fill="none" stroke="#2A2733" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </a>
              <a
                href="#contact"
                className={styles.hello}
                onClick={(event) => {
                  event.preventDefault();
                  goTo(chapterIndex("contact"));
                }}
              >
                {ABOUT.closing.hello}
              </a>
            </div>
          </div>
        </div>

        <span className={styles.endSnap} data-snap aria-hidden="true" />
      </div>

      {opened !== null && (
        <EnvelopeDialog
          scenes={ABOUT.scenes}
          index={opened}
          onIndexChange={setOpened}
          onClose={closeScene}
          getSource={(index) => ref.current?.querySelector<HTMLElement>(`[data-card="${index}"]`) ?? null}
        />
      )}
      {stampOpen && (
        <StampDialog
          getSource={() => ref.current?.querySelector<HTMLElement>("[data-stamp]") ?? null}
          onClose={() => setStampOpen(false)}
        />
      )}
    </section>
  );
}
