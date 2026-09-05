# 📘 User Manual: Aiam Agentic Job Search Engine

Welcome to the official **User Manual** for **Aiam Agentic Job Search Engine** — an autonomous, multi-agent AI career copilot designed to streamline resume parsing, job preference alignment, live Google Jobs search, fitment scoring, and cover letter generation.

---

## 📸 Architecture & Pipeline Overview

![Agent Pipeline Overview](C:/Users/PC1/.gemini/antigravity/brain/a41c3c31-ac01-43b5-b5c1-710ef5b7b5a9/agent_pipeline_overview_1784576997326.png)

The system consists of **5 specialized AI agents** working in sequence, alongside an automated **Swarm Orchestrator**:

1. **Agent 1: Ready for Resume** (Intake & Skill Extraction)
2. **Agent 2: Ready for Preferences** (Target Roles, Location & Bounds)
3. **Agent 3: Ready for Search** (Live SerpAPI Google Jobs Crawler)
4. **Agent 4: Ready for Fitment** (3-Tier Weighted Match Engine)
5. **Agent 5: Executive Dashboard** (Strategy Pathways & Cover Letters)
6. **Agent 6: Swarm Orchestrator** (1-Click Pipeline Automation)

---

## ⚡ Quick Start Guide

1. **Launch Local Server**:
   ```bash
   node server.js
   ```
2. **Open Web Browser**:
   Navigate to `http://localhost:8080` in Chrome, Edge, or Firefox.

---

## 🧭 Step-by-Step Operating Instructions

### Step 1: Candidate Intake (Agent 1)
- **Attach Resume**: Drag & drop or upload `.txt`, `.pdf`, or `.docx` resume files into the file dropzone.
- **Pasted Resume Text**: Enter or paste additional text in the text area.
- **Run Agent Task**: Click `Perform Agent Task`. Agent 1 combines both sources into a unified profile extracting Candidate Name, Title, Experience Years, Qualification, and Skill Priorities.

---

### Step 2: Set Job Preferences (Agent 2)
- Enter your desired **Target Roles** (e.g. *Senior Java Developer, Cloud Architect*).
- Select **Work Modes** (*Remote*, *Hybrid*, *Onsite*) and **Employment Types** (*Full Time*, *Contract*).
- Specify your target **City** and **Country** (e.g. *Chicago, USA* or *Dubai, UAE*).
- Click `Perform Agent Task` to finalize target preferences.

---

### Step 3: Google Jobs Search (Agent 3)
- Click `Perform Agent Task` to trigger the search.
- Agent 3 merges target roles and skills from Agent 1 with location preferences from Agent 2.
- Job cards display explicit **📍 City, Country** badges, salary estimates, and required skills.

---

### Step 4: Fitment Assessment Matrix (Agent 4)

![Agent 4 Fitment Scorecard](C:/Users/PC1/.gemini/antigravity/brain/a41c3c31-ac01-43b5-b5c1-710ef5b7b5a9/media__1784563707309.png)

- Review the checkable job listings loaded from Agent 3.
- Click `Perform Agent Task` to execute the 100-point scoring algorithm:
  - **Skills Match (0-60 points)**
  - **Seniority Alignment (0-20 points)**
  - **Preferences Alignment (0-20 points)**
- View detailed score cards with SVG circular progress rings, key strengths, and identified gaps.

---

### Step 5: Executive Dashboard & AI Cover Letters (Agent 5)

![Executive Analytics & Recommendations](C:/Users/PC1/.gemini/antigravity/brain/a41c3c31-ac01-43b5-b5c1-710ef5b7b5a9/executive_dashboard_view_1784577013813.png)

- View macro metrics: **Total Jobs Evaluated**, **Average Fit Score**, and **High Match Count**.
- Explore the **Skillset Alignment Matrix** (SVG Spider Chart).
- Click **Cover Letter** on any job card to generate a 1-click tailored application letter.
- Click **Details** to open full job specification popups.

---

## 🎨 UI Theme Customization

Click the **Theme Selector** in the left sidebar to switch between 11 custom color palettes:

| Theme Name | Style Description |
| :--- | :--- |
| **Cyber Violet** *(Default)* | Obsidian dark with glowing neon violet & indigo |
| **Emerald Matrix** | Cyber emerald green & tech mint |
| **Midnight Sapphire** | Deep navy blue & electric azure |
| **Solar Flare** | Solar orange & amber energy |
| **Neon Cyberpunk** | Hot pink & electric cyan |
| **Pearl Glass** | Ultra-sleek modern light mode with soft shadows |
| **Crimson Obsidian** | Dark velvet crimson & ruby fire |
| **Velvet Nebula** | Deep violet & lavender glow |
| **Arctic Frost** | Frosted cyan & ice blue |
| **OLED Pure Black** | High-contrast monochrome pitch black |
| **Titanium Bronze** | Industrial metallic titanium & bronze |

Selected themes persist automatically across browser sessions.
