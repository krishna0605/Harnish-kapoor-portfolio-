# Harnish Kapoor — Portfolio

**A pastel sketchbook that scrolls sideways.** The portfolio of Harnish Kapoor, Graphic Designer & Motion Graphic Designer: five chapters laid out on one horizontal track, drawn in ink outlines on collage paper, with hand-made motion throughout.

| | |
|---|---|
| **Chapters** | 01 Home · 02 About · 03 Experience · 04 Projects · 05 Contact |
| **Stack** | Next.js 16 (App Router) · React 19 · TypeScript · CSS Modules · GSAP · Lenis |
| **Hosting** | Vercel (static, no backend, no Docker) |
| **Tests** | Playwright end-to-end, 8 screen sizes, runs on every push |

---

## Highlights

- **Sideways scrolling.** The wheel, trackpad, arrow keys, mouse drag and swipes all move the track. It snaps to chapters and project cards. The address bar always shows just the site: chapters never add `#about` and the like to the URL, though old links such as `/#contact` still open the right chapter.
- **Home:** the name rises in letter by letter, and the role types itself out. The squiggle draws itself and then flows. A star orbits the portrait card, passing behind and in front of the photo, and the card tilts in 3D toward the pointer.
- **About — "Frame by frame."**
  - A 3840-px storyboard: six story **stamps** with perforated edges and paper grain, taped along a dashed story line.
  - Hover a stamp and the rest of the page blurs. Click it, and it zooms in, then sticks onto an **envelope**; scroll and the envelope opens to a letter with the story.
  - ← / → move between the stories.
- **Sketch mode:** turn on the pencil (bottom right) and the page locks in place.
  - Draw anywhere with a charcoal pencil; marks stay with the page as you scroll.
  - Undo, Clear, and **Save view** / **Save notes**: PNG downloads that contain only the pencil marks and the HK logo, never the page itself.
- **Contact:**
  - real email (with Copy), phone, and Behance / Instagram / LinkedIn links;
  - the form is cut from **torn paper**, and **Send** opens the visitor's own email app with the message ready.
- **Paper everywhere:** the background texture is cut from the actual paper scraps in the Home collage.
- **Paper sounds** for the stamps, envelopes and pencil, with a mute button that is remembered.
- **Responsive:** desktop, laptop, tablet (portrait and landscape) and phones (portrait and held sideways). Every chapter fits one screen at every size.
- **Accessible:** keyboard navigation, visible focus, screen-reader text for animated type, and full support for `prefers-reduced-motion`.

## Getting started

Requirements: **Node.js 22** (see `.nvmrc`) and Git. Python and Docker are not needed.

```bash
git clone https://github.com/krishna0605/Harnish-kapoor-portfolio-.git
```

```bash
cd Harnish-kapoor-portfolio-
```

```bash
npm ci
```

```bash
npm run dev
```

Open http://localhost:3000. For a step-by-step guide on a new Windows machine, see [SETUP.md](SETUP.md).

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build (what Vercel runs) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test:e2e` | Build, then run the Playwright suite (needs `npx playwright install chromium` once) |
| `npm run fonts` | Re-download the exact Google Font files into `public/fonts` |
| `npm run texture` | Rebuild the paper texture from the Home collage |

## Project structure

```
src/
  app/                 layout, global styles, design tokens, fonts, favicon
  content/site.ts      all text, links, stories and projects — edit content here
  components/
    Track/             the sideways scroll engine (GSAP ScrollTrigger + Lenis)
    Header/            logo, nav with sliding pill, phone menu, sound toggle
    Spine/             the pastel strip that peeks in from the next chapter
    chapters/          Home, About (stamps, envelope), Projects, Contact
    Sketch/            sketch mode: canvas layer, charcoal brush, dock, exports
    ui/                Typewriter, SplitLetters, TornPaper
    icons/             SVG artwork (monogram, orbit, motifs, socials)
  lib/                 GSAP setup, sound, media queries, contact, mailto helpers
public/                images, fonts, sounds, paper texture, cursors
scripts/               font + paper texture generators
tests/                 Playwright end-to-end tests
```

## Editing content

Almost everything you'd want to change lives in **`src/content/site.ts`**:
- chapter names;
- Home text;
- the About stories: each story's text, plus the "What I did" and "Highlights" lists;
- the toolkit;
- the projects;
- contact links.

Items marked `TODO` are placeholders waiting for real content:
- the About "What I did" / "Highlights" lists;
- the Projects entries;
- the CV link.

Large artwork and video should go to a media CDN (for example Cloudinary or Mux), not into this repo. See `src/lib/media.ts` and [SETUP.md](SETUP.md).

## Deployment

The repository is connected to the existing [Vercel project](https://vercel.com/krishna0605s-projects/harnish-kapoor-portfolio).

The assigned production address is [harnish-kapoor-portfolio.vercel.app](https://harnish-kapoor-portfolio.vercel.app). **Current status: deployed on the free Hobby plan, with Vercel sign-in required for all deployments at the owner's request.** No paid upgrade or add-ons have been purchased. Public commercial launch is deferred.

Use a pull request for changes. Once the required CI check passes, merging into `main` triggers a production deployment; other branches receive preview deployments. No application environment variables are required.

See [DEPLOYMENT.md](DEPLOYMENT.md) for the verified settings, first-launch checklist, deployment records, and rollback runbook.

GitHub Actions (`.github/workflows/ci.yml`) runs lint, type check, build and the end-to-end tests on every push and pull request.

## Privacy

- **Sketches** stay in the visitor's browser and disappear on refresh. Downloads contain only the pencil marks and the logo.
- **The contact form** sends nothing itself: it opens the visitor's own email app.
- **The email address and phone number** are joined in the browser, so the page HTML never contains them whole. The repository never holds them whole either: the tests build them from the same parts.

## Security

- **Headers** (set in `next.config.ts` for every response): a strict Content-Security-Policy (everything self-hosted, no plugins, can't be framed), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy` (camera, microphone, location and payments off) and `Cross-Origin-Opener-Policy`. `X-Powered-By` is switched off. `tests/security.spec.ts` checks them, and checks that nothing on the site is blocked by its own policy.
- **No secrets.** The site needs no keys or environment variables.
- **CI** runs with a read-only token, and its actions are pinned to exact commits. Dependabot proposes npm and GitHub Actions updates weekly.
- **`npm audit`** reports 0 vulnerabilities, developer tools included. ESLint and its plugins still ask for an older `minimatch`, so `overrides` in `package.json` moves them to the patched 11.x. If an ESLint upgrade ever stops working with it, that override is the first thing to check.
- **Dependabot** leaves `@types/node` on the Node version the site runs on (22), and TypeScript on the range typescript-eslint supports.
- To report a problem, see [SECURITY.md](SECURITY.md).

## Licence

All rights reserved; see [LICENSE](LICENSE). Fonts and sound effects keep their own licences (below).

## Credits

- **Design & content:** Harnish Kapoor.
- **Fonts:** [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque), [Instrument Serif](https://fonts.google.com/specimen/Instrument+Serif) and [DM Mono](https://fonts.google.com/specimen/DM+Mono), self-hosted. All are under the SIL Open Font License.
- **Sound effects:** [Mixkit](https://mixkit.co/free-sound-effects/), under the Mixkit Sound Effects Free License. The stamp thunk, whoosh and pencil scratch are generated in the browser.
- **Animation:** [GSAP](https://gsap.com/) (standard license) and [Lenis](https://lenis.darkroom.engineering/).

© Harnish Kapoor. All rights reserved: the artwork, illustrations, photographs and written content in this repository may not be reused without permission.
