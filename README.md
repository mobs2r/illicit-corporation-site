# Illicit Corporation static site

This public repository contains only the static Illicit Corporation landing page and its GitHub Pages deployment. The live page is at <https://mobs2r.github.io/illicit-corporation-site/>.

The private application repository is separate. Do not copy its server, database migrations, environment files, or credentials here.

The world-card build labels come from the public `/health` endpoints. GitHub Actions refreshes a same-origin `builds.json` on publication and hourly; the checked-in values are safe fallbacks if either app is temporarily unavailable.

To embed this page in an mmm.page HTML block later, use [`support/mmm-corporation-embed.html`](support/mmm-corporation-embed.html). The embed includes a direct-link fallback. The page itself has no sign-in, wallet, or payment UI.
