// Global state
let currentContext = {
    candidate_profile: null,
    skills_file_v1: null,
    search_preferences: null,
    unified_job_list: null,
    fitment_report: null,
    user_request: ""
};

let activeTab = "resume_submission";
let activeNode = "user";
let currentFitmentReport = null;
let activeJobIndex = null;
let executedOutcomes = [];
let isOutreachCompleted = false;

// Presets Data Definition
const presets = {
    scenarioA: {
        name: "Agent A: Fresh Start",
        desc: "New workflow, missing profile. Routes to PROFILE_AGENT.",
        data: {
            candidate_profile: null,
            skills_file_v1: null,
            search_preferences: null,
            unified_job_list: null,
            fitment_report: null,
            user_request: "Help me search for senior AI leadership roles"
        }
    },
    scenarioB: {
        name: "Agent B: Needs Preferences",
        desc: "Profile loaded, preferences missing. Routes to PREFERENCES_AGENT.",
        data: {
            candidate_profile: {
                summary: "Experienced Tech Manager specializing in cloud platforms and web engineering.",
                experience: "8+ years in engineering, 3+ years managing teams.",
                industries: ["Tech", "Fintech"],
                seniority: "Manager"
            },
            skills_file_v1: {
                skills: [
                    { skill_name: "Cloud Architecture", category: "Engineering", proficiency_level: "Expert", years_experience: 5, priority: "High" },
                    { skill_name: "Team Leadership", category: "Management", proficiency_level: "Advanced", years_experience: 3, priority: "High" }
                ]
            },
            search_preferences: null,
            unified_job_list: null,
            fitment_report: null,
            user_request: "Find me some engineering manager jobs in tech"
        }
    },
    scenarioC: {
        name: "Agent C: Ready to Search",
        desc: "Profile + preferences loaded. Routes to MULTIBOARD_SEARCH_AGENTS.",
        data: {
            candidate_profile: {
                summary: "Experienced Tech Manager specializing in cloud platforms and web engineering.",
                experience: "8+ years in engineering, 3+ years managing teams.",
                industries: ["Tech", "Fintech"],
                seniority: "Manager"
            },
            skills_file_v1: {
                skills: [
                    { skill_name: "Cloud Architecture", category: "Engineering", proficiency_level: "Expert", years_experience: 5, priority: "High" },
                    { skill_name: "Team Leadership", category: "Management", proficiency_level: "Advanced", years_experience: 3, priority: "High" }
                ]
            },
            search_preferences: {
                target_titles: ["Tech Lead", "Engineering Manager"],
                locations: ["Bangalore", "Remote"],
                work_mode: ["Remote", "Hybrid"],
                employment_type: ["Full-time"],
                keywords_include: ["Node.js", "Cloud"],
                keywords_exclude: ["sales"],
                salary_range: {
                    currency: "USD",
                    min: 120000,
                    max: 180000,
                    frequency: "Yearly"
                }
            },
            unified_job_list: null,
            fitment_report: null,
            user_request: "Let's search for jobs now!"
        }
    },
    scenarioD: {
        name: "Agent D: Ready for Fitment",
        desc: "Profile + jobs loaded, scoring requested. Routes to FITMENT_AGENT.",
        data: {
            candidate_profile: {
                summary: "Senior AI & digital transformation leader with a focus on enterprise AI integrations.",
                experience: "12+ years in technical leadership, specializing in Generative AI strategy and product scaling.",
                industries: ["Artificial Intelligence", "Consulting", "Enterprise Software"],
                seniority: "Director"
            },
            skills_file_v1: {
                skills: [
                    { skill_name: "Generative AI strategy", category: "AI", proficiency_level: "Expert", years_experience: 4, priority: "High" },
                    { skill_name: "Enterprise Integration", category: "Engineering", proficiency_level: "Expert", years_experience: 8, priority: "High" },
                    { skill_name: "Change Management", category: "Management", proficiency_level: "Advanced", years_experience: 5, priority: "Medium" },
                    { skill_name: "Product Strategy", category: "Product", proficiency_level: "Advanced", years_experience: 6, priority: "High" }
                ]
            },
            search_preferences: {
                target_titles: ["Director AI", "AI Strategy Lead", "Enterprise Architect"],
                locations: ["Mumbai", "India", "Remote", "Dubai"],
                work_mode: ["Hybrid", "Remote"],
                employment_type: ["Full-time"],
                keywords_include: ["Generative AI", "transformation"],
                keywords_exclude: ["legacy"],
                salary_range: {
                    currency: "INR",
                    min: 3500000,
                    max: 6000000,
                    frequency: "Yearly"
                }
            },
            unified_job_list: [
                {
                    title: "Director, AI & Digital Transformation",
                    company: "XYZ Corp",
                    location: "Mumbai, India",
                    employment_type: "Full-time",
                    work_mode: "Hybrid",
                    requirements: "Lead enterprise AI initiatives, define Generative AI strategy, and manage large-scale digital transformation programs.",
                    skills_required: ["Generative AI strategy", "Change Management", "Product Strategy"],
                    seniority: "Director",
                    sources: ["LinkedIn", "IIMJobs"]
                },
                {
                    title: "Lead AI Engineer",
                    company: "Alpha Tech",
                    location: "Remote",
                    employment_type: "Full-time",
                    work_mode: "Remote",
                    requirements: "Build machine learning models, core generative AI services, and execute software engineering pipelines.",
                    skills_required: ["Generative AI strategy", "Python", "Machine Learning"],
                    seniority: "Senior",
                    sources: ["LinkedIn", "Global_Remote"]
                },
                {
                    title: "VP of AI Systems",
                    company: "Apex Global",
                    location: "New York, USA",
                    employment_type: "Full-time",
                    work_mode: "On-site",
                    requirements: "Direct global AI strategy, manage multi-million dollar P&L, oversee AI architecture and systems.",
                    skills_required: ["Generative AI strategy", "Enterprise Integration", "P&L Management"],
                    seniority: "VP",
                    sources: ["ExecSearch"]
                }
            ],
            fitment_report: null,
            user_request: "Match me against the active jobs and give me a fitment score"
        }
    },
    scenarioE: {
        name: "Agent E: Outreach & Tweaks",
        desc: "Scored jobs exist, outreach requested. Routes to RECOMMENDATION_OUTREACH_AGENT.",
        data: {
            candidate_profile: {
                summary: "Senior AI & digital transformation leader with a focus on enterprise AI integrations.",
                experience: "12+ years in technical leadership, specializing in Generative AI strategy and product scaling.",
                industries: ["Artificial Intelligence", "Consulting", "Enterprise Software"],
                seniority: "Director"
            },
            skills_file_v1: {
                skills: [
                    { skill_name: "Generative AI strategy", category: "AI", proficiency_level: "Expert", years_experience: 4, priority: "High" },
                    { skill_name: "Enterprise Integration", category: "Engineering", proficiency_level: "Expert", years_experience: 8, priority: "High" },
                    { skill_name: "Change Management", category: "Management", proficiency_level: "Advanced", years_experience: 5, priority: "Medium" },
                    { skill_name: "Product Strategy", category: "Product", proficiency_level: "Advanced", years_experience: 6, priority: "High" }
                ]
            },
            search_preferences: {
                target_titles: ["Director AI", "AI Strategy Lead", "Enterprise Architect"],
                locations: ["Mumbai", "India", "Remote", "Dubai"],
                work_mode: ["Hybrid", "Remote"],
                employment_type: ["Full-time"],
                keywords_include: ["Generative AI", "transformation"],
                keywords_exclude: ["legacy"],
                salary_range: {
                    currency: "INR",
                    min: 3500000,
                    max: 6000000,
                    frequency: "Yearly"
                }
            },
            unified_job_list: [
                {
                    title: "Director, AI & Digital Transformation",
                    company: "XYZ Corp",
                    location: "Mumbai, India",
                    employment_type: "Full-time",
                    work_mode: "Hybrid",
                    requirements: "Lead enterprise AI initiatives, define Generative AI strategy, and manage large-scale digital transformation programs.",
                    skills_required: ["Generative AI strategy", "Change Management", "Product Strategy"],
                    seniority: "Director",
                    sources: ["LinkedIn", "IIMJobs"]
                },
                {
                    title: "Lead AI Engineer",
                    company: "Alpha Tech",
                    location: "Remote",
                    employment_type: "Full-time",
                    work_mode: "Remote",
                    requirements: "Build machine learning models, core generative AI services, and execute software engineering pipelines.",
                    skills_required: ["Generative AI strategy", "Python", "Machine Learning"],
                    seniority: "Senior",
                    sources: ["LinkedIn", "Global_Remote"]
                }
            ],
            fitment_report: {
                jobs: [
                    {
                        title: "Director, AI & Digital Transformation",
                        company: "XYZ Corp",
                        location: "Mumbai, India",
                        sources: ["LinkedIn", "IIMJobs"],
                        fit_score: 96,
                        fit_band: "High",
                        key_strengths: [
                            "Seniority level (Director) aligns perfectly with the job's requirement (Director).",
                            "Strong skills match in 'Generative AI strategy' (Candidate is an Expert).",
                            "Job location (Mumbai, India) aligns with preferred locations."
                        ],
                        key_gaps: [
                            "No explicit experience in the specified geographic market mentioned.",
                            "Required skills list may cover areas outside of candidate's primary domain."
                        ]
                    }
                ],
                summary: {
                    high_fit_count: 1,
                    medium_fit_count: 0,
                    low_fit_count: 0,
                    overall_observations: ["Found 1 high-fit role matching candidate profile."]
                }
            },
            user_request: "Help me draft a warm outreach email for XYZ Corp and optimize my profile description."
        }
    },
    scenarioF: {
        name: "Agent F: State Error",
        desc: "Ambiguous user query. Routes to ERROR.",
        data: {
            candidate_profile: {
                summary: "Senior AI Leader.",
                seniority: "Director"
            },
            skills_file_v1: {
                skills: [{ skill_name: "Generative AI strategy", priority: "High", proficiency_level: "Expert" }]
            },
            search_preferences: { locations: ["India"] },
            unified_job_list: [],
            fitment_report: null,
            user_request: "What is the weather forecast for tomorrow?"
        }
    }
};

// Node descriptions and prompts for the inspector
const nodeDetails = {
    user: {
        title: "User Input Node",
        desc: "The entry point of the workflow. The user submits a natural language request along with any available artifacts in their current session.",
        prompt: "N/A - Direct User Input"
    },
    orchestrator: {
        title: "Orchestrator Agent",
        desc: "Acts as the supervisor/coordinator. Inspects the current artifacts, chooses the next specialized agent, and constructs a structured handoff message.",
        prompt: `System / Instructions:
You are the Orchestrator Agent for a multi agent job search copilot. Your job is to decide which specialized agent to run next, based on the current state of the workflow, and to prepare a clear task description and input payload for that agent. You do not analyze resumes or search jobs yourself.
Decides between: PROFILE_AGENT, PREFERENCES_AGENT, MULTIBOARD_SEARCH_AGENTS, FITMENT_AGENT, RECOMMENDATION_OUTREACH_AGENT, or ERROR.`
    },
    profile: {
        title: "Profile Agent (Agent A)",
        desc: "Agent A Responsibility: Ingests the attached resume to summarize key details, work history, seniority level, and core skills, then prepares the summarized candidate profile to pass to Agent B.",
        prompt: `System / Instructions:
Analyze the provided resume and LinkedIn profile text. Parse work history, responsibilities, projects, and educational credentials. Standardize them into a candidate_profile object, and output a skills_file_v1 object featuring parsed skill names, categories, proficiency levels, years of experience, and priorities.`
    },
    preferences: {
        title: "Preferences Agent (Agent B)",
        desc: "Agent B Responsibility: Ingests preference inputs from the user (Target titles, locations, modes, salary, keywords), summarizes this preferences outcome along with Agent A's profile outcome, and passes them to Agent C.",
        prompt: `System / Instructions:
Engage with the user to ask clarifying questions about preferred locations, desired compensation bounds, flexible work options (remote/hybrid/on-site), and preferred employment configurations. Output a search_preferences object.`
    },
    multiboard: {
        title: "Search Agent (Agent C)",
        desc: "Agent C Responsibility: Ingests profile insights from Agent A and search preferences from Agent B, performs a multi-source website query, and presents the aggregated raw job listings inside the Output Search Dashboard.",
        prompt: `System / Instructions:
1. Ingest candidate seniority and skills from Agent A's profile.
2. Ingest target titles, preferred locations, work modes, and must-have keywords from Agent B's preferences.
3. Query major job boards (LinkedIn, IIMJobs, Foundit, ExecSearch) and run general web index spiders.
4. Deduplicate, filter, and aggregate matching job listings.
5. Render the matching job listings directly inside the Output tab in a clean search dashboard layout.`
    },
    fitment: {
        title: "Fitment Agent (Agent D)",
        desc: "Agent D Responsibility: Evaluates candidate credentials against each job to compute fit scores (0-100), summarizes alignment strengths/gaps, and passes these scores to Agent E.",
        prompt: `System / Instructions:
Compute Fit Scores (0-100) based on:
1. Skills Match (0-60 points)
2. Seniority Alignment (0-20 points)
3. Preferences Alignment (0-20 points)
Outputs fitment_report containing scoring details, high/medium/low bands, strengths, and gaps.`
    },
    outreach: {
        title: "Outreach & Recommendations Agent (Agent E)",
        desc: "Agent E Responsibility: Ingests the scored jobs from Agent D to recommend near-suitable jobs as a ranked list, drafts tailored outreach pitches, and optimizes profile descriptions.",
        prompt: `System / Instructions:
Read candidate_profile and target job specifications. Generate tailored suggestions to optimize the candidate's LinkedIn headline or resume summaries. Draft compelling, highly-personalized outreach emails targeting hiring managers.`
    },
    errorState: {
        title: "Error Node",
        desc: "Invoked when inputs are inconsistent, incomplete, or the user request is ambiguous. Demands clarification or corrective parameters before proceeding.",
        prompt: "System / Instructions:\nEcho back the context for debugging and present a clear message outlining what is missing or ambiguous, prompting the user for correction."
    }
};

