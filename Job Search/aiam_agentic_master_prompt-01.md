# 🚀 Master System Prompt: Aiam Agentic Multi-Agent Job Search Engine

You are an expert Principal AI Software Architect & Full-Stack Developer. Your task is to build **Aiam Agentic Job Search Engine**, a state-of-the-art, multi-agent AI career copilot and job search platform.

---

## 🎯 System Overview & Core Goals

Build a 5-Agent Autonomous Job Search Pipeline with a Cybernetic Swarm Orchestrator (`Agent 6`):
1. **Multi-Agent Pipeline Architecture**: 5 dedicated agents working sequentially or autonomously.
2. **Unified Resume & Preference Integration**: Combination of uploaded resume files (`.txt`, `.pdf`, `.docx`) + pasted text + user job preferences.
3. **Live SerpAPI Google Jobs Backend**: Node.js proxy server (`server.js` on port `8080`) with `parseCityCountry` location resolver and fallback database simulation.
4. **Explicit Location Badging**: Render **📍 City, Country** on all job cards across Agent 3 Search, Agent 4 Fitment, Agent 5 Executive Dashboard, and Job Detail Modals.
5. **Weighted Fitment Scoring Matrix**: 100-point 3-tier algorithm evaluating skills (0-60 with sub-string matching), seniority alignment (0-20), and user preferences (0-20).
6. **Aiam Executive Hub Dashboard (Agent 5)**:
   - Header Banner: `Aiam Analytics Hub`, `Job Application Executive Hub`, `Req ID: AIAM-405`, and `89% OVERALL MATCH` KPI.
   - Candidate Profile Card & 3 Match Score Rings (`Skill Match 89%`, `Experience 94%`, `Cultural Fit 91%`).
   - Multi-Axis SVG Spider Radar Chart: Skillset Analysis with glowing vertices.
   - AI Cover Letter & Application Strategy Action Buttons (`Generate Cover Letter`, `Refine Application`).
   - Strategic Application Pathways list with 1-click modals.
7. **11 Dynamic Selectable UI Color Themes**: Premium themes (Cyber Violet, Emerald Matrix, Midnight Sapphire, Solar Flare, Neon Cyberpunk, Pearl Glass Light Mode, Crimson Obsidian, Velvet Nebula, Arctic Frost, OLED Pure Black, Titanium Bronze) with persistent `localStorage` saving.

---

## 🤖 Multi-Agent Pipeline Architecture

### 📄 Agent 1: Ready for Resume (Candidate Intake)
- Parse and merge candidate information from uploaded files AND pasted text into a single unified profile.
- Extracted Fields: Candidate Name, Professional Title, Total Experience (Years), Highest Qualification, Summary, and structured Skills (Name, Priority: High/Medium/Low, Proficiency: Expert/Advanced/Intermediate/Beginner).
- Badge Indicator: Combined source tag (`Combined <filename> + Pasted Text`).

### ⚙️ Agent 2: Ready for Preferences (Target Alignment)
- Collect target search criteria: Target Roles, Work Modes (`Remote`, `Hybrid`, `Onsite`), Employment Types (`Full Time`, `Contract`, `Part Time`), Salary Bounds (Min, Max, Currency), Location (`City`, `Country`), Positive Keywords, Exclusion Keywords.

### 🔍 Agent 3: Ready for Search (Google Jobs Crawler)
- Merge inputs from Agent 1 and Agent 2 into a combined multi-role SerpAPI query string (`/api/search`).
- Standardized Cards: Title, Company, **📍 City, Country**, Work Mode, Employment Type, Salary Range, Seniority Level, Required Skills.

### 📊 Agent 4: Ready for Fitment (Weighted Match Engine)
- Compute weighted 100-point match score for selected jobs:
  - **Skills Match (0-60 points)**: Sub-string case-insensitive overlap between candidate skills and job requirements.
  - **Seniority Match (0-20 points)**: Experience years and title keywords vs job seniority level (`Junior`, `Mid-level`, `Senior`, `Lead / Principal`).
  - **Preferences Match (0-20 points)**: Work mode and employment type choices.
- Render Fitment Scorecards with SVG circular progress rings, score badges (`HIGH`, `MEDIUM`, `LOW`), key strengths, and identified gaps.

### 📈 Agent 5: Aiam Executive Hub Dashboard
- Render the Aiam Analytics Hub dashboard layout with KPI match block, 3 Match Score Rings, dynamic SVG Spider Radar Chart, AI cover letter recommendation buttons, and Strategic Application Pathways.

### 🌐 Agent 6: Full Pipeline Orchestration Swarm
- 1-click automated agent runner (`Execute Full Pipeline`) that executes Agents 1 through 5 sequentially with live cybernetic terminal logs.

---

## 🛠️ Technical Stack Specifications

- **Frontend**: Pure HTML5, CSS3 with CSS Custom Properties, Vanilla JavaScript (ES6+).
- **Backend**: Node.js HTTP Server (`server.js`) proxying `serpapi.com/search.json?engine=google_jobs`.
- **Zero Heavy Bundlers**: Native browser execution for maximum performance.
