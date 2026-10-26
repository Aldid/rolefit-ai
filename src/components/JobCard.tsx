'use client';

import React from 'react';
import { ScoredJob } from '../types';
import { ChevronDown, ChevronUp, Check, Lightbulb, MapPin, Laptop, Building2, FileText } from 'lucide-react';

interface JobCardProps {
  scoredJob: ScoredJob;
  rank: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onPrepareApplication?: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  scoredJob,
  rank,
  isExpanded,
  onToggleExpand,
  onPrepareApplication,
}) => {
  const { job, breakdown } = scoredJob;

  const getScoreBgBar = (score: number, max: number) => {
    const pct = (score / max) * 100;
    return `${Math.min(100, Math.max(0, pct))}%`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onToggleExpand();
    }
  };

  return (
    <div
      className={`rounded-lg border transition-all ${
        rank === 1
          ? 'bg-white border-teal-800/40 ring-1 ring-teal-800/10 shadow-2xs'
          : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-2xs'
      }`}
    >
      {/* Header bar / Main summary row */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${job.title} at ${job.company}, Match Score ${breakdown.totalScore}%. Press Enter to ${
          isExpanded ? 'collapse' : 'expand'
        }`}
        onClick={onToggleExpand}
        onKeyDown={handleKeyDown}
        className="p-4 sm:p-5 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none focus:outline-none focus:ring-2 focus:ring-teal-700 rounded-lg"
      >
        <div className="flex items-start sm:items-center gap-4 min-w-0">
          {/* Distinctive Match Score Indicator */}
          <div className="flex flex-col items-center justify-center min-w-[54px] p-2 rounded-md bg-slate-50 border border-slate-200/80 shrink-0">
            <span className="font-mono font-extrabold text-lg text-slate-900 leading-none">
              {breakdown.totalScore}%
            </span>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">
              Match
            </span>
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-[11px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                #{rank} Rank
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate">
                {job.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-2.5 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {job.company}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {job.location}
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                {job.format}
              </span>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                Synthetic Listing
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 shrink-0">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-slate-700 font-mono">
              Skills: {breakdown.skillsScore}/50 | Exp: {breakdown.experienceScore}/35 | Fit:{' '}
              {breakdown.locationScore}/15
            </div>
            <div className="text-[11px] text-slate-400">Click to {isExpanded ? 'collapse' : 'view full breakdown'}</div>
          </div>

          <div
            className="p-1.5 rounded-md bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 transition-colors"
            aria-hidden="true"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Accordion Drawer */}
      {isExpanded && (
        <div className="px-5 pb-5 pt-1 border-t border-slate-100 space-y-5">
          {/* 1. What is this role? Unboxed Role Context */}
          <p className="text-xs text-slate-600 leading-relaxed pt-1">
            <span className="font-semibold text-slate-900">Role Context: </span>
            {job.description}
          </p>

          {/* 2. Why does it match me? Clean 50/35/15 Breakdown Meters */}
          <div className="space-y-3 pt-1">
            <div className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
              Match Breakdown (50 / 35 / 15)
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Skills Bar (50 pts) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Skills Match</span>
                  <span className="font-bold text-slate-900 font-mono">{breakdown.skillsScore} / 50</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-teal-800 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: getScoreBgBar(breakdown.skillsScore, 50) }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {breakdown.matchedSkills.length} of {job.requiredSkills.length + job.preferredSkills.length} skills verified
                </p>
              </div>

              {/* Experience Bar (35 pts) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Relevant Experience</span>
                  <span className="font-bold text-slate-900 font-mono">{breakdown.experienceScore} / 35</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-emerald-800 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: getScoreBgBar(breakdown.experienceScore, 35) }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {breakdown.matchedProjects.length} domain project(s) identified
                </p>
              </div>

              {/* Location & Format Bar (15 pts) */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-medium text-slate-600">Location & Format</span>
                  <span className="font-bold text-slate-900 font-mono">{breakdown.locationScore} / 15</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-slate-700 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: getScoreBgBar(breakdown.locationScore, 15) }}
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  {job.format} • {job.location}
                </p>
              </div>
            </div>
          </div>

          {/* Matched Skills and Missing Gaps */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            {/* Matched Skills */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <Check className="w-3.5 h-3.5 text-emerald-700" />
                <span>Found Matches ({breakdown.matchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-emerald-50/80 text-emerald-900 border border-emerald-200/70"
                  >
                    <Check className="w-3 h-3 text-emerald-700" />
                    <span>{skill}</span>
                  </span>
                ))}
                {breakdown.matchedSkills.length === 0 && (
                  <span className="text-xs text-slate-400 italic">No direct skill matches found.</span>
                )}
              </div>
            </div>

            {/* Missing Requirements / Gaps */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 inline-block" />
                <span>Missing Requirements / Gaps ({breakdown.missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.missingSkills.map((gap) => (
                  <span
                    key={gap}
                    className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded bg-amber-50/70 text-amber-900 border border-amber-200/70"
                  >
                    <span className="w-1 h-1 rounded-full bg-amber-600" />
                    <span>{gap}</span>
                  </span>
                ))}
                {breakdown.missingSkills.length === 0 && (
                  <span className="text-xs text-emerald-700 font-medium">
                    All listed requirements are covered!
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 3. What should I improve or do next? Grounded CV Adaptation Advice */}
          <div className="pl-3.5 py-1.5 border-l-2 border-teal-800 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 tracking-tight">
              <Lightbulb className="w-3.5 h-3.5 text-teal-800" />
              <span>CV Adaptation Tip</span>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed font-normal">
              {breakdown.adaptationTip}
            </p>
          </div>

          {/* Action Row: Prepare Application Demo */}
          {onPrepareApplication && (
            <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100">
              <span className="text-xs text-slate-500">
                Ready to draft grounded application materials for this role?
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrepareApplication();
                }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white text-xs font-semibold shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-1"
                aria-label={`Prepare application for ${job.title} at ${job.company}`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Prepare Application</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};


