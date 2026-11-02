import type { Scene } from "@/content/site";
import { SceneArt } from "./SceneArt";
import styles from "./Stamp.module.css";

/** A story printed as a postage stamp. Used on the board and, shrunk, on the envelope. */
export function StampFace({ scene, className }: { scene: Scene; className?: string }) {
  return (
    <div className={className ? `${styles.stamp} ${className}` : styles.stamp}>
      <div className={styles.inner}>
        <div className={styles.head}>
          <span className={styles.value}>{scene.number}</span>
          <span className={styles.kicker}>{scene.kicker}</span>
        </div>
        <div className={styles.art}>
          <SceneArt art={scene.art} color={scene.color} />
        </div>
        <h3 className={styles.title}>{scene.title}</h3>
        {scene.text && <p className={styles.text}>{scene.text}</p>}
        {scene.roles && (
          <ul className={styles.roles}>
            {scene.roles.map((role) => (
              <li key={role.role}>
                <span className={styles.roleName}>{role.role}</span>
                <span className={styles.roleCompany}>{role.company}</span>
              </li>
            ))}
          </ul>
        )}
        <ul className={styles.tags}>
          {scene.tags.map((tag) => (
            <li key={tag.label} className={tag.accent ? `${styles.tag} ${styles.tagAccent}` : styles.tag}>
              {tag.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
