import React from 'react';
import {
  ShieldCheck,
  Flame,
  Gauge,
  Clock,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { BilingualHoverCard } from '../BilingualHoverCard';
import {
  TooBusyBeginnerDecisionGuide,
  TooBusyExecutionClock,
  TooBusyKeySignalItem,
  TooBusyStrategyMode,
} from '../../types';

/** Mapping table for Action Verdict hero color palettes (single source of truth across light/dark). */
const VERDICT_PALETTE: Record<string, string> = {
  GREEN: 'bg-emerald-50/80 dark:bg-emerald-950/35 border-emerald-400 dark:border-emerald-700 text-emerald-950 dark:text-emerald-100',
  ROSE: 'bg-rose-50/80 dark:bg-rose-950/35 border-rose-400 dark:border-rose-700 text-rose-950 dark:text-rose-100',
  SKY: 'bg-sky-50/80 dark:bg-sky-950/35 border-sky-400 dark:border-sky-700 text-sky-950 dark:text-sky-100',
  AMBER: 'bg-amber-50/80 dark:bg-amber-950/35 border-amber-400 dark:border-amber-700 text-amber-950 dark:text-amber-100',
};

const TRAFFIC_LIGHT_BADGE: Record<string, string> = {
  GREEN: 'bg-emerald-600 text-white',
  RED: 'bg-rose-600 text-white',
  AMBER: 'bg-amber-500 text-white',
  NEUTRAL: 'bg-slate-600 text-white',
};

interface TrackSelectorProps {
  strategyMode: TooBusyStrategyMode;
  onSelectMode: (mode: TooBusyStrategyMode) => void;
  guide?: TooBusyBeginnerDecisionGuide;
  isZh: boolean;
}

/**
 * Side-by-side beginner risk selector letting the user compare today's exact target weights
 * across Long-Only Shield, Aggressive Dual Attack (with SQQQ), and 1x Unleveraged baseline.
 */
export const TooBusyTrackSelector: React.FC<TrackSelectorProps> = ({
  strategyMode,
  onSelectMode,
  guide,
  isZh,
}) => {
  const tracks = guide?.recommended_strategy;
  if (!tracks) return null;

  return (
    <div className="pt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
      {tracks.balanced_long_only_track && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectMode('TOO_BUSY_LONG_ONLY')}
          onKeyDown={(e) => e.key === 'Enter' && onSelectMode('TOO_BUSY_LONG_ONLY')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
            strategyMode === 'TOO_BUSY_LONG_ONLY'
              ? 'bg-violet-50/80 dark:bg-violet-950/35 border-violet-500 ring-2 ring-violet-500/20'
              : 'bg-surface-subtle border-border-subtle hover:border-violet-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white text-[10px] font-black uppercase">
                {isZh ? tracks.balanced_long_only_track.badge_zh : tracks.balanced_long_only_track.badge_en}
              </span>
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="text-xs font-black text-content-primary">
              {isZh ? tracks.balanced_long_only_track.title_zh : tracks.balanced_long_only_track.title_en}
            </div>
            <p className="text-[11px] text-content-secondary mt-1">
              {isZh ? tracks.balanced_long_only_track.why_zh : tracks.balanced_long_only_track.why_en}
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle text-xs font-mono font-black text-violet-700 dark:text-violet-300">
            {isZh ? tracks.balanced_long_only_track.today_target_zh : tracks.balanced_long_only_track.today_target_en}
          </div>
        </div>
      )}

      {tracks.aggressive_dual_track && (
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelectMode('TOO_BUSY_DUAL')}
          onKeyDown={(e) => e.key === 'Enter' && onSelectMode('TOO_BUSY_DUAL')}
          className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
            strategyMode === 'TOO_BUSY_DUAL'
              ? 'bg-rose-50/80 dark:bg-rose-950/35 border-rose-500 ring-2 ring-rose-500/20'
              : 'bg-surface-subtle border-border-subtle hover:border-rose-300'
          }`}
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-black uppercase">
                {isZh ? tracks.aggressive_dual_track.badge_zh : tracks.aggressive_dual_track.badge_en}
              </span>
              <Flame className="w-4 h-4 text-rose-600" />
            </div>
            <div className="text-xs font-black text-content-primary flex items-center gap-1.5">
              <BilingualHoverCard termKey="SQQQ_ETF">
                <span>{isZh ? tracks.aggressive_dual_track.title_zh : tracks.aggressive_dual_track.title_en}</span>
              </BilingualHoverCard>
            </div>
            <p className="text-[11px] text-content-secondary mt-1">
              {isZh ? tracks.aggressive_dual_track.why_zh : tracks.aggressive_dual_track.why_en}
            </p>
          </div>
          <div className="mt-2.5 pt-2 border-t border-border-subtle text-xs font-mono font-black text-rose-700 dark:text-rose-300">
            {isZh ? tracks.aggressive_dual_track.today_target_zh : tracks.aggressive_dual_track.today_target_en}
          </div>
        </div>
      )}

      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectMode('CORE_1X')}
        onKeyDown={(e) => e.key === 'Enter' && onSelectMode('CORE_1X')}
        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
          strategyMode === 'CORE_1X'
            ? 'bg-sky-50/80 dark:bg-sky-950/35 border-sky-500 ring-2 ring-sky-500/20'
            : 'bg-surface-subtle border-border-subtle hover:border-sky-300'
        }`}
      >
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[10px] font-black uppercase">
              {isZh ? '1倍无杠杆对照基准' : '1X UNLEVERAGED'}
            </span>
            <Gauge className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xs font-black text-content-primary">
            {isZh ? '稳健 1倍: QQQ / HXQ.TO + 国债' : 'Sleep-Well 1x: QQQ / HXQ.TO + T-Bill'}
          </div>
          <p className="text-[11px] text-content-secondary mt-1">
            {isZh
              ? '相同 5 个信号引擎，但零借贷融资损耗，适合不想承受每日 3倍净值波动的资金。'
              : 'Same 5-rule trend timing with zero 3x leverage swap drag or daily volatility compounding decay.'}
          </p>
        </div>
        <div className="mt-2.5 pt-2 border-t border-border-subtle text-xs font-mono font-black text-sky-700 dark:text-sky-300">
          {isZh ? '点击切换至 1x 无杠杆模式' : 'Click to run 1x Unleveraged Mode'}
        </div>
      </div>
    </div>
  );
};

