import type { Scene } from "@/content/site";
import { StampFace } from "./StampFace";
import styles from "./Stamp.module.css";

const TAPE_COLORS = ["var(--marigold)", "var(--lotus)", "var(--sage)"];

type Props = {
  scene: Scene;
  index: number;
  focused: boolean;
  touchHint: boolean;
  onPointerEnter: (event: React.PointerEvent) => void;
  onPointerLeave: (event: React.PointerEvent) => void;
  onPointerDown: (event: React.PointerEvent) => void;
  onActivate: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onKeyFocus: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyBlur: () => void;
};

/** One story stamp on the About board, taped down. The whole stamp is a button that opens it. */
export function StoryCard({ scene, index, focused, touchHint, onPointerEnter, onPointerLeave, onPointerDown, onActivate, onKeyFocus, onKeyBlur }: Props) {
  return (
    <article
      className={styles.card}
      style={
        {
          "--x": scene.x,
          "--tilt": `${scene.tilt}deg`,
          "--shadow": 6,
          "--tape-color": TAPE_COLORS[index % TAPE_COLORS.length],
        } as React.CSSProperties
      }
      data-card={index}
      data-row={scene.row}
      data-focused={focused || undefined}
      data-reveal="card"
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
    >
      <StampFace scene={scene} />

      <span className={styles.tape} data-tape aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerA}`} data-tape aria-hidden="true" />
      <span className={`${styles.corner} ${styles.cornerB}`} data-tape aria-hidden="true" />
      <span className={styles.focusLabel} aria-hidden="true" data-focus-label>
        {scene.number} · {touchHint ? "Tap again to open" : "Click to open"}
      </span>

      <button
        type="button"
        className={styles.hit}
        aria-label={`Open ${scene.number}: ${scene.title}`}
        aria-haspopup="dialog"
        onClick={onActivate}
        onFocus={onKeyFocus}
        onBlur={onKeyBlur}
      />
    </article>
  );
}
