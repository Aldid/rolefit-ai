'use client';

import React from 'react';
import { Sparkles, RotateCcw, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onReset: () => void;
  hasActiveSession: boolean;
}

export const Header: React.FC<HeaderProps> = ({ onReset, hasActiveSession }) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-slate-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-sm shadow-teal-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-900 tracking-tight">RoleFit AI</span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                PoC Demo
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Explainable 50/35/15 Career Matching & Gap Analysis
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Ephemeral RAM Only</span>
          </div>

          <button
            onClick={onReset}
            disabled={!hasActiveSession}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              hasActiveSession
                ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                : 'bg-slate-50 text-slate-400 border border-slate-200 cursor-not-allowed'
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
