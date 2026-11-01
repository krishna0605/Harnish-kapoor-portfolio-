import styles from "./ui.module.css";

/**
 * Renders text as individually animatable letters. Screen readers get the plain
 * text once; the letter spans are hidden from them.
 */
export function SplitLetters({ text, reveal }: { text: string; reveal?: string }) {
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span key={i} className={styles.letter} data-letter data-reveal={reveal}>
            {char === " " ? " " : char}
          </span>
        ))}
      </span>
    </>
  );
}
