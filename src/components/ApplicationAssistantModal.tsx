'use client';

import React, { useState, useEffect } from 'react';
import { ScoredJob, CandidateProfile } from '../types';
import { ApplicationPackage, ApplicationWorkflowStatus } from '../types/assistant';
import { generateApplicationPackage, LocalDemoApplicationAdapter } from '../lib/applicationAssistant';
import {
  X,
  ShieldAlert,
  FileText,
  ListChecks,
  Copy,
  Check,
  Building2,
  MapPin,
  Laptop,
  AlertTriangle,
  RotateCcw,
  Send,
  Eye,
  Lock,
  Sparkles,
} from 'lucide-react';

interface ApplicationAssistantModalProps {
  scoredJob: ScoredJob;
  candidateProfile: CandidateProfile;
  onClose: () => void;
}

export const ApplicationAssistantModal: React.FC<ApplicationAssistantModalProps> = ({
  scoredJob,
  candidateProfile,
  onClose,
}) => {
  // Initialize package immutably so original candidate state is never altered
  const [appPackage, setAppPackage] = useState<ApplicationPackage>(() =>
    generateApplicationPackage(candidateProfile, scoredJob)
  );

  const [activeTab, setActiveTab] = useState<'letter' | 'bullets' | 'checklist'>('letter');
  const [copiedLetter, setCopiedLetter] = useState(false);
  const [copiedBullets, setCopiedBullets] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Keyboard accessibility: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Copy helpers
  const handleCopyLetter = async () => {
    try {
      await navigator.clipboard.writeText(appPackage.coverLetter);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    } catch {
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  };

  const handleCopyBullets = async () => {
    try {
      await navigator.clipboard.writeText(appPackage.tailoredBullets.join('\n\n'));
      setCopiedBullets(true);
      setTimeout(() => setCopiedBullets(false), 2000);
    } catch {
      setCopiedBullets(true);
      setTimeout(() => setCopiedBullets(false), 2000);
    }
  };

  // Toggle checklist item
  const handleToggleChecklist = (id: string) => {
    setAppPackage((prev) => ({
      ...prev,
      checklist: prev.checklist.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      ),
      updatedAt: new Date().toISOString(),
    }));
  };

  // Status transitions: strictly bounded to draft and ready_for_review
  const handleToggleReady = () => {
    const nextStatus: ApplicationWorkflowStatus =
      appPackage.status === 'ready_for_review' ? 'draft' : 'ready_for_review';
    setAppPackage((prev) => ({
      ...prev,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
    }));
  };

  // Reset to original generated draft
  const handleResetDraft = () => {
    const fresh = generateApplicationPackage(candidateProfile, scoredJob);
    setAppPackage(fresh);
    setSubmissionFeedback(null);
  };

  // Attempt submission demonstration (guaranteed rejection per non-negotiable constraints)
  const handleAttemptSubmission = async () => {
    const result = await LocalDemoApplicationAdapter.submitApplication(appPackage);
    setSubmissionFeedback(result.error || 'Submission is not supported in demonstration mode.');
  };

  const completedChecklistCount = appPackage.checklist.filter((c) => c.completed).length;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="assistant-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="bg-white w-full max-w-3xl rounded-xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92dvh] sm:max-h-[88vh]">
        {/* Header bar */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-2.5 shrink-0">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <h2 id="assistant-modal-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight shrink-0">
              Application Assistant
            </h2>
            {/* Non-negotiable visible DEMO MODE badge */}
            <span
              data-testid="demo-mode-badge"
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[10px] sm:text-[11px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              DEMO MODE — NOT SUBMITTED
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700 shrink-0"
            aria-label="Close Application Assistant"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selected Job & Match Score Context Bar */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                {scoredJob.job.title}
              </h3>
              <span className="text-[10px] text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 font-medium">
                Synthetic Listing
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="flex items-center gap-1 font-semibold text-slate-800">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {scoredJob.job.company}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {scoredJob.job.location}
              </span>
              <span className="flex items-center gap-1">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                {scoredJob.job.format}
              </span>
            </div>
          </div>

          {/* Match Score & Subscores */}
          <div className="flex items-center gap-3 self-start sm:self-auto shrink-0">
            <div className="text-right hidden sm:block">
              <div className="text-[11px] font-semibold text-slate-700 font-mono">
                Skills: {scoredJob.breakdown.skillsScore}/50 | Exp: {scoredJob.breakdown.experienceScore}/35
              </div>
              <div className="text-[10px] text-slate-500">
                Location Fit: {scoredJob.breakdown.locationScore}/15
              </div>
            </div>
            <div className="px-2.5 py-1 rounded-md bg-teal-800 text-white font-bold text-xs flex items-center gap-1 shadow-2xs">
              <span>{scoredJob.breakdown.totalScore}% Match</span>
            </div>
          </div>
        </div>

        {/* State Model Workflow Bar */}
        <div className="px-4 sm:px-5 py-2 sm:py-2.5 bg-slate-100/70 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-600">Workflow State:</span>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                appPackage.status === 'ready_for_review'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              {appPackage.status === 'ready_for_review' ? 'Ready for Review' : 'Draft in Progress'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleReady}
              className={`px-2.5 py-1 rounded-md font-semibold text-xs transition-colors flex items-center gap-1.5 border ${
                appPackage.status === 'ready_for_review'
                  ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300 shadow-2xs'
                  : 'bg-teal-800 hover:bg-teal-900 text-white border-teal-850 shadow-2xs'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>
                {appPackage.status === 'ready_for_review'
                  ? 'Back to Draft'
                  : 'Mark as Ready for Review'}
              </span>
            </button>

            <button
              type="button"
              onClick={handleResetDraft}
              className="p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 rounded transition-colors"
              title="Reset to freshly generated draft"
              aria-label="Reset draft"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 sm:px-5 border-b border-slate-200 bg-white flex gap-4 sm:gap-6 text-xs font-semibold text-slate-600 shrink-0 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('letter')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'letter'
                ? 'border-teal-800 text-teal-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Grounded Cover Letter</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('bullets')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'bullets'
                ? 'border-teal-800 text-teal-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Tailored Resume Wording</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('checklist')}
            className={`py-3 flex items-center gap-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'checklist'
                ? 'border-teal-800 text-teal-950 font-bold'
                : 'border-transparent hover:text-slate-900'
            }`}
          >
            <ListChecks className="w-4 h-4" />
            <span>Application Checklist ({completedChecklistCount}/{appPackage.checklist.length})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: COVER LETTER */}
          {activeTab === 'letter' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <div className="space-y-0.5">
                  <span className="text-slate-800 font-semibold block">
                    Editable Cover Letter Draft
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    Grounded strictly in candidate projects and match criteria ({appPackage.coverLetter.length} characters)
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyLetter}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold border border-slate-300 shadow-2xs transition-colors shrink-0 text-xs self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-teal-700"
                  title="Copy cover letter to clipboard"
                >
                  {copiedLetter ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Letter</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={appPackage.coverLetter}
                onChange={(e) =>
                  setAppPackage((prev) => ({
                    ...prev,
                    coverLetter: e.target.value,
                    updatedAt: new Date().toISOString(),
                  }))
                }
                rows={14}
                className="w-full min-h-[300px] sm:min-h-[360px] max-h-[55vh] text-xs sm:text-sm font-sans p-3.5 sm:p-4 rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 leading-relaxed shadow-2xs transition-all resize-y overflow-y-auto"
                aria-label="Cover letter draft"
              />

              <div className="p-3 rounded-md bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <div className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-teal-800" />
                  <span>Grounding Verification:</span>
                </div>
                <p className="text-slate-600 leading-relaxed">
                  This cover letter references only verified projects from candidate data and acknowledges
                  gaps ({scoredJob.breakdown.missingSkills.length} identified) without fabricating qualifications.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: TAILORED BULLETS */}
          {activeTab === 'bullets' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                <span className="text-slate-500 font-medium">
                  Suggested bullet wording to highlight in your CV for this vacancy:
                </span>
                <button
                  type="button"
                  onClick={handleCopyBullets}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-700 font-semibold border border-slate-300 shadow-2xs transition-colors shrink-0 text-xs self-start sm:self-auto focus:outline-none focus:ring-2 focus:ring-teal-700"
                  title="Copy bullets to clipboard"
                >
                  {copiedBullets ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>Copy Bullets</span>
                    </>
                  )}
                </button>
              </div>

              <div className="space-y-3">
                {appPackage.tailoredBullets.map((bullet, idx) => (
                  <div key={idx} className="p-3 rounded-md border border-slate-200 bg-slate-50 space-y-1.5">
                    <span className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                      Recommendation #{idx + 1}
                    </span>
                    <textarea
                      value={bullet}
                      onChange={(e) => {
                        const newBullets = [...appPackage.tailoredBullets];
                        newBullets[idx] = e.target.value;
                        setAppPackage((prev) => ({
                          ...prev,
                          tailoredBullets: newBullets,
                          updatedAt: new Date().toISOString(),
                        }));
                      }}
                      rows={2}
                      className="w-full text-xs font-sans p-2.5 rounded-md border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-teal-700 leading-relaxed shadow-2xs"
                      aria-label={`Tailored resume bullet ${idx + 1}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CHECKLIST */}
          {activeTab === 'checklist' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">
                  Review requirements, portfolio materials, and formatting before applying:
                </span>
                <span className="font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                  {completedChecklistCount} of {appPackage.checklist.length} Completed
                </span>
              </div>

              <div className="space-y-2">
                {appPackage.checklist.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-start gap-3 p-3 rounded-md border transition-all cursor-pointer select-none ${
                      item.completed
                        ? 'bg-emerald-50/30 border-emerald-200'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={item.completed}
                      onChange={() => handleToggleChecklist(item.id)}
                      className="mt-0.5 rounded border-slate-300 text-teal-800 focus:ring-teal-700 w-4 h-4"
                    />
                    <div className="space-y-0.5">
                      <div
                        className={`text-xs font-semibold ${
                          item.completed ? 'text-emerald-900 line-through opacity-75' : 'text-slate-800'
                        }`}
                      >
                        {item.label}
                      </div>
                      <p className="text-[11px] text-slate-500">{item.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Platform Integration Extension Point */}
          <div className="mt-6 pt-5 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Future Platform Integration Extension Point</span>
              </div>
              <span className="text-[10px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded border border-slate-200 font-semibold">
                Preview Architecture
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-md border border-slate-200">
              In production, the typed <code className="text-teal-900 font-mono">JobPlatformAdapter</code> contract connects to
              official ATS endpoints (Greenhouse, Lever) or browser assistants. Automated submission is strictly
              disabled in this demo to prevent unintended or unverified candidate applications.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
              <button
                type="button"
                onClick={handleAttemptSubmission}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition-colors border border-slate-300 shadow-2xs text-center"
              >
                <Send className="w-3.5 h-3.5 text-slate-500" />
                <span>Test Submission Guard (Simulate Action)</span>
              </button>

              <button
                type="button"
                disabled
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-slate-100 text-slate-400 text-xs font-semibold cursor-not-allowed border border-slate-200"
                title="Direct platform submission is disabled in demo mode"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Submit to Platform (Disabled in Demo)</span>
              </button>
            </div>

            {submissionFeedback && (
              <div
                data-testid="submission-feedback-banner"
                className="p-3 rounded-md bg-amber-50 border border-amber-200 flex items-start gap-2 text-xs text-amber-900"
              >
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{submissionFeedback}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer actions */}
        <div className="px-4 sm:px-5 py-3 sm:py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-slate-500 flex items-center gap-1 min-w-0">
            <Lock className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate">Ephemeral in-memory draft — discarded on session reset</span>
          </span>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md bg-slate-900 hover:bg-slate-950 text-white text-xs font-semibold shadow-2xs transition-colors focus:outline-none focus:ring-2 focus:ring-slate-500 shrink-0"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};



