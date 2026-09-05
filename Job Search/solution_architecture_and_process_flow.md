# 🏗️ Solution Architecture & Process Flow Diagrams

This document outlines the **Solution Architecture** and **Process Flow Diagrams** for the **Aiam Agentic Job Search Engine** — an autonomous multi-agent platform designed for candidate intake, live job discovery, fitment scoring, and executive dashboard analytics.

---

## 🏛️ 1. Solution Architecture Diagram

![Solution Architecture Diagram](C:/Users/PC1/.gemini/antigravity/brain/a41c3c31-ac01-43b5-b5c1-710ef5b7b5a9/solution_architecture_diagram_1784596232024.png)

### 🧩 System Component Breakdown

```mermaid
graph TD
    subgraph Client_UI ["Frontend UI Tier (HTML5 / Vanilla JS / CSS3)"]
        UI_Nav["Sidebar Navigation & Theme Engine (11 Themes)"]
        A1_View["Agent 1 View: Resume Intake & File Dropzone"]
        A2_View["Agent 2 View: Job Preferences Form"]
        A3_View["Agent 3 View: Google Jobs Live Search Console"]
        A4_View["Agent 4 View: Fitment Scorecard & Checkbox Selector"]
        A5_View["Agent 5 View: Aiam Executive Hub & Cover Letter Generator"]
        A6_View["Agent 6 View: Swarm Orchestration Visualizer"]
    end

    subgraph Agent_Core ["Multi-Agent Execution Core"]
        State_Mgr["Global Application State Manager (state.jobs, state.fitments)"]
        Parser_A1["Resume Parser & Text Merger Module"]
        Pref_A2["Preference Configurator Module"]
        Search_A3["Multi-Query Role Generator & Combined Search Engine"]
        Scorer_A4["Weighted 3-Tier Fitment Scoring Engine (Skills 60 / Seniority 20 / Pref 20)"]
        Analytics_A5["Executive Hub Aggregator & Spider Web Chart Generator"]
        Orch_A6["Automated Swarm Orchestrator Runner"]
    end

    subgraph Backend_Tier ["Backend Services & External APIs"]
        Node_Server["Node.js Native HTTP Server (server.js - Port 8080)"]
        SerpAPI["SerpAPI Google Jobs Engine API Proxy (/api/search)"]
        Fallback_DB["JOB_DATABASE Fallback Simulator"]
        Loc_Parser["parseCityCountry Location Parsing Engine"]
    end

    %% Client to Agent Core Interactions
    A1_View --> Parser_A1
    A2_View --> Pref_A2
    A3_View --> Search_A3
    A4_View --> Scorer_A4
    A5_View --> Analytics_A5
    A6_View --> Orch_A6

    %% Agent Core to State & Backend
    Parser_A1 --> State_Mgr
    Pref_A2 --> State_Mgr
    Search_A3 --> Node_Server
    Node_Server --> SerpAPI
    Node_Server --> Loc_Parser
    Node_Server -. "Fallback" .-> Fallback_DB
    Node_Server --> State_Mgr
    State_Mgr --> Scorer_A4
    Scorer_A4 --> Analytics_A5
```

---

## 🔄 2. Process Flow Diagram

![Process Flow Diagram](C:/Users/PC1/.gemini/antigravity/brain/a41c3c31-ac01-43b5-b5c1-710ef5b7b5a9/process_flow_diagram_1784596249867.png)

### 🌊 End-to-End Sequence & Data Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User as Candidate User
    participant A1 as Agent 1: Resume Intake
    participant A2 as Agent 2: Preferences
    participant A3 as Agent 3: Search Engine
    participant Srv as Node Server & SerpAPI
    participant A4 as Agent 4: Fitment Engine
    participant A5 as Agent 5: Executive Hub

    User->>A1: Upload Resume File (.pdf/.txt) or Paste Text
    A1->>A1: Parse Name, Title, Experience, & Priority Skills
    A1-->>User: Render Candidate Profile & skills_file_v1

    User->>A2: Select Target Roles, Location (City, Country), & Work Modes
    A2->>A2: Compile Search Constraints & Negative Keywords
    A2-->>User: Store Preferences Object

    User->>A3: Trigger Search (or Swarm Orchestrator)
    A3->>A3: Combine A1 (Skills/Roles) + A2 (Roles/Location)
    A3->>Srv: GET /api/search?q=Roles&city=City&country=Country
    Srv->>Srv: Query SerpAPI Google Jobs & parseCityCountry()
    Srv-->>A3: Return Standardized Job Array with City, Country Badges
    A3-->>User: Render Job Cards & Console Stream Logs

    User->>A4: Select Jobs & Run Fitment Assessment
    A4->>A4: Calculate Skills (0-60) + Seniority (0-20) + Prefs (0-20)
    A4-->>User: Render Fitment Scorecards with Strengths & Gaps

    User->>A5: Open Aiam Executive Hub
    A5->>A5: Aggregate Overall Match KPI & Generate Spider Radar Chart
    A5-->>User: Display Executive Dashboard & 1-Click Cover Letters
```

---

## ⚡ 3. Swarm Orchestration Flowchart (Agent 6)

```mermaid
flowchart LR
    A[Start Orchestration Swarm] --> B[Step 1: Agent 1 Resume Parsing]
    B --> C[Step 2: Agent 2 Preference Alignment]
    C --> D[Step 3: Agent 3 Google Jobs Live Search]
    D --> E[Step 4: Agent 4 Fitment Scoring Matrix]
    E --> F[Step 5: Agent 5 Aiam Executive Hub]
    F --> G[End Pipeline Execution]
```
