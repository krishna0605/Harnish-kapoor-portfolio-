# Setup: from a new Windows laptop to a live site

This project is a static Next.js site. There's no Docker, no database and no backend server.
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
| `npm run test:e2e` | Builds the site and runs the Playwright end-to-end tests |
| `npm run fonts` | Re-downloads the exact Google Font files the design uses into `public/fonts` (only needed if the fonts change) |

## 4. GitHub

```bash
git remote add origin https://github.com/<your-account>/<repo>.git
```

```bash
git push -u origin main
```

Or, with the GitHub CLI: `gh repo create <repo> --private --source . --push`.

Every push and pull request runs `.github/workflows/ci.yml`: lint, type check, build and the end-to-end tests.
Test results and screenshots are attached to the run as the `playwright-results` artifact.

## 5. Vercel

1. Sign in at https://vercel.com with GitHub.
2. **Add New → Project →** import the repository. Vercel detects Next.js; leave every setting at its default. No environment variables are needed.
3. Deploy. From then on:
   - every pull request gets its own preview URL;
   - every push to `main` goes to production.

**Plan:** Vercel's free Hobby plan is for personal, non-commercial use only. A site for a client is likely to count as commercial use, so plan for Pro.

## 6. Heavy media (for the Projects chapter onward)

Don't commit large artwork or video to this repo (GitHub rejects files over 100 MB, and every deploy re-uploads `public/`).

- **Images:** upload the full-resolution originals to Cloudinary.
- **Video / showreel:** use Mux or Bunny Stream (adaptive streaming).
- In code, build URLs with `mediaUrl()` from `src/lib/media.ts`. Set `NEXT_PUBLIC_MEDIA_BASE_URL` in Vercel, and add the media host to `images.remotePatterns` in `next.config.ts`.
