---
doc: checklist
status: approved
---

# Build Checklist

Build mode: fast

## Slices

- [x] **1. Next.js scaffold and interactive Sample Profile Review**
  Becomes usable: A running Next.js application at `http://localhost:3000` with the warm-neutral career theme, Header, upload container, and a working "⚡ Load Sample CV" button that instantly loads the synthetic early-career profile with editable skill badges, project highlights, and role/location selectors.
  Why now: Establishes the running application shell, design system, and candidate state structure so every subsequent matching slice has an immediate visual landing surface.
  PRD ref: `prd.md > The Core Journey` (steps 1–3), `prd.md > Look and Feel`, `prd.md > Features and Behavior > 1. Resume Ingestion & Quick Demo`
  Spec ref: `spec.md > Stack`, `spec.md > Components > 1. Header & Brand Bar`, `spec.md > Components > 2. Resume Ingestion & Dropzone`, `spec.md > Components > 3. Candidate Profile Review`
  Build: Initialize Next.js with TypeScript and Tailwind CSS, configure theme colors, add `Header.tsx`, `ResumeUploader.tsx`, `ProfileReview.tsx`, and `sample-candidate.ts`.
  Verify (mechanical): Start Next.js dev server, verify clean compilation on port 3000, trigger Sample CV load, verify state renders editable skill pills and preference controls with zero console errors.
  Learner check: Open `http://localhost:3000`, click "Load Sample CV", and verify the candidate skills and project summary appear cleanly in the warm-neutral design.
  Commit: `Initialize Next.js app and interactive candidate profile review`

- [x] **2. Synthetic jobs dataset and explainable 50/35/15 matching engine with best match auto-expand**
  Becomes usable: Clicking "Find Matches" evaluates the candidate profile against 5 curated synthetic vacancies using the exact 50/35/15 mathematical formula. Displays ranked job cards with the #1 top match automatically expanded, showing score bars, green matched tags, amber gap tags, and a grounded CV adaptation advice bullet.
  Why now: Implements the unique kernel and the primary "aha-moment" of RoleFit AI early, proving the core value proposition before adding secondary error and file upload plumbing.
  PRD ref: `prd.md > The Core Journey` (steps 4–5), `prd.md > Features and Behavior > 3. Explainable 50/35/15 Matching Engine`, `prd.md > Features and Behavior > 4. Job Breakdown & Advice Presentation`
  Spec ref: `spec.md > Data Model`, `spec.md > Detailed Mathematical Scoring Formulas & Rounding Rules`, `spec.md > Components > 5. Ranked Vacancy List & Best Match Card`
  Build: Create `data/demo-jobs.json` with 5 synthetic roles, implement `lib/matchingEngine.ts` with sub-score formulas and grounded rewrite advice, and create `JobList.tsx` and `JobCard.tsx` with collapsible drawers and score indicators.
  Verify (mechanical): Run unit evaluation on `matchingEngine.ts` with test inputs to verify exact mathematical scores (50% skills, 35% experience, 15% location/format) and verify browser renders 5 sorted cards with #1 auto-expanded.
  Learner check: Click "Find Matches" on the sample profile, inspect the #1 ranked job card, and check that the 50/35/15 breakdown bars and advice bullet are clear and mathematically sound.
  Commit: `Implement 50/35/15 matching engine and ranked vacancy cards`

- [x] **3. In-memory PDF and DOCX parser with format validation and error states**
  Becomes usable: Users can drag and drop custom `.pdf` and `.docx` resumes (<= 5 MB). The serverless API route `/api/parse-cv` reads the file buffer in memory without writing to disk or logging text, extracts skills via deterministic ontology, and populates the review card. Selecting an invalid file type or oversized file triggers an inline error message without clearing form inputs.
  Why now: Completes the real file ingestion pathway while validating memory safety, privacy constraints, and file failure handling.
  PRD ref: `prd.md > Features and Behavior > 1. Resume Ingestion & Quick Demo`, `prd.md > States and Boundaries > Unsupported File / Oversize Error State`
  Spec ref: `spec.md > Components > 2. Resume Ingestion & Dropzone`, `spec.md > Important Failure Modes > 1. Unsupported or Corrupted Document`
  Build: Implement `/api/parse-cv/route.ts` using `pdf-parse` and `mammoth`, create `lib/extractProfile.ts` with canonical tech keywords dictionary, and add client-side file dropzone handlers with file type/size validation and error alerts.
  Verify (mechanical): Test uploading sample PDF and DOCX files to `/api/parse-cv`, verify valid JSON profile response with 0 disk writes; test uploading an invalid file format (e.g. `.png`) and confirm 400 error and client alert banner.
  Learner check: Upload a custom PDF or DOCX file (or try dropping an invalid file) and verify parsing populates skills or presents the friendly error banner appropriately.
  Commit: `Add in-memory PDF and DOCX parser and upload validation error handling`

