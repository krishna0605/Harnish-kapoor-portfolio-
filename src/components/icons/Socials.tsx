// Small hand-drawn social icons in the visual system's ink-outline style (not brand logo files).

const line = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

function Behance() {
  return (
    <>
      <path d="M3.5 6.5 V17.5 H8.2 Q11 17.5 11 14.6 Q11 12.3 8.6 12 Q10.4 11.6 10.4 9.4 Q10.4 6.5 7.6 6.5 Z M3.5 12 H8.4" {...line} />
      <path d="M13.2 13.6 H20.4 Q20.4 10 17.2 10 Q13.6 10 13.6 13.9 Q13.6 17.6 17.2 17.6 Q19.4 17.6 20.2 15.9 M14.4 7 H19.6" {...line} />
    </>
  );
}

function Instagram() {
  return (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="5" {...line} />
      <circle cx="12" cy="12" r="4" {...line} />
      <circle cx="17.2" cy="6.9" r="0.9" fill="currentColor" />
    </>
  );
}

function LinkedIn() {
  return (
    <>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" {...line} />
      <path d="M8 10.5 V16.5 M8 7.6 V7.7 M11.5 16.5 V10.5 M11.5 13 Q11.5 10.4 13.9 10.4 Q16.4 10.4 16.4 13 V16.5" {...line} />
    </>
  );
}

const ICONS = { Behance, Instagram, LinkedIn } as const;

export function SocialIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICONS[name as keyof typeof ICONS];
  if (!Icon) return null;
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <Icon />
    </svg>
  );
}
