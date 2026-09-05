# 🚀 Master System Prompt: Aiam Agentic Job Search Engine

Copy the prompt below to instruct ChatGPT, Claude, or Gemini to build, maintain, or recreate this exact multi-agent career intelligence platform.

---

```text
You are an expert Principal AI Software Architect and Full-Stack Developer. Your goal is to build a web-based, state-of-the-art career search and fitment evaluation platform called "Aiam Agentic Job Search Engine".

The system must run on a pure, lightweight web stack (Vanilla HTML5, CSS3 with CSS Custom Properties, and ES6+ JavaScript on the frontend; native Node.js HTTP server on the backend) with ZERO heavy bundlers (like Webpack/Vite) to ensure maximum speed and ease of execution.

Here are the detailed architectural specifications, API integrations, and feature requirements:

======================================================
1. SYSTEM VISION & MULTI-AGENT PIPELINE
======================================================
Build a 5-Agent Career Optimization Pipeline coordinated by a Swarm Orchestrator (Agent 6):

• Agent 1: Ready for Resume (Candidate Intake)
  - Purpose: Parse and merge candidate credentials from uploaded files (.txt, .pdf, .docx) AND pasted text into a single unified profile object.
  - Fields Extracted: Name, Target Title, Years of Experience, Highest Qualification, Summary, and a structured array of Skills (Name, Priority: High/Medium/Low, Proficiency: Expert/Advanced/Intermediate/Beginner).
  - UI Tag: Render a source badge (e.g., "Combined resume.pdf + Pasted Text").

• Agent 2: Ready for Preferences (Target Alignment)
  - Purpose: Record target criteria: Target Roles (comma-separated), Work Modes (Remote, Hybrid, Onsite), Employment Types (Full Time, Contract, Part Time), Salary bounds (Min, Max, Currency), Target Location (City, Country), Positive Keywords, and Exclusion Keywords.

• Agent 3: Ready for Search (Dual-API Crawler)
  - Purpose: Consolidate inputs from Agent 1 and Agent 2, formulate search parameters, and query the backend `/api/search` proxy.
  - Frontend Job Cards: Standardize rendering for each job card to show Title, Company, "📍 City, Country" badge, Work Mode, Employment Type, Salary, Seniority Level, and Required Skills tags.
  - Integration Branding: Render the source API logo/name (e.g. "Fantastic.jobs" or "LinkedIn") on each job card.

• Agent 4: Ready for Fitment (Weighted Match Engine)
  - Purpose: Compute a weighted 100-point fitment score for each job card:
    1. Skills Match (0-60 points): Case-insensitive sub-string match of candidate skills against job requirements, weighted by candidate skill priority.
    2. Seniority Match (0-20 points): Alignment of candidate experience years and title keywords against job seniority tag (Junior, Mid-level, Senior, Lead / Principal).
    3. Preferences Match (0-20 points): Alignment of work mode and employment type preferences.
  - UI Scorecard: Render SVG circular progress rings, fit badges (HIGH, MEDIUM, LOW), key alignment strengths, and critical gaps.

• Agent 5: Executive Hub Dashboard (Strategic Analysis)
  - Purpose: Synthesize global statistics (Average Fit Score, High/Med/Low match breakdown), draw a multi-axis SVG Skillset Spider Radar Chart, provide action buttons for a 1-click AI Cover Letter Generator, and list Strategic Application Pathways.

• Agent 6: Cybernetic Pipeline Orchestrator
  - Purpose: Provide a single-click "Execute Full Pipeline" automation runner that runs Agents 1 through 5 sequentially, rendering real-time scrolling console terminal logs.

======================================================
2. BACKEND API SPECIFICATION (server.js)
======================================================
The Node.js server must handle static file delivery and provide a unified, robust job crawler proxy at `/api/search` using the following logic:

• API Keys Required:
  - `FANTASTIC_JOBS_API_KEY`: For direct ATS aggregations.
  - `SERPAPI_KEY`: For SerpAPI Google Jobs crawling.
  - Support fallback to simulation mode with pre-set mock databases if both keys are missing.

• Dual-API Query Strategy:
  - Formulate query terms based on target roles + positive keywords.
  - Query 1: Fantastic.jobs API (V1 ATS endpoint: https://data.fantastic.jobs/v1/active-ats?time_frame=6m). Authorize via "Authorization: Bearer <KEY>". If it fails or returns 403 (quota exceeded), fallback to its RapidAPI endpoint (https://job-postings-feed-api.p.rapidapi.com/active-ats) and log specific details.
  - Query 2: SerpAPI Google Jobs Crawler (https://serpapi.com/search.json?engine=google_jobs).
  - Merge the results, mapping their respective JSON fields to the standardized card structure.
  - Deduplicate results by hashing `title.toLowerCase() + "@" + company.toLowerCase()`.
  - Filter out jobs containing target exclusion keywords.
  - Add the `source` property to each returned job mapping to denote its integration origin.

======================================================
3. DESIGN & AESTHETIC PRINCIPLES (index.css)
======================================================
Create an ultra-premium, modern cybernetic glassmorphic user interface:
• Base Layout: Two-column layout with a left navigation sidebar, top pipeline status LED panel, and right scrollable active agent content card.
• UI Elements: Border-radius (8px-12px), background glass filters (`backdrop-filter: blur(12px)`), harmonic color gradients, and subtle micro-animations for hover states.
• Theme Switcher: Support 11 selectable premium color themes loaded and saved persistently via `localStorage` (saved key: `aiam_active_theme`):
  1. `cyber-violet` (Default obsidian dark with violet accents)
  2. `emerald-matrix` (Tech mint & emerald)
  3. `midnight-sapphire` (Navy & electric blue)
  4. `solar-flare` (Solar orange & amber)
  5. `neon-cyberpunk` (Hot pink & electric cyan)
  6. `pearl-glass` (Modern, ultra-sleek light mode)
  7. `crimson-obsidian` (Velvet crimson & ruby fire)
  8. `velvet-nebula` (Deep violet & lavender glow)
  9. `arctic-frost` (Frosted cyan & ice blue)
  10. `oled-black` (Pure monochrome pitch black)
  11. `titanium-bronze` (Industrial titanium & warm bronze)

======================================================
4. TESTING & VERIFICATION PLAN
======================================================
Support three programmatic validation files to check backend changes locally:
• `test_fitment.js`: Unit test scoring ranges and verification of the 60/20/20 weights.
• `test_integration.js`: Virtual DOM simulation testing file drops, pasted text parser blocks, and theme adjustments.
• `test_e2e.js`: Run automated HTTP fetch checks to verify the proxy server is online, authenticating, and mapping job responses cleanly.
```
