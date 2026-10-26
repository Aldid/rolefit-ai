'use client';

import React, { useState } from 'react';
import { CandidateProfile, WorkFormat } from '../types';
import { Plus, X, Search, Briefcase, MapPin, Laptop, Layers, Loader2 } from 'lucide-react';

interface ProfileReviewProps {
  profile: CandidateProfile;
  onUpdateProfile: (updated: CandidateProfile) => void;
  onFindMatches: () => void;
  isSearching: boolean;
}

export const ProfileReview: React.FC<ProfileReviewProps> = ({
  profile,
  onUpdateProfile,
  onFindMatches,
  isSearching,
}) => {
  const [newSkill, setNewSkill] = useState('');

  const targetRoles = [
    'AI Automation Engineer',
    'Junior Full-Stack Developer',
    'Junior Python Developer',
    'QA Automation Intern',
    'Technical Support / Product Operations',
  ];

  const workFormats: WorkFormat[] = ['Remote', 'Hybrid', 'On-site', 'Any'];

  const locationPresets = ['Worldwide', 'London, UK', 'Berlin, Germany', 'Almaty, Kazakhstan', 'San Francisco, CA'];

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newSkill.trim();
    if (trimmed && !profile.skills.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      onUpdateProfile({
        ...profile,
        skills: [...profile.skills, trimmed],
      });
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    onUpdateProfile({
      ...profile,
      skills: profile.skills.filter((s) => s !== skillToRemove),
    });
  };

  return (
    <div className="w-full space-y-6 pt-2">
      {/* Step Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between pb-3 border-b border-slate-200/80 gap-2">
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-wider text-teal-800 mb-0.5">
            Step 1 of 2 • Review & Calibration
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Candidate Profile & Preferences
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review your detected technical skills and calibrate job search criteria before matching.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-white text-slate-700 rounded-md border border-slate-200 shadow-2xs self-start sm:self-auto shrink-0">
          {profile.skills.length} Skills Verified
        </span>
      </div>

      {/* Preferences Section: Clean, structured horizontal layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        {/* Target Role */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            Target Role
          </label>
          <select
            value={profile.targetRole}
            onChange={(e) => onUpdateProfile({ ...profile, targetRole: e.target.value })}
            className="w-full text-xs sm:text-sm bg-slate-50 hover:bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 font-medium transition-colors"
          >
            {targetRoles.map((role) => (
              <option key={role} value={role}>
                {role}
              </option>
            ))}
          </select>
        </div>

        {/* Work Format */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Laptop className="w-3.5 h-3.5 text-slate-400" />
            Work Format Preference (10 pts)
          </label>
          <div className="grid grid-cols-4 gap-1 p-0.5 bg-slate-100 rounded-md border border-slate-200">
            {workFormats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => onUpdateProfile({ ...profile, preferredFormat: format })}
                className={`py-1.5 text-xs font-medium rounded transition-all text-center ${
                  profile.preferredFormat === format
                    ? 'bg-white text-slate-900 font-bold shadow-2xs border border-slate-200/90'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        {/* Location Preference */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            Target Location (5 pts)
          </label>
          <input
            type="text"
            value={profile.preferredLocation}
            onChange={(e) => onUpdateProfile({ ...profile, preferredLocation: e.target.value })}
            placeholder="e.g. Worldwide, London, Remote"
            className="w-full text-xs sm:text-sm bg-slate-50 hover:bg-white border border-slate-300 rounded-md px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors"
          />
          <div className="flex flex-wrap items-center gap-1 pt-0.5">
            <span className="text-[10px] text-slate-400 mr-0.5">Presets:</span>
            {locationPresets.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onUpdateProfile({ ...profile, preferredLocation: loc })}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200 transition-colors"
              >
                {loc}
              </button>
            ))}
          </div>
          <div className="pt-1">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(profile.strictLocationFilter)}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, strictLocationFilter: e.target.checked })
                }
                className="rounded border-slate-300 text-teal-800 focus:ring-teal-700 w-3.5 h-3.5"
              />
              <span className="font-medium text-slate-700">Strict location filter</span>
            </label>
          </div>
        </div>
      </div>

      {/* Verified Skills Section */}
      <div className="space-y-2.5 p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <label className="text-xs font-semibold text-slate-900 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-800" />
            Verified Technical Skills (50% Match Weight)
          </label>
          <span className="text-[11px] text-slate-400">
            Click × on any skill to remove, or append missing skills below
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 py-1 min-h-[44px] items-center">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md bg-slate-50 text-slate-800 border border-slate-200 hover:border-slate-300 transition-colors"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-600 rounded p-0.5 transition-colors focus:outline-none focus:text-rose-600"
                title={`Remove ${skill}`}
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {profile.skills.length === 0 && (
            <span className="text-xs text-slate-400 italic">No skills listed yet. Add some below.</span>
          )}
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm pt-1">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add missing skill (e.g. Docker, SQL)"
            className="flex-1 text-xs bg-slate-50 hover:bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 transition-colors"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-800 rounded-md border border-slate-300 shadow-2xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Projects Reference Section */}
      {profile.projects && profile.projects.length > 0 && (
        <div className="space-y-2.5 p-5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-900">
              Documented Projects ({profile.projects.length}) — Relevant Experience Weight (35%)
            </span>
            <span className="text-[11px] text-slate-400">Extracted from resume experience</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/80 text-xs flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-slate-900 mb-1 leading-snug">{proj.title}</div>
                  <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed mb-2">
                    {proj.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-1 pt-1.5 border-t border-slate-200/60">
                  {proj.technologies.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                  {proj.technologies.length > 3 && (
                    <span className="text-[10px] text-slate-400 font-medium">+{proj.technologies.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button: Find Matches */}
      <div className="pt-2">
        <button
          onClick={onFindMatches}
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white text-sm font-semibold shadow-xs transition-all disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2"
        >
          {isSearching ? (
            <>
              <Loader2 className="w-4 h-4 text-white animate-spin shrink-0" />
              <span>Calculating 50/35/15 Mathematical Match...</span>
            </>
          ) : (
            <>
              <Search className="w-4 h-4" />
              <span>Find Matches & Explain Scores (5 Vacancies)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};