// Map agent names to node IDs
const agentNodeMap = {
    "PROFILE_AGENT": "profile",
    "PREFERENCES_AGENT": "preferences",
    "MULTIBOARD_SEARCH_AGENTS": "multiboard",
    "FITMENT_AGENT": "fitment",
    "RECOMMENDATION_OUTREACH_AGENT": "outreach",
    "ERROR": "errorState"
};

// Initialize Application
document.addEventListener("DOMContentLoaded", () => {
    setupPresets();
    setupTabs();
    setupInspector();
    setupCanvas();
    
    // Load Preset A by default
    loadPreset("scenarioA");

    // Run Button
    document.getElementById("btn-run-orchestrator").addEventListener("click", () => {
        executeWorkflow();
    });

    // Reset Button
    document.getElementById("btn-reset").addEventListener("click", () => {
        const activePreset = document.querySelector(".preset-btn.active");
        if (activePreset) {
            loadPreset(activePreset.dataset.preset);
        } else {
            loadPreset("scenarioA");
        }
    });


    // Go to Scenario C Button (Needs Preferences footer override)
    document.getElementById("btn-go-to-scenario-c").addEventListener("click", () => {
        logToTerminal("System", "Initializing Preferences Agent...");
        logToTerminal("PreferencesAgent", "Refreshing form model endpoints. Connection synced.");
        logToTerminal("PreferencesAgent", "Agent B Responsibility: Gathering search preference inputs from user...");
        
        // Sync UI inputs to context state
        if (typeof window.syncPreferencesFromForm === "function") {
            window.syncPreferencesFromForm();
        }

        // Ensure we have some default preferences if the form was completely empty
        if (!currentContext.search_preferences) {
            currentContext.search_preferences = {
                target_titles: ["Tech Lead", "Engineering Manager"],
                locations: ["Bangalore", "Remote"],
                work_mode: ["Remote", "Hybrid"],
                employment_type: ["Full-time"],
                keywords_include: ["Node.js", "Cloud"],
                keywords_exclude: ["sales"],
                salary_range: {
                    currency: "USD",
                    min: 120000,
                    max: 180000,
                    frequency: "Yearly"
                }
            };
        }

        // Highlight Preferences node on the workflow graph with refreshing state
        resetWorkflowGraph();
        const prefNode = document.getElementById("node-preferences");
        if (prefNode) prefNode.classList.add("refreshing");

        // Trigger transition with a delay to let the user see the animation
        setTimeout(() => {
            if (prefNode) {
                prefNode.classList.remove("refreshing");
                prefNode.classList.add("routed");
            }
            logToTerminal("System", "Initiating Preferences Agent workflow simulation...");
            logToTerminal("PreferencesAgent", "Successfully fetched search_preferences from form fields.");
            logToTerminal("PreferencesAgent", "Summarizing user preferences along with Agent A's profile outcome...");
            logToTerminal("PreferencesAgent", "Preparing handoff payload and passing summarized context to Agent C...");

            // Push Preferences Agent outcome directly to tracing history!
            pushOutcome("Preferences Agent", "Agent B Responsibility: Collected preference inputs from the user, summarized them along with Agent A's profile outcome, and passed them to Agent C.", {
                search_preferences: currentContext.search_preferences
            });

            // Transition state to Agent C config without resetting outcomes list
            currentContext.user_request = "Let's search for jobs now!";
            activeTab = "user_request";
            syncTabButtonsVisibility();
            updateEditorTextarea();

            // Highlight preset button
            document.querySelectorAll(".preset-btn").forEach(b => {
                b.classList.remove("active");
                if (b.dataset.preset === "scenarioC") b.classList.add("active");
            });

            logToTerminal("System", "Agent C loaded: Setup complete, ready to search jobs!");
        }, 700);
    });

    // Go to Ready for Fitment Button (Ready to Search footer override)
    document.getElementById("btn-go-to-ready-fitment").addEventListener("click", async () => {
        const userReqText = document.getElementById("editor-textarea").value.trim();

        const profile = currentContext.candidate_profile || {};
        const prefs = currentContext.search_preferences || {};
        const seniority = profile.seniority || "Senior";
        const titles = prefs.target_titles ? prefs.target_titles.join(", ") : "AI Roles";
        const locs = prefs.locations ? prefs.locations.join(", ") : "Remote";
        const keywords = prefs.keywords_include ? prefs.keywords_include.join(", ") : "";

        const skillsObj = currentContext.skills_file_v1 || {};
        const candidateSkills = (skillsObj.skills || []).map(s => s.skill_name);
        const skillsStr = candidateSkills.join(", ");

        logToTerminal("System", "Initializing Search Agent...");
        logToTerminal("SearchAgent", "Refreshing search spiders and web query APIs. Connection OK.");
        logToTerminal("SearchAgent", "Agent C Responsibility: Querying job markets and crawling web sources based on Profile + Preferences handoff...");

        // Highlight Search node on the workflow graph with refreshing state
        resetWorkflowGraph();
        const searchNode = document.getElementById("node-multiboard");
        if (searchNode) searchNode.classList.add("refreshing");

        let fetchedJobs = null;

        try {
            logToTerminal("SearchAgent", "Contacting Backend API Proxy Server (http://localhost:3000)...");
            const queryUrl = `http://localhost:3000/api/search?seniority=${encodeURIComponent(seniority)}&titles=${encodeURIComponent(titles)}&locations=${encodeURIComponent(locs)}&keywords=${encodeURIComponent(keywords)}&skills=${encodeURIComponent(skillsStr)}`;
            
            // Fetch with a timeout signal
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 2000);
            
            const response = await fetch(queryUrl, { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data.jobs)) {
                    fetchedJobs = data.jobs;
                    logToTerminal("SearchAgent", `Successfully queried backend API. Ingested ${fetchedJobs.length} live jobs!`);
                }
            }
        } catch (err) {
            logToTerminal("SearchAgent", `Backend server not detected or offline. Error: ${err.message}`);
        }

        // If backend server failed or is offline, generate browser-side dynamic job listings
        if (fetchedJobs) {
            currentContext.unified_job_list = fetchedJobs;
        } else {
            logToTerminal("SearchAgent", "Executing browser-side dynamic search generator fallback...");
            const skillsObj = currentContext.skills_file_v1 || {};
            const candidateSkills = (skillsObj.skills || []).map(s => s.skill_name);
            if (candidateSkills.length === 0) {
                candidateSkills.push("Generative AI strategy", "Machine Learning", "Cloud Architecture");
            }

            const targetTitles = prefs.target_titles && prefs.target_titles.length > 0 ? prefs.target_titles : ["AI Director", "Enterprise Architect"];
            const locationsList = prefs.locations && prefs.locations.length > 0 ? prefs.locations : ["Mumbai", "Remote"];
            const workModes = prefs.work_mode && prefs.work_mode.length > 0 ? prefs.work_mode : ["Hybrid", "Remote"];
            const keywordsInclude = prefs.keywords_include && prefs.keywords_include.length > 0 ? prefs.keywords_include : ["Generative AI"];

            currentContext.unified_job_list = [
                {
                    title: targetTitles[0],
                    company: "Tech Synergy Corp (Fallback)",
                    location: locationsList[0],
                    employment_type: "Full-time",
                    work_mode: workModes[0],
                    requirements: `Excellent opportunity for a ${seniority} level candidate to lead ${targetTitles[0]} initiatives. Must have hands-on experience with: ${keywordsInclude.join(', ')}.`,
                    skills_required: [candidateSkills[0], candidateSkills[1] || "Machine Learning", "Strategic Leadership"],
                    seniority: seniority,
                    sources: ["LinkedIn", "Google Jobs API"]
                },
                {
                    title: targetTitles[1] || `${targetTitles[0]} Lead`,
                    company: "CloudScale Systems (Fallback)",
                    location: locationsList[1] || locationsList[0],
                    employment_type: "Full-time",
                    work_mode: workModes[1] || workModes[0],
                    requirements: `Looking for a ${seniority} ${targetTitles[1] || targetTitles[0]} with focus on ${keywordsInclude[0] || 'AI integrations'}.`,
                    skills_required: [candidateSkills[0], candidateSkills[2] || "Cloud Architecture"],
                    seniority: seniority,
                    sources: ["IIMJobs", "Bing Careers index"]
                },
                {
                    title: `Lead Specialist - ${targetTitles[0]} (Fallback)`,
                    company: "Global Core Inc (Fallback)",
                    location: locationsList[0],
                    employment_type: "Full-time",
                    work_mode: workModes[0],
                    requirements: `High-impact ${seniority} position. Required background: ${keywordsInclude.join(' and ')}.`,
                    skills_required: [candidateSkills[1] || "Machine Learning", candidateSkills[2] || "Cloud Architecture"],
                    seniority: seniority,
                    sources: ["ExecSearch", "Target Company Page"]
                }
            ];
        }

        // Trigger transition with a delay to let the user see the transition
        setTimeout(() => {
            if (searchNode) {
                searchNode.classList.remove("refreshing");
                searchNode.classList.add("routed");
            }
            // Log Search Agent workflow to terminal
            logToTerminal("System", "Initiating Multiboard & General Web Search Agents...");
            logToTerminal("SearchAgent", `Handoff Ingested - Profile Seniority: [${seniority}], Target Titles: [${titles}], Pref Locations: [${locs}]`);
            logToTerminal("SearchAgent", "Querying Job Market Websites: LinkedIn, IIMJobs, Foundit, ExecSearch...");
            logToTerminal("SearchAgent", "Executing General Web Index crawler: Google Jobs API, Bing Careers index, and target company directories...");
            if (keywords) {
                logToTerminal("SearchAgent", `Applying must-have keyword constraints: [${keywords}]`);
            }
            logToTerminal("SearchAgent", "Aggregating, deduplicating, and filtering matching job postings...");
            logToTerminal("SearchAgent", "Summarizing search listings as outcome of Agent C...");
            logToTerminal("SearchAgent", "Preparing handoff payload and passing summarized results to Agent D...");

            // Push Search Agent outcome directly to tracing history!
            pushOutcome("Search Agents", "Agent C Responsibility: Searched job listings across job board websites and crawled general websites, aggregated deduplicated jobs, summarized results as the outcome of Agent C, and passed them to Agent D.", {
                unified_job_list: currentContext.unified_job_list
            });

            // Transition state to Agent D config without resetting outcomes list
            currentContext.user_request = userReqText || "Match me against the active jobs and give me a fitment score";
            activeTab = "user_request";
            syncTabButtonsVisibility();
            updateEditorTextarea();

            // Highlight preset button
            document.querySelectorAll(".preset-btn").forEach(b => {
                b.classList.remove("active");
                if (b.dataset.preset === "scenarioD") b.classList.add("active");
            });

            // Render beautiful Search Results Dashboard directly in Output Inspector
            showSearchResultsDashboard(currentContext.unified_job_list);

            // Switch to output tab so user immediately sees the search output dashboard
            switchMainTab("output");

            logToTerminal("System", "Agent C execution complete. Review search results in Output tab.");
            logToTerminal("System", "Agent D loaded: Aggregated job list populated, ready for fitment scoring!");
        }, 700);
    });

    // Go to Outreach & Tweaks Button (Ready for Fitment footer override)
    document.getElementById("btn-go-to-outreach-tweaks").addEventListener("click", () => {
        const userComments = document.getElementById("editor-textarea").value.trim();

        logToTerminal("System", "Initializing Fitment Agent...");
        logToTerminal("FitmentAgent", "Refreshing semantic parser. Re-calibrating weight coefficients.");
        logToTerminal("FitmentAgent", "Agent D Responsibility: Evaluating qualifications and scoring each job posting (fit scores, strengths/gaps)...");

        // Highlight Fitment node on the workflow graph with refreshing state
        resetWorkflowGraph();
        const fitmentNode = document.getElementById("node-fitment");
        if (fitmentNode) fitmentNode.classList.add("refreshing");

        // Trigger transition with a delay to let the user see the animation
        setTimeout(() => {
            if (fitmentNode) {
                fitmentNode.classList.remove("refreshing");
                fitmentNode.classList.add("routed");
            }
            // Log Fitment Agent workflow to terminal
            logToTerminal("System", "Preparing payloads. Transferring context to Fitment Agent...");
            logToTerminal("FitmentAgent", `Processing job listings... Incorporating user request comments: "${userComments || 'Evaluate my match score'}"`);
            logToTerminal("FitmentAgent", "Successfully computed match alignment coefficients (seniority, skills, prefs).");
            logToTerminal("FitmentAgent", "Fitment evaluation completed! Matches found: High [3], Medium [1], Low [1]");
            logToTerminal("FitmentAgent", "Scored job results finalized. Preparing handoff payload and passing scores to Agent E...");

            // Always dynamically calculate the fitment report from Agent C's live search results
            const fitmentInput = {
                candidate_profile: currentContext.candidate_profile,
                skills_file_v1: currentContext.skills_file_v1,
                job_list: currentContext.unified_job_list,
                preferences: currentContext.search_preferences
            };
            const result = runFitmentAgent(fitmentInput);
            currentContext.fitment_report = result.fitment_report;
            currentFitmentReport = result.fitment_report;

            // Push Fitment Agent outcome directly to tracing history!
            pushOutcome("Fitment Agent", "Agent D Responsibility: Evaluated candidate credentials against each job to compute fit scores (0-100), summarized alignment strengths/gaps, and passed these scores to Agent E.", currentContext.fitment_report);

            // Transition state to Agent E config without resetting outcomes list
            currentContext.user_request = userComments || "Help me draft a warm outreach email for XYZ Corp and optimize my profile description.";
            activeTab = "user_request";
            syncTabButtonsVisibility();
            updateEditorTextarea();

            // Highlight preset button
            document.querySelectorAll(".preset-btn").forEach(b => {
                b.classList.remove("active");
                if (b.dataset.preset === "scenarioE") b.classList.add("active");
            });

            // Render fitment scores dashboard directly inside the Output Inspector
            showFitmentReport(currentFitmentReport);

            // Switch to output tab so the user sees the computed score gauges
            switchMainTab("output");

            logToTerminal("System", "Agent D execution complete. Review matching scores in Output tab.");
            logToTerminal("System", "Agent E loaded: Scoring results populated, ready to generate outreach drafts!");
        }, 700);
    });

    // Draw SVG connections on resize
    window.addEventListener("resize", () => {
        drawConnections();
    });

    // Wire up Resume Ingestion events
    setupResumeIngestion();
    // Wire up Preferences form events
    setupPreferencesForm();
    // Wire up Main Tab Layout events
    setupMainTabLayout();
});

