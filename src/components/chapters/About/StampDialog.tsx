"use client";

import Image from "next/image";
import { useLayoutEffect, useRef } from "react";
import { useChapters } from "@/components/Track/ChapterContext";
import { ABOUT } from "@/content/site";
import { gsap } from "@/lib/gsap";
import { mediaUrl } from "@/lib/media";
import { playSound } from "@/lib/sound";
import { useReducedMotion } from "@/lib/useMediaQuery";
import styles from "./Dialog.module.css";
import { Postmark } from "./Postmark";

/** billguo.me-style stamp moment: the portrait stamp flies to the centre over a blurred page. */
export function StampDialog({ getSource, onClose }: { getSource: () => HTMLElement | null; onClose: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const frostRef = useRef<HTMLDivElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const closing = useRef(false);
  const { lockScroll } = useChapters();
  const reduced = useReducedMotion();

  const fromStamp = (source: HTMLElement | null) => {
    const target = figureRef.current!.getBoundingClientRect();
    if (!source) return { x: 0, y: 0, scale: 0.5, rotation: 4 };
    const stamp = source.getBoundingClientRect();
    return {
      x: stamp.left + stamp.width / 2 - (target.left + target.width / 2),
      y: stamp.top + stamp.height / 2 - (target.top + target.height / 2),
      scale: stamp.width / target.width,
      rotation: 4,
    };
  };

  useLayoutEffect(() => {
    dialogRef.current!.showModal();
    lockScroll(true);
    const figure = figureRef.current!;
    const source = getSource();
    const tl = gsap.timeline({ defaults: { ease: "power3.inOut" } });
    playSound("quick");
    if (reduced) {
      tl.fromTo([frostRef.current, figure], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 });
    } else {
      tl.fromTo(frostRef.current, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4, ease: "power2.out" }, 0)
        .add(() => {
          if (source) gsap.set(source, { autoAlpha: 0 });
        }, 0)
        .fromTo(figure, fromStamp(source), { x: 0, y: 0, scale: 1, rotation: -2, duration: 0.8 }, 0)
        .fromTo(figure.querySelector("[data-caption]"), { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4, ease: "expo.out" }, 1);
    }
    return () => {
      tl.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const close = () => {
    if (closing.current) return;
    closing.current = true;
    const source = getSource();
    const done = () => {
      if (source) gsap.set(source, { autoAlpha: 1 });
      dialogRef.current?.close();
      lockScroll(false);
      onClose();
    };
    playSound("slide");
    if (reduced) {
      gsap.to(dialogRef.current, { autoAlpha: 0, duration: 0.2, onComplete: done });
      return;
    }
    gsap
      .timeline({ defaults: { ease: "power3.inOut" }, onComplete: done })
      .to(figureRef.current!.querySelector("[data-caption]"), { autoAlpha: 0, duration: 0.15 }, 0)
      .to(figureRef.current, { ...fromStamp(source), duration: 0.65 }, 0)
      .to(frostRef.current, { autoAlpha: 0, duration: 0.4 }, 0.3);
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label={ABOUT.stampCaption}
      onCancel={(event) => {
        event.preventDefault();
        close();
      }}
      onClick={close}
    >
      <div ref={frostRef} className={styles.frost} />
      <div className={styles.stage}>
        <figure ref={figureRef} className={styles.stampFigure}>
          <Image src={mediaUrl("/images/portrait-stamp.png")} alt={ABOUT.stampAlt} width={788} height={788} draggable={false} unoptimized />
          <Postmark id="stampDialogPostmark" text={ABOUT.postmark} className={styles.stampPostmark} />
          <figcaption className={styles.caption} data-caption>
            {ABOUT.stampCaption}
          </figcaption>
        </figure>
      </div>
      <button type="button" className={styles.close} onClick={close} aria-label="Close" autoFocus>
        ×
      </button>
    </dialog>
  );
}
