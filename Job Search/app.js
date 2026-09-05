/**
 * Aiam Agentic Job Search AI Agents Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    // -------------------------------------------------------------
    // STATE STORAGE
    // -------------------------------------------------------------
    const state = {
        activeAgent: 1,
        pipelineProgress: 0,
        
        // Agent 1: Resume Submission
        resumeData: {
            uploaded: false,
            candidateName: "",
            candidateTitle: "",
            jobPositions: "",
            yearsExperience: 0,
            experienceSummary: "",
            qualification: "",
            summary: "",
            skills: [] // skills_file_v1 format: { name, priority, proficiency }
        },
        
        // Agent 2: Select Preferences
        preferences: null, // { targetRoles, workModes, employmentTypes, salaryMin, salaryMax, currency, keywords, excludeKeywords }
        
        // Agent 3: Search Engine results
        jobs: [], // list of suitable jobs retrieved
        
        // Agent 4: Fitment Scorecard evaluations
        fitments: {}, // jobId -> fitment result details
        
        // Agent 5: Dashboard statistics
        stats: {
            totalEvaluated: 0,
            avgFitScore: 0,
            highCount: 0,
            medCount: 0,
            lowCount: 0
        }
    };

    // -------------------------------------------------------------
    // THEME SWITCHER
    // -------------------------------------------------------------
    function initThemeSwitcher() {
        const savedTheme = (typeof localStorage !== 'undefined' && localStorage.getItem('aiam_theme')) || 'cyber-violet';
        setTheme(savedTheme);

        document.querySelectorAll('.theme-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const theme = btn.getAttribute('data-theme');
                setTheme(theme);
            });
        });
    }

    function setTheme(themeName) {
        if (document.documentElement) {
            document.documentElement.setAttribute('data-theme', themeName);
        }
        if (typeof localStorage !== 'undefined') {
            localStorage.setItem('aiam_theme', themeName);
        }

        document.querySelectorAll('.theme-btn').forEach(btn => {
            if (btn.getAttribute('data-theme') === themeName) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    }

    initThemeSwitcher();
    // DEMO DATA PRESETS
    // -------------------------------------------------------------
    const DEMO_RESUME_1 = {
        candidateName: "John Doe",
        candidateTitle: "Senior Frontend Engineer",
        yearsExperience: 7,
        summary: "Seasoned web engineer with 7+ years of expertise in crafting premium user experiences. Specialized in React, TypeScript, and modern frontend architectures. Strong track record of improving site speed, building design systems, and collaborating with cross-functional product crews.",
        skills: [
            { name: "React", priority: "High", proficiency: "Expert" },
            { name: "TypeScript", priority: "High", proficiency: "Advanced" },
            { name: "JavaScript", priority: "High", proficiency: "Expert" },
            { name: "CSS/SASS", priority: "Medium", proficiency: "Expert" },
            { name: "HTML5", priority: "Medium", proficiency: "Expert" },
            { name: "Node.js", priority: "Medium", proficiency: "Intermediate" },
            { name: "Webpack/Vite", priority: "Medium", proficiency: "Advanced" },
            { name: "Git", priority: "Low", proficiency: "Advanced" },
            { name: "AWS", priority: "Low", proficiency: "Beginner" },
            { name: "Unit Testing (Jest)", priority: "Medium", proficiency: "Advanced" }
        ]
    };

    const DEMO_RESUME_2 = {
        candidateName: "Sarah Chen",
        candidateTitle: "Data Scientist & ML Engineer",
        yearsExperience: 4,
        summary: "Innovative Data Scientist with 4 years of experience designing and deploying machine learning pipelines. Experienced in predictive analytics, NLP, and tabular data pipelines. Passionate about turning raw data into strategic business decisions using Python, SQL, and cloud deployments.",
        skills: [
            { name: "Python", priority: "High", proficiency: "Expert" },
            { name: "SQL", priority: "High", proficiency: "Advanced" },
            { name: "Machine Learning", priority: "High", proficiency: "Advanced" },
            { name: "Pandas/NumPy", priority: "High", proficiency: "Expert" },
            { name: "TensorFlow", priority: "Medium", proficiency: "Intermediate" },
            { name: "Scikit-Learn", priority: "Medium", proficiency: "Advanced" },
            { name: "Docker", priority: "Medium", proficiency: "Intermediate" },
            { name: "Tableau", priority: "Low", proficiency: "Advanced" },
            { name: "AWS Sagemaker", priority: "Medium", proficiency: "Intermediate" },
            { name: "NLP", priority: "Low", proficiency: "Intermediate" }
        ]
    };

    function getJobLocationText(job) {
        if (!job) return 'Location N/A';
        if (job.city && job.country) {
            return `${job.city}, ${job.country}`;
        }
        if (job.country) {
            return job.country;
        }
        if (job.location) {
            return job.location;
        }
        return 'Location N/A';
    }

    // Preset list of jobs for Search simulation (matching roles, keywords and filters will be applied dynamically)
    const JOB_DATABASE = [
        {
            id: "job-1",
            title: "Senior React Developer",
            company: "TechNexus Innovations",
            companyDetails: "TechNexus is a rapid-growth SaaS startup specializing in AI-driven productivity dashboards.",
            source: "Fantastic.jobs",
            salary: 135000,
            currency: "USD",
            city: "San Francisco",
            country: "USA",
            location: "San Francisco, USA",
            workMode: "Remote",
            employmentType: "Full Time",
            skillsRequired: ["React", "TypeScript", "JavaScript", "Vite", "CSS/SASS"],
            qualificationRequired: "Bachelor's degree in CS or equivalent experience, plus 5+ years of software development.",
            description: "We are seeking a senior frontend practitioner to lead our dashboard experience team. You will drive architecture decisions for our main React application, optimize web performance, and maintain our UI pattern library.",
            seniority: "Senior"
        },
        {
            id: "job-2",
            title: "Frontend Engineer (React/Redux)",
            company: "CloudFlow Digital",
            companyDetails: "CloudFlow builds enterprise orchestration software for multi-cloud deployment automation.",
            source: "LinkedIn",
            salary: 110000,
            currency: "USD",
            city: "Toronto",
            country: "Canada",
            location: "Toronto, Canada",
            workMode: "Hybrid",
            employmentType: "Full Time",
            skillsRequired: ["React", "JavaScript", "Git", "Webpack/Vite", "Node.js"],
            qualificationRequired: "3+ years of experience building responsive web interfaces.",
            description: "Join our frontend applications group to design user-friendly automation consoles. Collaborating closely with product designers, you will build robust interfaces using React and state management frameworks.",
            seniority: "Mid-level"
        },
        {
            id: "job-3",
            title: "Data Scientist",
            company: "Aiam Analytics Inc.",
            companyDetails: "Aiam Analytics provides supply-chain intelligence models for Fortune 500 manufacturing firms.",
            source: "Google Jobs",
            salary: 125000,
            currency: "USD",
            city: "Austin",
            country: "USA",
            location: "Austin, USA",
            workMode: "Remote",
            employmentType: "Full Time",
            skillsRequired: ["Python", "SQL", "Machine Learning", "Pandas/NumPy", "Scikit-Learn"],
            qualificationRequired: "Master's degree in Statistics, Data Science, or 3+ years of industry experience.",
            description: "Apply advanced machine learning and statistical modeling to optimize logistics routing. You will build and validate models, clean messy tabular data, and deploy models to our AWS pipeline.",
            seniority: "Mid-level"
        },
        {
            id: "job-4",
            title: "Lead AI & Machine Learning Architect",
            company: "OmniMind Labs",
            companyDetails: "OmniMind is a research-oriented lab developing next-generation foundation models.",
            source: "Indeed",
            salary: 180000,
            currency: "USD",
            city: "New York",
            country: "USA",
            location: "New York, USA",
            workMode: "Onsite",
            employmentType: "Full Time",
            skillsRequired: ["Python", "Machine Learning", "TensorFlow", "NLP", "Docker", "AWS Sagemaker"],
            qualificationRequired: "PhD in AI/ML or 8+ years of advanced systems engineering experience.",
            description: "Lead our NLP engineering core. You will design, train, and optimize deep learning transformer models, working on large compute clusters to scale model capabilities.",
            seniority: "Lead / Principal"
        },
        {
            id: "job-5",
            title: "Contract Web Developer (React)",
            company: "VividPixel Creative Agency",
            companyDetails: "VividPixel is a premium design boutique agency serving top brands in commerce.",
            source: "ZipRecruiter",
            salary: 95000,
            currency: "USD",
            city: "Sydney",
            country: "Australia",
            location: "Sydney, Australia",
            workMode: "Remote",
            employmentType: "Contract",
            skillsRequired: ["React", "JavaScript", "HTML5", "CSS/SASS", "Git"],
            qualificationRequired: "Proven portfolio of beautiful, animated custom websites.",
            description: "We need a contract developer for a 6-month product launch campaign. You will implement pixel-perfect Figma layouts and micro-interactions.",
            seniority: "Mid-level"
        },
        {
            id: "job-6",
            title: "Junior Python developer",
            company: "GreenData Software",
            companyDetails: "GreenData builds carbon foot-printing tools for ESG carbon audits.",
            source: "Google Jobs",
            salary: 70000,
            currency: "USD",
            city: "London",
            country: "UK",
            location: "London, UK",
            workMode: "Hybrid",
            employmentType: "Full Time",
            skillsRequired: ["Python", "SQL", "Git", "Pandas/NumPy"],
            qualificationRequired: "Coding bootcamp graduate or entry-level CS degree.",
            description: "Help us build backend connectors and database integrations. Great mentorship provided for junior devs looking to expand their Python and SQL mastery.",
            seniority: "Junior"
        },
        {
            id: "job-7",
            title: "Fullstack JavaScript developer",
            company: "HyperScale Tech",
            companyDetails: "HyperScale builds distributed commerce solutions for high-traffic retailers.",
            source: "LinkedIn",
            salary: 145000,
            currency: "USD",
            city: "Dubai",
            country: "UAE",
            location: "Dubai, UAE",
            workMode: "Hybrid",
            employmentType: "Full Time",
            skillsRequired: ["JavaScript", "React", "Node.js", "SQL", "Git"],
            qualificationRequired: "5+ years of fullstack product development.",
            description: "Design endpoints and frontends alike. You'll work on our high-throughput payment gateways and client-side administrative portals.",
            seniority: "Senior"
        },
        {
            id: "job-8",
            title: "ML / Data Pipeline Contractor",
            company: "Quantum Consulting",
            companyDetails: "Quantum is a specialized consulting shop placing technical experts in fintech projects.",
            source: "Fantastic.jobs",
            salary: 130000,
            currency: "USD",
            city: "Chicago",
            country: "USA",
            location: "Chicago, USA",
            workMode: "Remote",
            employmentType: "Contract",
            skillsRequired: ["Python", "SQL", "Docker", "Pandas/NumPy", "AWS"],
            qualificationRequired: "4+ years of data pipeline infrastructure orchestration.",
            description: "Create and containerize ETL scripts for a data migration initiative. You will deploy Docker containers to AWS ECS.",
            seniority: "Senior"
        }
    ];

    // -------------------------------------------------------------
    // NAVIGATION & VIEW SWITCHING
    // -------------------------------------------------------------
    const navItems = document.querySelectorAll('.nav-item');
    const agentPanels = document.querySelectorAll('.agent-panel');
    const flowSteps = document.querySelectorAll('.flow-step');
    const flowConnectors = document.querySelectorAll('.flow-connector');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetAgent = parseInt(item.getAttribute('data-agent'));
            switchAgentView(targetAgent);
        });
    });

    flowSteps.forEach(step => {
        step.addEventListener('click', () => {
            const stepId = step.id;
            const targetAgent = parseInt(stepId.replace('flow-', ''));
            switchAgentView(targetAgent);
        });
    });

    function switchAgentView(agentIndex) {
        state.activeAgent = agentIndex;

        // Update nav items active state
        navItems.forEach(item => {
            const idx = parseInt(item.getAttribute('data-agent'));
            if (idx === agentIndex) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });

        // Show corresponding panel
        agentPanels.forEach(panel => {
            panel.classList.remove('active');
        });
        
        const panelIds = ['panel-resume', 'panel-preferences', 'panel-search', 'panel-fitment', 'panel-recommendation', 'panel-orchestration'];
        document.getElementById(panelIds[agentIndex - 1]).classList.add('active');

        // Update top flow step focus highlight
        flowSteps.forEach(step => {
            const idx = parseInt(step.id.replace('flow-', ''));
            if (idx === agentIndex) {
                step.classList.add('active');
            } else if (idx < agentIndex) {
                step.classList.add('completed');
            } else {
                step.classList.remove('active', 'completed');
            }
        });

        // Ensure job selection is populated when opening Agent 4 Fitment panel
        if (agentIndex === 4 && typeof renderJobSelectionForFitment === 'function') {
            renderJobSelectionForFitment();
        }
    }

    function updatePipelineVisuals() {
        // Update top connectors and step completed icons
        for (let i = 1; i <= 6; i++) {
            const stepEl = document.getElementById(`flow-${i}`);
            const statusIndicator = document.getElementById(`status-a${i}`);
            const isCompleted = isAgentCompleted(i);
            const isRunning = isAgentRunning(i);

            // Flow status LED badge
            if (statusIndicator) {
                statusIndicator.className = 'status-indicator';
                if (isRunning) {
                    statusIndicator.classList.add('running');
                    statusIndicator.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i>';
                } else if (isCompleted) {
                    statusIndicator.classList.add('completed');
                    statusIndicator.innerHTML = i === 6 ? '<i class="fa-solid fa-circle-nodes"></i>' : '<i class="fa-solid fa-check"></i>';
                } else {
                    statusIndicator.classList.add('idle');
                    statusIndicator.innerHTML = '<i class="fa-solid fa-circle"></i>';
                }
            }

            // Top flow step icons
            if (stepEl) {
                if (isCompleted && i !== 6) { // Orchestration step 6 icon stays as graph node
                    stepEl.classList.add('completed');
                    const iconEl = stepEl.querySelector('.flow-icon i');
                    iconEl.className = 'fa-solid fa-circle-check';
                } else {
                    stepEl.classList.remove('completed');
                    // restore original icons
                    const origIcons = [
                        'fa-solid fa-file-invoice',
                        'fa-solid fa-sliders',
                        'fa-solid fa-magnifying-glass',
                        'fa-solid fa-chart-simple',
                        'fa-solid fa-clipboard-check',
                        'fa-solid fa-diagram-project'
                    ];
                    const iconEl = stepEl.querySelector('.flow-icon i');
                    iconEl.className = origIcons[i - 1];
                }
            }

            // Connectors
            if (i < 6) {
                const connEl = document.getElementById(`conn-${i}`);
                if (connEl) {
                    if (isAgentCompleted(i) && isAgentCompleted(i+1)) {
                        connEl.className = 'flow-connector completed';
                    } else if (isAgentCompleted(i)) {
                        connEl.className = 'flow-connector active';
                    } else {
                        connEl.className = 'flow-connector';
                    }
                }
            }
        }

        // Update Orchestrator Workflow Panel nodes and metrics dynamically
        updateOrchestratorVisualizer();

        // Calculate progress percentage
        let completedCount = 0;
        for (let i = 1; i <= 5; i++) {
            if (isAgentCompleted(i)) completedCount++;
        }
        state.pipelineProgress = completedCount * 20;
        document.getElementById('pipeline-progress').innerText = `${state.pipelineProgress}% Done`;

        // Enable / Disable following buttons based on dependency completion
        const btn3 = document.getElementById('run-agent-3');
        const btn4 = document.getElementById('run-agent-4');
        const btn5 = document.getElementById('run-agent-5');

        if (isAgentCompleted(1) && isAgentCompleted(2)) {
            btn3.disabled = false;
            document.getElementById('search-deps-banner').className = 'inputs-validation-banner ready';
            document.getElementById('search-deps-banner').innerHTML = '<i class="fa-solid fa-check"></i> All pre-requisite agent outcomes are ready.';
        } else {
            btn3.disabled = true;
            document.getElementById('search-deps-banner').className = 'inputs-validation-banner';
            document.getElementById('search-deps-banner').innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Requires outputs from <strong>Agent 1 (Resume)</strong> and <strong>Agent 2 (Preferences)</strong> to start.';
        }

        if (isAgentCompleted(3)) {
            btn4.disabled = false;
            document.getElementById('fitment-deps-banner').className = 'inputs-validation-banner ready';
            document.getElementById('fitment-deps-banner').innerHTML = '<i class="fa-solid fa-check"></i> Job search matches loaded. Ready for fitment scoring.';
        } else {
            btn4.disabled = true;
            document.getElementById('fitment-deps-banner').className = 'inputs-validation-banner';
            document.getElementById('fitment-deps-banner').innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Requires job results from <strong>Agent 3 (Search)</strong>.';
        }

        if (isAgentCompleted(4)) {
            btn5.disabled = false;
        } else {
            btn5.disabled = true;
        }
    }

    const agentRunStates = {
        1: { completed: false, running: false },
        2: { completed: false, running: false },
        3: { completed: false, running: false },
        4: { completed: false, running: false },
        5: { completed: false, running: false },
        6: { completed: true, running: false }
    };

    function isAgentCompleted(idx) { return agentRunStates[idx].completed; }
    function isAgentRunning(idx) { return agentRunStates[idx].running; }

    function setAgentState(idx, running, completed) {
        agentRunStates[idx].running = running;
        agentRunStates[idx].completed = completed;
        updatePipelineVisuals();
    }

    // -------------------------------------------------------------
    // AGENT 1: RESUME SUBMISSION
    // -------------------------------------------------------------
    const dropzone = document.getElementById('resume-dropzone');
    const fileInput = document.getElementById('resume-file-input');
    const uploadedFileName = document.getElementById('uploaded-file-name');
    const resumeTextInput = document.getElementById('resume-text-input');
    const runAgent1Btn = document.getElementById('run-agent-1');
    const outcome1Content = document.getElementById('outcome-1-content');
    const outcomeBadge1 = document.getElementById('outcome-badge-1');

    // Trigger file dialog
    dropzone.addEventListener('click', () => fileInput.click());
    
    // Drag events
    ['dragenter', 'dragover'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            dropzone.classList.remove('dragover');
        }, false);
    });

    dropzone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length) {
            handleUploadedFile(files[0]);
        }
    });

    fileInput.addEventListener('change', () => {
        if (fileInput.files.length) {
            handleUploadedFile(fileInput.files[0]);
        }
    });

    // Add input event listener to reset cached preset if user modifies the text area manually
    resumeTextInput.addEventListener('input', () => {
        state.resumeData.rawPreset = null;
    });

    let attachedFileObject = null;
    let attachedFileText = null;

    function handleUploadedFile(file) {
        attachedFileObject = file;
        uploadedFileName.innerText = `${file.name} (${(file.size / 1024).toFixed(1)} KB)`;
        
        // Reset cached rawPreset so it parses dynamically
        state.resumeData.rawPreset = null;

        if (file.type === "text/plain" || file.name.endsWith('.txt')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                attachedFileText = e.target.result;
                resumeTextInput.value = e.target.result;
            };
            reader.readAsText(file);
        } else {
            const nameBase = file.name.split('.')[0].replace(/[-_]/g, ' ');
            const capitalizedName = nameBase.replace(/\b\w/g, c => c.toUpperCase());
            const isDataRole = file.name.toLowerCase().includes('data') || file.name.toLowerCase().includes('scientist') || file.name.toLowerCase().includes('analyst');
            const isSapRole = file.name.toLowerCase().includes('sap') || file.name.toLowerCase().includes('hana') || file.name.toLowerCase().includes('consultant');
            
            let mockText = "";
            if (isDataRole) {
                mockText = `CANDIDATE: ${capitalizedName || "Sarah Chen"}
JOB POSITIONS: Data Scientist, Machine Learning Engineer, AI Specialist
EXPERIENCE: 5 Years
QUALIFICATION: Master of Science in Data Analytics & Machine Learning

EXPERIENCE HIGHLIGHTS:
5 years designing predictive models, big-data ETL pipelines, and machine learning architectures for enterprise applications.

SKILLS:
- Python (Expert, Priority: High)
- SQL (Advanced, Priority: High)
- Machine Learning (Advanced, Priority: High)
- Pandas (Expert, Priority: Medium)
- Docker (Intermediate, Priority: Medium)
- AWS (Intermediate, Priority: Low)`;
            } else if (isSapRole) {
                mockText = `CANDIDATE: ${capitalizedName || "Michael Vance"}
JOB POSITIONS: SAP Functional Consultant, ERP Architect, Solution Lead
EXPERIENCE: 9 Years
QUALIFICATION: B.S. in Information Systems & SAP HANA Certified Professional

EXPERIENCE HIGHLIGHTS:
9 years leading SAP S/4HANA implementations, supply chain module configurations, and ABAP integrations.

SKILLS:
- SAP (Expert, Priority: High)
- ABAP (Advanced, Priority: High)
- HANA (Advanced, Priority: High)
- SQL (Expert, Priority: Medium)
- Git (Intermediate, Priority: Low)`;
            } else {
                mockText = `CANDIDATE: ${capitalizedName || "Amit Sharma"}
JOB POSITIONS: Senior Java Developer, Cloud Solution Architect, Backend Lead
EXPERIENCE: 8 Years
QUALIFICATION: Bachelor of Technology in Computer Science (AWS Solutions Architect Certified)

EXPERIENCE HIGHLIGHTS:
8 years building enterprise microservices, REST APIs, spring boot cloud infrastructures, and high-concurrency database backends.

SKILLS:
- Java (Expert, Priority: High)
- Spring Boot (Expert, Priority: High)
- SQL (Advanced, Priority: High)
- AWS (Advanced, Priority: Medium)
- Kubernetes (Intermediate, Priority: Medium)
- Docker (Advanced, Priority: Medium)
- Git (Advanced, Priority: Low)`;
            }
            attachedFileText = mockText;
            resumeTextInput.value = mockText;
        }
    }

    // Note: parseResumeText and combineParsedProfiles have been moved to the bottom of the file
    // to expose them globally for programmatic test environments (test_e2e.js).

    runAgent1Btn.addEventListener('click', () => {
        const pastedText = resumeTextInput.value.trim();
        const fileText = attachedFileText ? attachedFileText.trim() : "";

        if (!pastedText && !fileText) {
            alert("Please upload a file or paste resume text to analyze.");
            return;
        }

        // Trigger Run status
        setAgentState(1, true, false);
        outcomeBadge1.innerText = "ANALYZING...";
        outcomeBadge1.className = "badge warning";
        
        outcome1Content.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>Agent is performing NLP analysis and extracting skills schema (` + "`" + `skills_file_v1` + "`" + `)...</p>
            </div>
        `;

        // Simulate agent processing delay
        setTimeout(() => {
            let finalParsed;

            if (fileText && pastedText && fileText !== pastedText) {
                // Combine both attached file details and pasted text details
                const parsedFile = parseResumeText(fileText);
                const parsedPasted = parseResumeText(pastedText);
                finalParsed = combineParsedProfiles(parsedFile, parsedPasted, attachedFileObject);
            } else if (fileText) {
                finalParsed = parseResumeText(fileText);
                finalParsed.source = `Attached File (${attachedFileObject ? attachedFileObject.name : 'Document'})`;
            } else {
                finalParsed = state.resumeData.rawPreset || parseResumeText(pastedText);
                if (!finalParsed.source) finalParsed.source = "Pasted Resume Text";
            }

            state.resumeData.uploaded = true;
            state.resumeData.candidateName = finalParsed.candidateName;
            state.resumeData.candidateTitle = finalParsed.candidateTitle;
            state.resumeData.jobPositions = finalParsed.jobPositions;
            state.resumeData.yearsExperience = finalParsed.yearsExperience;
            state.resumeData.experienceSummary = finalParsed.experienceSummary;
            state.resumeData.qualification = finalParsed.qualification;
            state.resumeData.summary = finalParsed.summary;
            state.resumeData.source = finalParsed.source;
            state.resumeData.skills = JSON.parse(JSON.stringify(finalParsed.skills)); // deep copy

            setAgentState(1, false, true);
            outcomeBadge1.innerText = "COMPLETED";
            outcomeBadge1.className = "badge ready";

            renderAgent1Outcome();
            
            // Auto switch to preference tab to guide workflow
            setTimeout(() => {
                switchAgentView(2);
            }, 1000);

        }, 1500);
    });

    function renderAgent1Outcome() {
        let skillsRows = "";
        state.resumeData.skills.forEach((skill, index) => {
            skillsRows += `
                <tr data-index="${index}">
                    <td><strong>${skill.name}</strong></td>
                    <td>
                        <select class="table-select skill-priority" data-index="${index}">
                            <option value="High" ${skill.priority === 'High' ? 'selected' : ''}>High</option>
                            <option value="Medium" ${skill.priority === 'Medium' ? 'selected' : ''}>Medium</option>
                            <option value="Low" ${skill.priority === 'Low' ? 'selected' : ''}>Low</option>
                        </select>
                    </td>
                    <td>
                        <select class="table-select skill-proficiency" data-index="${index}">
                            <option value="Beginner" ${skill.proficiency === 'Beginner' ? 'selected' : ''}>Beginner</option>
                            <option value="Intermediate" ${skill.proficiency === 'Intermediate' ? 'selected' : ''}>Intermediate</option>
                            <option value="Advanced" ${skill.proficiency === 'Advanced' ? 'selected' : ''}>Advanced</option>
                            <option value="Expert" ${skill.proficiency === 'Expert' ? 'selected' : ''}>Expert</option>
                        </select>
                    </td>
                    <td style="text-align: center;">
                        <button class="btn btn-sm btn-outline btn-delete-skill" data-index="${index}" style="padding: 2px 6px; font-size: 10px;">
                            <i class="fa-solid fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });

        outcome1Content.innerHTML = `
            <div class="outcome-profile">
                <div class="profile-card">
                    <div class="profile-header">
                        <div>
                            <h4><i class="fa-solid fa-user-tie" style="color: var(--color-primary); margin-right: 6px;"></i>${state.resumeData.candidateName}</h4>
                            <span class="profile-title" style="display: block; margin-top: 4px;"><i class="fa-solid fa-briefcase" style="color: var(--color-primary); margin-right: 6px;"></i><strong>Job Positions:</strong> ${state.resumeData.jobPositions || state.resumeData.candidateTitle}</span>
                        </div>
                        <span class="badge online" title="Profile Extraction Method">${state.resumeData.source || 'Parsed Profile'}</span>
                    </div>

                    <div class="profile-meta-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; margin-top: 14px; padding-top: 12px; border-top: 1px solid var(--border-color); font-size: 12px;">
                        <div>
                            <span style="color: var(--text-muted); font-size: 11px; display: block; text-transform: uppercase; font-weight: 600;"><i class="fa-solid fa-business-time" style="margin-right: 4px;"></i> Experience</span>
                            <strong style="color: white; display: block; margin-top: 2px;">${state.resumeData.yearsExperience} Years Total</strong>
                            <p style="color: var(--text-muted); font-size: 11px; margin-top: 4px; line-height: 1.4;">${state.resumeData.experienceSummary || state.resumeData.summary}</p>
                        </div>
                        <div>
                            <span style="color: var(--text-muted); font-size: 11px; display: block; text-transform: uppercase; font-weight: 600;"><i class="fa-solid fa-graduation-cap" style="margin-right: 4px;"></i> Qualification</span>
                            <strong style="color: white; display: block; margin-top: 2px;">${state.resumeData.qualification || 'Higher Education Degree'}</strong>
                        </div>
                    </div>
                </div>

                <div class="skills-table-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 15px; margin-bottom: 8px;">
                        <h4><i class="fa-solid fa-code" style="color: var(--color-primary); margin-right: 6px;"></i> Extracted Skills (skills_file_v1 - ${state.resumeData.skills.length})</h4>
                        <button class="btn btn-sm btn-outline" id="add-new-skill-btn">
                            <i class="fa-solid fa-plus"></i> Add Skill
                        </button>
                    </div>
                    <div class="table-container">
                        <table class="skills-table">
                            <thead>
                                <tr>
                                    <th>Skill Name</th>
                                    <th>Priority</th>
                                    <th>Proficiency</th>
                                    <th style="text-align: center; width: 50px;">Action</th>
                                </tr>
                            </thead>
                            <tbody id="skills-table-tbody">
                                ${skillsRows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;

        // Attach event listeners to edits inside the table
        document.querySelectorAll('.skill-priority').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                state.resumeData.skills[idx].priority = e.target.value;
            });
        });

        document.querySelectorAll('.skill-proficiency').forEach(select => {
            select.addEventListener('change', (e) => {
                const idx = parseInt(e.target.getAttribute('data-index'));
                state.resumeData.skills[idx].proficiency = e.target.value;
            });
        });

        document.querySelectorAll('.btn-delete-skill').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.getAttribute('data-index'));
                state.resumeData.skills.splice(idx, 1);
                renderAgent1Outcome();
            });
        });

        // Add Skill button handler
        document.getElementById('add-new-skill-btn').addEventListener('click', () => {
            const skillName = prompt("Enter skill name:");
            if (skillName && skillName.trim()) {
                state.resumeData.skills.push({
                    name: skillName.trim(),
                    priority: "Medium",
                    proficiency: "Intermediate"
                });
                renderAgent1Outcome();
            }
        });
    }


    // -------------------------------------------------------------
    // AGENT 2: SELECT PREFERENCES
    // -------------------------------------------------------------
    const runAgent2Btn = document.getElementById('run-agent-2');
    const outcome2Content = document.getElementById('outcome-2-content');
    const outcomeBadge2 = document.getElementById('outcome-badge-2');

    runAgent2Btn.addEventListener('click', () => {
        const rolesInput = document.getElementById('pref-target-roles').value.trim();
        if (!rolesInput) {
            alert("Please specify Target Roles.");
            return;
        }

        setAgentState(2, true, false);
        outcomeBadge2.innerText = "SAVING...";
        outcomeBadge2.className = "badge warning";

        outcome2Content.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>Agent is packaging preference profiles...</p>
            </div>
        `;

        setTimeout(() => {
            // Fetch checklist arrays
            const workModes = Array.from(document.querySelectorAll('input[name="work-mode"]:checked')).map(el => el.value);
            const employmentTypes = Array.from(document.querySelectorAll('input[name="emp-type"]:checked')).map(el => el.value);
            
            const minSal = parseInt(document.getElementById('pref-salary-min').value) || null;
            const maxSal = parseInt(document.getElementById('pref-salary-max').value) || null;
            const currency = document.getElementById('pref-salary-currency').value;
            
            const city = document.getElementById('pref-city').value.trim();
            const country = document.getElementById('pref-country').value.trim();

            const keywords = document.getElementById('pref-keywords').value.split(',').map(s => s.trim()).filter(Boolean);
            const excludeKeywords = document.getElementById('pref-exclude-keywords').value.split(',').map(s => s.trim()).filter(Boolean);

            state.preferences = {
                targetRoles: rolesInput.split(',').map(s => s.trim()).filter(Boolean),
                workModes,
                employmentTypes,
                salaryMin: minSal,
                salaryMax: maxSal,
                salaryCurrency: currency,
                city,
                country,
                keywords,
                excludeKeywords
            };

            setAgentState(2, false, true);
            outcomeBadge2.innerText = "COMPLETED";
            outcomeBadge2.className = "badge ready";

            renderAgent2Outcome();

            // Auto switch to ready for search if agent 1 also done
            if (isAgentCompleted(1)) {
                setTimeout(() => {
                    switchAgentView(3);
                }, 1000);
            }
        }, 1000);
    });

    function renderAgent2Outcome() {
        const pref = state.preferences;
        
        let targetRolesBadges = pref.targetRoles.map(r => `<span class="tag">${r}</span>`).join(' ');
        let modesList = pref.workModes.join(', ') || 'Any';
        let typesList = pref.employmentTypes.join(', ') || 'Any';
        
        let salaryText = "No expectation set";
        if (pref.salaryMin || pref.salaryMax) {
            const minStr = pref.salaryMin ? `${pref.salaryCurrency} ${pref.salaryMin.toLocaleString()}` : "Any";
            const maxStr = pref.salaryMax ? `${pref.salaryCurrency} ${pref.salaryMax.toLocaleString()}` : "Any";
            salaryText = `${minStr} - ${maxStr}`;
        }

        let kwBadges = pref.keywords.length ? pref.keywords.map(k => `<span class="tag">${k}</span>`).join(' ') : '<span style="color: var(--text-dark);">None</span>';
        let exKwBadges = pref.excludeKeywords.length ? pref.excludeKeywords.map(k => `<span class="tag exclude">${k}</span>`).join(' ') : '<span style="color: var(--text-dark);">None</span>';

        outcome2Content.innerHTML = `
            <div class="pref-summary-list">
                <div class="pref-summary-card">
                    <div class="pref-summary-row">
                        <span class="label">Target Roles</span>
                        <div class="tag-list">${targetRolesBadges}</div>
                    </div>
                    <div class="pref-summary-row">
                        <span class="label">Location</span>
                        <span class="val">${pref.city || 'Any City'}${pref.country ? ', ' + pref.country : ''}</span>
                    </div>
                    <div class="pref-summary-row">
                        <span class="label">Work Mode</span>
                        <span class="val">${modesList}</span>
                    </div>
                    <div class="pref-summary-row">
                        <span class="label">Employment Type</span>
                        <span class="val">${typesList}</span>
                    </div>
                    <div class="pref-summary-row">
                        <span class="label">Salary Expectation</span>
                        <span class="val">${salaryText}</span>
                    </div>
                    <div class="pref-summary-row">
                        <span class="label">Keywords</span>
                        <div class="tag-list">${kwBadges}</div>
                    </div>
                    <div class="pref-summary-row">
                        <span class="label">Exclude Keywords</span>
                        <div class="tag-list">${exKwBadges}</div>
                    </div>
                </div>
            </div>
        `;
    }

    // -------------------------------------------------------------
    // AGENT 3: READY FOR SEARCH
    // -------------------------------------------------------------
    const runAgent3Btn = document.getElementById('run-agent-3');
    const searchConsole = document.getElementById('search-console');
    const outcome3Content = document.getElementById('outcome-3-content');
    const outcomeBadge3 = document.getElementById('outcome-badge-3');

    function logConsole(message, type = 'normal') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.innerText = `[${new Date().toLocaleTimeString()}] ${message}`;
        searchConsole.appendChild(line);
        searchConsole.scrollTop = searchConsole.scrollHeight;
    }

    runAgent3Btn.addEventListener('click', async () => {
        if (!isAgentCompleted(1) || !isAgentCompleted(2)) return;

        setAgentState(3, true, false);
        outcomeBadge3.innerText = "SEARCHING...";
        outcomeBadge3.className = "badge warning";

        outcome3Content.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>Agent is crawling jobs database, querying search channels, and matching roles...</p>
            </div>
        `;

        searchConsole.innerHTML = "";
        logConsole("Agent 3 triggered: Search Pipeline active.", "system");
        
        // Extract Agent 1 outcome
        const a1Roles = (state.resumeData.jobPositions || state.resumeData.candidateTitle || "").split(',').map(s => s.trim()).filter(Boolean);
        const a1Skills = (state.resumeData.skills || []).filter(s => s.priority === 'High' || s.priority === 'Medium').map(s => s.name);
        
        // Extract Agent 2 outcome
        const a2Roles = state.preferences.targetRoles || [];
        const a2Keywords = state.preferences.keywords || [];
        
        // Combine target roles (Agent 1 + Agent 2)
        const combinedRolesSet = new Set([...a2Roles, ...a1Roles]);
        const combinedRoles = Array.from(combinedRolesSet);
        const qStr = combinedRoles.join(', ');
        
        // Combine keywords / skills (Agent 1 + Agent 2)
        const combinedKeywordsSet = new Set([...a2Keywords, ...a1Skills]);
        const combinedKeywords = Array.from(combinedKeywordsSet);
        const kws = combinedKeywords.join(',');
        
        const exKws = state.preferences.excludeKeywords.join(',');
        const modes = state.preferences.workModes.join(',');
        const types = state.preferences.employmentTypes.join(',');
        const city = state.preferences.city || '';
        const country = state.preferences.country || '';

        setTimeout(() => {
            logConsole(`Loaded Agent A1 Outcome: Candidate "${state.resumeData.candidateName}" (${state.resumeData.yearsExperience} yrs exp) | Roles: "${a1Roles.join(', ')}" | Top Skills: ${a1Skills.slice(0, 5).join(', ')}`, "system");
            logConsole(`Loaded Agent A2 Outcome: Target Roles: "${a2Roles.join(', ')}" | Location: ${city || 'Any'}${country ? ', ' + country : ''} | Modes: ${modes || 'Any'}`, "system");
        }, 300);

        setTimeout(() => {
            logConsole(`Formulating combined search query (Agent 1 Resume + Agent 2 Preferences): Roles="${qStr}" | Skills="${kws}"`, "query");
        }, 700);

        setTimeout(async () => {
            logConsole("Connecting to backend search server...", "query");

            const url = `/api/search?q=${encodeURIComponent(qStr)}&keywords=${encodeURIComponent(kws)}&excludeKeywords=${encodeURIComponent(exKws)}&workModes=${encodeURIComponent(modes)}&employmentTypes=${encodeURIComponent(types)}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}`;

            try {
                const response = await fetch(url);
                
                if (!response.ok) {
                    const errData = await response.json();
                    if (errData.error === "MISSING_KEY") {
                        logConsole("Warning: SerpAPI Key is missing in backend server .env file.", "system");
                        throw new Error("MISSING_KEY");
                    }
                    throw new Error("SERVER_ERROR");
                }

                const liveJobs = await response.json();
                logConsole("SerpAPI search returned live Google Jobs results.", "system");
                logConsole(`Retrieved ${liveJobs.length} live matches. Filtering results...`, "match");
                
                state.jobs = liveJobs;
                
            } catch (err) {
                if (err.message === "MISSING_KEY") {
                    logConsole("Running search agent in high-fidelity simulation engine.", "system");
                } else {
                    logConsole("Backend server offline. Running search agent in high-fidelity simulation engine.", "system");
                }
                
                logConsole("Querying built-in job databases for Google, LinkedIn, and Indeed...", "query");
                
                // Fallback simulated logic using combined roles and keywords
                const matchedJobs = JOB_DATABASE.filter(job => {
                    const matchesRole = combinedRoles.some(role => 
                        job.title.toLowerCase().includes(role.toLowerCase())
                    );
                    const matchesWorkMode = state.preferences.workModes.includes(job.workMode);
                    const matchesEmpType = state.preferences.employmentTypes.includes(job.employmentType);
                    const containsExcluded = state.preferences.excludeKeywords.some(ex => 
                        job.title.toLowerCase().includes(ex.toLowerCase()) || 
                        job.description.toLowerCase().includes(ex.toLowerCase())
                    );

                    return (matchesRole || combinedKeywords.some(kw => job.skillsRequired.map(s => s.toLowerCase()).includes(kw.toLowerCase()))) 
                           && matchesWorkMode && matchesEmpType && !containsExcluded;
                });

                state.jobs = matchedJobs.length > 0 ? matchedJobs : JOB_DATABASE.slice(0, 4);
                logConsole("Fuzzy match logic executed. Standardizing simulated records...", "match");
            }

            // Finish and render
            logConsole(`Pipeline complete. Found ${state.jobs.length} suitable matching job postings.`, "match");
            state.jobs.forEach(j => {
                logConsole(`Match found: "${j.title}" at ${j.company} (${j.workMode}, ${j.employmentType})`, "match");
            });

            setAgentState(3, false, true);
            outcomeBadge3.innerText = "COMPLETED";
            outcomeBadge3.className = "badge ready";

            renderAgent3Outcome();
            renderJobSelectionForFitment();

            setTimeout(() => {
                switchAgentView(4);
            }, 1200);

        }, 1500);
    });

    function renderAgent3Outcome() {
        if (!state.jobs.length) {
            outcome3Content.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>No suitable jobs found matching your combined Agent 1 & Agent 2 criteria. Try relaxing your preference filters.</p>
                </div>
            `;
            return;
        }

        const a1RolesStr = (state.resumeData.jobPositions || state.resumeData.candidateTitle || "Software Engineer");
        const a1SkillsStr = (state.resumeData.skills || []).filter(s => s.priority === 'High' || s.priority === 'Medium').slice(0, 4).map(s => s.name).join(', ') || "N/A";
        const a2RolesStr = (state.preferences ? state.preferences.targetRoles.join(', ') : "None");
        const locStr = state.preferences ? `${state.preferences.city || 'Any City'}${state.preferences.country ? ', ' + state.preferences.country : ''}` : "Any Location";

        let headerCard = `
            <div class="card" style="margin-bottom: 16px; padding: 14px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); border-radius: 8px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <h4 style="font-size: 13px; color: #a5b4fc; text-transform: uppercase; margin: 0; display: flex; align-items: center; gap: 6px;">
                        <i class="fa-solid fa-layer-group"></i> Agent Inputs Integration Summary
                    </h4>
                    <span class="badge online" style="font-size: 10px; padding: 2px 8px;">Agent 1 + Agent 2 Combined</span>
                </div>
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; font-size: 12px; margin-top: 6px;">
                    <div>
                        <span style="color: var(--text-muted); font-size: 10px; text-transform: uppercase; font-weight: 600; display: block;"><i class="fa-solid fa-file-invoice"></i> Agent 1 (Resume Submission)</span>
                        <strong style="color: white;">${state.resumeData.candidateName || 'Candidate Profile'}</strong> (${state.resumeData.yearsExperience || 0} Yrs Exp)
                        <div style="color: #cbd5e1; font-size: 11px; margin-top: 2px;">Extracted Roles: ${a1RolesStr}</div>
                        <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Key Skills: ${a1SkillsStr}</div>
                    </div>
                    <div>
                        <span style="color: var(--text-muted); font-size: 10px; text-transform: uppercase; font-weight: 600; display: block;"><i class="fa-solid fa-sliders"></i> Agent 2 (Select Preferences)</span>
                        <strong style="color: white;">Target Roles: ${a2RolesStr}</strong>
                        <div style="color: #cbd5e1; font-size: 11px; margin-top: 2px;">Location: ${locStr}</div>
                        <div style="color: #94a3b8; font-size: 10px; margin-top: 2px;">Modes: ${state.preferences ? state.preferences.workModes.join(', ') : 'Any'}</div>
                    </div>
                </div>
            </div>
        `;

        let jobCards = "";
        state.jobs.forEach(job => {
            const skillBadges = job.skillsRequired.map(s => `<span class="job-skill-badge">${s}</span>`).join('');
            jobCards += `
                <div class="job-card">
                    <div class="job-header">
                        <div class="job-title-company">
                            <h4>${job.title}</h4>
                            <span class="job-company">${job.company} <span style="color:var(--text-muted); font-size:10px; margin-left:6px;">(${job.source || 'Local Database'})</span></span>
                        </div>
                        <span class="badge online" style="font-size:9px;">${job.seniority}</span>
                    </div>
                    <div class="job-location-meta">
                        <span class="job-meta-pill"><i class="fa-solid fa-location-dot"></i> ${getJobLocationText(job)}</span>
                        <span class="job-meta-pill"><i class="fa-solid fa-briefcase"></i> ${job.workMode}</span>
                        <span class="job-meta-pill"><i class="fa-solid fa-clock"></i> ${job.employmentType}</span>
                        <span class="job-meta-pill"><i class="fa-solid fa-money-bill-wave"></i> ${job.salary ? job.salary.toLocaleString() : 'N/A'} ${job.currency}</span>
                    </div>
                    <div class="job-skills">
                        ${skillBadges}
                    </div>
                    <div class="job-body-detail">
                        <p><strong>About:</strong> ${job.companyDetails}</p>
                        <p><strong>Requirements:</strong> ${job.qualificationRequired}</p>
                    </div>
                </div>
            `;
        });

        outcome3Content.innerHTML = headerCard + jobCards;
    }

    // -------------------------------------------------------------
    // AGENT 4: READY FOR FITMENT
    // -------------------------------------------------------------
    const runAgent4Btn = document.getElementById('run-agent-4');
    const jobSelectionContainer = document.getElementById('job-selection-container');
    const selectAllBtn = document.getElementById('select-all-jobs');
    const deselectAllBtn = document.getElementById('deselect-all-jobs');
    const outcome4Content = document.getElementById('outcome-4-content');
    const outcomeBadge4 = document.getElementById('outcome-badge-4');

    function renderJobSelectionForFitment() {
        if (!jobSelectionContainer) return;
        if (!state.jobs.length) {
            jobSelectionContainer.innerHTML = `
                <div class="empty-state" style="padding: 16px;">
                    <i class="fa-solid fa-info-circle"></i>
                    <p style="font-size: 12px; margin-top: 4px;">No job listings loaded yet. Run Agent 3 (Ready for Search) first.</p>
                </div>
            `;
            return;
        }

        let itemsHtml = "";
        state.jobs.forEach(job => {
            const locText = getJobLocationText(job);
            itemsHtml += `
                <label class="job-select-item" for="chk-${job.id}">
                    <input type="checkbox" id="chk-${job.id}" value="${job.id}" checked>
                    <div class="job-select-info">
                        <div class="job-select-title">${job.title}</div>
                        <div class="job-select-company">${job.company} • 📍 ${locText} • ${job.workMode}</div>
                    </div>
                </label>
            `;
        });
        jobSelectionContainer.innerHTML = itemsHtml;
    }

    selectAllBtn.addEventListener('click', () => {
        jobSelectionContainer.querySelectorAll('input[type="checkbox"]').forEach(chk => chk.checked = true);
    });

    deselectAllBtn.addEventListener('click', () => {
        jobSelectionContainer.querySelectorAll('input[type="checkbox"]').forEach(chk => chk.checked = false);
    });

    runAgent4Btn.addEventListener('click', () => {
        const checkedBoxes = Array.from(jobSelectionContainer.querySelectorAll('input[type="checkbox"]:checked'));
        if (!checkedBoxes.length) {
            alert("Please select at least one job to run fitment analysis.");
            return;
        }

        setAgentState(4, true, false);
        outcomeBadge4.innerText = "CALCULATING...";
        outcomeBadge4.className = "badge warning";

        outcome4Content.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>Evaluating skills profiles, matching seniority tags, and verifying work mode expectations...</p>
            </div>
        `;

        setTimeout(() => {
            const selectedJobIds = checkedBoxes.map(chk => chk.value);
            
            // Calculate fitments
            state.fitments = {};
            selectedJobIds.forEach(id => {
                const job = state.jobs.find(j => j.id === id);
                if (job) {
                    state.fitments[id] = calculateFitmentScore(job, state.resumeData, state.preferences);
                }
            });

            setAgentState(4, false, true);
            outcomeBadge4.innerText = "COMPLETED";
            outcomeBadge4.className = "badge ready";

            renderAgent4Outcome();

            setTimeout(() => {
                switchAgentView(5);
            }, 1200);

        }, 1800);
    });

    /**
     * Compute fit scores and strengths/gaps for a job
     */
    function calculateFitmentScore(job, resume, preferences) {
        // Step 1. Skills Match (0-60 points)
        const jobSkills = job.skillsRequired || [];
        const candSkills = resume.skills || [];
        
        let skillsEarned = 0;
        let matchedCount = 0;

        if (jobSkills.length > 0) {
            const maxPointsPerSkill = 60 / jobSkills.length;
            
            jobSkills.forEach(reqSkill => {
                const reqLower = reqSkill.toLowerCase().trim();
                // Find case-insensitive & substring overlap match
                const match = candSkills.find(cs => {
                    const candLower = cs.name.toLowerCase().trim();
                    return candLower === reqLower || candLower.includes(reqLower) || reqLower.includes(candLower);
                });

                if (match) {
                    matchedCount++;
                    let weight = 0.6;
                    
                    if (match.proficiency === "Expert" || match.proficiency === "Advanced") {
                        weight = 1.0;
                    } else if (match.proficiency === "Intermediate") {
                        weight = 0.8;
                    }

                    if (match.priority === "High") {
                        if (match.proficiency === "Expert" || match.proficiency === "Advanced") {
                            weight = 1.0;
                        } else {
                            weight = Math.max(weight, 0.75);
                        }
                    }
                    
                    skillsEarned += maxPointsPerSkill * weight;
                }
            });
        }
        
        const step1Score = Math.min(60, Math.round(skillsEarned));

        // Step 2. Seniority Alignment (0-20 points)
        // Candidate seniority from resume title and years
        let candSeniority = "Mid-level";
        const years = resume.yearsExperience;
        const titleLower = resume.candidateTitle.toLowerCase();
        
        if (titleLower.includes('lead') || titleLower.includes('principal') || years >= 10) {
            candSeniority = "Lead / Principal";
        } else if (titleLower.includes('senior') || years >= 6) {
            candSeniority = "Senior";
        } else if (titleLower.includes('junior') || years <= 2) {
            candSeniority = "Junior";
        } else {
            candSeniority = "Mid-level";
        }

        const seniorityLevels = ["Junior", "Mid-level", "Senior", "Lead / Principal"];
        const candIndex = seniorityLevels.indexOf(candSeniority);
        const jobIndex = seniorityLevels.indexOf(job.seniority);
        
        let step2Score = 0;
        if (candIndex === jobIndex) {
            step2Score = 20; // perfect match
        } else if (Math.abs(candIndex - jobIndex) === 1) {
            step2Score = 12; // one level up/down
        } else if (Math.abs(candIndex - jobIndex) === 2) {
            step2Score = 6; // two levels up/down
        } else {
            step2Score = 0;
        }

        // Step 3. Preferences Alignment (0-20 points)
        let step3Score = 0;
        let hasPreferences = preferences !== null;

        if (hasPreferences) {
            // Check workMode (e.g. Remote)
            const modeMatch = preferences.workModes.includes(job.workMode);
            // Check employmentType (e.g. Full Time)
            const typeMatch = preferences.employmentTypes.includes(job.employmentType);
            
            if (modeMatch) step3Score += 10;
            if (typeMatch) step3Score += 10;
        }

        // Step 4. Compute overall score
        let overallScore = 0;
        if (hasPreferences) {
            overallScore = step1Score + step2Score + step3Score;
        } else {
            // Re-scale Step 1 & Step 2 (out of 80) to range 0-100
            overallScore = Math.round((step1Score + step2Score) * (100 / 80));
        }

        overallScore = Math.max(0, Math.min(100, overallScore));

        // Determine fit band
        let fitBand = "Low";
        if (overallScore >= 70) fitBand = "High";
        else if (overallScore >= 40) fitBand = "Medium";

        // Step 5. Summarize Strengths and Gaps
        const strengths = [];
        const gaps = [];

        // Evaluate skill matches
        jobSkills.forEach(reqSkill => {
            const match = candSkills.find(cs => cs.name.toLowerCase() === reqSkill.toLowerCase());
            if (match) {
                if (match.proficiency === "Expert" || match.proficiency === "Advanced") {
                    strengths.push(`Expert in ${reqSkill} (Job required skill)`);
                } else {
                    strengths.push(`Has matching knowledge of ${reqSkill}`);
                }
            } else {
                gaps.push(`Missing core job skill: ${reqSkill}`);
            }
        });

        // Evaluate seniority alignment
        if (candIndex === jobIndex) {
            strengths.push(`Seniority matches perfectly (${candSeniority})`);
        } else if (candIndex > jobIndex) {
            strengths.push(`Highly qualified (${candSeniority} title vs. ${job.seniority} required)`);
        } else {
            gaps.push(`Seniority gap (${candSeniority} vs. ${job.seniority} required)`);
        }

        // Evaluate preferences
        if (hasPreferences) {
            if (preferences.workModes.includes(job.workMode)) {
                strengths.push(`Work mode matches preference: ${job.workMode}`);
            } else {
                gaps.push(`Work mode mismatch: Prefer ${preferences.workModes.join('/')} vs Job: ${job.workMode}`);
            }

            if (preferences.employmentTypes.includes(job.employmentType)) {
                strengths.push(`Job type matches preference: ${job.employmentType}`);
            } else {
                gaps.push(`Employment type mismatch: Prefer ${preferences.employmentTypes.join('/')} vs Job: ${job.employmentType}`);
            }
        }

        // Return compiled results
        return {
            jobId: job.id,
            jobTitle: job.title,
            company: job.company,
            overallScore,
            fitBand,
            breakdown: {
                skills: step1Score,
                seniority: step2Score,
                preferences: hasPreferences ? step3Score : null,
                hasPreferences
            },
            strengths: strengths.slice(0, 4), // cap 3-4 items
            gaps: gaps.slice(0, 4) // cap 3-4 items
        };
    }

    function renderAgent4Outcome() {
        const evals = Object.values(state.fitments);
        if (!evals.length) {
            outcome4Content.innerHTML = `
                <div class="empty-state">
                    <i class="fa-solid fa-triangle-exclamation"></i>
                    <p>No job evaluations compiled. Ensure jobs are selected and perform the task.</p>
                </div>
            `;
            return;
        }

        let fitHtml = "";
        evals.forEach(fit => {
            const originalJob = state.jobs.find(j => j.id === fit.jobId);
            // SVG circular progress details
            const radius = 28;
            const circumference = 2 * Math.PI * radius;
            const strokeDashoffset = circumference - (fit.overallScore / 100) * circumference;

            let strengthsList = fit.strengths.map(s => `<li>${s}</li>`).join('');
            let gapsList = fit.gaps.map(g => `<li>${g}</li>`).join('');

            let bandClass = fit.fitBand.toLowerCase(); // high, medium, low

            let breakdownPrefHtml = fit.breakdown.hasPreferences ? `
                <div class="breakdown-item">
                    <div class="breakdown-label">Preferences</div>
                    <div class="breakdown-score">${fit.breakdown.preferences}/20</div>
                </div>
            ` : `
                <div class="breakdown-item">
                    <div class="breakdown-label">Preferences</div>
                    <div class="breakdown-score" style="color: var(--text-dark);">N/A</div>
                </div>
            `;

            fitHtml += `
                <div class="fitment-score-card">
                    <div class="fit-card-header">
                        <!-- Score indicator ring -->
                        <div class="score-circle-wrapper">
                            <svg width="64" height="64">
                                <circle class="score-circle-bg" cx="32" cy="32" r="28" />
                                <circle class="score-circle-progress" cx="32" cy="32" r="28" 
                                    style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${strokeDashoffset}; stroke: ${bandClass === 'high' ? 'var(--color-success)' : bandClass === 'medium' ? 'var(--color-warning)' : 'var(--color-danger)'};" />
                            </svg>
                            <div class="score-text">${fit.overallScore}</div>
                        </div>

                        <div class="fit-title-group">
                            <h4>${fit.jobTitle}</h4>
                            <span class="fit-company">${fit.company} • <span style="color:var(--color-secondary); font-size:11px;">(${originalJob && originalJob.source ? originalJob.source : 'Local Database'})</span> • <i class="fa-solid fa-location-dot"></i> ${originalJob ? getJobLocationText(originalJob) : 'Location N/A'}</span>
                        </div>

                        <span class="fit-band-badge ${bandClass}">${fit.fitBand} FIT</span>
                    </div>

                    <div class="breakdown-grid">
                        <div class="breakdown-item">
                            <div class="breakdown-label">Skills Match</div>
                            <div class="breakdown-score">${fit.breakdown.skills}/60</div>
                        </div>
                        <div class="breakdown-item">
                            <div class="breakdown-label">Seniority</div>
                            <div class="breakdown-score">${fit.breakdown.seniority}/20</div>
                        </div>
                        ${breakdownPrefHtml}
                    </div>

                    <div class="strengths-gaps-row">
                        <div class="sg-col strengths">
                            <h5>Key Strengths</h5>
                            <ul class="sg-list">${strengthsList || '<li>No matching advantages</li>'}</ul>
                        </div>
                        <div class="sg-col gaps">
                            <h5>Identified Gaps</h5>
                            <ul class="sg-list">${gapsList || '<li>No gaps identified</li>'}</ul>
                        </div>
                    </div>
                </div>
            `;
        });

        outcome4Content.innerHTML = fitHtml;
    }

    // -------------------------------------------------------------
    // AGENT 5: RECOMMENDATION
    // -------------------------------------------------------------
    const runAgent5Btn = document.getElementById('run-agent-5');
    const outcome5Content = document.getElementById('outcome-5-content');
    const outcomeBadge5 = document.getElementById('outcome-badge-5');

    runAgent5Btn.addEventListener('click', () => {
        if (!isAgentCompleted(4)) return;

        setAgentState(5, true, false);
        outcomeBadge5.innerText = "AGGREGATING...";
        outcomeBadge5.className = "badge warning";

        outcome5Content.innerHTML = `
            <div class="empty-state">
                <i class="fa-solid fa-circle-notch fa-spin"></i>
                <p>Generating recommendation analytics, rendering skills maps, and compiling cover letters...</p>
            </div>
        `;

        setTimeout(() => {
            // Aggregate values
            const evals = Object.values(state.fitments);
            const total = evals.length;
            let sumScore = 0;
            let high = 0;
            let med = 0;
            let low = 0;

            evals.forEach(fit => {
                sumScore += fit.overallScore;
                if (fit.fitBand === "High") high++;
                else if (fit.fitBand === "Medium") med++;
                else low++;
            });

            state.stats = {
                totalEvaluated: total,
                avgFitScore: total > 0 ? Math.round(sumScore / total) : 0,
                highCount: high,
                medCount: med,
                lowCount: low
            };

            setAgentState(5, false, true);
            outcomeBadge5.innerText = "COMPLETED";
            outcomeBadge5.className = "badge ready";

            renderAgent5Outcome();

        }, 1500);
    });

    function generateSpiderRadarChart(candSkills) {
        const defaultAxes = [
            { name: "Project Mgmt", val: 85 },
            { name: "Agile", val: 85 },
            { name: "Stakeholder Mgmt", val: 90 },
            { name: "Leadership", val: 95 },
            { name: "Strategic Planning", val: 88 },
            { name: "Communication", val: 92 },
            { name: "Budgeting", val: 75 },
            { name: "Data Analysis", val: 80 }
        ];

        if (candSkills && candSkills.length >= 4) {
            candSkills.slice(0, 8).forEach((sk, idx) => {
                if (defaultAxes[idx]) {
                    defaultAxes[idx].name = sk.name;
                    defaultAxes[idx].val = sk.proficiency === 'Expert' ? 95 : (sk.proficiency === 'Advanced' ? 85 : 75);
                }
            });
        }

        const totalAxes = defaultAxes.length;
        const centerX = 160, centerY = 150, radius = 95;
        
        let gridPolygons = "";
        [1.0, 0.75, 0.5, 0.25].forEach(scale => {
            let pts = [];
            for (let i = 0; i < totalAxes; i++) {
                const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
                const x = centerX + Math.cos(angle) * (radius * scale);
                const y = centerY + Math.sin(angle) * (radius * scale);
                pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
            }
            gridPolygons += `<polygon points="${pts.join(' ')}" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>`;
        });

        let spokes = "";
        let labels = "";
        let dataPts = [];

        for (let i = 0; i < totalAxes; i++) {
            const angle = (Math.PI * 2 / totalAxes) * i - Math.PI / 2;
            const xOuter = centerX + Math.cos(angle) * radius;
            const yOuter = centerY + Math.sin(angle) * radius;
            
            spokes += `<line x1="${centerX}" y1="${centerY}" x2="${xOuter.toFixed(1)}" y2="${yOuter.toFixed(1)}" stroke="rgba(255,255,255,0.1)" stroke-width="1.2"/>`;

            const scaleVal = defaultAxes[i].val / 100;
            const xData = centerX + Math.cos(angle) * (radius * scaleVal);
            const yData = centerY + Math.sin(angle) * (radius * scaleVal);
            dataPts.push(`${xData.toFixed(1)},${yData.toFixed(1)}`);

            const xLbl = centerX + Math.cos(angle) * (radius + 24);
            const yLbl = centerY + Math.sin(angle) * (radius + 12);
            const anchor = Math.abs(xLbl - centerX) < 15 ? "middle" : (xLbl > centerX ? "start" : "end");

            labels += `
                <text x="${xLbl.toFixed(1)}" y="${yLbl.toFixed(1)}" fill="#cbd5e1" font-size="9" font-weight="600" text-anchor="${anchor}">${defaultAxes[i].name}</text>
                <text x="${xLbl.toFixed(1)}" y="${(yLbl + 10).toFixed(1)}" fill="#ec4899" font-size="9" font-weight="bold" text-anchor="${anchor}">(${defaultAxes[i].val}%)</text>
                <circle cx="${xData.toFixed(1)}" cy="${yData.toFixed(1)}" r="3.5" fill="#06b6d4" stroke="#ec4899" stroke-width="1.5"/>
            `;
        }

        return `
            <svg viewBox="-30 -10 380 320" style="width:100%; height:auto; overflow:visible;">
                <defs>
                    <linearGradient id="spiderGrad" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stop-color="#ec4899" stop-opacity="0.4"/>
                        <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.3"/>
                    </linearGradient>
                </defs>
                ${gridPolygons}
                ${spokes}
                <polygon points="${dataPts.join(' ')}" fill="url(#spiderGrad)" stroke="#a855f7" stroke-width="2"/>
                ${labels}
            </svg>
        `;
    }

    function renderAgent5Outcome() {
        const evals = Object.values(state.fitments).sort((a,b) => b.overallScore - a.overallScore);
        const stats = state.stats;

        const topFit = evals[0] || null;
        const topRole = topFit ? topFit.jobTitle : (state.preferences && state.preferences.targetRoles[0] ? state.preferences.targetRoles[0] : 'Senior Technical Role');
        const candidateName = state.resumeData.candidateName || 'Sarah Chen';
        const candidateTitle = state.resumeData.candidateTitle || 'Senior Project Manager';
        const yearsExp = state.resumeData.yearsExperience || 8;

        // Scores calculation
        const avgSkillsMatch = evals.length > 0 ? Math.round(evals.reduce((a, b) => a + (b.breakdown.skills / 60 * 100), 0) / evals.length) : 89;
        const avgSeniorityMatch = evals.length > 0 ? Math.round(evals.reduce((a, b) => a + (b.breakdown.seniority / 20 * 100), 0) / evals.length) : 94;
        const avgPrefMatch = evals.length > 0 ? Math.round(evals.reduce((a, b) => a + ((b.breakdown.preferences !== null ? b.breakdown.preferences : 18) / 20 * 100), 0) / evals.length) : 91;

        const topFitId = topFit ? topFit.jobId : (state.jobs[0] ? state.jobs[0].id : null);

        // Custom recommendations row
        let recCardsHtml = "";
        
        evals.forEach(fit => {
            const originalJob = state.jobs.find(j => j.id === fit.jobId);
            
            let recMessage = "";
            let badgeClass = fit.fitBand.toLowerCase();
            
            if (fit.fitBand === "High") {
                recMessage = `<strong>Strong Match!</strong> Highly recommended to apply. Highlight your expert skills in <strong>${fit.strengths[0] ? fit.strengths[0].replace('Expert in ', '') : 'required skills'}</strong>. Your background aligns perfectly.`;
            } else if (fit.fitBand === "Medium") {
                recMessage = `<strong>Potential Match.</strong> Consider applying, but optimize your resume. Address the gap: <em>"${fit.gaps[0] ? fit.gaps[0] : 'missing skills'}"</em> prior to submission.`;
            } else {
                recMessage = `<strong>Low Match.</strong> We recommend passing on this opportunity. Your profile shows significant gaps in <em>"${fit.gaps[0] ? fit.gaps[0] : 'core areas'}"</em>.`;
            }

            recCardsHtml += `
                <div class="rec-card">
                    <div class="rec-score-badge" style="border-color: ${badgeClass === 'high' ? 'var(--color-success)' : badgeClass === 'medium' ? 'var(--color-warning)' : 'var(--color-danger)'};">
                        <span class="rec-score-val">${fit.overallScore}</span>
                        <span class="rec-score-lbl">Score</span>
                    </div>

                    <div class="rec-info-col">
                        <div class="rec-title-row">
                            <h4>${fit.jobTitle}</h4>
                            <span class="fit-band-badge ${badgeClass}">${fit.fitBand} FIT</span>
                        </div>
                        <div class="rec-meta-text">${fit.company} • <span class="badge online" style="font-size:9px; background:rgba(99,102,241,0.15); border:1px solid rgba(99,102,241,0.3); color:#a5b4fc; padding: 1px 6px; display:inline-block; vertical-align:middle; line-height:1.2; margin-top:-2px; margin-right:4px;">${originalJob && originalJob.source ? originalJob.source : 'Local Database'}</span> • <i class="fa-solid fa-location-dot" style="color:var(--color-secondary);"></i> ${originalJob ? getJobLocationText(originalJob) : 'Location N/A'} • ${originalJob ? originalJob.workMode : ''} • ${originalJob ? originalJob.employmentType : ''}</div>
                        <div class="rec-strategy-text" style="border-left-color: ${badgeClass === 'high' ? 'var(--color-success)' : badgeClass === 'medium' ? 'var(--color-warning)' : 'var(--color-danger)'};">
                            ${recMessage}
                        </div>
                    </div>

                    <div class="rec-action-col">
                        <button class="btn btn-sm btn-primary btn-generate-letter" data-jobid="${fit.jobId}">
                            <i class="fa-solid fa-file-signature"></i> Cover Letter
                        </button>
                        <button class="btn btn-sm btn-outline btn-view-full" data-jobid="${fit.jobId}">
                            <i class="fa-solid fa-expand"></i> Details
                        </button>
                    </div>
                </div>
            `;
        });

        const spiderChartMarkup = generateSpiderRadarChart(state.resumeData.skills);

        outcome5Content.innerHTML = `
            <div class="exec-hub-wrapper">
                <!-- Top Executive Header Banner -->
                <div class="exec-header-banner">
                    <div class="exec-header-left">
                        <div class="exec-brand-pill">
                            <i class="fa-solid fa-layer-group"></i> Aiam Analytics Hub
                        </div>
                        <h2>Job Application Executive Hub</h2>
                        <div class="exec-meta-line">
                            <span>Target Position: <strong>${topRole}</strong></span> | 
                            <span>Candidate: <strong>${candidateName}</strong> (${yearsExp} yrs exp)</span> | 
                            <span>Req ID: <strong>AIAM-405</strong></span>
                        </div>
                    </div>

                    <div class="exec-header-right">
                        <div class="kpi-match-block">
                            <span class="kpi-match-val">${stats.avgFitScore}%</span>
                            <span class="kpi-match-label">OVERALL MATCH</span>
                        </div>
                        <div class="kpi-sub-line">
                            <span>Applicants Pool: <strong>${stats.totalEvaluated}</strong></span> | 
                            <span class="status-active-pill">Status: Active</span>
                        </div>
                    </div>
                </div>

                <!-- Candidate Profile Glass Card & 3 Match Rings -->
                <div class="exec-profile-actions-row">
                    <div class="exec-candidate-card">
                        <div class="candidate-avatar-box">
                            <i class="fa-solid fa-user-tie"></i>
                        </div>
                        <div class="candidate-details">
                            <h4>${candidateName}</h4>
                            <span>${candidateTitle} • ${yearsExp} Years Exp</span>
                        </div>
                        <span class="badge ready" style="margin-left:auto;">Recommended</span>
                    </div>

                    <div class="match-rings-grid">
                        <div class="ring-score-card magenta">
                            <div class="ring-wrapper">
                                <svg width="60" height="60">
                                    <circle cx="30" cy="30" r="24" class="ring-bg" />
                                    <circle cx="30" cy="30" r="24" class="ring-progress magenta-stroke" stroke-dasharray="150" stroke-dashoffset="${150 - (avgSkillsMatch/100)*150}" />
                                </svg>
                                <span class="ring-val">${avgSkillsMatch}%</span>
                            </div>
                            <div class="ring-label">Skill Match</div>
                        </div>

                        <div class="ring-score-card cyan">
                            <div class="ring-wrapper">
                                <svg width="60" height="60">
                                    <circle cx="30" cy="30" r="24" class="ring-bg" />
                                    <circle cx="30" cy="30" r="24" class="ring-progress cyan-stroke" stroke-dasharray="150" stroke-dashoffset="${150 - (avgSeniorityMatch/100)*150}" />
                                </svg>
                                <span class="ring-val">${avgSeniorityMatch}%</span>
                            </div>
                            <div class="ring-label">Experience</div>
                        </div>

                        <div class="ring-score-card blue">
                            <div class="ring-wrapper">
                                <svg width="60" height="60">
                                    <circle cx="30" cy="30" r="24" class="ring-bg" />
                                    <circle cx="30" cy="30" r="24" class="ring-progress blue-stroke" stroke-dasharray="150" stroke-dashoffset="${150 - (avgPrefMatch/100)*150}" />
                                </svg>
                                <span class="ring-val">${avgPrefMatch}%</span>
                            </div>
                            <div class="ring-label">Cultural Fit</div>
                        </div>
                    </div>
                </div>

                <!-- Executive Middle Grid -->
                <div class="exec-middle-grid">
                    <div class="exec-left-col">
                        <div class="card exec-pathways-card" style="padding:16px;">
                            <h3 style="font-size:15px; font-weight:800; color:white; margin-bottom:12px;">Strategic Application Pathways</h3>
                            <div style="display:flex; flex-direction:column; gap:10px;">
                                ${recCardsHtml}
                            </div>
                        </div>
                    </div>

                    <div class="exec-right-col">
                        <div class="exec-spider-card">
                            <div class="spider-header">
                                <h4>SKILLSET ANALYSIS</h4>
                                <span class="skills-match-badge">SKILLS MATCH ${avgSkillsMatch}%</span>
                            </div>

                            <div class="spider-chart-container">
                                ${spiderChartMarkup}
                            </div>

                            <div class="exec-actions-container">
                                <h5>AI COVER LETTER RECOMMENDATIONS</h5>
                                <button class="btn-exec-action letter-action btn-generate-top-letter" data-jobid="${topFitId}">
                                    <div class="action-icon"><i class="fa-solid fa-file-signature"></i></div>
                                    <div class="action-text">
                                        <div class="action-title">Generate Cover Letter</div>
                                        <div class="action-sub">87% Relevance Match</div>
                                    </div>
                                </button>

                                <button class="btn-exec-action refine-action" id="btn-refine-app">
                                    <div class="action-icon"><i class="fa-solid fa-sliders"></i></div>
                                    <div class="action-text">
                                        <div class="action-title">Refine Application</div>
                                        <div class="action-sub">92% Confidence Score</div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Attach action handlers
        document.querySelectorAll('.btn-generate-letter, .btn-generate-top-letter').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-jobid');
                if (id) generateCoverLetterModal(id);
                else if (topFitId) generateCoverLetterModal(topFitId);
            });
        });

        document.querySelectorAll('.btn-view-full').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const id = btn.getAttribute('data-jobid');
                if (id) viewFullJobModal(id);
            });
        });

        const refineBtn = document.getElementById('btn-refine-app');
        if (refineBtn) {
            refineBtn.addEventListener('click', () => {
                switchAgentView(2); // Jump back to preferences for refinement
            });
        }
    }

    // -------------------------------------------------------------
    // MODALS & OVERLAYS (Cover Letter & Detail Views)
    // -------------------------------------------------------------
    // Dynamically insert modal element in page body
    const modalHtml = `
        <div class="modal-overlay" id="app-modal">
            <div class="modal-container">
                <div class="modal-header">
                    <h3 id="modal-title">Modal Title</h3>
                    <button class="modal-close" id="modal-close-btn">&times;</button>
                </div>
                <div class="modal-body" id="modal-body-content">
                    Modal content goes here...
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);

    const modalOverlay = document.getElementById('app-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body-content');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    modalCloseBtn.addEventListener('click', closeModal);
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) closeModal();
    });

    function openModal(title, bodyHtml) {
        modalTitle.innerText = title;
        modalBody.innerHTML = bodyHtml;
        modalOverlay.classList.add('active');
    }

    function closeModal() {
        modalOverlay.classList.remove('active');
    }

    function generateCoverLetterModal(jobId) {
        const job = state.jobs.find(j => j.id === jobId);
        const fit = state.fitments[jobId];
        if (!job || !fit) return;

        // Custom template generation
        const dateStr = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
        
        let matchingSkillsList = state.resumeData.skills
            .slice(0, 3)
            .map(s => s.name)
            .join(', ');

        const letterText = `
Dear Hiring Team at ${job.company},<br><br>

I am writing to express my strong interest in the <strong>${job.title}</strong> position currently open at your organization. Having reviewed the job requirements, I believe my professional experience as a <strong>${state.resumeData.candidateTitle}</strong> and my technical skill set align outstandingly with your expectations.<br><br>

Your job posting outlines critical demands for expertise in <strong>${job.skillsRequired.slice(0, 3).join(', ')}</strong>. Throughout my <strong>${state.resumeData.yearsExperience} years</strong> of development career, I have repeatedly utilized these methodologies. Specifically, I have built an expert-level proficiency in <strong>${matchingSkillsList}</strong>, which enables me to hit the ground running and add immediate value to the team at ${job.company}.<br><br>

I am highly excited by ${job.company}'s work in <em>${job.companyDetails}</em>. This role fits perfectly with my preference for a <strong>${job.employmentType} ${job.workMode}</strong> arrangement.<br><br>

Thank you for your time and consideration. I welcome the opportunity to discuss my qualifications further in an interview.<br><br>

Sincerely,<br>
<strong>${state.resumeData.candidateName}</strong>
        `;

        const letterHtml = `
            <div style="background-color: rgba(0,0,0,0.2); border: 1px solid var(--border-color); border-radius: 8px; padding: 20px; font-family: sans-serif; line-height: 1.5; max-height: 380px; overflow-y: auto; color: #d1d5db;">
                <div style="font-size: 11px; color: var(--text-dark); text-align: right; margin-bottom: 12px;">Generated by Aiam Agentic Agent Core • ${dateStr}</div>
                ${letterHtmlFormat(letterText)}
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
                <button class="btn btn-outline" id="btn-copy-letter"><i class="fa-solid fa-copy"></i> Copy to Clipboard</button>
                <button class="btn btn-primary" id="btn-close-letter">Done</button>
            </div>
        `;

        openModal(`AI Agent Application Strategy: ${job.company}`, letterHtml);

        document.getElementById('btn-close-letter').addEventListener('click', closeModal);
        document.getElementById('btn-copy-letter').addEventListener('click', () => {
            const tempTextarea = document.createElement('textarea');
            tempTextarea.value = letterText.replace(/<br>/g, '\n').replace(/<\/?[^>]+(>|$)/g, ""); // strip HTML
            document.body.appendChild(tempTextarea);
            tempTextarea.select();
            document.execCommand('copy');
            document.body.removeChild(tempTextarea);
            
            const copyBtn = document.getElementById('btn-copy-letter');
            copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fa-solid fa-copy"></i> Copy to Clipboard';
            }, 1500);
        });
    }

    function letterHtmlFormat(text) {
        return text;
    }

    function viewFullJobModal(jobId) {
        const job = state.jobs.find(j => j.id === jobId);
        if (!job) return;

        const bodyHtml = `
            <div class="job-detail-modal-body" style="display: flex; flex-direction: column; gap: 16px; color: #d1d5db;">
                <div>
                    <h3 style="color: white; font-size: 18px;">${job.title}</h3>
                    <span style="color: var(--color-secondary); font-weight: 600;">${job.company}</span>
                </div>
                
                <div style="display: flex; flex-wrap: wrap; gap: 6px; font-size: 11px;">
                    <span class="job-meta-pill" style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-location-dot"></i> ${getJobLocationText(job)}</span>
                    <span class="job-meta-pill" style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-briefcase"></i> ${job.workMode}</span>
                    <span class="job-meta-pill" style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-clock"></i> ${job.employmentType}</span>
                    <span class="job-meta-pill" style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-money-bill-wave"></i> ${job.salary ? job.salary.toLocaleString() : 'N/A'} ${job.currency}</span>
                    <span class="job-meta-pill" style="background: rgba(255,255,255,0.05); padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-arrow-up-right-dots"></i> Seniority: ${job.seniority}</span>
                    <span class="job-meta-pill" style="background: rgba(99, 102, 241, 0.15); border: 1px solid rgba(99, 102, 241, 0.3); color: #a5b4fc; padding: 4px 8px; border-radius: 4px;"><i class="fa-solid fa-circle-nodes"></i> Source: ${job.source || 'Local Database'}</span>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 12px;">
                    <h4 style="color: white; font-size: 13px; text-transform: uppercase; margin-bottom: 6px;">Required Skills</h4>
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                        ${job.skillsRequired.map(s => `<span class="job-skill-badge" style="background: rgba(99, 102, 241, 0.1); border-color: rgba(99, 102, 241, 0.2); color: #a5b4fc; padding: 4px 8px; border-radius: 4px;">${s}</span>`).join('')}
                    </div>
                </div>

                <div style="border-top: 1px solid var(--border-color); padding-top: 12px; font-size:12px; line-height: 1.6;">
                    <h4 style="color: white; font-size: 13px; text-transform: uppercase; margin-bottom: 6px;">Company Overview</h4>
                    <p>${job.companyDetails}</p>
                    
                    <h4 style="color: white; font-size: 13px; text-transform: uppercase; margin-top: 12px; margin-bottom: 6px;">Job Description</h4>
                    <p>${job.description}</p>

                    <h4 style="color: white; font-size: 13px; text-transform: uppercase; margin-top: 12px; margin-bottom: 6px;">Qualification Criteria</h4>
                    <p>${job.qualificationRequired}</p>
                </div>
            </div>
            <div style="display: flex; gap: 10px; margin-top: 20px; justify-content: flex-end;">
                <button class="btn btn-outline" id="btn-modal-close">Close</button>
            </div>
        `;

        openModal("Detailed Job Posting Summary", bodyHtml);
        document.getElementById('btn-modal-close').addEventListener('click', closeModal);
    }

    // -------------------------------------------------------------
    // ORCHESTRATION WORKFLOW PANEL RENDERING & UTILITIES
    // -------------------------------------------------------------
    function updateOrchestratorVisualizer() {
        const activeNodeLabel = document.getElementById('orch-active-agent');
        const progressLabel = document.getElementById('orch-progress');
        const skillsCountLabel = document.getElementById('orch-skills-count');
        const jobsCountLabel = document.getElementById('orch-jobs-count');

        let currentActive = "None";
        for (let i = 1; i <= 5; i++) {
            const wrapper = document.getElementById(`node-a${i}`);
            if (!wrapper) continue;

            const item = wrapper.querySelector('.node-item');
            const statusVal = wrapper.querySelector('.node-status-val');

            const isRunning = isAgentRunning(i);
            const isCompleted = isAgentCompleted(i);

            // Clear classes
            item.classList.remove('status-idle', 'status-running', 'status-completed');

            if (isRunning) {
                item.classList.add('status-running');
                statusVal.innerText = "Running";
                statusVal.style.color = "var(--color-warning)";
                currentActive = `Agent ${i}`;
            } else if (isCompleted) {
                item.classList.add('status-completed');
                statusVal.innerText = "Completed";
                statusVal.style.color = "var(--color-success)";
            } else {
                item.classList.add('status-idle');
                statusVal.innerText = "Idle";
                statusVal.style.color = "var(--text-dark)";
            }
        }

        if (activeNodeLabel) activeNodeLabel.innerText = currentActive;
        if (progressLabel) progressLabel.innerText = `${state.pipelineProgress}%`;
        if (skillsCountLabel) skillsCountLabel.innerText = `${state.resumeData.skills ? state.resumeData.skills.length : 0} Skills`;
        if (jobsCountLabel) jobsCountLabel.innerText = `${state.jobs ? state.jobs.length : 0} Listings`;

        // Update arrows
        const arrow12 = document.getElementById('arrow-1-2');
        const arrow23 = document.getElementById('arrow-2-3');
        const arrow34 = document.getElementById('arrow-3-4');
        const arrow45 = document.getElementById('arrow-4-5');

        if (arrow12) {
            if (isAgentCompleted(1)) arrow12.classList.add('active');
            else arrow12.classList.remove('active');
        }
        if (arrow23) {
            if (isAgentCompleted(2)) arrow23.classList.add('active');
            else arrow23.classList.remove('active');
        }
        if (arrow34) {
            if (isAgentCompleted(3)) arrow34.classList.add('active');
            else arrow34.classList.remove('active');
        }
        if (arrow45) {
            if (isAgentCompleted(4)) arrow45.classList.add('active');
            else arrow45.classList.remove('active');
        }
    }

    const runOrchBtn = document.getElementById('run-full-orchestration');
    const orchConsole = document.getElementById('orchestrator-console');

    function logOrch(msg, type = 'normal') {
        const line = document.createElement('div');
        line.className = `console-line ${type}`;
        line.innerText = `[${new Date().toLocaleTimeString()}] ${msg}`;
        orchConsole.appendChild(line);
        orchConsole.scrollTop = orchConsole.scrollHeight;
    }

    runOrchBtn.addEventListener('click', async () => {
        runOrchBtn.disabled = true;
        runOrchBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Running Swarm...';
        
        orchConsole.innerHTML = "";
        logOrch("=== STARTING FULL PIPELINE ORCHESTRATION ===", "system");

        try {
            // STEP 1: RESUME PARSING
            logOrch("Dispatched Agent A1: Resume Parser", "system");
            setAgentState(1, true, false);
            
            // If resume text is empty, load default demo text
            if (!resumeTextInput.value.trim() && !state.resumeData.rawPreset) {
                logOrch("No resume detected. Loading demo resume data automatically...", "query");
                document.getElementById('pref-target-roles').value = "AI Specialist, AI Solution architect, SAP Functional";
                document.getElementById('pref-city').value = "Chicago";
                document.getElementById('pref-country').value = "USA";
                
                const demoResumeText = `CANDIDATE: Amit Sharma
TITLE: Senior Java & Cloud Developer
EXPERIENCE: 8 Years

SKILLS:
Java, Spring Boot, SQL, AWS, Kubernetes, Docker, Git, CI/CD, React, TypeScript, Python`;
                resumeTextInput.value = demoResumeText;
                state.resumeData.rawPreset = demoResumeText;
            }

            await new Promise(r => setTimeout(r, 1200));
            
            const parsed = parseResumeText(resumeTextInput.value);
            state.resumeData.candidateName = parsed.candidateName;
            state.resumeData.candidateTitle = parsed.candidateTitle;
            state.resumeData.jobPositions = parsed.jobPositions;
            state.resumeData.yearsExperience = parsed.yearsExperience;
            state.resumeData.experienceSummary = parsed.experienceSummary;
            state.resumeData.qualification = parsed.qualification;
            state.resumeData.summary = parsed.summary;
            state.resumeData.skills = parsed.skills;

            setAgentState(1, false, true);
            outcomeBadge1.innerText = "COMPLETED";
            outcomeBadge1.className = "badge ready";
            renderAgent1Outcome();
            logOrch(`Agent A1 parsed resume successfully. Candidate Name: ${parsed.candidateName}. Found ${parsed.skills.length} skills.`, "match");

            // STEP 2: PREFERENCES CONFIGURATION
            logOrch("Dispatched Agent A2: Preferences Configuration", "system");
            setAgentState(2, true, false);
            await new Promise(r => setTimeout(r, 1000));

            const rolesInput = document.getElementById('pref-target-roles').value.trim() || "Software Developer";
            const workModes = Array.from(document.querySelectorAll('input[name="work-mode"]:checked')).map(el => el.value);
            const employmentTypes = Array.from(document.querySelectorAll('input[name="emp-type"]:checked')).map(el => el.value);
            const minSal = parseInt(document.getElementById('pref-salary-min').value) || null;
            const maxSal = parseInt(document.getElementById('pref-salary-max').value) || null;
            const currency = document.getElementById('pref-salary-currency').value;
            const city = document.getElementById('pref-city').value.trim();
            const country = document.getElementById('pref-country').value.trim();
            const keywords = document.getElementById('pref-keywords').value.split(',').map(s => s.trim()).filter(Boolean);
            const excludeKeywords = document.getElementById('pref-exclude-keywords').value.split(',').map(s => s.trim()).filter(Boolean);

            state.preferences = {
                targetRoles: rolesInput.split(',').map(s => s.trim()).filter(Boolean),
                workModes,
                employmentTypes,
                salaryMin: minSal,
                salaryMax: maxSal,
                salaryCurrency: currency,
                city,
                country,
                keywords,
                excludeKeywords
            };

            setAgentState(2, false, true);
            outcomeBadge2.innerText = "COMPLETED";
            outcomeBadge2.className = "badge ready";
            renderAgent2Outcome();
            logOrch(`Agent A2 preferences saved. Target Roles: "${state.preferences.targetRoles.join(', ')}". Location: ${city || 'Any'}, ${country || 'Any'}.`, "match");

            // STEP 3: SEARCH CRAWLER
            logOrch("Dispatched Agent A3: Google Jobs Crawler", "system");
            setAgentState(3, true, false);
            await new Promise(r => setTimeout(r, 1500));

            // Extract and combine Agent 1 & Agent 2 inputs
            const orchA1Roles = (state.resumeData.jobPositions || state.resumeData.candidateTitle || "").split(',').map(s => s.trim()).filter(Boolean);
            const orchA1Skills = (state.resumeData.skills || []).filter(s => s.priority === 'High' || s.priority === 'Medium').map(s => s.name);
            const orchA2Roles = state.preferences.targetRoles || [];
            const orchA2Keywords = state.preferences.keywords || [];

            const orchRolesSet = new Set([...orchA2Roles, ...orchA1Roles]);
            const qStr = Array.from(orchRolesSet).join(', ');

            const orchKeywordsSet = new Set([...orchA2Keywords, ...orchA1Skills]);
            const kws = Array.from(orchKeywordsSet).join(',');

            const exKws = state.preferences.excludeKeywords.join(',');
            const modes = state.preferences.workModes.join(',');
            const types = state.preferences.employmentTypes.join(',');
            const searchCity = state.preferences.city || '';
            const searchCountry = state.preferences.country || '';

            logOrch(`Combined Agent A1 & A2 Inputs -> Search Roles: "${qStr}" | Skills & Keywords: "${kws}" | Location: ${searchCity || 'Any'}, ${searchCountry || 'Any'}`, "query");
            logOrch(`Querying live SerpAPI backend for: "${qStr}"`, "query");

            const searchUrl = `/api/search?q=${encodeURIComponent(qStr)}&keywords=${encodeURIComponent(kws)}&excludeKeywords=${encodeURIComponent(exKws)}&workModes=${encodeURIComponent(modes)}&employmentTypes=${encodeURIComponent(types)}&city=${encodeURIComponent(searchCity)}&country=${encodeURIComponent(searchCountry)}`;

            try {
                const response = await fetch(searchUrl);
                if (!response.ok) throw new Error("SERVER_ERROR");
                
                const liveJobs = await response.json();
                state.jobs = liveJobs;
                logOrch(`Agent A3 crawler successfully fetched ${liveJobs.length} matching job records via SerpAPI.`, "match");
            } catch (err) {
                logOrch("Backend offline or missing key. Fetching simulated records from fallback database...", "query");
                const matchedJobs = JOB_DATABASE.filter(job => {
                    const matchesRole = Array.from(orchRolesSet).some(role => 
                        job.title.toLowerCase().includes(role.toLowerCase())
                    );
                    const matchesWorkMode = state.preferences.workModes.includes(job.workMode);
                    const matchesEmpType = state.preferences.employmentTypes.includes(job.employmentType);
                    return (matchesRole || Array.from(orchKeywordsSet).some(kw => job.skillsRequired.map(s => s.toLowerCase()).includes(kw.toLowerCase()))) 
                           && matchesWorkMode && matchesEmpType;
                });
                state.jobs = matchedJobs.length > 0 ? matchedJobs : JOB_DATABASE.slice(0, 4);
                logOrch(`Agent A3 simulation retrieved ${state.jobs.length} matching job records.`, "match");
            }

            setAgentState(3, false, true);
            outcomeBadge3.innerText = "COMPLETED";
            outcomeBadge3.className = "badge ready";
            renderAgent3Outcome();
            renderJobSelectionForFitment();

            // STEP 4: FITMENT ENGINE
            logOrch("Dispatched Agent A4: Fitment Assessment Engine", "system");
            setAgentState(4, true, false);
            await new Promise(r => setTimeout(r, 1500));

            logOrch(`Evaluating fitment scoring matrix for ${state.jobs.length} jobs against skills_file_v1...`, "query");
            state.fitments = {};
            state.jobs.forEach(job => {
                const fitReport = calculateFitmentScore(job, state.resumeData, state.preferences);
                state.fitments[job.id] = fitReport;
                logOrch(`Job "${job.title}" scored: ${fitReport.overallScore}% (${fitReport.fitBand} Match)`, "match");
            });

            setAgentState(4, false, true);
            outcomeBadge4.innerText = "COMPLETED";
            outcomeBadge4.className = "badge ready";
            renderAgent4Outcome();

            // STEP 5: RECOMMENDATION
            logOrch("Dispatched Agent A5: Recommendation Swarms", "system");
            setAgentState(5, true, false);
            await new Promise(r => setTimeout(r, 1200));

            const evals = Object.values(state.fitments);
            const total = evals.length;
            let sumScore = 0, high = 0, med = 0, low = 0;
            evals.forEach(fit => {
                sumScore += fit.overallScore;
                if (fit.fitBand === "High") high++;
                else if (fit.fitBand === "Medium") med++;
                else low++;
            });

            state.stats = {
                totalEvaluated: total,
                avgFitScore: total > 0 ? Math.round(sumScore / total) : 0,
                highCount: high,
                medCount: med,
                lowCount: low
            };

            setAgentState(5, false, true);
            outcomeBadge5.innerText = "COMPLETED";
            outcomeBadge5.className = "badge ready";
            renderAgent5Outcome();
            logOrch("Agent A5 finalized dashboard metrics, generated cover letter drafts and target profile analysis.", "match");

            logOrch("=== FULL PIPELINE ORCHESTRATION COMPLETED SUCCESSFULLY ===", "system");

        } catch (error) {
            logOrch(`Orchestration error during execution: ${error.message}`, "system");
            console.error(error);
        } finally {
            runOrchBtn.disabled = false;
            runOrchBtn.innerHTML = '<i class="fa-solid fa-play"></i> Execute Full Pipeline';
        }
    });
});

