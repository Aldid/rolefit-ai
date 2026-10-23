// src/data/sample-candidate.ts
import { CandidateProfile } from '../types';

export const SAMPLE_CANDIDATE: CandidateProfile = {
  name: 'Alex Rivera (Synthetic Profile)',
  summary:
    'Early-career software engineer with a dual background in business analytics and hands-on full-stack development. Experienced in building deterministic AI automation workflows, RESTful services, and interactive React applications in Python and TypeScript.',
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
        'Architected an automated customer intake and response pipeline with safety guardrails, webhook orchestration, and robust schema validation for incoming leads.',
      technologies: ['Python', 'FastAPI', 'REST APIs', 'Webhooks', 'Data Validation'],
    },
    {
      title: 'Supply Chain Multi-Agent Simulator',
      description:
        'Developed an interactive state simulator visualizing logistical bottlenecks, event queues, and deterministic routing across simulated distribution nodes.',
      technologies: ['TypeScript', 'React', 'Node.js', 'Tailwind CSS'],
    },
    {
      title: 'Sarqyt Community Food Rescue Platform',
      description:
        'Built a mobile-first web application connecting local food donors with community shelters, featuring real-time inventory tracking and location-based matching.',
      technologies: ['TypeScript', 'React', 'REST APIs', 'SQL'],
    },
  ],
  targetRole: 'AI Automation Engineer',
  preferredFormat: 'Remote',
  preferredLocation: 'Worldwide',
};
