import styles from "./Stage.module.css";

export function Stage({ children }: { children: React.ReactNode }) {
  return <div className={styles.stage}>{children}</div>;
}
