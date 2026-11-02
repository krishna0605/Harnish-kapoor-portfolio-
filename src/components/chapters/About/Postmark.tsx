// Circular postmark from the About design export ("SINCE 2017 · ANIMATION · DESIGN ·").
type Props = { id: string; text: string; className?: string };

/** A still ink mark: it is never animated. */
export function Postmark({ id, text, className }: Props) {
  return (
    <svg viewBox="0 0 190 150" aria-hidden="true" className={className}>
      <defs>
        <path id={id} d="M75,75 m-52,0 a52,52 0 1,1 104,0 a52,52 0 1,1 -104,0" />
      </defs>
      <circle cx="75" cy="75" r="66" fill="none" stroke="#2A2733" strokeWidth="2.5" opacity="0.8" />
      <circle cx="75" cy="75" r="40" fill="none" stroke="#2A2733" strokeWidth="1.6" opacity="0.8" />
      <text style={{ fontFamily: "var(--font-mono)" }} fontSize="11" letterSpacing="2.6" fill="#2A2733" opacity="0.85">
        <textPath href={`#${id}`}>{text}</textPath>
      </text>
      <text x="75" y="86" textAnchor="middle" style={{ fontFamily: "var(--font-accent)", fontStyle: "italic" }} fontSize="30" fill="#2A2733" opacity="0.85">
        HK
      </text>
      <path
        d="M137.25 53.19 C143.92 47.86 153.33 46.67 160 52 C164.22 55.37 168.44 56.61 172.65 55.72 C175.1 55.2 177.55 53.96 180 52 M140.62 71.35 C147.29 66.02 153.33 66.67 160 72 C166.67 77.33 173.33 77.33 180 72 M140 92 C146.67 86.67 153.33 86.67 160 92 C166.67 97.33 173.33 97.33 180 92"
        fill="none"
        stroke="#2A2733"
        strokeWidth="2"
        opacity="0.75"
      />
    </svg>
  );
}
