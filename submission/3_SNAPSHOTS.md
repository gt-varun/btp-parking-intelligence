# Snapshots to capture (for slides, submission gallery & README)

> Capture at **1440–1920px wide**, in a clean browser window (no bookmarks bar),
> logged in as **admin** for the admin views. Prefer the **dark theme** — the BTP UI
> looks sharper and screenshots pop on light slides. Name files as listed so they're
> easy to drop into the deck.

| # | Filename | Screen / page | What must be visible | Used on slide |
|---|----------|---------------|----------------------|---------------|
| 1 | `01-hotspot-map.png` | Home / map view with hotspots | Leaflet map with colored CLI hotspot markers over Bengaluru; a hotspot card open showing **CLI score + lane-hours/day** | Title, 7 |
| 2 | `02-dataset-overview.png` | Admin → Analytics (top) | Headline stats: **298,450 records**, 168 junctions, rejection rate, offender count | 4 |
| 3 | `03-dashboard-home.png` | Admin home dashboard | The role-aware dashboard with the 4 intelligence modules visible | 5 |
| 4 | `04-cli-detail.png` | A high-CLI junction (e.g. Safina Plaza / KR Market) | Junction detail: **CLI score, lane-hours lost/day, top violation, 24-hr pattern** | 6 |
| 5 | `05-top-junctions-pareto.png` | Analytics → top junctions table/chart | Ranked junctions by CLI; if possible a bar chart showing the **concentration** (top 10 ≈ 49%) | 7 ⭐ |
| 6 | `06-patrol-priority.png` | Admin → Patrol | Prioritized patrol list with CLI scores + the 7-day forecast | 8 |
| 7 | `07-forecast.png` | Admin → Patrol/forecast chart | 7-day-ahead violation forecast line/area chart | 8 |
| 8 | `08-offenders.png` | Admin → Offenders | Repeat-offender tiers (escalation tiers, ~11,900 vehicles, tier filter) | 8 |
| 9 | `09-ticket-quality.png` | Admin → Tickets / ticket-quality | Rejection-risk output: **AUC, feature importance, risk bands** | 5 / 9 |
| 10 | `10-model-validation.png` | Model Validation panel | The model cards — **CLI shows "Top-10 share 49.3%" + the caveat line**, ticket AUC, etc. | 9 ⭐ |
| 11 | `11-architecture.png` | (Make in slides, not a screenshot) | `Python → JSON → MongoDB → API → React` diagram | 10 |
| 12 | `12-mobile-or-citizen.png` | Citizen view (MyChallans / MyMap) | Shows the platform also serves citizens, responsive | optional |

## Capture checklist
- [ ] Logged in as admin (`admin@test.btp.in`) for admin shots
- [ ] **Live app reseeded** so the new CLI numbers + Model Validation card show (otherwise #5 and #10 show the OLD figures)
- [ ] Map is zoomed to show clustered hotspots, not the whole country
- [ ] No console errors / loading spinners frozen in the shot
- [ ] Consistent theme (dark) across all shots

## Must-have shots (if short on time, get these 4)
1. `01-hotspot-map.png` — proves "detect hotspots"
2. `05-top-junctions-pareto.png` — proves "quantify impact" + the 49% headline
3. `06-patrol-priority.png` — proves "targeted enforcement"
4. `10-model-validation.png` — proves credibility + honesty
