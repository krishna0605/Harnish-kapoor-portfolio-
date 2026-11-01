"use client";

import { useRef } from "react";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { EXPERIENCE } from "@/content/site";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import styles from "./Experience.module.css";

// pond-wave timeline line (the visual system's divider motif)
const WAVE = `M 0 20 ${Array.from({ length: 12 }, (_, i) => {
  const a = i * 100;
  const y = i % 2 === 0 ? 4 : 36;
  return `C ${a + 33} ${y}, ${a + 67} ${y}, ${a + 100} 20`;
}).join(" ")}`;

/** Chapter 03 — Experience (demo content from src/content/site.ts). */
export function Experience() {
  const ref = useRef<HTMLElement>(null);
  useChapterReveal(ref);

  return (
    <section
      id="experience"
      ref={ref}
      className={`${shared.chapter} ${styles.experience}`}
      aria-labelledby="experience-title"
      data-chapter
      data-snap
    >
      <div>
        <h2 id="experience-title" className={shared.title}>
          <span className={shared.titleLine}>
            <SplitLetters text={EXPERIENCE.title} reveal="title" />
          </span>
        </h2>
        <p className={shared.subtitle} data-reveal="block">
          {EXPERIENCE.subtitle}
        </p>
      </div>

      <div className={styles.timeline}>
        <svg className={styles.line} viewBox="0 0 1200 40" preserveAspectRatio="none" aria-hidden="true" data-reveal="block">
          <path d={WAVE} fill="none" stroke="#2A2733" strokeWidth="2.5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <ol className={styles.roles}>
          {EXPERIENCE.roles.map((item) => (
            <li key={item.role + item.company} className={styles.item} data-reveal="block">
              <svg className={styles.node} viewBox="0 0 40 40" aria-hidden="true">
                <path
                  d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16 Z"
                  fill="#DCD3F2"
                  stroke="#2A2733"
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                />
              </svg>
              <div className={styles.card}>
                <span className={`${shared.label} ${styles.period}`}>{item.period}</span>
                <h3 className={styles.role}>{item.role}</h3>
                <span className={styles.company}>{item.company}</span>
                <p className={styles.summary}>{item.summary}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
