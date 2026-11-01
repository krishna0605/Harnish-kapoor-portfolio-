"use client";

import { useRef } from "react";
import { CHAPTERS } from "@/content/site";
import styles from "./Header.module.css";

/** Phone navigation: a full-screen <dialog> (native focus trap, Esc closes). */
export function MobileMenu({ active, onSelect }: { active: number; onSelect: (index: number) => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const select = (event: React.MouseEvent, index: number) => {
    event.preventDefault();
    dialogRef.current?.close();
    onSelect(index);
  };

  return (
    <>
      <button type="button" className={styles.menuButton} onClick={() => dialogRef.current?.showModal()} data-reveal="header">
        Menu
      </button>
      <dialog ref={dialogRef} className={styles.sheet} aria-label="Chapters">
        <div className={styles.sheetInner}>
          <div className={styles.sheetTop}>
            <button type="button" className={styles.menuButton} style={{ display: "block" }} onClick={() => dialogRef.current?.close()}>
              Close
            </button>
          </div>
          <ul className={styles.sheetList}>
            {CHAPTERS.map((chapter, index) => (
              <li key={chapter.id}>
                <a
                  href={`#${chapter.id}`}
                  className={styles.sheetLink}
                  aria-current={index === active ? "page" : undefined}
                  style={index === active ? { background: chapter.color } : undefined}
                  onClick={(event) => select(event, index)}
                >
                  <span className={styles.sheetNumber}>{chapter.number}</span>
                  <span className={styles.sheetLabel}>{chapter.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </dialog>
    </>
  );
}
