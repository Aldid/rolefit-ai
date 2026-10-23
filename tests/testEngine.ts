// tests/testEngine.ts
import assert from 'assert';
import { scoreJob, scoreAllJobs } from '../src/lib/matchingEngine';
import { CandidateProfile, JobListing } from '../src/types';
import demoJobsData from '../src/data/demo-jobs.json';

const DEMO_JOBS = demoJobsData as JobListing[];

const sampleCandidate: CandidateProfile = {
  name: 'Alex Rivera (Synthetic Profile)',
  summary:
    'Early-career software engineer with experience in Python and TypeScript building automation pipelines and React apps.',
  skills: [
    'Python',
    'TypeScript',
    'JavaScript',
    'React',
    'Next.js',
    'Node.js',
    'FastAPI',
    'REST APIs',
    'Tailwind CSS',
    'Git',
    'SQL',
    'Data Validation',
  ],
  projects: [
    {
      title: 'AI Customer Response & CRM Workflow Assistant',
      description:
        'Architected an automated customer intake and response pipeline with safety guardrails and webhook orchestration.',
      technologies: ['Python', 'FastAPI', 'REST APIs', 'Webhooks', 'Data Validation'],
    },
    {
      title: 'Supply Chain Multi-Agent Simulator',
      description:
        'Developed an interactive state simulator visualizing logistical bottlenecks and event queues.',
      technologies: ['TypeScript', 'React', 'Node.js', 'Tailwind CSS'],
    },
  ],
  targetRole: 'AI Automation Engineer',
  preferredFormat: 'Remote',
  preferredLocation: 'Worldwide',
};

console.log('🧪 RUNNING COMPREHENSIVE MATCHING ENGINE TESTS');
console.log('==============================================');

// --- Suite 1: Score Bounds & Total Math ---
console.log('\n--- 1. Testing Score Bounds & Invariants ---');
for (const job of DEMO_JOBS) {
  const breakdown = scoreJob(sampleCandidate, job);
  assert(
    breakdown.skillsScore >= 0 && breakdown.skillsScore <= 50,
    `Skills score ${breakdown.skillsScore} out of bounds for ${job.id}`
  );
  assert(
    breakdown.experienceScore >= 0 && breakdown.experienceScore <= 35,
    `Experience score ${breakdown.experienceScore} out of bounds for ${job.id}`
  );
  assert(
    breakdown.locationScore >= 0 && breakdown.locationScore <= 15,
    `Location score ${breakdown.locationScore} out of bounds for ${job.id}`
  );
  assert(
    breakdown.totalScore >= 0 && breakdown.totalScore <= 100,
    `Total score ${breakdown.totalScore} out of bounds for ${job.id}`
  );
  assert(
    Number.isInteger(breakdown.totalScore),
    `Total score ${breakdown.totalScore} must be an integer for ${job.id}`
  );
  console.log(
    `  ✓ ${job.title}: ${breakdown.totalScore}% (Skills: ${breakdown.skillsScore}, Exp: ${breakdown.experienceScore}, Loc: ${breakdown.locationScore})`
  );
}

// --- Suite 2: Exact Skills Matches & Gaps Partitioning ---
console.log('\n--- 2. Testing Exact Skills Matches and Gaps Partitioning ---');
const aiJob = DEMO_JOBS.find((j) => j.id === 'job_ai_automation')!;
const aiBreakdown = scoreJob(sampleCandidate, aiJob);

