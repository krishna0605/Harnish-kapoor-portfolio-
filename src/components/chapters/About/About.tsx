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
        <ul className={`${shared.tags} ${styles.skills}`} aria-label="Skills" data-reveal="block">
          {ABOUT.skills.map((skill) => (
            <li key={skill} className={shared.tag}>
              {skill}
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.frame} data-reveal="block">
        <MotifArt motif="moon" className={styles.moon} />
        <h3 className={`${shared.label} ${styles.frameLabel}`}>Experience</h3>
        <ul className={styles.jobs}>
          {ABOUT.experience.map((job) => (
            <li key={job.role + job.company} className={styles.job}>
              <span className={styles.jobRole}>{job.role}</span>
              <span className={styles.jobMeta}>
                <span>{job.company}</span>
                <span className={styles.jobPeriod}>{job.period}</span>
              </span>
              <p className={styles.jobSummary}>{job.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
