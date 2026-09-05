/**
 * Automated Programmatic Unit Tests for Fitment Score Algorithm (Agent 4)
 */

// Ported calculateFitmentScore from app.js for isolated node-based testing
function calculateFitmentScore(job, resume, preferences) {
    // Step 1. Skills Match (0-60 points)
    const jobSkills = job.skillsRequired || [];
    const candSkills = resume.skills || [];
    
    let skillsEarned = 0;

    if (jobSkills.length > 0) {
        const maxPointsPerSkill = 60 / jobSkills.length;
        
        jobSkills.forEach(reqSkill => {
            const match = candSkills.find(cs => cs.name.toLowerCase() === reqSkill.toLowerCase());
            if (match) {
                let weight = 0.5; // Beginner base
                
                if (match.proficiency === "Expert" || match.proficiency === "Advanced") {
                    weight = 1.0;
                } else if (match.proficiency === "Intermediate") {
                    weight = 0.8;
                }

                if (match.priority === "High") {
                    if (match.proficiency === "Expert" || match.proficiency === "Advanced") {
                        weight = 1.0;
                    } else {
                        weight = Math.max(weight, 0.7);
                    }
                }
                
                skillsEarned += maxPointsPerSkill * weight;
            }
        });
    }
    
    const step1Score = Math.min(60, Math.round(skillsEarned));

    // Step 2. Seniority Alignment (0-20 points)
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
        step2Score = 20;
    } else if (Math.abs(candIndex - jobIndex) === 1) {
        step2Score = 12;
    } else if (Math.abs(candIndex - jobIndex) === 2) {
        step2Score = 6;
    } else {
        step2Score = 0;
    }

    // Step 3. Preferences Alignment (0-20 points)
    let step3Score = 0;
    let hasPreferences = preferences !== null;

    if (hasPreferences) {
        const modeMatch = preferences.workModes.includes(job.workMode);
        const typeMatch = preferences.employmentTypes.includes(job.employmentType);
        if (modeMatch) step3Score += 10;
        if (typeMatch) step3Score += 10;
    }

    // Step 4. Compute overall score
    let overallScore = 0;
    if (hasPreferences) {
        overallScore = step1Score + step2Score + step3Score;
    } else {
        overallScore = Math.round((step1Score + step2Score) * (100 / 80));
    }

    overallScore = Math.max(0, Math.min(100, overallScore));

    let fitBand = "Low";
    if (overallScore >= 70) fitBand = "High";
    else if (overallScore >= 40) fitBand = "Medium";

    return {
        overallScore,
        fitBand,
        breakdown: {
            skills: step1Score,
            seniority: step2Score,
            preferences: hasPreferences ? step3Score : null,
            hasPreferences
        }
    };
}

// -------------------------------------------------------------
// TEST RUNNER
// -------------------------------------------------------------
const mockResume = {
    candidateTitle: "Senior React Engineer",
    yearsExperience: 7,
    skills: [
        { name: "React", priority: "High", proficiency: "Expert" },
        { name: "TypeScript", priority: "High", proficiency: "Advanced" },
        { name: "CSS/SASS", priority: "Medium", proficiency: "Expert" }
    ]
};

const mockPreferences = {
    workModes: ["Remote"],
    employmentTypes: ["Full Time"]
};

// Case 1: Job matching skills, seniority, and preference
const job1 = {
    title: "Senior Developer",
    seniority: "Senior",
    workMode: "Remote",
    employmentType: "Full Time",
    skillsRequired: ["React", "TypeScript", "CSS/SASS"]
};

// Case 2: Job with seniority mismatch, missing skills, and mode mismatch
const job2 = {
    title: "Junior Backend Developer",
    seniority: "Junior",
    workMode: "Onsite",
    employmentType: "Full Time",
    skillsRequired: ["Python", "SQL"]
};

console.log("=== RUNNING SCORING UNIT TESTS ===");

const res1 = calculateFitmentScore(job1, mockResume, mockPreferences);
console.log("\nTest Case 1: Optimal Fit Job");
console.log(`Expected Score: ~100. Actual Score: ${res1.overallScore}`);
console.log(`Expected Band: High. Actual Band: ${res1.fitBand}`);
console.log(`Breakdown - Skills: ${res1.breakdown.skills}/60, Seniority: ${res1.breakdown.seniority}/20, Preferences: ${res1.breakdown.preferences}/20`);
if (res1.overallScore === 100 && res1.fitBand === "High") {
    console.log("✅ CASE 1 PASSED");
} else {
    console.error("❌ CASE 1 FAILED");
    process.exit(1);
}

const res2 = calculateFitmentScore(job2, mockResume, mockPreferences);
console.log("\nTest Case 2: Poor Fit Job");
console.log(`Expected Score: < 20. Actual Score: ${res2.overallScore}`);
console.log(`Expected Band: Low. Actual Band: ${res2.fitBand}`);
console.log(`Breakdown - Skills: ${res2.breakdown.skills}/60, Seniority: ${res2.breakdown.seniority}/20, Preferences: ${res2.breakdown.preferences}/20`);
if (res2.overallScore < 20 && res2.fitBand === "Low") {
    console.log("✅ CASE 2 PASSED");
} else {
    console.error("❌ CASE 2 FAILED");
    process.exit(1);
}

console.log("\n🎉 ALL SCORING TESTS PASSED SUCCESSFULLY!");
