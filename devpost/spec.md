---
doc: spec
status: approved
---

# RoleFit AI — Technical Specification

## How This Works, In Plain Language

RoleFit AI is a lightweight Next.js and TypeScript web application that matches a job seeker's resume against 5 realistic synthetic job listings.

Here is the exact journey in plain terms:
1. When you click **"Load Sample CV"**, the app instantly populates a pre-built candidate profile in browser state. Alternatively, if you upload a `.pdf` or `.docx` file, a local Next.js API route reads the file entirely in memory, extracts the raw text using `pdf-parse` or `mammoth`, and immediately discards the file.
2. A deterministic parser (`extractProfile.ts`) inspects the text, searching for confirmed technical skills from a defined dictionary and identifying candidate projects. Because heuristic parsing can miss nuances, the interface presents the extracted profile as an **editable review card**, allowing the user to add, remove, or edit skill tags and project notes before calculating matches.
3. When you click **"Find Matches"**, a transparent scoring engine (`matchingEngine.ts`) evaluates your profile against 5 synthetic job listings stored in a static JSON file. The engine uses a strict, explainable mathematical formula: **50% Skills Match**, **35% Relevant Experience & Projects**, and **15% Location & Work Format Fit**.
4. For each vacancy, the engine identifies exact matching skills, lists missing skill gaps, and generates one honest adaptation tip grounded strictly in the candidate's existing projects—never inventing fake experience.
5. The UI displays the ranked vacancies with the top match automatically expanded. No user data is ever saved to disk or database, and clicking **"New Session"** instantly wipes all state.

## The Core Journey Through the System

Implements `prd.md > The Core Journey`.

1. **User loads CV:**
   - *Option A ("Load Sample CV"):* Browser state sets `candidateProfile` to `SAMPLE_PROFILE` immediately.
   - *Option B (File Upload):* User drops PDF or DOCX file (<= 5 MB). Client sends `multipart/form-data` via POST to `/api/parse-cv`. The route reads the file buffer in RAM, invokes `pdf-parse` or `mammoth`, runs `extractProfileFromText()`, and returns JSON `{ profile: CandidateProfile }`. No file is written to disk; no text is logged.
2. **User reviews and calibrates:**
   - Candidate sees extracted skills rendered as interactive badge pills. They can type additional skills or remove false positives.
   - Candidate sets **Target Role** (dropdown), **Work Format** (Remote, Hybrid, On-site, Any), and **Location** (e.g., Worldwide, Europe, London, Almaty, San Francisco).
3. **User runs matching:**
   - Clicking "Find Matches" triggers `scoreAllJobs(candidateProfile, preferences, DEMO_JOBS)`.
   - Results are sorted descending by `totalScore`.
   - UI collapses the top profile card into a compact summary ribbon and displays the 5 job cards, with Job #1 expanded by default.
4. **User inspects results:**
   - Candidate views score breakdown bars (Skills 50%, Experience 35%, Location/Format 15%), green matched badges, amber gap badges, and the concrete project-tailored adaptation tip.
5. **Reset / New Session:**
   - Clicking "New Session" resets React state to initial blank defaults.

## Stack

