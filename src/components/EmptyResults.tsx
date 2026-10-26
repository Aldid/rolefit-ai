'use client';

import React from 'react';
import { SearchX, RotateCcw, MapPin } from 'lucide-react';

export interface EmptyResultsFilterInfo {
  searchQuery?: string;
  selectedFormat?: string;
  isStrictLocation?: boolean;
  candidateLocation?: string;
}

/**
 * Deterministically formats the empty state title and explanation based on active filters,
 * ensuring no false claims that a strict location filter was responsible when triggered
 * by manual search queries or format filters.
 */
export function formatEmptyResultsReason(info?: EmptyResultsFilterInfo): {
  title: string;
  description: string;
} {
  if (!info) {
    return {
      title: 'No Vacancies Match Your Filter Criteria',
      description: 'No vacancies match your active filters. Try expanding your search or selecting different options.',
    };
  }

  const hasSearch = Boolean(info.searchQuery && info.searchQuery.trim());
  const hasFormat = Boolean(info.selectedFormat && info.selectedFormat !== 'All');
  const hasStrictLoc = Boolean(info.isStrictLocation && info.candidateLocation && info.candidateLocation.trim());

  // 1. Only text search query
  if (hasSearch && !hasFormat && !hasStrictLoc) {
    return {
      title: 'No Vacancies Match Your Search Query',
      description: `No vacancies match your search query "${info.searchQuery?.trim()}". Try clearing the search box or checking for typos.`,
    };
  }

  // 2. Only work format filter
  if (hasFormat && !hasSearch && !hasStrictLoc) {
    return {
      title: 'No Vacancies Match Your Work Format Filter',
      description: `No vacancies match the selected "${info.selectedFormat}" work format. Try switching to "All" or "Remote".`,
    };
  }

  // 3. Only strict location filter
  if (hasStrictLoc && !hasSearch && !hasFormat) {
    return {
      title: 'No Vacancies Match Your Strict Location Filter',
      description: `No vacancies match your strict location preference ("${info.candidateLocation}"). Note: Remote roles are preserved by this filter, but none matched this criteria.`,
    };
  }

  // 4. Combined: search query + strict location
  if (hasSearch && hasStrictLoc && !hasFormat) {
    return {
      title: 'No Vacancies Match Your Search and Location Filters',
      description: `No vacancies match your search query "${info.searchQuery?.trim()}". Note: Strict location for "${info.candidateLocation}" preserved Remote vacancies, but they do not match your text search.`,
    };
  }

  // 5. Combined: strict location + format filter
  if (hasStrictLoc && hasFormat && !hasSearch) {
    return {
      title: 'No Vacancies Match Your Location & Format Combination',
      description: `No vacancies match your strict location ("${info.candidateLocation}") combined with the "${info.selectedFormat}" format filter. (Remote vacancies are preserved by your location filter, but excluded by the "${info.selectedFormat}" format filter).`,
    };
  }

  // 6. Combined: search query + format filter
  if (hasSearch && hasFormat && !hasStrictLoc) {
    return {
      title: 'No Vacancies Match Your Filter Criteria',
      description: `No vacancies match search query "${info.searchQuery?.trim()}" with the "${info.selectedFormat}" work format filter.`,
    };
  }

  // 7. Combined: all three active
  if (hasSearch && hasFormat && hasStrictLoc) {
    return {
      title: 'No Vacancies Match Your Combined Filters',
      description: `No vacancies match search query "${info.searchQuery?.trim()}", format "${info.selectedFormat}", and strict location "${info.candidateLocation}".`,
    };
  }

  return {
    title: 'No Vacancies Match Your Filter Criteria',
    description: 'No vacancies match your current filter settings. Try expanding your search or resetting all filters.',
  };
}

interface EmptyResultsProps {
  filterInfo?: EmptyResultsFilterInfo;
  onResetFilters: () => void;
}

export const EmptyResults: React.FC<EmptyResultsProps> = ({
  filterInfo,
  onResetFilters,
}) => {
  const { title, description } = formatEmptyResultsReason(filterInfo);

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200/90 shadow-2xs p-8 sm:p-10 text-center space-y-4">
      <div className="w-10 h-10 mx-auto rounded-md bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500">
        <SearchX className="w-5 h-5" />
      </div>

      <div className="max-w-md mx-auto space-y-1">
        <h3 className="text-base font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="pt-1">
        <button
          type="button"
          onClick={onResetFilters}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md bg-teal-800 hover:bg-teal-900 active:bg-teal-950 text-white text-xs font-semibold shadow-2xs transition-all focus:outline-none focus:ring-2 focus:ring-teal-700"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Show all 5 jobs</span>
        </button>
      </div>

      <div className="pt-2 border-t border-slate-100 max-w-sm mx-auto flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
        <MapPin className="w-3.5 h-3.5 text-slate-400" />
        <span>Clears active search filters and restores all 5 scored vacancies</span>
      </div>
    </div>
  );
};


