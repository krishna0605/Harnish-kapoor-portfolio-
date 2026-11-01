import { ArrowRight } from "@/components/icons/Arrows";
import { Squiggle } from "@/components/icons/Squiggle";
import { ArchFrame } from "./ArchFrame";
import styles from "./Landing.module.css";

export function Hero() {
  return (
    <div className={styles.hero}>
      <div className={styles.intro}>
        <h1 className={styles.name}>
          <span className={styles.nameLine}>Harnish</span>
          <span className={styles.nameLineIndent}>
            Kapoor
            <Squiggle className={styles.squiggle} />
          </span>
        </h1>

        <p className={styles.role}>
          Graphic Designer <span className={styles.roleAmp}>&amp;</span>
          <br />
          Motion Graphic Designer
        </p>

        <div className={styles.actions}>
          <a href="#" className={styles.cta}>
            Explore my work
            <ArrowRight />
          </a>
          <p className={styles.tagline}>Stories drawn by hand and set in motion.</p>
        </div>
      </div>

      <ArchFrame />
    </div>
  );
}
