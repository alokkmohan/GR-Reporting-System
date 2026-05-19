# GR Reporting System

Stakeholder meeting reporting portal for Educate Girls field teams.

## Architecture

| Layer | Location | Deployed to |
|-------|----------|-------------|
| **Frontend (primary)** | Root `*.html`, `common.js`, `style.css` | [gr.egtau.org](https://gr.egtau.org) via GitHub Pages |
| **Frontend (Apps Script)** | `src/client/*.html` | Google Apps Script web app (`clasp push`) |
| **Backend** | `src/*.gs` | Google Apps Script |

Both frontends call the same Apps Script API (`common.js` / `src/client/common.html`).

## Daily workflow

1. Edit HTML/CSS/JS in the **project root** (GitHub Pages source of truth).
2. Sync to Apps Script client files:
   ```bash
   node scripts/sync-clasp.mjs
   ```
3. Commit to Git.
4. Deploy backend:
   ```bash
   clasp push
   clasp deploy   # when publishing a new web app version
   ```

## URLs

- **User portal:** https://gr.egtau.org
- **API / fallback UI:** Apps Script web app URL in `src/Code.gs` (`WEB_APP_URL`)

## Config

- Google Sheet ID: `src/Sheets.gs` (`SHEET_ID`)
- Script ID: `.clasp.json`

See `CLAUDE.md` for full product and schema documentation.
