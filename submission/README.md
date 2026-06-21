# Submission Package — BTP Parking Intelligence

Everything needed to submit for Flipkart GRiD (Gridlock).

| File | Use |
|------|-----|
| [1_PROJECT_DESCRIPTION.md](1_PROJECT_DESCRIPTION.md) | One-liner, short & long descriptions for the submission form / write-up |
| [2_PRESENTATION.md](2_PRESENTATION.md) | Slide-by-slide deck (12 slides) — paste into Google Slides/Canva, export PDF/PPT |
| [3_SNAPSHOTS.md](3_SNAPSHOTS.md) | Exact screenshots to capture, with captions and which slide each goes on |
| [4_RUN_INSTRUCTIONS.md](4_RUN_INSTRUCTIONS.md) | Live links, demo logins, local run + deploy config |
| [5_DEMO_VIDEO_SCRIPT.md](5_DEMO_VIDEO_SCRIPT.md) | Timed ~3-min voiceover script with on-screen actions |

## Headline facts (keep consistent everywhere)
- **298,450** real BTP violation records · **168** real junctions · **~11,900** offenders
- **Capacity-Loss Index** = lane-hours of road capacity lost/day (transparent, HCM-calibrated)
- ⭐ **Top 10 junctions = ~49% of citywide impact; 11 junctions = 50%**
- Rejection model ≈ **0.70 AUC** (honest ceiling on hard data)
- **Live:** app → vercel.app · API → onrender.com

## Pre-submission checklist
- [ ] Live app reseeded so new CLI numbers + Model Validation card show
- [ ] Render `CLIENT_URL` + Vercel `VITE_API_URL` env vars set, both redeployed
- [ ] Screenshots captured (see file 3) after reseed
- [ ] Deck exported to PDF/PPT
- [ ] Demo video recorded with warm (non-sleeping) API
