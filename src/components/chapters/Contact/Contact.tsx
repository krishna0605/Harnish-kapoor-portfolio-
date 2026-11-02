"use client";

import { useRef, useState } from "react";
import { SocialIcon } from "@/components/icons/Socials";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { CONTACT } from "@/content/site";
import { useContactDetails } from "@/lib/contact";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import styles from "./Contact.module.css";

/** Chapter 05 — Contact. The form is a demo: there is no backend yet, nothing is sent. */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);
  const details = useContactDetails();
  useChapterReveal(ref);

  const copyEmail = async () => {
    if (!details) return;
    try {
      await navigator.clipboard.writeText(details.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked: the address is still on screen to select
    }
  };

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
        <div className={styles.reach} data-reveal="block">
          <div className={styles.emailRow}>
            {/* joined in the browser only: the server HTML holds no address */}
            <a href={details ? `mailto:${details.email}` : undefined} className={styles.email} data-contact="email">
              {details?.email ?? " "}
            </a>
            <button type="button" className={styles.copy} onClick={copyEmail} aria-label="Copy email address" data-sketch-allow>
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>
          <a href={details?.phoneHref} className={styles.phone} data-contact="phone">
            {details?.phone ?? " "}
          </a>
        </div>
        <ul className={`${shared.tags} ${styles.links}`} data-reveal="block">
          {CONTACT.links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className={`${shared.tag} ${styles.social}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Harnish on ${link.label} (opens in a new tab)`}
              >
                <SocialIcon name={link.label} className={styles.socialIcon} />
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
