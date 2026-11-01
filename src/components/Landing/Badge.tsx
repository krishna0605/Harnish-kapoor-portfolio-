import styles from "./Landing.module.css";

export function Badge() {
  return (
    <div aria-hidden="true" className={styles.badge}>
      <svg width="180" height="180" viewBox="0 0 180 180">
        <defs>
          <path id="hkBadgeCircle" d="M90,90 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
        </defs>
        <text className={styles.badgeText} fontSize="14" letterSpacing="3.2" fill="#2A2733">
          <textPath href="#hkBadgeCircle">ANIMATION · ILLUSTRATION · MOTION ·</textPath>
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
  );
}
