# Handoff: CRS Scenario Planner

## Overview
A Comprehensive Ranking System (CRS) calculator for Canada's Express Entry, built around scenario planning: users answer a guided questionnaire, calculate their score with a full breakdown, save named scenarios to local storage, and compare scenarios side-by-side with deltas against a chosen baseline. Targets prospective immigrants exploring "what if" moves (retake a language test, finish a degree, gain work experience).

## About the Design Files
The files in this bundle are **design references created in HTML** — a working prototype showing intended look, behavior, and (importantly) verified scoring logic. They are not production code to ship directly. Recreate this design in your target codebase's environment (React, Vue, Svelte, etc.) using its established patterns; if no codebase exists yet, pick the framework you prefer (a small React or Svelte SPA is a natural fit — single page, three views, localStorage persistence, no backend required).

`CRS Scenario Planner.dc.html` is the design + logic. The `<x-dc>` template section is the markup (with `{{ }}` value holes); the `class Component` script at the bottom holds all state, scoring tables, and handlers. `support.js` is only the prototype runtime — ignore it.

## Fidelity
**High-fidelity.** Colors, typography, spacing, radii, copy, and interactions are final. Recreate pixel-perfectly.

**The scoring logic is also final and verified.** The point tables and computation in `class Component` (statics `EDU_PTS` through `BANDS`, and methods `agePts`, `l1Ability`, `compute`, `studyBonus`, `frenchBonus`) were validated against the official IRCC CRS tables and cross-checked against the official calculator (single-applicant scenario: 511 ✓; with-spouse scenario ✓). **Port this logic verbatim — do not re-derive it.**

## Screens / Views
Single page, three views switched by a pill tab nav in the header (`view` state: `calc` | `saved` | `compare`). Max content width 1120px, centered, 20px side padding.

### Header (all views)
- Logo: 36×36 rounded square (radius 12), bg #C2683C, white "CRS" in Bricolage Grotesque 800 12px; beside it "Scenario Planner" (Bricolage 700 17px) over "Express Entry · saves to your browser" (11.5px #8A7D6B). Clicking logo goes to Calculator.
- Tab nav: pill container bg #F1E9DC radius 999, 4px padding; active tab = white pill, #3A3227 text, subtle shadow `0 1px 4px rgba(60,45,25,0.12)`; inactive = transparent, #8A7D6B. "My scenarios" shows a count badge (bg #C2683C, white, 11px) when scenarios exist.
- No donate button in the header — tipping is handled by the Ko-fi floating widget (see below).

### View 1 — Calculator
Two-column layout: form (flexible) + sticky score card (~340px) on the right; stacks on narrow screens.

