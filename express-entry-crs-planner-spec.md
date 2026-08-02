# Express Entry CRS Scenario Planner — Product Specification

Status: Draft v2 (updated against the official calculator's actual flow and scoring tables)
Audience: Design and engineering (build handoff)
Source of truth for scoring logic: the calculator flow documentation (question inventory, branch logic, and official point tables, captured July 23, 2026 from canada.ca). Treat that document, not this PRD, as canonical for exact point values. This PRD calls out the parts that change our design or scope.

**Build blocker:** do not launch until score bands for all five language tests (CELPIP-G, IELTS, PTE Core, TEF Canada, TCF Canada) are fully captured, implemented, and covered by regression fixtures. No partial launch with only the two tests currently documented. See 6.1 and the Decisions Log in section 10.

## 1. Problem

Candidates use the official CRS calculator to test "what if" scenarios (retake a language test, finish a diploma, get a provincial nomination). The official tool and every alternative we found make you re-enter all your information from scratch every time, and none of them let you save a scenario to come back to later.

We validated this gap. One candidate on a public immigration forum built their own spreadsheet just to compare CRS scenarios. A competing tool (crscalculatorpro.ca) added scenario comparison but stores nothing between page loads, so a refresh wipes every scenario. Nobody has solved "save this and let me come back to it."

## 2. Goals (v1)

- Let a candidate fill in their profile once, save it as a named scenario, and return to it later without retyping anything.
- Let them create several scenarios and compare the scores side by side.
- Keep it simple: no account, no login, no server holding anyone's personal data.
- Keep the maintainer covered legally and give them a way to fund hosting.

## 3. Out of scope (v1)

- User accounts or login
- Server-side storage of any candidate's personal or scenario data
- Cross-device sync
- Export/import of scenarios as a file
- Official submission to IRCC or any integration with an IRCC account
- Languages other than English
- Mobile apps (web only, responsive)

## 4. Personas

**Candidate**
An Express Entry candidate who wants to know their CRS score and test how different choices (language test, education, work experience, provincial nomination) would change it. Main frustration: no way to save scenarios, so every visit starts from zero.

**Maintainer**
The person running the tool. Wants to limit legal liability, keep the tool funded through donations, and understand usage well enough to keep improving it.

## 5. User stories and acceptance criteria

| ID | Story | Acceptance criteria |
|----|-------|----------------------|
| C1 | As a candidate, I want to calculate my CRS score so I know how competitive I am in the pool. | Filling in all required fields and submitting returns a total score and a breakdown by category (core points, spouse points, skill transferability, additional points). Scoring engine passes all regression fixtures captured from live runs of the official calculator (see 6.1). |
| C2 | As a candidate, I want to save each scenario on my local machine so I can access and edit it again in the future. | Saving a scenario stores it in the browser (not on a server). Reopening the site later (same browser, same device) shows previously saved scenarios with all inputs intact and editable. |
| C3 | As a candidate, I want to delete one or all scenarios from my local machine so I can clean up my storage. | Each saved scenario has its own delete option with a confirmation step. A "clear all" option exists with a stronger confirmation (e.g. type "delete" or a second confirm click). |
| C4 | As a candidate, I want to compare scenarios side by side so I can see everything at once. | A comparison view shows 2 or more saved scenarios as columns, with differing inputs and the resulting score visually flagged. |
| M1 | As a maintainer, I want a legal disclaimer so everyone knows this is best-effort and informational only. | Disclaimer text (see 6.4) is visible before first calculation and persists in the footer. Not just a one-time popup that can be missed. |
| M2 | As a maintainer, I want a donation feature so I can keep the tool running. | A visible, non-intrusive donation link/button pointing to an external, already-hosted donation page. No payment details are collected or processed inside the app itself. |
| M3 | As a maintainer, I want landing page metrics so I can improve the experience. | Privacy-respecting analytics track page views and key funnel events (see 9). No scenario input data (age, scores, language results, etc.) is ever sent to analytics. |

## 6. Functional requirements

### 6.1 CRS calculator

Fields and branching, matching the official calculator's actual flow:

- **Do you have a spouse or common-law partner?** (yes/no). Simplified from the official tool's full 7-option marital status list, since only "having an accompanying spouse who isn't already a citizen/PR" changes the score. Every other status (single, divorced, widowed, legally separated, annulled, or married-but-spouse-not-accompanying) behaves identically for scoring, so there's no need to distinguish between them in the UI.
- **If yes**: "Is your spouse or common-law partner a citizen or permanent resident of Canada?" This matters a lot: if yes, treat the applicant as if there's no accompanying spouse at all (use the higher "without spouse" point tables for age/education/language, and skip every spouse question). Only if the answer is no do we ask "Will your spouse come with you to Canada?" and, if yes, unlock the spouse questions and the "with spouse" tables.
- **Age**
- **Level of education** (drives the core Education score; always asked)
- **Was that education earned in Canada?** (yes/no) then, if yes, **1-2 year credential or 3+ year credential?** This is a separate axis from level of education. It only feeds the "Study in Canada" additional-points bonus (15 or 30), not the core education score.
- **Canadian work experience** (years, 0-5+)
- **Foreign work experience** (years, 0-3+)
- **Trade certificate of qualification** (yes/no)
- **First official language**: test type (CELPIP-G, IELTS, PTE Core, TEF Canada, TCF Canada), then speaking/listening/reading/writing, each picked from that specific test's own raw-score bands (not a generic CLB dropdown). Every test has a different band table, so the UI needs one band set per test, not one universal one.
- **Second official language**: only ever French (TEF Canada, TCF Canada, or "not applicable"). There's no option to enter a second English test. Answering this unlocks both a Second Official Language line in the core score and a separate French-language-skills bonus in additional points.
- **Spouse factors**, only asked when the spouse branch applies: spouse's level of education, spouse's Canadian work experience, spouse's first official language test and scores (same test/band structure as above).
- **Additional points**: provincial or territorial nomination, sibling in Canada (citizen or PR, 18+), study in Canada (derived from the education-in-Canada answer above), French-language skills (derived from the language scores above).

**Decision: drop the job offer/LMIA question.** The official tool still asks it, but as of March 25, 2025 it contributes 0 CRS points regardless of NOC TEER; it only matters for program *eligibility*, which is out of scope for a scoring calculator. Confirmed: excluded from v1.

**Validation**: every field that applies given the branching above is mandatory. The user must fill in all applicable fields before they can calculate a score; no partial or blank submissions. Disable or block the "Calculate" action until everything required is filled in, and show the user what's missing.

Output: total score out of 1200, broken into core human capital points, spouse points, skill transferability points, and additional points, matching the same four-part breakdown the official results screen shows. Show the breakdown, not just the total, since the whole point of this tool is understanding where points come from.

Important: the official scoring rules change over time. The scoring logic should live in one clearly isolated module, reference the official point tables (see the calculator flow doc, section 6) in comments, and show a "scoring rules last verified on [date]" note. The official page itself shows a "page last modified" date in its footer; when re-verifying, check that date and note it alongside our own verification date.

**Update process**: the maintainer will monitor for IRCC scoring rule changes and flag them when they happen. When notified, update the scoring module, lookup tables, and regression fixtures accordingly, and refresh the "last verified" date.

**Regression testing**: the flow doc's section 5 captured a table of confirmed input/output pairs from live runs against the real tool (e.g. a 30-year-old single applicant with a Bachelor's and top-band IELTS scores nets exactly 386). Use these as automated test fixtures for the scoring engine before shipping. Expand the fixture set to cover all five language tests, not just IELTS and TEF Canada, before launch.

