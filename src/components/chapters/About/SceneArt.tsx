import type { SceneArtId } from "@/content/site";
import styles from "./SceneArt.module.css";

// Storyboard illustrations — paths copied from the About design export (324×170 frames).
// The art is printed on the stamp: still, with a paper finish (see About.module.css).

const INK = "#2A2733";
const PAPER = "#FFFDF9";
const PINK = "#F5C9C6";
const MARIGOLD = "#F7DDA4";
const LILAC = "#DCD3F2";

function School() {
  return (
    <>
      <path d="M162 44 L92 38 L92 134 L162 140 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M162 44 L232 38 L232 134 L162 140 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M104 62 H150 M104 76 H150 M104 90 H144 M104 104 H150 M104 118 H136" stroke={INK} strokeWidth="1.4" opacity="0.35" />
      <circle cx="190" cy="80" r="18" fill={PINK} stroke={INK} strokeWidth="2" />
      <path d="M206 106 L210 117 L221 121 L210 125 L206 136 L202 125 L191 121 L202 117 Z" fill={MARIGOLD} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <g>
        <g transform="rotate(-38 262 96)">
          <rect x="232" y="88" width="60" height="16" rx="2" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
          <path d="M292 88 L310 96 L292 104 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
          <rect x="222" y="88" width="10" height="16" rx="2" fill={PINK} stroke={INK} strokeWidth="2" />
        </g>
      </g>
      <path d="M54 30 L58 42 L70 46 L58 50 L54 62 L50 50 L38 46 L50 42 Z" fill={PAPER} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  );
}

// onion-skin frames of a bouncing ball
function Bounce() {
  return (
    <>
      <path d="M24 140 H300" stroke={INK} strokeWidth="2" />
      <path d="M44 40 Q 92 40 130 128 Q 176 54 226 54 Q 262 54 290 128" fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="4 6" />
      <circle cx="48" cy="40" r="13" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.3" />
      <circle cx="92" cy="58" r="13" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.5" />
      <ellipse cx="130" cy="131" rx="17" ry="9" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
      <ellipse cx="166" cy="76" rx="11" ry="15" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.7" />
      <circle cx="214" cy="55" r="13" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
      <path d="M252 24 V40 M244 32 H260" stroke={INK} strokeWidth="2" strokeLinecap="round" />
    </>
  );
}

// three storyboard panels
function Storyboard() {
  return (
    <>
      <rect x="30" y="58" width="76" height="52" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="124" y="58" width="76" height="52" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="218" y="58" width="76" height="52" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
      <circle cx="56" cy="86" r="11" fill={PINK} stroke={INK} strokeWidth="1.8" />
      <circle cx="162" cy="78" r="9" fill={PINK} stroke={INK} strokeWidth="1.8" />
      <path d="M162 87 V100 M154 94 H170" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      <g>
        <circle cx="268" cy="76" r="9" fill={PINK} stroke={INK} strokeWidth="1.8" />
        <path d="M268 85 L262 100 M268 85 L276 98 M260 90 L278 84" stroke={INK} strokeWidth="1.8" strokeLinecap="round" />
      </g>
      <path d="M108 84 H120 M114 79 L120 84 L114 89 M202 84 H214 M208 79 L214 84 L208 89" fill="none" stroke={INK} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M30 128 H294" stroke={INK} strokeWidth="1.4" strokeDasharray="3 5" opacity="0.6" />
    </>
  );
}

// a clapperboard
function Clapper() {
  return (
    <>
      <rect x="104" y="72" width="116" height="70" rx="4" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M104 92 H220" stroke={INK} strokeWidth="1.4" opacity="0.35" />
      <g>
        <g transform="rotate(-14 104 70)">
          <rect x="104" y="52" width="116" height="18" rx="2" fill={INK} />
          <path d="M120 52 L132 70 M146 52 L158 70 M172 52 L184 70 M198 52 L210 70" stroke={PAPER} strokeWidth="7" />
        </g>
      </g>
      <rect x="104" y="70" width="116" height="10" fill={INK} />
      <path d="M124 75 L136 70 M150 75 L162 70 M176 75 L188 70" stroke={PAPER} strokeWidth="5" />
      <path d="M60 70 L64 82 L76 86 L64 90 L60 102 L56 90 L44 86 L56 82 Z" fill={MARIGOLD} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M264 46 L268 58 L280 62 L268 66 L264 78 L260 66 L248 62 L260 58 Z" fill={PINK} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M258 106 L261 114 L269 117 L261 120 L258 128 L255 120 L247 117 L255 114 Z" fill={PAPER} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  );
}

