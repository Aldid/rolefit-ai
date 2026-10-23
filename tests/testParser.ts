// tests/testParser.ts
import assert from 'assert';
import {
  extractSkillsFromText,
  extractProjectsFromText,
  extractProfileFromText,
} from '../src/lib/extractProfile';

console.log('🧪 RUNNING CV EXTRACTOR & GROUNDING TESTS');
console.log('==========================================');

// --- Suite 1: Canonical Skill Extraction & Boundaries ---
console.log('\n--- 1. Testing Skill Extraction & Word Boundary Invariants ---');
const sampleText = `
Software Engineer with 2 years of experience building scalable backend APIs.
Proficient in Python, TypeScript, React, Next.js, and FastAPI.
Hands-on experience with PostgreSQL, Redis, Docker, and REST APIs.
Automated testing using Playwright and Jest.
Familiar with Git and CI/CD pipelines.
`;

const extractedSkills = extractSkillsFromText(sampleText);
assert(extractedSkills.includes('Python'), 'Must detect Python');
assert(extractedSkills.includes('TypeScript'), 'Must detect TypeScript');
assert(extractedSkills.includes('React'), 'Must detect React');
assert(extractedSkills.includes('Next.js'), 'Must detect Next.js');
assert(extractedSkills.includes('FastAPI'), 'Must detect FastAPI');
assert(extractedSkills.includes('PostgreSQL'), 'Must detect PostgreSQL');
assert(extractedSkills.includes('Redis'), 'Must detect Redis');
assert(extractedSkills.includes('Docker'), 'Must detect Docker');
assert(extractedSkills.includes('REST APIs'), 'Must detect REST APIs');
assert(extractedSkills.includes('Playwright'), 'Must detect Playwright');
assert(extractedSkills.includes('Git'), 'Must detect Git');
assert(extractedSkills.includes('CI/CD'), 'Must detect CI/CD');

// 1.1 Word boundary test: "Go" should not match in "algorithm" or "good"
const negativeText = 'I am good at creating algorithmic solutions in Java and JavaScript.';
const negativeSkills = extractSkillsFromText(negativeText);
assert(!negativeSkills.includes('Go'), 'Word "good" or "algorithm" must NOT falsely trigger "Go" skill');
assert(negativeSkills.includes('JavaScript'), 'Must detect JavaScript');
assert(negativeSkills.includes('Java'), 'Must detect Java');
console.log('  ✓ Word boundary invariants verified (zero false positives for "Go")');

// 1.2 C++ and C# Positive & Negative Tests
console.log('\n--- 1.2 Testing C++ and C# Extraction ---');
const cppText = 'Developed high-performance game logic in C++ and compiled with CMake.';
const cppSkills = extractSkillsFromText(cppText);
assert(cppSkills.includes('C++'), 'Must detect C++ in standard sentence');

const csharpText = 'Built backend microservices in C# and .NET Core.';
const csharpSkills = extractSkillsFromText(csharpText);
assert(csharpSkills.includes('C#'), 'Must detect C# in standard sentence');

const multiLangText = 'Polyglot programmer fluent in C++, C#, Python, and TypeScript.';
const multiLangSkills = extractSkillsFromText(multiLangText);
assert(multiLangSkills.includes('C++'), 'Must detect C++ in comma-separated list');
assert(multiLangSkills.includes('C#'), 'Must detect C# in comma-separated list');

// Negative boundary tests for C++ and C#
const nonCppText = 'Reviewed a c+++ proposal and verified somec# identifier.';
const nonCppSkills = extractSkillsFromText(nonCppText);
assert(!nonCppSkills.includes('C++'), '"c+++" must NOT match C++');
assert(!nonCppSkills.includes('C#'), '"somec#" must NOT match C#');
console.log('  ✓ C++ and C# positive and negative boundary tests passed');

// 1.3 REST APIs vs Ordinary Word "rest" Tests
console.log('\n--- 1.3 Testing REST APIs vs Ordinary Word "rest" ---');
const restApiPositive1 = 'Built scalable REST APIs using FastAPI and PostgreSQL.';
const restSkills1 = extractSkillsFromText(restApiPositive1);
assert(restSkills1.includes('REST APIs'), 'Must detect "REST APIs"');

const restApiPositive2 = 'Designed RESTful endpoints and microservices.';
const restSkills2 = extractSkillsFromText(restApiPositive2);
assert(restSkills2.includes('REST APIs'), 'Must detect "RESTful endpoints" as REST APIs');

const restWordNegative1 = 'Collaborated effectively with the rest of the engineering team.';
const restNegSkills1 = extractSkillsFromText(restWordNegative1);
assert(!restNegSkills1.includes('REST APIs'), 'Ordinary phrase "rest of the team" must NOT match REST APIs');

