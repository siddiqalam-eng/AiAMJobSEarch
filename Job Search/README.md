# 🚀 Aiam Agentic Job Search Engine

![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green)
![VanillaJS](https://img.shields.io/badge/Stack-VanillaJS%20%7C%20CSS3%20%7C%20HTML5-blue)
![License](https://img.shields.io/badge/License-MIT-purple)
![Integrations](https://img.shields.io/badge/API-SerpAPI%20%7C%20Fantastic.jobs-orange)

An autonomous, 5-Agent Career Optimization Engine and Executive Dashboard designed to streamline resume parsing, preference targeting, dual-API job crawling, 100-point match fitment scoring, and AI cover letter generation.

---

## 🌟 Key Features

- **Agent 1 (Resume Intake)**: Drag-and-drop file upload (.pdf, .txt, .docx) combined with pasted resume parsing.
- **Agent 2 (Preference Alignment)**: Configure target job roles, salary expectations, remote/hybrid work modes, and exclusion keywords.
- **Agent 3 (Dual-API Crawler)**: Concurrent live job search across **Fantastic.jobs API** (V1 ATS endpoint) and **SerpAPI Google Jobs**, with automatic deduplication.
- **Agent 4 (Fitment Scorecard)**: Weighted 100-point match scoring algorithm (60% Skills Match, 20% Seniority, 20% Preferences).
- **Agent 5 (Executive Dashboard)**: Aggregate stats, multi-axis SVG Skillset Spider Radar chart, and 1-click AI Cover Letter synthesis.
- **Agent 6 (Pipeline Orchestrator)**: One-click sequential execution runner with real-time scrolling console terminal logs.
- **11 Cybernetic Themes**: Dynamic glassmorphism theme engine with persistent `localStorage` saving.

---

## 💻 Local Quickstart

### Prerequisites
- Node.js (v16 or higher)

### Setup & Run
1. Clone or download this repository.
2. Create a `.env` file in the root directory:
   ```env
   PORT=8080
   SERPAPI_KEY=your_serpapi_key_here
   FANTASTIC_JOBS_API_KEY=your_fantastic_jobs_api_key_here
   ```
3. Start the server:
   ```bash
   npm start
   ```
4. Open your browser to `http://localhost:8080`.

---

## 🌐 Deploying to GitHub & Cloud

### 1. Push Repository to GitHub
1. Create a new repository on GitHub named `job-search` (or your preferred name).
2. Initialize and push your repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of Aiam Agentic Job Search"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/job-search.git
   git push -u origin main
   ```
> ⚠️ **Note**: `.gitignore` is pre-configured to ensure your `.env` API keys are **never** published publicly.

---

### 2. Deploy Frontend to GitHub Pages (Static Hosting)
1. Go to your GitHub repository on `github.com`.
2. Click **Settings** > **Pages** (in the left sidebar).
3. Under **Build and deployment** -> **Branch**, select `main` and folder `/ (root)`.
4. Click **Save**.
5. Your frontend site will be published at:  
   `https://YOUR_USERNAME.github.io/job-search/`

---

### 3. Deploy Backend Server to Render (Free Node.js Service)
To support live multi-API crawling when using GitHub Pages, host `server.js` on Render:

1. Sign up for a free account at [render.com](https://render.com).
2. Click **New +** -> **Web Service**.
3. Connect your GitHub repository (`job-search`).
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
5. In **Environment Variables**, add:
   - `SERPAPI_KEY`: *(Your SerpAPI key)*
   - `FANTASTIC_JOBS_API_KEY`: *(Your Fantastic.jobs key)*
6. Click **Create Web Service**. Render will give you a live server URL (e.g. `https://aiam-job-search.onrender.com`).

---

### 4. Connect GitHub Pages to Live Backend
Once your Render backend is live:
1. Open your GitHub Pages site (`https://YOUR_USERNAME.github.io/job-search/`).
2. Open your browser console (`F12` -> Console) and set your live backend URL:
   ```javascript
   localStorage.setItem('aiam_backend_url', 'https://aiam-job-search.onrender.com');
   ```
*(If no backend URL is set, the GitHub Pages app automatically runs in High-Fidelity Simulation Mode with the built-in job database).*

---

## 🧪 Testing Suite

Run tests locally to verify scoring, virtual DOM events, and HTTP endpoints:
```bash
node test_fitment.js      # Unit test scoring engine
node test_integration.js  # DOM & theme switcher integration tests
node test_e2e.js          # Live HTTP crawler endpoint checks
```

---

## 📄 License
Distributed under the MIT License.
