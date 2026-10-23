'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileText, Zap, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ResumeUploaderProps {
  onLoadSample: () => void;
  onFileUpload: (file: File) => void;
  isLoading: boolean;
  activeFileName?: string;
  errorMessage?: string | null;
  onClearError: () => void;
}

export const ResumeUploader: React.FC<ResumeUploaderProps> = ({
  onLoadSample,
  onFileUpload,
  isLoading,
  activeFileName,
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

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
      <div className="text-center max-w-xl mx-auto mb-6">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Find Your Exact Fit with Transparent Match Scoring
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Upload your CV or test with our synthetic candidate profile to see a deterministic 50/35/15
          breakdown, actionable gaps, and grounded adaptation tips against 5 curated vacancies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 1: 1-Click Sample CV */}
        <div className="flex flex-col justify-between p-5 rounded-xl bg-gradient-to-br from-teal-50/70 to-emerald-50/50 border border-teal-200/80">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-lg bg-teal-600 text-white">
                <Zap className="w-4 h-4" />
              </span>
              <h2 className="font-semibold text-slate-900 text-sm">Instant Demo Mode</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed mb-4">
              Pre-load a synthetic early-career developer profile with Python, TypeScript, React, and
              real-world projects (CRM Assistant, Supply Chain Sim). No file required.
            </p>
          </div>

          <button
            onClick={onLoadSample}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-sm font-medium shadow-sm transition-all disabled:opacity-50"
          >
            <Zap className="w-4 h-4 fill-white" />
            <span>⚡ Load Sample CV (1-Click)</span>
          </button>
        </div>

        {/* Option 2: Upload custom CV */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`flex flex-col items-center justify-center p-5 rounded-xl border-2 border-dashed cursor-pointer transition-all ${
            isDragging
              ? 'border-teal-500 bg-teal-50/40'
              : 'border-slate-300 hover:border-teal-400 bg-slate-50/50 hover:bg-white'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            className="hidden"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileSelection(e.target.files[0]);
              }
            }}
          />

          <div className="p-2.5 rounded-full bg-white shadow-sm border border-slate-200 mb-2">
            <UploadCloud className="w-5 h-5 text-teal-600" />
          </div>

          <p className="text-sm font-medium text-slate-800 text-center">
            Drop your resume here or <span className="text-teal-600 underline">browse</span>
          </p>
          <p className="text-xs text-slate-500 mt-1">Supports PDF or DOCX (max 5 MB)</p>
        </div>
      </div>

      {/* Active File / Loading Indicator */}
      {isLoading && (
        <div className="mt-4 p-3 rounded-lg bg-teal-50 border border-teal-200 flex items-center gap-3">
          <div className="w-4 h-4 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-medium text-teal-800">
            Parsing document in RAM and extracting skills...
          </span>
        </div>
      )}

      {activeFileName && !isLoading && !errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-700" />
            <span className="text-xs font-medium text-slate-800">{activeFileName}</span>
          </div>
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            <CheckCircle2 className="w-3 h-3" />
            Loaded in Memory
          </span>
        </div>
      )}

      {/* Error message */}
      {errorMessage && (
        <div className="mt-4 p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2.5 text-amber-900">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <span className="font-semibold">Upload notice: </span>
            {errorMessage}
          </div>
        </div>
      )}
    </div>
  );
};