// Setup Presets Buttons
function setupPresets() {
    const container = document.getElementById("scenario-presets");
    container.innerHTML = "";

    Object.keys(presets).forEach(key => {
        const preset = presets[key];
        const btn = document.createElement("button");
        btn.className = "preset-btn";
        btn.dataset.preset = key;
        btn.innerHTML = `
            <span class="preset-title">${preset.name}</span>
            <span class="preset-desc">${preset.desc}</span>
        `;
        btn.addEventListener("click", () => {
            document.querySelectorAll(".preset-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            loadPreset(key);
        });
        container.appendChild(btn);
    });
}

// Load Scenario Data
function loadPreset(key) {
    const preset = presets[key];
    currentContext = JSON.parse(JSON.stringify(preset.data)); // Deep clone
    currentFitmentReport = currentContext.fitment_report;
    
    logToTerminal("System", `Loaded agent preset: "${preset.name}"`);
    isOutreachCompleted = false;
    
    // Reset visual nodes
    resetWorkflowGraph();

    // Clear outcomes trace and push historical snapshots matching scenario state
    executedOutcomes = [];
    if (key === "scenarioB") {
        pushOutcome("Profile Agent", "Agent A Responsibility: Ingested and summarized points from the attached resume (seniority, skills) to prepare handoff profile for Agent B.", {
            candidate_profile: currentContext.candidate_profile,
            skills_file_v1: currentContext.skills_file_v1
        });
    } else if (key === "scenarioC") {
        pushOutcome("Profile Agent", "Agent A Responsibility: Ingested and summarized points from the attached resume (seniority, skills) to prepare handoff profile for Agent B.", {
            candidate_profile: currentContext.candidate_profile,
            skills_file_v1: currentContext.skills_file_v1
        });
        pushOutcome("Preferences Agent", "Agent B Responsibility: Collected preference inputs from the user, summarized them along with Agent A's profile outcome, and passed them to Agent C.", {
            search_preferences: currentContext.search_preferences
        });
    } else if (key === "scenarioD") {
        pushOutcome("Profile Agent", "Agent A Responsibility: Ingested and summarized points from the attached resume (seniority, skills) to prepare handoff profile for Agent B.", {
            candidate_profile: currentContext.candidate_profile,
            skills_file_v1: currentContext.skills_file_v1
        });
        pushOutcome("Preferences Agent", "Agent B Responsibility: Collected preference inputs from the user, summarized them along with Agent A's profile outcome, and passed them to Agent C.", {
            search_preferences: currentContext.search_preferences
        });
        pushOutcome("Search Agents", "Agent C Responsibility: Searched job listings across job board websites and crawled general websites, aggregated deduplicated jobs, summarized results as the outcome of Agent C, and passed them to Agent D.", {
            unified_job_list: currentContext.unified_job_list
        });
    } else if (key === "scenarioE" || key === "scenarioF") {
        pushOutcome("Profile Agent", "Agent A Responsibility: Ingested and summarized points from the attached resume (seniority, skills) to prepare handoff profile for Agent B.", {
            candidate_profile: currentContext.candidate_profile,
            skills_file_v1: currentContext.skills_file_v1
        });
        pushOutcome("Preferences Agent", "Agent B Responsibility: Collected preference inputs from the user, summarized them along with Agent A's profile outcome, and passed them to Agent C.", {
            search_preferences: currentContext.search_preferences
        });
        pushOutcome("Search Agents", "Agent C Responsibility: Searched job listings across job board websites and crawled general websites, aggregated deduplicated jobs, summarized results as the outcome of Agent C, and passed them to Agent D.", {
            unified_job_list: currentContext.unified_job_list
        });
        if (currentContext.fitment_report) {
            pushOutcome("Fitment Agent", "Agent D Responsibility: Evaluated candidate credentials against each job to compute fit scores (0-100), summarized alignment strengths/gaps, and passed these scores to Agent E.", currentContext.fitment_report);
        }
    }
    
    // Always render outcomes list to sync sidebar
    renderOutcomesList();
    
    // Clear outcome details container
    const detailsContainer = document.getElementById("outcome-details-container");
    if (detailsContainer) {
        detailsContainer.innerHTML = `
            <div class="inspector-empty" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                <i class="fa-solid fa-box-open" style="font-size: 2rem; color: var(--color-text-dark); margin-bottom: 0.75rem;"></i>
                <p style="font-size: 0.85rem; color: var(--color-text-muted); text-align: center;">No Data</p>
            </div>
        `;
    }

    // Auto-select tab based on context state
    if (currentContext.candidate_profile === null) {
        activeTab = "resume_submission";
    } else if (currentContext.search_preferences === null) {
        activeTab = "search_preferences";
    } else {
        activeTab = "user_request";
    }

    // Sync context tabs visibility based on profile state
    syncTabButtonsVisibility();

    // Render current active tab in editor
    updateEditorTextarea();
    
    // Clear or refresh Output Inspector
    const inspector = document.getElementById("inspector-container");
    if (key === "scenarioA") {
        if (inspector) {
            inspector.innerHTML = `
                <div class="inspector-empty" style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
                    <i class="fa-solid fa-network-wired" style="font-size: 2.2rem; color: var(--color-text-dark); margin-bottom: 0.75rem;"></i>
                    <p style="font-size: 0.9rem; color: var(--color-text-muted); text-align: center;">No Data</p>
                </div>
            `;
        }
    } else {
        if (currentFitmentReport) {
            showFitmentReport(currentFitmentReport);
        } else if (currentContext.unified_job_list && currentContext.unified_job_list.length > 0) {
            showSearchResultsDashboard(currentContext.unified_job_list);
        } else {
            showNodeDetails("user");
        }
    }

    // Refresh Final Summary
    renderSummaryDashboard();
}

// Setup Context Tabs
function setupTabs() {
    const tabs = document.querySelectorAll(".json-tabs .tab-btn");
    tabs.forEach(tab => {
        tab.addEventListener("click", () => {
            tabs.forEach(t => t.classList.remove("active"));
            tab.classList.add("active");
            activeTab = tab.dataset.tab;
            updateEditorTextarea();
        });
    });

    // Update state when textarea content changes
    const textarea = document.getElementById("editor-textarea");
    textarea.addEventListener("input", () => {
        try {
            const val = textarea.value;
            if (activeTab === "user_request") {
                currentContext.user_request = val;
            } else {
                currentContext[activeTab] = JSON.parse(val);
            }
            textarea.style.borderColor = "";
        } catch (e) {
            textarea.style.borderColor = "var(--status-error)";
        }
    });
}

// Update JSON Editor Content
function updateEditorTextarea() {
    const textarea = document.getElementById("editor-textarea");
    const form = document.getElementById("preferences-form");
    const resumeForm = document.getElementById("resume-submission-form");
    
    if (!textarea || !form || !resumeForm) return;

    if (activeTab === "resume_submission") {
        textarea.style.display = "none";
        form.style.display = "none";
        resumeForm.style.display = "flex";
    } else if (activeTab === "search_preferences") {
        textarea.style.display = "none";
        resumeForm.style.display = "none";
        form.style.display = "flex";

        // Populate form from state
        const prefs = currentContext.search_preferences || {};
        
        // Target titles
        const titles = prefs.target_titles || [];
        document.getElementById("pref-titles-input").value = titles.join(", ");

        // Locations
        const locs = prefs.locations || [];
        document.getElementById("pref-locations-input").value = locs.join(", ");

        // Keywords Include (must-have)
        const inc = prefs.keywords_include || [];
        document.getElementById("pref-keywords-include").value = inc.join(", ");

        // Keywords Exclude (exclude)
        const exc = prefs.keywords_exclude || [];
        document.getElementById("pref-keywords-exclude").value = exc.join(", ");

        // Work modes
        const modes = prefs.work_mode || [];
        document.querySelectorAll(".pref-mode-check").forEach(cb => {
            cb.checked = modes.includes(cb.value);
        });

        // Employment types
        const types = prefs.employment_type || [];
        document.querySelectorAll(".pref-type-check").forEach(cb => {
            cb.checked = types.includes(cb.value);
        });

        // Salary range
        const sal = prefs.salary_range || {};
        document.getElementById("pref-salary-currency").value = sal.currency || "AED";
        document.getElementById("pref-salary-min").value = sal.min !== null ? sal.min : "";
        document.getElementById("pref-salary-max").value = sal.max !== null ? sal.max : "";
        document.getElementById("pref-salary-frequency").value = sal.frequency || "Monthly";
    } else {
        textarea.style.display = "block";
        form.style.display = "none";
        resumeForm.style.display = "none";
        
        const data = currentContext[activeTab];
        if (activeTab === "user_request") {
            textarea.value = data || "";
            textarea.readOnly = false;
        } else {
            textarea.value = JSON.stringify(data, null, 2);
            textarea.readOnly = false;
        }
    }

    // Toggle footer buttons based on active tab and scenario state
    const runSection = document.querySelector(".run-section");
    const btnRun = document.getElementById("btn-run-orchestrator");
    const btnGoToC = document.getElementById("btn-go-to-scenario-c");
    const btnGoToFitment = document.getElementById("btn-go-to-ready-fitment");
    const btnGoToOutreach = document.getElementById("btn-go-to-outreach-tweaks");
    const btnReset = document.getElementById("btn-reset");

    if (runSection && btnRun && btnGoToC && btnGoToFitment && btnGoToOutreach && btnReset) {
        // Run orchestrator routing quickly to check if next agent is ERROR
        const orchestratorCheck = runOrchestrator(currentContext);
        const isErrorState = orchestratorCheck.next_agent === "ERROR";

        if (activeTab === "resume_submission") {
            runSection.style.display = "none";
        } else {
            runSection.style.display = "flex";
            
            if (isErrorState) {
                btnRun.style.display = "flex";
                btnRun.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Error Agent';
                btnGoToC.style.display = "none";
                btnGoToFitment.style.display = "none";
                btnGoToOutreach.style.display = "none";
                btnReset.style.display = "flex";
            } else {
                const isPrefsMissing = currentContext.search_preferences === null && currentContext.candidate_profile !== null;
                const isJobsMissing = !isPrefsMissing && (currentContext.unified_job_list === null || currentContext.unified_job_list.length === 0);
                const isFitmentMissing = !isPrefsMissing && !isJobsMissing && (currentContext.fitment_report === null);
                const isOutreachStage = !isPrefsMissing && !isJobsMissing && !isFitmentMissing && !isOutreachCompleted;

                btnGoToC.style.display = "none";
                btnGoToFitment.style.display = "none";
                btnGoToOutreach.style.display = "none";

                if (isPrefsMissing) {
                    btnRun.style.display = "none";
                    btnGoToC.style.display = "flex";
                    btnReset.style.display = "none";
                } else if (isJobsMissing) {
                    btnRun.style.display = "none";
                    btnGoToFitment.style.display = "flex";
                    btnReset.style.display = "none";
                } else if (isFitmentMissing) {
                    btnRun.style.display = "none";
                    btnGoToOutreach.style.display = "flex";
                    btnReset.style.display = "none";
                } else {
                    btnRun.style.display = "flex";
                    btnReset.style.display = "flex";

                    if (isOutreachStage) {
                        btnRun.innerHTML = '<i class="fa-solid fa-flag-checkered"></i> Final Orchestration';
                    } else {
                        btnRun.innerHTML = '<i class="fa-solid fa-play"></i> Run Orchestrator';
                    }
                }
            }
        }
    }
}

// Setup SVG Connection Drawing
function setupCanvas() {
    setTimeout(drawConnections, 100);
}

function drawConnections() {
    const canvas = document.querySelector(".workflow-canvas");
    const svg = document.querySelector(".workflow-svg");
    if (!canvas || !svg) return;

    const canvasRect = canvas.getBoundingClientRect();
    
    function getCenter(elId) {
        const el = document.getElementById(elId);
        if (!el) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        return {
            x: rect.left - canvasRect.left + rect.width / 2,
            y: rect.top - canvasRect.top + rect.height / 2
        };
    }

    const userPt = getCenter("node-user");
    const orchPt = getCenter("node-orchestrator");
    const profilePt = getCenter("node-profile");
    const prefPt = getCenter("node-preferences");
    const multiPt = getCenter("node-multiboard");
    const fitmentPt = getCenter("node-fitment");
    const outreachPt = getCenter("node-outreach");
    const errorPt = getCenter("node-error-state");

    // Draw user to orchestrator
    setPath("path-user-orch", userPt, orchPt);

    // Draw orchestrator to target nodes
    setPath("path-orch-profile", orchPt, profilePt);
    setPath("path-orch-preferences", orchPt, prefPt);
    setPath("path-orch-multiboard", orchPt, multiPt);
    setPath("path-orch-fitment", orchPt, fitmentPt);
    setPath("path-orch-outreach", orchPt, outreachPt);
    setPath("path-orch-error", orchPt, errorPt);
}

function setPath(pathId, start, end) {
    const path = document.getElementById(pathId);
    if (!path) return;

    // Beautiful cubic bezier curves
    const controlOffset = Math.abs(end.x - start.x) * 0.5;
    const d = `M ${start.x} ${start.y} C ${start.x + controlOffset} ${start.y}, ${end.x - controlOffset} ${end.y}, ${end.x} ${end.y}`;
    path.setAttribute("d", d);
}

// Setup Interactive Nodes click
function setupInspector() {
    document.querySelectorAll(".node").forEach(node => {
        node.addEventListener("click", () => {
            const nodeId = node.dataset.node;
            activeNode = nodeId;
            
            // Toggle highlight in UI
            document.querySelectorAll(".node").forEach(n => n.classList.remove("active"));
            node.classList.add("active");
            
            showNodeDetails(nodeId);
        });
    });
}

function showNodeDetails(nodeId) {
    const details = nodeDetails[nodeId];
    const inspector = document.getElementById("inspector-container");

    if (!details) return;

    inspector.innerHTML = `
        <div class="info-grid">
            <div class="info-item">
                <div class="info-title">Agent Name</div>
                <div class="info-value" style="font-weight: 600; color: var(--color-primary);">${details.title}</div>
            </div>
            <div class="info-item">
                <div class="info-title">Description</div>
                <div class="info-value">${details.desc}</div>
            </div>
            <div class="info-item">
                <div class="info-title">System Instructions / Prompts</div>
                <div class="info-pre">${details.prompt}</div>
            </div>
            <div class="info-item">
                <div class="info-title">State Context</div>
                <div class="info-pre">${JSON.stringify(currentContext, null, 2)}</div>
            </div>
        </div>
    `;
}

// Reset Workflow Graph visual classes
function resetWorkflowGraph() {
    document.querySelectorAll(".node").forEach(node => {
        node.classList.remove("routed", "error", "refreshing", "active");
    });
    document.querySelectorAll(".connection-path").forEach(path => {
        path.classList.remove("active");
    });
}

// Core Execution Orchestration Workflow
function executeWorkflow() {
    // Switch tab to show visual node transitions
    switchMainTab("workflow");

    // Show spinner
    const spinner = document.getElementById("processing-overlay");
    spinner.classList.add("active");
    
    // Clear terminal, set fresh start log
    const terminal = document.getElementById("terminal");
    terminal.innerHTML = "";
    
    logToTerminal("System", "Initiating Agentic Workflow Job Search Routing...");
    logToTerminal("System", "Initializing Orchestrator Client...");
    logToTerminal("Orchestrator", "Refreshing workflow connection routes and context schemas. Active.");
    
    resetWorkflowGraph();
    const orchNode = document.getElementById("node-orchestrator");
    if (orchNode) orchNode.classList.add("refreshing");

    logToTerminal("User", `Received prompt: "${currentContext.user_request}"`);

    setTimeout(() => {
        if (orchNode) {
            orchNode.classList.remove("refreshing");
            orchNode.classList.add("routed");
        }
        
        // Run Orchestrator Client-side Logic
        logToTerminal("Orchestrator", "Analyzing current state artifacts, flags, and request...");
        
        try {
            const orchestratorOutput = runOrchestrator(currentContext);
            const targetAgent = orchestratorOutput.next_agent;
            
            // Push Orchestrator Agent outcome
            pushOutcome("Orchestrator Agent", "Evaluated context rules and determined next agent routing", orchestratorOutput);

            logToTerminal("Orchestrator", `Decision complete. Routing flow to: [${targetAgent}]`);
            logToTerminal("Orchestrator", `Summary: ${orchestratorOutput.handoff_task_summary}`);
            logToTerminal("Orchestrator", `Message to User: "${orchestratorOutput.user_message}"`);
            
            // Animate transition on graph
            highlightRoutedAgent(targetAgent);

            // Populate inspector with orchestrator outputs
            showOrchestratorOutputs(orchestratorOutput);

            // Execute specialized agents if relevant
            if (targetAgent === "FITMENT_AGENT") {
                logToTerminal("System", "Preparing payloads. Transferring context to Fitment Agent...");
                setTimeout(() => {
                    executeFitmentAgent();
                    spinner.classList.remove("active");
                }, 1500);
            } else if (targetAgent === "RECOMMENDATION_OUTREACH_AGENT") {
                logToTerminal("System", "Initializing Outreach Agent...");
                logToTerminal("OutreachAgent", "Refreshing templates, channels, and copywriter weights...");
                logToTerminal("OutreachAgent", "Agent E Responsibility: Ingesting scored jobs from Agent D to rank near-suitable openings, draft recruiter pitches, and optimize profiles...");
                logToTerminal("System", "Preparing payload. Transferring context to Outreach Agent...");
                setTimeout(() => {
                    const outreachNode = document.getElementById("node-outreach");
                    if (outreachNode) {
                        outreachNode.classList.remove("refreshing");
                        outreachNode.classList.add("routed");
                    }

                    const comments = document.getElementById("editor-textarea").value.trim();
                    logToTerminal("OutreachAgent", "Analyzing fitment report data gaps & user feedback comments...");
                    logToTerminal("OutreachAgent", `Running outreach copywriter and ranking simulation with comments: "${comments || 'None'}"`);
                    logToTerminal("OutreachAgent", "Top near-suitable jobs ranked! Recruiter message drafts and profile description suggestions successfully compiled.");
                    
                    isOutreachCompleted = true; // Unlock all tabs!
                    syncTabButtonsVisibility();
                    updateEditorTextarea();

                    // Push execution outcome
                    pushOutcome("Outreach Agent", "Agent E Responsibility: Ingested the scored jobs from Agent D to recommend near-suitable jobs as a ranked list, drafts tailored outreach pitches, and optimizes profile descriptions.", {
                        outreach_comments: comments,
                        profile_tweaks: [
                            "Add 'Generative AI strategy leader' to LinkedIn headline.",
                            "Detail AWS/Kubernetes architecture experience under Senior Engineer role."
                        ],
                        outreach_drafts: [
                            {
                                company: "XYZ Corp",
                                role: "Director, AI & Digital Transformation",
                                channel: "InMail",
                                message: "Subject: Director, AI & Digital Transformation - XYZ Corp\n\nDear Recruiter,\n\nI noticed XYZ Corp is searching..."
                            }
                        ]
                    });

                    // Render beautiful outreach output
                    showOutreachResults(comments);
                    
                    spinner.classList.remove("active");
                    logToTerminal("System", "Final Orchestration complete! The workspace sandbox is now fully unlocked.");
                    switchMainTab("output");
                }, 1500);
            } else {
                if (targetAgent === "ERROR") {
                    logToTerminal("System", "Initializing Error State Agent...");
                    logToTerminal("ErrorStateAgent", "Refreshing compiler index, active routes, and debugger console...");
                } else {
                    let displayName = targetAgent.replace("_AGENT", "").replace("_AGENTS", "");
                    logToTerminal("System", `Initializing ${displayName.charAt(0) + displayName.slice(1).toLowerCase().replace(/_/g, " ")} Agent...`);
                    logToTerminal(`${displayName.replace(/\s+/g, "")}Agent`, "Refreshing local schemas and endpoints. Ready.");
                }

                setTimeout(() => {
                    const nodeId = agentNodeMap[targetAgent];
                    const nodeEl = document.getElementById(`node-${nodeId}`);
                    if (nodeEl) {
                        nodeEl.classList.remove("refreshing");
                        if (targetAgent === "ERROR") {
                            nodeEl.classList.add("error");
                        } else {
                            nodeEl.classList.add("routed");
                        }
                    }

                    spinner.classList.remove("active");
                    logToTerminal("System", `Handoff complete. Standing by for [${targetAgent}] response.`);
                    
                    // Push target agent handoff outcome
                    let displayName = targetAgent.replace("_AGENT", "").replace("_AGENTS", "");
                    pushOutcome(`${displayName.charAt(0) + displayName.slice(1).toLowerCase().replace(/_/g, " ")} Handoff`, `Handoff payload prepared successfully for ${displayName}`, orchestratorOutput.handoff_payload);
                    
                    // Switch to output tab to see handoff detail
                    switchMainTab("output");
                }, 1500);
            }

        } catch (err) {
            logToTerminal("Error", `Orchestrator execution crashed: ${err.message}`);
            spinner.classList.remove("active");
        }

    }, 1200);
}

// Highlights active lines and nodes
function highlightRoutedAgent(agentName) {
    resetWorkflowGraph();
    
    const targetNodeId = agentNodeMap[agentName];
    if (!targetNodeId) return;

    // Highlight node with refreshing first
    const nodeEl = document.getElementById(`node-${targetNodeId}`);
    if (nodeEl) {
        nodeEl.classList.add("refreshing");
    }

    // Highlight active paths
    // First, user to orchestrator is always active during run
    const userOrchPath = document.getElementById("path-user-orch");
    if (userOrchPath) userOrchPath.classList.add("active");

    // Connect orchestrator to target agent
    const targetPath = document.getElementById(`path-orch-${targetNodeId}`);
    if (targetPath) targetPath.classList.add("active");
}

// Render Orchestrator Output inside Inspector panel
function showOrchestratorOutputs(output) {
    const inspector = document.getElementById("inspector-container");
    inspector.innerHTML = `
        <div class="info-grid">
            <div class="info-item" style="border-color: var(--color-teal);">
                <div class="info-title" style="color: var(--color-teal);">Handoff Destination</div>
                <div class="info-value" style="font-weight: 700; font-size: 1.15rem; color: #ffffff;">
                    ${output.next_agent}
                </div>
            </div>
            <div class="info-item">
                <div class="info-title">Handoff Task Summary</div>
                <div class="info-value" style="font-weight: 500;">${output.handoff_task_summary}</div>
            </div>
            <div class="info-item" style="background: rgba(99, 102, 241, 0.05); border-color: rgba(99, 102, 241, 0.3);">
                <div class="info-title" style="color: var(--color-primary);">Orchestrator User Message</div>
                <div class="info-value" style="font-style: italic; line-height: 1.4;">"${output.user_message}"</div>
            </div>
            <div class="info-item">
                <div class="info-title">Complete JSON Handoff Payload</div>
                <div class="info-pre">${JSON.stringify(output, null, 2)}</div>
            </div>
        </div>
    `;
}

// Execute Fitment Agent Logic
function executeFitmentAgent() {
    logToTerminal("System", "Initializing Fitment Agent...");
    logToTerminal("FitmentAgent", "Refreshing semantic parser. Re-calibrating weight coefficients.");
    logToTerminal("FitmentAgent", "Loading matching models...");

    const fitNode = document.getElementById("node-fitment");
    if (fitNode) {
        fitNode.classList.remove("routed");
        fitNode.classList.add("refreshing");
    }

    setTimeout(() => {
        if (fitNode) {
            fitNode.classList.remove("refreshing");
            fitNode.classList.add("routed");
        }

        logToTerminal("FitmentAgent", "Starting job fitment evaluation pipeline...");
        logToTerminal("FitmentAgent", `Processing ${currentContext.unified_job_list.length} jobs against candidate profile (${currentContext.candidate_profile.seniority})...`);

        try {
            const fitmentInput = {
                candidate_profile: currentContext.candidate_profile,
                skills_file_v1: currentContext.skills_file_v1,
                job_list: currentContext.unified_job_list,
                preferences: currentContext.search_preferences
            };

            const result = runFitmentAgent(fitmentInput);

            if (result.error) {
                logToTerminal("Error", `Fitment Agent failed: ${result.error.message}`);
                logToTerminal("Error", `Suggested Fix: ${result.error.suggested_fix}`);
                return;
            }

            currentFitmentReport = result.fitment_report;
            // Inject into current state
            currentContext.fitment_report = currentFitmentReport;
            
            logToTerminal("FitmentAgent", "Scoring and evaluation successfully completed!");
            logToTerminal("FitmentAgent", `Matches found: High [${currentFitmentReport.summary.high_fit_count}], Medium [${currentFitmentReport.summary.medium_fit_count}], Low [${currentFitmentReport.summary.low_fit_count}]`);
            
            // Show fitment view
            showFitmentReport(currentFitmentReport);
            
            // Push Fitment Agent outcome
            pushOutcome("Fitment Agent", "Agent D Responsibility: Evaluated candidate credentials against each job to compute fit scores (0-100), summarized alignment strengths/gaps, and passed these scores to Agent E.", currentFitmentReport);

            // Switch to output tab
            switchMainTab("output");
        } catch (err) {
            logToTerminal("Error", `Fitment Agent crashed during calculation: ${err.message}`);
        }
    }, 1000);
}

// Render Raw Search Results in a Dashboard manner inside Output Inspector
function showSearchResultsDashboard(jobs) {
    const inspector = document.getElementById("inspector-container");
    if (!inspector) return;

    let cardsHTML = "";
    jobs.forEach(job => {
        const sourceBadges = (job.sources || []).map(src => 
            `<span style="background: rgba(20, 184, 166, 0.1); color: var(--color-teal); font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600; text-transform: uppercase;">${src}</span>`
        ).join(" ");

        cardsHTML += `
            <div class="job-card" style="cursor: default; padding: 1rem; border-color: rgba(255,255,255,0.05); gap: 0.75rem;">
                <div style="width: 40px; height: 40px; border-radius: 8px; background: rgba(99, 102, 241, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 1.1rem; flex-shrink: 0;">
                    <i class="fa-solid fa-briefcase"></i>
                </div>
                <div style="flex: 1; overflow: hidden;">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.5rem;">
                        <h4 style="font-size: 0.9rem; font-weight: 700; color: #ffffff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${job.title}</h4>
                        <span style="font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--color-text-muted); text-transform: uppercase;">${job.work_mode}</span>
                    </div>
                    <div style="font-size: 0.75rem; color: var(--color-primary-glow); font-weight: 500; margin-top: 0.15rem;">${job.company}</div>
                    <div style="font-size: 0.7rem; color: var(--color-text-dark); margin-top: 0.15rem;">${job.location} • ${job.employment_type}</div>
                    <p style="font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.4; margin-top: 0.5rem; margin-bottom: 0.5rem;">
                        ${job.requirements}
                    </p>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center; border-top: 1px solid rgba(255,255,255,0.03); padding-top: 0.5rem; margin-top: 0.5rem;">
                        <span style="font-size: 0.65rem; color: var(--color-text-dark); font-weight: 600;">SOURCES:</span>
                        ${sourceBadges}
                    </div>
                </div>
            </div>
        `;
    });

    inspector.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%;">
            <div style="display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.8rem;">
                <div style="width: 44px; height: 44px; border-radius: 10px; background: rgba(20, 184, 166, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-teal); font-size: 1.25rem;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <div>
                    <h3 style="font-family: var(--font-display); font-size: 0.95rem; font-weight: 700; color: #ffffff; margin: 0;">
                        Aggregated Job Search Dashboard (Agent C Output)
                    </h3>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">
                        Deduplicated matching listings from job boards and company directories
                    </div>
                </div>
            </div>

            <div class="job-list-container" style="flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 0.75rem;">
                ${cardsHTML}
            </div>
        </div>
    `;
}

// Render Fitment Report Visual Layout
function showFitmentReport(report) {
    const inspector = document.getElementById("inspector-container");
    
    let jobCardsHTML = "";
    report.jobs.forEach((job, idx) => {
        const bandClass = job.fit_band.toLowerCase();
        // Calculate SVG dashoffset based on 100 max stroke-dasharray of 125.6 (circumference of circle r=20 is 2*pi*20 = 125.6)
        const radius = 20;
        const circ = 2 * Math.PI * radius;
        const offset = circ - (job.fit_score / 100) * circ;

        jobCardsHTML += `
            <div class="job-card" onclick="selectJobDetail(${idx})">
                <div class="progress-gauge ${bandClass}">
                    <svg width="50" height="50">
                        <circle class="gauge-bg" cx="25" cy="25" r="${radius}"></circle>
                        <circle class="gauge-fg" cx="25" cy="25" r="${radius}" 
                                stroke-dasharray="${circ}" 
                                stroke-dashoffset="${offset}"></circle>
                    </svg>
                    <span class="gauge-val">${job.fit_score}%</span>
                </div>
                <div class="job-meta">
                    <div class="job-title">${job.title}</div>
                    <div class="job-company">${job.company}</div>
                    <div class="job-location-mode">${job.location} • ${job.fit_band} Fit</div>
                </div>
            </div>
        `;
    });

    inspector.innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 1rem; height: 100%;">
            <h3 style="font-family: var(--font-display); font-size: 1rem; font-weight: 600; color: #ffffff;">
                Fitment Analytics Report
            </h3>
            
            <div class="fitment-summary-box">
                <div class="summary-stat">
                    <div class="summary-num high">${report.summary.high_fit_count}</div>
                    <div class="summary-lbl">High Fit</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-num medium">${report.summary.medium_fit_count}</div>
                    <div class="summary-lbl">Med Fit</div>
                </div>
                <div class="summary-stat">
                    <div class="summary-num low">${report.summary.low_fit_count}</div>
                    <div class="summary-lbl">Low Fit</div>
                </div>
            </div>

            <div class="info-item" style="padding: 0.6rem; font-size: 0.8rem; background: rgba(255,255,255,0.01);">
                <div class="info-title">Overall Observations</div>
                <ul style="padding-left: 1.1rem; margin-top: 0.25rem; display: flex; flex-direction: column; gap: 0.25rem;">
                    ${report.summary.overall_observations.map(obs => `<li>${obs}</li>`).join('')}
                </ul>
            </div>

            <div class="job-list-container">
                ${jobCardsHTML}
            </div>
        </div>
    `;
}

// Select specific Job to show details
window.selectJobDetail = function(idx) {
    if (!currentFitmentReport || !currentFitmentReport.jobs[idx]) return;
    const job = currentFitmentReport.jobs[idx];
    const inspector = document.getElementById("inspector-container");

    const radius = 20;
    const circ = 2 * Math.PI * radius;
    const offset = circ - (job.fit_score / 100) * circ;
    const bandClass = job.fit_band.toLowerCase();

    inspector.innerHTML = `
        <div class="job-detail-drawer">
            <button class="back-to-list" onclick="goBackToJobList()">< Back to Matches</button>
            
            <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.8rem;">
                <div class="progress-gauge ${bandClass}">
                    <svg width="50" height="50">
                        <circle class="gauge-bg" cx="25" cy="25" r="${radius}"></circle>
                        <circle class="gauge-fg" cx="25" cy="25" r="${radius}" 
                                stroke-dasharray="${circ}" 
                                stroke-dashoffset="${offset}"></circle>
                    </svg>
                    <span class="gauge-val">${job.fit_score}%</span>
                </div>
                <div>
                    <h3 style="font-size: 1rem; font-weight: 600; color: #ffffff; line-height: 1.2;">${job.title}</h3>
                    <div style="font-size: 0.8rem; color: var(--color-text-muted);">${job.company}</div>
                    <div style="font-size: 0.75rem; color: var(--color-text-dark); margin-top: 0.15rem;">${job.location} • Sources: ${job.sources.join(', ')}</div>
                </div>
            </div>

            <div>
                <div class="detail-section-title">Key Strengths</div>
                <ul class="strength-gap-list strength-list" style="margin-top: 0.3rem;">
                    ${job.key_strengths.map(str => `<li>${str}</li>`).join('')}
                </ul>
            </div>

            <div style="margin-top: 0.5rem;">
                <div class="detail-section-title">Identified Gaps</div>
                <ul class="strength-gap-list gap-list" style="margin-top: 0.3rem;">
                    ${job.key_gaps.map(gap => `<li>${gap}</li>`).join('')}
                </ul>
            </div>
            
            <div style="margin-top: 0.5rem;">
                <div class="detail-section-title">Metadata</div>
                <div style="font-size: 0.75rem; color: var(--color-text-muted); line-height: 1.4; background: rgba(0,0,0,0.2); padding: 0.5rem; border-radius: 6px;">
                    <strong>Fit Band:</strong> ${job.fit_band}<br/>
                    <strong>Aligned Seniority:</strong> ${job.title.includes("Director") ? "Director" : "Senior/Manager"}
                </div>
            </div>
        </div>
    `;
};

window.goBackToJobList = function() {
    if (currentFitmentReport) {
        showFitmentReport(currentFitmentReport);
    }
};

// Console Log Helper
function logToTerminal(source, text) {
    const terminal = document.getElementById("terminal");
    if (!terminal) return;

    const line = document.createElement("div");
    line.className = "log-line";

    const timestamp = new Date().toLocaleTimeString();
    
    let sourceClass = "source-system";
    if (source.toLowerCase() === "orchestrator") sourceClass = "source-orchestrator";
    else if (source.toLowerCase() === "fitmentagent") sourceClass = "source-fitment";
    else if (source.toLowerCase() === "error") sourceClass = "source-error";

    line.innerHTML = `
        <span class="log-time">[${timestamp}]</span>
        <span class="log-source ${sourceClass}">[${source}]</span>
        <span class="log-text">${text}</span>
    `;

    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
}

// Resume Ingestion Module
function setupResumeIngestion() {
    const uploadZone = document.getElementById("upload-zone");
    const fileInput = document.getElementById("resume-file-input");
    const textInput = document.getElementById("resume-text-input");
    const ingestBtn = document.getElementById("btn-ingest-resume");
    const statusText = document.getElementById("upload-status");

    if (!uploadZone || !fileInput || !ingestBtn) return;

    // Click to browse
    uploadZone.addEventListener("click", () => {
        fileInput.click();
    });

    // File selected
    fileInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (file) {
            handleSelectedFile(file);
        }
    });

    // Drag and drop event handlers
    ["dragenter", "dragover"].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.classList.remove("dragover");
        }, false);
    });

    uploadZone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        if (file) {
            handleSelectedFile(file);
        }
    }, false);

    function handleSelectedFile(file) {
        statusText.innerText = `Selected: ${file.name}`;
        statusText.style.color = "var(--color-teal)";

        const reader = new FileReader();

        const isTextFile = file.name.endsWith(".txt");
        if (isTextFile) {
            reader.onload = function(e) {
                textInput.value = e.target.result;
                logToTerminal("System", `Loaded text content from file: ${file.name}`);
            };
            reader.readAsText(file);
        } else {
            // Simulated extraction for binary files
            logToTerminal("System", `Initiating text extraction service for PDF/Word binary file: ${file.name}`);
            
            // Generate content based on file name hints
            let parsedText = `[Extracted from: ${file.name}]\n`;
            const nameLower = file.name.toLowerCase();
            if (nameLower.includes("product") || nameLower.includes("pm")) {
                parsedText += "Lead Product Manager with 8+ years experience. Expert in Product Strategy, Roadmapping, Agile/Scrum, and Team Leadership.";
            } else if (nameLower.includes("director") || nameLower.includes("vp") || nameLower.includes("head")) {
                parsedText += "Director of AI Systems & Change Management. Expert in Generative AI strategy, Enterprise Integration, P&L management, and Team Leadership.";
            } else {
                parsedText += "Senior AI Engineer & Architect with 10+ years experience. Specializing in Generative AI strategy, Machine Learning, Python, and Cloud Architecture.";
            }
            
            setTimeout(() => {
                textInput.value = parsedText;
                statusText.innerText = `Extracted text from: ${file.name}`;
                logToTerminal("System", `Text extraction finished for: ${file.name}`);
            }, 600);
        }
    }

    // Trigger ingestion when button is clicked
    ingestBtn.addEventListener("click", () => {
        const text = textInput.value.trim();
        if (!text) {
            logToTerminal("Error", "Resume ingestion failed: No text provided. Paste a resume or drag a file first.");
            alert("Please paste resume text or upload a file first!");
            return;
        }
        runMockProfileAgent(text);
    });
}

