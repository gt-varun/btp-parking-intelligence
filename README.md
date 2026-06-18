# BTP Parking Intelligence — MERN Stack

Full-stack MERN (MongoDB · Express · React · Node.js) conversion of the Bangalore Traffic Police Parking Intelligence platform.

**This build replaces every hardcoded placeholder number from the original prototype with
a real model trained on the 298,450-record BTP dataset.** See [ML Pipeline](#ml-pipeline--real-trained-models-swappable-anytime)
below for what's actually predicted vs. what's a genuine dataset aggregate.

---

## Stack

| Layer     | Tech                                          |
|-----------|-----------------------------------------------|
| ML        | Python 3 + pandas + scikit-learn              |
| Database  | MongoDB + Mongoose                            |
| Backend   | Node.js + Express (ESM)                       |
| Auth      | JWT (jsonwebtoken + bcryptjs)                 |
| Frontend  | React 19 + Vite + React Router v6            |
| Styling   | Tailwind CSS v4 + shadcn/ui                  |
| Maps      | Leaflet + React-Leaflet                       |
| Charts    | Recharts                                      |

---

## Project Structure

```
btp-mern/
├── ml/                          # ★ Real trained models, NOT hand-typed numbers
│   ├── data/violations_raw.csv  # The 298,450-record BTP dataset
│   ├── load_data.py             # Shared cleaning/parsing — every model imports this
│   ├── model_cli.py             # Capacity-Loss Index (LinearRegression)
│   ├── model_forecast.py        # 7-day patrol forecast (GradientBoostingRegressor)
│   ├── model_ticket_quality.py  # Rejection-risk classifier (LogisticRegression)
│   ├── model_offenders.py       # Repeat-offender risk tiers (KMeans)
│   ├── descriptive_stats.py     # Real dataset aggregates (NOT a model — see below)
│   ├── run_all.py               # Runs all of the above, writes ml/output/*.json
│   └── output/                  # JSON written by run_all.py — Node reads ONLY this
│
├── server/                      # Express + Mongoose API
│   ├── models/                  # User, Junction, Challan, Forecast, TicketQuality,
│   │                             # Offender, DescriptiveStats, MLMeta
│   ├── routes/                  # auth, challans, junctions, analytics, admin, patrol
│   ├── middleware/auth.js       # JWT protect + requireAdmin
│   ├── seed/
│   │   ├── seedFromML.js        # ★ Reads ml/output/*.json → MongoDB (run this first)
│   │   └── seed.js              # Demo users/challans, built against real junctions
│   └── server.js
│
└── client/                      # React + Vite frontend
    └── src/
        ├── context/        # AuthContext (JWT)
        ├── lib/api.ts      # Axios wrapper (auto-injects JWT)
        ├── router/         # ProtectedRoute, AdminRoute
        ├── pages/
        │   ├── Home.tsx    # Role-aware dashboard
        │   ├── Auth.tsx
        │   ├── About / Rules / Guidelines
        │   ├── user/       # MyChallans, MyAnalytics, MyMap
        │   └── admin/      # Analytics, Tickets, Offenders, Patrol, Users
        └── components/     # All original UI components (no tanstack deps)
```

---

## ML Pipeline — Real Trained Models, Swappable Anytime

**Nothing in this app is a hardcoded number pretending to be a prediction.** Every score
the UI shows (Capacity-Loss Index, 7-day forecast, ticket rejection risk, offender
escalation tier) comes from a Python script in `ml/` that trains on the real
298,450-record dataset and writes its output to `ml/output/*.json`. Node only ever
*reads* those JSON files — it never computes a score itself. The one exception is
`ml/descriptive_stats.py`, which is **not a model** — it's real dataset aggregates
(monthly/hourly/weekday counts) with nothing to "swap," kept in its own file so it's
never mistaken for a prediction.

| Script                      | What it predicts                          | Algorithm (swap by editing one file) |
|------------------------------|--------------------------------------------|----------------------------------------|
| `model_cli.py`               | Capacity-Loss Index (0–100) per junction   | `LinearRegression` |
| `model_forecast.py`          | 7-day-ahead violation count per junction   | `GradientBoostingRegressor` (recursive rollout) |
| `model_ticket_quality.py`    | Rejection probability per ticket           | `LogisticRegression` (class-balanced) |
| `model_offenders.py`         | Escalation risk tier per repeat vehicle    | `KMeans` (k=4, ordered by centroid)  |

### To swap a model
Open the relevant `model_*.py` file, swap the one line that constructs the
estimator (e.g. `LinearRegression()` → `Ridge()` or `GradientBoostingRegressor()`),
keep the JSON output shape documented in that file's docstring, then re-run:
```bash
npm run ml:train   # retrains all 4 models + recomputes dataset_summary/descriptive_stats
npm run seed:ml     # pushes the new ml/output/*.json into MongoDB
```
Nothing else changes — routes, the client, and the rest of the pipeline are untouched.

### Full pipeline run time
`npm run ml:train` runs all four models end-to-end against the full 298k-row CSV.
Expect **~5–6 minutes** on a typical laptop (the offender-tiering KMeans step over
~280k vehicle-rows is the slowest part). The CLI/forecast/ticket-quality models each
take under a minute.

---

## Quick Start

### 1. Prerequisites

- Node.js ≥ 18
- Python 3.10+ with `pandas` and `scikit-learn` (`pip install pandas scikit-learn`)
- MongoDB running locally (`mongod`) or a MongoDB Atlas URI

### 2. Install dependencies

```bash
# From project root
npm install           # installs concurrently
npm run install:all   # installs server + client deps
pip install pandas scikit-learn   # for the ml/ scripts
```

Or manually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Configure environment

```bash
cd server
cp .env.example .env
# Edit .env — set MONGO_URI if not using localhost
```

`.env` defaults:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/btp_db
JWT_SECRET=change_this_to_a_long_random_string
JWT_EXPIRES_IN=7d
```

### 4. Train the models, then seed the database

These three steps MUST run in this order — `seed.js` reads the real junctions that
`seedFromML.js` writes, and `seedFromML.js` reads the JSON that `ml/run_all.py` writes.

```bash
npm run ml:train   # trains all 4 models on ml/data/violations_raw.csv (~5-6 min)
npm run seed:ml     # writes model outputs into MongoDB (Junction, Forecast, TicketQuality, Offender, ...)
npm run seed        # creates demo users/challans against the 168 real junctions

# or all three in one go:
npm run seed:all
```

This creates:
- **168 real Bengaluru junctions**, each with a model-predicted CLI score, 24-hour
  pattern, top violation type, and rejection rate — not the original 20 placeholder
  junctions
- A live 7-day forecast, ticket-quality model output, and ~11,900 scored repeat
  offenders, all in MongoDB
- Admin user: `admin@test.btp.in` / `admin123`
- 5 demo citizen users (rahul, priya, suresh, divya, mohan) @ `example.com` / `user123`,
  each with 4–12 challans sampled against the real junction list

### 5. Run in development

```bash
npm run dev           # starts both server (5000) and client (5173)
```

Or in separate terminals:
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173**

---

## API Reference

### Auth
| Method | Path              | Auth | Description          |
|--------|-------------------|------|----------------------|
| POST   | /api/auth/register| —    | Create account       |
| POST   | /api/auth/login   | —    | Get JWT token        |
| GET    | /api/auth/me      | JWT  | Current user         |

### Challans (citizen)
| Method | Path              | Auth | Description          |
|--------|-------------------|------|----------------------|
| GET    | /api/challans     | JWT  | My challans          |
| PATCH  | /api/challans/:id | JWT  | Pay or contest       |

### Junctions (public)
| Method | Path                  | Auth | Description          |
|--------|-----------------------|------|----------------------|
| GET    | /api/junctions        | —    | All 168 real junctions (model_cli.py output) |
| GET    | /api/junctions/hotspots| —   | Top N by CLI score   |
| GET    | /api/junctions/:jid   | —    | Single junction      |

### Analytics (admin)
| GET /api/analytics/summary | GET /api/analytics/monthly |
| GET /api/analytics/hourly  | GET /api/analytics/weekday |
| GET /api/analytics/violations | GET /api/analytics/vehicles |
| GET /api/analytics/top-junctions | GET /api/analytics/events |
| GET /api/analytics/ticket-quality | Full ticket-quality model output (AUC, feature importance, pending-backlog risk bands) |

### Admin
| Method | Path                          | Auth  | Description        |
|--------|-------------------------------|-------|--------------------|
| GET    | /api/admin/users              | Admin | All citizens       |
| GET    | /api/admin/users/:id/challans | Admin | User's challans    |
| GET    | /api/admin/offenders          | Admin | Repeat offenders among the small demo-user Challan set |
| GET    | /api/admin/offenders-ml       | Admin | ★ Real dataset-wide offender escalation tiers (model_offenders.py, ~11,900 vehicles) — supports `?tier=` and `?limit=` |

### Patrol (admin)
| GET /api/patrol/priority | GET /api/patrol/forecast | GET /api/patrol/gaps |

All three are backed by `Junction.cliScore` (model_cli.py) and `Forecast` (model_forecast.py) —
no hardcoded forecast table or enforcement-gap list remains in the route code.

---

## Routes (Frontend)

| Path           | Auth     | Page                  |
|----------------|----------|-----------------------|
| `/`            | Public   | Role-aware dashboard  |
| `/auth`        | —        | Login / Register      |
| `/about`       | Public   | About BTP             |
| `/rules`       | Public   | Traffic Rules         |
| `/guidelines`  | Public   | Platform Guide        |
| `/my-challans` | Citizen  | My Challans + actions |
| `/my-analytics`| Citizen  | Personal charts       |
| `/my-map`      | Citizen  | Violation map         |
| `/analytics`   | Admin    | City-wide analytics   |
| `/tickets`     | Admin    | Ticket quality        |
| `/offenders`   | Admin    | Repeat offenders      |
| `/patrol`      | Admin    | Patrol planner        |
| `/users`       | Admin    | User management       |

---

## Key Changes from Original (TanStack → MERN)

| Before                   | After                         |
|--------------------------|-------------------------------|
| TanStack Router          | React Router v6               |
| `createFileRoute`        | Regular component + `<Route>` |
| localStorage auth        | JWT via HTTP API              |
| Mock data in `.ts` files | MongoDB + Mongoose            |
| No backend (Nitro)       | Express REST API              |
| Bun runtime              | Node.js                       |
