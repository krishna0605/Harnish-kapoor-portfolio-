import type { CoverArtId } from "@/content/site";

// Placeholder covers in the site's ink-outline style (334×214, the open folder's picture frame).
// The first is the insect-and-moon still from the design export. Swap for real images by
// giving the project's cover a `src` in src/content/site.ts.

const INK = "#2A2733";
const PAPER = "#F7F3EC";
const WHITE = "#FFFDF9";
const PINK = "#F5C9C6";
const MARIGOLD = "#F7DDA4";
const POND = "#C3DAEC";
const SAGE = "#CFE0C3";
const LILAC = "#DCD3F2";

/** Background of each placeholder picture, chosen to sit well on its folder colour. */
export const COVER_BACKGROUND: Record<CoverArtId, string> = {
  insect: LILAC,
  mood: MARIGOLD,
  fold: POND,
  posters: WHITE,
  handbook: SAGE,
  books: MARIGOLD,
  motion: PINK,
  boards: POND,
};

function Insect() {
  return (
    <>
      <circle cx="232" cy="78" r="44" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M0 160 C 60 140, 110 176, 170 156 S 280 138, 334 152 V 214 H 0 Z" fill={SAGE} stroke={INK} strokeWidth="2" />
      <ellipse cx="112" cy="104" rx="16" ry="10" fill={INK} />
      <path d="M102 98 L90 84 M110 95 L106 78 M120 96 L128 82 M98 108 L84 114 M126 110 L140 116" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M112 112 C 130 132, 150 120, 170 140" fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="3 5" />
    </>
  );
}

function Mood() {
  return (
    <>
      <path d="M96 150 A 71 71 0 0 1 238 150 Z" fill={PINK} stroke={INK} strokeWidth="2" />
      <path d="M167 58 V 40 M110 82 L98 70 M224 82 L236 70 M86 128 H 68 M248 128 H 266" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M0 150 H 334 V 214 H 0 Z" fill={POND} stroke={INK} strokeWidth="2" />
      <path d="M24 172 H 92 M140 186 H 220 M250 170 H 310" stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
      <path d="M60 52 q 8 -8 16 0 q 8 -8 16 0 M262 38 q 6 -6 12 0 q 6 -6 12 0" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
    </>
  );
}

function Fold() {
  return (
    <>
      <path d="M70 60 L167 40 L167 168 L70 186 Z" fill={WHITE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M167 40 L264 60 L264 186 L167 168 Z" fill={MARIGOLD} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M167 40 V 168" stroke={INK} strokeWidth="1.6" strokeDasharray="4 5" />
      <circle cx="118" cy="104" r="20" fill={PINK} stroke={INK} strokeWidth="2" />
      <path d="M196 92 H 238 M196 110 H 238 M196 128 H 224" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M280 120 C 300 100, 300 76, 286 60 M280 64 L286 58 L292 66" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Posters() {
  return (
    <>
      <g transform="rotate(-4 108 107)">
        <rect x="52" y="30" width="112" height="154" fill={SAGE} stroke={INK} strokeWidth="2" />
        <circle cx="108" cy="88" r="30" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
        <path d="M68 150 H 148 M68 164 H 128" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="108" cy="30" r="5" fill={PINK} stroke={INK} strokeWidth="1.6" />
      </g>
      <g transform="rotate(5 226 107)">
        <rect x="170" y="30" width="112" height="154" fill={LILAC} stroke={INK} strokeWidth="2" />
        <path d="M226 54 L262 120 H 190 Z" fill={PINK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
        <path d="M186 150 H 266 M186 164 H 240" stroke={INK} strokeWidth="2" strokeLinecap="round" />
        <circle cx="226" cy="30" r="5" fill={MARIGOLD} stroke={INK} strokeWidth="1.6" />
      </g>
    </>
  );
}

function Handbook() {
  return (
    <>
      <path d="M167 52 C 130 40, 92 40, 56 52 V 176 C 92 164, 130 164, 167 176 Z" fill={WHITE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M167 52 C 204 40, 242 40, 278 52 V 176 C 242 164, 204 164, 167 176 Z" fill={WHITE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M78 78 H 146 M78 94 H 146 M78 110 H 136 M78 126 H 146 M78 142 H 124" stroke={INK} strokeWidth="1.4" opacity="0.4" />
      <circle cx="222" cy="98" r="28" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
      <path d="M200 140 L216 122 L230 134 L246 116 L258 140 Z" fill={PINK} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  );
}

function Books() {
  return (
    <>
      <rect x="62" y="22" width="210" height="172" fill={WHITE} stroke={INK} strokeWidth="2" />
      <rect x="74" y="34" width="88" height="70" fill={POND} stroke={INK} strokeWidth="2" />
      <rect x="172" y="34" width="88" height="70" fill={PINK} stroke={INK} strokeWidth="2" />
      <rect x="74" y="114" width="186" height="68" fill={SAGE} stroke={INK} strokeWidth="2" />
      <path d="M190 56 h 54 a 8 8 0 0 1 8 8 v 14 a 8 8 0 0 1 -8 8 h -34 l -10 10 v -10 h -10 a 8 8 0 0 1 -8 -8 v -14 a 8 8 0 0 1 8 -8 z" fill={WHITE} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <circle cx="118" cy="72" r="14" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
      <path d="M96 160 L130 136 L160 156 L196 130 L236 160" fill="none" stroke={INK} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </>
  );
}

function Motion() {
  return (
    <>
      <path d="M40 164 C 100 40, 190 40, 294 132" fill="none" stroke={INK} strokeWidth="1.8" strokeDasharray="4 6" />
      <circle cx="58" cy="132" r="12" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.35" />
      <circle cx="102" cy="82" r="14" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.55" />
      <circle cx="160" cy="62" r="16" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.8" />
      <rect x="208" y="62" width="34" height="34" rx="6" transform="rotate(18 225 79)" fill={LILAC} stroke={INK} strokeWidth="2" />
      <path d="M268 104 L290 92 L286 118 Z" fill={WHITE} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M24 192 H 310" stroke={INK} strokeWidth="2" />
    </>
  );
}

function Boards() {
  return (
    <>
      {[28, 128, 228].map((x, i) => (
        <g key={x}>
          <rect x={x} y="44" width="80" height="58" fill={WHITE} stroke={INK} strokeWidth="2" />
          <path d={`M${x} 124 H ${x + 80} M${x} 136 H ${x + 56}`} stroke={INK} strokeWidth="1.6" strokeLinecap="round" opacity="0.5" />
          <text x={x} y="38" fontFamily="DM Mono, monospace" fontSize="10" letterSpacing="1" fill={INK}>
            {String(i + 1).padStart(2, "0")}
          </text>
        </g>
      ))}
      <circle cx="58" cy="78" r="12" fill={PINK} stroke={INK} strokeWidth="2" />
      <path d="M150 92 L168 62 L186 92 Z" fill={MARIGOLD} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <circle cx="268" cy="72" r="9" fill={SAGE} stroke={INK} strokeWidth="2" />
      <path d="M256 92 L280 92" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <path d="M112 72 H 124 M212 72 H 224" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

const ART: Record<CoverArtId, () => React.JSX.Element> = {
  insect: Insect,
  mood: Mood,
  fold: Fold,
  posters: Posters,
  handbook: Handbook,
  books: Books,
  motion: Motion,
  boards: Boards,
};

export function CoverArt({ art, className }: { art: CoverArtId; className?: string }) {
  const Art = ART[art];
  return (
    <svg viewBox="0 0 334 214" preserveAspectRatio="xMidYMid slice" className={className} aria-hidden="true">
      <Art />
    </svg>
  );
}
