import { HkMonogram } from "@/components/icons/HkMonogram";
import styles from "./Landing.module.css";

const NAV = [
  { label: "01 Home", href: "#", current: true },
  { label: "02 About", href: "#", current: false },
  { label: "03 Projects", href: "#", current: false },
  { label: "04 Contact", href: "#", current: false },
];

export function Header() {
  return (
    <header className={styles.header}>
      <a href="#" className={styles.brand} aria-label="Harnish Kapoor — home">
        <span className={styles.brandMark}>
          <HkMonogram />
        </span>
      </a>
      <nav aria-label="Main" className={styles.nav}>
        {NAV.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-current={item.current ? "page" : undefined}
            className={item.current ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink}
          >
            {item.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
