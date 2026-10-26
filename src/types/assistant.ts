// src/types/assistant.ts
import { CandidateProfile, JobListing, ScoreBreakdown, ScoredJob } from './index';

/**
 * State lifecycle for application materials.
 * Note: 'awaiting_user_confirmation' and 'submitted' are reserved for future real integrations.
 * In this demonstration MVP, state transitions are bounded to 'draft' and 'ready_for_review'.
 */
export type ApplicationWorkflowStatus =
  | 'draft'
  | 'ready_for_review'
  | 'awaiting_user_confirmation'
  | 'submitted';

export interface ApplicationChecklistItem {
  id: string;
  label: string;
  description: string;
  completed: boolean;
}

export interface ApplicationPackage {
  id: string;
  jobId: string;
  jobTitle: string;
  company: string;
  candidateName: string;
  status: ApplicationWorkflowStatus;
  matchScore: number;
  breakdown: ScoreBreakdown;
  coverLetter: string;
  tailoredBullets: string[];
  checklist: ApplicationChecklistItem[];
  createdAt: string;
  updatedAt: string;
  isDemoMode: true;
}

/**
 * Architectural Extension Point for Future Platform Integrations.
 * This typed contract defines how future official job board connectors (e.g. Greenhouse,
 * Lever, LinkedIn Easy Apply) or browser-automation adapters will plug into RoleFit AI
 * without altering core matching or profile parsing logic.
 */
export interface JobPlatformAdapter {
  platformId: string;
  platformName: string;
  /**
   * Verifies if the target job board or official API endpoint is reachable.
   */
  checkAvailability(jobUrlOrId: string): Promise<{ available: boolean; reason?: string }>;
  /**
   * Prepares or validates a payload for the platform.
   */
  prepareApplication(pkg: ApplicationPackage): Promise<ApplicationPackage>;
  /**
   * Performs explicit user-authorized submission.
   * In demo mode, this returns an explicit rejection preventing false submission claims.
   */
  submitApplication(pkg: ApplicationPackage): Promise<{
    success: boolean;
    submissionId?: string;
    error?: string;
  }>;
  /**
   * Queries application status if supported by platform webhook/API.
   */
  getApplicationStatus?(applicationId: string): Promise<ApplicationWorkflowStatus>;
}
