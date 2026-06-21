# Presentation Deck — slide-by-slide

> Build this in Google Slides / Canva / PowerPoint. **10–12 slides, ~1 idea per slide.**
> Copy each block onto a slide. Speaker notes are what you *say*; bullets are what's *on screen*.
> Keep slides visual — screenshots over text (see `3_SNAPSHOTS.md` for which to use where).

---

### Slide 1 — Title
- **BTP Parking Intelligence**
- *Detecting illegal-parking hotspots and quantifying their impact on traffic flow*
- Team name · Flipkart GRiD — Gridlock · live links at bottom
- 🖼 Background: the hotspot heat-map screenshot

---

### Slide 2 — The Problem
- Illegal parking is a top, under-measured cause of urban gridlock
- Enforcement is thin & reactive — agencies can't answer:
  - **Where** are the worst hotspots?
  - **How much traffic** does each one actually cost?
- *Speaker note:* "You can't target what you can't measure."

---

### Slide 3 — Problem Statement (verbatim)
- *"How can AI-driven parking intelligence detect illegal parking hotspots and
  quantify their impact on traffic flow to enable targeted enforcement?"*
- Three verbs we deliver on: **Detect · Quantify · Target**

---

### Slide 4 — Our Data (credibility up front)
- **298,450 real BTP violation records**
- **168 real geocoded Bengaluru junctions**
- ~11,900 repeat-offender vehicles
- **Zero hardcoded numbers** — every score is a real model/data output
- 🖼 Snapshot: dataset summary / analytics overview

---

### Slide 5 — Solution Overview (the 4 layers)
- 1️⃣ **Capacity-Loss Index** — quantifies traffic impact (lane-hours lost/day)
- 2️⃣ **7-day forecast** — where violations spike next
- 3️⃣ **Repeat-offender tiers** — chronic offenders
- 4️⃣ **Ticket-quality** — rejection-risk before it wastes court time
- 🖼 Snapshot: admin dashboard home

---

### Slide 6 — ⭐ The Core: Capacity-Loss Index
- Translates violations → **lane-hours of road capacity lost per junction per day**
- Transparent traffic-engineering formula (HCM-calibrated), **not a black box**:
  - `lane_hours = blocking_violations/day × block_duration × throughput_loss(vehicle) × peak_amplification`
- Every term measured from data except **one stated assumption** (block duration) — and it's *ranking-neutral*
- *Speaker note:* "We chose an auditable index over a pseudo-model on purpose — a judge can verify every term."

---

### Slide 7 — ⭐ The Headline Insight (your money slide)
- **Top 10 junctions = ~49% of all lane-hours lost citywide**
- **Just 11 junctions = 50% of total impact** (of 168)
- Citywide ~78.5 lane-hours lost/day
- ➡️ **Targeted enforcement of a handful of junctions captures most of the benefit**
- 🖼 Snapshot: hotspot map + a Pareto/bar chart of top junctions

---

### Slide 8 — Targeted Enforcement in action
- Hotspot map → patrol priority list → 7-day forecast → offender tiers
- One coherent workflow from "where" to "go here, now, for this vehicle"
- 🖼 Snapshot: Patrol priority page + map together

---

### Slide 9 — Intellectual Honesty (turns a weakness into a strength)
- We **state our limits in the product itself**:
  - **Enforcement/selection bias** — we measure observed-violation density, not un-patrolled streets
  - **No ground-truth traffic validation** — calibrated to engineering rules, next step is camera/probe data
- *Speaker note:* "We'd rather show you the ceiling than pretend it isn't there."
- 🖼 Snapshot: Model Validation panel showing metrics + caveats

---

### Slide 10 — Architecture & Stack
- `Python ML (offline) → JSON → MongoDB → Express API (JWT) → React + Leaflet`
- Models are **swappable** — edit one file, re-run, re-seed; nothing else changes
- Stack badges: React 19 · Tailwind v4 · Leaflet · Node/Express · MongoDB · scikit-learn
- 🖼 Simple architecture diagram

---

### Slide 11 — Live Demo
- **App:** btp-parking-intelligence.vercel.app
- **API:** btp-parking-intelligence.onrender.com
- (Then switch to the live app / demo video)

---

### Slide 12 — Roadmap / Impact & Close
- Next: camera/probe-vehicle data → validated capacity loss + un-patrolled hotspot detection
- Real-time patrol dispatch integration
- **Impact:** fix 11 junctions, relieve half the parking-induced gridlock
- Thank you · team · contact

---

## Export tips
- **To PDF:** File → Download → PDF (Google Slides / PowerPoint).
- Keep a **consistent color** for the BTP brand; dark UI screenshots look sharp on white slides.
- Slides 6 + 7 are the ones judges remember — spend your design polish there.
