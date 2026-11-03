"use client";

import { useRef, useState } from "react";
import { useChapters } from "@/components/Track/ChapterContext";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { ARCHIVE, chapterIndex, type ProjectFile, type ProjectFilter } from "@/content/site";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import { FolderTab, SLOTS } from "./FolderTab";
import { OpenFolder } from "./OpenFolder";
import styles from "./Projects.module.css";

const PROJECTS: ProjectFile[] = ARCHIVE.projects;
type Filter = "all" | ProjectFilter;

const pad = (n: number) => String(n).padStart(2, "0");
const matches = (project: ProjectFile, filter: Filter) => filter === "all" || project.filters.includes(filter);

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
 * and lies open with its cover and brief. Pulling another tab swaps them.
 */
export function Projects() {
  const ref = useRef<HTMLElement>(null);
  const { goTo } = useChapters();
  const [openId, setOpenId] = useState(PROJECTS[0].id);
  const [filter, setFilter] = useState<Filter>("all");
  const [announce, setAnnounce] = useState("");
  useChapterReveal(ref);

  const open = PROJECTS.find((project) => project.id === openId)!;
  const closed = PROJECTS.filter((project) => project.id !== openId);
  const step = closed.length > SLOTS.length ? (96 * SLOTS.length) / closed.length : 96;
  const years = ARCHIVE.intro.since;

  const pull = (project: ProjectFile) => {
    if (project.id === openId) return;
    setOpenId(project.id);
    setAnnounce(`Showing ${project.number}: ${project.title}`);
  };

  const choose = (next: Filter) => {
    setFilter(next);
    if (!matches(open, next)) {
      const first = PROJECTS.find((project) => matches(project, next));
      if (first) pull(first);
    }
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
              {pad(PROJECTS.length)} files · {years}
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
                  <button
                    key={id}
                    type="button"
                    className={styles.filter}
                    aria-pressed={filter === id}
                    data-filter={id}
                    onClick={() => choose(id)}
                  >
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

          <div className={styles.drawer} data-drawer>
            <span className={styles.drawerBase} aria-hidden="true" data-drawer-base />
            <ul className={styles.folders} aria-label="Project files">
              {closed.map((project, slot) => (
                <FolderTab
                  key={project.id}
                  project={project}
                  slot={slot}
                  step={step}
                  sunk={!matches(project, filter)}
                  armed={false}
                  onOpen={() => pull(project)}
                  onPointerEnter={() => {}}
                  onPointerLeave={() => {}}
                  onPointerDown={() => {}}
                  onFocus={() => {}}
                  onBlur={() => {}}
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
          <OpenFolder key={open.id} project={open} onOpenCase={() => {}} />
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {announce}
      </p>
    </section>
  );
}
