"use client";

import { useRef } from "react";
import { MotifArt } from "@/components/icons/Motifs";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { ABOUT } from "@/content/site";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import styles from "./About.module.css";

/** Chapter 02 — About (demo content from src/content/site.ts). */
export function About() {
  const ref = useRef<HTMLElement>(null);
  useChapterReveal(ref);

  return (
    <section id="about" ref={ref} className={`${shared.chapter} ${styles.about}`} aria-labelledby="about-title" data-chapter data-snap>
      <div className={styles.text}>
        <h2 id="about-title" className={shared.title}>
          <span className={shared.titleLine}>
            <SplitLetters text={ABOUT.title} reveal="title" />
          </span>
        </h2>
        <p className={shared.subtitle} data-reveal="block">
          {ABOUT.subtitle}
        </p>
        <p className={`${shared.body} ${styles.bio}`} data-reveal="block">
          {ABOUT.bio}
        </p>
        <div className={styles.actions} data-reveal="block">
          <a href={ABOUT.cvHref} className={shared.button}>
            {ABOUT.cvLabel} ↓
          </a>
        </div>
      </div>

      <div className={styles.frame} data-reveal="block">
        <MotifArt motif="moon" className={styles.moon} />
        <h3 className={`${shared.label} ${styles.frameLabel}`}>{ABOUT.skillsLabel}</h3>
        <ul className={styles.skills}>
          {ABOUT.skills.map((skill) => (
            <li key={skill} className={styles.skill}>
              {skill}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