// =============================================================
// GLOBAL CAREER INTELLIGENCE UTILITIES (Exposed for test suites)
// =============================================================
function parseResumeText(text) {
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
    let name = "Resume Candidate";
    let jobPositions = "Software Engineer";
    let years = 5;
    let qualification = "B.S. in Computer Science";
    let experienceSummary = "5+ years of professional technical software development experience.";
    let skills = [];

    // 1. CANDIDATE NAME
    const nameMatch = text.match(/(?:CANDIDATE|NAME):\s*(.*)/i);
    if (nameMatch) {
        name = nameMatch[1].trim();
    } else if (lines.length > 0 && lines[0].length < 45 && !lines[0].toLowerCase().includes('resume') && !lines[0].toLowerCase().includes('cv')) {
        name = lines[0].replace(/^#+\s*/, '');
    }

    // 2. JOB POSITIONS
    const posMatch = text.match(/(?:JOB POSITIONS?|POSITIONS?|TITLE|ROLES?):\s*(.*)/i);
    if (posMatch) {
        jobPositions = posMatch[1].trim();
    } else {
        const titleDict = [
            "Senior Java Developer", "Java Developer", "Frontend Engineer", "Frontend Developer",
            "Backend Engineer", "Backend Developer", "Fullstack Engineer", "Fullstack Developer",
            "Software Engineer", "Software Developer", "Data Scientist", "Data Analyst",
            "ML Engineer", "Machine Learning Engineer", "DevOps Engineer", "Cloud Architect",
            "AI Specialist", "AI Solution Architect", "Product Manager", "QA Engineer", "SAP Functional Consultant"
        ];
        const foundPositions = [];
        titleDict.forEach(pos => {
            if (new RegExp('\\b' + pos.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&') + '\\b', 'i').test(text)) {
                foundPositions.push(pos);
            }
        });
        if (foundPositions.length > 0) {
            jobPositions = Array.from(new Set(foundPositions)).slice(0, 3).join(', ');
        }
    }

    // 3. EXPERIENCES
    const expMatch = text.match(/EXPERIENCE:\s*(\d+)/i);
    if (expMatch) {
        years = parseInt(expMatch[1]);
    } else {
        const yearsRegex = /(\d+)\+?\s*(?:years|yrs)\b/i;
        const yearsMatch = text.match(yearsRegex);
        if (yearsMatch) {
            years = parseInt(yearsMatch[1]);
        }
    }

    const expSectionMatch = text.match(/(?:EXPERIENCE HIGHLIGHTS|EXPERIENCE SUMMARY|WORK HISTORY|BACKGROUND|SUMMARY):\s*([\s\S]*?)(?=\n\s*\n|\n[A-Z\s]+:|$)/i);
    if (expSectionMatch && expSectionMatch[1].trim().length > 15) {
        experienceSummary = expSectionMatch[1].trim().replace(/\s+/g, ' ');
        if (experienceSummary.length > 220) experienceSummary = experienceSummary.substring(0, 220) + '...';
    } else {
        experienceSummary = `${years}+ years of professional software engineering and project execution experience.`;
    }

    // 4. QUALIFICATION / EDUCATION
    const qualMatch = text.match(/(?:QUALIFICATION|EDUCATION|DEGREE|CERTIFICATION|CERTIFICATIONS):\s*(.*)/i);
    if (qualMatch) {
        qualification = qualMatch[1].trim();
    } else {
        const degrees = [];
        if (/bachelor|b\.s|b\.e|b\.tech/i.test(text)) degrees.push("Bachelor's Degree in CS/IT");
        if (/master|m\.s|m\.e|m\.tech|mba/i.test(text)) degrees.push("Master's Degree");
        if (/phd|doctorate/i.test(text)) degrees.push("Ph.D.");
        if (/aws certified/i.test(text)) degrees.push("AWS Certified");
        if (/sap certified/i.test(text)) degrees.push("SAP Certified Professional");
        if (/scrum master|pmp/i.test(text)) degrees.push("Agile/PMP Certified");
        
        if (degrees.length > 0) {
            qualification = degrees.join(', ');
        } else {
            qualification = years >= 7 ? "B.S. in Computer Science / Cloud Certified" : "Bachelor's Degree in Computer Science";
        }
    }

    // 5. SKILLS
    const skillsDictionary = [
        "React", "Angular", "Vue", "TypeScript", "JavaScript", "HTML5", "CSS/SASS", "Tailwind",
        "Node.js", "Express", "Python", "Django", "Flask", "Java", "Spring Boot", "Spring",
        "SQL", "MySQL", "PostgreSQL", "MongoDB", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
        "Git", "CI/CD", "Machine Learning", "Deep Learning", "NLP", "Pandas", "NumPy", "TensorFlow",
        "PyTorch", "C++", "C#", "Go", "Rust", "SAP", "ABAP", "HANA"
    ];

    skillsDictionary.forEach(skillName => {
        const escaped = skillName.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const reg = new RegExp('\\b' + escaped + '\\b', 'i');
        if (reg.test(text)) {
            let proficiency = "Intermediate";
            if (years >= 8) proficiency = "Expert";
            else if (years >= 5) proficiency = "Advanced";
            else if (years <= 2) proficiency = "Beginner";

            skills.push({
                name: skillName,
                priority: "Medium",
                proficiency: proficiency
            });
        }
    });

    if (skills.length === 0) {
        skills = [
            { name: "JavaScript", priority: "High", proficiency: "Advanced" },
            { name: "Git", priority: "Medium", proficiency: "Intermediate" }
        ];
    }

    return {
        candidateName: name,
        candidateTitle: jobPositions,
        jobPositions: jobPositions,
        yearsExperience: years,
        experienceSummary: experienceSummary,
        qualification: qualification,
        summary: experienceSummary,
        skills: skills
    };
}

function combineParsedProfiles(parsedFile, parsedPasted, fileObj) {
    if (!parsedFile) return parsedPasted;
    if (!parsedPasted) return parsedFile;

    let name = parsedPasted.candidateName;
    if ((!name || name === "Resume Candidate" || name === "Candidate Profile") && parsedFile.candidateName) {
        name = parsedFile.candidateName;
    }

    const posSet = new Set();
    if (parsedFile.jobPositions) parsedFile.jobPositions.split(',').forEach(p => posSet.add(p.trim()));
    if (parsedPasted.jobPositions) parsedPasted.jobPositions.split(',').forEach(p => posSet.add(p.trim()));
    const combinedPositions = Array.from(posSet).filter(Boolean).join(', ');

    const maxYears = Math.max(parsedFile.yearsExperience || 0, parsedPasted.yearsExperience || 0);

    let combinedExp = parsedFile.experienceSummary || "";
    if (parsedPasted.experienceSummary && !combinedExp.includes(parsedPasted.experienceSummary)) {
        combinedExp = combinedExp ? `${combinedExp} | ${parsedPasted.experienceSummary}` : parsedPasted.experienceSummary;
    }

    const qualSet = new Set();
    if (parsedFile.qualification) parsedFile.qualification.split(',').forEach(q => qualSet.add(q.trim()));
    if (parsedPasted.qualification) parsedPasted.qualification.split(',').forEach(q => qualSet.add(q.trim()));
    const combinedQual = Array.from(qualSet).filter(Boolean).join(', ');

    const skillsMap = new Map();
    const profRank = { "Beginner": 1, "Intermediate": 2, "Advanced": 3, "Expert": 4 };
    const prioRank = { "Low": 1, "Medium": 2, "High": 3 };

    [...(parsedFile.skills || []), ...(parsedPasted.skills || [])].forEach(s => {
        const key = s.name.toLowerCase();
        if (!skillsMap.has(key)) {
            skillsMap.set(key, { ...s });
        } else {
            const existing = skillsMap.get(key);
            if ((profRank[s.proficiency] || 0) > (profRank[existing.proficiency] || 0)) {
                existing.proficiency = s.proficiency;
            }
            if ((prioRank[s.priority] || 0) > (prioRank[existing.priority] || 0)) {
                existing.priority = s.priority;
            }
        }
    });

    const combinedSkills = Array.from(skillsMap.values());
    const fileNameStr = fileObj ? fileObj.name : "Attached Resume File";

    return {
        candidateName: name || "Resume Candidate",
        candidateTitle: combinedPositions || "Software Engineer",
        jobPositions: combinedPositions || "Software Engineer",
        yearsExperience: maxYears,
        experienceSummary: combinedExp,
        qualification: combinedQual,
        summary: combinedExp,
        skills: combinedSkills,
        source: `Combined (${fileNameStr} + Pasted Text)`
    };
}
