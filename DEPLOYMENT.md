# Vercel deployment runbook

## Project and launch status

- Team: `krishna0605s-projects` (`team_yFizUMIXXW4Xn4q3e3q2BOzR`).
- Project: [harnish-kapoor-portfolio](https://vercel.com/krishna0605s-projects/harnish-kapoor-portfolio) (`prj_tHOLVMKGNQ7eBa8snytO05ufSHCp`).
- Source: [krishna0605/Harnish-kapoor-portfolio-](https://github.com/krishna0605/Harnish-kapoor-portfolio-); production branch: `main`.
- Assigned production address: <https://harnish-kapoor-portfolio.vercel.app>.
- Initial setup date: 2 November 2026.
- The owner chose to retain the **free Hobby plan** and keep **all deployments protected**. No subscription upgrade or paid add-ons are authorized. An assigned production URL does not mean the site is publicly launched.
- Public commercial launch is deferred. Hobby is limited to personal, non-commercial use; any future commercial launch requires a compatible subscription and separate billing approval. Existing team spending controls remain unchanged.

## Build and environment settings

| Setting | Value |
| --- | --- |
| Framework | Next.js |
| Root directory | Repository root (no subdirectory) |
| Node.js | `22.x`, matching `.nvmrc` and `package.json` |
| Package manager / lockfile | npm / `package-lock.json` |
| Install | `npm ci` |
| Build | `npm run build` |
| Output directory | Framework default; no override |
| Production branch | `main` |
| Preview deployments | Enabled |
| Application environment variables | None required |

`NEXT_PUBLIC_MEDIA_BASE_URL` is optional. Leave it unset for the current local assets. If a media CDN is introduced, configure its public URL in the intended environments, allow the host in `next.config.ts`, and redeploy because `NEXT_PUBLIC_*` values are embedded at build time. Never put credentials in a public variable.

Fonts, images, sounds, textures, and cursors are committed under `public/`. Do not run `fonts` or `texture` during deployment. No database, email server, migrations, Docker configuration, or custom server is needed. Keep `.vercel/` and local `.env*` files ignored.

## First-launch records and release checklist

The initial application commit is `d0e41ad93c312a755768941a34f986e71cd813b1`. Its [GitHub CI run](https://github.com/krishna0605/Harnish-kapoor-portfolio-/actions/runs/41455580499) passed lint, type checking, production build, and the full Playwright suite.

| Environment | Deployment ID | URL |
| --- | --- | --- |
| Protected initial production build | `dpl_8AFjjVswxCyUHy7doez2nA1ktw2S` | <https://harnish-kapoor-portfolio-4ww7nalw1-krishna0605s-projects.vercel.app> |
| Protected preview | `dpl_5ZGcJEDGGkXrAsNp8dvP4Ch53ifQ` | <https://harnish-kapoor-portfolio-fecqynsao-krishna0605s-projects.vercel.app> |
| Automatic PR #1 preview, commit `460c790` | `dpl_CXkFvvBSUwGdht6EN6BjmC7TA4gA` | <https://harnish-kapoor-portfolio-lwelu6z0y-krishna0605s-projects.vercel.app> |

Vercel assigned its first deployment to Production during bootstrap. It was protected before creation and is not a public release. Inspect the environment reported by Vercel rather than assuming a requested preview is always treated as one.

Verified setup results:

- Initial production and preview deployments reached `READY`; build logs confirmed static prerendering and successful deployment.
- The GitHub-connected documentation branch automatically created a `READY` preview, confirming branch deployment integration.
- No application environment variables are configured.
- Anonymous requests to both the production address and preview redirect to Vercel Authentication.
- The saved `main` protection rule requires a PR, the GitHub Actions `check` job, and an up-to-date branch. It also applies to administrators, requires no additional reviewer, and disallows force pushes and deletions.

The following checklist is for a **future public launch**, not authorization to change the current free, protected setup.

Before making production public:

1. Verify the commercial-compatible subscription; the account owner must approve any billing upgrade.
2. Verify both deployment states are `READY`, the Git SHA matches the selected release, and build logs have no failures.
3. Verify the GitHub `main` protection rule is saved: PR required, `check` required, branch up to date, zero required approvals, no bypass, no force pushes or deletions.
4. In an authenticated browser, verify navigation and reloads at `#about`, `#experience`, `#projects`, and `#contact`; desktop and phone layout; story dialogs and keyboard controls; reduced motion; local assets; sound/mute; sketch undo/clear/PNG exports; clipboard copying and `mailto:` contact behavior. Check browser errors. Existing CI covers eight viewport sizes.
5. In Project Settings > Deployment Protection, choose **Standard Protection** with Vercel Authentication. Keep previews protected and make only the production domains public.
6. Request the stable production address without cookies and verify HTTP 200 and the portfolio HTML. Check that a preview still redirects anonymous visitors to Vercel Authentication.
7. Record the final production deployment ID and commit, verification results, and public launch date here; update the pending-launch notices in README and SETUP.

## Everyday releases

1. Create a feature branch, commit changes, and push it to GitHub.
2. Open a PR to `main`. Vercel builds the preview and GitHub Actions runs the `check` job. Use the PR's Vercel link to inspect the actual preview.
3. Fix failures and update the branch if `main` changed. A passing Vercel build alone does not mean the browser tests passed.
4. Merge only after the required `check` job passes. Vercel builds production from `main` automatically.
5. Inspect the production deployment and stable production URL after the merge. Record the release commit and deployment ID when investigating a release.

GitHub Actions validates code; Vercel handles deployment. No Vercel deployment token is required in Actions. Do not bypass the PR/check requirements with a direct push to `main`.

## Logs and recovery

Open the project's **Deployments** page, select the affected deployment, and inspect **Build Logs**. Use the project's **Logs** page for runtime failures. This app is mostly prerendered, so a lack of function logs does not prove browser behavior is correct; also inspect browser errors and failed asset requests.

For a regression after a successful public release:

1. Record the failing deployment ID and commit.
2. Select the previous known-good production deployment and use **Instant Rollback**.
3. Verify the stable production address, navigation, and assets again without authentication.
4. Submit the fix through a PR and wait for CI. Inspect automatic domain assignment: rollback can disable it, so explicitly promote the verified fixed production deployment before expecting later production pushes to go live.

The first launch has no earlier working production deployment. If it fails, keep or restore Vercel Authentication for **All Deployments**, fix the issue through a PR, deploy again, and repeat the launch checks. A rollback does not rebuild environment variables or undo external data changes.

Custom domains, analytics, media CDN migration, placeholder portfolio content, and the CV link are separate follow-up work.
