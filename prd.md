---
doc: prd
status: approved
---

# RoleFit AI — Product Requirements Document

An explainable career co-pilot that matches early-career tech candidates against realistic synthetic job postings using a transparent 50/35/15 scoring breakdown, actionable skill gap analysis, and tailored CV adaptation advice.

Source: `scope.md > The Unique Kernel, The Core Loop, The POC Boundary, What "Working" Looks Like`

## The Core Journey

1. **Arrival & Orientation:** The user visits RoleFit AI and sees a clear headline explaining the tool: an explainable resume matcher that reveals why you fit, what's missing, and how to tailor your CV.
2. **Resume Ingestion:** The user either clicks **"Load Sample CV"** (pre-loading a realistic synthetic early-career profile with Python/TypeScript projects and business background for a frictionless demo) or uploads an existing resume (`.pdf` or `.docx`, up to 5 MB).
3. **Profile Review & Preferences:** The interface presents the extracted candidate profile in a structured card: detected skills as interactive badges, project highlights, target role dropdown, and dedicated selectors for **both Work Format (Remote, Hybrid, On-site)** AND **Target Location/Region**. The user can calibrate both parameters independently.
4. **Matching Trigger:** The user clicks **"Find Matches"**. The input card seamlessly collapses into a compact top summary bar with an "Edit Profile" toggle, maximizing screen space for results.
5. **Results Exploration:** Exactly 5 synthetic job listings are displayed, ordered by overall Match Score (descending). The #1 ranked best match is **automatically expanded**, showing:
   - Overall Match Score percentage in a prominent circular or pill badge.
   - Transparent 3-part breakdown: **Skills Match (50%)**, **Relevant Experience & Projects (35%)**, and **Location & Work Format Fit (15%)** (jointly assessing candidate's chosen location and format against job arrangements) with visual score progress bars.
   - Identified matches highlighted in **calm green tags**.
   - Missing requirements (skill gaps) marked in **soft amber tags**.
   - Exactly **one actionable CV adaptation tip** showing how to rephrase or highlight an existing bullet point for that role.
6. **Comparison & Iteration:** The user can click to expand/collapse other job cards, adjust location/format filters, click **"Show all 5 jobs"** if strict filters yield zero matches, or click **"New Session"** to wipe all session data and start fresh.

## Screens and Layout

RoleFit AI uses a single-page sequential vertical layout calibrated for desktop and mobile screens:

1. **Header & Value Bar:** Clean brand header with logo, title, brief tagline, and a prominent **"New Session"** action button.
2. **Resume & Preferences Section (Collapsible):**
   - *Expanded state (Initial):* Side-by-side or stacked upload zone: Drag-and-drop dropzone supporting PDF/DOCX (max 5 MB) + prominent **"⚡ Load Sample CV"** action button. Below the upload zone, an extracted candidate profile preview appears with skill tags and dual preference selectors: Target Role dropdown, Work Format segmented toggle (Remote, Hybrid, On-site, Any), and Location selector/input.
   - *Collapsed state (Post-Search):* Converts into a sleek sticky/top summary ribbon ("Profile: Early-Career Developer | Target: AI Automation | Remote / Worldwide | 12 Skills Detected") with an **"Edit Profile"** button to expand and tweak.
3. **Vacancy Results Stream:**
   - Appears below the profile bar after clicking "Find Matches".
   - Displays 5 cards ranked from highest to lowest match score.
   - The top match card is expanded by default; cards 2–5 are collapsed with an expand/collapse toggle.
   - Fully responsive: single wide column on desktop; naturally stacks on tablet and mobile viewports.

## Look and Feel

- **Visual Tone:** Light, clean, trustworthy career service (approachable, professional, human-centered, not an intimidating developer terminal).
- **Background:** Warm neutral canvas (slate-50 / stone-50) with pure white card surfaces and subtle borders.
- **Typography:** Dark navy / slate-900 typography providing crisp, high-contrast readability.
- **Accents:** Restrained teal / deep cyan primary accents for key interactive buttons and focus states.
- **Status & Indicator Colors:**
  - **Matched items:** Soft, friendly green (emerald-600 background badges with emerald-900 text).
  - **Missing gaps:** Soft amber/orange (amber-500 background badges with amber-900 text).
  - **Match Score:** Dynamic color badge (>75% vibrant emerald, 50–74% warm teal/blue, <50% slate).

## Features and Behavior

### 1. Resume Ingestion & Quick Demo
- User can drop or browse a `.pdf` or `.docx` file under 5 MB.
- Clicking **"Load Sample CV"** instantly populates the parsed profile without waiting or requiring a local file download.
- Parsing extracts skills, project descriptions, and experience into structured objects.

### 2. Preference Calibration
- **Target Role:** Pre-filled from CV or selected via dropdown (AI Automation Engineer, Junior Full-Stack Developer, Junior Python Developer, QA Automation Intern, Technical Support / Product Operations).
- **Work Format:** Segmented button selector (Remote, Hybrid, On-site, Any) enabling candidate to define desired workplace flexibility.
- **Target Location / Region:** Selectable region or custom input (e.g., Worldwide, Europe/London, Central Asia/Almaty, US/San Francisco).
- Both parameters can be adjusted independently to test different job market scenarios.

### 3. Explainable 50/35/15 Matching Engine
- Purely deterministic, explainable mathematical scoring:
  - **Skills Match (50%):** Ratio of matched required/preferred technical skills to total job requirements.
  - **Relevant Experience & Projects (35%):** Degree of alignment between candidate projects/history and the target domain.
  - **Location & Work Format Fit (15%):** Jointly evaluates work format and location alignment:
    - 15% (Full match): Job format matches preference (e.g. Remote matches Remote preference regardless of country; or candidate location matches job on-site/hybrid city).
    - 7.5% - 10% (Partial match): Compatible format (e.g. candidate open to Hybrid in a compatible region, or candidate prefers Remote for a role that offers optional hybrid).
    - 0% (Mismatch): Incompatible on-site role in a different geographic location.
- **Total Match Score:** Sum of the three components rounded to the nearest integer (0–100%).

### 4. Job Breakdown & Advice Presentation
- 5 curated synthetic job listings stored in local JSON.
- Every job card reveals:
  - Job title, company name (synthetic), employment type, location, and overall score badge.
  - Detailed score bars for each component (Skills, Experience, Location).
  - Matched skills badges list (green).
  - Missing skills gap badges list (amber).
  - Actionable adaptation tip: A concrete sentence advising how to rephrase or emphasize a real project to satisfy ATS recruiters honestly.

### 5. Session Management & Privacy
- Zero persistent storage: No database, no local cookies storing files, no remote server persistence.
- Clicking **"New Session"** immediately purges in-memory state, resets form fields, and restores the pristine initial screen.

## States and Boundaries

- **First-Use State:** Empty dropzone, "Load Sample CV" CTA visible, no results displayed below.
- **Profile Loaded State:** Extracted profile fields populated, skill tags displayed, "Find Matches" button active.
- **Searching / Calculating State:** Smooth loading skeleton or spinner (500ms) to convey analytical computation before revealing results.
- **Results Displayed State:** Top block collapses to compact ribbon, 5 job cards displayed, top card expanded, remaining 4 collapsed.
- **Unsupported File / Oversize Error State:** Clear inline alert under the dropzone ("Unsupported file format. Please upload a PDF or DOCX file up to 5 MB"). Keeps existing user inputs intact.
- **Empty Filter State:** When user filters (e.g., strict location) match 0 vacancies, render a friendly empty state card: "No jobs match your current location filter. Try expanding your location or switching to Remote." Displays a prominent **"Show all 5 jobs"** button that resets strict filters and reveals all vacancies.
- **Session Reset State:** Complete return to initial first-use state.

## Product Decisions

- **One-click Sample CV:** Decision made to include a dedicated instant demo button so hackathon evaluators and video recordings don't depend on external test file availability.
- **Vertical Single-Page Flow:** Chosen over multi-tab or multi-page wizards to provide a smooth, coherent narrative that can be recorded in under 2 minutes.
- **Collapsible Input Ribbon:** Automatically minimizes the upload section after searching so the user can immediately focus on vacancy cards without excessive scrolling.
- **Auto-expanded Best Match:** Automatically reveals the full score breakdown and advice on the top vacancy so the "aha-moment" is immediate upon search completion.
- **Strictly Synthetic Jobs Dataset:** Prevents reliance on external job boards, eliminating network fragility, scraping blocking, and legal risks.

## What We're Building

- Next.js web application with TypeScript and Tailwind CSS.
- Client-side or local Next.js API route document parser for PDF and DOCX.
- 5 synthetic job vacancies stored in a static JSON file.
- Explainable 50/35/15 scoring algorithm.
- Full UI components: Header, Hero/Upload Dropzone, Sample Profile Loader, Profile Summary Ribbon, Ranked Job Cards, Expandable Score Drawers, Error Banners, Empty State with recovery CTA, and Session Reset button.

## Deferred From the POC

- Multiple resume comparison (uploading 2 CVs side-by-side).
- Direct resume export to customized PDF/DOCX with rewritten bullets.
- Customizable scoring weights (e.g. user slider adjusting 50/35/15).
- Live job market API integrations (LinkedIn, Indeed, etc.).

## Possible Later Enhancements

- AI-assisted real-time bullet rewrite preview in an editable resume builder.
- Interactive interview simulator asking role-specific questions based on identified skill gaps.

## Non-Goals

- **No live web scraping:** No crawling of real job portals.
- **No auto-applying or bot submissions:** The app is strictly an analytical advisory tool.
- **No user authentication or accounts:** No passwords, Google login, or personal profiles stored.
- **No persistent data retention:** No storing uploaded CVs on disk or third-party cloud storage.

## Open Questions

None — all behavioral rules, error states, and UX flows have been resolved and agreed upon.
