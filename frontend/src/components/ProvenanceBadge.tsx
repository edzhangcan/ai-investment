import React from 'react';
import { DataProvenance } from '../types';
import { CheckCircle2, Clock, AlertTriangle, ShieldAlert } from 'lucide-react';

interface ProvenanceBadgeProps {
  provenance?: DataProvenance | null;
  compact?: boolean;
  className?: string;
}

export const ProvenanceBadge: React.FC<ProvenanceBadgeProps> = ({
  provenance,
  compact = false,
  className = ''
}) => {
  if (!provenance || !provenance.source_mode) {
    return null;
  }

  const mode = provenance.source_mode.toUpperCase();
  const provider = provenance.provider || 'Live Feed';
  const warning = provenance.warning_banner;

  if (mode === 'LIVE') {
    return (
      <span
        title={`Live feed verified via ${provider}${provenance.fetched_at ? ` as of ${provenance.fetched_at}` : ''}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800 ${className}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>{compact ? 'LIVE' : `LIVE • ${provider}`}</span>
      </span>
    );
  }

  if (mode === 'CACHED') {
    const staleness = provenance.staleness_seconds
      ? `${Math.round(provenance.staleness_seconds / 60)}m ago`
      : '';
    return (
      <span
        title={`Cached data from ${provider}${staleness ? ` (${staleness})` : ''}`}
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 ${className}`}
      >
        <Clock className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{compact ? 'CACHED' : `CACHED • ${provider}${staleness ? ` (${staleness})` : ''}`}</span>
      </span>
    );
  }

  // SIMULATED_FALLBACK or other synthetic modes
  return (
    <span
      title={warning || 'Simulated synthetic fallback data. Ground-truth filing verification recommended.'}
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800 cursor-help ${className}`}
    >
      <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
      <span>{compact ? 'FALLBACK' : 'SIMULATED FALLBACK'}</span>
    </span>
  );
};
