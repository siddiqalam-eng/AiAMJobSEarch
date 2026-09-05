# AIam Agentic Job Search

This is an interactive web dashboard designed to simulate, demonstrate, and test the multi-agent orchestration architecture for AIam Agentic Job Search.

The dashboard integrates live, client-side implementations of the **Orchestrator Agent** and the **Fitment Agent**, providing a beautiful visual overview of the handoff pipeline, execution logs, and detailed fit score breakdowns.

## Features

- **Interactive Node Workflow**: Visualizes agent-to-agent interactions. Highlights active paths using glowing animations and moving "data packets".
- **Scenario Presets**: Six pre-coded scenarios to test different routing pathways (Fresh Start, Needs Preferences, Ready to Search, Ready for Fitment, Recommendation Outreach, State Error).
- **Session Context JSON Editor**: Fully editable fields to test custom payloads and see real-time updates.
- **Orchestrator Agent**: Executes routing decisions based on context inputs and generates standard JSON handoff payloads.
- **Fitment Agent**: Computes granular job match scores out of 100 based on required skills (priority & proficiency weighted), seniority differences, and preferences (location, work mode, employment type).
- **Handoff Console Stream**: Console log detailing timestamps and log messages from the agents as they process workflows.
- **Detailed Match Inspector**: Radial progress gauges and checklists showing strengths and gaps for individual jobs.

## Files Structure

- `index.html` - Core HTML layout and structure.
- `styles.css` - Custom styling utilizing premium dark mode, glassmorphism, responsive grids, SVG line routing, and radial gauges.
- `orchestrator.js` - Client-side Orchestrator routing logic.
- `fitment.js` - Client-side Fitment scoring engine.
- `app.js` - Dashboard manager, binding UI inputs, SVG drawings, scenario states, and event listeners.

## How to Run

1. Simply double-click the `index.html` file in your file explorer to open it directly in any modern web browser.
2. Alternatively, serve the directory using a lightweight HTTP server in PowerShell/Terminal:
   ```bash
   # Using Python
   python -m http.server 8000

   # Or using Node.js
   npx serve
   ```
3. Open `http://localhost:8000` (or `http://localhost:3000` for npx serve) in your browser.

## How to Test

1. **Select a Scenario Preset** on the left column (e.g. *Scenario D: Ready for Fitment*).
2. Look at the **Session Context** tabs to inspect the pre-populated JSON structure.
3. Click the **Run Orchestrator** button.
4. Watch the flow animation highlight the **Orchestrator** and trace the handoff to the targeted agent (e.g. **Fitment Agent**).
5. Review the **Handoff Console Stream** logs.
6. The **Output Inspector** on the right will render the Fitment Analytics Report, displaying overall counts and observations.
7. Click any job card inside the list (e.g. *XYZ Corp*) to drill down into the job details, showing calculated **Key Strengths** and **Identified Gaps**.
8. Try modifying the candidate's skills, seniority, or preferences directly in the **Session Context** editor and re-run to see how the fit score recalculates!
