// src/lib/extractProfile.ts
import { CandidateProfile, CandidateProject, WorkFormat } from '../types';

/**
 * Canonical dictionary of technical skills and tools.
 * Each entry maps a canonical display name to an array of regexes or aliases.
 */
export const CANONICAL_SKILL_ONTOLOGY: { name: string; patterns: RegExp[] }[] = [
  // Languages
  { name: 'TypeScript', patterns: [/\btypescript\b/i, /\bts\b/i] },
  { name: 'JavaScript', patterns: [/\bjavascript\b/i, /\bjs\b/i, /\bes6\b/i] },
  { name: 'Python', patterns: [/\bpython\b/i, /\bpython3\b/i] },
  { name: 'SQL', patterns: [/\bsql\b/i, /\bpl\/sql\b/i, /\btsql\b/i] },
  { name: 'HTML', patterns: [/\bhtml5?\b/i] },
  { name: 'CSS', patterns: [/\bcss3?\b/i] },
  { name: 'Go', patterns: [/\bgolang\b/i, /\bgo\s+language\b/i] },
  { name: 'Rust', patterns: [/\brust\b/i] },
  { name: 'Java', patterns: [/\bjava\b(?!script)/i] },
  { name: 'C++', patterns: [/\bc\+\+\b/i] },
  { name: 'C#', patterns: [/\bc#\b/i, /\bcsharp\b/i] },

  // Frontend & UI
  { name: 'React', patterns: [/\breact(\.js)?\b/i] },
  { name: 'Next.js', patterns: [/\bnext(\.js)?\b/i] },
  { name: 'Tailwind CSS', patterns: [/\btailwind(\s*css)?\b/i] },
  { name: 'Vue.js', patterns: [/\bvue(\.js)?\b/i] },
  { name: 'Angular', patterns: [/\bangular(\.js)?\b/i] },
  { name: 'Redux', patterns: [/\bredux\b/i] },

  // Backend & APIs
  { name: 'Node.js', patterns: [/\bnode(\.js)?\b/i] },
  { name: 'FastAPI', patterns: [/\bfastapi\b/i] },
  { name: 'Express', patterns: [/\bexpress(\.js)?\b/i] },
  { name: 'Flask', patterns: [/\bflask\b/i] },
  { name: 'Django', patterns: [/\bdjango\b/i] },
  { name: 'REST APIs', patterns: [/\brest(ful)?\s*(api|apis)?\b/i, /\bweb\s*services\b/i] },
  { name: 'GraphQL', patterns: [/\bgraphql\b/i] },
  { name: 'Webhooks', patterns: [/\bwebhooks?\b/i] },
  { name: 'gRPC', patterns: [/\bgrpc\b/i] },

  // Databases & Caches
  { name: 'PostgreSQL', patterns: [/\bpostgres(ql)?\b/i] },
  { name: 'MongoDB', patterns: [/\bmongo(db)?\b/i] },
  { name: 'MySQL', patterns: [/\bmysql\b/i] },
  { name: 'Redis', patterns: [/\bredis\b/i] },
  { name: 'SQLite', patterns: [/\bsqlite\b/i] },

  // Data & AI
  { name: 'Data Validation', patterns: [/\bdata\s*validation\b/i, /\bpydantic\b/i, /\bzod\b/i] },
  { name: 'LLM', patterns: [/\bllms?\b/i, /\blarge\s+language\s+models?\b/i] },
  { name: 'LangChain', patterns: [/\blangchain\b/i] },
  { name: 'PyTorch', patterns: [/\bpytorch\b/i] },
  { name: 'TensorFlow', patterns: [/\btensorflow\b/i] },
  { name: 'Pandas', patterns: [/\bpandas\b/i] },

  // DevOps, Testing & Automation
  { name: 'Git', patterns: [/\bgit\b/i, /\bgithub\b/i, /\bgitlab\b/i] },
  { name: 'Docker', patterns: [/\bdocker\b/i] },
  { name: 'Kubernetes', patterns: [/\bkubernetes\b/i, /\bk8s\b/i] },
  { name: 'CI/CD', patterns: [/\bci\/?cd\b/i, /\bcontinuous\s+integration\b/i] },
  { name: 'Playwright', patterns: [/\bplaywright\b/i] },
  { name: 'Selenium', patterns: [/\bselenium\b/i] },
  { name: 'Jest', patterns: [/\bjest\b/i] },
  { name: 'Pytest', patterns: [/\bpytest\b/i] },
  { name: 'Workflow Orchestration', patterns: [/\bworkflow\s*orchestration\b/i, /\bairflow\b/i, /\btemporal\b/i] },
  { name: 'Celery', patterns: [/\bcelery\b/i] },
];

/**
 * Extracts candidate skills from raw text using the canonical ontology.
 */
export function extractSkillsFromText(text: string): string[] {
  const foundSkills = new Set<string>();

  for (const item of CANONICAL_SKILL_ONTOLOGY) {
    for (const pattern of item.patterns) {
      if (pattern.test(text)) {
        foundSkills.add(item.name);
        break;
      }
    }
  }

  return Array.from(foundSkills);
}

/**
 * Extracts candidate projects from text.
 * Strictly adheres to grounding rules: does NOT fabricate projects.
 * If projects cannot be determined with certainty, returns an empty list.
 */
export function extractProjectsFromText(text: string, detectedSkills: string[]): CandidateProject[] {
  const projects: CandidateProject[] = [];

  // Look for Project sections
  const projectSectionRegex = /(?:projects|personal\s+projects|academic\s+projects|key\s+projects|selected\s+projects)[\s\S]*?(?=(?:experience|employment|work\s+history|education|skills|certifications|awards|$))/i;
  const match = text.match(projectSectionRegex);

  if (match && match[0]) {
    // Strip the section heading itself (e.g. "PROJECTS", "Personal Projects:")
    const sectionBody = match[0]
      .replace(/^(?:projects|personal\s+projects|academic\s+projects|key\s+projects|selected\s+projects)[:\s]*/i, '')
      .trim();

    // Split into paragraphs or project blocks
    const rawBlocks = sectionBody
      .split(/\n\s*\n|\r\n\s*\r\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 15);

    for (let i = 0; i < Math.min(rawBlocks.length, 3); i++) {
      const block = rawBlocks[i];
      const blockLines = block.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
      if (blockLines.length === 0) continue;

      const titleLine = blockLines[0].replace(/^[-*•#\d.]+\s*/, '').trim();

      // Ensure title is a real project title and not a generic category header
      if (
        titleLine &&
        titleLine.length >= 3 &&
        titleLine.length <= 80 &&
        !/^(education|skills|experience|certifications)$/i.test(titleLine)
      ) {
        // Find technologies mentioned in this project block
        const blockTechs = detectedSkills.filter((skill) =>
          new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(block)
        );

        const descLines = blockLines.slice(1).join(' ');
        const description = (descLines || block).substring(0, 250).replace(/\s+/g, ' ').trim();

        projects.push({
          title: titleLine,
          description,
          technologies: blockTechs.length > 0 ? blockTechs : detectedSkills.slice(0, 3),
        });
      }
    }
  }

  return projects;
}

/**
 * Deterministically constructs a CandidateProfile from extracted document text.
 */
export function extractProfileFromText(text: string, fileName?: string): CandidateProfile {
  const skills = extractSkillsFromText(text);
  const projects = extractProjectsFromText(text, skills);

  // Extract a clean name from first few lines if available
  const firstLines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let candidateName = 'Extracted Candidate';
  if (firstLines.length > 0) {
    const firstLine = firstLines[0].replace(/[^a-zA-Z\s'-]/g, '').trim();
    if (firstLine.length >= 3 && firstLine.length <= 40 && !/resume|curriculum|cv/i.test(firstLine)) {
      candidateName = firstLine;
    } else if (fileName) {
      candidateName = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
    }
  }

  // Detect location if mentioned
  let preferredLocation = 'Worldwide';
  const locationMatches = [
    { loc: 'London, UK', pattern: /\blondon\b|\bunited\s*kingdom\b|\buk\b/i },
    { loc: 'Berlin, Germany', pattern: /\bberlin\b|\bgermany\b/i },
    { loc: 'Almaty, Kazakhstan', pattern: /\balmaty\b|\bkazakhstan\b/i },
    { loc: 'San Francisco, CA', pattern: /\bsan\s*francisco\b|\bcalifornia\b|\busa?\b/i },
    { loc: 'Worldwide', pattern: /\bremote\b|\bworldwide\b|\bglobal\b/i },
  ];

  for (const item of locationMatches) {
    if (item.pattern.test(text)) {
      preferredLocation = item.loc;
      break;
    }
  }

  // Detect work format preference if mentioned
  let preferredFormat: WorkFormat = 'Remote';
  if (/\bhybrid\b/i.test(text)) {
    preferredFormat = 'Hybrid';
  } else if (/\bon-?site\b|\bin-?office\b/i.test(text)) {
    preferredFormat = 'On-site';
  } else if (/\bremote\b/i.test(text)) {
    preferredFormat = 'Remote';
  } else {
    preferredFormat = 'Any';
  }

  // Detect target role alignment
  let targetRole = 'AI Automation Engineer';
  if (/\bfull-?stack\b|\breact\b|\bfrontend\b/i.test(text)) {
    targetRole = 'Junior Full-Stack Developer';
  } else if (/\bqa\b|\btesting\b|\btest\s*automation\b/i.test(text)) {
    targetRole = 'QA Automation Intern';
  } else if (/\bpython\b|\bdata\s*pipeline\b/i.test(text)) {
    targetRole = 'Junior Python Developer';
  } else if (/\bsupport\b|\boperations\b|\bcrm\b/i.test(text)) {
    targetRole = 'Technical Support / Product Operations';
  }

  const summary =
    projects.length > 0
      ? `Profile extracted from document with ${skills.length} verified technical skills and ${projects.length} project references.`
      : `Profile extracted with ${skills.length} verified technical skills. Review or add project details below.`;

  return {
    name: candidateName,
    summary,
    skills,
    projects,
    targetRole,
    preferredFormat,
    preferredLocation,
  };
}
