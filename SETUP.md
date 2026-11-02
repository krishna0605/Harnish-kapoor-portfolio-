# Setup: from a new Windows laptop to a live site

This project is a static Next.js site (GSAP + Lenis for the sideways scroll and animations). There's no Docker, no database and no backend server.
Node's `package.json` + `package-lock.json` do the job that `requirements.txt` does in Python:
the lock file pins the exact version of every library, and `npm ci` installs exactly those.

## 1. Tools (one time per machine)

| Tool | Version | Check | Install |
|---|---|---|---|
| Node.js (includes npm) | 22.x (see `.nvmrc`) | `node -v` | https://nodejs.org (LTS 22) or `winget install OpenJS.NodeJS.LTS` |
| Git | any recent | `git --version` | `winget install Git.Git` |
| GitHub CLI *(optional)* | any | `gh --version` | `winget install GitHub.cli`, then `gh auth login` |
| Vercel CLI *(optional)* | any | `vercel --version` | `npm i -g vercel`, then `vercel login` |

Python and Docker are **not** needed.

## 2. Install the project

```bash
npm ci
```

```bash
npx playwright install chromium
```

The second command downloads the browser used by the end-to-end tests (about 150 MB, stored once per machine).

## 3. Everyday commands

| Command | What it does |
|---|---|
| `npm run dev` | Development server at http://localhost:3000 |
| `npm run build` | Production build (what Vercel runs) |
| `npm run start` | Serve the production build locally |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test:e2e` | Builds the site and runs the Playwright tests: every chapter at 8 screen sizes (fits the screen, reachable from the nav), the 1920×1080 measurements, typing, reduced motion, keys and deep links. Screenshots go to `test-results/screens/` |
| `npm run texture` | Rebuilds the paper texture from the Home collage into `public/textures` |
| `npm run fonts` | Re-downloads the exact Google Font files the design uses into `public/fonts` (only needed if the fonts change) |

## 4. GitHub

The repository is https://github.com/krishna0605/Harnish-kapoor-portfolio-. To get the code on a new machine:

```bash
git clone https://github.com/krishna0605/Harnish-kapoor-portfolio-.git
```

After committing changes, publish them with:

```bash
git push
```

Every push and pull request runs `.github/workflows/ci.yml`: lint, type check, build and the end-to-end tests.
Test results and screenshots are attached to the run as the `playwright-results` artifact.

## 5. Vercel

The repository already has a connected [Vercel project](https://vercel.com/krishna0605s-projects/harnish-kapoor-portfolio). Reuse it rather than importing another copy.

- Framework: Next.js; repository root; Node.js **22.x**.
- Install: `npm ci`; build: `npm run build`; output: framework default.
- No application environment variables are required. Leave `NEXT_PUBLIC_MEDIA_BASE_URL` unset to serve the committed assets from `public/`.
- Open pull requests for changes; wait for the `check` CI job and inspect the Vercel preview before merging into `main`.
- The production address is [harnish-kapoor-portfolio.vercel.app](https://harnish-kapoor-portfolio.vercel.app). It remains protected until the initial commercial launch is completed.

Follow [DEPLOYMENT.md](DEPLOYMENT.md) for first-launch status, settings, verification, and recovery.

**Plan:** This portfolio promotes paid services, so the public launch requires Pro or another commercial-compatible plan. The team was on Hobby when setup began. A billing upgrade is a separate, explicit purchase; do not enable paid add-ons or change team spending controls as part of deployment.

## 6. Heavy media (for the Projects chapter onward)

Don't commit large artwork or video to this repo (GitHub rejects files over 100 MB, and every deploy re-uploads `public/`).

- **Images:** upload the full-resolution originals to Cloudinary.
- **Video / showreel:** use Mux or Bunny Stream (adaptive streaming).
- In code, build URLs with `mediaUrl()` from `src/lib/media.ts`. Set `NEXT_PUBLIC_MEDIA_BASE_URL` in Vercel, and add the media host to `images.remotePatterns` in `next.config.ts`.
