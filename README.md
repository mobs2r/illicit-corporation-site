# Illicit Corporation

Source for [illicit.page](https://illicit.page), the home of Illicit Corporation and the worlds it runs: Omerta Chat, Atlantis Chat, cod.city and gKnuckle.

All code lives on GitHub under [@mobs2r](https://github.com/mobs2r).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole site: one self-contained page with no build step. |
| `mmm-embed.html` | The snippet pasted into mmm.page, so illicit.page shows the published site. |
| `manifest.webmanifest` | Install metadata for the page. |
| `builds.json` | The live Omerta and Atlantis build numbers shown on the world cards. GitHub Actions refreshes it hourly. |
| `support/` | Tests and maintenance scripts. |

## Publishing

1. Push to `main`. `.github/workflows/corporation-pages.yml` publishes `index.html` to GitHub Pages at <https://mobs2r.github.io/illicit-corporation-site/>.
2. illicit.page is built on [mmm.page](https://mmm.page). It shows the site through an embed:
   1. In the mmm.page editor, add an **Embed / HTML** block.
   2. Paste the contents of `mmm-embed.html` into it.
   3. Publish.

The embed only frames the GitHub Pages site. Updates to `index.html` show up on illicit.page without touching mmm.page again. Change `mmm-embed.html` only if the frame itself should change, then paste it into mmm.page again.

## Checks

```sh
node --test support/navigation.test.cjs
```