- **Language:** [TypeScript](https://www.typescriptlang.org/docs/) (v5.x) — Strict type safety for data models, scoring functions, and component props.
- **Framework:** [Next.js](https://nextjs.org/docs) (v14/15, App Router) with React — Unified full-stack React framework providing serverless API routes and fast client rendering.
- **Styling:** [Tailwind CSS](https://tailwindcss.com/docs) — Utility-first styling for clean, responsive design, warm neutral palettes, and accessible status colors.
- **Document Text Extractors:**
  - [pdf-parse](https://www.npmjs.com/package/pdf-parse) — Lightweight Node.js library to extract raw plain text from PDF buffers in memory.
  - [mammoth](https://www.npmjs.com/package/mammoth) — Specialized library to extract plain text from `.docx` files in memory without external dependencies.
- **Icons:** [lucide-react](https://lucide.dev/guide/packages/lucide-react) — Clean, consistent icons for upload, scores, badges, and expand/collapse chevrons.

## Where It Runs and How Someone Tries It

- **Runtime:** Local Node.js environment (Node.js 18+ or 20+).
- **Environment Requirements:** No external API keys, database credentials, or third-party cloud accounts required.
- **Start Command:**
  ```bash
  npm run dev
  ```
- **Demo Access:** Open `http://localhost:3000` in any modern web browser.
- **Demo Recording Target:** The entire end-to-end journey (Home -> Load Sample CV -> Review Profile -> Find Matches -> Inspect Best Match 50/35/15 Breakdown & Advice -> Reset Session) takes approximately 60–90 seconds, perfectly calibrated for a concise 2-minute 20-second video.
- **Deployment (Optional):** Can be deployed in one click to Vercel (`vercel deploy`) if a public link is desired for Devpost submission.

## Look and Feel

Carried forward from `prd.md > Look and Feel` and `scope.md > Inspiration & Identity`:
- **Canvas:** Warm neutral slate background (`bg-slate-50`), crisp white cards (`bg-white`), and subtle gray borders (`border-slate-200`).
- **Typography:** Deep slate-900 typography (`text-slate-900`) for headers, slate-600 (`text-slate-600`) for body/descriptions.
- **Primary Accents:** Calm teal/cyan buttons and focus rings (`bg-teal-600 hover:bg-teal-700 text-white`).
- **Match Status Badges:**
  - Matched skills: Emerald green (`bg-emerald-50 text-emerald-700 border-emerald-200`).
  - Missing skill gaps: Soft amber (`bg-amber-50 text-amber-700 border-amber-200`).
  - Score Badges: Circular score indicator with progressive color coding (Emerald for >=75%, Teal/Blue for 50–74%, Slate for <50%).

## Components

Grouped by user journey stage and linked to PRD requirements:

### 1. Header & Brand Bar
- Displays RoleFit AI logo, title, hackathon demo badge, and the prominent **"New Session"** reset button.
- Implements `prd.md > Screens and Layout` & `prd.md > Features and Behavior > 5. Session Management & Privacy`.

### 2. Resume Ingestion & Dropzone (`ResumeUploader.tsx`)
- Drag-and-drop file upload container supporting `.pdf` and `.docx` up to 5 MB.
- Displays the prominent **"⚡ Load Sample CV"** button for 1-click instant demo.
- Displays inline error banner when invalid file type or oversized file is selected.
- Implements `prd.md > Features and Behavior > 1. Resume Ingestion & Quick Demo` & `prd.md > States and Boundaries > Unsupported File / Oversize Error State`.

### 3. Candidate Profile Review (`ProfileReview.tsx`)
- Displays parsed/loaded profile:
  - Editable skills tag cloud (with "Add Skill" input and "x" delete buttons).
  - Highlighted projects summary.
  - Target Role selector (dropdown with 5 canonical roles).
  - Work Format segmented buttons (`Remote`, `Hybrid`, `On-site`, `Any`).
  - Target Location input / preset region selector (`Worldwide`, `London`, `Berlin`, `Almaty`, `San Francisco`).
- "Find Matches" primary action button.
- Implements `prd.md > Features and Behavior > 2. Preference Calibration` & `prd.md > States and Boundaries > Profile Loaded State`.

### 4. Compact Profile Summary Ribbon (`ProfileSummaryRibbon.tsx`)
- Appears when results are shown, neatly summarizing the candidate's active role, location, format, and skill count in a single horizontal bar with an **"Edit Profile"** toggle.
- Implements `prd.md > Screens and Layout > 2. Resume & Preferences Section (Collapsible)`.

### 5. Ranked Vacancy List & Best Match Card (`JobCard.tsx`, `JobList.tsx`)
- Displays all 5 vacancies sorted descending by Match Score.
- Job #1 is automatically expanded upon search completion; Jobs #2–5 are collapsed with accordion toggles.
- Each expanded card presents:
  - Overall Score with visual radial / badge indicator.
  - 3-part progress bars: Skills (50%), Experience (35%), Location & Format (15%).
  - Matched skills list (green badges).
  - Missing skills gap list (amber badges).
  - Grounded CV adaptation advice card.
- Implements `prd.md > Features and Behavior > 4. Job Breakdown & Advice Presentation`.

### 6. Empty State Handler (`EmptyResults.tsx`)
- Shown when strict filters match 0 vacancies.
- Displays a friendly suggestion and the **"Show all 5 jobs"** button which resets location filters and displays all vacancies with calculated scores.
- Implements `prd.md > States and Boundaries > Empty Filter State`.

## Data Model

```typescript
// types/index.ts

export type WorkFormat = 'Remote' | 'Hybrid' | 'On-site' | 'Any';

export interface CandidateProject {
  title: string;
  description: string;
  technologies: string[];
}

export interface CandidateProfile {
  name: string;
  summary: string;
  skills: string[];
  projects: CandidateProject[];
  targetRole: string;
  preferredFormat: WorkFormat;
  preferredLocation: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  roleCategory: string; // e.g. 'AI Automation', 'Full-Stack', 'Python', 'QA', 'Product Ops'
  location: string;
  format: 'Remote' | 'Hybrid' | 'On-site';
  requiredSkills: string[];
  preferredSkills: string[];
  domainKeywords: string[];
  experienceLevel: string;
  description: string;
}

export interface ScoreBreakdown {
  skillsScore: number;     // 0 to 50 (rounded to 1 decimal place)
  experienceScore: number; // 0 to 35 (rounded to 1 decimal place)
  locationScore: number;   // 0 to 15 (rounded to 1 decimal place)
  totalScore: number;      // 0 to 100 (integer)
  matchedSkills: string[];
  missingSkills: string[];
  matchedProjects: string[];
  adaptationTip: string;
}

export interface ScoredJob {
  job: JobListing;
  breakdown: ScoreBreakdown;
}
```

## Detailed Mathematical Scoring Formulas & Rounding Rules

Implements `prd.md > Features and Behavior > 3. Explainable 50/35/15 Matching Engine`.

### 1. Skills Match Sub-score (Max 50 points)
The 50 points are divided into Required Skills and Preferred Skills:
- **Case A: Job specifies both Required ($N > 0$) and Preferred ($M > 0$) skills:**
  - Each matched required skill awards exactly $\frac{40}{N}$ points.
    $$\text{RequiredScore} = \frac{|\text{Candidate Skills} \cap \text{Job Required Skills}|}{N} \times 40$$
  - Each matched preferred skill awards exactly $\frac{10}{M}$ points.
    $$\text{PreferredScore} = \frac{|\text{Candidate Skills} \cap \text{Job Preferred Skills}|}{M} \times 10$$
  - $\text{SkillsScore} = \text{RequiredScore} + \text{PreferredScore}$.
- **Case B: Job has NO Preferred Skills ($M = 0$):**
  - All 50 points are allocated to Required Skills:
    $$\text{SkillsScore} = \frac{|\text{Candidate Skills} \cap \text{Job Required Skills}|}{N} \times 50$$
- **Missing Data:** If candidate profile has 0 detected skills, $\text{SkillsScore} = 0$.
- Clamped to $[0, 50]$, formatted to 1 decimal place.

### 2. Relevant Experience & Projects Sub-score (Max 35 points)
Evaluated deterministically across two sub-criteria: **Domain Alignment (25 pts)** and **Engineering Implementation Depth (10 pts)**.
- **Domain Alignment (Max 25 points):**
  - Evaluates how candidate projects align with `job.domainKeywords` (e.g. `['AI', 'LLM', 'automation', 'API', 'workflow']`).
  - Each candidate project that contains 1 or more relevant domain keywords awards $12.5$ points.
  - Capped at $25$ points (achieved with 2 or more domain-relevant projects).
- **Engineering Implementation Depth (Max 10 points):**
  - Evaluates verifiable technical implementation across candidate projects:
    - **API Integration / External Services:** Project integrates REST APIs or external workflows: **+4 points**.
    - **State Management & Data Validation / Business Logic:** Project demonstrates structured data flow, validation, or error handling: **+3 points**.
    - **Testing, Tooling, or Workflow Automation:** Project uses automation scripts, test suites, or CI/CD pipelines: **+3 points**.
  - Total implementation depth is the sum of demonstrated attributes, capped at $10$ points.
- **Missing Data:** If candidate profile contains no projects, $\text{ExperienceScore} = 0$.
- $\text{ExperienceScore} = \text{DomainAlignment} + \text{ImplementationDepth}$, clamped to $[0, 35]$, formatted to 1 decimal place.

### 3. Location & Work Format Fit Sub-score (Max 15 points)
Split strictly into **Work Format (10 points)** and **Location Alignment (5 points)**:

**Work Format (10 points):**
- Candidate selected `Remote` and Job is `Remote`: **10 points**.
- Candidate selected `Any`: **10 points** (maximum flexibility).
- Candidate selected format matches Job format exactly (`Hybrid` $\leftrightarrow$ `Hybrid`, `On-site` $\leftrightarrow$ `On-site`): **10 points**.
- Candidate selected `Hybrid` and Job is `Remote`: **8 points** (compatible flexibility).
- Candidate selected `On-site` and Job is `Remote`: **7 points** (candidate open to office, role is remote).
- Incompatible format (e.g. Candidate selected `Remote-only` for an `On-site` role): **0 points**.

**Location Alignment (5 points):**
- **Job has no geographic restriction** (`Worldwide`, `Anywhere`, or unrestricted `Remote`): **5 points**.
- **Candidate selected `Worldwide` or left location blank** (indicating global flexibility): **5 points**.
- **Exact match:** Candidate location matches Job city or country: **5 points**.
- **Regional mismatch for non-remote role:** Job requires on-site/hybrid in a specific city/country and candidate is in another region: **0 points**.

### Total Score Calculation & Rounding Rule
$$\text{Total Score} = \min(100, \max(0, \text{round}(\text{SkillsScore} + \text{ExperienceScore} + \text{LocationScore})))$$
- All sub-scores maintain 1 decimal place for visual progress bars (e.g., $32.5 / 50$).
- Total Score is rounded to the nearest integer using standard mathematical rounding (`Math.round()` where $0.5$ rounds up).

### Grounded Adaptation Tip Generation
The adaptation advice must strictly adhere to the user's requirement: **grounded strictly in the candidate's existing projects without fabricating unverified claims**.
- Algorithm:
  1. Identify the top missing skill from `missingSkills` (e.g. "Workflow Orchestration" or "Playwright").
  2. Find the candidate's existing project that is closest in domain (e.g. "CRM Assistant with safety checks" or "Sarqyt").
  3. Formulate a concrete rewrite sentence showing how to reframe that project's real work:
     *"In your [Project Name] project, explicitly highlight your work with [Existing Relevant Tech / Automation Logic] to directly demonstrate capability in [Top Missing Skill]."*

### Grounded Adaptation Tip Generation
The adaptation advice must strictly adhere to the user's requirement: **grounded strictly in the candidate's existing projects without fabricating unverified claims**.
- Algorithm:
  1. Identify the top missing skill from `missingSkills` (e.g. "Workflow Orchestration" or "Playwright").
  2. Find the candidate's existing project that is closest in domain (e.g. "CRM Assistant with safety checks" or "Sarqyt").
  3. Formulate a concrete rewrite sentence showing how to reframe that project's real work:
     *"In your [Project Name] project, explicitly highlight your work with [Existing Relevant Tech / Automation Logic] to directly demonstrate capability in [Top Missing Skill]."*

## File Structure

```
/Users/user/Documents/Default Project/
├── devpost/                         # Devpost Learn artifacts
│   ├── learner-profile.md
│   ├── scope.md
│   ├── prd.md
│   └── spec.md
├── scope.md                         # Root copies requested by learner
├── prd.md
├── spec.md
├── src/
│   ├── app/
│   │   ├── layout.tsx               # Root layout & metadata
│   │   ├── page.tsx                 # Main application page (single-page sequential flow)
│   │   ├── globals.css              # Tailwind imports and base styles
│   │   └── api/
│   │       └── parse-cv/
│   │           └── route.ts         # In-memory PDF & DOCX text parser (no disk/logging)
│   ├── components/
│   │   ├── Header.tsx               # Navigation, brand title, New Session CTA
│   │   ├── ResumeUploader.tsx       # Dropzone, sample CV button, validation errors
│   │   ├── ProfileReview.tsx        # Editable skill pills, preferences (role, format, location)
│   │   ├── ProfileSummaryRibbon.tsx # Collapsed sticky summary ribbon post-search
│   │   ├── JobList.tsx              # Container for ranked job listings
│   │   ├── JobCard.tsx              # Individual job card with 50/35/15 drawers & advice
│   │   └── EmptyResults.tsx         # Zero-match state with 'Show all 5 jobs' recovery
│   ├── data/
│   │   ├── demo-jobs.json           # Exactly 5 synthetic curated job listings
│   │   └── sample-candidate.ts      # Built-in synthetic student profile for 1-click demo
│   ├── lib/
│   │   ├── extractProfile.ts        # Deterministic text-to-profile parser with skill ontology
│   │   └── matchingEngine.ts        # Pure 50/35/15 scoring math and grounded advice generator
│   └── types/
│       └── index.ts                 # Full TypeScript interfaces
├── public/                          # Static assets
├── package.json                     # Next.js, React, Tailwind, pdf-parse, mammoth
├── tsconfig.json                    # Strict TypeScript configuration
├── tailwind.config.js               # Tailwind CSS theme setup
└── README.md                        # Documentation, demo script, and license info
```

## External Services and Dependencies

- **External Services:** None. The application operates 100% locally with zero third-party API keys, zero cloud database connections, and zero web scrapers.
- **Key Dependencies:**
  - `next`: `^14.2.0` (or `^15.0.0`)
  - `react`: `^18.3.0` (or `^19.0.0`)
  - `react-dom`: `^18.3.0` (or `^19.0.0`)
  - `tailwindcss`: `^3.4.0`
  - `pdf-parse`: `^1.1.1` (in-memory PDF buffer parser)
  - `mammoth`: `^1.8.0` (in-memory DOCX parser)
  - `lucide-react`: `^0.400.0` (icons)

## Important Failure Modes

1. **Unsupported or Corrupted Document:**
   - *Failure:* User uploads an image, text file, `.exe`, or corrupted PDF.
   - *Behavior:* `/api/parse-cv` catches parsing errors safely and returns `{ error: "Unsupported or unreadable file format. Please upload a valid PDF or DOCX file up to 5 MB." }`. The client displays a soft red/amber alert banner right below the dropzone without clearing previous form entries.
2. **Empty Text or Unparseable Resume:**
   - *Failure:* User uploads a scanned PDF consisting only of bitmap images without OCR text.
   - *Behavior:* Extractor detects near-zero text content, informs user: *"We couldn't detect readable text in this document. You can still manually enter your skills below or click 'Load Sample CV' to test the matching."* Allows manual entry.
3. **Zero Match Results due to Restrictive Filters:**
   - *Failure:* Candidate selects a location where none of the 5 synthetic jobs are located.
   - *Behavior:* Rather than an empty blank screen, `EmptyResults.tsx` appears with the message: *"No vacancies match your strict location filter. Try expanding your location or switching to Remote."* and a prominent button **"Show all 5 jobs"** which clears the location restriction and immediately displays all jobs with calculated scores.

## What Was Simplified and Why

- **Deterministic Skill & Project Parsing** instead of an LLM API call for parsing:
  - *Why:* Keeps the app 100% reliable, zero-cost, privacy-preserving, and instant (0ms latency), while allowing the candidate to review and tweak the extracted tags before matching.
- **5 Local Synthetic Job Listings** instead of scraping real job boards:
  - *Why:* Scraping job boards breaks frequently, triggers CAPTCHAs, takes seconds/minutes to load, and introduces external dependencies. Curated synthetic jobs ensure deterministic, reproducible demonstration scores for the hackathon video.
- **In-Memory Ephemeral State** instead of PostgreSQL/MongoDB:
  - *Why:* An ATS matcher for a hackathon demo does not require user accounts or persistent storage. Ephemeral processing guarantees candidate privacy and removes deployment friction.

## Decisions and Open Issues

- **Learner-Selected Stack & Architecture:**
  - TypeScript, Next.js, and Tailwind CSS confirmed.
  - Ephemeral in-memory API Route for PDF/DOCX parsing confirmed.
  - Grounded adaptation advice restricted solely to verified candidate projects confirmed.
  - Dual independent selection for Work Format and Location confirmed.
- **One Useful Unknown Resolved:**
  - *Topic:* Explaining how resume-to-job matching works without black-box opacity.
  - *Resolution:* Clarified and formalized the exact deterministic mathematical breakdown (50% skills, 35% experience, 15% location/format). The learner can directly inspect the math in `matchingEngine.ts` and explain it clearly in their 2-minute 20-second hackathon video.
- **Open Questions:**
  - None. All architectural decisions, component mappings, formulas, and file paths are fully resolved and ready for implementation in `5-build`.
