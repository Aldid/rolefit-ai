'use client';

import React from 'react';
import { RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasActiveSession: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasActiveSession }) => {
  return (
    <header className="sticky top-0 z-30 bg-[#fcfbf9]/95 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-base text-slate-900 tracking-tight">RoleFit AI</span>
            <span className="text-[11px] font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
              PoC Demo
            </span>
          </div>
          <span className="hidden sm:inline text-slate-300 text-xs">•</span>
          <p className="text-xs text-slate-500 hidden sm:block">
            Explainable 50/35/15 Career Matching & Gap Analysis
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-white px-2.5 py-1 rounded-md border border-slate-200/80 shadow-2xs">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-medium">Ephemeral RAM Only</span>
          </div>

          <button
            onClick={onReset}
            disabled={!hasActiveSession}
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-all ${
              hasActiveSession
                ? 'bg-white text-slate-700 hover:text-slate-900 border border-slate-300 shadow-2xs hover:bg-slate-50 active:bg-slate-100'
                : 'bg-transparent text-slate-400 border border-transparent cursor-not-allowed opacity-50'
            }`}
            title="Reset active session and erase all in-memory data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>New Session</span>
          </button>
        </div>
      </div>
    </header>
  );
};


