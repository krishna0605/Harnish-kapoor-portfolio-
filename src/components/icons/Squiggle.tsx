// Marigold pond-wave underline beneath "Kapoor" — from the design export.
const WAVE = "M4 22 C 40 4, 70 38, 106 20 S 172 4, 208 22 S 274 38, 310 20 S 376 4, 426 20";

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg width="430" height="40" viewBox="0 0 430 40" aria-hidden="true" className={className}>
      <path d={WAVE} fill="none" stroke="#F7DDA4" strokeWidth="12" strokeLinecap="round" />
      <path d={WAVE} fill="none" stroke="#2A2733" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}
