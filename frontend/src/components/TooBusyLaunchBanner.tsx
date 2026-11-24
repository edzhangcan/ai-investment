import React, { useState, useEffect, useCallback } from 'react';
import {
  Clock,
  TrendingUp,
  ShieldCheck,
  Scissors,
  PauseCircle,
  ArrowRight,
  X,
  Flame,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { BilingualHoverCard } from './BilingualHoverCard';
import { fetchTooBusyDailyAdviceApi } from '../api/client';
import { TooBusyDailyAdviceResponse } from '../types';
import { getStoredTooBusyState } from './TooBusyView';

interface TooBusyLaunchBannerProps {
  onOpenTooBusyTab: () => void;
  isTooBusyTabActive: boolean;
}

const DISMISS_SESSION_KEY = 'too_busy_launch_banner_dismissed_v1';

const SIGNAL_STYLES: Record<string, { border: string; badgeBg: string; Icon: React.ElementType }> = {
  STRONG_BUY_RISK_ON: { border: 'border-l-emerald-600', badgeBg: 'bg-emerald-600 text-white', Icon: TrendingUp },
  ACCUMULATE_DIP_OR_PIVOT: { border: 'border-l-emerald-600', badgeBg: 'bg-emerald-600 text-white', Icon: TrendingUp },
  TRIM_TAKE_PROFIT: { border: 'border-l-amber-500', badgeBg: 'bg-amber-600 text-white', Icon: Scissors },
  ROTATE_TO_BEAR_SHORT: { border: 'border-l-rose-600', badgeBg: 'bg-rose-600 text-white', Icon: Flame },
  ROTATE_TO_CASH_SHIELD: { border: 'border-l-sky-600', badgeBg: 'bg-sky-600 text-white', Icon: ShieldCheck },
  HOLD_NO_ACTION: { border: 'border-l-violet-600', badgeBg: 'bg-violet-600 text-white', Icon: PauseCircle },
};

/**
 * Surfaces daily 15:50 EST strategy advice & live freshness directly at app launch,
 * with a one-click live refresh action before opening Tab 5.
 */
export const TooBusyLaunchBanner: React.FC<TooBusyLaunchBannerProps> = ({
  onOpenTooBusyTab,
  isTooBusyTabActive,
}) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';
  const [advice, setAdvice] = useState<TooBusyDailyAdviceResponse | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [dismissed, setDismissed] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.sessionStorage.getItem(DISMISS_SESSION_KEY) === 'true';
  });

  const loadDailyAdvice = useCallback(
    async (forceRefresh = false, signal?: AbortSignal) => {
      if (forceRefresh) setRefreshing(true);
      try {
        const stored = getStoredTooBusyState();
        const res = await fetchTooBusyDailyAdviceApi(
          { ...stored, lang: language, use_live: true, force_refresh: forceRefresh },
          signal
        );
        setAdvice(res);
      } catch (err: unknown) {
        if ((err as { name?: string })?.name !== 'AbortError') {
          console.debug('TooBusyLaunchBanner fetch skipped:', err);
        }
      } finally {
        setRefreshing(false);
      }
    },
    [language]
  );

  useEffect(() => {
    const controller = new AbortController();
    loadDailyAdvice(false, controller.signal);
    return () => controller.abort();
  }, [loadDailyAdvice]);

  if (dismissed || isTooBusyTabActive || !advice) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      window.sessionStorage.setItem(DISMISS_SESSION_KEY, 'true');
    } catch {
      // Ignore storage unavailable errors
    }
  };

  const { border, badgeBg, Icon } = SIGNAL_STYLES[advice.action_signal] || SIGNAL_STYLES.HOLD_NO_ACTION;
  const verdict = advice.beginner_decision_guide?.action_verdict;

  return (
    <div className={`mb-5 bg-surface border border-border-subtle border-l-4 ${border} rounded-2xl p-4 shadow-sm transition-all`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <BilingualHoverCard termKey="TooBusyStrategy">
              <span className={`px-2.5 py-0.5 rounded-lg text-[11px] font-black flex items-center gap-1.5 ${badgeBg}`}>
                <Icon className="w-3.5 h-3.5" />
                <span>{isZh ? advice.signal_label_zh : advice.signal_label_en}</span>
              </span>
            </BilingualHoverCard>
            <BilingualHoverCard termKey="EOD_1550_Window">
              <span className="px-2 py-0.5 rounded-lg bg-surface-subtle border border-border-subtle text-[10px] font-bold text-content-secondary flex items-center gap-1">
                <Clock className="w-3 h-3 text-violet-600" />
                <span>{isZh ? advice.execution_clock.label_zh : advice.execution_clock.label_en}</span>
              </span>
            </BilingualHoverCard>
            {advice.data_freshness && (
              <span className="px-2 py-0.5 rounded-lg bg-surface-subtle border border-border-subtle text-[10px] font-mono text-content-muted flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${advice.data_freshness.is_live_intraday ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>
                  {advice.data_freshness.is_live_intraday ? 'LIVE' : 'SIM'} • {advice.data_freshness.last_updated_est}
                </span>
              </span>
            )}
          </div>

          <p className="text-xs font-semibold text-content-primary">
            {verdict
              ? (isZh ? verdict.why_plain_zh : verdict.why_plain_en)
              : (isZh ? advice.daily_advice_zh : advice.daily_advice_en)}
          </p>

          {verdict && (
            <p className="text-[11px] text-content-secondary">
              <strong className="text-content-primary">{isZh ? '生活比喻: ' : 'Analogy: '}</strong>
              {isZh ? verdict.analogy_zh : verdict.analogy_en}
            </p>
          )}

          {advice.rebalance_required && advice.order_steps.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-0.5">
              {advice.order_steps.map((step) => (
                <span
                  key={step.step_number}
                  className="px-2 py-0.5 rounded-md bg-surface-subtle border border-border-subtle text-[11px] font-mono font-bold text-content-primary"
                >
                  Step {step.step_number}: {isZh ? step.instruction_zh : step.instruction_en}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => loadDailyAdvice(true)}
            disabled={refreshing}
            title={isZh ? '立即刷新实时行情' : 'Refresh Live Quotes'}
            aria-label="Refresh Live Quotes"
            className="p-2 text-content-secondary hover:text-violet-600 hover:bg-surface-subtle border border-border-subtle rounded-xl transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            type="button"
            onClick={onOpenTooBusyTab}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <span>{isZh ? '打开 Too Busy (Tab 5)' : 'Open Too Busy (Tab 5)'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss daily launch signal"
            className="p-2 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
