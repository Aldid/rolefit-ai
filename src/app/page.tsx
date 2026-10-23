'use client';

import React, { useState } from 'react';
import { Header } from '../components/Header';
import { ResumeUploader } from '../components/ResumeUploader';
import { ProfileReview } from '../components/ProfileReview';
import { ProfileSummaryRibbon } from '../components/ProfileSummaryRibbon';
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
  const [isProfileCollapsed, setIsProfileCollapsed] = useState(false);

  // 1-Click Sample CV load
  const handleLoadSample = () => {
    setIsLoading(true);
    setErrorMessage(null);
    setScoredJobs(null);
    setIsProfileCollapsed(false);
    setTimeout(() => {
      setCandidateProfile(JSON.parse(JSON.stringify(SAMPLE_CANDIDATE)));
      setActiveFileName('sample-early-career-cv.pdf (Synthetic Profile)');
      setIsLoading(false);
    }, 150);
  };

  // Real in-memory PDF/DOCX upload via /api/parse-cv
  const handleFileUpload = async (file: File) => {
    // 1. Client-side size guard (5 MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage('File size exceeds the 5 MB limit. Please upload a smaller document.');
      return;
    }

    // 2. Client-side extension validation
    const lowerName = file.name.toLowerCase();
    const isDocx = lowerName.endsWith('.docx');
    const isPdf = lowerName.endsWith('.pdf');

    if (!isDocx && !isPdf) {
      setErrorMessage('Unsupported file format. Please upload a PDF or DOCX file (up to 5 MB).');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setIsProfileCollapsed(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/parse-cv', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        // Safe error state without erasing previous valid profile
        setErrorMessage(data.error || 'Failed to parse resume document.');
        setIsLoading(false);
        return;
      }

      if (!data.profile) {
        setErrorMessage('Server did not return a valid candidate profile.');
        setIsLoading(false);
        return;
      }

      // Successful parse
      setCandidateProfile(data.profile);
      setActiveFileName(file.name);
      setScoredJobs(null); // Reset previous match results so candidate reviews new profile
      setIsLoading(false);
    } catch {
      setErrorMessage(
        'Network or server error while uploading the resume. Please check your connection and try again.'
      );
      setIsLoading(false);
    }
  };

  // Complete session reset (purges all RAM state)
  const handleResetSession = () => {
    setCandidateProfile(null);
    setActiveFileName(undefined);
    setIsLoading(false);
    setIsSearching(false);
    setErrorMessage(null);
    setScoredJobs(null);
    setIsProfileCollapsed(false);
  };

  // Run explainable 50/35/15 match scoring
  const handleFindMatches = () => {
    if (!candidateProfile) return;
    setIsSearching(true);

    setTimeout(() => {
      const results = scoreAllJobs(candidateProfile, DEMO_JOBS);
      setScoredJobs(results);
      setIsSearching(false);
      setIsProfileCollapsed(true); // Collapse profile input block post-search

      // Smooth scroll to results
      setTimeout(() => {
        const resultsEl = document.getElementById('results-section');
        if (resultsEl) {
          resultsEl.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }, 350);
  };

  // Reset strict location filter (triggered by EmptyResults "Show all 5 jobs")
  const handleResetLocationFilter = () => {
    if (!candidateProfile) return;
    const updated: CandidateProfile = {
      ...candidateProfile,
      preferredLocation: 'Worldwide',
      strictLocationFilter: false,
    };
    setCandidateProfile(updated);
    if (scoredJobs) {
      setScoredJobs(scoreAllJobs(updated, DEMO_JOBS));
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header
        onReset={handleResetSession}
        hasActiveSession={Boolean(candidateProfile || scoredJobs)}
      />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Post-search Collapsible Summary Ribbon */}
        {candidateProfile && scoredJobs && (
          <section id="summary-section">
            <ProfileSummaryRibbon
              profile={candidateProfile}
              activeFileName={activeFileName}
              isExpanded={!isProfileCollapsed}
              onToggleExpand={() => setIsProfileCollapsed((prev) => !prev)}
            />
          </section>
        )}

        {/* Input Block: Uploader and Profile Editor (shown initially, or when expanded) */}
        {(!scoredJobs || !isProfileCollapsed) && (
          <div className="space-y-8 transition-all">
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
          </div>
        )}

        {/* Vacancy Results Stream */}
        {scoredJobs && (
          <section id="results-section" className="pt-2">
            <JobList
              scoredJobs={scoredJobs}
              candidateProfile={candidateProfile || undefined}
              onResetLocationFilter={handleResetLocationFilter}
            />
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
