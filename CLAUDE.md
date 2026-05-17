# GR Reporting System — Claude Code Project Brief

## Project Overview

Build a secure, role-based web portal for **Educate Girls** state and district teams to log stakeholder meeting records (GRs) with government officials across various departments. No user should ever access the raw Google Sheet directly — all interaction happens through the portal.

---

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend | HTML + CSS + Vanilla JS (served by Apps Script) |
| Backend | Google Apps Script |
| Database | Google Sheets (via SpreadsheetApp) |
| Auth | Email OTP (sent via MailApp) |
| Hosting | Google Apps Script Web App (free) |
| Version Control | Git + clasp (Apps Script CLI) |
| Dashboard | Looker Studio (connected to Google Sheets) |

**Google Workspace Account:** alok.mohan@educategirls.ngo
**Expected Users:** < 50

---

## Project Context

- **Portal users:** Educate Girls state and district team members
- **Who they meet:** Officials from various government departments (DM, BSA, BDO, CDO, DIOS, etc.)
- **Purpose:** Digital logging of government meeting records (GRs), outcomes, and follow-ups
- **Budget:** Zero — everything on free tiers

---

## Folder Structure

```
gr-reporting-system/
├── src/
│   ├── Code.gs              # Main Apps Script entry point (doGet, doPost)
│   ├── Auth.gs              # OTP generation, email send, session verify
│   ├── Sheets.gs            # All Google Sheets read/write functions
│   ├── Meetings.gs          # Form A and Form B submission logic
│   ├── Admin.gs             # Admin user management functions
│   ├── Utils.gs             # Helpers: UUID, date format, etc.
│   └── client/
│       ├── index.html       # Login page (email OTP)
│       ├── register.html    # First-time registration
│       ├── pending.html     # Awaiting admin approval
│       ├── dashboard.html   # Home after login
│       ├── formA.html       # Meeting conducted (24 fields)
│       ├── formB.html       # Meeting not conducted (13 fields)
│       ├── myentries.html   # User's past submissions
│       ├── admin.html       # Admin panel
│       ├── css/
│       │   └── style.css    # Mobile-first responsive styles
│       └── js/
│           ├── auth.js      # OTP request, verify, session
│           ├── forms.js     # Form A/B logic, dropdowns
│           └── app.js       # Page routing, shared utilities
├── .clasp.json              # clasp config (scriptId)
├── appsscript.json          # Apps Script manifest
├── .gitignore
└── CLAUDE.md
```

---

## Google Sheets Database Structure

One Google Sheets workbook with **3 sheets**:

### Sheet 1 — `Users`
| Column | Description |
|---|---|
| email | Entered by user at login/register |
| full_name | From registration form |
| district | From registration form |
| zone | From registration form |
| designation | BPO / DPO / ZOL / DOL / DPTO / SOH etc. |
| role | field / district / state / admin |
| status | pending / active / suspended |
| registered_on | Auto timestamp |

### Sheet 2 — `Meetings`
| Column | Description |
|---|---|
| submission_id | Auto UUID |
| timestamp | Auto on submission |
| user_email | From session |
| meeting_conducted | YES / NO |
| date | Selected by user |
| reporting_month | Auto-derived from date |
| unit | Dropdown |
| district | From user profile |
| block_cluster | Text input |
| conducted_by | Dropdown |
| staff_name | Text |
| level_of_meeting | Dropdown |
| other_participants | Text |
| stakeholder_type | Dropdown |
| stakeholder_name | Dropdown / Text |
| department_organisation | Text |
| meeting_purpose | Dropdown |
| key_discussion_points | Long text |
| outcome | Long text (open) |
| next_action | Text |
| responsible_person | Text |
| followup_date | Date |
| followup_status | Dropdown |
| photo_link | URL |
| remark | Dropdown |
| priority_level | Dropdown |
| escalation_required | Yes / No |

> **Form B (NO):** submission_id, timestamp, user_email, meeting_conducted=NO, date, reporting_month, unit, district, block_cluster, conducted_by, staff_name, level_of_meeting, other_participants, stakeholder_name, followup_date, reason_not_conducted

### Sheet 3 — `Followups`
Auto-populated from Meetings where `meeting_conducted = YES` and `followup_date` is set.

---

## User Roles

| Role | Who | Can Submit | Can View |
|---|---|---|---|
| `field` | BPO, DPO, Associate | Own entries | Own entries |
| `district` | ZOL, DOL, DPTO, SPSS | Own + district | All in district |
| `state` | SOH, Director Ops | All | All |
| `admin` | Alok + IT | All + user mgmt | Full system |

---

## Authentication Flow (Email OTP)

1. User visits web app → enters email address
2. Apps Script generates 6-digit OTP → sends via MailApp
3. User enters OTP → verified against CacheService (5 min expiry)
4. On verified:
   - New user → redirect to `/register`
   - `pending` → show pending screen
   - `active` → redirect to `/dashboard`
   - `suspended` → show access revoked
5. Session stored in CacheService with user email + role (30 min TTL)