// aiJob requiredSkills: ['Python', 'FastAPI', 'REST APIs', 'Data Validation', 'Git']
// Candidate has all 5 required skills -> requiredScore = 40 / 40
// aiJob preferredSkills: ['Workflow Orchestration', 'Playwright', 'Docker']
// Candidate has 0 preferred -> preferredScore = 0 / 10
// Expected skillsScore = 40.0
assert.strictEqual(aiBreakdown.skillsScore, 40, 'AI Job should have 40.0 skills score');
assert.strictEqual(aiBreakdown.matchedSkills.length, 5, 'Should have exactly 5 matched skills');
assert.strictEqual(aiBreakdown.missingSkills.length, 3, 'Should have exactly 3 missing preferred skills');
assert(aiBreakdown.missingSkills.includes('Workflow Orchestration'));
assert(aiBreakdown.missingSkills.includes('Playwright'));
assert(aiBreakdown.missingSkills.includes('Docker'));
console.log('  ✓ Matched required skills correctly calculated (40.0 / 40)');
console.log('  ✓ Missing preferred skills correctly identified as gaps');

// Test Case: Candidate with Zero Skills
const emptySkillsCandidate: CandidateProfile = {
  ...sampleCandidate,
  skills: [],
};
const zeroSkillsBreakdown = scoreJob(emptySkillsCandidate, aiJob);
assert.strictEqual(zeroSkillsBreakdown.skillsScore, 0, 'Zero candidate skills must yield 0 skills score');
assert.strictEqual(zeroSkillsBreakdown.matchedSkills.length, 0);
assert.strictEqual(
  zeroSkillsBreakdown.missingSkills.length,
  aiJob.requiredSkills.length + aiJob.preferredSkills.length
);
console.log('  ✓ Empty candidate skills yields 0 skills score');

// Test Case: Job with No Preferred Skills (Case B)
const noPrefJob: JobListing = {
  ...aiJob,
  id: 'job_no_pref',
  requiredSkills: ['Python', 'FastAPI'],
  preferredSkills: [],
};
const noPrefBreakdown = scoreJob(sampleCandidate, noPrefJob);
// Both required skills matched -> 50 / 50
assert.strictEqual(noPrefBreakdown.skillsScore, 50, 'All 50 points allocated to required when no preferred skills');
console.log('  ✓ Job with no preferred skills awards full 50 pts to required skills');

// --- Suite 3: Project Relevance & Engineering Depth ---
console.log('\n--- 3. Testing Project Relevance & Implementation Depth ---');
// Candidate has 2 projects matching AI automation domain keywords:
// 'AI Customer Response...' matches 'AI', 'automation', 'workflow', etc. -> 12.5 pts
// 'Supply Chain Simulator' matches 'state', 'simulator' -> 12.5 pts
// Total domain alignment: 25 / 25
// Both projects demonstrate API (+4), validation/state (+3), workflow/automation (+3) -> 10 / 10
// Total experienceScore = 35 / 35
assert.strictEqual(aiBreakdown.experienceScore, 35, 'Full domain alignment and depth should give 35 pts');
assert.strictEqual(aiBreakdown.matchedProjects.length, 2);
console.log('  ✓ Domain alignment capped at 25 and depth capped at 10 gives 35 pts');

// Candidate with no projects
const noProjectsCandidate: CandidateProfile = {
  ...sampleCandidate,
  projects: [],
};
const noProjectsBreakdown = scoreJob(noProjectsCandidate, aiJob);
assert.strictEqual(noProjectsBreakdown.experienceScore, 0, 'No projects must yield 0 experience score');
assert.strictEqual(noProjectsBreakdown.matchedProjects.length, 0);
console.log('  ✓ Empty candidate projects yields 0 experience score');

// --- Suite 4: Location & Work Format Cases ---
console.log('\n--- 4. Testing Location and Work Format Scoring ---');
// Case 4.1: Remote to Remote in Worldwide -> 10 + 5 = 15 pts
assert.strictEqual(aiBreakdown.locationScore, 15, 'Remote + Worldwide matches Remote job for 15 pts');
console.log('  ✓ Remote candidate with Worldwide location receives 15 / 15 on Remote job');

