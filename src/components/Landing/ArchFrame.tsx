import Image from "next/image";
import { ArchOrbit } from "@/components/icons/ArchOrbit";
import { mediaUrl } from "@/lib/media";
import styles from "./Landing.module.css";

export function ArchFrame() {
  return (
    <div className={styles.archColumn}>
      <div className={styles.arch}>
        <Image
          src={mediaUrl("/images/portrait-collage.png")}
          alt="Harnish Kapoor, portrait on torn pastel paper"
          width={635}
          height={775}
          className={styles.archImage}
          unoptimized
          priority
        />
        <ArchOrbit className={styles.archOrbit} />

        {/* yellow strip: status label */}
        <div className={styles.statusStrip}>
          <span className={styles.statusDot} />
          <span>Currently working as</span>
        </div>

        {/* white scrap: role */}
        <div className={styles.roleScrap}>
          <span className={styles.roleScrapTitle}>Graphic Designer</span>
          <span className={styles.roleScrapCompany}>at Accenture</span>
        </div>

        {/* green ground: experience line */}
        <div className={styles.experience}>
          <span className={styles.experienceText}>
            3+ years drawing brands, explainers and a festival-selected short film — every still designed as if
            it’s about to move.
          </span>
        </div>
      </div>
    </div>
  );
}
