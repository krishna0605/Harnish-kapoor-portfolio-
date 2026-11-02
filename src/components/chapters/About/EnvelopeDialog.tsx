"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { useChapters } from "@/components/Track/ChapterContext";
import type { Scene } from "@/content/site";
import { gsap, Observer } from "@/lib/gsap";
import { playSound } from "@/lib/sound";
import { useMediaQuery, useReducedMotion } from "@/lib/useMediaQuery";
import dialogStyles from "./Dialog.module.css";
import styles from "./Envelope.module.css";
import { StampFace } from "./StampFace";

type Props = {
  scenes: Scene[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
  /** the stamp on the board the double flies out of / back into */
  getSource: (index: number) => HTMLElement | null;
};

type Pose = { x: number; y: number; scale: number; rotation: number };
type Phase = "opening" | "ready" | "busy" | "closing";

const clamp01 = gsap.utils.clamp(0, 1);

/**
 * An opened story. The stamp zooms in toward the viewer, zooms back out and sticks onto
 * an envelope. Scrolling then opens it: the flap lifts, the letter slides out and comes
 * forward to be read. Everything plays backwards to close.
 */
export function EnvelopeDialog({ scenes, index, onIndexChange, onClose, getSource }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frostRef = useRef<HTMLDivElement>(null);
  const envelopeRef = useRef<HTMLDivElement>(null);
  const flapRef = useRef<HTMLDivElement>(null);
  const slotRef = useRef<HTMLDivElement>(null);
  const cancelRef = useRef<SVGSVGElement>(null);
  const letterRef = useRef<HTMLDivElement>(null);
  const letterBodyRef = useRef<HTMLDivElement>(null);
  const flyerRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const meterRef = useRef<HTMLSpanElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const phase = useRef<Phase>("opening");
  const origin = useRef({ cx: 0, cy: 0 });
  const stuck = useRef<Pose>({ x: 0, y: 0, scale: 1, rotation: 0 });
  const progress = useRef<gsap.core.Timeline | null>(null);
  const target = useRef(0);
  const heard = useRef(0);
  const switchDirection = useRef(0);
  const shownIndex = useRef(index);
  const closeRequested = useRef(false);
  const closeRef = useRef<() => void>(() => {});

  const { lockScroll } = useChapters();
  const reduced = useReducedMotion();
  const touch = useMediaQuery("(pointer: coarse)");
  const scene = scenes[index];

  const parts = () => [
    envelopeRef.current!.querySelector("[data-back]"),
    envelopeRef.current!.querySelector("[data-pocket]"),
    flapRef.current,
  ];

  // the double sits over a board stamp: remember that stamp's centre as the origin
  const anchorTo = (source: HTMLElement | null) => {
    const flyer = flyerRef.current!;
    const width = source?.offsetWidth ?? 360;
    const rect = source?.getBoundingClientRect();
    const cx = rect ? rect.left + rect.width / 2 : innerWidth / 2;
    const cy = rect ? rect.top + rect.height / 2 : innerHeight / 2;
    origin.current = { cx, cy };
    gsap.set(flyer, { width });
    gsap.set(flyer, { left: cx - width / 2, top: cy - flyer.offsetHeight / 2 });
    // measured against the envelope frame (never transformed), not the moving pocket
    const frame = envelopeRef.current!.getBoundingClientRect();
    const slot = slotRef.current!;
    stuck.current = {
      x: frame.left + slot.offsetLeft + slot.offsetWidth / 2 - cx,
      y: frame.top + slot.offsetTop + slot.offsetHeight / 2 - cy,
      scale: slot.offsetWidth / width,
      rotation: -4,
    };
    return source ? Number(gsap.getProperty(source, "rotation")) || 0 : 0;
  };

  const zoomedIn = (): Pose => {
    const flyer = flyerRef.current!;
    const big = Math.min(2.2, (innerHeight * 0.82) / flyer.offsetHeight, (innerWidth * 0.86) / flyer.offsetWidth);
    return { x: innerWidth / 2 - origin.current.cx, y: innerHeight / 2 - origin.current.cy, scale: big, rotation: 0 };
  };

  // sounds as the envelope opens, once per step going forward
  const listen = (p: number) => {
    const last = heard.current;
    if (last < 0.03 && p >= 0.03) playSound("turn");
    if (last < 0.33 && p >= 0.33) playSound("slide");
    if (last < 0.92 && p >= 0.92) playSound("crinkle");
    heard.current = p;
    if (meterRef.current) gsap.set(meterRef.current, { scaleY: p });
  };

  /** The scroll-scrubbed opening: flap → letter out → letter forward. Built once poses are final. */
  const buildOpening = () => {
    progress.current?.kill();
    const envelope = envelopeRef.current!;
    const letter = letterRef.current!;
    gsap.set(letter, { clearProps: "transform,clipPath,zIndex" });
    const e = envelope.getBoundingClientRect();
    const l = letter.getBoundingClientRect();
    const scale = (e.width * 0.88) / l.width;
    const height = l.height * scale;
    // tucked in: top just under the envelope's top edge; the part below the envelope is clipped
    const tuckedY = e.top + e.height * 0.06 + height / 2 - (l.top + l.height / 2);
    const below = (offsetY: number) => {
      const bottom = l.top + l.height / 2 + offsetY + height / 2;
      return `inset(0% 0% ${(Math.max(0, bottom - e.bottom) / height) * 100}% 0%)`;
    };
    const risenY = tuckedY - e.height * 0.62;
    gsap.set(letter, { y: tuckedY, scale, zIndex: 2, clipPath: below(tuckedY) });

    progress.current = gsap
      .timeline({ paused: true, defaults: { ease: "none" } })
      .to(hintRef.current, { autoAlpha: 0, duration: 0.06 }, 0.02)
      .to(flapRef.current, { rotationX: -180, transformPerspective: 1400, duration: 0.3 }, 0)
      .set(flapRef.current, { zIndex: 1 }, 0.16)
      .to(letter, { y: risenY, clipPath: below(risenY), duration: 0.35 }, 0.3)
      .set(letter, { zIndex: 25 }, 0.65) // above the stamp once it comes forward
      .to(letter, { y: 0, scale: 1, clipPath: "inset(0% 0% 0% 0%)", duration: 0.35 }, 0.65)
      .to([...parts(), flyerRef.current], { y: `+=${innerHeight * 0.6}`, duration: 0.3, ease: "power1.in" }, 0.68)
      .set([...parts(), flyerRef.current], { autoAlpha: 0 }, 0.98);
  };

  const scrubTo = (value: number, duration = 0.7) => {
    if (phase.current !== "ready" || !progress.current) return;
    target.current = clamp01(value);
    gsap.to(progress.current, {
      progress: target.current,
      duration,
      ease: "power2.out",
      overwrite: true,
      onUpdate: () => listen(progress.current!.progress()),
    });
  };

  // ---------- open: zoom in, zoom out, stick ----------
  useLayoutEffect(() => {
    const dialog = dialogRef.current!;
    dialog.showModal();
    lockScroll(true);
    const source = getSource(index);
    const tilt = anchorTo(source);
    const flyer = flyerRef.current!;
    const tapes = flyer.querySelectorAll("[data-stick-tape]");

    if (reduced) {
      gsap.set(flyer, { ...stuck.current });
      if (source) gsap.set(source, { autoAlpha: 0 });
      buildOpening();
      progress.current!.progress(1);
      target.current = 1;
      heard.current = 1;
      phase.current = "ready";
          if (closeRequested.current) closeRef.current();
      gsap.fromTo([frostRef.current, envelopeRef.current, controlsRef.current], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25, onComplete: () => closeButtonRef.current?.focus() });
      return;
    }

    gsap.set(flyer, { x: 0, y: 0, scale: 1, rotation: tilt, "--shadow": 6 });
    gsap.set(parts(), { y: innerHeight, autoAlpha: 0 });
    gsap.set([cancelRef.current, hintRef.current, controlsRef.current], { autoAlpha: 0 });
    gsap.set(tapes, { scaleX: 0 });
    buildOpening(); // tucks the letter inside the envelope before it is ever seen
    gsap.set(letterRef.current, { autoAlpha: 0 });
    playSound("whoosh");

    const tl = gsap
      .timeline({
        onComplete: () => {
          phase.current = "ready";
          if (closeRequested.current) closeRef.current();
          closeButtonRef.current?.focus();
        },
      })
      .fromTo(frostRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0)
      .add(() => {
        if (source) gsap.set(source, { autoAlpha: 0 });
      }, 0)
      // 1. zoom in toward the viewer (the stamp is always drawn above the envelope)
      .to(flyer, { ...zoomedIn(), "--shadow": 14, duration: 0.6, ease: "power3.out" }, 0)
      // 2. behind the big stamp, the whole envelope rises as one piece — flap closed
      .set([...parts()], { autoAlpha: 1 }, 0.4)
      .to([...parts()], { y: 0, duration: 0.75, ease: "power3.out" }, 0.4)
      .set(letterRef.current, { autoAlpha: 1 }, 1.2) // only once the envelope is in place
      // 3. zoom back out and land in the stamp slot
      .add(() => playSound("slide"), 1.0)
      .to(flyer, { ...stuck.current, "--shadow": 2, duration: 0.6, ease: "power3.inOut" }, 1.0)
      .add(() => {
        playSound("thunk");
        playSound("tape", { duration: 0.4 });
      }, 1.57)
      .to(flyer, { scaleX: stuck.current.scale * 1.06, scaleY: stuck.current.scale * 0.94, duration: 0.08, ease: "power2.out" }, 1.6)
      .to(flyer, { scaleX: stuck.current.scale, scaleY: stuck.current.scale, duration: 0.5, ease: "elastic.out(1, 0.6)" }, 1.68)
      .to(tapes, { scaleX: 1, duration: 0.2, stagger: 0.08, ease: "power2.out" }, 1.63)
      .to(cancelRef.current, { autoAlpha: 1, duration: 0.2 }, 1.68)
      // 4. invite the reader in
      .fromTo(hintRef.current, { autoAlpha: 0, y: 8 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 1.8)
      .to(controlsRef.current, { autoAlpha: 1, duration: 0.3 }, 1.8);

    return () => {
      tl.kill();
    };
    // the opening runs once, for the stamp that was clicked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- after a page turn: slide the next envelope in, already stamped ----------
  useLayoutEffect(() => {
    if (shownIndex.current === index) return;
    shownIndex.current = index;
    const direction = switchDirection.current || 1;
    const source = getSource(index);
    anchorTo(source);
    if (source) gsap.set(source, { autoAlpha: 0 });
    const flyer = flyerRef.current!;
    const offset = direction * innerWidth; // arrives from fully off screen
    gsap.set(flyer, { ...stuck.current, x: stuck.current.x + offset, autoAlpha: 1 });
    gsap.set([...parts()], { x: offset, y: 0, autoAlpha: 1 });
    gsap.set(flapRef.current, { rotationX: 0, zIndex: 5 });
    buildOpening();
    gsap.set(letterRef.current, { autoAlpha: 0 }); // tucked in, and hidden until the envelope lands
    target.current = 0;
    heard.current = 0;
    gsap
      .timeline({
        onComplete: () => {
          gsap.set(letterRef.current, { autoAlpha: 1 });
          phase.current = "ready";
          if (closeRequested.current) closeRef.current();
        },
      })
      .to([...parts()], { x: 0, duration: reduced ? 0 : 0.5, ease: "power3.out" })
      .to(flyer, { x: stuck.current.x, duration: reduced ? 0 : 0.5, ease: "power3.out" }, 0)
      .fromTo(hintRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, 0.3);
    if (reduced) {
      progress.current!.progress(1);
      target.current = 1;
      heard.current = 1;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  // ---------- close: tuck the letter in, peel the stamp off, send it back to the board ----------
  const close = () => {
    // mid-animation: close as soon as the current step settles
    if (phase.current === "opening" || phase.current === "busy") {
      closeRequested.current = true;
      return;
    }
    if (phase.current !== "ready") return;
    phase.current = "closing";
    const source = getSource(index);
    const finish = () => {
      if (source) gsap.set(source, { autoAlpha: 1 });
      dialogRef.current?.close();
      lockScroll(false);
      onClose();
    };
    if (reduced) {
      gsap.to(dialogRef.current, { autoAlpha: 0, duration: 0.2, onComplete: finish });
      return;
    }
    const flyer = flyerRef.current!;
    const tilt = source ? Number(gsap.getProperty(source, "rotation")) || 0 : 0;
    const open = progress.current!.progress();
    const lifted = zoomedIn();
    gsap
      .timeline({ onComplete: finish })
      .to([controlsRef.current, hintRef.current], { autoAlpha: 0, duration: 0.2 }, 0)
      .to(progress.current, { progress: 0, duration: open > 0 ? 0.35 + open * 0.5 : 0, ease: "power2.inOut" }, 0)
      .add(() => playSound("tape", { duration: 0.4 }))
      .to(flyer.querySelectorAll("[data-stick-tape]"), { scaleX: 0, duration: 0.18 })
      .addLabel("peeled")
      // the letter is tucked in by now: hide it, then the envelope (flap included) sinks
      // away solid from under the stamp and only disappears once it is off screen
      .set(letterRef.current, { autoAlpha: 0 }, "peeled")
      .to([...parts()], { y: innerHeight, duration: 0.55, ease: "power2.in" }, "peeled")
      .set([...parts()], { autoAlpha: 0 })
      .add(() => playSound("whoosh"), "peeled+=0.1")
      .to(flyer, { ...lifted, scale: lifted.scale * 0.7, "--shadow": 12, duration: 0.5, ease: "power3.out" }, "peeled+=0.1")
      .to(flyer, { x: 0, y: 0, scale: 1, rotation: tilt, "--shadow": 6, duration: 0.55, ease: "power3.inOut" })
      .to(frostRef.current, { autoAlpha: 0, duration: 0.4 }, "-=0.35");
  };

  // ---------- ← / → : the next scene's envelope ----------
  const turn = (direction: 1 | -1) => {
    const next = index + direction;
    if (phase.current !== "ready" || next < 0 || next >= scenes.length) return;
    phase.current = "busy";
    switchDirection.current = direction;
    const previous = getSource(index);
    playSound("turn");
    const letterOut = (progress.current?.progress() ?? 0) >= 0.65; // in front of the envelope
    const leaving = [...parts(), flyerRef.current, letterRef.current];
    // a tucked-in letter must never show: it goes now, before anything moves
    if (!letterOut) gsap.set(letterRef.current, { autoAlpha: 0 });
    gsap
      .timeline({
        onComplete: () => {
          if (previous) gsap.set(previous, { autoAlpha: 1 });
          // reset the opening while everything is off screen and invisible
          progress.current?.progress(0);
          gsap.set(leaving, { autoAlpha: 0 });
          onIndexChange(next);
        },
      })
      // the whole envelope slides away as one solid piece, then disappears
      .to(leaving, { x: `-=${direction * innerWidth}`, duration: reduced ? 0 : 0.45, ease: "power2.in" })
      .set(leaving, { autoAlpha: 0 });
  };

  // ---------- scrolling / swiping / keys open and close the envelope ----------
  const turnRef = useRef(turn);
  const scrubRef = useRef(scrubTo);
  useEffect(() => {
    turnRef.current = turn;
    closeRef.current = close;
    scrubRef.current = scrubTo;
  });

  useEffect(() => {
    const dialog = dialogRef.current!;
    // the letter's own text scrolls natively once the letter is fully out
    const letterCanScroll = (delta: number) => {
      const body = letterBodyRef.current;
      if (!body || target.current < 1) return false;
      return delta > 0 ? body.scrollTop + body.clientHeight < body.scrollHeight - 1 : body.scrollTop > 0;
    };
    const observer = Observer.create({
      target: dialog,
      type: "wheel,touch",
      tolerance: 4,
      onChangeY: (self) => {
        const isTouch = self.event.type.startsWith("touch");
        const delta = isTouch ? -self.deltaY * 1.6 : self.deltaY;
        if (letterCanScroll(delta)) return;
        if (self.event.cancelable) self.event.preventDefault();
        scrubRef.current(target.current + delta / 900);
      },
    });
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") turnRef.current(1);
      else if (event.key === "ArrowLeft") turnRef.current(-1);
      else if (["ArrowDown", "PageDown", " "].includes(event.key)) {
        if (letterCanScroll(1)) return;
        event.preventDefault();
        scrubRef.current(target.current + 0.34);
      } else if (["ArrowUp", "PageUp"].includes(event.key)) {
        if (letterCanScroll(-1)) return;
        event.preventDefault();
        scrubRef.current(target.current - 0.34);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      observer.kill();
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={dialogStyles.dialog}
      aria-label={`${scene.number}: ${scene.title}`}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
    >
      <div ref={frostRef} className={dialogStyles.frost} onClick={close} />

      <div className={dialogStyles.stage}>
        <div
          ref={envelopeRef}
          className={styles.envelope}
          onClick={() => {
            if (target.current < 1) scrubTo(1, 1.4);
          }}
          aria-label="Open the envelope"
          role="button"
          tabIndex={-1}
        >
          <div className={styles.back} data-back />

          {/* the letter: the story, no pictures */}
          <div ref={letterRef} className={styles.letter} onClick={(event) => event.stopPropagation()}>
            <div ref={letterBodyRef} className={styles.letterBody} data-lenis-prevent>
              <p className={styles.period}>
                {scene.number} · {scene.kicker}
              </p>
              <h2 className={styles.title}>{scene.title}</h2>
              <span className={styles.rule} style={{ background: scene.color }} />
              {scene.text && <p className={styles.text}>{scene.text}</p>}
              {scene.roles && (
                <ul className={styles.roles}>
                  {scene.roles.map((role) => (
                    <li key={role.role}>
                      <span>{role.role}</span>
                      <span>{role.company}</span>
                    </li>
                  ))}
                </ul>
              )}
              <div className={styles.columns}>
                <div>
                  <h3 className={styles.columnTitle}>What I did</h3>
                  <ul className={styles.columnList}>
                    {scene.did.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className={styles.columnTitle}>Highlights</h3>
                  <ul className={styles.columnList}>
                    {scene.highlights.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <ul className={styles.tags}>
                {scene.tags.map((tag) => (
                  <li key={tag.label} className={tag.accent ? `${styles.tag} ${styles.tagAccent}` : styles.tag}>
                    {tag.label}
                  </li>
                ))}
              </ul>
              <p className={styles.signoff}>— H.</p>
            </div>
          </div>

          <div className={styles.pocket} data-pocket>
            <svg className={styles.pocketShape} viewBox="0 0 520 322" preserveAspectRatio="none" aria-hidden="true">
              <rect x="1.5" y="1.5" width="517" height="319" rx="10" fill="#F2D394" stroke="#2A2733" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
              <path d="M2 318 L232 176 Q260 160 288 176 L518 318" fill="none" stroke="#2A2733" strokeWidth="2" opacity="0.55" vectorEffect="non-scaling-stroke" />
              <path d="M2 4 L210 170 M518 4 L310 170" fill="none" stroke="#2A2733" strokeWidth="1.5" opacity="0.3" vectorEffect="non-scaling-stroke" />
            </svg>
            <span className={styles.pocketGrain} />
            <span className={styles.sceneMark}>
              {scene.number} · {scene.kicker}
            </span>
            <div className={styles.address}>
              <span>To: you</span>
              <span>From: Harnish Kapoor</span>
            </div>
            <div ref={slotRef} className={styles.slot} />
            <svg ref={cancelRef} className={styles.cancel} viewBox="0 0 90 40" aria-hidden="true">
              <path d="M2 8 C 17 2, 30 14, 45 8 S 73 2, 88 8 M2 20 C 17 14, 30 26, 45 20 S 73 14, 88 20 M2 32 C 17 26, 30 38, 45 32 S 73 26, 88 32" fill="none" stroke="#2A2733" strokeWidth="2" />
            </svg>
          </div>

          <div ref={flapRef} className={styles.flap}>
            <div className={styles.flapFace}>
              <svg viewBox="0 0 520 180" preserveAspectRatio="none" aria-hidden="true">
                <path d="M1.5 1.5 H518.5 L282 168 Q260 182 238 168 Z" fill="#F5D9A0" stroke="#2A2733" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
            <div className={`${styles.flapFace} ${styles.flapInside}`}>
              <svg viewBox="0 0 520 180" preserveAspectRatio="none" aria-hidden="true">
                <path d="M1.5 1.5 H518.5 L282 168 Q260 182 238 168 Z" fill="#E2BC77" stroke="#2A2733" strokeWidth="2.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
              </svg>
            </div>
          </div>

          <div ref={hintRef} className={styles.hint} aria-hidden="true">
            <span className={styles.meter}>
              <span ref={meterRef} className={styles.meterFill} />
            </span>
            {touch ? "Swipe up to open" : "Scroll to open"}
            <span className={styles.hintArrow}>↓</span>
          </div>
        </div>
      </div>

      {/* the stamp's double: flies from the board, sticks on the envelope */}
      <div ref={flyerRef} className={styles.flyer} aria-hidden="true">
        <StampFace scene={scene} />
        <span className={`${styles.stickTape} ${styles.stickTapeA}`} data-stick-tape />
        <span className={`${styles.stickTape} ${styles.stickTapeB}`} data-stick-tape />
      </div>

      <div ref={controlsRef}>
        <button ref={closeButtonRef} type="button" className={dialogStyles.close} onClick={close} aria-label="Close story">
          ×
        </button>
        <div className={dialogStyles.pager}>
          <button type="button" onClick={() => turn(-1)} disabled={index === 0} aria-label="Previous story">
            ←
          </button>
          <span className={dialogStyles.count}>
            {scene.number} / {String(scenes.length).padStart(2, "0")}
          </span>
          <button type="button" onClick={() => turn(1)} disabled={index === scenes.length - 1} aria-label="Next story">
            →
          </button>
        </div>
      </div>
    </dialog>
  );
}