interface VerdictAndTimelineProps {
  guide?: TooBusyBeginnerDecisionGuide;
  asOfDate: string;
  executionClock: TooBusyExecutionClock;
  vehicles: { long_etf: string; short_etf: string; cash_etf: string };
  targetLongPct: number;
  targetShortPct: number;
  targetCashPct: number;
  plainTalkOn: boolean;
  isZh: boolean;
}

/**
 * Displays the #1 unmistakable action verdict hero and (when Plain-Talk is ON) the high-school
 * visual timeline explaining why assessing TODAY's 15:50 EST close positions for TOMORROW's market.
 */
export const TooBusyVerdictAndTimeline: React.FC<VerdictAndTimelineProps> = ({
  guide,
  asOfDate,
  executionClock,
  vehicles,
  targetLongPct,
  targetShortPct,
  targetCashPct,
  plainTalkOn,
  isZh,
}) => {
  const verdict = guide?.action_verdict;
  const timeline = guide?.execution_timeline_explainer;

  const allocPills = [
    { label: vehicles.long_etf, termKey: 'TQQQ_ETF', pct: targetLongPct },
    { label: vehicles.short_etf, termKey: 'SQQQ_ETF', pct: targetShortPct },
    { label: vehicles.cash_etf, termKey: 'SGOV_TBill', pct: targetCashPct },
  ];

  return (
    <>
      {verdict && (
        <div className={`prism-card p-6 border-2 ${VERDICT_PALETTE[verdict.verdict_color || 'AMBER'] || VERDICT_PALETTE.AMBER}`}>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-2 max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-wider">
                <span className="px-2.5 py-0.5 rounded-md bg-black/10 dark:bg-white/10">
                  {isZh ? '今日唯一核心结论 (#1 Action Verdict)' : "TODAY'S #1 ACTION VERDICT"}
                </span>
                <span className="font-mono">
                  {asOfDate} • {isZh ? executionClock.label_zh : executionClock.label_en}
                </span>
              </div>
              <h3 className="text-xl md:text-2xl font-black tracking-tight">
                {isZh ? verdict.headline_zh : verdict.headline_en}
              </h3>
              <p className="text-sm font-medium leading-relaxed opacity-95">
                {isZh ? verdict.why_plain_zh : verdict.why_plain_en}
              </p>
              {plainTalkOn && (
                <div className="mt-2 p-3.5 rounded-xl bg-white/75 dark:bg-black/25 border border-black/10 dark:border-white/10 text-xs leading-relaxed">
                  <strong className="font-black uppercase mr-1.5">
                    {isZh ? '生活比喻:' : 'Everyday Analogy:'}
                  </strong>
                  <span>{isZh ? verdict.analogy_zh : verdict.analogy_en}</span>
                </div>
              )}
            </div>

            <div className="shrink-0 grid grid-cols-3 gap-2 text-center min-w-[260px]">
              {allocPills.map((pill) => (
                <div key={pill.termKey} className="p-3 rounded-xl bg-white/80 dark:bg-black/30 border border-black/10 dark:border-white/10">
                  <div className="text-[10px] font-bold opacity-80">
                    <BilingualHoverCard termKey={pill.termKey}>{pill.label}</BilingualHoverCard>
                  </div>
                  <div className="text-xl font-black font-mono mt-0.5">{pill.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {plainTalkOn && timeline && (
        <div className="prism-card p-6 border-l-4 border-l-sky-500">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-600" />
              <h3 className="text-base font-black text-content-primary">
                <BilingualHoverCard termKey="EOD_1550_Window">
                  <span>{isZh ? timeline.headline_zh : timeline.headline_en}</span>
                </BilingualHoverCard>
              </h3>
            </div>
            <span className="text-[11px] font-mono text-content-muted">
              {isZh ? '零隔日滞后 • 高中生级时间线原理' : 'High-School Intuition • Today Check → Tomorrow Ride'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
            {timeline.steps?.map((st, idx) => (
              <div key={idx} className="p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle relative">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded-md bg-sky-600 text-white text-[10px] font-black font-mono">
                    {st.time_est || `Step ${st.step}`}
                  </span>
                  {idx < 3 && <ArrowRight className="w-3.5 h-3.5 text-content-muted hidden lg:block" />}
                </div>
                <div className="text-xs font-black text-content-primary mb-1">
                  {isZh ? st.title_zh : st.title_en}
                </div>
                <p className="text-[11px] text-content-secondary leading-relaxed">
                  {isZh ? st.detail_zh : st.detail_en}
                </p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            {timeline.why_today_predicts_tomorrow?.map((reason, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200 dark:border-sky-800/60">
                <div className="text-xs font-extrabold text-sky-900 dark:text-sky-200 mb-1">
                  {isZh ? reason.title_zh : reason.title_en}
                </div>
                <p className="text-[11px] text-content-secondary leading-relaxed">
                  {isZh ? reason.detail_zh : reason.detail_en}
                </p>
              </div>
            ))}
          </div>

          {(timeline.honest_lag_note_en || timeline.honest_lag_note_zh) && (
            <div className="p-3 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-950 dark:text-amber-200 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>{isZh ? timeline.honest_lag_note_zh : timeline.honest_lag_note_en}</span>
            </div>
          )}
        </div>
      )}
    </>
  );
};

interface KeySignalsChecklistProps {
  signals: TooBusyKeySignalItem[];
  plainTalkOn: boolean;
  isZh: boolean;
}

/** Displays the 4 human-readable traffic-light indicators driving today's recommendation. */
export const TooBusyKeySignalsChecklist: React.FC<KeySignalsChecklistProps> = ({
  signals,
  plainTalkOn,
  isZh,
}) => {
  if (!signals.length) return null;

  return (
    <div className="prism-card p-6">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <h3 className="text-base font-black text-content-primary">
            {isZh ? '支撑今日建议的 4 个核心体检指标（红绿灯清单）' : '4 Key Signals Behind Today’s Recommendation'}
          </h3>
        </div>
        <span className="text-xs text-content-muted">
          {isZh ? '鼠标悬停虚线专业术语可看完整新手百科' : 'Hover any dashed term for Beginner Tooltip & Everyday Analogy'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {signals.map((sig) => (
          <div key={sig.id} className="p-4 rounded-2xl bg-surface-subtle border border-border-subtle flex flex-col justify-between gap-3">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${TRAFFIC_LIGHT_BADGE[sig.traffic_light] || TRAFFIC_LIGHT_BADGE.AMBER}`}>
                  {isZh ? sig.status_badge_zh : sig.status_badge_en}
                </span>
              </div>
              <h4 className="text-xs font-black text-content-primary mb-1">
                <BilingualHoverCard termKey={sig.term_key}>
                  <span>{isZh ? sig.title_zh : sig.title_en}</span>
                </BilingualHoverCard>
              </h4>
              <div className="text-[11px] font-mono font-bold text-violet-700 dark:text-violet-300 mb-2">
                {sig.current_reading}
              </div>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                {isZh ? sig.plain_explanation_zh : sig.plain_explanation_en}
              </p>
            </div>

            {plainTalkOn && (
              <div className="p-2.5 rounded-xl bg-surface border border-border-subtle text-[11px] text-content-muted leading-relaxed">
                <strong className="text-content-primary">{isZh ? '比喻: ' : 'Analogy: '}</strong>
                {isZh ? sig.analogy_zh : sig.analogy_en}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
