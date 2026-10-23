---
doc: scope
status: approved
---

# RoleFit AI

Explainable, transparent resume-to-job matching that shows early-career candidates exactly why they fit, what skills they lack, and how to adapt their CV for realistic roles.

## The Unique Kernel
Instead of an opaque black-box AI score or an automated "spray-and-pray" application bot, RoleFit AI provides an explainable 50/35/15 weighted match score (Skills 50%, Relevant Experience 35%, Location & Work Format 15%) coupled with exact skill gap identification and one honest, actionable bullet-point adaptation tip per job.

## Who It's For
An early-career tech candidate or student with a hybrid background (e.g., business education combined with self-taught Python/TypeScript projects) seeking their first role in AI automation or software engineering. Today, they struggle to decipher ATS rejections, do not know which real job listings fit their profile, and find it difficult to frame self-directed projects for recruiters.

## The Core Loop
1. The candidate opens RoleFit AI and loads their CV (via one-click "Load Sample CV" for quick demo or drag-and-drop PDF/DOCX).
2. The system displays the extracted candidate profile (skills, projects, work format preferences).
3. The candidate confirms/adjusts target role and location preferences, then clicks "Find Matches".
4. The system ranks 5 curated synthetic job listings from high to low match score.
5. The candidate expands any job card to inspect the exact score breakdown (50/35/15), identified matches, missing skill gaps, and a tailored CV bullet rewrite tip.

## Inspiration & Identity
Modern, clean developer tool aesthetic (Next.js, Tailwind CSS, clean card hierarchy, crisp score badges, collapsible breakdown drawers). Fast, predictable, client-side/local feel with zero latency bottlenecks and no account logins required.

## Why This Matters to the Learner
To practice a rigorous plan-first development lifecycle (Scope -> PRD -> Spec -> Build) with an AI coding agent, while creating an honest, explainable career tool where the matching logic can be clearly understood, verified, and demonstrated in a 2-minute video.

## What "Working" Looks Like
A fully functional web app running locally where a user can click "Load Sample CV" (or drop a PDF/DOCX), instantly see extracted structured data, trigger the matching against 5 pre-loaded synthetic job profiles, and view an interactive ranked list with live mathematical breakdowns (50/35/15) and advice cards. Working error states handle unsupported files or empty match filters gracefully.

## The POC Boundary
- **IN:**
  - One-click "Load Sample CV" feature pre-loaded with a realistic synthetic early-career developer profile.
  - PDF and DOCX file upload parser for custom resumes.
  - Preference selectors: Target Role (e.g., AI Automation Engineer, Full-Stack Developer, Junior Python Dev), Work Format (Remote, Hybrid, On-site), and Location.
  - Transparent matching algorithm applying the exact weighted formula:
    - Skills match: 50%
    - Relevant experience & projects: 35%
    - Location & work format fit: 15%
  - Exactly 5 pre-configured, realistic synthetic job vacancies stored in a local JSON dataset (strictly no live job boards or real scraped ads).
  - Detailed card view for each job: overall score, breakdown bars/percentages, matched skills list, missing skills (gaps), and one actionable CV bullet recommendation.
  - Ephemeral session memory (no CV files or personal data persisted on disk/database).
  - Explicit UI states: loading spinner/skeleton, unsupported file error modal/toast, and empty results state.

## Later
- Side-by-side comparison between multiple candidate resumes.
- Exporting a customized resume draft with the recommended bullet rewrites as PDF/Markdown.
- Custom weight adjustments (letting the user customize the 50/35/15 ratio).
- Real-world job board API integrations.

## Explicitly Cut
- **Live job boards and real job postings:** Real vacancy scraping and third-party job board APIs are strictly outside the MVP scope to maintain determinism, avoid API breakage/rate limits, and guarantee reliable 2-minute video demos.
- **Automated job applications / bot submissions:** Keeps the tool ethical, user-driven, and focused on self-improvement rather than spamming employers.
- **User accounts, databases, and authentication:** Unnecessary infrastructure overhead for a 2-minute demo PoC; ephemeral in-memory state is faster, cleaner, and privacy-preserving.
- **Persistent resume storage:** Uploaded resumes exist only in active session memory, guaranteeing candidate data confidentiality.
