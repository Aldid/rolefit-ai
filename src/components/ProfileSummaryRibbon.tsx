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
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-5 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Candidate & Preferences Pills */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs sm:text-sm">
          {/* File/Candidate tag */}
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
            <FileText className="w-4 h-4 text-teal-600" />
            <span className="truncate max-w-[180px] sm:max-w-[220px]">
              {profile.name || activeFileName || 'Candidate Profile'}
            </span>
          </div>

          {/* Target Role */}
          <div className="flex items-center gap-1.5 text-slate-700 bg-teal-50/70 border border-teal-200/80 px-2.5 py-1.5 rounded-lg">
            <Briefcase className="w-3.5 h-3.5 text-teal-700" />
            <span className="font-medium text-teal-900">{profile.targetRole}</span>
          </div>

          {/* Format & Location */}
          <div className="flex items-center gap-1.5 text-slate-700 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-slate-500" />
            <span>
              <strong className="text-slate-800">{profile.preferredFormat}</strong> •{' '}
              {profile.preferredLocation}
            </span>
          </div>

          {/* Skills count */}
          <div className="flex items-center gap-1.5 text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded-lg">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>
              <strong className="text-slate-800">{profile.skills.length}</strong> skills
            </span>
          </div>
        </div>

        {/* Edit / Toggle Button */}
        <button
          type="button"
          onClick={onToggleExpand}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500 self-start sm:self-auto shrink-0"
          aria-expanded={isExpanded}
          aria-label={isExpanded ? 'Collapse profile editor' : 'Edit profile and preferences'}
        >
          <Edit3 className="w-3.5 h-3.5 text-teal-700" />
          <span>{isExpanded ? 'Hide Profile Editor' : 'Edit Profile & Filters'}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-slate-500" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          )}
        </button>
      </div>
    </div>
  );
};
