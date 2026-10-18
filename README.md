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

The live page background is a flat `#101318`. Keep that color in the mmm.page page-background setting (Page style → background color). The framed site fades into `#101318` below the footer, and the embed script stretches the frame to the full page and keeps the header on screen while the mmm.page window scrolls. Safe mode has to stay off, or the embed script will not run. A light-mode canvas, if you ever switch the whole mmm.page background, would be `#e7eef6` instead.

## Checks

```sh
node --test support/*.test.cjs
```

## Scale and donations

`assets/costs.json` stores annual amounts in their original billing currency.
Exchange rates are units per USD; convert once and round only the displayed
cents. Do not round budgets upward to tens or hundreds. Claude Max and
SoundCloud use owner-confirmed CAD bills; other rows distinguish public list
prices, plan minimums and unconfirmed estimates. Hover publishes USD prices;
individual renewal invoices may differ. Rate dates remain in source metadata,
not a dated banner on the page.

`assets/donation-wallets.json` is a snapshot of the existing public recipients,
not credentials or donor records. It avoids requiring Omerta login or widening
the shared API's CORS policy. Recheck the public configuration before changing
recipients. The corporate page does not issue quotes, connect a wallet, mint
rewards or collect email addresses. Existing backend receipts and awarded
inventory remain intact.

Email-linked rewards are not enabled. Before launch, require a verified payment
receipt plus ownership of its linked email, expiring single-use verification
tokens, replay-safe receipt/account binding and server-side reward idempotency.
The shared API already has a Resend recovery-mail transport, but its sender,
domain and production configuration must be verified before reusing it. The
public contact address is mobs2r@illicit.page; its inbox is not set up yet.

The three world icons reuse their actual marks from the world cards. Avalanche's
mark comes from https://www.avalanche.com/favicon-light.svg and ApeCoin's from
https://apecoin.com/favicon.png. The manifest and embedded page share the Illicit
favicon. The outer illicit.page favicon is separately managed by mmm.page;
updating an iframe alone cannot change that browser-tab icon.