// a laptop playing a reel
function Freelance() {
  return (
    <>
      <rect x="100" y="34" width="124" height="80" rx="6" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M84 114 H240 L252 134 H72 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M152 58 L176 74 L152 90 Z" fill={PINK} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <g>
        <rect x="34" y="40" width="34" height="34" rx="4" fill={MARIGOLD} stroke={INK} strokeWidth="2" transform="rotate(-10 51 57)" />
      </g>
      <circle cx="276" cy="56" r="16" fill={PINK} stroke={INK} strokeWidth="2" />
      <path d="M266 102 L290 102 L278 82 Z" fill={LILAC} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M40 112 L44 122 L54 126 L44 130 L40 140 L36 130 L26 126 L36 122 Z" fill={PAPER} stroke={INK} strokeWidth="1.6" strokeLinejoin="round" />
    </>
  );
}

// steps up: Safety Troop → PathQuest → Accenture
function Studios() {
  return (
    <>
      <path d="M30 142 H294" stroke={INK} strokeWidth="2" />
      <rect x="72" y="108" width="60" height="34" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="132" y="80" width="60" height="62" fill={PAPER} stroke={INK} strokeWidth="2" />
      <rect x="192" y="52" width="60" height="90" fill={MARIGOLD} stroke={INK} strokeWidth="2" />
      <path d="M222 52 V18" stroke={INK} strokeWidth="2" />
      <path d="M222 18 L248 26 L222 34 Z" fill={LILAC} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <text x="102" y="130" textAnchor="middle" className={styles.label} fontSize="11" fill={INK}>
        ST
      </text>
      <text x="162" y="116" textAnchor="middle" className={styles.label} fontSize="11" fill={INK}>
        PQ
      </text>
      <text x="222" y="102" textAnchor="middle" className={styles.label} fontSize="11" fill={INK}>
        ACN
      </text>
    </>
  );
}

// an open book with a comic strip on one page and a puzzle piece beside it
function Books() {
  return (
    <>
      <path d="M30 146 H294" stroke={INK} strokeWidth="2" />
      <path d="M162 46 C 136 36 104 36 78 46 V 138 C 104 128 136 128 162 138 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M162 46 C 188 36 220 36 246 46 V 138 C 220 128 188 128 162 138 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="90" y="56" width="30" height="30" fill={PINK} stroke={INK} strokeWidth="1.6" />
      <rect x="124" y="56" width="28" height="30" fill={MARIGOLD} stroke={INK} strokeWidth="1.6" />
      <rect x="90" y="92" width="62" height="30" fill={LILAC} stroke={INK} strokeWidth="1.6" />
      <circle cx="105" cy="71" r="6" fill={PAPER} stroke={INK} strokeWidth="1.4" />
      <path d="M178 60 H232 M178 74 H232 M178 88 H222 M178 102 H232 M178 116 H210" stroke={INK} strokeWidth="1.4" opacity="0.35" />
      <path
        d="M262 92 h12 a7 7 0 1 1 12 0 h12 v12 a7 7 0 1 0 0 12 v12 h-36 z"
        fill={MARIGOLD}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M52 34 L56 46 L68 50 L56 54 L52 66 L48 54 L36 50 L48 46 Z" fill={PAPER} stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
    </>
  );
}

// a screen with a play button, and shapes travelling along a motion path
function Motion() {
  return (
    <>
      <rect x="54" y="34" width="132" height="92" rx="8" fill={PAPER} stroke={INK} strokeWidth="2" />
      <path d="M102 146 H138 M120 126 V146" stroke={INK} strokeWidth="2" strokeLinecap="round" />
      <circle cx="120" cy="80" r="24" fill={PINK} stroke={INK} strokeWidth="2" />
      <path d="M113 68 L131 80 L113 92 Z" fill={PAPER} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <path d="M196 126 C 222 70, 254 52, 292 44" fill="none" stroke={INK} strokeWidth="1.6" strokeDasharray="4 6" />
      <circle cx="206" cy="108" r="8" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.35" />
      <circle cx="232" cy="76" r="9" fill={MARIGOLD} stroke={INK} strokeWidth="2" opacity="0.6" />
      <rect x="258" y="42" width="22" height="22" rx="4" transform="rotate(18 269 53)" fill={LILAC} stroke={INK} strokeWidth="2" />
    </>
  );
}

const ART: Record<SceneArtId, () => React.JSX.Element> = {
  school: School,
  bounce: Bounce,
  storyboard: Storyboard,
  clapper: Clapper,
  freelance: Freelance,
  books: Books,
  motion: Motion,
  studios: Studios,
};

export function SceneArt({ art, color, className }: { art: SceneArtId; color: string; className?: string }) {
  const Art = ART[art];
  return (
    <svg viewBox="0 0 324 170" aria-hidden="true" className={`${styles.art} ${className ?? ""}`}>
      <rect x="0" y="0" width="324" height="170" fill={color} />
      <Art />
    </svg>
  );
}
