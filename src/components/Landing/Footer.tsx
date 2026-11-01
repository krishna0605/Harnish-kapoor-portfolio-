import { ArrowLong } from "@/components/icons/Arrows";
import styles from "./Landing.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.scrollHint}>
        <span>Scroll or drag</span>
        <ArrowLong />
      </div>
    </footer>
  );
}
