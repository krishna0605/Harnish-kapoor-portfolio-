// Marigold pond-wave underline beneath "Kapoor" — same wave as the design export
// (102px humps, 2.5px ink line over a 12px marigold line), extended to both sides
// so it can flow sideways forever: sliding by one full wave (204px) loops seamlessly.

const HUMP = 102;
const START = -200; // 4 − 2 × 102, so the visible wave sits where the original did
const humps = Array.from({ length: 9 }, (_, i) => {
  const a = START + i * HUMP;
  const y = i % 2 === 0 ? 3 : 39;
  return `C ${a + 34} ${y}, ${a + 68} ${y}, ${a + HUMP} 21`;
});
const WAVE = `M ${START} 21 ${humps.join(" ")}`;

export function Squiggle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 430 40" aria-hidden="true" className={className}>
      <defs>
        {/* soft ends instead of hard cuts while the wave flows */}
        <linearGradient id="hkSquiggleFade" x1="0" x2="430" y1="0" y2="0" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.05" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.95" stopColor="#fff" stopOpacity="1" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
        <mask id="hkSquiggleMask" maskUnits="userSpaceOnUse" x="0" y="0" width="430" height="40">
          <rect data-squiggle-wipe x="0" y="0" width="430" height="40" fill="url(#hkSquiggleFade)" />
        </mask>
      </defs>
      <g mask="url(#hkSquiggleMask)">
        <g data-squiggle-wave>
          <path d={WAVE} fill="none" stroke="#F7DDA4" strokeWidth="12" strokeLinecap="round" />
          <path d={WAVE} fill="none" stroke="#2A2733" strokeWidth="2.5" strokeLinecap="round" />
        </g>
      </g>
    </svg>
  );
}
