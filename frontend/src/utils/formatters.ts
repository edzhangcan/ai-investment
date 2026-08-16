/**
 * Prism Loop Shared Formatter Utilities
 * Centralized, pure, and accessible formatting functions for currency, percentages,
 * numbers, sentiment objects, and dates.
 */

import { SentimentData } from '../types';

/**
 * Formats numeric currency values with proper symbol and precision.
 */
export const formatCurrency = (
  value: number | null | undefined,
  currency: string = 'USD',
  decimals: number = 2
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return `— ${currency}`;
  }
  const symbol = currency === 'CAD' ? 'C$' : '$';
  return `${symbol}${value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })}`;
};

/**
 * Formats a percentage value with sign and precision.
 */
export const formatPercent = (
  value: number | null | undefined,
  includeSign: boolean = true,
  decimals: number = 1
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—%';
  }
  const sign = includeSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(decimals)}%`;
};

/**
 * Formats large monetary or volume values into compact representation (e.g., $1.2B, $450M).
 */
export const formatCompactNumber = (
  value: number | null | undefined,
  prefix: string = '$'
): string => {
  if (value === null || value === undefined || isNaN(value)) {
    return '—';
  }
  const absVal = Math.abs(value);
  if (absVal >= 1_000_000_000_000) {
    return `${prefix}${(value / 1_000_000_000_000).toFixed(2)}T`;
  }
  if (absVal >= 1_000_000_000) {
    return `${prefix}${(value / 1_000_000_000).toFixed(2)}B`;
  }
  if (absVal >= 1_000_000) {
    return `${prefix}${(value / 1_000_000).toFixed(2)}M`;
  }
  if (absVal >= 1_000) {
    return `${prefix}${(value / 1_000).toFixed(1)}K`;
  }
  return `${prefix}${value.toFixed(2)}`;
};

/**
 * Safely extracts human-readable tone from sentiment string or SentimentData object.
 * Prevents React object-as-child runtime crashes.
 */
export const getSentimentTone = (
  sentiment: SentimentData | string | null | undefined,
  fallback: string = 'Neutral'
): string => {
  if (!sentiment) return fallback;
  if (typeof sentiment === 'string') return sentiment;
  if (typeof sentiment === 'object') {
    return (
      sentiment.tone ||
      (typeof sentiment.score === 'number' ? `Score ${sentiment.score}` : fallback)
    );
  }
  return String(sentiment);
};

/**
 * Formats ISO date strings to human readable YYYY-MM-DD format.
 */
export const formatDate = (dateInput?: string | Date | null): string => {
  if (!dateInput) return new Date().toISOString().split('T')[0];
  if (dateInput instanceof Date) {
    return dateInput.toISOString().split('T')[0];
  }
  return dateInput.split('T')[0];
};
