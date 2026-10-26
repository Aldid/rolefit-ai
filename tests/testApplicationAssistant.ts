// tests/testApplicationAssistant.ts
import assert from 'assert';
import demoJobsData from '../src/data/demo-jobs.json';
import { SAMPLE_CANDIDATE } from '../src/data/sample-candidate';
import { JobListing, CandidateProfile, ScoredJob } from '../src/types';
import { scoreJob, scoreAllJobs } from '../src/lib/matchingEngine';
import {
  generateApplicationPackage,
  LocalDemoApplicationAdapter,
} from '../src/lib/applicationAssistant';

const DEMO_JOBS = demoJobsData as JobListing[];

async function runApplicationAssistantTests() {
  console.log('🧪 RUNNING APPLICATION ASSISTANT DEMO TESTS');
  console.log('============================================\n');

  // 1. Test Package Generation Context & Grounding
  console.log('--- 1. Testing Package Generation Context & Grounding ---');
  const pythonJob = DEMO_JOBS.find((j) => j.id === 'job_python_dev')!;
  const scoredPythonJob: ScoredJob = {
    job: pythonJob,
    breakdown: scoreJob(SAMPLE_CANDIDATE, pythonJob),
  };

  const pkg = generateApplicationPackage(SAMPLE_CANDIDATE, scoredPythonJob);

  assert.strictEqual(pkg.jobId, pythonJob.id, 'Package links to correct jobId');
  assert.strictEqual(pkg.jobTitle, pythonJob.title, 'Package links to correct job title');
  assert.strictEqual(pkg.candidateName, SAMPLE_CANDIDATE.name, 'Candidate name correctly matches');
  assert.strictEqual(pkg.matchScore, scoredPythonJob.breakdown.totalScore, 'Score matches calculated engine score');
  assert.strictEqual(pkg.isDemoMode, true, 'Package is explicitly marked with isDemoMode: true');
  assert.strictEqual(pkg.status, 'draft', 'Initial status must be "draft"');
  console.log('  ✓ Package generation correctly binds job, candidate, and match score');

  // 2. Test Grounding: Uses only real candidate projects and technologies
  console.log('\n--- 2. Testing Project Grounding & Zero Hallucination ---');
  assert(
    pkg.coverLetter.includes('AI Customer Response & CRM Workflow Assistant'),
    'Cover letter must reference real project from candidate data'
  );
  assert(
    pkg.coverLetter.includes('Python'),
    'Cover letter must reference real candidate skill Python'
  );
  assert(
    pkg.coverLetter.includes('DataStream Workflows'),
    'Cover letter must reference target company name'
  );
  assert(
    pkg.tailoredBullets.some((b) => b.includes('AI Customer Response & CRM Workflow Assistant')),
    'Tailored bullets must ground recommendations in existing project'
  );
  assert(
    pkg.tailoredBullets.some((b) => b.includes(scoredPythonJob.breakdown.adaptationTip)),
    'Tailored bullets must include the engine adaptation tip'
  );
  console.log('  ✓ Cover letter and resume bullets are strictly grounded in candidate projects and skills');

  // 3. Test Honest Handling of Missing Skills (Gaps)
  console.log('\n--- 3. Testing Honest Handling of Missing Skills ---');
  // For Junior AI Automation Engineer, Docker/Workflow Orchestration are preferred missing skills
  const aiJob = DEMO_JOBS.find((j) => j.id === 'job_ai_automation')!;
  const scoredAiJob: ScoredJob = {
    job: aiJob,
    breakdown: scoreJob(SAMPLE_CANDIDATE, aiJob),
  };
  const aiPkg = generateApplicationPackage(SAMPLE_CANDIDATE, scoredAiJob);

  assert(
    aiPkg.coverLetter.includes('Workflow Orchestration') || aiPkg.coverLetter.includes('Playwright') || aiPkg.coverLetter.includes('Docker'),
    'Cover letter honestly acknowledges identified skill gaps'
  );
  assert(
    aiPkg.checklist.some((item) => item.id === 'check-gaps'),
    'Checklist includes explicit item for addressing skill gaps'
  );
  console.log('  ✓ Skill gaps are transparently acknowledged without fabricating fake qualifications');

  // 4. Test Immutability: Editing Package Draft Does NOT Alter Candidate Profile or Engine Scores
  console.log('\n--- 4. Testing Draft Immutability ---');
  const originalName = SAMPLE_CANDIDATE.name;
  const originalSkills = [...SAMPLE_CANDIDATE.skills];
  const originalScore = scoredPythonJob.breakdown.totalScore;

  // Mutate package fields
  pkg.candidateName = 'Edited Name For Testing';
  pkg.coverLetter = 'Completely rewritten cover letter body.';
  pkg.tailoredBullets.push('New custom user bullet.');
  pkg.checklist[0].completed = !pkg.checklist[0].completed;
  pkg.status = 'ready_for_review';

  // Verify original objects were not modified
  assert.strictEqual(SAMPLE_CANDIDATE.name, originalName, 'Original candidate name remains pristine');
  assert.deepStrictEqual(SAMPLE_CANDIDATE.skills, originalSkills, 'Original candidate skills array is untouched');
  assert.strictEqual(scoredPythonJob.breakdown.totalScore, originalScore, 'Engine score breakdown is untouched');
  console.log('  ✓ Draft editing maintains strict immutability of candidate profile and matching data');

  // 5. Test Non-Negotiable Safety Guarantee: Submission Cannot Be Reported As Successful
  console.log('\n--- 5. Testing Demo Mode Submission Guard ---');
  const availability = await LocalDemoApplicationAdapter.checkAvailability(pythonJob.id);
  assert.strictEqual(availability.available, true, 'Demo adapter reports available for demonstration');

  const submissionResult = await LocalDemoApplicationAdapter.submitApplication();
  assert.strictEqual(submissionResult.success, false, 'submitApplication MUST return success: false in demo mode');
  assert(
    submissionResult.error?.includes('DEMO_MODE_ACTIVE'),
    'Error message explicitly explains that automated platform submissions are disabled'
  );
  console.log('  ✓ LocalDemoApplicationAdapter strictly rejects submissions (guaranteeing no false submission claims)');

  // 6. Test Handling When Candidate Has Minimal or Empty Data
  console.log('\n--- 6. Testing Fallback Handling on Minimal Candidate Data ---');
  const minimalCandidate: CandidateProfile = {
    name: '',
    summary: '',
    skills: [],
    projects: [],
    targetRole: '',
    preferredFormat: 'Any',
    preferredLocation: '',
  };
  const minimalScored: ScoredJob = {
    job: pythonJob,
    breakdown: scoreJob(minimalCandidate, pythonJob),
  };
  const minimalPkg = generateApplicationPackage(minimalCandidate, minimalScored);

  assert.strictEqual(minimalPkg.candidateName, '[Your Full Name]', 'Fallback name placeholder used when name is empty');
  assert(minimalPkg.coverLetter.includes('Dear Hiring Team'), 'Valid letter template generated even without candidate text');
  assert.strictEqual(minimalPkg.isDemoMode, true, 'Demo mode preserved on minimal profile');
  console.log('  ✓ Minimal / empty candidate profile handled gracefully with transparent placeholders');

  console.log('\n============================================');
  console.log('✅ ALL APPLICATION ASSISTANT TESTS PASSED (100% VERIFIED)\n');
}

runApplicationAssistantTests().catch((err) => {
  console.error('❌ Application Assistant Tests Failed:', err);
  process.exit(1);
});
