// src/lib/matchingEngine.ts
import { CandidateProfile, JobListing, ScoreBreakdown, ScoredJob } from '../types';

/**
 * Normalizes text for case-insensitive and whitespace-trimmed comparison.
 */
function normalize(str: string): string {
  return str.trim().toLowerCase();
}

/**
 * Calculates deterministic 50/35/15 match score and grounded advice.
 */
export function scoreJob(candidate: CandidateProfile, job: JobListing): ScoreBreakdown {
  const candidateSkillsSet = new Set(candidate.skills.map(normalize));

  // 1. SKILLS MATCH (Max 50 points)
  const matchedRequired = job.requiredSkills.filter((s) => candidateSkillsSet.has(normalize(s)));
  const matchedPreferred = job.preferredSkills.filter((s) => candidateSkillsSet.has(normalize(s)));
  const missingRequired = job.requiredSkills.filter((s) => !candidateSkillsSet.has(normalize(s)));
  const missingPreferred = job.preferredSkills.filter((s) => !candidateSkillsSet.has(normalize(s)));

  const allMatchedSkills = [...matchedRequired, ...matchedPreferred];
  const allMissingSkills = [...missingRequired, ...missingPreferred];

  let skillsScore = 0;
  if (candidate.skills.length > 0) {
    const n = Math.max(job.requiredSkills.length, 1);
    const m = job.preferredSkills.length;

    if (m === 0) {
      // Case B: No preferred skills -> all 50 points allocated to required
      skillsScore = (matchedRequired.length / n) * 50;
    } else {
      // Case A: 40 points for required, 10 points for preferred
      const reqScore = (matchedRequired.length / n) * 40;
      const prefScore = (matchedPreferred.length / m) * 10;
      skillsScore = reqScore + prefScore;
    }
  }
  skillsScore = Math.min(50, Math.max(0, Number(skillsScore.toFixed(1))));

  // 2. RELEVANT EXPERIENCE & PROJECTS (Max 35 points)
  let domainAlignment = 0;
  let implementationDepth = 0;
  const matchedProjects: string[] = [];

  if (candidate.projects && candidate.projects.length > 0) {
    const jobKeywords = job.domainKeywords.map(normalize);

    // Evaluate Domain Alignment (Max 25 pts)
    for (const project of candidate.projects) {
      const projText = `${project.title} ${project.description} ${project.technologies.join(' ')}`.toLowerCase();
      const hasDomainOverlap = jobKeywords.some((kw) => projText.includes(kw));

      if (hasDomainOverlap) {
        matchedProjects.push(project.title);
        domainAlignment += 12.5;
      }
    }
    domainAlignment = Math.min(25, domainAlignment);

    // Evaluate Engineering Implementation Depth (Max 10 pts)
    const combinedProjectText = candidate.projects
      .map((p) => `${p.title} ${p.description} ${p.technologies.join(' ')}`)
      .join(' ')
      .toLowerCase();

    // Attribute 1: API Integration / External Services (+4 pts)
    if (
      combinedProjectText.includes('api') ||
      combinedProjectText.includes('fastapi') ||
      combinedProjectText.includes('webhook') ||
      combinedProjectText.includes('rest')
    ) {
      implementationDepth += 4;
    }

    // Attribute 2: State Management & Data Validation / Business Logic (+3 pts)
    if (
      combinedProjectText.includes('validation') ||
      combinedProjectText.includes('state') ||
      combinedProjectText.includes('queue') ||
      combinedProjectText.includes('schema') ||
      combinedProjectText.includes('safety')
    ) {
      implementationDepth += 3;
    }

    // Attribute 3: Testing, Tooling, or Workflow Automation (+3 pts)
    if (
      combinedProjectText.includes('automation') ||
      combinedProjectText.includes('workflow') ||
      combinedProjectText.includes('simulator') ||
      combinedProjectText.includes('pipeline') ||
      combinedProjectText.includes('test')
    ) {
      implementationDepth += 3;
    }

    implementationDepth = Math.min(10, implementationDepth);
  }

  const experienceScore = Math.min(35, Math.max(0, Number((domainAlignment + implementationDepth).toFixed(1))));

  // 3. LOCATION & WORK FORMAT FIT (Max 15 points)
  let formatScore = 0;
  const candFormat = candidate.preferredFormat;
  const jobFormat = job.format;

  if (candFormat === 'Any' || (candFormat === 'Remote' && jobFormat === 'Remote')) {
    formatScore = 10;
  } else if (candFormat === jobFormat) {
    formatScore = 10;
  } else if (candFormat === 'Hybrid' && jobFormat === 'Remote') {
    formatScore = 8;
  } else if (candFormat === 'On-site' && jobFormat === 'Remote') {
    formatScore = 7;
  } else {
    formatScore = 0;
  }

  let locationScore = 0;
  const candLoc = normalize(candidate.preferredLocation || 'worldwide');
  const jobLoc = normalize(job.location);

  if (
    jobLoc.includes('worldwide') ||
    jobLoc.includes('remote') ||
    candLoc === 'worldwide' ||
    candLoc === ''
  ) {
    locationScore = 5;
  } else if (jobLoc.includes(candLoc) || candLoc.includes(jobLoc)) {
    locationScore = 5;
  } else if (jobFormat === 'Remote') {
    locationScore = 5;
  } else {
    locationScore = 0;
  }

  const finalLocationScore = Math.min(15, Math.max(0, Number((formatScore + locationScore).toFixed(1))));

  // TOTAL SCORE (0 to 100, integer)
  const rawTotal = skillsScore + experienceScore + finalLocationScore;
  const totalScore = Math.min(100, Math.max(0, Math.round(rawTotal)));

  // GROUNDED ADAPTATION TIP GENERATION
  const adaptationTip = generateGroundedAdaptationTip(candidate, job, allMissingSkills);

  return {
    skillsScore,
    experienceScore,
    locationScore: finalLocationScore,
    totalScore,
    matchedSkills: allMatchedSkills,
    missingSkills: allMissingSkills,
    matchedProjects,
    adaptationTip,
  };
}