function runMockProfileAgent(text) {
    logToTerminal("System", "Initializing Profile Agent...");
    logToTerminal("ProfileAgent", "Refreshing local endpoints. Handshake successful.");
    logToTerminal("ProfileAgent", "Loading candidate context payloads...");
    
    // Highlight Profile Node with refreshing state
    resetWorkflowGraph();
    const nodeEl = document.getElementById("node-profile");
    if (nodeEl) nodeEl.classList.add("refreshing");
    
    const userOrchPath = document.getElementById("path-user-orch");
    if (userOrchPath) userOrchPath.classList.add("active");
    const orchProfilePath = document.getElementById("path-orch-profile");
    if (orchProfilePath) orchProfilePath.classList.add("active");

    setTimeout(() => {
        if (nodeEl) {
            nodeEl.classList.remove("refreshing");
            nodeEl.classList.add("routed");
        }
        logToTerminal("ProfileAgent", "Agent A Responsibility: Ingesting and summarizing points from the attached resume (experience, seniority, skills) to prepare handoff profile for Agent B...");
        const textLower = text.toLowerCase();

        // Determine seniority
        let seniority = "Senior";
        if (textLower.includes("c-level") || textLower.includes("cxo") || textLower.includes("chief") || textLower.includes("executive") || textLower.includes("vp")) {
            seniority = "VP";
        } else if (textLower.includes("director") || textLower.includes("head")) {
            seniority = "Director";
        } else if (textLower.includes("manager") || textLower.includes("principal")) {
            seniority = "Manager";
        } else if (textLower.includes("lead") || textLower.includes("senior developer") || textLower.includes("sr")) {
            seniority = "Senior";
        } else if (textLower.includes("junior") || textLower.includes("associate") || textLower.includes("entry")) {
            seniority = "Junior";
        }

        // Identify skills
        const possibleSkills = [
            { name: "Generative AI strategy", keywords: ["generative ai", "genai", "llm", "large language model", "gpt", "rag"], category: "AI", level: "Expert", years: 4, priority: "High" },
            { name: "Machine Learning", keywords: ["machine learning", "pytorch", "tensorflow", "deep learning", "nlp", "models"], category: "AI", level: "Expert", years: 6, priority: "High" },
            { name: "Cloud Architecture", keywords: ["cloud", "aws", "azure", "gcp", "devops", "kubernetes"], category: "Engineering", level: "Advanced", years: 5, priority: "High" },
            { name: "Web Engineering", keywords: ["react", "javascript", "node", "typescript", "frontend", "html", "css"], category: "Engineering", level: "Advanced", years: 6, priority: "Medium" },
            { name: "Product Strategy", keywords: ["product strategy", "roadmap", "product manager", "scrum", "agile"], category: "Product", level: "Advanced", years: 5, priority: "Medium" },
            { name: "Team Leadership", keywords: ["team lead", "leadership", "management", "people manager", "mentoring"], category: "Management", level: "Expert", years: 5, priority: "High" },
            { name: "Change Management", keywords: ["change management", "transformation", "operations", "strategy"], category: "Management", level: "Advanced", years: 4, priority: "Medium" }
        ];

        const detectedSkills = [];
        possibleSkills.forEach(s => {
            const matches = s.keywords.some(kw => textLower.includes(kw));
            if (matches) {
                detectedSkills.push({
                    skill_name: s.name,
                    category: s.category,
                    proficiency_level: s.level,
                    years_experience: s.years,
                    priority: s.priority
                });
            }
        });

        // Default skills if none matched
        if (detectedSkills.length === 0) {
            detectedSkills.push(
                { skill_name: "Software Engineering", category: "Engineering", proficiency_level: "Advanced", years_experience: 5, priority: "High" },
                { skill_name: "System Design", category: "Engineering", proficiency_level: "Advanced", years_experience: 4, priority: "Medium" }
            );
        }

        // Build profile
        const summaryHeader = text.split("\n").filter(l=>l.trim()).slice(0, 2).join(" ");
        const cleanSummaryHeader = summaryHeader.length > 120 ? summaryHeader.substring(0, 120) + "..." : summaryHeader;
        const parsedProfile = {
            summary: `${cleanSummaryHeader} Parsed by Profile Agent.`,
            experience: "Extracted work experience and roles history.",
            industries: ["Technology", textLower.includes("fintech") ? "Fintech" : "Software Systems"],
            seniority: seniority
        };

        const parsedSkillsFile = {
            skills: detectedSkills
        };

        // Update global state
        currentContext.candidate_profile = parsedProfile;
        currentContext.skills_file_v1 = parsedSkillsFile;
        currentContext.fitment_report = null; // Clear previous fitment matching
        currentFitmentReport = null;

        // Push execution to outcomes history
        pushOutcome("Profile Agent", "Agent A Responsibility: Ingested and summarized points from the attached resume (seniority, skills) to prepare handoff profile for Agent B.", {
            candidate_profile: currentContext.candidate_profile,
            skills_file_v1: currentContext.skills_file_v1
        });

        // Log updates
        logToTerminal("ProfileAgent", `Parsing Complete! Seniority Level: [${seniority}]`);
        logToTerminal("ProfileAgent", `Extracted ${detectedSkills.length} skills: ${detectedSkills.map(d => d.skill_name).join(", ")}`);
        logToTerminal("ProfileAgent", "Summarization finished. Passing summarized candidate profile context payload to Agent B...");
        logToTerminal("System", "Candidate profile and skills_file_v1 updated in current session context. Switching focus to Agent B.");

        // Sync tab view to show preferences
        activeTab = "search_preferences";
        syncTabButtonsVisibility();
        updateEditorTextarea();

        // Show output inside inspector prompting preferences
        const inspector = document.getElementById("inspector-container");
        inspector.innerHTML = `
            <div class="info-grid">
                <div class="info-item" style="border-color: var(--color-teal); background: rgba(20, 184, 166, 0.02);">
                    <div class="info-title" style="color: var(--color-teal);">PROFILE INGESTION COMPLETE</div>
                    <div class="info-value" style="font-weight: 700; color: #ffffff;">Profile & Skills Extracted Successfully</div>
                </div>
                
                <div class="info-item" style="border-color: var(--color-primary); background: rgba(99, 102, 241, 0.03); padding: 1.25rem;">
                    <div class="info-title" style="color: var(--color-primary); font-weight: 600; font-size: 0.9rem;">
                        <i class="fa-solid fa-sliders"></i> NEXT STEP: CONFIGURE PREFERENCES
                    </div>
                    <p style="font-size: 0.85rem; line-height: 1.4; margin-top: 0.5rem; color: var(--color-text-main);">
                        Your Candidate Profile and Skills List have been created. 
                        <br/><br/>
                        <strong>Please review and configure your preferences on the left:</strong>
                        <ul style="margin-left: 1.2rem; margin-top: 0.4rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.25rem; color: var(--color-text-muted);">
                            <li>Type preferred locations (e.g. Remote, Mumbai)</li>
                            <li>Select desired work modes (Remote, Hybrid, On-site)</li>
                            <li>Select target employment configurations (Full-time, Contract)</li>
                        </ul>
                        <br/>
                        Once completed, click <strong>Run Orchestrator</strong> to search job boards and align matching listings.
                    </p>
                </div>
            </div>
        `;

        setTimeout(() => {
            resetWorkflowGraph();
            logToTerminal("System", "Standing by. You can now configure Search Preferences or Run Orchestrator.");
        }, 3000);
    }, 1500);
}