// Case 4.2: Candidate selects 'Any' -> 10 + 5 = 15 pts
const anyFormatCandidate: CandidateProfile = {
  ...sampleCandidate,
  preferredFormat: 'Any',
};
const anyFormatBreakdown = scoreJob(anyFormatCandidate, aiJob);
assert.strictEqual(anyFormatBreakdown.locationScore, 15, 'Format "Any" receives full 10 format points');
console.log('  ✓ Format "Any" receives full 10 format points');

// Case 4.3: Remote-only candidate applying for On-site role in Almaty
const qaJob = DEMO_JOBS.find((j) => j.id === 'job_qa_intern')!; // Format: On-site, Location: Almaty
const remoteOnsiteCandidate: CandidateProfile = {
  ...sampleCandidate,
  preferredFormat: 'Remote',
  preferredLocation: 'London, UK',
};
const remoteOnsiteBreakdown = scoreJob(remoteOnsiteCandidate, qaJob);
// Format mismatch: Remote for On-site -> 0 pts
// Location mismatch: London for Almaty on-site -> 0 pts
assert.strictEqual(
  remoteOnsiteBreakdown.locationScore,
  0,
  'Incompatible format (Remote for On-site in different city) should yield 0'
);
console.log('  ✓ Remote candidate in another city gets 0 format/location score for on-site job');

// Case 4.4: On-site candidate in Almaty applying for Almaty On-site role
const onsiteAlmatyCandidate: CandidateProfile = {
  ...sampleCandidate,
  preferredFormat: 'On-site',
  preferredLocation: 'Almaty, Kazakhstan',
};
const onsiteAlmatyBreakdown = scoreJob(onsiteAlmatyCandidate, qaJob);
assert.strictEqual(
  onsiteAlmatyBreakdown.locationScore,
  15,
  'Exact on-site match in same city receives 15 pts'
);
console.log('  ✓ On-site candidate in matching city receives full 15 pts');

// --- Suite 5: Sorting & Ranking ---
console.log('\n--- 5. Testing Ranking and Sorting Logic ---');
const allScored = scoreAllJobs(sampleCandidate, DEMO_JOBS);
assert.strictEqual(allScored.length, 5, 'Must rank all 5 jobs');
for (let i = 0; i < allScored.length - 1; i++) {
  assert(
    allScored[i].breakdown.totalScore >= allScored[i + 1].breakdown.totalScore,
    `Job at index ${i} (${allScored[i].breakdown.totalScore}) must be >= index ${i + 1} (${allScored[i + 1].breakdown.totalScore})`
  );
}
console.log('  ✓ Jobs are strictly sorted descending by total match score');
console.log(`  ✓ Rank 1: ${allScored[0].job.title} (${allScored[0].breakdown.totalScore}%)`);
console.log(`  ✓ Rank 5: ${allScored[4].job.title} (${allScored[4].breakdown.totalScore}%)`);

// --- Suite 6: Grounded Adaptation Tip Verification ---
console.log('\n--- 6. Testing Grounded Adaptation Tip Grounding ---');
assert(aiBreakdown.adaptationTip.length > 0, 'Adaptation tip must not be empty');
// The tip must cite an actual project title from sampleCandidate.projects
const projectTitles = sampleCandidate.projects.map((p) => p.title);
const referencesKnownProject = projectTitles.some((title) =>
  aiBreakdown.adaptationTip.includes(title)
);
assert(
  referencesKnownProject,
  `Adaptation tip must reference a verified candidate project: "${aiBreakdown.adaptationTip}"`
);
// The tip must address the missing skill 'Workflow Orchestration'
assert(
  aiBreakdown.adaptationTip.includes('Workflow Orchestration'),
  `Adaptation tip must target the top missing skill: "${aiBreakdown.adaptationTip}"`
);
console.log(`  ✓ Grounded tip generated: "${aiBreakdown.adaptationTip}"`);

console.log('\n==============================================');
console.log('✅ ALL MATCHING ENGINE TEST SUITES PASSED (100% VERIFIED)');
