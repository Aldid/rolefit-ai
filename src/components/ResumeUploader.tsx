'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, UserCheck, AlertCircle, CheckCircle2, Loader2, ArrowUpRight } from 'lucide-react';

interface ResumeUploaderProps {
  onLoadSample: () => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  activeFileName?: string;
  cvSource?: 'sample' | 'upload' | null;
  errorMessage?: string | null;
  onClearError: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onLoadSample,
  onFileUpload,
  isLoading,
  activeFileName,
  cvSource,
  errorMessage,
  onClearError,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelection = (file: File) => {
    onClearError();
    onFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelection(e.dataTransfer.files[0]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  // Explicitly distinguish between built-in sample candidate and real user upload.
  // A user-uploaded file is NEVER labeled as synthetic profile, even if its name contains "synthetic".
  const isSyntheticProfile =
    cvSource === 'sample' ||
    (!cvSource && (activeFileName || '').toLowerCase().includes('(synthetic profile)'));

  const getDocTypeInfo = () => {
    if (isSyntheticProfile) {
      return {
        label: 'Built-in Demo Profile',
        badgeClass: 'bg-amber-50 text-amber-800 border-amber-200/90',
        statusLabel: 'Pre-loaded Demo CV',
        privacyDetail: 'Synthetic profile • Ephemeral RAM only',
      };
    }
    const lower = (activeFileName || '').toLowerCase();
    const typeLabel = lower.endsWith('.docx') ? 'Uploaded DOCX' : 'Uploaded PDF';
    return {
      label: typeLabel,
      badgeClass: 'bg-slate-100 text-slate-700 border-slate-200',
      statusLabel: 'Parsed in RAM',
      privacyDetail: 'Ephemeral RAM only • Zero disk/database storage',
    };
  };

  const docInfo = getDocTypeInfo();
  const isLoaded = Boolean(activeFileName && !isLoading && !errorMessage);

  return (
    <div className="w-full space-y-3">
      {/* Hidden file input: Always mounted in DOM for native dialog and test locators */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            e.target.value = '';
            handleFileSelection(file);
          }
        }}
      />

      {/* STATE 1: COMPACT LOADED SUMMARY ROW (Takes ~56px instead of ~350px) */}
      {isLoaded && activeFileName ? (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 sm:p-3.5 rounded-lg bg-white border border-slate-200/90 shadow-2xs">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-md bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-600 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-slate-900 truncate max-w-[200px] sm:max-w-[340px]">
                  {activeFileName}
                </span>
                <span
                  data-testid="doc-type-badge"
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border shrink-0 ${docInfo.badgeClass}`}
                >
                  {docInfo.label}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                <span className="inline-flex items-center gap-1 text-emerald-800 font-medium">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  {docInfo.statusLabel}
                </span>
                <span className="text-slate-300">•</span>
                <span>{docInfo.privacyDetail}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700"
              title="Upload another PDF or DOCX file to replace current resume"
            >
              <UploadCloud className="w-3.5 h-3.5 text-slate-600" />
              <span>Replace CV</span>
            </button>

            {!isSyntheticProfile && (
              <button
                type="button"
                onClick={onLoadSample}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                title="Switch to synthetic demo candidate profile"
              >
                <span>Use Sample CV</span>
                <ArrowUpRight className="w-3 h-3 text-slate-400" />
              </button>
            )}
          </div>
        </div>
      ) : (
        /* STATE 2: INITIAL FULL HERO & INTAKE (Shown when no CV is loaded, or when retrying) */
        <div className="space-y-6 pt-2">
          {/* Editorial Headline & Concise Intro */}
          <div className="max-w-2xl">
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight leading-tight">
              Evaluate your resume against verified engineering roles.
            </h1>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Deterministic 50/35/15 scoring, actionable gap analysis, and grounded CV advice without AI hallucination.
            </p>
          </div>

          {/* Primary Action: Direct, Open Dropzone */}
          <div
            role="button"
            tabIndex={0}
            aria-label="Upload resume file (PDF or DOCX up to 5 MB)"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={handleKeyDown}
            className={`flex flex-col items-center justify-center p-8 sm:p-10 rounded-xl border-2 border-dashed cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-teal-700 focus:ring-offset-2 ${
              isDragging
                ? 'border-teal-700 bg-teal-50/50'
                : 'border-slate-300 hover:border-slate-400 bg-white/70 hover:bg-white shadow-2xs'
            }`}
          >
            <div className="p-2.5 rounded-lg bg-slate-100 text-slate-600 border border-slate-200 mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>

            <p className="text-sm font-semibold text-slate-900 text-center">
              Drop your resume here, or <span className="text-teal-800 underline underline-offset-2">browse files</span>
            </p>
            <p className="text-xs text-slate-500 mt-1">
              PDF or DOCX up to 5 MB • Evaluated strictly in-memory (RAM)
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Never written to disk, database, or external logging systems
            </p>
          </div>

          {/* Secondary Action: Integrated Sample Profile Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-4 rounded-lg bg-slate-100/70 border border-slate-200/80">
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-teal-900 bg-teal-50 px-2 py-0.5 rounded border border-teal-200">
                Instant Demo Mode
              </span>
              <span className="text-xs text-slate-600 font-medium">
                Test immediately with Alex Rivera's pre-loaded profile (Python, TypeScript, React).
              </span>
            </div>

            <button
              onClick={onLoadSample}
              disabled={isLoading}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-md bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 shadow-2xs text-xs font-semibold shrink-0 transition-colors focus:outline-none focus:ring-2 focus:ring-teal-700"
            >
              <UserCheck className="w-3.5 h-3.5 text-slate-600" />
              <span>Load Sample CV</span>
            </button>
          </div>
        </div>
      )}

      {/* STATE 3: LOADING / PROCESSING INDICATOR */}
      {isLoading && (
        <div className="p-3.5 rounded-lg bg-teal-50/70 border border-teal-200 flex items-center gap-2.5">
          <Loader2 className="w-4 h-4 text-teal-800 animate-spin shrink-0" />
          <span className="text-xs font-medium text-teal-950">
            Parsing document in RAM and extracting verified skills...
          </span>
        </div>
      )}

      {/* STATE 4: PARSING OR VALIDATION ERROR */}
      {errorMessage && (
        <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 flex items-start justify-between gap-3 text-amber-900">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-semibold">Upload notice: </span>
              {errorMessage}
            </div>
          </div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-xs font-semibold text-teal-800 hover:text-teal-950 underline underline-offset-2 shrink-0"
          >
            Try another file
          </button>
        </div>
      )}
    </div>
  );
};



