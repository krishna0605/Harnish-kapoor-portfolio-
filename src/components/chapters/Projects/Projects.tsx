"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChapters } from "@/components/Track/ChapterContext";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { ARCHIVE, chapterIndex, type ProjectFile, type ProjectFilter } from "@/content/site";
import { Flip, gsap, useGSAP } from "@/lib/gsap";
import { playSound } from "@/lib/sound";
import { useFinePointer, useMediaQuery, useReducedMotion, useStoryboardLayout } from "@/lib/useMediaQuery";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import { FolderTab, SLOTS } from "./FolderTab";
import { OpenBubble } from "./OpenBubble";
import { OpenFolder } from "./OpenFolder";
import styles from "./Projects.module.css";

const PROJECTS: ProjectFile[] = ARCHIVE.projects;
type Filter = "all" | ProjectFilter;
type Flight = { from: DOMRect; closing: DOMRect; state: Flip.FlipState };

const pad = (n: number) => String(n).padStart(2, "0");
const matches = (project: ProjectFile, filter: Filter) => filter === "all" || project.filters.includes(filter);
/** px per design px on the desk layout */
const designUnit = () => Math.min(window.innerWidth / 1920, window.innerHeight / 1080);

/** "02 — 08", or "01, 03 — 08" when the open file leaves a gap */
function rangeLabel(numbers: number[]) {
  const runs: [number, number][] = [];
  for (const n of numbers) {
    const last = runs[runs.length - 1];
    if (last && n === last[1] + 1) last[1] = n;
    else runs.push([n, n]);
  }
  return runs.map(([a, b]) => (a === b ? pad(a) : b === a + 1 ? `${pad(a)}, ${pad(b)}` : `${pad(a)} — ${pad(b)}`)).join(", ");
}

/**
 * Chapter 04 — Projects: "Open a folder." A drawer of project files; one is pulled out
 * and lies open with its cover and brief. Pulling another tab swaps them: the new file
 * flies out of the drawer into the open position while the old one drops back into its
 * place in the drawer (GSAP Flip).
 */
