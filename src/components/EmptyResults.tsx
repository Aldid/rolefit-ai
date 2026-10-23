'use client';

import React from 'react';
import { SearchX, RotateCcw, MapPin, Sparkles } from 'lucide-react';

interface EmptyResultsProps {
  currentLocation?: string;
  currentFormat?: string;
  onResetFilters: () => void;
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({
  currentLocation,
  currentFormat,
  onResetFilters,
}) => {
  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm p-8 sm:p-12 text-center space-y-6">
      <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shadow-sm">
        <SearchX className="w-8 h-8" />
      </div>

      <div className="max-w-md mx-auto space-y-2">
        <h3 className="text-lg font-bold text-slate-900">
          No Vacancies Match Your Strict Filter
        </h3>
        <p className="text-sm text-slate-600 leading-relaxed">
          No vacancies match your strict location filter
          {currentLocation ? (
            <>
              {' '}
              (<strong className="text-slate-800">{currentLocation}</strong>)
            </>
          ) : null}
          {currentFormat && currentFormat !== 'Any' ? (
            <>
              {' '}
              with <strong className="text-slate-800">{currentFormat}</strong> format
            </>
          ) : null}
          . Try expanding your location or switching to Remote.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onResetFilters}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 active:scale-[0.99] text-white text-sm font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        >
          <Sparkles className="w-4 h-4 fill-white" />
          <span>Show all 5 jobs</span>
        </button>
      </div>

      <div className="pt-4 border-t border-slate-100 max-w-sm mx-auto flex items-center justify-center gap-2 text-xs text-slate-400">
        <MapPin className="w-3.5 h-3.5 text-slate-400" />
        <span>Resets location restrictions and reveals all scored demo vacancies</span>
      </div>
    </div>
  );
};
