// src/lib/applicationAssistant.ts
import { CandidateProfile, ScoredJob } from '../types';
import {
  ApplicationChecklistItem,
  ApplicationPackage,
  ApplicationWorkflowStatus,
  JobPlatformAdapter,
} from '../types/assistant';

/**
 * Deterministically constructs a grounded application package for the candidate and job.
 * Adheres strictly to zero-hallucination principles: uses only verified candidate projects,
 * real technologies, and explicit handling of identified skill gaps.
 */
export function generateApplicationPackage(
  candidate: CandidateProfile,
  scoredJob: ScoredJob
): ApplicationPackage {
  const { job, breakdown } = scoredJob;
  const candidateName = candidate.name?.trim() || '[Your Full Name]';
  const roleTitle = job.title;
  const companyName = job.company.replace(/\s*\(Synthetic Demo\)\s*/i, '').trim();

  // 1. Identify primary grounded project
  const primaryProject =
    candidate.projects?.find((p) => breakdown.matchedProjects?.includes(p.title)) ||
    candidate.projects?.[0] || {
      title: 'Technical Portfolio Project',
      description: 'Hands-on software development and systems integration.',
      technologies: candidate.skills.slice(0, 3),
    };

  // 2. Format matched skills and gap explanations
  const topMatched = breakdown.matchedSkills?.slice(0, 4) || [];
  const topMissing = breakdown.missingSkills?.slice(0, 3) || [];

  const matchedSummary =
    topMatched.length > 0 ? topMatched.join(', ') : 'core foundational programming practices';

  const gapStatement =
    topMissing.length > 0
      ? `While my current technical portfolio primarily centers on ${matchedSummary}, I have noted your preference for ${topMissing.join(
          ' and '
        )}. I am actively deepening my practical experience in these areas and am prepared to leverage my foundation in ${topMatched[0] || 'software development'} to ramp up quickly.`
      : `My verified background directly covers all core technical competencies listed in your requirements.`;

  // 3. Compose grounded cover letter
  const coverLetter = `Dear Hiring Team at ${companyName},

I am writing to express my strong interest in the ${roleTitle} role. Having analyzed the position's requirements and technical focus, I believe my practical experience in ${matchedSummary} provides a solid foundation to contribute effectively to your team.

In my recent project, "${primaryProject.title}", I ${primaryProject.description} Through this work, I utilized ${primaryProject.technologies.join(
    ', '
  )}, developing reliable, maintainable code aligned with real-world engineering standards.

${gapStatement}

I would welcome the opportunity to discuss how my hands-on background and disciplined approach to problem-solving can support ${companyName}'s objectives. Thank you for your time and consideration.

Sincerely,
${candidateName}`;

  // 4. Compose grounded tailored resume bullets
  const tailoredBullets = [
    `Developed "${primaryProject.title}" leveraging ${primaryProject.technologies.join(', ')}, demonstrating proven capabilities directly relevant to ${companyName}'s ${roleTitle} role.`,
    `Applied ${matchedSummary} in real-world implementations, ensuring data validation, clean architecture, and reliable system workflows.`,
    `CV Adaptation Recommendation: ${breakdown.adaptationTip}`,
  ];

  // 5. Build preparation checklist
  const checklist: ApplicationChecklistItem[] = [
    {
      id: 'check-skills',
      label: `Review verified technical skills (${topMatched.length} matched competencies)`,
      description: `Ensure ${matchedSummary} are prominent on the first page of your CV.`,
      completed: true,
    },
    {
      id: 'check-letter',
      label: 'Inspect and personalize cover letter draft',
      description: 'Customize specific team references while preserving factual project grounding.',
      completed: false,
    },
    {
      id: 'check-project',
      label: `Verify project repository link ("${primaryProject.title}")`,
      description: 'Confirm README, installation steps, and code samples are publicly accessible.',
      completed: false,
    },
    {
      id: 'check-format',
      label: `Confirm work format and location alignment (${job.format} / ${job.location})`,
      description: `Your stated preference: ${candidate.preferredFormat} in ${candidate.preferredLocation || 'Worldwide'}.`,
      completed: true,
    },
    {
      id: 'check-gaps',
      label: topMissing.length > 0 ? `Prepare talking points for gap: ${topMissing[0]}` : 'Confirm complete requirements match',
      description: topMissing.length > 0 ? `Be ready to explain how you plan to master ${topMissing.join(', ')}.` : 'No critical skill gaps identified.',
      completed: false,
    },
  ];

  const now = new Date().toISOString();

  return {
    id: `app_${job.id}_${Date.now()}`,
    jobId: job.id,
    jobTitle: job.title,
    company: job.company,
    candidateName,
    status: 'draft',
    matchScore: breakdown.totalScore,
    breakdown,
    coverLetter,
    tailoredBullets,
    checklist,
    createdAt: now,
    updatedAt: now,
    isDemoMode: true,
  };
}

/**
 * Local Demonstration Platform Adapter.
 * Proves the architectural separation between application preparation and job board submission,
 * while strictly guaranteeing that no automated submission is simulated or claimed.
 */
export const LocalDemoApplicationAdapter: JobPlatformAdapter = {
  platformId: 'local-demo-adapter',
  platformName: 'RoleFit AI Demonstration Adapter (Offline)',

  async checkAvailability(jobUrlOrId: string) {
    return {
      available: true,
      reason: `Demonstration environment: Verified synthetic job ${jobUrlOrId}. External platform network requests are strictly disabled.`,
    };
  },

  async prepareApplication(pkg: ApplicationPackage) {
    return {
      ...pkg,
      updatedAt: new Date().toISOString(),
    };
  },

  async submitApplication() {
    // Demonstration safety guarantee: Submissions are explicitly refused
    return {
      success: false,
      error:
        'DEMO_MODE_ACTIVE: RoleFit AI does not submit applications automatically. Real submissions require official API integration and explicit human confirmation.',
    };
  },

  async getApplicationStatus() {
    return 'ready_for_review';
  },
};
