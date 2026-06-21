# Demo Video Script (~2.5–3 min)

> **Format:** screen recording with voiceover. Target **2.5–3 minutes** — judges
> watch dozens; be tight. Columns: **[TIME] · ON SCREEN (what you click/show) · SAY (narration)**.
> Record in the **dark theme**, browser only, no desktop clutter.
>
> ⚠️ **Before recording:** warm up the Render API (open the app, wait ~1 min so it's
> not cold), and make sure the live DB is **re-seeded** so the new CLI numbers show.

---

### [0:00–0:15] — Hook + problem
**ON SCREEN:** Landing/home page of the app, then the hotspot map zooming into Bengaluru.
**SAY:**
> "Illegal parking is one of the biggest causes of urban gridlock — but enforcement is
> blind: agencies don't know *which* spots hurt traffic most, or by *how much*. We built
> BTP Parking Intelligence to answer exactly that, using **298,000 real Bangalore Traffic
> Police violation records.**"

---

### [0:15–0:35] — Data credibility
**ON SCREEN:** Admin → Analytics overview with the headline numbers (298,450 records, 168 junctions).
**SAY:**
> "Everything you'll see is built on the real dataset — **298,450 records across 168 real
> junctions.** Nothing here is a hardcoded placeholder; every score comes from a model or a
> real aggregate."

---

### [0:35–1:05] — ⭐ Detect + Quantify (the core)
**ON SCREEN:** Hotspot map; click a top hotspot (e.g. Safina Plaza / KR Market) to open its card showing CLI score + **lane-hours lost/day** + 24-hr pattern.
**SAY:**
> "First, we **detect** hotspots — here are the worst junctions ranked on the map. But the
> real question is *impact*. Our **Capacity-Loss Index quantifies traffic impact in lane-hours
> of road capacity lost per day** — using a transparent traffic-engineering formula, not a
> black box. This junction alone loses several lane-hours every single day."

---

### [1:05–1:30] — ⭐ The headline insight
**ON SCREEN:** Analytics → top-junctions ranking / Pareto bar chart.
**SAY:**
> "And here's the insight that makes enforcement *targeted*: capacity loss is hugely
> concentrated. The **top 10 junctions cause about 49% of all lane-hours lost city-wide —
> just 11 of 168 junctions account for half the total impact.** Fix a handful of junctions,
> and you relieve most of the parking-induced gridlock."

---

### [1:30–1:55] — Targeted enforcement workflow
**ON SCREEN:** Patrol priority page → 7-day forecast chart → Offenders tiers (quick pans).
**SAY:**
> "That flows straight into action: a **prioritized patrol list**, a **7-day forecast** of
> where violations will spike next, and **escalation tiers for ~11,900 repeat offenders** —
> so enforcement knows where to go, when, and which vehicles to watch."

---

### [1:55–2:15] — Honesty = credibility
**ON SCREEN:** Model Validation panel showing CLI's top-10 share + the caveat line, ticket-quality AUC.
**SAY:**
> "We're upfront about limits — the app itself states them: this reflects *observed* violation
> density, and capacity loss is engineering-estimated, not yet validated against live traffic
> sensors. Our rejection model runs at around 0.70 AUC on genuinely hard data. We show the
> ceiling instead of inflating it."

---

### [2:15–2:35] — Architecture (fast)
**ON SCREEN:** Architecture diagram slide OR quick flash of the code/repo structure.
**SAY:**
> "Under the hood: Python models train offline and write JSON, which seeds MongoDB; an Express
> API serves a React and Leaflet front end. Models are swappable — one file, re-run, re-seed."

---

### [2:35–2:50] — Close
**ON SCREEN:** Hotspot map (full), with live URLs on screen.
**SAY:**
> "BTP Parking Intelligence: detect the hotspots, quantify the gridlock they cause, and target
> enforcement where it actually moves traffic. It's live — links are in our submission. Thank you."

---

## Recording tips
- Tools: **QuickTime** (Mac screen record) or **OBS**; trim in iMovie.
- Record narration **separately** if your click-timing is shaky, then sync.
- Keep the cursor calm — slow, deliberate movements read far better than fast jitter.
- Pre-open every tab you'll visit so there are **no loading spinners** on camera.
- One take per section is fine; stitch in editing. Aim for clean audio over fancy video.
