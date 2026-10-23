'use client';

import React, { useState } from 'react';
import { ScoredJob } from '../types';
import { JobCard } from './JobCard';
import { Award, ArrowUpDown } from 'lucide-react';

interface JobListProps {
  scoredJobs: ScoredJob[];
}

export const JobList: React.FC<JobListProps> = ({ scoredJobs }) => {
  // #1 ranked job (index 0) is expanded by default
  const [expandedId, setExpandedId] = useState<string | null>(
    scoredJobs.length > 0 ? scoredJobs[0].job.id : null
  );

  const handleToggle = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-2">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-teal-600" />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Ranked Vacancies ({scoredJobs.length} Results)
          </h2>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span>Sorted descending by 50/35/15 Match Score</span>
        </div>
      </div>

      <div className="space-y-4">
        {scoredJobs.map((scoredJob, idx) => (
          <JobCard
            key={scoredJob.job.id}
            scoredJob={scoredJob}
            rank={idx + 1}
            isExpanded={expandedId === scoredJob.job.id}
            onToggleExpand={() => handleToggle(scoredJob.job.id)}
          />
        ))}
      </div>
    </div>
  );
};
