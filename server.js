/**
 * Aiam Agentic Job Search Native Backend Server
 * Uses ONLY Node.js built-in modules (http, fs, path, url) to bypass EPERM/locking issues.
 * Serves static files and proxies SerpAPI Google Jobs Search requests using native fetch.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const { exec } = require('child_process');

// -------------------------------------------------------------
// NATIVE .ENV PARSER
// -------------------------------------------------------------
function loadEnv() {
    try {
        const envPath = path.join(__dirname, '.env');
        if (fs.existsSync(envPath)) {
            const content = fs.readFileSync(envPath, 'utf8');
            content.split(/\r?\n/).forEach(line => {
                // Ignore comments and empty lines
                if (line.trim().startsWith('#') || !line.trim()) return;
                const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
                if (match) {
                    const key = match[1];
                    let value = match[2] || '';
                    // Clean surrounding quotes
                    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                    process.env[key] = value.trim();
                }
            });
        }
    } catch (e) {
        console.error("Failed to parse .env file:", e.message);
    }
}

// Load configurations
loadEnv();

const PORT = process.env.PORT || 8080;
const SERPAPI_KEY = process.env.SERPAPI_KEY || '';
const FANTASTIC_JOBS_API_KEY = process.env.FANTASTIC_JOBS_API_KEY || process.env.SERPAPI_KEY || '';

// Mime types dictionary for static server
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
};

// -------------------------------------------------------------
// PARSING & STANDARDIZING DEDUCTIONS
// -------------------------------------------------------------
const COMMON_SKILLS = [
    "React", "Angular", "Vue", "TypeScript", "JavaScript", "HTML5", "CSS/SASS", "Tailwind",
    "Node.js", "Express", "Python", "Django", "Flask", "Java", "Spring Boot", "Spring",
    "SQL", "MySQL", "PostgreSQL", "MongoDB", "AWS", "Azure", "GCP", "Docker", "Kubernetes",
    "Git", "CI/CD", "Machine Learning", "Deep Learning", "NLP", "Pandas", "NumPy", "TensorFlow",
    "PyTorch", "C++", "C#", "Go", "Rust", "SAP", "ABAP", "HANA"
];

function extractSkills(descriptionText) {
    const skills = [];
    const lowerText = descriptionText.toLowerCase();
    COMMON_SKILLS.forEach(skill => {
        const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const reg = new RegExp('\\b' + escaped + '\\b', 'i');
        if (reg.test(lowerText)) {
            skills.push(skill);
        }
    });
    if (skills.length === 0) {
        if (lowerText.includes('frontend') || lowerText.includes('web')) {
            return ["React", "JavaScript", "HTML5", "CSS/SASS"];
        }
        if (lowerText.includes('data') || lowerText.includes('ml')) {
            return ["Python", "SQL", "Machine Learning", "Pandas"];
        }
        if (lowerText.includes('sap') || lowerText.includes('erp')) {
            return ["SAP", "ABAP", "HANA", "SQL"];
        }
        return ["Software Development", "Git"];
    }
    return skills.slice(0, 6);
}

function parseWorkMode(job) {
    const location = (job.location || '').toLowerCase();
    const description = (job.description || '').toLowerCase();
    const wfh = job.detected_extensions && (job.detected_extensions.work_from_home || job.detected_extensions.remote);

    if (job.remote === true || job.remote === 'true' || wfh || location.includes('remote') || description.includes('remote') || description.includes('work from home') || description.includes('wfh') || description.includes('telecommute')) {
        return "Remote";
    }
    if (location.includes('hybrid') || description.includes('hybrid') || description.includes('flexible') || description.includes('partially remote')) {
        return "Hybrid";
    }
    return "Onsite";
}

function parseEmploymentType(job) {
    let typeVal = job.employment_type || job.ai_employment_type || (job.detected_extensions && job.detected_extensions.schedule_type) || '';
    if (Array.isArray(typeVal)) {
        typeVal = typeVal.join(', ');
    }
    const type = String(typeVal).toLowerCase();
    const desc = (job.description || '').toLowerCase();


    if (type.includes('full') || desc.includes('full-time') || desc.includes('full time')) {
        return "Full Time";
    }
    if (type.includes('contract') || type.includes('temp') || desc.includes('contract') || desc.includes('freelance')) {
        return "Contract";
    }
    if (type.includes('part') || desc.includes('part-time') || desc.includes('part time')) {
        return "Part Time";
    }
    return "Full Time";
}

function parseSalary(job) {
    const salaryStr = job.salary || '';
    if (!salaryStr) return null;

    const cleanStr = salaryStr.replace(/,/g, '');
    const matches = cleanStr.match(/\b\d{5,6}\b/g);

    if (matches && matches.length > 0) {
        const nums = matches.map(Number);
        if (nums.length === 2) {
            return Math.round((nums[0] + nums[1]) / 2);
        }
        return nums[0];
    }
    
    const hourlyMatches = cleanStr.match(/\b\d{2,3}\b/g);
    if (hourlyMatches && hourlyMatches.length > 0 && salaryStr.toLowerCase().includes('hour')) {
        const rates = hourlyMatches.map(Number);
        const avgHourly = rates.length === 2 ? (rates[0] + rates[1]) / 2 : rates[0];
        return Math.round(avgHourly * 2000);
    }
    return null;
}

function parseSeniority(title) {
    const lowerTitle = title.toLowerCase();
    if (lowerTitle.includes('lead') || lowerTitle.includes('principal') || lowerTitle.includes('architect') || lowerTitle.includes('director') || lowerTitle.includes('staff')) {
        return "Lead / Principal";
    }
    if (lowerTitle.includes('senior') || lowerTitle.includes('sr.') || lowerTitle.includes('sr ')) {
        return "Senior";
    }
    if (lowerTitle.includes('junior') || lowerTitle.includes('jr.') || lowerTitle.includes('entry') || lowerTitle.includes('intern')) {
        return "Junior";
    }
    return "Mid-level";
}

function parseCityCountry(location, prefCity, prefCountry) {
    if (!location) {
        return { city: prefCity || '', country: prefCountry || 'Global' };
    }
    const parts = location.split(',').map(s => s.trim()).filter(Boolean);
    let city = '';
    let country = '';

    if (parts.length >= 2) {
        city = parts[0];
        country = parts[parts.length - 1];
    } else if (parts.length === 1) {
        country = parts[0];
        city = prefCity || '';
    } else {
        city = prefCity || '';
        country = prefCountry || 'Global';
    }

    if (!city && prefCity) city = prefCity;
    if (!country && prefCountry) country = prefCountry;

    return { city, country };
}

function parseCountry(location) {
    if (!location) return "Global";
    const parts = location.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length > 0) {
        return parts[parts.length - 1];
    }
    return location;
}

// -------------------------------------------------------------
// CORE HTTP SERVER
// -------------------------------------------------------------
const server = http.createServer(async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API Route: /api/search
    if (pathname === '/api/search' && req.method === 'GET') {
        if (!FANTASTIC_JOBS_API_KEY && !SERPAPI_KEY) {
            console.warn("Both Fantastic.jobs API Key and SerpAPI Key are missing in server environment.");
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: "MISSING_KEYS",
                message: "No search API keys configured. Please configure FANTASTIC_JOBS_API_KEY or SERPAPI_KEY in your .env file."
            }));
            return;
        }

        const { q, keywords, excludeKeywords, workModes, employmentTypes, city, country } = parsedUrl.query;

        if (!q) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: "QUERY_REQUIRED", message: "Target search query 'q' is required." }));
            return;
        }

        let locationString = '';
        if (city && country) {
            locationString = `${city}, ${country}`;
        } else if (city) {
            locationString = city;
        } else if (country) {
            locationString = country;
        }

        try {
            console.log(`\n--- Initiating Combined Multi-API Job Search ---`);
            console.log(`Target Roles Input: "${q}"`);
            if (locationString) console.log(`Target Location: "${locationString}"`);

            const rolesList = q.split(/,| OR /i).map(r => r.trim()).filter(Boolean);
            const primaryRole = rolesList[0] || q;
            const primaryKw = keywords ? keywords.split(',')[0].trim() : '';
            const combinedSearchTerm = primaryKw ? `${primaryRole} ${primaryKw}` : primaryRole;

            let fantasticJobsRaw = [];
            let serpJobsRaw = [];

            // --- 1. Query Fantastic.jobs API ---
            if (FANTASTIC_JOBS_API_KEY) {
                try {
                    console.log(`Querying Fantastic.jobs API for primary search term: "${combinedSearchTerm}"...`);
                    let response;
                    try {
                        let mainUrl = `https://data.fantastic.jobs/v1/active-ats?time_frame=6m`;
                        if (combinedSearchTerm) mainUrl += `&title=${encodeURIComponent(combinedSearchTerm)}`;
                        if (locationString) mainUrl += `&location=${encodeURIComponent(locationString)}`;

                        response = await fetch(mainUrl, {
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${FANTASTIC_JOBS_API_KEY}`
                            }
                        });
                        if (!response.ok) {
                            const errBody = await response.json().catch(() => ({}));
                            throw new Error(`Direct API returned HTTP ${response.status}: ${errBody.detail || errBody.message || 'Forbidden'}`);
                        }
                    } catch (err) {
                        console.log(`Direct Fantastic.jobs endpoint failed: ${err.message}. Trying RapidAPI endpoint...`);
                        const rapidUrl = `https://job-postings-feed-api.p.rapidapi.com/active-ats?time_frame=6m&title=${encodeURIComponent(combinedSearchTerm)}` + (locationString ? `&location=${encodeURIComponent(locationString)}` : '');
                        response = await fetch(rapidUrl, {
                            headers: {
                                'x-rapidapi-key': FANTASTIC_JOBS_API_KEY,
                                'x-rapidapi-host': 'job-postings-feed-api.p.rapidapi.com'
                            }
                        });
                        if (response && !response.ok) {
                            const errBody = await response.json().catch(() => ({}));
                            console.log(`RapidAPI endpoint also failed: HTTP ${response.status}: ${errBody.detail || errBody.message || 'Forbidden'}`);
                        }
                    }

                    if (response && response.ok) {
                        const data = await response.json();
                        const results = data.results || data.jobs || (Array.isArray(data) ? data : []);
                        console.log(`Fetched ${results.length} raw jobs from Fantastic.jobs API.`);
                        results.forEach(j => fantasticJobsRaw.push(j));
                    }
                } catch (err) {
                    console.error("Fantastic.jobs search query failed:", err.message);
                }
            }

            // --- 2. Query SerpAPI Google Jobs ---
            if (SERPAPI_KEY) {
                try {
                    console.log(`Querying SerpAPI Google Jobs for primary search term: "${combinedSearchTerm}"...`);
                    let serpUrl = `https://serpapi.com/search.json?engine=google_jobs&hl=en&q=${encodeURIComponent(combinedSearchTerm)}&api_key=${SERPAPI_KEY}`;
                    if (locationString) serpUrl += `&l=${encodeURIComponent(locationString)}`;

                    const response = await fetch(serpUrl);
                    if (response.ok) {
                        const data = await response.json();
                        const results = data.jobs_results || [];
                        console.log(`Fetched ${results.length} raw jobs from SerpAPI Google Jobs.`);
                        results.forEach(j => serpJobsRaw.push(j));
                    }
                } catch (err) {
                    console.error("SerpAPI search query failed:", err.message);
                }
            }

            // Standardize results from Fantastic.jobs
            const standardizedFantastic = fantasticJobsRaw.map((job, index) => {
                const description = job.description || 'No description provided.';
                
                let location = job.location;
                if (!location && job.locations && job.locations.length > 0) {
                    const locObj = job.locations[0];
                    if (locObj.city && locObj.country) {
                        location = `${locObj.city}, ${locObj.country}`;
                    } else if (locObj.country) {
                        location = locObj.country;
                    } else if (locObj.name) {
                        location = locObj.name;
                    }
                }
                if (!location) {
                    location = locationString ? locationString : 'Remote / Global';
                }

                const parsedLoc = parseCityCountry(location, city, country);
                const qualifications = description
                    .split('.')
                    .map(s => s.trim())
                    .filter(s => s.toLowerCase().includes('experience') || s.toLowerCase().includes('degree') || s.toLowerCase().includes('qualification') || s.toLowerCase().includes('required'))
                    .slice(0, 2)
                    .join('. ') + '.';

                return {
                    id: job.id || job.job_id || `fantastic-job-${index}-${Date.now()}`,
                    title: job.title || 'Software Developer',
                    company: job.organization || job.company_name || job.company || 'Technology Company',
                    companyDetails: `Via ${job.source || 'Fantastic.jobs'} • Posted: ${job.date_created || job.date_posted || 'Recently'}`,
                    source: job.source || 'Fantastic.jobs',
                    salary: job.ai_salary_value || parseSalary(job),
                    currency: job.ai_salary_currency || job.currency || 'USD',
                    city: parsedLoc.city,
                    country: parsedLoc.country,
                    location: location,
                    workMode: parseWorkMode(job),
                    employmentType: parseEmploymentType(job),
                    skillsRequired: extractSkills(description),
                    qualificationRequired: qualifications.length > 5 ? qualifications : 'Relevant technical experience required.',
                    description: description.substring(0, 300) + '...',
                    seniority: parseSeniority(job.title || '')
                };
            });

            // Standardize results from SerpAPI
            const standardizedSerp = serpJobsRaw.map((job, index) => {
                const description = job.description || 'No description provided.';
                const location = job.location || (locationString ? locationString : 'Remote / Global');
                const parsedLoc = parseCityCountry(location, city, country);

                const qualifications = description
                    .split('.')
                    .map(s => s.trim())
                    .filter(s => s.toLowerCase().includes('experience') || s.toLowerCase().includes('degree') || s.toLowerCase().includes('qualification') || s.toLowerCase().includes('required'))
                    .slice(0, 2)
                    .join('. ') + '.';

                return {
                    id: job.job_id || `serp-job-${index}-${Date.now()}`,
                    title: job.title || 'Software Developer',
                    company: job.company_name || 'Technology Company',
                    companyDetails: `Via ${job.via || 'Google Search'} • Posted: ${job.detected_extensions && job.detected_extensions.posted_at || 'Recently'}`,
                    source: job.via || 'Google Jobs',
                    salary: parseSalary(job),
                    currency: 'USD',
                    city: parsedLoc.city,
                    country: parsedLoc.country,
                    location: location,
                    workMode: parseWorkMode(job),
                    employmentType: parseEmploymentType(job),
                    skillsRequired: extractSkills(description),
                    qualificationRequired: qualifications.length > 5 ? qualifications : 'Relevant technical experience required.',
                    description: description.substring(0, 300) + '...',
                    seniority: parseSeniority(job.title || '')
                };
            });

            // Merge & Deduplicate by Title + Company
            let combinedJobs = [];
            const seenKeys = new Set();
            
            [...standardizedFantastic, ...standardizedSerp].forEach(job => {
                const key = `${job.title.toLowerCase().trim()}@${job.company.toLowerCase().trim()}`;
                if (!seenKeys.has(key)) {
                    seenKeys.add(key);
                    combinedJobs.push(job);
                }
            });

            console.log(`Total unique raw jobs collected from all sources: ${combinedJobs.length}`);

            // Filter results
            const exclusions = excludeKeywords ? excludeKeywords.split(',').map(s => s.trim().toLowerCase()).filter(Boolean) : [];
            const preferredModes = workModes ? workModes.split(',').map(s => s.trim()) : [];
            const preferredTypes = employmentTypes ? employmentTypes.split(',').map(s => s.trim()) : [];

            let filteredJobs = combinedJobs;
            if (exclusions.length || preferredModes.length || preferredTypes.length) {
                console.log(`Applying filters: Exclude: [${exclusions}], Modes: [${preferredModes}], Types: [${preferredTypes}]`);
                filteredJobs = combinedJobs.filter(job => {
                    const isExcluded = exclusions.some(ex => 
                        job.title.toLowerCase().includes(ex) || 
                        job.description.toLowerCase().includes(ex)
                    );
                    if (isExcluded) return false;
                    if (preferredModes.length && !preferredModes.includes(job.workMode)) return false;
                    if (preferredTypes.length && !preferredTypes.includes(job.employmentType)) return false;
                    return true;
                });
            }

            // Double safety: if filter leaves us with 0 jobs, return raw standardized matches to ensure visibility
            if (filteredJobs.length === 0 && combinedJobs.length > 0) {
                console.log("Preferences filter returned 0 jobs. Returning unfiltered matches to ensure data visibility.");
                filteredJobs = combinedJobs.slice(0, 8);
            }

            console.log(`Returning ${filteredJobs.length} jobs to Agent 3.`);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(filteredJobs));

        } catch (error) {
            console.error("Error during combined search proxy:", error.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                error: "SEARCH_FAILED",
                message: "Failed to connect or fetch job listings.",
                details: error.message
            }));
        }


        return;
    }

    // Static Files Server routing
    let safePathname = path.normalize(pathname).replace(/^(\.\.[\/\\])+/, '');
    if (safePathname === '/' || safePathname === '\\') safePathname = '/index.html';

    const filePath = path.join(__dirname, safePathname);
    const extname = path.extname(filePath);
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code} ..\n`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start the server
server.listen(PORT, () => {
    const serverUrl = `http://localhost:${PORT}`;
    console.log(`\n======================================================`);
    console.log(`Aiam Agentic server active on ${serverUrl}`);
    console.log(`Fantastic.jobs Integration Status: ${FANTASTIC_JOBS_API_KEY ? 'CONFIGURED' : 'NOT CONFIGURED (Simulation Mode)'}`);
    console.log(`======================================================\n`);

    // Auto-open browser
    const startCmd = process.platform === 'win32' ? 'start' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    exec(`${startCmd} ${serverUrl}`, (err) => {
        if (err) {
            console.log(`Note: Browser could not be auto-opened automatically (${err.message}).`);
            console.log(`Please navigate to ${serverUrl} manually.`);
        } else {
            console.log(`Successfully auto-opened default browser to ${serverUrl}`);
        }
    });
});
