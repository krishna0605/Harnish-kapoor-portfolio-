import Image from "next/image";
import { ArchOrbit } from "@/components/icons/ArchOrbit";
import { Typewriter } from "@/components/ui/Typewriter";
import { HOME } from "@/content/site";
import { mediaUrl } from "@/lib/media";
import styles from "./ArchCard.module.css";

/** Portrait arch with the orbit ring, paper labels and badge. Animated by <Home>. */
export function ArchCard({ paused }: { paused: boolean }) {
  return (
    <div className={styles.cardWrap} data-card data-reveal="card">
      <div className={styles.arch} data-arch>
        <Image
          src={mediaUrl("/images/portrait-collage.png")}
          alt="Harnish Kapoor, portrait on torn pastel paper"
          width={635}
          height={775}
          className={styles.image}
          draggable={false}
          unoptimized
          priority
        />
        <ArchOrbit className={styles.orbit} />

        {/* yellow strip: status label */}
        <div className={styles.statusStrip} data-reveal="label">
          <span className={styles.statusDot} />
          <span>
            <span className={styles.statusLead}>{HOME.status[0]}</span>
            {HOME.status[1]}
          </span>
        </div>

        {/* white scrap: role, typed */}
        <div className={styles.roleScrap} data-reveal="label">
          <Typewriter
            lines={[
              [{ text: HOME.currentRole, className: styles.roleScrapTitle }],
              [{ text: HOME.currentCompany, className: styles.roleScrapCompany }],
            ]}
            startDelay={2400}
            holdMs={13000}
            paused={paused}
          />
        </div>

        {/* green ground: experience line */}
        <div className={styles.experience} data-reveal="label">
          {HOME.experience}
        </div>
      </div>

      <div className={styles.badge} aria-hidden="true" data-reveal="badge" data-badge>
        <div className={styles.badgeDisc} data-badge-disc>
          <svg width="180" height="180" viewBox="0 0 180 180">
            <defs>
              <path id="hkBadgeCircle" d="M90,90 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
            </defs>
            {/* textLength = the ring's circumference (2π·62): the words wrap it exactly once */}
            <text className={styles.badgeText} fontSize="11.5" fill="#2A2733">
              <textPath href="#hkBadgeCircle" textLength="389" lengthAdjust="spacing">
                {HOME.badge}
              </textPath>
            </text>
            <path
              d="M90 66 L96 84 L114 90 L96 96 L90 114 L84 96 L66 90 L84 84 Z"
              fill="#F5C9C6"
              stroke="#2A2733"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}
