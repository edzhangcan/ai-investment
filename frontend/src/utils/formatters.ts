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

/**
 * Formats action status and batting-zone tag strings for UI badges.
 *
 * Invariant (PL-728): English output MUST NOT contain dashes (`-`) or underscores (`_`);
 * all separator characters are normalized to spaces and trimmed.
 *
 * Chinese (`lang === 'zh'`) mappings:
 * - `IN_BUY_ZONE` -> `买入区间`
 * - `LEFT_SIDE_WATCH` / `LEFT_SIDE` -> `左侧观察`
 * - `PULLBACK_WATCH` -> `回调观察`
 * - `GROWTH_PREMIUM` -> `成长溢价`
 * - `OVEREXTENDED` -> `估值偏高`
 * - `RIGHT_SIDE` -> `右侧击球区`
 * - `TREND_CONTINUATION` -> `趋势延续`
 * - `SUPPORT_BOUNCE` -> `均线支撑反弹`
 * - `BOTTOM_REVERSAL` -> `底部反转突破`
 */
export const formatStatusTag = (status?: string, lang: string = 'en'): string => {
  if (!status) return '';
  if (lang === 'zh') {
    if (status === 'IN_BUY_ZONE') return '买入区间';
    if (status === 'LEFT_SIDE_WATCH') return '左侧观察';
    if (status === 'PULLBACK_WATCH') return '回调观察';
    if (status === 'GROWTH_PREMIUM') return '成长溢价';
    if (status === 'OVEREXTENDED') return '估值偏高';
    if (status === 'RIGHT_SIDE') return '右侧击球区';
    if (status === 'LEFT_SIDE') return '左侧观察';
    if (status === 'TREND_CONTINUATION') return '趋势延续';
    if (status === 'SUPPORT_BOUNCE') return '均线支撑反弹';
    if (status === 'BOTTOM_REVERSAL') return '底部反转突破';
  }
  // English: strictly remove all dashes and underscores
  return status.replace(/[-_]/g, ' ').trim();
};