// Setup Preferences Form change binding
function setupPreferencesForm() {
    const form = document.getElementById("preferences-form");
    const titlesInput = document.getElementById("pref-titles-input");
    const locInput = document.getElementById("pref-locations-input");
    const includeInput = document.getElementById("pref-keywords-include");
    const excludeInput = document.getElementById("pref-keywords-exclude");
    const currencySelect = document.getElementById("pref-salary-currency");
    const minInput = document.getElementById("pref-salary-min");
    const maxInput = document.getElementById("pref-salary-max");
    const freqSelect = document.getElementById("pref-salary-frequency");
    
    if (!form) return;

    window.syncPreferencesFromForm = updatePrefsFromUI;

    function updatePrefsFromUI() {
        if (!currentContext.search_preferences) {
            currentContext.search_preferences = {
                target_titles: [],
                locations: [],
                work_mode: [],
                employment_type: [],
                keywords_include: [],
                keywords_exclude: [],
                salary_range: {
                    currency: "AED",
                    min: null,
                    max: null,
                    frequency: "Monthly"
                }
            };
        }

        // Target titles
        const titlesVal = titlesInput ? titlesInput.value.trim() : "";
        currentContext.search_preferences.target_titles = titlesVal ? titlesVal.split(",").map(t => t.trim()).filter(t => t) : [];

        // Locations
        const locVal = locInput ? locInput.value.trim() : "";
        currentContext.search_preferences.locations = locVal ? locVal.split(",").map(l => l.trim()).filter(l => l) : [];

        // Keywords Include (must-have)
        const incVal = includeInput ? includeInput.value.trim() : "";
        currentContext.search_preferences.keywords_include = incVal ? incVal.split(",").map(k => k.trim()).filter(k => k) : [];

        // Keywords Exclude (exclude)
        const excVal = excludeInput ? excludeInput.value.trim() : "";
        currentContext.search_preferences.keywords_exclude = excVal ? excVal.split(",").map(k => k.trim()).filter(k => k) : [];

        // Work modes
        const modes = [];
        document.querySelectorAll(".pref-mode-check:checked").forEach(cb => {
            modes.push(cb.value);
        });
        currentContext.search_preferences.work_mode = modes;

        // Employment types
        const types = [];
        document.querySelectorAll(".pref-type-check:checked").forEach(cb => {
            types.push(cb.value);
        });
        currentContext.search_preferences.employment_type = types;

        // Salary expectations
        const minVal = minInput && minInput.value ? parseFloat(minInput.value) : null;
        const maxVal = maxInput && maxInput.value ? parseFloat(maxInput.value) : null;
        currentContext.search_preferences.salary_range = {
            currency: currencySelect ? currencySelect.value : "AED",
            min: minVal,
            max: maxVal,
            frequency: freqSelect ? freqSelect.value : "Monthly"
        };

        // If completely empty, null out preferences to simulate empty state
        if (currentContext.search_preferences.locations.length === 0 && 
            currentContext.search_preferences.target_titles.length === 0 && 
            currentContext.search_preferences.work_mode.length === 0 && 
            currentContext.search_preferences.employment_type.length === 0 &&
            currentContext.search_preferences.keywords_include.length === 0 &&
            currentContext.search_preferences.keywords_exclude.length === 0 &&
            currentContext.search_preferences.salary_range.min === null &&
            currentContext.search_preferences.salary_range.max === null) {
            currentContext.search_preferences = null;
        }
    }

    // Attach listeners
    const fields = [titlesInput, locInput, includeInput, excludeInput, minInput, maxInput, currencySelect, freqSelect];
    fields.forEach(el => {
        if (el) el.addEventListener("input", updatePrefsFromUI);
        if (el && el.tagName === "SELECT") el.addEventListener("change", updatePrefsFromUI);
    });

    document.querySelectorAll(".pref-mode-check").forEach(cb => {
        cb.addEventListener("change", updatePrefsFromUI);
    });
    document.querySelectorAll(".pref-type-check").forEach(cb => {
        cb.addEventListener("change", updatePrefsFromUI);
    });
}