---

## Dropdown Options (from GR Template)

### Conducted By
SOH, ZOL, DOL, DPO, BPO, DPTO, SPSS, SIL, TAU Lead, Director Operations, Program Associate, Other

### Level of Meeting
State, District, Block, Cluster, School

### Stakeholder Type
ACS, DGSE, UIC, SPD, ASPD, JD, BSA, CDO, District Collector, DIET Principal, ABSA, ARP, DC-Gender, DC-Training, DC-MIS, DC-Community, DC-IED, Head Teacher, Teacher, Development Partner Cell, Other Department

### Meeting Purpose
Introductory Meeting, Enrollment, Retention, Learning, Invitation, Review Meeting, MPR Submission, DTF, School Liasioning, Courtesy Meeting, Other

### Reason Not Conducted (Form B)
Not Available, Refused, Travel Issue, Other

### Remark
Positive, Neutral, Cold, Not Reachable

### Priority Level
High, Medium, Low

### Follow-up Status
Pending, Completed, Not Required

---

## Apps Script Functions

### Sheets.gs
```javascript
getUserByEmail(email)
addUser(userData)
updateUserStatus(email, status)
submitMeeting(formData)
getMeetingsByEmail(email)
getMeetingsByDistrict(district)
getAllMeetings()
getAllPendingUsers()
getAllUsers()
updateUserRole(email, role)
```

### Auth.gs
```javascript
sendOTP(email)           // Generate OTP, store in CacheService, send email
verifyOTP(email, otp)    // Check against CacheService
createSession(email)     // Store session token in CacheService (30 min)
verifySession(token)     // Return user object or null
destroySession(token)    // Clear from CacheService
```

### Code.gs
```javascript
doGet(e)    // Route to correct HTML page based on path param
doPost(e)   // Handle all API calls (auth, submit, admin)
```

---

## UI Notes

- Mobile-first (Android phones, field team)
- Large tap targets (min 44px)
- Form sections with progress indicator
- After submit → success screen with submission ID
- Card-based list for MyEntries (no tables for field users)
- Admin panel: simple table with Approve / Suspend buttons

---

## clasp Workflow

```bash
# First time setup
clasp login                          # Login with alok.mohan@educategirls.ngo
clasp create --type webapp           # Create new Apps Script project
# OR clone existing:
clasp clone <scriptId>

# Daily workflow
git add . && git commit -m "message" # Save to Git
clasp push                           # Deploy to Apps Script
clasp deploy                         # Publish new web app version
```

---

## Environment / Secrets

No .env file needed — Apps Script uses **Script Properties**:
```
SHEET_ID       → Google Sheets workbook ID
ADMIN_EMAIL    → alok.mohan@educategirls.ngo
```
Set via: Apps Script Editor → Project Settings → Script Properties

**Sheet ID:** `1Rv1WZ6mjWgdAXY3fkYJf5Lpv1s1OfijXCzjqH9C25Ls`
**Script ID:** `13JWNYAa3lbFcvCdKlpEGTr1fpCnPnvz9LN5C6-1zYszYiix_qcLu8blk`
**Script URL:** `https://script.google.com/d/13JWNYAa3lbFcvCdKlpEGTr1fpCnPnvz9LN5C6-1zYszYiix_qcLu8blk/edit`
**Web App URL (latest):** `https://script.google.com/macros/s/AKfycbw92bjTtu3JYIKPscJB8i9Tol1SCkOT60yMxWvEMZrbOurAKn7fgp2GO1RLyNIMzRLw/exec`

---

## Build Order

1. Google Sheet setup (3 sheets: Users, Meetings, Followups with headers)
2. `Sheets.gs` — all read/write functions
3. `Auth.gs` — OTP + session logic
4. `Code.gs` — doGet routing + doPost API handler
5. `client/css/style.css` — mobile-first base styles
6. `client/index.html` — OTP login page
7. `client/register.html` — registration form
8. `client/pending.html` — approval waiting screen
9. `client/dashboard.html` — home screen
10. `client/formA.html` — 24-field meeting form
11. `client/formB.html` — 13-field not-conducted form
12. `client/myentries.html` — past submissions
13. `client/admin.html` — user management

---

## What NOT to build

- No custom dashboard — use Looker Studio
- No file uploads — Google Drive URL field only
- No direct Sheet access for any user

---

## Current Status

| Item | Status |
|---|---|
| Requirements finalized | Done |
| GR Template reviewed | Done |
| Tech stack finalized | Done (Apps Script + Git) |
| clasp installed | Done (v3.1.3) |
| Google Workspace account | Ready (alok.mohan@educategirls.ngo) |
| Google Sheet setup | Pending |
| Apps Script project creation | Pending |
| Backend (Sheets.gs + Auth.gs) | Not started |
| Frontend (all pages) | Not started |
| Deployment | Not started |

---

## Contact

**Project owner:** Alok — alok.mohan@educategirls.ngo
**Reviewed by:** Aditya
**Final approval:** Nitin Sir
