// src/types/index.ts

export type WorkFormat = 'Remote' | 'Hybrid' | 'On-site' | 'Any';

export interface CandidateProject {
  title: string;
  description: string;
  technologies: string[];
}

export interface CandidateProfile {
  name: string;
  summary: string;
  skills: string[];
  projects: CandidateProject[];
  targetRole: string;
  preferredFormat: WorkFormat;
  preferredLocation: string;
}

export interface JobListing {
  id: string;
  title: string;
  company: string;
  roleCategory: string; // e.g. 'AI Automation', 'Full-Stack', 'Python', 'QA', 'Product Ops'
  location: string;
  format: 'Remote' | 'Hybrid' | 'On-site';
  requiredSkills: string[];
  preferredSkills: string[];
  domainKeywords: string[];
  experienceLevel: string;
  description: string;
  isSyntheticDemo: boolean;
}

export interface ScoreBreakdown {
  skillsScore: number;     // 0 to 50 (1 decimal place)
  experienceScore: number; // 0 to 35 (1 decimal place)
  locationScore: number;   // 0 to 15 (1 decimal place)
  totalScore: number;      // 0 to 100 (integer)
  matchedSkills: string[];
  missingSkills: string[];
  matchedProjects: string[];
  adaptationTip: string;
}

export interface ScoredJob {
  job: JobListing;
  breakdown: ScoreBreakdown;
}
