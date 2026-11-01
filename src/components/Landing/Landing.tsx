import { Badge } from "./Badge";
import { ChapterPeek } from "./ChapterPeek";
import { Footer } from "./Footer";
import { Header } from "./Header";
import { Hero } from "./Hero";
import styles from "./Landing.module.css";

/** Chapter 01 — Home. A 1920×1080 artboard; <Stage> scales it to the window. */
export function Landing() {
  return (
    <div className={styles.root}>
      {/* MAIN PANEL (chapter 01) */}
      <div className={styles.main}>
        <Header />
        <Hero />
        <Footer />
        <Badge />
      </div>

      {/* NEXT CHAPTER PEEK */}
      <ChapterPeek />
    </div>
  );
}
