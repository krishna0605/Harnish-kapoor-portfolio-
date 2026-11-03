"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useChapters } from "@/components/Track/ChapterContext";
import type { CaseSection, Figure, ProjectFile } from "@/content/site";
import { gsap, Observer } from "@/lib/gsap";
import { mediaUrl } from "@/lib/media";
import { playSound } from "@/lib/sound";
import { useReducedMotion } from "@/lib/useMediaQuery";
import styles from "./CaseFile.module.css";
import { COVER_BACKGROUND, CoverArt } from "./CoverArt";

type Props = {
  project: ProjectFile;
  next: ProjectFile;
  /** the open folder the case file grows out of and folds back into */
  getSource: () => HTMLElement | null;
  /** called once the close animation has finished; `next` when "Next file" was pressed */
  onClosed: (next?: ProjectFile) => void;
};

/** A picture on a sheet: the real image when there is one, otherwise the drawn placeholder. */
function Picture({ figure, className }: { figure: Figure; className?: string }) {
  const art = figure.art ?? "insect";
  return (
    <span className={`${styles.picture} ${className ?? ""}`} style={{ background: COVER_BACKGROUND[art] }}>
      {figure.src ? (
        // eslint-disable-next-line @next/next/no-img-element -- media may come from a CDN
        <img src={mediaUrl(figure.src)} alt={figure.alt} loading="lazy" />
      ) : (
        <>
          <CoverArt art={art} />
          <span className="sr-only">{figure.alt}</span>
        </>
      )}
    </span>
  );
}