export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<HTMLElement>(null);
  const { goTo, containerAnimation } = useChapters();
  const reduced = useReducedMotion();
  const fine = useFinePointer();
  const desk = useStoryboardLayout();
  const portrait = useMediaQuery("(orientation: portrait)");

  const [openId, setOpenId] = useState(PROJECTS[0].id);
  const [filter, setFilter] = useState<Filter>("all");
  const [announce, setAnnounce] = useState("");
  const [hovered, setHovered] = useState<string | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  useChapterReveal(ref);

  const flight = useRef<Flight | null>(null);
  const busy = useRef(false);
  const queued = useRef<ProjectFile | null>(null);
  const swapped = useRef(false);
  const lastPointer = useRef("mouse");
  const pullRef = useRef<(project: ProjectFile) => void>(() => {});

  const open = PROJECTS.find((project) => project.id === openId)!;
  const closed = PROJECTS.filter((project) => project.id !== openId);
  const step = closed.length > SLOTS.length ? (96 * SLOTS.length) / closed.length : 96;

  const folderButtons = () => [...(drawerRef.current?.querySelectorAll<HTMLButtonElement>("[data-folder]") ?? [])];

  // ---------- pulling a file out of the drawer ----------

  const pull = (project: ProjectFile) => {
    if (project.id === openId) return;
    if (busy.current) {
      queued.current = project; // the last tab pulled during a swap wins
      return;
    }
    const button = drawerRef.current?.querySelector<HTMLElement>(`[data-folder="${project.id}"]`);
    const openEl = openRef.current;
    if (desk && !reduced && button && openEl) {
      flight.current = {
        from: button.getBoundingClientRect(),
        closing: openEl.getBoundingClientRect(),
        state: Flip.getState(drawerRef.current!.querySelectorAll("[data-flip-id]")),
      };
      busy.current = true;
    }
    swapped.current = true;
    setHovered(null);
    setArmed(null);
    setOpenId(project.id);
    setAnnounce(`Showing ${project.number}: ${project.title}`);
    playSound("slide", { volume: 0.8 });
  };
  useEffect(() => {
    pullRef.current = pull;
  });

  // the swap: new file flies out, old file drops back into the drawer, the drawer shuffles
  useLayoutEffect(() => {
    if (!swapped.current) return;
    const openEl = openRef.current;
    const drawer = drawerRef.current;
    const trip = flight.current;
    flight.current = null;
    if (!openEl || !drawer) return;
    const paper = openEl.querySelectorAll("[data-cover], [data-note]");
    const noteParts = openEl.querySelectorAll("[data-note-part], [data-clip]");
    const finish = () => {
      busy.current = false;
      const next = queued.current;
      queued.current = null;
      if (next) pullRef.current(next);
    };

    if (reduced) {
      gsap.fromTo(openEl, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, onComplete: finish });
      return;
    }

    const tl = gsap.timeline({ onComplete: finish });
    if (trip) {
      const to = openEl.getBoundingClientRect();
      tl.from(
        openEl,
        {
          x: trip.from.left - to.left,
          y: trip.from.top - to.top,
          scaleX: trip.from.width / to.width,
          scaleY: trip.from.height / to.height,
          rotation: 0,
          transformOrigin: "0% 0%",
          duration: 0.75,
          ease: "expo.inOut",
          clearProps: "transform,transformOrigin",
        },
        0,
      );
      Flip.from(trip.state, {
        targets: drawer.querySelectorAll("[data-flip-id]"),
        duration: 0.65,
        ease: "power3.inOut",
        onEnter: (entering) =>
          entering.map((el) => {
            const r = el.getBoundingClientRect();
            return gsap.from(el, {
              x: trip.closing.left - r.left,
              y: trip.closing.top - r.top,
              scaleX: trip.closing.width / r.width,
              scaleY: trip.closing.height / r.height,
              rotation: -1.5,
              transformOrigin: "0% 0%",
              duration: 0.75,
              ease: "power3.inOut",
              clearProps: "transform,transformOrigin",
              onComplete: () => playSound("tape", { duration: 0.35, volume: 0.8 }),
            });
          }),
      });
    }
    // the contents spill out of the new file
    tl.fromTo(paper, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: "back.out(1.6)", stagger: 0.08, clearProps: "transform" }, trip ? 0.5 : 0)
      .fromTo(noteParts, { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: "power3.out", stagger: 0.05, clearProps: "transform" }, trip ? 0.6 : 0.1)
      .add(() => playSound("crinkle", { volume: 0.8 }), trip ? 0.7 : 0.1);

    // on the smaller layouts the open file is the next stop: bring it into view
    if (!desk) openEl.querySelector<HTMLElement>("#open-folder-title")?.focus({ preventScroll: true });
  }, [openId, reduced, desk]);

  // ---------- hover: the folder lifts, its neighbours lean away ----------

  const lift = (id: string | null) => {
    if (reduced) return;
    const buttons = folderButtons();
    const index = buttons.findIndex((button) => button.dataset.folder === id);
    const k = desk ? designUnit() : 0.6;
    // files that match a filter rest a little proud of the drawer
    const rest = filter === "all" || portrait ? 0 : -12 * k;
    buttons.forEach((button, i) => {
      const title = button.querySelector("[data-folder-title]");
      button.toggleAttribute("data-lifted", i === index);
      if (button.dataset.sunk) return;
      const d = i - index;
      if (index < 0 || Math.abs(d) > 2) {
        gsap.to(button, { x: 0, y: rest, rotation: 0, duration: 0.6, ease: "elastic.out(1, 0.7)", overwrite: "auto" });
        gsap.to(title, { y: 0, x: 0, duration: 0.4, overwrite: "auto" });
      } else if (d === 0) {
        if (portrait) gsap.to(button, { x: 14, y: 0, rotation: 0, duration: 0.45, ease: "back.out(2)", overwrite: "auto" });
        else gsap.to(button, { y: -28 * k, x: 0, rotation: 0, duration: 0.45, ease: "back.out(2)", overwrite: "auto" });
        gsap.to(title, portrait ? { x: 6, duration: 0.45, overwrite: "auto" } : { y: 6 * k, duration: 0.45, overwrite: "auto" });
      } else if (!portrait) {
        const near = Math.abs(d) === 1;
        gsap.to(button, { x: Math.sign(d) * (near ? 4 : 2) * k, y: rest, rotation: Math.sign(d) * (near ? 0.6 : 0.3), duration: 0.45, ease: "power3.out", overwrite: "auto" });
        gsap.to(title, { y: 0, x: 0, duration: 0.4, overwrite: "auto" });
      }
    });
  };

  useEffect(() => {
    lift(armed ?? hovered);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- lift reads the DOM only
  }, [hovered, armed, reduced, desk, portrait]);

  // a tap anywhere outside the armed folder lets it go
  useEffect(() => {
    if (!armed) return;
    const release = (event: PointerEvent) => {
      if (!(event.target as Element).closest?.(`[data-folder="${armed}"]`)) setArmed(null);
    };
    document.addEventListener("pointerdown", release);
    return () => document.removeEventListener("pointerdown", release);
  }, [armed]);

  const onFolderClick = (project: ProjectFile) => (event: React.MouseEvent<HTMLButtonElement>) => {
    // touch: the first tap lifts the folder, the second pulls it out (a stray tap while swiping never opens one)
    const touch = lastPointer.current !== "mouse" && event.detail > 0;
    if (touch && armed !== project.id) {
      setArmed(project.id);
      playSound("quick", { throttle: 120 });
      return;
    }
    pull(project);
  };

  // ---------- filters: files that don't match sink into the drawer ----------

  const choose = (next: Filter) => {
    if (next === filter) return;
    setFilter(next);
    if (!matches(open, next)) {
      const first = PROJECTS.find((project) => matches(project, next));
      if (first) pull(first);
    }
  };

  useLayoutEffect(() => {
    if (reduced) return;
    const k = desk ? designUnit() : 0.6;
    const buttons = folderButtons();
    const sinking = buttons.filter((button) => button.dataset.sunk);
    const rising = buttons.filter((button) => !button.dataset.sunk);
    gsap.to(sinking, portrait ? { x: -10, duration: 0.4, ease: "power3.in", overwrite: "auto" } : { y: 28 * k, x: 0, rotation: 0, duration: 0.45, ease: "power3.in", overwrite: "auto", stagger: 0.03 });
    // with a filter on, the files that match stand a little proud of the rest
    const proud = filter === "all" || portrait ? 0 : -12 * k;
    gsap.to(rising, { y: proud, x: 0, duration: 0.6, ease: "back.out(1.8)", overwrite: "auto", stagger: 0.05, delay: 0.1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs when the filter changes
  }, [filter]);

  // ---------- entrance: folders file themselves into the drawer, the open one lands ----------

  useGSAP(
    () => {
      if (reduced || !containerAnimation) return;
      const q = gsap.utils.selector(ref);
      const arrow = q("[data-hint-arrow] path");
      gsap.set(arrow, { strokeDasharray: 160, strokeDashoffset: 160 });
      gsap
        .timeline({
          defaults: { ease: "expo.out" },
          scrollTrigger: { trigger: ref.current, containerAnimation, start: "left 75%", toggleActions: "play none none none" },
        })
        .fromTo(q("[data-drawer-base]"), { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6 }, 0.1)
        .fromTo(q("[data-folder]"), { y: 140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: "back.out(1.4)", stagger: 0.06 }, 0.2)
        .fromTo(q("[data-open-folder]"), { y: -50, rotation: -6, autoAlpha: 0 }, { y: 0, rotation: desk ? -1.5 : 0, autoAlpha: 1, duration: 1, clearProps: "transform" }, 0.55)
        .fromTo(q("[data-open-folder] [data-cover], [data-open-folder] [data-note]"), { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.1, clearProps: "transform" }, 0.85)
        .add(() => playSound("slide", { volume: 0.6 }), 0.9)
        .to(arrow, { strokeDashoffset: 0, duration: 0.9, ease: "power2.inOut" }, 0.9)
        .to(q("[data-hint-arrow]"), { x: 8, duration: 0.25, ease: "power2.out", yoyo: true, repeat: 3 }, 1.8);
    },
    { scope: ref, dependencies: [reduced, containerAnimation, desk], revertOnUpdate: true },
  );

  // ---------- the open file: the cover tilts toward the pointer, the clip wiggles ----------

  const tiltCover = (event: React.PointerEvent<HTMLElement>) => {
    if (reduced || !fine) return;
    const cover = openRef.current?.querySelector("[data-cover]");
    if (!cover) return;
    const r = cover.getBoundingClientRect();
    const px = gsap.utils.clamp(-0.5, 0.5, (event.clientX - (r.left + r.width / 2)) / r.width);
    const py = gsap.utils.clamp(-0.5, 0.5, (event.clientY - (r.top + r.height / 2)) / r.height);
    gsap.to(cover, { rotationY: px * 12, rotationX: -py * 12, transformPerspective: 900, duration: 0.5, ease: "power3.out", overwrite: "auto" });
  };

  const settleCover = () => {
    const openEl = openRef.current;
    if (!openEl || reduced) return;
    gsap.to(openEl.querySelector("[data-cover]"), { rotationX: 0, rotationY: 0, duration: 0.9, ease: "elastic.out(1, 0.6)", overwrite: "auto" });
    gsap.to(openEl.querySelector("[data-tape]"), { rotation: 3, y: 0, duration: 0.4, overwrite: "auto" });
  };

  const greetCover = () => {
    const openEl = openRef.current;
    if (!openEl || reduced || !fine) return;
    gsap.to(openEl.querySelector("[data-tape]"), { rotation: 8, y: -3, duration: 0.4, ease: "back.out(2)", overwrite: "auto" });
    gsap.fromTo(
      openEl.querySelector("[data-clip]"),
      { rotation: 0 },
      { keyframes: [{ rotation: -8, duration: 0.14 }, { rotation: 5, duration: 0.14 }, { rotation: 0, duration: 0.3 }], ease: "power1.inOut", overwrite: "auto" },
    );
  };

  return (
    <section id="projects" ref={ref} className={styles.projects} aria-labelledby="projects-title" data-chapter data-snap>
      <button type="button" data-go="experience" className={styles.backStrip} aria-label="Previous chapter: Experience" onClick={() => goTo(chapterIndex("experience"))}>
        <span className={styles.backNumber}>03</span>
        <span className={styles.backLabel}>← Experience</span>
        <svg viewBox="0 0 36 36" aria-hidden="true">
          <circle cx="18" cy="18" r="16" fill="#F7F3EC" stroke="#2A2733" strokeWidth="2" />
          <path d="M25 18 H12 M17 13 L11 18 L17 23" fill="none" stroke="#2A2733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div className={styles.canvas}>
        {/* stop 1 on smaller screens: the intro and the drawer */}
        <div className={styles.stopDrawer} data-snap>
          <div className={styles.intro}>
            <span className={styles.chip} data-reveal="block">
              {pad(PROJECTS.length)} files · {ARCHIVE.intro.since}
            </span>
            <h2 id="projects-title" className={styles.title}>
              <span className={shared.titleLine}>
                <SplitLetters text={ARCHIVE.intro.title[0]} reveal="title" />
              </span>
              <span className={`${shared.titleLine} ${styles.titleAccent}`}>
                <SplitLetters text={ARCHIVE.intro.title[1]} reveal="title" />
              </span>
            </h2>
            <p className={styles.text} data-reveal="block">
              {ARCHIVE.intro.text}
            </p>
            <div className={styles.filters} role="group" aria-label="Filter projects" data-reveal="block">
              {ARCHIVE.filters.map(({ id, label }) => {
                const count = PROJECTS.filter((project) => matches(project, id)).length;
                return (
                  <button key={id} type="button" className={styles.filter} aria-pressed={filter === id} data-filter={id} onClick={() => choose(id)}>
                    {label}
                    <span className={id === "all" ? styles.filterCountAll : styles.filterCount}> · {pad(count)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <p className={styles.hint} data-reveal="block">
            <span>{ARCHIVE.intro.hint}</span>
            <svg viewBox="0 0 140 16" aria-hidden="true" data-hint-arrow>
              <path d="M2 8 H134 M126 2 L135 8 L126 14" fill="none" stroke="#2A2733" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </p>

          <div ref={drawerRef} className={styles.drawer} data-drawer>
            <span className={styles.drawerBase} aria-hidden="true" data-drawer-base />
            <ul className={styles.folders} aria-label="Project files">
              {closed.map((project, slot) => (
                <FolderTab
                  key={project.id}
                  project={project}
                  slot={slot}
                  step={step}
                  sunk={!matches(project, filter)}
                  armed={armed === project.id}
                  onOpen={onFolderClick(project)}
                  onPointerEnter={(event) => {
                    if (event.pointerType !== "mouse") return;
                    setHovered(project.id);
                    if (matches(project, filter)) playSound("quick", { throttle: 140, volume: 0.6 });
                  }}
                  onPointerLeave={(event) => event.pointerType === "mouse" && setHovered((current) => (current === project.id ? null : current))}
                  onPointerDown={(event) => (lastPointer.current = event.pointerType)}
                  onFocus={() => {
                    lift(project.id);
                    playSound("quick", { throttle: 120, volume: 0.6 });
                  }}
                  onBlur={() => lift(hovered)}
                />
              ))}
            </ul>
            <span className={styles.drawerLabel} aria-hidden="true">
              {ARCHIVE.intro.drawerLabel} · {rangeLabel(closed.map((project) => Number(project.number)))}
            </span>
          </div>
        </div>

        {/* stop 2 on smaller screens: the open file */}
        <div className={styles.stopFolder} data-snap>
          <OpenFolder ref={openRef} key={open.id} project={open} onOpenCase={() => {}} onPointerMove={tiltCover} onPointerEnter={greetCover} onPointerLeave={settleCover} />
        </div>
      </div>

      {fine && !reduced && <OpenBubble active={hovered !== null} />}

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}
