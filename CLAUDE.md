# GR Reporting System — Project Brief

## Overview

Secure, role-based web portal for **Educate Girls** state and district teams to log stakeholder meeting records (GRs). Users interact through the portal only — not the raw Google Sheet.

## Tech Stack

| Layer | Tool |
|-------|------|
| Frontend (production) | HTML + CSS + Vanilla JS on GitHub Pages |
| Frontend (Apps Script) | `src/client/` (synced from root via `scripts/sync-clasp.mjs`) |
| Backend | Google Apps Script |
| Database | Google Sheets |
| Auth | Email OTP (MailApp) + session token |
| Hosting | gr.egtau.org (Pages) + Apps Script web app (API) |
| Version control | Git + clasp |

**Workspace:** alok.mohan@educategirls.ngo  
**Expected users:** < 50

## Folder Structure

```
GR Reporting System/
├── *.html, common.js, style.css   # GitHub Pages UI (edit here)
├── scripts/sync-clasp.mjs         # Root → src/client sync
├── src/
│   ├── Code.gs, Auth.gs, Sheets.gs, Planner.gs, Utils.gs, SeedData.gs
│   ├── appsscript.json
│   └── client/                    # Apps Script HTML (generated/synced)
├── .clasp.json
└── CLAUDE.md
```

## Google Sheets

Workbook ID: `1Rv1WZ6mjWgdAXY3fkYJf5Lpv1s1OfijXCzjqH9C25Ls`

Sheets: `Users`, `Meetings`, `Followups`, `PlannedMeetings`, `LoginLog`, plus lookup sheets (`Units`, `Designations`, `PostingLevels`).

## User Roles

| Role | Access |
|------|--------|
| `field` | Own entries |
| `district` | District-wide |
| `state` | All + admin panel UI |
| `admin` | Full + user management |

## URLs & IDs

| Item | Value |
|------|-------|
| Production site | https://gr.egtau.org |
| Script ID | `13JWNYAa3lbFcvCdKlpEGTr1fpCnPnvz9LN5C6-1zYszYiix_qcLu8blk` |
| Web app (API) | `WEB_APP_URL` in `src/Code.gs` |

## Current Status

| Item | Status |
|------|--------|
| Backend (Auth, Sheets, Planner, API) | Done |
| GitHub Pages UI | Done (root HTML) |
| Apps Script UI sync | Done (`sync-clasp.mjs`) |
| Pages: dashboard, planner, forms, gantt, contacts, profile, timeline | Done |
| clasp deploy | Run `clasp push` after changes |

## What NOT to build

- No custom analytics dashboard (use Looker Studio)
- No direct Sheet access for users

## Contact

**Owner:** Alok — alok.mohan@educategirls.ngo
