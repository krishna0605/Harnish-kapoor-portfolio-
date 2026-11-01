"use client";

import { useRef, useState } from "react";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { CONTACT } from "@/content/site";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import styles from "./Contact.module.css";

/** Chapter 04 — Contact. The form is a demo: there is no backend yet, nothing is sent. */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  useChapterReveal(ref);

  return (
    <section
      id="contact"
      ref={ref}
      className={`${shared.chapter} ${styles.contact}`}
      aria-labelledby="contact-title"
      data-chapter
      data-snap
    >
      <div className={styles.text}>
        <h2 id="contact-title" className={shared.title}>
          {CONTACT.title.map((line) => (
            <span key={line} className={shared.titleLine}>
              <SplitLetters text={line} reveal="title" />
            </span>
          ))}
        </h2>
        <p className={`${shared.subtitle} ${styles.subtitle}`} data-reveal="block">
          {CONTACT.subtitle}
        </p>
        <a href={`mailto:${CONTACT.email}`} className={styles.email} data-reveal="block">
          {CONTACT.email}
        </a>
        <ul className={`${shared.tags} ${styles.links}`} data-reveal="block">
          {CONTACT.links.map((link) => (
            <li key={link.label}>
              <a href={link.href} className={shared.tag}>
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <form
        className={styles.form}
        data-reveal="block"
        onSubmit={(event) => {
          event.preventDefault();
          setSent(true);
        }}
      >
        <label className={styles.field}>
          <span className={shared.label}>Name</span>
          <input className={styles.input} name="name" autoComplete="name" required />
        </label>
        <label className={styles.field}>
          <span className={shared.label}>Email</span>
          <input className={styles.input} name="email" type="email" autoComplete="email" required />
        </label>
        <label className={styles.field}>
          <span className={shared.label}>Message</span>
          <textarea className={`${styles.input} ${styles.textarea}`} name="message" required />
        </label>
        <div className={styles.submitRow}>
          <button type="submit" className={`${shared.button} ${styles.submit}`}>
            Send →
          </button>
          <p className={styles.note} role="status">
            {sent ? "Demo form — not connected yet." : ""}
          </p>
        </div>
      </form>
    </section>
  );
}
