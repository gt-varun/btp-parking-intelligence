# How to Run — for judges & submission

## Option A — Just use the live deployment (no setup)

- **App (frontend):** https://btp-parking-intelligence.vercel.app/
- **API (backend):** https://btp-parking-intelligence.onrender.com

**Demo logins**
| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@test.btp.in` | `admin123` |
| Citizen | `rahul@example.com` (or priya / suresh / divya / mohan) | `user123` |

> ⚠️ The API is on Render's free tier and **sleeps after inactivity** — the first
> request can take ~50s to wake. Open the app once and wait, then it's responsive.

---

## Option B — Run locally

### Prerequisites
- Node.js ≥ 18
- Python 3.10+ with `pandas` + `scikit-learn`
- MongoDB running locally **or** a MongoDB Atlas URI

### 1. Install
```bash
npm install            # root (concurrently)
npm run install:all    # server + client deps
pip install pandas scikit-learn
```

### 2. Configure
```bash
cd server
cp .env.example .env
# set MONGO_URI, JWT_SECRET, and CLIENT_URL=http://localhost:5173
```

For the client, create `client/.env`:
```
VITE_API_URL=http://localhost:5001        # NOTE: no trailing /api — the client appends it
```

### 3. Train models → seed DB (must run in this order)
```bash
npm run ml:train    # trains all models on the 298k-row dataset (~5-6 min)
npm run seed:ml     # writes ml/output/*.json into MongoDB
npm run seed        # demo users + challans
# or all at once:  npm run seed:all  (after ml:train)
```

> The trained model outputs (`ml/output/*.json`) are already committed, so for a quick
> start you can **skip `ml:train`** and run just `npm run seed:ml && npm run seed`.

### 4. Run
```bash
npm run dev         # server (5001) + client (5173)
```
Open **http://localhost:5173**

---

## Deployment notes (Vercel + Render)

**Vercel (client) env var** — because the client appends `/api` itself:
```
VITE_API_URL = https://btp-parking-intelligence.onrender.com      ← no /api
```
Redeploy after setting (Vite inlines env vars at build time).

**Render (server) env vars:**
```
MONGO_URI   = <your MongoDB Atlas URI>
JWT_SECRET  = <long random string>
CLIENT_URL  = https://btp-parking-intelligence.vercel.app          ← for CORS
```

**After any model change**, refresh the live data:
```bash
cd ml && python3 model_cli.py        # (or run_all.py to retrain everything)
cd ../server && npm run seed:ml      # against the production MONGO_URI
```
The deployed app reads MongoDB, so changes only appear after re-seeding.