### 6.2 Scenario management

- "Save scenario" stores the current form state plus its calculated result.
- Each scenario gets a name (user-editable, default to "Scenario 1", "Scenario 2", etc.).
- Saved scenarios list shows name, score, and last-updated date.
- Clicking a saved scenario loads it back into the form for editing.
- Delete available per scenario and as a "clear all" action, both with confirmation.
- Storage: browser local storage (or IndexedDB if the data grows complex). No backend, no account needed for this to work. Make clear to users this is tied to their browser and device, and that clearing browser data will remove saved scenarios (a short note near the save button covers this).

### 6.3 Comparison view

- Select 2 or more saved scenarios to view side by side.
- Show every input field as a row, every scenario as a column.
- Highlight fields that differ between scenarios.
- Show total score and category breakdown for each, with the score difference vs. a chosen baseline scenario.

### 6.4 Legal disclaimer

Suggested text (adapt as needed):

> This calculator is provided for informational purposes only and is not immigration advice. We make our best effort to keep it accurate and current, but we don't guarantee it matches the official Government of Canada calculation, and we accept no liability for any loss or damage arising from its use. Always confirm your score using the official IRCC tools before making decisions.

Placement: shown before the first calculation (e.g. a banner or short modal) and permanently available in the footer.

### 6.5 Donation feature

- A donation button/link in the header or footer, pointing to an existing external donation page (e.g. Buy Me a Coffee, Ko-fi, GitHub Sponsors, PayPal.me).
- The app itself should not collect or process any payment details. Link out only.

### 6.6 Analytics

- Track anonymized, aggregate usage only: page views, "calculated a score" event, "saved a scenario" event, "compared scenarios" event, "clicked donate" event.
- Do not send any personal or scenario data (age, scores, language results, names) to the analytics tool.
- A privacy-friendly, lightweight analytics tool (e.g. Plausible, Fathom, or a self-hosted option like Umami) fits the "no personal data leaves the browser" principle better than a tool that relies on tracking cookies or fingerprinting.

## 7. Data model (per saved scenario)