- [x] **4. Collapsible profile ribbon, empty results recovery, and session reset**
  Becomes usable: After running matching, the input block minimizes into a compact summary ribbon with an "Edit Profile" toggle. If strict location filters yield zero matches, a friendly empty state appears with a "Show all 5 jobs" button that resets location and reveals all jobs. Clicking "New Session" purges all in-memory data and returns to the initial state.
  Why now: Polishes the complete end-to-end demo flow, addresses all boundary states, and guarantees complete session privacy.
  PRD ref: `prd.md > The Core Journey` (step 6), `prd.md > Screens and Layout > 2. Resume & Preferences Section (Collapsible)`, `prd.md > States and Boundaries > Empty Filter State`, `prd.md > States and Boundaries > Session Reset State`
  Spec ref: `spec.md > Components > 4. Compact Profile Summary Ribbon`, `spec.md > Components > 6. Empty State Handler`, `spec.md > Important Failure Modes > 3. Zero Match Results due to Restrictive Filters`
  Build: Implement `ProfileSummaryRibbon.tsx`, create `EmptyResults.tsx` with reset CTA, connect the "New Session" button in `Header.tsx` to clear state, and implement collapsible summary transitions.
  Verify (mechanical): Test setting impossible filter (e.g. non-existent city), verify empty state renders with "Show all 5 jobs" CTA; click "Show all 5 jobs" and confirm all 5 cards re-appear; click "New Session" and verify all state is cleared.
  Learner check: Test filtering by an uncommon location to see the empty state and recovery button, then click "New Session" to verify clean reset.
  Commit: `Add collapsible profile summary, empty state recovery, and session reset`

- [x] **5. Hackathon documentation, synthetic jobs license notes, and 2m 20s demo video script**
  Becomes usable: Complete English documentation in `README.md` containing project overview, architecture diagram, local run instructions, synthetic vacancy attribution & license notice, and a scene-by-scene script timed for a 2-minute 20-second video demo.
  Why now: Prepares all required hackathon submission deliverables and provides the exact speaking script for recording the demo video.
  PRD ref: `prd.md > What We're Building`
  Spec ref: `spec.md > Where It Runs and How Someone Tries It`
  Build: Write comprehensive `README.md` with features, setup steps, synthetic data attribution statement, explainability formula breakdown, and timed demo recording script.
  Verify (mechanical): Review `README.md` for completeness, verify markdown formatting and links, and verify the demo script timing matches 2 minutes 20 seconds.
  Learner check: Read through the README and video script to ensure all key features and hackathon requirements are clearly articulated.
  Commit: `Add documentation, synthetic dataset license notes, and 2m 20s video demo script`

## Hands-on Checkpoints

- [x] Early usable behavior explored — Slice 2: Explainable 50/35/15 matching engine and ranked cards with best match auto-expand
- [x] Final kick-the-tires exploration and feedback completed — Slice 4: Full end-to-end application with upload, filters, recovery, and reset

## Final Review

- [x] Final review complete — feedback resolved and learner confirms ready to ship

## Code Tour and App Map

- [x] Learning activity complete — guided route, focused alternative, prior practice connected, or brief recap
- [x] Optional edit and transfer reflection addressed — offered/declined/already covered/not applicable as appropriate
- [x] `devpost/app-map.html` generated from finished code, checked, and shown, including a project-grounded practice to reuse

Activity and evidence: Focused technical walkthrough connecting deterministic 50/35/15 matching logic and in-memory parsing to explainability and privacy guarantees. Learner explicitly tested and approved the interface and flow ("в целом меня устраивает как сейчас выглядит").
Route and stops: 4 key stops documented in app-map.html (Stop 1: src/app/api/parse-cv/route.ts, Stop 2: src/lib/matchingEngine.ts, Stop 3: src/components/JobCard.tsx, Stop 4: src/components/ApplicationAssistantModal.tsx).
Edit outcome: UX refinements implemented across ResumeUploader (source & document type clarity) and ApplicationAssistantModal (editor scrolling, mobile viewport sizing, copy action accessibility).
Reflection: Reusable practice documented — pure deterministic mathematical heuristics for trust, reproducible scores, and privacy-preserving AI architectures.
Activity mode: Focused review and architectural app map.

## Revisions