function Sheet({ section, project, next, onNext, onClose }: { section: CaseSection; project: ProjectFile; next: ProjectFile; onNext: () => void; onClose: () => void }) {
  switch (section.kind) {
    case "brief":
      return (
        <div className={`${styles.paper} ${styles.brief}`}>
          <svg className={styles.clip} viewBox="0 0 30 74" aria-hidden="true">
            <path d="M8 66 V14 a7 7 0 0 1 14 0 V58 a4 4 0 0 1 -8 0 V22" fill="none" stroke="#2A2733" strokeWidth="2.4" strokeLinecap="round" />
          </svg>
          <h3 className={styles.sheetTitle}>{section.heading}</h3>
          <p className={styles.body}>{section.text}</p>
          <dl className={styles.facts}>
            {section.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      );
    case "process":
      return (
        <div className={`${styles.paper} ${styles.kraft}`}>
          <h3 className={styles.sheetTitle}>{section.heading}</h3>
          {section.note && <p className={styles.body}>{section.note}</p>}
          <ul className={styles.polaroids}>
            {section.items.map((item, i) => (
              <li key={item.caption + i} className={styles.polaroid} style={{ "--tilt": `${[-3, 2, -1.5, 3][i % 4]}deg` } as React.CSSProperties}>
                <span className={styles.tape} aria-hidden="true" />
                <Picture figure={item} />
                <span className={styles.caption}>{item.caption}</span>
              </li>
            ))}
          </ul>
        </div>
      );
    case "drafts":
      return (
        <div className={`${styles.paper} ${styles.contact}`}>
          <h3 className={styles.sheetTitle}>{section.heading}</h3>
          {section.note && <p className={styles.body}>{section.note}</p>}
          <ol className={styles.frames}>
            {section.frames.map((frame, i) => (
              <li key={frame.caption + i} className={styles.frame}>
                <Picture figure={frame} />
                <span className={styles.caption}>{frame.caption}</span>
                {i === section.frames.length - 1 && (
                  <svg className={styles.circled} viewBox="0 0 120 90" aria-hidden="true">
                    <path d="M14 46 C 10 18, 60 6, 96 16 C 120 24, 116 70, 72 80 C 36 88, 8 72, 16 40" fill="none" stroke="#D2483E" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                )}
              </li>
            ))}
          </ol>
        </div>
      );
    case "final":
      return (
        <div className={`${styles.paper} ${styles.final}`}>
          <h3 className={styles.sheetTitle}>{section.heading}</h3>
          <figure className={styles.hero}>
            {section.media.video ? (
              <video className={styles.video} src={mediaUrl(section.media.video)} poster={section.media.poster ? mediaUrl(section.media.poster) : undefined} controls playsInline preload="none" aria-label={section.media.alt} />
            ) : (
              <Picture figure={section.media} className={styles.heroPicture} />
            )}
            <figcaption className={styles.caption}>{section.media.caption}</figcaption>
          </figure>
        </div>
      );
    case "credits":
      return (
        <div className={`${styles.paper} ${styles.card}`}>
          <h3 className={styles.sheetTitle}>{section.heading}</h3>
          <dl className={styles.credits}>
            {section.credits.map((credit, i) => (
              <div key={credit.role + i}>
                <dt>{credit.role}</dt>
                <dd>{credit.name}</dd>
              </div>
            ))}
          </dl>
          <ul className={styles.results}>
            {section.results.map((result) => (
              <li key={result}>{result}</li>
            ))}
          </ul>
          <div className={styles.endActions}>
            <button type="button" className={styles.nextFile} onClick={onNext} data-next-file>
              Next file → {next.number} {next.title}
            </button>
            <button type="button" className={styles.textButton} onClick={onClose}>
              Back to the drawer
            </button>
          </div>
          <span className="sr-only">End of {project.title}</span>
        </div>
      );
  }
}

/**
 * The inner page of a project: its folder grows out of the drawer to fill the screen, the
 * front cover swings open and the sheets fan out sideways. Wheel, drag, swipe or ← → move
 * between sheets; Esc or "Back to the drawer" folds it all back into the open folder.
 * The address bar is never touched.
 */
export function CaseFile({ project, next, getSource, onClosed }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frostRef = useRef<HTMLDivElement>(null);
  const folderRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const stripRef = useRef<HTMLOListElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const { lockScroll } = useChapters();
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);
  const indexRef = useRef(0);
  const phase = useRef<"opening" | "ready" | "closing">("opening");
  const turning = useRef(false);

  // sheet 1 is the cover page, built from the project itself
  const sheets = project.sections;
  const count = sheets.length + 1;

  const sheetEls = () => [...(stripRef.current?.children ?? [])] as HTMLElement[];

  // x that centres sheet i in the viewport
  const offsetFor = (i: number) => {
    const sheet = sheetEls()[i];
    const viewport = viewportRef.current;
    if (!sheet || !viewport) return 0;
    return viewport.clientWidth / 2 - (sheet.offsetLeft + sheet.offsetWidth / 2);
  };

  const goTo = (target: number, instant = false) => {
    const clamped = gsap.utils.clamp(0, count - 1, target);
    if (clamped === indexRef.current && !instant) return;
    indexRef.current = clamped;
    setIndex(clamped);
    if (!instant) playSound("quick", { volume: 0.7, throttle: 90 });
    turning.current = true;
    gsap.to(stripRef.current, {
      x: offsetFor(clamped),
      duration: instant || reduced ? 0 : 0.7,
      ease: "power3.inOut",
      overwrite: true,
      onComplete: () => (turning.current = false),
    });
    gsap.to(meterRef.current, { scaleX: (clamped + 1) / count, duration: reduced ? 0 : 0.5, ease: "power2.out" });
  };
  const goToRef = useRef(goTo);
  useEffect(() => {
    goToRef.current = goTo;
  });

  // ---------- open: grow from the open folder, swing the cover, fan out the sheets ----------
  useLayoutEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    lockScroll(true);
    const folder = folderRef.current!;
    const flap = flapRef.current!;
    goToRef.current(0, true);

    const done = () => {
      phase.current = "ready";
      closeButtonRef.current?.focus();
    };

    if (reduced) {
      gsap.set(flap, { autoAlpha: 0 });
      gsap.fromTo([frostRef.current, folder], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, onComplete: done });
      return;
    }

    const source = getSource()?.getBoundingClientRect();
    const box = folder.getBoundingClientRect();
    const tl = gsap.timeline({ onComplete: done });
    tl.fromTo(frostRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0);
    if (source) {
      tl.from(
        folder,
        {
          x: source.left - box.left,
          y: source.top - box.top,
          scaleX: source.width / box.width,
          scaleY: source.height / box.height,
          rotation: -1.5,
          transformOrigin: "0% 0%",
          duration: 0.7,
          ease: "expo.inOut",
        },
        0,
      );
    }
    tl.set(sheetEls(), { autoAlpha: 0 }, 0)
      .add(() => playSound("turn"), 0.62)
      .fromTo(flap, { rotationY: 0 }, { rotationY: -165, duration: 0.75, ease: "power3.inOut" }, 0.62)
      .set(flap, { autoAlpha: 0 }, 1.3)
      .add(() => playSound("slide"), 0.85)
      .fromTo(
        sheetEls(),
        { x: (i: number) => -160 - i * 40, rotation: (i: number) => (i % 2 ? 2 : -2), autoAlpha: 0 },
        { x: 0, rotation: 0, autoAlpha: 1, duration: 0.8, ease: "power3.out", stagger: 0.08 },
        0.85,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per opened file
  }, []);

  // ---------- close: fan in, cover shut, shrink back into the open folder ----------
  const close = (nextFile?: ProjectFile) => {
    if (phase.current === "closing") return;
    phase.current = "closing";
    const dialog = dialogRef.current!;
    const folder = folderRef.current!;
    const flap = flapRef.current!;
    const finish = () => {
      dialog.close();
      lockScroll(false);
      onClosed(nextFile);
    };
    if (reduced) {
      gsap.to([frostRef.current, folder], { autoAlpha: 0, duration: 0.2, onComplete: finish });
      return;
    }
    playSound("whoosh");
    const source = getSource()?.getBoundingClientRect();
    const box = folder.getBoundingClientRect();
    const tl = gsap.timeline({ onComplete: finish });
    tl.to(sheetEls(), { x: (i: number) => -120 - i * 30, autoAlpha: 0, duration: 0.35, ease: "power2.in", stagger: 0.03 }, 0)
      .set(flap, { autoAlpha: 1 }, 0.2)
      .to(flap, { rotationY: 0, duration: 0.45, ease: "power3.inOut" }, 0.2)
      .to(frostRef.current, { autoAlpha: 0, duration: 0.4 }, 0.5);
    if (source) {
      tl.to(
        folder,
        {
          x: source.left - box.left,
          y: source.top - box.top,
          scaleX: source.width / box.width,
          scaleY: source.height / box.height,
          rotation: -1.5,
          transformOrigin: "0% 0%",
          duration: 0.6,
          ease: "expo.inOut",
        },
        0.55,
      ).to(folder, { autoAlpha: 0, duration: 0.12 }, 1.05);
    } else {
      tl.to(folder, { autoAlpha: 0, duration: 0.3 }, 0.55);
    }
  };
  const closeRef = useRef(close);
  useEffect(() => {
    closeRef.current = close;
  });

  // ---------- moving between sheets: wheel, drag / swipe, keys ----------
  useEffect(() => {
    const viewport = viewportRef.current!;
    const step = (direction: number) => {
      if (phase.current !== "ready" || turning.current) return;
      goToRef.current(indexRef.current + direction);
    };
    const wheel = Observer.create({
      target: viewport,
      type: "wheel",
      tolerance: 12,
      onDown: () => step(1),
      onRight: () => step(1),
      onUp: () => step(-1),
      onLeft: () => step(-1),
      preventDefault: true,
    });
    const drag = Observer.create({
      target: viewport,
      type: "touch,pointer",
      dragMinimum: 6,
      tolerance: 40,
      lockAxis: true,
      onLeft: () => step(1),
      onRight: () => step(-1),
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") step(1);
      else if (event.key === "ArrowLeft") step(-1);
    };
    const onResize = () => goToRef.current(indexRef.current, true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    return () => {
      wheel.kill();
      drag.kill();
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  const meta = [project.years, project.context].filter(Boolean).join(" · ");

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="case-title"
      data-case-file={project.id}
      onCancel={(event) => {
        event.preventDefault();
        closeRef.current();
      }}
    >
      <div ref={frostRef} className={styles.frost} onClick={() => closeRef.current()} aria-hidden="true" />
      <div ref={folderRef} className={styles.folder} style={{ "--folder": project.color } as React.CSSProperties}>
        <div className={styles.bar}>
          <span className={styles.tab}>
            {project.number} · {project.tab}
          </span>
          <span className={styles.counter} aria-live="polite" aria-atomic="true">
            <span className="sr-only">Sheet </span>
            {String(index + 1).padStart(2, "0")}
            <span aria-hidden="true"> / </span>
            <span className="sr-only"> of </span>
            {String(count).padStart(2, "0")}
          </span>
          <button ref={closeButtonRef} type="button" className={styles.close} onClick={() => closeRef.current()}>
            <span aria-hidden="true">✕</span> Back to the drawer
          </button>
        </div>

        <div ref={viewportRef} className={styles.viewport}>
          <ol ref={stripRef} className={styles.strip}>
            <li className={styles.sheet} data-sheet={0} aria-current={index === 0 ? "step" : undefined}>
              <div className={`${styles.paper} ${styles.coverSheet}`}>
                <span className={styles.coverNumber}>{project.number}</span>
                <h2 id="case-title" className={styles.coverTitle}>
                  {project.title}
                </h2>
                <p className={styles.coverMeta}>
                  {meta} · {project.format}
                </p>
                <ul className={styles.tags}>
                  {project.tags.map((tag) => (
                    <li key={tag}>{tag}</li>
                  ))}
                </ul>
                <Picture figure={project.cover} className={styles.coverPicture} />
              </div>
            </li>
            {sheets.map((section, i) => (
              <li key={section.kind + i} className={styles.sheet} data-sheet={i + 1} aria-current={index === i + 1 ? "step" : undefined}>
                <Sheet section={section} project={project} next={next} onNext={() => closeRef.current(next)} onClose={() => closeRef.current()} />
              </li>
            ))}
          </ol>
        </div>

        <div className={styles.footer}>
          <button type="button" className={styles.arrow} onClick={() => goTo(index - 1)} disabled={index === 0} aria-label="Previous sheet">
            ←
          </button>
          <span className={styles.meter} aria-hidden="true">
            <span ref={meterRef} />
          </span>
          <button type="button" className={styles.arrow} onClick={() => goTo(index + 1)} disabled={index === count - 1} aria-label="Next sheet">
            →
          </button>
        </div>

        {/* the folder's front cover: it swings open on its left edge, and shuts again on close */}
        <div ref={flapRef} className={styles.flap} aria-hidden="true">
          <span className={styles.flapTab}>
            {project.number} · {project.tab}
          </span>
          <span className={styles.flapTitle}>{project.title}</span>
        </div>
      </div>
    </dialog>
  );
}
