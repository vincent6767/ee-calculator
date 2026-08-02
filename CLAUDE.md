# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

A design handoff for a **CRS Scenario Planner** — a Comprehensive Ranking System calculator for Canada's Express Entry with scenario save/compare features. There is **no production codebase, build system, or test suite yet**. The expected work here is implementing the app from the handoff bundle in `Branching calculator prototype review/design_handoff_crs_scenario_planner/`.

Read that folder's `README.md` in full before implementing — it is the authoritative spec (views, interactions, state model, design tokens).

## Handoff bundle contents

- `CRS Scenario Planner.dc.html` — the design + logic reference. The `<x-dc>` template section is the markup (with `{{ }}` value holes); `class Component` at the bottom (~line 451) holds all state, scoring tables, and handlers. Open it directly in a browser to run the working prototype.
- `support.js` — prototype runtime only. **Do not port it.**
- `screenshots/` — visual references of each view for verifying a recreation.

## Critical constraints

- **Port the scoring logic verbatim — do not re-derive it.** The point tables and methods in `class Component` (statics `EDU_PTS` through `BANDS`; methods `agePts`, `l1Ability`, `compute`, `studyBonus`, `frenchBonus`) were validated against official IRCC CRS tables and cross-checked against the official calculator. Any reimplementation must reproduce them exactly.
- **High-fidelity recreation.** Colors, typography (Bricolage Grotesque + Figtree), spacing, radii, copy, and interactions are final — recreate pixel-perfectly per the README's design tokens.
- **Keep the footer disclaimer** ("informational purposes only… not immigration advice") — it's a legal requirement of the product.
- Framework is open: recreate in the target codebase's stack, or if starting fresh, a small React or Svelte SPA (single page, three views, localStorage persistence, no backend).

## Architecture (of the app to build)

- Single page, three views switched by header tab nav: `calc` | `saved` | `compare`.
- All state client-side; scenarios persist to `localStorage["crsPlannerScenarios"]` (JSON array), loaded on mount, written on save/delete.
- Configurable props: `donateUrl` (string), `liveScoring` (bool — recompute on every change instead of stale-banner flow), `sampleData` (bool — demo scenarios when nothing saved).
- Spouse gating: partner section and with-spouse point tables apply only when a spouse exists, is not a PR/citizen, and is accompanying.
- Score breakdown: core human capital (/500, or /460 with spouse), spouse factors (/40), skill transferability (/100), additional points (/600); total capped 1,200.