// Switch Main Layout Tabs
function switchMainTab(tabId) {
    document.querySelectorAll(".main-tab-btn").forEach(btn => {
        btn.classList.remove("active");
        if (btn.dataset.mainTab === tabId) {
            btn.classList.add("active");
        }
    });

    document.querySelectorAll(".tab-panel").forEach(panel => {
        panel.classList.remove("active");
        panel.style.display = "none";
    });

    const targetPanel = document.getElementById(`panel-${tabId}`);
    if (targetPanel) {
        targetPanel.classList.add("active");
        if (tabId === "workspace") {
            targetPanel.style.display = "grid";
        } else {
            targetPanel.style.display = "flex";
        }
    }

    // Recalculate SVG graph lines since they need to load with visible dimensions
    if (tabId === "workflow") {
        setTimeout(drawConnections, 80);
    } else if (tabId === "summary") {
        renderSummaryDashboard();
    }
}

function setupMainTabLayout() {
    document.querySelectorAll(".main-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            switchMainTab(btn.dataset.mainTab);
        });
    });
}

// Log execution result to outcomes tab history
function pushOutcome(agentName, description, outputData) {
    const timestamp = new Date().toLocaleTimeString();
    
    // Detect badge class based on agent name
    let badgeClass = "success";
    const n = agentName.toLowerCase();
    if (n.includes("orchestrator")) badgeClass = "orchestrator";
    else if (n.includes("fitment")) badgeClass = "fitment";
    else if (n.includes("profile")) badgeClass = "profile";
    else if (n.includes("outreach")) badgeClass = "outreach";
    else if (n.includes("search")) badgeClass = "search";
    else if (n.includes("error")) badgeClass = "error";

    const outcome = {
        agentName,
        description,
        timestamp,
        badgeClass,
        data: JSON.parse(JSON.stringify(outputData)) // deep clone to preserve snapshot
    };

    executedOutcomes.push(outcome);
    renderOutcomesList();
}

function renderOutcomesList() {
    const container = document.getElementById("outcomes-list");
    if (!container) return;

    if (executedOutcomes.length === 0) {
        container.innerHTML = `
            <div class="outcome-empty-state" style="font-size: 0.8rem; color: var(--color-text-muted); text-align: center; margin-top: 2rem;">
                No agent executions recorded yet.
            </div>
        `;
        return;
    }

    container.innerHTML = "";
    executedOutcomes.forEach((outcome, index) => {
        const item = document.createElement("div");
        item.className = "outcome-item";
        item.dataset.index = index;
        item.innerHTML = `
            <div class="outcome-item-header">
                <span class="outcome-item-title">${outcome.agentName}</span>
                <span class="outcome-item-time">${outcome.timestamp}</span>
            </div>
            <div class="outcome-item-desc">${outcome.description}</div>
            <span class="outcome-badge ${outcome.badgeClass}">${outcome.agentName.toUpperCase()}</span>
        `;

        item.addEventListener("click", () => {
            document.querySelectorAll(".outcome-item").forEach(el => el.classList.remove("active"));
            item.classList.add("active");
            showOutcomeDetails(index);
        });

        container.appendChild(item);
    });
}