/**
 * Generates an actionable bullet rewrite tip strictly grounded in the candidate's verified projects.
 */
function generateGroundedAdaptationTip(
  candidate: CandidateProfile,
  job: JobListing,
  missingSkills: string[]
): string {
  if (missingSkills.length === 0) {
    return `Your technical profile already satisfies all key requirements for ${job.title}. Focus your resume on quantifying project outcomes and operational impact.`;
  }

  const topMissing = missingSkills[0];

  // Find best candidate project to recommend reframing
  if (!candidate.projects || candidate.projects.length === 0) {
    return `To better target ${job.title}, consider adding project evidence demonstrating hands-on experience with ${topMissing}.`;
  }

  // Pick candidate project with highest tech/keyword affinity
  let bestProject = candidate.projects[0];
  let maxTechOverlap = 0;

  const jobDomainText = `${job.title} ${job.description} ${job.domainKeywords.join(' ')}`.toLowerCase();

  for (const proj of candidate.projects) {
    let score = 0;
    for (const tech of proj.technologies) {
      if (jobDomainText.includes(tech.toLowerCase())) {
        score += 2;
      }
    }
    if (score > maxTechOverlap) {
      maxTechOverlap = score;
      bestProject = proj;
    }
  }

  const techReference =
    bestProject.technologies.slice(0, 2).join(' and ') || 'existing architecture';

  return `In your "${bestProject.title}" project, explicitly highlight your work with ${techReference} to directly demonstrate capability in ${topMissing}.`;
}

/**
 * Scores and ranks all jobs descending by total score.
 */
export function scoreAllJobs(candidate: CandidateProfile, jobs: JobListing[]): ScoredJob[] {
  const scored = jobs.map((job) => ({
    job,
    breakdown: scoreJob(candidate, job),
  }));

  // Sort descending by totalScore
  return scored.sort((a, b) => b.breakdown.totalScore - a.breakdown.totalScore);
}
