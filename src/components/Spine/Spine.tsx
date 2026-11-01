"use client";

import { PeekArrow } from "@/components/icons/Arrows";
import { useChapters } from "@/components/Track/ChapterContext";
import { CHAPTERS } from "@/content/site";
import styles from "./Spine.module.css";

/** Pastel strip at the start of a chapter; it peeks in at the right edge of the chapter before. */
export function Spine({ index }: { index: number }) {
  const { goTo } = useChapters();
  const chapter = CHAPTERS[index];

  return (
    <a
      href={`#${chapter.id}`}
      aria-label={`Chapter ${chapter.number}: ${chapter.label}`}
      className={styles.spine}
      style={{ background: chapter.color }}
      onClick={(event) => {
        event.preventDefault();
        goTo(index);
      }}
    >
      <span className={styles.number}>{chapter.number}</span>
      <span className={styles.title}>{chapter.spine}</span>
      <PeekArrow className={styles.arrow} />
    </a>
  );
}