function showOutcomeDetails(index) {
    const container = document.getElementById("outcome-details-container");
    if (!container) return;

    const outcome = executedOutcomes[index];
    if (!outcome) return;

    let specificHTML = "";

    const n = outcome.agentName.toLowerCase();
    if (n.includes("orchestrator") || n.includes("error")) {
        specificHTML = `
            <div class="info-grid" style="margin-top: 0;">
                <div class="info-item" style="border-color: var(--color-teal); background: rgba(20, 184, 166, 0.02);">
                    <div class="info-title" style="color: var(--color-teal);">Handoff Destination</div>
                    <div class="info-value" style="font-weight: 700; font-size: 1.15rem; color: #ffffff;">
                        ${outcome.data.next_agent}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-title">Handoff Task Summary</div>
                    <div class="info-value" style="font-weight: 500; line-height: 1.4;">${outcome.data.handoff_task_summary}</div>
                </div>
                <div class="info-item" style="background: rgba(99, 102, 241, 0.05); border-color: rgba(99, 102, 241, 0.3);">
                    <div class="info-title" style="color: var(--color-primary);">Orchestrator User Message</div>
                    <div class="info-value" style="font-style: italic; line-height: 1.4; color: #ffffff;">"${outcome.data.user_message}"</div>
                </div>
            </div>
        `;
    } else if (n.includes("profile")) {
        const prof = outcome.data.candidate_profile || {};
        const skills = outcome.data.skills_file_v1?.skills || [];
        specificHTML = `
            <div class="info-grid" style="margin-top: 0;">
                <div class="info-item" style="border-color: #a855f7; background: rgba(168, 85, 247, 0.02);">
                    <div class="info-title" style="color: #c084fc;">EXTRACTED PROFILE SUMMARY</div>
                    <div class="info-value" style="color: #ffffff; line-height: 1.4; font-size: 0.9rem;">
                        ${prof.summary || "No summary available"}
                    </div>
                </div>
                <div class="info-item" style="display: flex; flex-direction: row; gap: 2rem;">
                    <div style="flex: 1;">
                        <div class="info-title">Seniority Level</div>
                        <div class="info-value" style="font-weight: 700; color: var(--color-primary); font-size: 1.1rem; margin-top: 0.2rem;">
                            ${prof.seniority || "Not specified"}
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <div class="info-title">Years of Experience</div>
                        <div class="info-value" style="font-weight: 700; color: var(--color-teal); font-size: 1.1rem; margin-top: 0.2rem;">
                            ${prof.experience || "Not specified"}
                        </div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-title">Extracted Skills Checklist (${skills.length} skills)</div>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 0.5rem; margin-top: 0.5rem;">
                        ${skills.map(s => `
                            <div style="background: rgba(255,255,255,0.03); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.4rem; font-size: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                                <span style="color: #ffffff; font-weight: 500;">${s.skill_name}</span>
                                <span style="font-size: 0.65rem; color: var(--color-teal); font-weight: 600;">${s.proficiency_level}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    } else if (n.includes("fitment")) {
        const summary = outcome.data.summary || {};
        const jobs = outcome.data.jobs || [];
        specificHTML = `
            <div style="display: flex; gap: 1rem; margin-bottom: 1rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 140px; background: rgba(20, 184, 166, 0.05); border: 1px solid rgba(20, 184, 166, 0.2); border-radius: 8px; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.75rem; color: var(--color-teal); font-weight: 600;">HIGH FIT MATCHES</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: #ffffff; margin-top: 0.25rem;">${summary.high_fit_count}</div>
                </div>
                <div style="flex: 1; min-width: 140px; background: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.2); border-radius: 8px; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.75rem; color: #f59e0b; font-weight: 600;">MEDIUM FIT MATCHES</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: #ffffff; margin-top: 0.25rem;">${summary.medium_fit_count}</div>
                </div>
                <div style="flex: 1; min-width: 140px; background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 8px; padding: 1rem; text-align: center;">
                    <div style="font-size: 0.75rem; color: #ef4444; font-weight: 600;">LOW FIT MATCHES</div>
                    <div style="font-size: 2.2rem; font-weight: 800; color: #ffffff; margin-top: 0.25rem;">${summary.low_fit_count}</div>
                </div>
            </div>
            
            <div class="info-item" style="margin-bottom: 1rem;">
                <div class="info-title">System Observations</div>
                <ul style="margin-left: 1.2rem; margin-top: 0.4rem; font-size: 0.8rem; display: flex; flex-direction: column; gap: 0.35rem; color: var(--color-text-main); line-height: 1.4;">
                    ${(summary.overall_observations || []).map(obs => `<li>${obs}</li>`).join('')}
                </ul>
            </div>

            <div style="font-size: 0.85rem; font-weight: 600; color: #ffffff; margin-bottom: 0.5rem;">Aggregated Job Scoring Breakdowns</div>
            <div style="display: flex; flex-direction: column; gap: 0.6rem;">
                ${jobs.map(j => `
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 0.75rem; display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">${j.title}</div>
                            <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.15rem;">${j.company} &bull; ${j.location}</div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 0.75rem;">
                            <span style="font-size: 0.7rem; font-weight: 600; padding: 0.15rem 0.4rem; border-radius: 4px; background: ${j.fit_band === 'High' ? 'rgba(20,184,166,0.1)' : j.fit_band === 'Medium' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)'}; color: ${j.fit_band === 'High' ? 'var(--color-teal)' : j.fit_band === 'Medium' ? '#f59e0b' : '#ef4444'}">${j.fit_band.toUpperCase()}</span>
                            <span style="font-size: 1.15rem; font-weight: 800; color: var(--color-primary-glow);">${j.fit_score}%</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    } else if (n.includes("preference")) {
        const prefs = outcome.data.search_preferences || {};
        const roles = prefs.target_titles || [];
        const locs = prefs.locations || [];
        const modes = prefs.work_mode || [];
        const types = prefs.employment_type || [];
        const sal = prefs.salary_range || {};
        
        specificHTML = `
            <div class="info-grid" style="margin-top: 0;">
                <div class="info-item" style="border-color: var(--color-primary); background: rgba(99, 102, 241, 0.02);">
                    <div class="info-title" style="color: var(--color-primary-glow); font-weight: 600;">TARGET ROLES</div>
                    <div class="info-value" style="color: #ffffff; font-weight: 700; font-size: 1rem;">
                        ${roles.length > 0 ? roles.join(", ") : "Any role"}
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-title">Preferred Locations</div>
                    <div class="info-value" style="color: #ffffff;">
                        ${locs.length > 0 ? locs.join(", ") : "Any location"}
                    </div>
                </div>
                <div class="info-item" style="display: flex; flex-direction: row; gap: 2rem;">
                    <div style="flex: 1;">
                        <div class="info-title">Work Modes</div>
                        <div class="info-value" style="font-weight: 600; color: var(--color-teal); font-size: 0.85rem; margin-top: 0.2rem;">
                            ${modes.length > 0 ? modes.join(", ") : "Any mode"}
                        </div>
                    </div>
                    <div style="flex: 1;">
                        <div class="info-title">Employment Types</div>
                        <div class="info-value" style="font-weight: 600; color: var(--color-teal); font-size: 0.85rem; margin-top: 0.2rem;">
                            ${types.length > 0 ? types.join(", ") : "Any type"}
                        </div>
                    </div>
                </div>
                <div class="info-item">
                    <div class="info-title">Salary Expectations</div>
                    <div class="info-value" style="font-weight: 700; color: #ffffff; font-size: 1.1rem; margin-top: 0.2rem;">
                        ${sal.currency || "AED"} ${sal.min !== null ? sal.min.toLocaleString() : "0"} - ${sal.max !== null ? sal.max.toLocaleString() : "Any"} <span style="font-size: 0.8rem; font-weight: 500; color: var(--color-text-muted);">(${sal.frequency || "Monthly"})</span>
                    </div>
                </div>
            </div>
        `;
    } else if ((n === "search agents" || n === "search agent" || n === "multiboard search agents") && outcome.data?.unified_job_list) {
        const jobs = outcome.data.unified_job_list || [];
        
        let cardsHTML = "";
        jobs.forEach(job => {
            const sourceBadges = (job.sources || []).map(src => 
                `<span style="background: rgba(20, 184, 166, 0.1); color: var(--color-teal); font-size: 0.6rem; padding: 0.1rem 0.3rem; border-radius: 4px; font-weight: 600; text-transform: uppercase;">${src}</span>`
            ).join(" ");

            cardsHTML += `
                <div class="job-card" style="cursor: default; padding: 0.75rem; border-color: rgba(255,255,255,0.04); gap: 0.6rem; margin-bottom: 0.5rem; background: rgba(255,255,255,0.01);">
                    <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(99, 102, 241, 0.08); display: flex; align-items: center; justify-content: center; color: var(--color-primary); font-size: 0.95rem; flex-shrink: 0;">
                        <i class="fa-solid fa-briefcase"></i>
                    </div>
                    <div style="flex: 1; overflow: hidden;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 0.4rem;">
                            <h4 style="font-size: 0.8rem; font-weight: 700; color: #ffffff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${job.title}</h4>
                            <span style="font-size: 0.6rem; font-weight: 600; padding: 0.1rem 0.3rem; border-radius: 4px; background: rgba(255,255,255,0.05); color: var(--color-text-muted); text-transform: uppercase;">${job.work_mode}</span>
                        </div>
                        <div style="font-size: 0.7rem; color: var(--color-primary-glow); font-weight: 500; margin-top: 0.1rem;">${job.company}</div>
                        <div style="font-size: 0.65rem; color: var(--color-text-dark); margin-top: 0.1rem;">${job.location} • ${job.employment_type}</div>
                        <p style="font-size: 0.7rem; color: var(--color-text-muted); line-height: 1.35; margin-top: 0.4rem; margin-bottom: 0.4rem;">
                            ${job.requirements}
                        </p>
                        <div style="display: flex; flex-wrap: wrap; gap: 0.3rem; align-items: center; border-top: 1px solid rgba(255,255,255,0.02); padding-top: 0.4rem; margin-top: 0.4rem;">
                            <span style="font-size: 0.6rem; color: var(--color-text-dark); font-weight: 600;">SOURCES:</span>
                            ${sourceBadges}
                        </div>
                    </div>
                </div>
            `;
        });

        specificHTML = `
            <div class="info-item" style="border-color: var(--color-teal); background: rgba(20, 184, 166, 0.02); margin-bottom: 1rem; display: flex; align-items: center; gap: 0.6rem; padding: 0.6rem;">
                <div style="width: 32px; height: 32px; border-radius: 6px; background: rgba(20, 184, 166, 0.1); display: flex; align-items: center; justify-content: center; color: var(--color-teal); font-size: 1rem;">
                    <i class="fa-solid fa-magnifying-glass"></i>
                </div>
                <div>
                    <div class="info-title" style="color: var(--color-teal); margin-bottom: 0;">Aggregated Search Results (Agent C Outcome)</div>
                    <div style="font-size: 0.95rem; font-weight: 700; color: #ffffff;">Parsed ${jobs.length} matching job listings from job portals</div>
                </div>
            </div>
            
            <div style="display: flex; flex-direction: column; overflow-y: auto; max-height: 380px; padding-right: 0.25rem;">
                ${cardsHTML || '<div style="font-size: 0.75rem; color: var(--color-text-muted); text-align: center; padding: 1rem;">No jobs aggregated</div>'}
            </div>
        `;
    } else {
        specificHTML = `
            <div class="info-item">
                <div class="info-title">Output Payload Details</div>
                <div class="info-pre">${JSON.stringify(outcome.data, null, 2)}</div>
            </div>
        `;
    }

    container.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; padding-bottom: 0.75rem; border-bottom: 1px solid var(--border-color); margin-bottom: 1rem; flex-shrink: 0;">
            <div>
                <h3 style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 0.5rem; margin: 0;">
                    <i class="fa-solid fa-robot" style="color: var(--color-primary);"></i> ${outcome.agentName}
                </h3>
                <span style="font-size: 0.75rem; color: var(--color-text-muted);">${outcome.description}</span>
            </div>
            <span class="outcome-badge ${outcome.badgeClass}">${outcome.agentName.toUpperCase()}</span>
        </div>
        
        ${specificHTML}
        
        <div class="info-item" style="margin-top: 1.5rem;">
            <div class="info-title">Raw JSON Execution Handoff</div>
            <div class="info-pre">${JSON.stringify(outcome.data, null, 2)}</div>
        </div>
    `;
}

// Sync visibility of Session Context tabs (hides tabs besides resume when profile is null)
function syncTabButtonsVisibility() {
    const tabs = document.querySelectorAll(".json-tabs .tab-btn");
    const orchestratorCheck = runOrchestrator(currentContext);
    const isErrorState = orchestratorCheck.next_agent === "ERROR";

    const isProfileMissing = currentContext.candidate_profile === null;
    const isPrefsMissing = !isProfileMissing && currentContext.search_preferences === null;
    const isJobsMissing = !isProfileMissing && !isPrefsMissing && (currentContext.unified_job_list === null || currentContext.unified_job_list.length === 0);
    const isFitmentMissing = !isProfileMissing && !isPrefsMissing && !isJobsMissing && (currentContext.fitment_report === null);
    const isOutreachStage = !isProfileMissing && !isPrefsMissing && !isJobsMissing && !isFitmentMissing && !isOutreachCompleted;

    tabs.forEach(tab => {
        const tabKey = tab.dataset.tab;
        if (isErrorState) {
            tab.style.display = "block";
        } else if (isProfileMissing) {
            if (tabKey === "resume_submission") {
                tab.style.display = "block";
            } else {
                tab.style.display = "none";
            }
        } else if (isPrefsMissing) {
            if (tabKey === "search_preferences") {
                tab.style.display = "block";
            } else {
                tab.style.display = "none";
            }
        } else if (isJobsMissing) {
            if (tabKey === "user_request") {
                tab.style.display = "block";
            } else {
                tab.style.display = "none";
            }
        } else if (isFitmentMissing) {
            if (tabKey === "user_request") {
                tab.style.display = "block";
            } else {
                tab.style.display = "none";
            }
        } else if (isOutreachStage) {
            if (tabKey === "user_request") {
                tab.style.display = "block";
            } else {
                tab.style.display = "none";
            }
        } else {
            tab.style.display = "block";
        }

        // Apply active highlights
        tab.classList.remove("active");
        if (tabKey === activeTab) {
            tab.classList.add("active");
        }
    });
}

// Render Outreach results dashboard inside inspector
function showOutreachResults(comments) {
    const inspector = document.getElementById("inspector-container");
    if (!inspector) return;

    inspector.innerHTML = `
        <div class="info-grid">
            <div class="info-item" style="border-color: #ec4899; background: rgba(236, 72, 153, 0.02); grid-column: span 2; margin-top: 0;">
                <div class="info-title" style="color: #f9a8d4; font-weight: 600; font-size: 0.95rem;">
                    <i class="fa-solid fa-envelope-open-text"></i> RECOMMENDATION & OUTREACH AGENT OUTPUT
                </div>
                <p style="font-size: 0.85rem; line-height: 1.4; color: var(--color-text-muted); margin-top: 0.25rem;">
                    Drafts generated successfully considering user comments: <em>"${comments || "Write a warm pitch email."}"</em>
                </p>
            </div>

            <div class="info-item" style="grid-column: span 2;">
                <div class="info-title" style="color: var(--color-teal); font-weight: 600;">LinkedIn InMail Recruiter Draft (XYZ Corp)</div>
                <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 8px; padding: 1.25rem; margin-top: 0.5rem; font-family: monospace; font-size: 0.85rem; color: #ffffff; white-space: pre-wrap; line-height: 1.5;">Subject: Director, AI & Digital Transformation - XYZ Corp

Dear Recruiter,

I noticed XYZ Corp is searching for a Director of AI & Digital Transformation. Given my 12+ years of experience leading digital transformation strategy, along with my deep expertise in Generative AI strategy and cloud integrations, I would love to connect.

I've successfully driven digital scaling initiatives in my past roles, aligning technical architecture directly with P&L objectives. I'd welcome a brief call to see how my background fits your current needs.

Best regards,
Candidate</div>
            </div>

            <div class="info-item" style="grid-column: span 2;">
                <div class="info-title" style="color: #a855f7; font-weight: 600;">Recommended Profile Modifications</div>
                <ul style="margin-left: 1.2rem; margin-top: 0.5rem; font-size: 0.85rem; display: flex; flex-direction: column; gap: 0.4rem; color: var(--color-text-main); line-height: 1.4; padding-left: 0.5rem;">
                    <li>Add <strong>"Generative AI Strategy Leader & Cloud Architect"</strong> to your LinkedIn Headline.</li>
                    <li>Ensure your summary explicitly highlights <strong>P&L management</strong> and <strong>Team Leadership (Expert)</strong> metrics.</li>
                    <li>Align skills section to match key target roles (Enterprise Architect, SAP Solution Architect).</li>
                </ul>
            </div>
        </div>
    `;
}

// Render Summary Dashboard inside summary tab panel
function renderSummaryDashboard() {
    const emptyState = document.getElementById("summary-empty-state");
    const content = document.getElementById("summary-dashboard-content");
    if (!emptyState || !content) return;

    if (!currentContext || !currentContext.candidate_profile) {
        emptyState.style.display = "flex";
        emptyState.innerHTML = `
            <i class="fa-solid fa-flag-checkered" style="font-size: 2.5rem; color: var(--color-text-dark); margin-bottom: 0.75rem;"></i>
            <p style="font-size: 0.9rem; color: var(--color-text-muted); text-align: center;">No Data</p>
        `;
        content.style.display = "none";
        return;
    }

    emptyState.style.display = "none";
    content.style.display = "flex";

    const profile = currentContext.candidate_profile || {};
    const skills = (currentContext.skills_file_v1 || {}).skills || [];
    const prefs = currentContext.search_preferences || {};
    const jobs = currentContext.unified_job_list || [];
    const fitment = currentContext.fitment_report || null;

    // Calculate metrics
    const highFit = jobs.filter(j => j.fit_band === "High" || (fitment && fitment.jobs.find(fj => fj.title === j.title && fj.fit_band === "High"))).length;
    const medFit = jobs.filter(j => j.fit_band === "Medium" || (fitment && fitment.jobs.find(fj => fj.title === j.title && fj.fit_band === "Medium"))).length;
    const lowFit = jobs.filter(j => j.fit_band === "Low" || (fitment && fitment.jobs.find(fj => fj.title === j.title && fj.fit_band === "Low"))).length;

    content.innerHTML = `
        <!-- Summary Dashboard Grid -->
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.25rem;">
            
            <!-- Ingested Profile Summary Card -->
            <div class="info-item" style="border-color: var(--color-primary); background: rgba(99, 102, 241, 0.02); display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0;">
                <div class="info-title" style="color: var(--color-primary-glow); font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-user-tie"></i> Candidate Profile & Skills
                </div>
                <div>
                    <div style="font-size: 0.85rem; font-weight: 700; color: #ffffff;">Seniority: <span style="color: var(--color-teal);">${profile.seniority || "Not Extracted"}</span></div>
                    <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-top: 0.25rem; line-height: 1.4;">${profile.summary || "No summary available"}</div>
                </div>
                <div style="border-top: 1px solid var(--border-color); padding-top: 0.5rem; margin-top: auto;">
                    <div style="font-size: 0.75rem; font-weight: 600; color: #ffffff; margin-bottom: 0.4rem;">Top Extracted Skills</div>
                    <div style="display: flex; flex-wrap: wrap; gap: 0.35rem;">
                        ${skills.map(s => `<span style="background: rgba(20, 184, 166, 0.1); color: var(--color-teal); font-size: 0.65rem; padding: 0.15rem 0.4rem; border-radius: 4px; font-weight: 600;">${s.skill_name} (${s.proficiency_level})</span>`).join('') || '<span style="font-size: 0.7rem; color: var(--color-text-muted);">No skills extracted</span>'}
                    </div>
                </div>
            </div>

            <!-- Target Preferences Card -->
            <div class="info-item" style="border-color: var(--color-teal); background: rgba(20, 184, 166, 0.02); display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0;">
                <div class="info-title" style="color: var(--color-teal); font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-sliders"></i> Configured Job Preferences
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.5rem; font-size: 0.75rem; color: var(--color-text-main); line-height: 1.5;">
                    <div><strong>Target Titles:</strong> ${prefs.target_titles ? prefs.target_titles.join(", ") : "Any Title"}</div>
                    <div><strong>Preferred Locations:</strong> ${prefs.locations ? prefs.locations.join(", ") : "Any Location"}</div>
                    <div><strong>Work Modes:</strong> ${prefs.work_mode && prefs.work_mode.length > 0 ? prefs.work_mode.join(", ") : "Any Mode"}</div>
                    <div><strong>Employment Config:</strong> ${prefs.employment_type && prefs.employment_type.length > 0 ? prefs.employment_type.join(", ") : "Any Type"}</div>
                    <div><strong>Expected Compensation:</strong> 
                        <span style="color: var(--color-teal); font-weight: 700;">
                            ${prefs.salary_range ? `${prefs.salary_range.currency} ${prefs.salary_range.min ? prefs.salary_range.min.toLocaleString() : "0"} - ${prefs.salary_range.max ? prefs.salary_range.max.toLocaleString() : "Any"}` : "Unspecified"}
                        </span>
                    </div>
                </div>
            </div>

            <!-- Pipeline Job Alignment Card -->
            <div class="info-item" style="border-color: #f59e0b; background: rgba(245, 158, 11, 0.02); display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0;">
                <div class="info-title" style="color: #f59e0b; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-briefcase"></i> Job Alignment Metrics
                </div>
                <div style="display: flex; justify-content: space-around; text-align: center; margin-top: 0.25rem; margin-bottom: 0.25rem;">
                    <div style="flex: 1;">
                        <div style="font-size: 1.8rem; font-weight: 800; color: #14b8a6;">${highFit}</div>
                        <div style="font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted);">HIGH FIT</div>
                    </div>
                    <div style="flex: 1; border-left: 1px solid var(--border-color); border-right: 1px solid var(--border-color);">
                        <div style="font-size: 1.8rem; font-weight: 800; color: #f59e0b;">${medFit}</div>
                        <div style="font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted);">MEDIUM FIT</div>
                    </div>
                    <div style="flex: 1;">
                        <div style="font-size: 1.8rem; font-weight: 800; color: #ef4444;">${lowFit}</div>
                        <div style="font-size: 0.65rem; font-weight: 600; color: var(--color-text-muted);">LOW FIT</div>
                    </div>
                </div>
                <div style="border-top: 1px solid var(--border-color); padding-top: 0.5rem; font-size: 0.75rem; line-height: 1.4; margin-top: auto;">
                    <strong>Aggregated Source Feeds:</strong> 
                    <span style="color: var(--color-text-muted);">
                        ${jobs.length > 0 ? "LinkedIn, IIMJobs, Foundit, ExecSearch, Global Remote" : "No active jobs ingested yet."}
                    </span>
                </div>
            </div>

            <!-- System Orchestrator Telemetry Card -->
            <div class="info-item" style="border-color: #ec4899; background: rgba(236, 72, 153, 0.02); display: flex; flex-direction: column; gap: 0.75rem; margin-top: 0;">
                <div class="info-title" style="color: #f9a8d4; font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 0.5rem;">
                    <i class="fa-solid fa-chart-line"></i> Pipeline Agent Telemetry
                </div>
                <div style="display: flex; flex-direction: column; gap: 0.45rem; font-size: 0.75rem; color: var(--color-text-main);">
                    <div style="display: flex; justify-content: space-between;">
                        <span>Executed Pipeline Actions:</span>
                        <span style="font-weight: 700; color: #ffffff;">${executedOutcomes.length}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Active Sandbox State:</span>
                        <span style="font-weight: 700; color: var(--color-teal);">${isOutreachCompleted ? "UNLOCKED SANDBOX" : "GUIDED WIZARD"}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between;">
                        <span>Active Session Key:</span>
                        <span style="font-family: monospace; font-size: 0.7rem; color: var(--color-text-muted);">active_session_40592</span>
                    </div>
                </div>
                <div style="border-top: 1px solid var(--border-color); padding-top: 0.5rem; font-size: 0.7rem; line-height: 1.4; color: var(--color-text-muted); margin-top: auto;">
                    All outcomes logged in chronological timeline trace list.
                </div>
            </div>
        </div>

        <!-- Timeline Flow Snapshot -->
        <div class="info-item" style="display: flex; flex-direction: column; gap: 0.5rem; margin-top: 0.5rem;">
            <div class="info-title" style="color: #ffffff; font-weight: 600; font-size: 0.9rem;">
                <i class="fa-solid fa-route"></i> Chronological Pipeline Path Map
            </div>
            <div style="display: flex; align-items: center; gap: 0.75rem; overflow-x: auto; padding-bottom: 0.5rem; margin-top: 0.25rem;">
                ${executedOutcomes.map((o, index) => `
                    <div style="display: flex; align-items: center; gap: 0.75rem; flex-shrink: 0;">
                        <div style="background: rgba(255,255,255,0.02); border: 1px solid var(--border-color); border-radius: 6px; padding: 0.5rem 0.75rem; display: flex; flex-direction: column; gap: 0.15rem;">
                            <span style="font-size: 0.7rem; font-weight: 700; color: #ffffff;">${o.agentName}</span>
                            <span style="font-size: 0.6rem; color: var(--color-text-muted); max-width: 140px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${o.description}</span>
                        </div>
                        ${index < executedOutcomes.length - 1 ? `<i class="fa-solid fa-chevron-right" style="font-size: 0.7rem; color: var(--color-text-dark);"></i>` : ""}
                    </div>
                `).join('') || '<div style="font-size: 0.75rem; color: var(--color-text-muted);">No pipeline history snapshot registered yet.</div>'}
            </div>
        </div>
    `;
}
