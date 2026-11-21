# CampusFix 🎓

**CampusFix** is a campus maintenance platform where students report problems — broken projectors, leaks, cleanliness issues — and the right department staff picks them up, updates them, and resolves them. It also includes a private, chat-based **Lost & Found** so misplaced belongings find their way home.

Live: **https://campusfix-ah24.vercel.app** · Backend: **https://campusfix-xo7e.onrender.com**

---

## ✨ Features

### 🤖 AI Report Assistant (Google Gemini)
Students don't always write formal complaints — they write *"yo the projector in lab 3 is busted, wont show anything"*. The AI assistant (on the Report Issue page) rewrites that into a clean, formal report and auto-fills the form:

- **Polished description** — formal sentences with fixed grammar, 1–4 sentences
- **Title** — short neutral summary (≤ 60 chars)
- **Category** — one of `IT / Maintenance / Cleanliness / Security / Electrical / Other`
- **Priority** — `Low / Medium / High`, raised to High *only* when the student described danger or said it themselves
- **Location** — extracted from the text, if named

**Honesty guardrails** — the prompt forbids the AI from adding facts, urgency, or drama the student never stated (a false report harms someone), and it may change the *wording*, never the *facts*: room numbers, times, and durations are preserved exactly.

**Resilience** — the Gemini key lives only on the backend; 503/429 spikes are retried with backoff; slow calls time out at 45 s; and if AI is unavailable for any reason, the UI **never blocks** — it fills a demo example with a clear note instead. AI is an assistant, not a dependency.

### 🛠 Issue Reporting & Lifecycle
- Students report issues with title, category, priority, location, description, and optional photos (stored as binary in MongoDB, served through an authenticated image endpoint)
- Issues are **auto-routed** to the matching department's staff queue; `Other` catches everything no department matches
- Status lifecycle: **Open → Assigned → In Progress → Resolved**, with a per-issue **timeline** recording who changed what and when
- Retro-routing: when the admin creates a new staff member, existing issues of that department join their queue automatically

### 👥 Role-Based Dashboards
| Role | Sees | Can do |
|---|---|---|
| **Student** | Personal stats, own issues, notifications | Report issues, chat on their issues, browse Lost & Found |
| **Staff** | Their department's queue | Progress issues, chat with students, resolve |
| **Admin** | Everything on campus | All of the above + Staff Management, read-only Lost & Found oversight |

Route guards keep the URLs honest (students can't open staff pages, admins browse Lost & Found but can't post), and the server re-checks every role decision — the frontend is never trusted alone.

### 🔎 Lost & Found
- Post **Lost** or **Found** items with optional photo; contact details are **optional**
- **Smart matching panel** — reporting a lost item shows you *found* posts beside the form (someone may have it); reporting a found item shows you *lost* posts (looking for its owner?)
- Search + filters by kind, category, and free text
- Statuses: **Open → Matched → Returned**

### 🔐 Privacy-Gated Contacts
Phone numbers are never public. Every list/detail response strips them; they unlock **only** through a gated endpoint once a private chat exists between the poster and the requester (owners and admins see their own). Sharing a number is optional — chat alone is enough to connect.

### 💬 Private Chats (WhatsApp-style)
- **Issue threads** — one thread per issue, student ↔ management (any staff/admin can join; management is a team)
- **Item threads** — private 1:1 threads per item/person; two people contacting the same poster get separate threads, so shared contact details never leak across
- Bubbles, right-aligned own messages, timestamps; live via lightweight polling with an incremental cursor (no websockets needed)

### 🔔 Notifications
- In-app notifications with unread badges on the topbar bell **and** the sidebar, kept in sync instantly across every surface: opening a notification, "mark all as read", opening an issue (clears all its notifications at once), or clicking a dashboard rail row
- Notifications arriving *after* you viewed an issue stay unread — you never miss new activity

### 🧑‍💼 Staff Management (Admin)
- **Create** staff accounts with a generated, readable password — shown **once** for hand-over (no staff signup exists anywhere)
- **Reset password** — bcrypt is one-way, so forgotten passwords can't be *revealed*; instead the admin generates a new one, shown once
- **Delete account + all data** — removes the account plus every trace: their chats and messages, notifications, Lost & Found posts, reported issues, routing entries, while preserving other users' issue timelines

### ⚡ Live Search
The topbar search shows live results as you type (title, location, description) — automatically role-scoped to what the searcher may see. Press Enter for the full filtered list. One fetch, locally filtered — no per-keystroke requests.

### 👤 Profiles
Editable name, student ID, department, and phone (email/role are identity — locked), plus notification preferences. Staff profiles are created and managed by the admin.

---

## 🧰 Tech Stack

| Layer | Tools |
|---|---|
| Frontend | React 19, React Router 7, Vite 8 |
| Backend | Node.js, Express 5 |
| Database | MongoDB Atlas + Mongoose 9 |
| Auth | JWT + bcryptjs (passwords hashed, never stored in plain text) |
| AI | Google Gemini API (`gemini-2.5-flash` free tier) |

## 📁 Project Structure

```
campusfix/
├── frontend/          # React + Vite SPA
│   ├── public/        # static assets (favicons, Google verification)
│   └── src/
│       ├── Api.js     # single API client — env-driven URL, shared helpers
│       ├── components/
│       ├── lib/       # shared logic (issue stats)
│       └── pages/     # one file per screen, dashboards included
└── backend/
    ├── server.js      # Express app — routes, error handling
    ├── config/        # MongoDB connection
    ├── controllers/   # auth, issues, items, chats, notifications, admin, AI
    ├── middleware/    # JWT protect + role allow-lists
    ├── models/        # User, Issue, Item, Conversation, Message, Notification, Image
    ├── routes/        # /api/* route tables
    ├── scripts/       # create-admin, reset-db
    └── utils/         # notify helper
```

## 🚀 Running Locally

```bash
# backend (port 5000)
cd backend
npm install
npm run dev            # or: node server.js

# frontend (port 5173)
cd frontend
npm install
npm run dev
```

The frontend falls back to `http://localhost:5000/api` when no API URL is configured, so local dev needs zero env setup beyond the backend `.env`.

### Environment variables — `backend/.env`

| Key | Purpose |
|---|---|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Token signing secret |
| `GEMINI_API_KEY` | Google Gemini key (AI assistant) — never exposed to the frontend |
| `GEMINI_MODEL` | Optional, defaults to `gemini-2.5-flash` |
| `PORT` | Optional, defaults to 5000 |

Frontend (production only): `VITE_API_URL` — the backend base URL + `/api` (e.g. `https://<service>.onrender.com/api`). Anything prefixed `VITE_` is baked into the public bundle, so only non-secret URLs go here.

## ☁️ Deployment

- **Frontend** → Vercel (Git integration on `main`); `frontend/vercel.json` rewrites all paths to `index.html` so client-side routes survive refresh and direct visits
- **Backend** → Render web service (root dir `backend`, start `node server.js`); free instances sleep after inactivity, so the first request after a break can take ~50 s
- **Database** → MongoDB Atlas
- First admin: `npm run create-admin` (backend script)

## 🔒 Security Notes

- Passwords are bcrypt-hashed and `select: false` — hashes never leave queries by default
- JWT auth on every route; role middleware (`allow("admin")` etc.) re-verifies on the server
- Contact details stripped from all reads; revealed only through the gated chat-first endpoint
- Images are validated against the uploader's own Image records; request bodies are size-capped (photos travel as data URLs)
- The AI endpoint is auth-protected so strangers can't burn the free quota, and its output is coerced to known-safe values before reaching the frontend

---

*Built as a campus project — issues in, issues resolved. 🛠*
