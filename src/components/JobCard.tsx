'use client';

import React from 'react';
import { ScoredJob } from '../types';
import { ChevronDown, ChevronUp, Check, AlertTriangle, Lightbulb, MapPin, Laptop, Building2 } from 'lucide-react';

interface JobCardProps {
  scoredJob: ScoredJob;
  rank: number;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  scoredJob,
  rank,
  isExpanded,
  onToggleExpand,
}) => {
  const { job, breakdown } = scoredJob;

  // Score color badge
  const getScoreBadgeColor = (score: number) => {
    if (score >= 75) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-300';
    }
    if (score >= 50) {
      return 'bg-teal-50 text-teal-700 border-teal-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

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
      className={`rounded-2xl border transition-all ${
        rank === 1
          ? 'bg-white border-teal-300 shadow-md ring-1 ring-teal-200/50'
          : 'bg-white border-slate-200 hover:border-slate-300 shadow-sm'
      }`}
    >
      {/* Header bar */}
      <div
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${job.title} at ${job.company}, Match Score ${breakdown.totalScore}%. Press Enter to ${
          isExpanded ? 'collapse' : 'expand'
        }`}
        onClick={onToggleExpand}
        onKeyDown={handleKeyDown}
        className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none focus:outline-none focus:ring-2 focus:ring-teal-500 rounded-2xl"
      >
        <div className="flex items-start gap-4">
          <div
            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-black text-lg border shrink-0 ${getScoreBadgeColor(
              breakdown.totalScore
            )}`}
          >
            <span>{breakdown.totalScore}%</span>
            <span className="text-[9px] uppercase tracking-wider font-semibold -mt-1">Match</span>
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                #{rank} Rank
              </span>
              <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                {job.title}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-medium text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location}
              </span>
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                {job.format}
              </span>
              <span className="text-[11px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-medium">
                Synthetic Listing
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-right hidden md:block">
            <div className="text-xs font-semibold text-slate-700">
              Skills: {breakdown.skillsScore}/50 | Exp: {breakdown.experienceScore}/35 | Fit:{' '}
              {breakdown.locationScore}/15
            </div>
            <div className="text-[11px] text-slate-400">Click or press Enter to {isExpanded ? 'collapse' : 'expand details'}</div>
          </div>

          <div
            className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200"
            aria-hidden="true"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded Accordion Drawer */}
      {isExpanded && (
        <div className="px-5 pb-6 sm:px-6 pt-2 border-t border-slate-100 space-y-6">
          {/* Job description */}
          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-lg border border-slate-200">
            <span className="font-semibold text-slate-800">Role Context: </span>
            {job.description}
          </p>

          {/* Mathematical 50/35/15 Breakdown Progress Bars */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Mathematical Score Breakdown (50 / 35 / 15)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Skills Bar (50 pts) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Skills Match</span>
                  <span className="font-bold text-slate-900">{breakdown.skillsScore} / 50</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-teal-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: getScoreBgBar(breakdown.skillsScore, 50) }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {breakdown.matchedSkills.length} of {job.requiredSkills.length + job.preferredSkills.length} skills verified
                </p>
              </div>

              {/* Experience Bar (35 pts) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Relevant Experience</span>
                  <span className="font-bold text-slate-900">{breakdown.experienceScore} / 35</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: getScoreBgBar(breakdown.experienceScore, 35) }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {breakdown.matchedProjects.length} domain-relevant project(s) identified
                </p>
              </div>

              {/* Location & Format Bar (15 pts) */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Location & Format</span>
                  <span className="font-bold text-slate-900">{breakdown.locationScore} / 15</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-sky-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: getScoreBgBar(breakdown.locationScore, 15) }}
                  />
                </div>
                <p className="text-[10px] text-slate-500">
                  {job.format} • {job.location}
                </p>
              </div>
            </div>
          </div>

          {/* Matches & Gaps Badges */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Matched Skills */}
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-200/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>Found Matches ({breakdown.matchedSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matchedSkills.map((skill) => (
                  <span
                    key={skill}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-100/80 text-emerald-800 border border-emerald-200"
                  >
                    ✓ {skill}
                  </span>
                ))}
                {breakdown.matchedSkills.length === 0 && (
                  <span className="text-xs text-slate-500 italic">No direct skill matches found.</span>
                )}
              </div>
            </div>

            {/* Missing Gaps */}
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-200/70 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Missing Requirements / Gaps ({breakdown.missingSkills.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {breakdown.missingSkills.map((gap) => (
                  <span
                    key={gap}
                    className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-800 border border-amber-200"
                  >
                    ! {gap}
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

          {/* Grounded CV Adaptation Advice */}
          <div className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-slate-50 border border-teal-200 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-teal-600 text-white shrink-0 mt-0.5 shadow-sm">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-teal-900 tracking-tight">
                Grounded CV Adaptation Tip
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">
                {breakdown.adaptationTip}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
