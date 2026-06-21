# BTP Parking Intelligence — Project Description

> **Problem statement (Flipkart GRiD — Gridlock):** *How can AI-driven parking
> intelligence detect illegal parking hotspots and quantify their impact on
> traffic flow to enable targeted enforcement?*

---

## One-liner (for the submission form)

An AI-driven parking-intelligence platform that turns **298,450 real Bangalore
Traffic Police violation records** into a ranked map of illegal-parking hotspots,
quantifies each one's **traffic-flow impact in lane-hours lost per day**, and hands
enforcement a prioritized patrol plan — surfacing that **just 11 of 168 junctions
cause 50% of the city's parking-induced capacity loss.**

---

## Short description (~100 words)

BTP Parking Intelligence is a full-stack MERN dashboard built on the real
298,450-record BTP violations dataset. It detects illegal-parking hotspots across
168 Bengaluru junctions, then quantifies each junction's impact on traffic flow via
a **Capacity-Loss Index** — a transparent, traffic-engineering-calibrated estimate
of lane-hours of road capacity lost per day. On top of that it forecasts the next
7 days of violations per junction, scores ~11,900 repeat offenders into escalation
tiers, and flags tickets likely to be rejected. **Every number in the UI is a real
model/data output — nothing is hardcoded.** The result is a targeted-enforcement tool:
patrol the few junctions that cause most of the gridlock.

---

## Long description (for slides / write-up)

### The problem
Illegal parking is a primary, under-measured cause of urban gridlock. Enforcement is
spread thin and reactive because agencies can't answer two questions quantitatively:
**(1) where are the worst hotspots, and (2) how much traffic does each actually cost?**

### Our approach
We built an end-to-end pipeline on the **real 298,450-record BTP dataset** (no synthetic
or placeholder numbers), across four intelligence layers:

| Layer | What it answers | Method |
|---|---|---|
| **Capacity-Loss Index (CLI)** | *Which hotspots hurt traffic most, and by how much?* | Transparent traffic-engineering formula: lane-hours of carriageway capacity lost/day, HCM-calibrated. **Deliberately not a black-box model** — it's auditable. |
| **7-day forecast** | *Where will violations spike next?* | `GradientBoostingRegressor`, recursive rollout, back-tested vs naïve baseline |
| **Repeat-offender tiers** | *Who are the chronic offenders?* | `KMeans` over ~11,900 vehicles → escalation tiers |
| **Ticket-quality / rejection risk** | *Which tickets will be thrown out?* | Class-balanced `LogisticRegression`, ~0.70 AUC |

### The key insight
Capacity loss is **highly concentrated**: the **top 10 junctions account for ~49% of
all lane-hours lost citywide, and just 11 junctions cover 50%.** That means targeted
enforcement of a handful of junctions captures most of the benefit — exactly what the
problem statement asks for.

### Why it's credible
- **Real data end-to-end** — 298,450 records, 168 real geocoded junctions; Python
  models write JSON → MongoDB → API → React. Node never fabricates a score.
- **Intellectually honest** — the CLI is presented as a transparent index, not a
  pseudo-model, and the app openly states its two limitations (enforcement/selection
  bias; no ground-truth traffic validation) in the Model Validation panel.

### Architecture
`Python ML (offline) → ml/output/*.json → MongoDB (seed) → Express API (JWT) → React + Leaflet + Recharts`

### Tech stack
React 19 · Vite · Tailwind v4 · Leaflet · Recharts · Node/Express (ESM) · MongoDB/Mongoose · JWT · Python (pandas, scikit-learn)

### Live
- **App:** https://btp-parking-intelligence.vercel.app/
- **API:** https://btp-parking-intelligence.onrender.com
