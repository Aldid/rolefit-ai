'use client';

import React from 'react';
import { CandidateProfile } from '../types';
import { Briefcase, MapPin, Layers, Edit3, ChevronDown, ChevronUp, FileText } from 'lucide-react';

interface ProfileSummaryRibbonProps {
  profile: CandidateProfile;
  activeFileName?: string;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export const ProfileSummaryRibbon: React.FC<ProfileSummaryRibbonProps> = ({
  profile,
  activeFileName,
  isExpanded,
  onToggleExpand,
}) => {
  return (
    <div className="w-full bg-white border border-slate-200/80 rounded-lg p-3 sm:p-3.5 shadow-2xs transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Candidate & Preferences Pills */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 text-xs">
          {/* File/Candidate tag */}
          <div className="flex items-center gap-1.5 font-bold text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-md border border-slate-200/80">
            <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="truncate max-w-[180px] sm:max-w-[220px]">
              {profile.name || activeFileName || 'Candidate Profile'}
            </span>
          </div>

          {/* Target Role */}
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
            <Briefcase className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-medium text-slate-800">{profile.targetRole}</span>
          </div>

          {/* Format & Location */}
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-800 font-semibold">{profile.preferredFormat}</strong> •{' '}
              {profile.preferredLocation}
            </span>
          </div>

          {/* Skills count */}
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
            <Layers className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              <strong className="text-slate-800 font-semibold">{profile.skills.length}</strong> skills
            </span>
          </div>
        </div>

        {/* Edit / Toggle Button */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700 self-start sm:self-auto shrink-0"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse profile editor' : 'Edit profile and preferences'}
        >
          <Edit3 className="w-3.5 h-3.5 text-slate-500" />
          <span>{isExpanded ? 'Hide Profile Editor' : 'Edit Profile & Filters'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>
    </div>
  );
};


