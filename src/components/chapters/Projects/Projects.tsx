"use client";

import { useRef } from "react";
import { MotifArt } from "@/components/icons/Motifs";
import { useChapters } from "@/components/Track/ChapterContext";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { PROJECTS, PROJECTS_INTRO } from "@/content/site";
import { gsap, useGSAP } from "@/lib/gsap";
import { useReducedMotion } from "@/lib/useMediaQuery";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import styles from "./Projects.module.css";

/** Chapter 04 — Projects (demo content from src/content/site.ts). */
export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const { containerAnimation } = useChapters();
  const reduced = useReducedMotion();
  useChapterReveal(ref);

  // Each card rises in as it slides into view
  useGSAP(
    () => {
      if (reduced || !containerAnimation) return;
      gsap.utils.toArray<HTMLElement>("[data-project]", ref.current).forEach((card) => {
        gsap.fromTo(
          card,
          { autoAlpha: 0, y: 40, scale: 0.96 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1,
            ease: "expo.out",
            scrollTrigger: { trigger: card, containerAnimation, start: "left 92%", toggleActions: "play none none none" },
          },
        );
      });
    },
    { scope: ref, dependencies: [reduced, containerAnimation], revertOnUpdate: true },
  );

  return (
    <section
      id="projects"
      ref={ref}
      className={`${shared.chapter} ${styles.projects}`}
      aria-labelledby="projects-title"
      data-chapter
      data-snap
    >
      <div className={styles.intro}>
        <h2 id="projects-title" className={shared.title}>
          {PROJECTS_INTRO.title.map((line) => (
            <span key={line} className={shared.titleLine}>
              <SplitLetters text={line} reveal="title" />
            </span>
          ))}
        </h2>
        <p className={shared.subtitle} data-reveal="block">
          {PROJECTS_INTRO.subtitle}
        </p>
        <span className={`${shared.label} ${styles.count}`} data-reveal="block">
          {String(PROJECTS.length).padStart(2, "0")} projects →
        </span>
      </div>

      {PROJECTS.map((project) => (
        <div key={project.title} className={styles.cell} data-snap>
          <a href={project.href || undefined} className={styles.card} data-project data-reveal="project">
            <div className={styles.media}>
              <MotifArt motif={project.motif} className={styles.art} />
            </div>
            <h3 className={styles.cardTitle}>{project.title}</h3>
            <p className={styles.cardSubtitle}>{project.subtitle}</p>
            <ul className={`${shared.tags} ${styles.cardTags}`}>
              {project.tags.map((tag) => (
                <li key={tag} className={shared.tag}>
                  {tag}
                </li>
              ))}
            </ul>
          </a>
        </div>
      ))}
    </section>
  );
}
