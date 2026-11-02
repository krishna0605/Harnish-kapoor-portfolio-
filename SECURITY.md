# Security

## Reporting a problem

If you find a security problem with this site, please report it privately rather than opening a public issue:

- use GitHub's **Report a vulnerability** button on the repository's **Security** tab; or
- use the contact details on the site's Contact page.

Please include what you found, how to reproduce it, and the page or file involved. You'll get a reply as soon as possible.

## What the site does and doesn't do

- It's a static site with no backend, database, API routes, logins or cookies.
- The contact form sends nothing itself: it opens the visitor's own email app.
- Sketches stay in the visitor's browser; the only thing stored is the sound on/off setting.
- Fonts, images and sounds are all served from the site itself; there are no third-party scripts or trackers.
- Every response carries a strict Content-Security-Policy, plus `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy` and `Cross-Origin-Opener-Policy` headers (see `next.config.ts`).
- No secrets are needed to build or run it, and none are stored in this repository.
