# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

**CRS Scenario Planner** — a Comprehensive Ranking System calculator for Canada's Express Entry, built as a client-only React SPA with scenario save/compare features. No backend, no accounts; everything persists to the browser's `localStorage`.

The app was implemented from a design handoff bundle and a product spec, both still present in the repo as reference material:

- `Branching calculator prototype review/design_handoff_crs_scenario_planner/` — the original design + logic reference (`CRS Scenario Planner.dc.html`, `README.md`, `screenshots/`). The scoring engine in `src/scoring/` was ported verbatim from this bundle's `class Component`; the `README.md` there is still the source of truth for exact design tokens and copy.
- `express-entry-crs-planner-spec.md` — the product spec (user stories, functional requirements, data model). Useful for *why* a behavior exists, not just *what* it does.

Consult both when a requirement is ambiguous — the handoff bundle for pixel/behavior fidelity, the spec for product intent and out-of-scope boundaries (§3).

## Stack and commands

React + TypeScript + Vite, tested with Vitest + Testing Library (jsdom).

- `npm run dev` — dev server
- `npm run build` — typecheck (`tsc -b`) + production build
- `npm run test` / `npm run test:run` — Vitest watch / single run
- `npm run coverage` — coverage gate on `src/scoring/**` and `src/model/**`
- `npm run lint` — typecheck only (`tsc --noEmit`); there is no separate linter configured

Node 22+'s built-in `localStorage` global shadows jsdom's in tests and lacks `.clear()` — `vite.config.ts` disables it for test workers via `--no-experimental-webstorage`. Don't remove that without confirming storage tests still pass.

## Critical constraints

- **The scoring logic in `src/scoring/` is ported verbatim from the design handoff and must stay that way.** `tables.ts` (statics `EDU_PTS` through `BANDS`), `bands.ts`, and `scoring.ts` (`agePts`, `l1Ability`, `compute`, `studyBonus`, `frenchBonus`) were validated against official IRCC CRS tables and cross-checked against the official calculator. Do not "simplify" or re-derive these — any change must be traceable to an actual IRCC rule update, and should come with an updated `SCORING_LAST_VERIFIED` date (`src/scoring/tables.ts`) and new/updated regression fixtures in `scoring.test.ts`.
- **High-fidelity design.** Colors, typography (Bricolage Grotesque + Figtree), spacing, radii, copy, and interactions should keep matching the handoff README's design tokens and `screenshots/`. `src/components/styles.ts` centralizes the shared style constants — extend it rather than hand-rolling new colors/radii inline.
- **Keep the footer disclaimer** ("informational purposes only… not immigration advice") — it's a legal requirement of the product (spec §6.4).
- **Scoring accuracy is a known, accepted gap, not a bug to silently fix.** The ported tables are labeled "approximate" and matched the prototype, not a fully-captured official flow doc across all five language tests (spec §7, §10). If asked to improve accuracy, that means adding real regression fixtures from the official calculator, not guessing at table values.

## Architecture

Single-page app, three views switched by header tab nav (`App.tsx` / `usePlanner` state: `calc` | `saved` | `compare`). All state is client-side.

```
src/
  scoring/    tables.ts, bands.ts, scoring.ts + scoring.test.ts — pure, verbatim-ported scoring engine
  model/      form.ts (blankForm, Form/Scenario types), validation.ts (missing(), sectionsDone()), samples.ts
  storage/    scenarios.ts — localStorage CRUD under key "crsPlannerScenarios"
  state/      usePlanner.ts — the hook wiring scoring + validation + storage into one API for the views
  components/
    Header.tsx, Banner.tsx, Footer.tsx, Toast.tsx
    calculator/  Pill.tsx, BandSelect.tsx, FormCards.tsx, ScoreCard.tsx, CalculatorView.tsx
    scenarios/   ScenarioCard.tsx, ScenarioList.tsx
    compare/     CompareView.tsx
    styles.ts   shared design-token style helpers
  lib/        format.ts (fmtDate/fmtYears/eduLabel/langSummary/delta), analytics.ts (privacy-friendly event wrapper)
  App.tsx, main.tsx, theme.css
```

Key behaviors to preserve:
- Scenarios persist to `localStorage["crsPlannerScenarios"]` (JSON array), loaded on mount, written on save/delete/rename/clear-all.
- Configurable `usePlanner` props: `donateUrl` (string), `liveScoring` (bool — recompute on every change instead of the stale-banner flow), `sampleData` (bool — show three demo scenarios when nothing is saved).
- Spouse gating (`affects()` in `scoring.ts`): the partner form section and with-spouse point tables apply only when a spouse exists, is not a PR/citizen, and is accompanying.
- Score breakdown: core human capital (/500, or /460 with spouse), spouse factors (/40), skill transferability (/100), additional points (/600); total capped at 1,200.
- Analytics (`lib/analytics.ts`) fires named funnel events only (`calculated`, `saved`, `compared`, `donate_clicked`) — never form inputs, scores, or language results (spec §6.6).