```
Scenario {
  id: string
  name: string
  createdAt: timestamp
  updatedAt: timestamp
  inputs: {
    hasSpouseOrPartner: boolean                // simplified from the official tool's full 7-option marital status list
    spouseIsCitizenOrPR: boolean | null         // asked only if hasSpouseOrPartner = true
    spouseAccompanying: boolean | null          // asked only if spouseIsCitizenOrPR = false
    // spouseAffectsScore = hasSpouseOrPartner = true
    //                      AND spouseIsCitizenOrPR = false AND spouseAccompanying = true
    // this single derived flag decides which age/education/language point table to use,
    // and whether spouse fields below are scored at all

    age: number
    education: enum
    educationInCanada: "none" | "one_to_two_year" | "three_year_plus"   // drives Study in Canada bonus only
    canadianWorkExperienceYears: number
    foreignWorkExperienceYears: number
    hasTradeCertificate: boolean

    firstLanguage: {
      test: "celpip_g" | "ielts" | "pte_core" | "tef_canada" | "tcf_canada"
      speakingBand: string   // raw band label specific to the chosen test, e.g. IELTS "7.0"
      listeningBand: string
      readingBand: string
      writingBand: string
    }
    secondLanguage: {
      test: "tef_canada" | "tcf_canada"   // French only, no second English test option
      speakingBand: string
      listeningBand: string
      readingBand: string
      writingBand: string
    } | null

    spouse: {   // only present/used when spouseAffectsScore = true
      education: enum
      canadianWorkExperienceYears: number
      firstLanguage: { test: enum, speakingBand: string, listeningBand: string, readingBand: string, writingBand: string }
    } | null

    additionalFactors: {
      provincialNomination: boolean
      siblingInCanada: boolean
      // studyInCanada and frenchProficiency are derived, not separately entered
      // (studyInCanada from educationInCanada; frenchProficiency from the language scores)
    }
  }
  result: {
    totalScore: number
    corePoints: number
    spousePoints: number
    skillTransferabilityPoints: number
    additionalPoints: number
  }
}
```

Note on language bands: the scoring engine needs a band-to-CLB lookup table per test. This is a confirmed build blocker, not a future nice-to-have: the flow doc only has IELTS and TEF Canada bands fully captured, and CELPIP-G, PTE Core, and TCF Canada bands still need a dedicated pass on the live calculator. Launch is blocked until all five are captured, implemented, and covered by regression fixtures (see section 10).

## 8. Non-functional requirements

- Privacy: no candidate data leaves the browser. No server-side database for scenarios.
- Accuracy: scoring logic isolated, commented against the official point tables, with a visible "last verified" date. Covered by automated regression tests using the confirmed input/output pairs captured from the live official calculator.
- Performance: score recalculates instantly on input change, no perceptible lag.
- Accessibility: usable with keyboard navigation and screen readers, form fields properly labeled.
- Responsive: works on mobile and desktop screen sizes.
- Browser support: current versions of Chrome, Safari, Firefox, Edge.

## 9. Success metrics

**Adoption**
- Unique visitors per month
- Activation rate: % of visitors who complete at least one full calculation

**Engagement (validates the core pain point)**
- Average scenarios saved per active user
- % of sessions that save 2+ scenarios
- % of sessions that open the comparison view

**Retention (the main reason this tool should exist)**
- Returning visitor rate (via analytics)
- % of "save scenario" events that come from a user with at least one pre-existing saved scenario (proxy for people actually coming back to build on past work)

**Sustainability**
- Donation link click-through rate
- Number of completed donations per month (if visible from the donation platform)

**Quality and trust**
- Feedback/support messages reporting incorrect scores (target: near zero, checked periodically against the official calculator)
- Bounce rate on the landing page

## 10. Decisions and open questions

### Resolved

- **Language test coverage**: build is blocked until all five tests (CELPIP-G, IELTS, PTE Core, TEF Canada, TCF Canada) have fully captured, verified score bands. No partial launch.
- **Marital status**: simplified to just the branches that affect scoring (see 6.1 and the data model), dropping the official tool's full 7-option list.
- **Mandatory fields**: every applicable field must be filled in before a scenario can be calculated. No partial or blank submissions.
- **Export/import**: out of scope for v1 (see section 3). Revisit as a v2 consideration.
- **Update process for scoring rule changes**: the maintainer will monitor and flag IRCC rule changes when they happen; the scoring module, lookup tables, and regression fixtures get updated on notification (see 6.1).
- **Job offer question**: confirmed excluded from v1 (see 6.1).
- **Cross-device accounts**: confirmed interest, planned for the next iteration after v1 (see section 11). Not required for v1's core value.

### Still open

None at this time.

## 11. Future considerations (v2+, not for this build)

- Optional account creation for cross-device access (confirmed interest, planned as the next iteration after v1)
- Export/import scenarios as a file
- French UI
- Alerts when a scenario's score would clear a recent draw's cutoff
