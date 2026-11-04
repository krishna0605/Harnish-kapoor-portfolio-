"use client";

import { useRef, useState } from "react";
import { SocialIcon } from "@/components/icons/Socials";
import { SplitLetters } from "@/components/ui/SplitLetters";
import { TornPaper } from "@/components/ui/TornPaper";
import { CONTACT } from "@/content/site";
import { useContactDetails } from "@/lib/contact";
import { buildMailto, openMailto } from "@/lib/mailto";
import { playSound } from "@/lib/sound";
import shared from "../chapter.module.css";
import { useChapterReveal } from "../useChapterReveal";
import styles from "./Contact.module.css";

// the social scraps: pastels from the palette (Pond, Lotus, Lune), each stuck down at its own angle
const SOCIAL_COLORS = ["#C3DAEC", "#F5C9C6", "#DCD3F2"];
const SOCIAL_TILT = [-1.6, 1.2, -0.8];

/**
 * Chapter 05 — Contact. Send opens the visitor's own email app with the message ready,
 * addressed to Harnish: the site itself sends nothing and needs no server.
 */
export function Contact() {
  const ref = useRef<HTMLElement>(null);
  const [sent, setSent] = useState(false);
  const [mailto, setMailto] = useState<string | null>(null);
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
        <h2 id="contact-title" className={`${shared.title} ${styles.title}`}>
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
        {/* each link is a scrap of torn paper, like the form's Send tab */}
        <ul className={styles.links} data-reveal="block">
          {CONTACT.links.map((link, i) => (
            <li key={link.label} className={styles.socialItem} style={{ "--tilt": `${SOCIAL_TILT[i % SOCIAL_TILT.length]}deg` } as React.CSSProperties}>
              <TornPaper color={SOCIAL_COLORS[i % SOCIAL_COLORS.length]} seed={91 + i * 10} roughness={1.2} className={styles.socialTab}>
                <a
                  href={link.href}
                  className={styles.social}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Harnish on ${link.label} (opens in a new tab)`}
                  onPointerEnter={(event) => event.pointerType === "mouse" && playSound("quick", { throttle: 120, volume: 0.6 })}
                >
                  <SocialIcon name={link.label} className={styles.socialIcon} />
                  {link.label}
                </a>
              </TornPaper>
            </li>
          ))}
        </ul>
      </div>

      <form
        className={styles.form}
        data-reveal="block"
        data-mailto={mailto ?? undefined}
        onSubmit={(event) => {
          event.preventDefault();
          if (!details) return;
          const data = new FormData(event.currentTarget);
          const href = buildMailto({
            to: details.email,
            subject: CONTACT.form.subject,
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            message: String(data.get("message") ?? ""),
          });
          setMailto(href);
          setSent(true);
          playSound("slide", { volume: 0.7 });
          openMailto(href);
        }}
      >
        <span className={`${styles.tape} ${styles.tapeA}`} aria-hidden="true" />
        <span className={`${styles.tape} ${styles.tapeB}`} aria-hidden="true" />
        <TornPaper color="#FFFDF8" seed={41} roughness={1.8} className={styles.sheet}>
          <label className={styles.field}>
            <span className={shared.label}>Name</span>
            <TornPaper color="#CFE0C3" seed={51} edges={{ left: false, right: false }} className={styles.strip}>
              <input className={styles.input} name="name" autoComplete="name" required />
            </TornPaper>
          </label>
          <label className={styles.field}>
            <span className={shared.label}>Email</span>
            <TornPaper color="#CFE0C3" seed={61} edges={{ left: false, right: false }} className={styles.strip}>
              <input className={styles.input} name="email" type="email" autoComplete="email" required />
            </TornPaper>
          </label>
          <label className={styles.field}>
            <span className={shared.label}>Message</span>
            <TornPaper color="#CFE0C3" seed={71} edges={{ left: false, right: false }} className={styles.strip}>
              <textarea className={`${styles.input} ${styles.textarea}`} name="message" required />
            </TornPaper>
          </label>
          <div className={styles.submitRow}>
            <TornPaper color="#F7DDA4" seed={81} edges={{ top: false, bottom: false, left: false }} className={styles.sendTab}>
              <button type="submit" className={styles.submit}>
                Send →
              </button>
            </TornPaper>
            <p className={styles.note} role="status">
              {sent && (
                <>
                  {CONTACT.form.sentNote}{" "}
                  <button type="button" className={styles.noteLink} onClick={copyEmail} data-sketch-allow>
                    {copied ? "Address copied ✓" : "No email app? Copy the address"}
                  </button>
                </>
              )}
            </p>
          </div>
        </TornPaper>
      </form>
    </section>
  );
}
