# Harnish Kapoor — portfolio

A pastel sketchbook that scrolls sideways: five chapters (Home, About, Experience, Projects, Contact) on one horizontal track.

- **Stack:** Next.js 16 (App Router), React 19, TypeScript, CSS Modules, GSAP (ScrollTrigger + Observer) and Lenis. Hosted on Vercel, no backend.
- **Setup on a new machine:** see [SETUP.md](SETUP.md).

## How it works

- `src/components/Track/SiteShell.tsx` — the sideways scroll.
  - The track is pinned, and vertical scrolling (wheel, trackpad, touch, keyboard) moves it horizontally. Mouse drag, horizontal swipes and ← → also move it.
  - It snaps to chapter starts and project cards, in the direction of travel.
  - It keeps `#about` / `#projects` / `#contact` in the URL.
- `src/components/Header` — the fixed logo and nav. The active pill slides to the current chapter and takes its pastel, and labels roll on hover. Screens narrower than 768px in portrait get a Menu sheet.
- `src/components/Spine` — the pastel strip that peeks in from the next chapter.
- `src/components/chapters/*` — one folder per chapter.
  - Home keeps the design export's values: at 1920×1080 it measures exactly as the export.
- `src/components/ui/Typewriter.tsx` — type / hold / delete loop. It reserves space, so nothing moves, and pauses while off-screen.
- `src/content/site.ts` — all text, links and project entries. Items marked `TODO` are placeholders.
- `src/components/Sketch` — the charcoal pencil.
  - With a mouse, dragging anywhere draws (a plain click still clicks); the wheel, trackpad and arrow keys scroll. On touch screens, the pencil button switches swipes to drawing.
  - Marks are painted into 1024-px tiles in track coordinates, so they move with the page, and composited onto one fixed canvas. They last until the page is refreshed.
  - The dock (bottom right): pencil size, undo (Ctrl/Cmd+Z), clear (with confirm), **Save view** (the page as seen, via modern-screenshot) and **Save notes** (just the marks on paper).
- `public/textures/paper-grain.png` — the background paper, cut from the collage's cream scrap by `npm run texture` and multiplied onto each chapter colour.
- `public/cursors` — the pencil cursors.
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

- **Load sequence:** letters rise in, the squiggle draws and then flows, and the card lands. The ring draws in, and the star starts orbiting it: behind the photo across the top, in front across the bottom. The badge pops in.
- **Typing loops:** the role line and the card's role/company. Each holds about 12 seconds before deleting.
- **Pointer effects:** a letter wave on the name, a 3D tilt on the card, a spin on the logo, a label roll on the nav, and lifts on the project and experience cards.
- **Badge:** still by default. It spins while hovered and eases back upright; on touch screens a tap gives it one turn.
