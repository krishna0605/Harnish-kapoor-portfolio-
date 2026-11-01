import type { Motif } from "@/content/site";

// Placeholder project artwork, drawn like the visual system's motifs:
// 2.5px ink outline, flat pastel fill, no gradients or soft shadows.

const INK = "#2A2733";
const line = { stroke: INK, strokeWidth: 2.5, strokeLinejoin: "round" as const, strokeLinecap: "round" as const };

function Moon() {
  return (
    <>
      <path d="M126 46 A62 62 0 1 0 156 136 A50 50 0 1 1 126 46 Z" fill="#F7F3EC" {...line} data-motif-main />
      <path d="M58 52 L61 64 L73 67 L61 70 L58 82 L55 70 L43 67 L55 64 Z" fill="#F7DDA4" {...line} data-motif-twinkle />
    </>
  );
}

function Lotus() {
  return (
    <g data-motif-main>
      <path d="M100 150 C64 146 44 126 38 104 C62 104 84 118 100 150 Z" fill="#F5C9C6" {...line} />
      <path d="M100 150 C136 146 156 126 162 104 C138 104 116 118 100 150 Z" fill="#F5C9C6" {...line} />
      <path d="M100 150 C76 130 70 96 82 70 C96 86 104 116 100 150 Z" fill="#F9DCDA" {...line} />
      <path d="M100 150 C124 130 130 96 118 70 C104 86 96 116 100 150 Z" fill="#F9DCDA" {...line} />
      <path d="M100 150 C86 120 88 76 100 48 C112 76 114 120 100 150 Z" fill="#F5C9C6" {...line} />
      <path d="M40 166 C60 158 80 174 100 166 S140 158 160 166" fill="none" {...line} />
    </g>
  );
}

function Sparkle() {
  return (
    <>
      <path d="M100 36 L112 88 L164 100 L112 112 L100 164 L88 112 L36 100 L88 88 Z" fill="#F7DDA4" {...line} data-motif-main />
      <path d="M150 40 L153 52 L165 55 L153 58 L150 70 L147 58 L135 55 L147 52 Z" fill="#DCD3F2" {...line} data-motif-twinkle />
    </>
  );
}

function Arch() {
  return (
    <>
      <path d="M58 168 V96 A42 42 0 0 1 142 96 V168 Z" fill="#DCD3F2" {...line} data-motif-main />
      <path d="M58 168 H142" fill="none" {...line} />
      <path d="M100 82 L104 96 L118 100 L104 104 L100 118 L96 104 L82 100 L96 96 Z" fill="#F7F3EC" {...line} data-motif-twinkle />
    </>
  );
}

const MOTIFS: Record<Motif, () => React.JSX.Element> = { moon: Moon, lotus: Lotus, sparkle: Sparkle, arch: Arch };

export function MotifArt({ motif, className }: { motif: Motif; className?: string }) {
  const Art = MOTIFS[motif];
  return (
    <svg viewBox="0 0 200 200" aria-hidden="true" className={className}>
      <Art />
    </svg>
  );
}
