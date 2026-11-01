"use client";

import { useEffect, useRef } from "react";
import { ArrowLong, ArrowRight } from "@/components/icons/Arrows";
import { Squiggle } from "@/components/icons/Squiggle";
import { useChapters } from "@/components/Track/ChapterContext";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { Typewriter } from "@/components/ui/Typewriter";
import { HOME } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { useFinePointer, useReducedMotion } from "@/lib/useMediaQuery";
import { ArchCard } from "./ArchCard";
import styles from "./Home.module.css";

/** Chapter 01 — Home: the landing page from the design export, plus its motion. */
export function Home() {
  const ref = useRef<HTMLElement>(null);
  const loops = useRef<gsap.core.Tween[]>([]);
  const { active, goTo } = useChapters();
  const reduced = useReducedMotion();
  const finePointer = useFinePointer();
  const paused = active !== 0;

  // Load sequence + continuous loops (squiggle flow, orbit spin)
  useGSAP(
    () => {
      if (reduced) return;
      const q = gsap.utils.selector(ref);
      const arcs = q("[data-orbit-arc]");
      arcs.forEach((arc) => arc.setAttribute("pathLength", "1"));
      gsap.set(arcs, { strokeDasharray: 1, strokeDashoffset: 1 });

      const flow = gsap.to(q("[data-squiggle-wave]"), { x: -204, duration: 6, ease: "none", repeat: -1, paused: true });
      const spin = gsap.to(q("[data-orbit]"), {
        rotation: 360,
        svgOrigin: "317 300",
        duration: 18,
        ease: "none",
        repeat: -1,
        paused: true,
      });
      loops.current = [flow, spin];

      gsap
        .timeline({ defaults: { ease: "expo.out" } })
        .fromTo(
          document.querySelectorAll('[data-reveal="header"]'),
          { autoAlpha: 0, y: -16 },
          { autoAlpha: 1, y: 0, duration: 0.8, stagger: 0.06 },
          0,
        )
        .fromTo(
          q("[data-letter]"),
          { autoAlpha: 0, yPercent: 55, rotate: 5 },
          { autoAlpha: 1, yPercent: 0, rotate: 0, duration: 1.2, stagger: 0.035 },
          0.1,
        )
        .fromTo(q("[data-squiggle-wipe]"), { attr: { width: 0 } }, { attr: { width: 430 }, duration: 1.1, ease: "power2.inOut" }, 0.75)
        .add(() => flow.play(), 1.85)
        .fromTo(q('[data-reveal="role"]'), { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.95)
        .fromTo(q('[data-reveal="actions"]'), { autoAlpha: 0, y: 22 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 1.1)
        .fromTo(q('[data-reveal="card"]'), { autoAlpha: 0, y: 70, rotate: 2 }, { autoAlpha: 1, y: 0, rotate: 0, duration: 1.3 }, 0.35)
        .fromTo(q("[data-arch]"), { "--shadow": 0 }, { "--shadow": 10, duration: 0.9, ease: "back.out(2.2)" }, 1.2)
        .to(arcs, { strokeDashoffset: 0, duration: 0.9, stagger: 0.35, ease: "power2.inOut" }, 1.25)
        .add(() => spin.play(), 2.2)
        .fromTo(
          q('[data-reveal="label"]'),
          { autoAlpha: 0, y: 14 },
          { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.14, ease: "back.out(1.7)" },
          1.5,
        )
        .fromTo(q('[data-reveal="badge"]'), { autoAlpha: 0, scale: 0 }, { autoAlpha: 1, scale: 1, duration: 0.9, ease: "back.out(1.8)" }, 1.3)
        .fromTo(q('[data-reveal="footer"]'), { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8 }, 1.8);
    },
    { scope: ref, dependencies: [reduced], revertOnUpdate: true },
  );

  // Loops rest while Home is off-screen
  useEffect(() => {
    loops.current.forEach((tween) => {
      if (paused) tween.pause();
      else if (tween.progress() > 0 || tween.time() > 0) tween.resume();
    });
  }, [paused]);

  // Pointer effects: letters lift in a wave near the pointer; the card tilts toward it
  useGSAP(
    (_, contextSafe) => {
      if (reduced || !finePointer || !contextSafe) return;
      const q = gsap.utils.selector(ref);
      const name = q("[data-name]")[0] as HTMLElement;
      const letters = q("[data-letter]") as HTMLElement[];
      const lifts = letters.map((el) => gsap.quickTo(el, "y", { duration: 0.45, ease: "power3.out" }));

      const onNameMove = contextSafe((event: PointerEvent) => {
        const size = parseFloat(getComputedStyle(name).fontSize);
        letters.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          const distance = Math.abs(event.clientX - (rect.left + rect.width / 2)) + Math.abs(event.clientY - (rect.top + rect.height / 2)) * 0.5;
          const strength = Math.max(0, 1 - distance / (size * 0.9));
          lifts[i](-strength * size * 0.06);
        });
      });
      const onNameLeave = contextSafe(() => lifts.forEach((lift) => lift(0)));

      const card = q("[data-card]")[0] as HTMLElement;
      const arch = q("[data-arch]")[0] as HTMLElement;
      const orbit = q("[data-orbit]")[0]?.closest("svg") as SVGSVGElement | null;
      const onCardMove = contextSafe((event: PointerEvent) => {
        const rect = card.getBoundingClientRect();
        const px = (event.clientX - rect.left) / rect.width - 0.5;
        const py = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(arch, { rotationY: px * 12, rotationX: -py * 12, duration: 0.6, ease: "power3.out", overwrite: "auto" });
        if (orbit) gsap.to(orbit, { x: -px * rect.width * 0.03, y: -py * rect.height * 0.03, duration: 0.6, ease: "power3.out", overwrite: "auto" });
      });
      const onCardEnter = contextSafe(() => {
        gsap.to(arch, { "--shadow": 16, duration: 0.4, ease: "power2.out" });
        const spin = loops.current[1];
        if (spin) gsap.to(spin, { timeScale: 2, duration: 0.6 });
      });
      const onCardLeave = contextSafe(() => {
        gsap.to(arch, { rotationX: 0, rotationY: 0, "--shadow": 10, duration: 0.8, ease: "elastic.out(1, 0.6)" });
        if (orbit) gsap.to(orbit, { x: 0, y: 0, duration: 0.8, ease: "power3.out" });
        const spin = loops.current[1];
        if (spin) gsap.to(spin, { timeScale: 1, duration: 0.8 });
      });

      name.addEventListener("pointermove", onNameMove);
      name.addEventListener("pointerleave", onNameLeave);
      card.addEventListener("pointermove", onCardMove);
      card.addEventListener("pointerenter", onCardEnter);
      card.addEventListener("pointerleave", onCardLeave);
      return () => {
        name.removeEventListener("pointermove", onNameMove);
        name.removeEventListener("pointerleave", onNameLeave);
        card.removeEventListener("pointermove", onCardMove);
        card.removeEventListener("pointerenter", onCardEnter);
        card.removeEventListener("pointerleave", onCardLeave);
      };
    },
    { scope: ref, dependencies: [reduced, finePointer], revertOnUpdate: true },
  );

  return (
    <section
      id="home"
      ref={ref}
      className={styles.home}
      aria-labelledby="home-title"
      data-chapter
      data-snap
      data-paused={paused || undefined}
    >
      <div className={styles.hero}>
        <div className={styles.intro}>
          <h1 id="home-title" className={styles.name} data-name>
            <span className={styles.nameLine}>
              <SplitLetters text={HOME.firstName} reveal="name" />
            </span>
            <span className="sr-only"> </span>
            <span className={styles.nameLineIndent}>
              <SplitLetters text={HOME.lastName} reveal="name" />
              <Squiggle className={styles.squiggle} />
            </span>
          </h1>

          <p className={styles.role} data-reveal="role">
            <Typewriter
              lines={[
                [{ text: HOME.role[0][0] }, { text: HOME.role[0][1], className: styles.roleAmp }],
                [{ text: HOME.role[1][0] }],
              ]}
              startDelay={1500}
              paused={paused}
            />
          </p>

          <div className={styles.actions} data-reveal="actions">
            <a
              href="#projects"
              className={styles.cta}
              onClick={(event) => {
                event.preventDefault();
                goTo(2);
              }}
            >
              {HOME.cta}
              <ArrowRight />
            </a>
            <p className={styles.tagline}>{HOME.tagline}</p>
          </div>
        </div>

        <div className={styles.archColumn}>
          <ArchCard paused={paused} />
        </div>
      </div>

      <footer className={styles.footer} data-reveal="footer">
        <div className={styles.scrollHint}>
          <span className={styles.pointerOnly}>Scroll or drag</span>
          <span className={styles.touchOnly}>Swipe</span>
          <ArrowLong />
        </div>
      </footer>
    </section>
  );
}
