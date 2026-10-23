'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { ScoredJob, CandidateProfile, WorkFormat } from '../types';
import { JobCard } from './JobCard';
import { EmptyResults } from './EmptyResults';
import { Award, ArrowUpDown, Filter, RotateCcw } from 'lucide-react';

interface JobListProps {
  scoredJobs: ScoredJob[];
  candidateProfile?: CandidateProfile;
  onResetLocationFilter?: () => void;
}

export const JobList: React.FC<JobListProps> = ({
  scoredJobs,
  candidateProfile,
  onResetLocationFilter,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<string>('All');
  const [locationFilter, setLocationFilter] = useState<string>('');

  // Determine active strict location setting from candidate profile
  const isStrictLocation = Boolean(candidateProfile?.strictLocationFilter);
  const candidateLocation = candidateProfile?.preferredLocation?.trim() || '';

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    return scoredJobs.filter(({ job }) => {
      // 1. Format filter
      if (selectedFormat !== 'All' && job.format !== selectedFormat) {
        return false;
      }

      // 2. Strict location filter from candidate profile
      if (isStrictLocation && candidateLocation) {
        const normCandLoc = candidateLocation.toLowerCase();
        if (normCandLoc !== 'worldwide' && normCandLoc !== 'any' && normCandLoc !== 'remote') {
          const normJobLoc = job.location.toLowerCase();
          const matchesCity = normJobLoc.includes(normCandLoc) || normCandLoc.includes(normJobLoc);
          const isJobRemote = job.format === 'Remote' || normJobLoc.includes('worldwide');

          // Strict location rejects jobs in different on-site/hybrid cities,
          // while preserving vacancies that are Remote/Worldwide
          if (!matchesCity && !isJobRemote) {
            return false;
          }
        }
      }

      // 3. User manual location text filter (if typed)
      if (locationFilter.trim()) {
        const query = locationFilter.trim().toLowerCase();
        const matchesJobLoc = job.location.toLowerCase().includes(query);
        const matchesTitle = job.title.toLowerCase().includes(query);
        if (!matchesJobLoc && !matchesTitle) {
          return false;
        }
      }

      return true;
    });
  }, [scoredJobs, selectedFormat, isStrictLocation, candidateLocation, locationFilter]);

  // #1 ranked job among filtered jobs is expanded by default
  const [expandedId, setExpandedId] = useState<string | null>(
    filteredJobs.length > 0 ? filteredJobs[0].job.id : null
  );

  // Auto-expand #1 when filtered list changes
  useEffect(() => {
    if (filteredJobs.length > 0) {
      setExpandedId(filteredJobs[0].job.id);
    } else {
      setExpandedId(null);
    }
  }, [filteredJobs]);

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const handleResetAllFilters = () => {
    setSelectedFormat('All');
    setLocationFilter('');
    if (onResetLocationFilter) {
      onResetLocationFilter();
    }
  };

  const hasActiveFilters =
    selectedFormat !== 'All' || locationFilter.trim().length > 0 || isStrictLocation;

  return (
    <div className="w-full space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200/80 gap-3">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ranked Vacancies ({filteredJobs.length} of {scoredJobs.length} Results)
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sorted descending by 50/35/15 Match Score</span>
        </div>
      </div>

      {/* Filter bar: Format segmented buttons & location quick search */}
      <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-slate-700 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            Filter Format:
          </span>
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 border border-slate-200">
            {['All', 'Remote', 'Hybrid', 'On-site'].map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => setSelectedFormat(fmt)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedFormat === fmt
                    ? 'bg-white text-teal-700 font-semibold shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {fmt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            placeholder="Filter by city / title..."
            className="w-full md:w-56 px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetAllFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 shrink-0 font-medium transition-colors"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* If 0 results after filtering: show EmptyResults */}
      {filteredJobs.length === 0 ? (
        <EmptyResults
          currentLocation={locationFilter || candidateLocation || 'Current Filter'}
          currentFormat={selectedFormat}
          onResetFilters={handleResetAllFilters}
        />
      ) : (
        /* Ranked job cards */
        <div className="space-y-4">
          {filteredJobs.map((scoredJob, idx) => (
            <JobCard
              key={scoredJob.job.id}
              scoredJob={scoredJob}
              rank={idx + 1}
              isExpanded={expandedId === scoredJob.job.id}
              onToggleExpand={() => handleToggle(scoredJob.job.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};
