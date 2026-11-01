import { PeekArrow } from "@/components/icons/Arrows";
import styles from "./Landing.module.css";

export function ChapterPeek() {
  return (
    <a href="#" aria-label="Next chapter: About" className={styles.peek}>
      <span className={styles.peekNumber}>02</span>
      <span className={styles.peekTitle}>About me →</span>
      <PeekArrow />
    </a>
  );
}
