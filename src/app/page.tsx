'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ResumeUploader } from '../components/ResumeUploader';
import { ProfileReview } from '../components/ProfileReview';
import { JobList } from '../components/JobList';
import { SAMPLE_CANDIDATE } from '../data/sample-candidate';
import demoJobsData from '../data/demo-jobs.json';
import { CandidateProfile, JobListing, ScoredJob } from '../types';
import { scoreAllJobs } from '../lib/matchingEngine';

const DEMO_JOBS = demoJobsData as JobListing[];

export default function Home() {
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfile | null>(null);
  const [activeFileName, setActiveFileName] = useState<string | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [scoredJobs, setScoredJobs] = useState<ScoredJob[] | null>(null);

  // 1-Click Sample CV load
  const handleLoadSample = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setScoredJobs(null);
    setTimeout(() => {
      setCandidateProfile(JSON.parse(JSON.stringify(SAMPLE_CANDIDATE)));
      setActiveFileName('sample-early-career-cv.pdf (Synthetic Profile)');
      setIsLoading(false);
    }, 150);
  };

  // Upload handler placeholder (connected to /api/parse-cv in Slice 3)
  const handleFileUpload = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5 MB limit. Please upload a smaller document.');
      return;
    }
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    const isDocx = file.name.endsWith('.docx');
    const isPdf = file.name.endsWith('.pdf');

    if (!validTypes.includes(file.type) && !isDocx && !isPdf) {
      setErrorMessage('Unsupported file format. Please upload a PDF or DOCX file (up to 5 MB).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setScoredJobs(null);
    setActiveFileName(file.name);

    setTimeout(() => {
      setCandidateProfile({
        name: file.name.replace(/\.[^/.]+$/, ''),
        summary: 'Candidate profile extracted from ' + file.name,
        skills: ['TypeScript', 'Python', 'React', 'Node.js', 'REST APIs', 'Git'],
        projects: [
          {
            title: 'Uploaded Resume Project',
            description: 'Custom projects extracted from document text.',
            technologies: ['TypeScript', 'React', 'REST APIs'],
          },
        ],
        targetRole: 'AI Automation Engineer',
        preferredFormat: 'Remote',
        preferredLocation: 'Worldwide',
      });
      setIsLoading(false);
    }, 400);
  };

  const handleResetSession = () => {
    setCandidateProfile(null);
    setActiveFileName(undefined);
    setIsLoading(false);
    setIsSearching(false);
    setErrorMessage(null);
    setScoredJobs(null);
  };

  const handleFindMatches = () => {
    if (!candidateProfile) return;
    setIsSearching(true);

    setTimeout(() => {
      const results = scoreAllJobs(candidateProfile, DEMO_JOBS);
      setScoredJobs(results);
      setIsSearching(false);

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onReset={handleResetSession}
        hasActiveSession={Boolean(candidateProfile || scoredJobs)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <ResumeUploader
          onLoadSample={handleLoadSample}
          onFileUpload={handleFileUpload}
          isLoading={isLoading}
          activeFileName={activeFileName}
          errorMessage={errorMessage}
          onClearError={() => setErrorMessage(null)}
        />

        {candidateProfile && (
          <ProfileReview
            profile={candidateProfile}
            onUpdateProfile={setCandidateProfile}
            onFindMatches={handleFindMatches}
            isSearching={isSearching}
          />
        )}

        {scoredJobs && (
          <section id="results-section" className="pt-2">
            <JobList scoredJobs={scoredJobs} />
          </section>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 space-y-1">
          <p className="font-medium text-slate-700">
            RoleFit AI — Built with AI: Basics Hackathon Proof of Concept
          </p>
          <p>
            Deterministic 50/35/15 explainable scoring. Ephemeral in-memory processing. All 5 demo
            job listings are synthetic.
          </p>
        </div>
      </footer>
    </div>
  );
}