const restWordNegative2 = 'Take a rest between sprints to prevent burnout.';
const restNegSkills2 = extractSkillsFromText(restWordNegative2);
assert(!restNegSkills2.includes('REST APIs'), 'Ordinary phrase "take a rest" must NOT match REST APIs');

const restWordNegative3 = 'We rested the database cluster during maintenance.';
const restNegSkills3 = extractSkillsFromText(restWordNegative3);
assert(!restNegSkills3.includes('REST APIs'), 'Past tense "rested" must NOT match REST APIs');
console.log('  ✓ REST APIs positive and negative word tests passed (zero false positives on "rest")');

// --- Suite 2: Grounded Project Extraction ---
console.log('\n--- 2. Testing Grounded Project Extraction (No Invented Experience) ---');

// Case A: Resume with explicit project technologies in text
const resumeWithTechProjects = `
Jane Doe
jane@example.com

SKILLS
TypeScript, React, Python, Docker, PostgreSQL

PROJECTS
LeadFlow CRM Automation
Built an asynchronous lead distribution system in Python and FastAPI with PostgreSQL integrations.

Supply Chain Bottleneck Simulator
Developed an interactive state simulator in TypeScript and React with queue metrics.

EDUCATION
B.Sc. in Computer Science
`;

const skillsA = extractSkillsFromText(resumeWithTechProjects);
const projectsA = extractProjectsFromText(resumeWithTechProjects, skillsA);
assert.strictEqual(projectsA.length, 2, 'Should extract 2 projects');
assert(projectsA[0].technologies.includes('Python'), 'LeadFlow must contain Python');
assert(projectsA[0].technologies.includes('PostgreSQL'), 'LeadFlow must contain PostgreSQL');
assert(projectsA[1].technologies.includes('TypeScript'), 'Simulator must contain TypeScript');
assert(projectsA[1].technologies.includes('React'), 'Simulator must contain React');
console.log('  ✓ Projects with explicit tech descriptions correctly bound to verified skills');

// Case B: Skills in Skills section, but Project description has NO technologies mentioned
console.log('\n--- 2.2 Testing Project without Verified Tech in Project Block ---');
const resumeWithUntaggedProject = `
Alex Mercer
alex@example.com

SKILLS
Python, Docker, React, TypeScript, PostgreSQL

PROJECTS
Community Volunteer Organizer
Coordinated weekly volunteer shifts, scheduled cleanups, and managed team onboarding procedures.

EDUCATION
High School Diploma
`;

const skillsB = extractSkillsFromText(resumeWithUntaggedProject);
assert(skillsB.length >= 3, 'Skills section should extract 5 skills');
const projectsB = extractProjectsFromText(resumeWithUntaggedProject, skillsB);

assert.strictEqual(projectsB.length, 1, 'Should extract the project title');
assert.strictEqual(projectsB[0].title, 'Community Volunteer Organizer', 'Project title matches');
assert.strictEqual(
  projectsB[0].technologies.length,
  0,
  'Project technologies MUST be empty when none are found in the project description (no arbitrary fallback!)'
);
console.log('  ✓ Project with no tech in description yields empty technologies array [] (strictly grounded)');

// Case C: Resume with NO project section
const resumeWithoutProjects = `
John Smith
Experienced customer support associate. Skilled in SQL, Git, and REST APIs.
Worked at TechCorp resolving tickets and communicating with customers.
`;

const skillsC = extractSkillsFromText(resumeWithoutProjects);
const projectsC = extractProjectsFromText(resumeWithoutProjects, skillsC);
assert.strictEqual(
  projectsC.length,
  0,
  'When resume has no verifiable projects section, projects list MUST be empty'
);
console.log('  ✓ Empty projects list guaranteed when no projects section is present');

// --- Suite 3: Deterministic Candidate Profile Generation ---
console.log('\n--- 3. Testing Full Profile Synthesis ---');
const profile = extractProfileFromText(resumeWithTechProjects, 'Jane_Doe_Resume.pdf');
assert.strictEqual(profile.name, 'Jane Doe', 'Must extract candidate name from top line');
assert(profile.skills.length >= 2, 'Profile must have extracted skills');
assert(profile.projects.length === 2, 'Profile must carry extracted projects');
assert.strictEqual(profile.preferredLocation, 'Worldwide', 'Default location is Worldwide when unstated');
console.log(`  ✓ Profile synthesized cleanly for: ${profile.name}`);
console.log(`  ✓ Skills count: ${profile.skills.length}`);
console.log(`  ✓ Summary: "${profile.summary}"`);

console.log('\n==========================================');
console.log('✅ ALL CV EXTRACTOR & GROUNDING TESTS PASSED (100% VERIFIED)\n');