Dismissible info banner at top (bg #FBF3E2, border #EAD9AC, radius 16): "Heads up: this tool is informational only, not immigration advice…" with ✕ dismiss (dismissal is session state, not persisted).

Form is white cards (bg #fff, border 1px #ECE3D4, radius ~20, generous padding), each with a numbered chip (26×26, radius 9, bg #F8E7D9, #A8552E bold) + Bricolage 700 19px title:
1. **Your family situation** — Yes/No pills: spouse? → is spouse PR/citizen? → is spouse coming? Green note (bg #EDF4EC, border #CFE3CD, #3E6B4A) when partner is PR/citizen: scored as single.
2. **About you** — age select (17-or-younger … 45-or-older); education level select (8 levels); "education in Canada?" pills → credential length pills (1–2 yrs / 3+ yrs). Helper text 13px #8A7D6B.
3. **Work experience** — Canadian years select (0–5+), foreign years select (0–3+), trade certificate pills.
4. **Language** — first-test select (CELPIP-G, IELTS General Training, PTE Core, TEF Canada, TCF Canada — all enabled); per-skill band selects (Speaking/Listening/Reading/Writing) in an auto-fit grid `minmax(150px,1fr)` gap 12; band options change with the test. Dashed divider (#ECE3D4), then second-language section: TEF Canada / TCF Canada / Not applicable pills + French band selects when applicable.
5. **Your partner** (only when spouse is accompanying and not PR) — "up to 40 points" tag; partner education, Canadian work, test + bands.
6. **Extra points** — provincial nomination pills, sibling-in-Canada pills.

Selection pills: radius 999, padding 9px 16px, 1.5px border; selected = border #C2683C, bg #F8E7D9, text #8A431F; unselected = border #E7DECE, bg #fff, text #5C5142; hover border #C2683C; 600 weight 14px.

**Score card** (sticky): before first calculation shows a section checklist (done = check, pending = muted) and helper copy. "Calculate my score" is a solid #C2683C pill button (hover #A8552E), disabled until every section is complete — clicking while incomplete shows a toast naming the first missing item ("Still needed: Age +2 more"). After calculating:
- "YOUR CRS SCORE" kicker (13px 700 uppercase, letter-spacing .08em, #8A7D6B)
- Score in Bricolage 800 58px #3A3227, "out of 1,200" beside it
- 4 breakdown bars (Core human capital /500 or /460 with spouse, Spouse factors /40, Skill transferability /100, Additional points /600): label + "n / max", 999-radius track with #C2683C fill, width animates `.4s ease`
- Save controls: name input + Save / Save as new (updates existing scenario when one is loaded)
- Stale notice (bg #FBF3E2) if answers change after calculating: "Your answers changed since this score." with recalculate action. (A `liveScoring` boolean prop recalculates on every change instead — default off.)

### View 2 — My scenarios
Empty state: centered 52×52 icon chip, "Nothing saved yet" (Bricolage 700 20px), helper copy, solid CTA to Calculator.
Scenario cards: name, "Updated Mmm d, yyyy", key inputs summary, big score (Bricolage 800 26px) over "/ 1,200". Actions: load (opens in Calculator), rename inline, delete with two-step confirm (first click arms "Confirm?", second deletes; toast "Scenario deleted"). Checkbox toggles inclusion in Compare.

### View 3 — Compare
Scenario picker cards (checked = 1.5px #C2683C border). Needs ≥2 selected. Header row per scenario: name, score (Bricolage 800 26px), tag — "baseline" pill (bg #F1E9DC #8A7D6B) or delta ("+29" green #3E8E5F / "−12" red #C05B4D / "±0" #B7AB99). Clicking a column header sets it as baseline.
Comparison grid rows (label column + one column per scenario, 1px #F0E8DA rules): score rows (Core human capital, Spouse factors, Skill transferability, Additional points, each with delta sub-label) then input rows (age, education, work, language summary "IELTS · S 7.0 · L 7.5 · …"). Input cells that differ across scenarios get a highlight bg (#FBF0…, see template).

### Global
- Toast: fixed bottom-center dark pill (bg #3A3227, text #FAF6F0, radius 999), fadeUp .25s, auto-dismiss 2.6s.
- **Ko-fi floating tip widget**: load `https://storage.ko-fi.com/cdn/scripts/overlay-widget.js` once on app mount, then call `kofiWidgetOverlay.draw('vincent69669', { 'type': 'floating-chat', 'floating-chat.donateButton.text': 'Support me', 'floating-chat.donateButton.background-color': '#C2683C', 'floating-chat.donateButton.text-color': '#fff' })`. Ko-fi anchors it bottom-LEFT with no position option — override to bottom-right (16px from edge) with CSS injected after the script loads, targeting both the button and its popup panel: `.floatingchat-container-wrap, .floatingchat-container-wrap-mobi, [id*="kofi-widget-overlay"] div { left: unset !important; right: 16px !important; }` and `.floating-chat-kofi-popup-iframe, .floating-chat-kofi-popup-iframe-mobi { left: unset !important; right: 16px !important; }` (Ko-fi's class names may change — verify in devtools). Clicking opens Ko-fi's tip panel in-app. See `componentDidMount` in the DC file for the working reference implementation.
- Footer: disclaimer block ("informational purposes only… not immigration advice… verify against official IRCC tools") + links column. Keep the disclaimer — it's a legal requirement of the product.
- `fadeUp` keyframes: opacity 0 / translateY(8px) → 1 / 0.

## Interactions & Behavior
- Answer changes mark an existing result stale (banner) unless `liveScoring` recomputes when the form is complete.
- Calculate validates via `missing(form)`; toast lists the first gap.
- Save: name defaults to "Scenario N"; saving with a loaded scenario updates it, "Save as new" forks. Toast confirms Saved/Updated with the name.
- Load: deep-copies inputs into the form, restores result, switches to Calculator.
- Delete: two-step confirm on the card itself (no modal).
- Footer "♥ Support this tool with a tip" link opens `donateUrl` in a new tab.
- Spouse gating: partner section and with-spouse point tables apply only when spouse exists, is not PR/citizen, and is accompanying (`affects()`).
- Disabled test options (none currently) show a toast instead of selecting.
- Focus: 2px #C2683C outline, offset 1px, on selects/inputs/`button:focus-visible`.

## State Management
- `view`, `form` (all questionnaire answers; language bands keyed s/l/r/w), `result` ({total, core, spousePts, transfer, additional, stale}), `currentId`, `saveName`, `scenarios[]` ({id, name, createdAt, updatedAt, inputs, result}), `compareSel[]`, `baseline`, `confirmDelete`, `toast`, `bannerDismissed`, `calculatedOnce`.
- Persistence: `localStorage["crsPlannerScenarios"]` (JSON array), loaded on mount, written on save/delete. No backend.
- Props (make configurable): `donateUrl` (string, default `https://ko-fi.com/vincent69669` — used by the footer tip link; the Ko-fi widget handle is hard-coded), `liveScoring` (bool), `sampleData` (bool — three demo scenarios when nothing is saved).

## Scoring Logic (port verbatim)
All in `class Component` of the DC file:
- `BANDS` — per-test band-label → CLB/NCLC tables for CELPIP-G, IELTS, PTE Core, TEF Canada, TCF Canada (official IRCC equivalencies).
- `agePts`, `EDU_PTS`, `l1Ability`, second-language per-skill points (6/3/1 capped 24/22), `CDN_WORK` — core human capital, [without, with] spouse variants.
- Spouse: `SP_EDU_PTS`, per-skill language (5/3/1 capped 20), `SP_WORK` — max 40.
- Transferability: education×language, education×Canadian-work (pair capped 50), foreign×language, foreign×Canadian (pair capped 50), trade cert ×language (capped 50), total capped 100.
- Additional: provincial nomination 600, sibling 15, Canadian study bonus 15/30, French bonus 25/50 (NCLC7+ all French skills; 50 if English CLB5+, else 25), capped 600.
- Total capped 1,200. Non-accompanying or PR/citizen spouse → scored as single.

## Design Tokens
Colors:
- Background #FAF6F0; card #FFFFFF; card border #ECE3D4; dividers #F0E8DA, dashed #ECE3D4
- Text #3A3227; muted #8A7D6B; secondary #5C5142; faint #B7AB99
- Accent #C2683C (hover #A8552E, deep #8A431F); accent tint #F8E7D9; neutral tint #F1E9DC
- Warning bg #FBF3E2 / border #EAD9AC / text #7A683F–#6E6046; success bg #EDF4EC / border #CFE3CD / text #3E6B4A
- Delta green #3E8E5F, red #C05B4D; toast bg #3A3227 text #FAF6F0
- Links: #A8552E, hover #8A431F underlined

Typography: **Bricolage Grotesque** (500–800) for headings, numbers, buttons-as-display; **Figtree** (400–700) for everything else (Google Fonts). Scale: 58 score, 26 card scores, 19–20 card titles, 17 brand, 14–15 body/controls, 13–13.5 helper, 11–12.5 meta.

Radii: 999 pills/tracks; 16–20 cards/banners; 12 logo/notices; 9 number chips. Shadows: minimal — active tab `0 1px 4px rgba(60,45,25,0.12)`, toast `0 8px 24px rgba(40,30,15,0.3)`. Spacing: 20px page gutter, ~20–24 card padding, 12 grid gaps, 8 pill gaps.

## Assets
No images or icon fonts in the design — the logo is pure CSS; check/✕ marks are text glyphs.

`screenshots/` holds visual references of the live prototype (use to verify your recreation; scores shown are sample data):
- `01-calculator-empty.png` — Calculator, nothing answered (checklist state)
- `02-calculator-scored.png` — Calculator with a loaded scenario and score breakdown
- `03-my-scenarios.png` — Saved scenarios list + footer
- `04-compare-picker.png` — Compare, selection state
- `05-compare-table.png` — Compare, side-by-side table with baseline + deltas

## Files
- `CRS Scenario Planner.dc.html` — full design: template (markup + inline styles) and `class Component` (state, scoring tables, handlers).
- `support.js` — prototype runtime only; do not port.
