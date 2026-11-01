# Harnish Kapoor — portfolio

A pastel sketchbook that scrolls sideways: four chapters (Home, About, Projects, Contact) on one horizontal track.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, CSS Modules, GSAP (ScrollTrigger + Observer) and Lenis. Hosted on Vercel, no backend.
- **Setup on a new machine:** see [SETUP.md](SETUP.md).

## How it works

- `src/components/Track/SiteShell.tsx` — the sideways scroll.
  - The track is pinned, and vertical scrolling (wheel, trackpad, touch, keyboard) moves it horizontally. Mouse drag, horizontal swipes and ← → also move it.
  - It snaps to chapter starts and project cards, in the direction of travel.
  - It keeps `#about` / `#projects` / `#contact` in the URL.
- `src/components/Header` — the fixed logo and nav. The active pill slides to the current chapter and takes its pastel. Phones get a Menu sheet.
- `src/components/Spine` — the pastel strip that peeks in from the next chapter.
- `src/components/chapters/*` — one folder per chapter.
  - Home keeps the design export's values: at 1920×1080 it measures exactly as the export.
- `src/components/ui/Typewriter.tsx` — type / hold / delete loop. It reserves space, so nothing moves, and pauses while off-screen.
- `src/content/site.ts` — all text, links and project entries. Items marked `TODO` are placeholders.
- `src/app/fonts.css` + `public/fonts` — self-hosted copies of the Google Font files the design uses (`npm run fonts`).

## Responsive

Sizes come from `--u`, one pixel of the 1920×1080 design (see `globals.css`), plus dedicated layouts:

| Screens | Layout |
|---|---|
| Landscape (desktop, laptop, landscape tablet) | The design layout |
| Portrait tablets | Stacked |
| Phones | Compact, with a Menu sheet |

Short landscape phones get a condensed variant. Every chapter fits one screen at all of these sizes; `npm run test:e2e` checks it.

## Motion

Everything respects `prefers-reduced-motion`: with it on, text appears at once and nothing loops.

- **Load sequence:** letters rise in, the squiggle draws and then flows, and the card lands. The ring draws in and then spins with its star, and the badge pops in.
- **Typing loops:** the role line and the card's role/company.
- **Pointer effects:** a letter wave on the name, a 3D tilt on the card, a spin on the logo, and lifts on the project cards.
