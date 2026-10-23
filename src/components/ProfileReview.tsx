'use client';

import React, { useState } from 'react';
import { CandidateProfile, WorkFormat } from '../types';
import { Plus, X, Search, Briefcase, MapPin, Laptop, Layers } from 'lucide-react';

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
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600 inline-block" />
            Candidate Profile & Preferences
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Review detected skills and calibrate your target role and location before running the match engine.
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md border border-slate-200 self-start sm:self-auto">
          {profile.skills.length} Skills Identified
        </span>
      </div>

      {/* Preferences grid: Role, Format, Location */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Target Role */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <Briefcase className="w-3.5 h-3.5 text-teal-600" />
            Target Role
          </label>
          <select
            value={profile.targetRole}
            onChange={(e) => onUpdateProfile({ ...profile, targetRole: e.target.value })}
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
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
            <Laptop className="w-3.5 h-3.5 text-teal-600" />
            Work Format Preference (10 pts)
          </label>
          <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100 rounded-lg border border-slate-200">
            {workFormats.map((format) => (
              <button
                key={format}
                type="button"
                onClick={() => onUpdateProfile({ ...profile, preferredFormat: format })}
                className={`py-1.5 text-xs font-medium rounded transition-all text-center ${
                  profile.preferredFormat === format
                    ? 'bg-white text-teal-700 font-semibold shadow-sm'
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
            <MapPin className="w-3.5 h-3.5 text-teal-600" />
            Target Location (5 pts)
          </label>
          <input
            type="text"
            value={profile.preferredLocation}
            onChange={(e) => onUpdateProfile({ ...profile, preferredLocation: e.target.value })}
            placeholder="e.g. Worldwide, London, Remote"
            className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <div className="flex flex-wrap gap-1 mt-1">
            {locationPresets.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => onUpdateProfile({ ...profile, preferredLocation: loc })}
                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200"
              >
                {loc}
              </button>
            ))}
          </div>
          <div className="pt-1.5">
            <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={Boolean(profile.strictLocationFilter)}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, strictLocationFilter: e.target.checked })
                }
                className="rounded border-slate-300 text-teal-600 focus:ring-teal-500 w-3.5 h-3.5"
              />
              <span className="font-medium text-slate-700">Strict location filter</span>
            </label>
          </div>
        </div>
      </div>

      {/* Skills tag editor */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            Verified Technical Skills (50% Match Weight)
          </span>
          <span className="text-[11px] font-normal text-slate-500">
            Click × to remove or add custom skills below
          </span>
        </label>

        <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200 min-h-[50px] items-center">
          {profile.skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-white text-slate-800 border border-slate-200 shadow-2xs hover:border-slate-300 transition-colors"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                className="text-slate-400 hover:text-rose-600 rounded-full p-0.5 transition-colors"
                title={`Remove ${skill}`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}

          {profile.skills.length === 0 && (
            <span className="text-xs text-slate-400 italic">No skills listed yet. Add some below.</span>
          )}
        </div>

        <form onSubmit={handleAddSkill} className="flex gap-2 max-w-sm">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            placeholder="Add missing skill (e.g. Docker, SQL)"
            className="flex-1 text-xs bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            type="submit"
            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg border border-slate-300 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </form>
      </div>

      {/* Projects summary */}
      {profile.projects && profile.projects.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <label className="text-xs font-semibold text-slate-700">
            Documented Projects ({profile.projects.length}) — Relevant Experience Weight (35%)
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {profile.projects.map((proj, idx) => (
              <div key={idx} className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                <div className="font-semibold text-slate-900 mb-1">{proj.title}</div>
                <p className="text-slate-600 line-clamp-2 text-[11px] leading-relaxed mb-2">
                  {proj.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {proj.technologies.slice(0, 3).map((t) => (
                    <span
                      key={t}
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-white text-slate-600 border border-slate-200"
                    >
                      {t}
                    </span>
                  ))}
                  {proj.technologies.length > 3 && (
                    <span className="text-[10px] text-slate-400">+{proj.technologies.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Action Button: Find Matches */}
      <div className="pt-3">
        <button
          onClick={onFindMatches}
          disabled={isSearching}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-base font-semibold shadow-md shadow-teal-600/20 transition-all disabled:opacity-50"
        >
          {isSearching ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
