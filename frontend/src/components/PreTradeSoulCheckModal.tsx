import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  X,
  Compass,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ShieldAlert,
  Flame,
  Snowflake,
  Sun,
  Minus
} from 'lucide-react';

interface PreTradeSoulCheckModalProps {
  isOpen: boolean;
  onClose: () => void;
  symbol: string;
  currentPrice?: number;
  initialTrendTemp?: 'FREEZE' | 'FLAT' | 'WARM' | 'HOT';
  onConfirmTrade?: () => void;
}

export const PreTradeSoulCheckModal: React.FC<PreTradeSoulCheckModalProps> = ({
  isOpen,
  onClose,
  symbol,
  currentPrice,
  initialTrendTemp = 'FLAT',
  onConfirmTrade,
}) => {
  const { language } = useLanguage();

  const [q1Fomo, setQ1Fomo] = useState<boolean>(false);
  const [q2Trend, setQ2Trend] = useState<'FREEZE' | 'FLAT' | 'WARM' | 'HOT'>(initialTrendTemp);
  const [q3Consensus, setQ3Consensus] = useState<string>('');
  const [q4Prior, setQ4Prior] = useState<number>(65);
  const [falsification, setFalsification] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!falsification.trim()) {
      setErrorMessage(
        language === 'zh'
          ? '请明确填写证伪条件（离场触发信号），这是反破产投资宪法的绝对底线！'
          : 'Please define your falsification trigger — this is an investment constitution requirement!'
      );
      return;
    }

    setSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`http://${window.location.hostname || '127.0.0.1'}:8000/api/watchlist/decision-journal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: symbol.toUpperCase(),
          q1_urgent_fomo: q1Fomo,
          q2_trend_temperature: q2Trend,
          q3_crowd_consensus: q3Consensus.trim(),
          q4_bayesian_prior_pct: q4Prior,
          falsification_trigger: falsification.trim(),
          decision_action: q1Fomo ? 'PASS_FOMO_BLOCKED' : 'BUY'
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to save decision journal');
      }

      if (onConfirmTrade) {
        onConfirmTrade();
      }
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="soul-check-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-content-primary z-10 transition-colors duration-150">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Soul Check Modal"
          className="absolute right-6 top-6 p-2 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border-subtle">
          <span className="p-3 prism-badge-brand rounded-2xl">
            <Compass className="w-6 h-6" />
          </span>
          <div>
            <h2 id="soul-check-modal-title" className="text-xl font-extrabold text-content-primary flex items-center gap-2">
              <span>{language === 'zh' ? '投前灵魂四问与贝叶斯先验记录' : 'Pre-Trade Soul Check & Bayesian Prior Journal'}</span>
              <span className="prism-badge-brand text-xs font-mono">${symbol}</span>
            </h2>
            <p className="text-xs text-content-muted">
              {language === 'zh'
                ? '在交易执行前完成心智对齐：敬畏不确定性，消灭情绪化追高，预设证伪离场铁律。'
                : 'Mindset alignment before trade execution: Respect uncertainty, kill FOMO impulse, and register falsification triggers.'}
            </p>
          </div>
        </div>

        {/* Error Banner */}
        {errorMessage && (
          <div className="p-3.5 mb-5 rounded-xl bg-negative/10 border border-negative/30 text-negative text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Question 1: Emotional FOMO */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle">
            <label className="block text-xs font-bold text-content-primary mb-2 flex items-center justify-between">
              <span>
                {language === 'zh' ? '1. 情绪自省：入场是否夹杂怕踏空 (FOMO) 或急迫心理？' : '1. Emotional FOMO Check: Are you entering out of anxiety or fear of missing out?'}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setQ1Fomo(false)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  !q1Fomo
                    ? 'prism-badge-positive border-positive shadow-sm'
                    : 'bg-surface text-content-secondary border-border-subtle'
                }`}
              >
                <CheckCircle2 className="w-4 h-4 text-positive shrink-0" />
                <span>{language === 'zh' ? '否，心如止水，按计划执行' : 'No, Calm & Fully Disciplined'}</span>
              </button>
              <button
                type="button"
                onClick={() => setQ1Fomo(true)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                  q1Fomo
                    ? 'prism-badge-negative border-negative shadow-sm'
                    : 'bg-surface text-content-secondary border-border-subtle'
                }`}
              >
                <AlertTriangle className="w-4 h-4 text-negative shrink-0" />
                <span>{language === 'zh' ? '是，内心焦虑生怕错过大涨' : 'Yes, Anxious & Afraid to Miss Out'}</span>
              </button>
            </div>
            {q1Fomo && (
              <div className="mt-2.5 p-2.5 bg-negative/10 rounded-lg text-negative text-[11px] flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>
                  {language === 'zh'
                    ? '宪法警告：带着急迫情绪进场是爆仓第一根源。建议将单票仓位压低至 1% 试仓或强制静默 24 小时。'
                    : 'Discipline Warning: Emotional urgency is the primary root of trading ruin. Reduce size to 1% or freeze 24h.'}
                </span>
              </div>
            )}
          </div>

          {/* Question 2: Trend Temperature */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle">
            <label className="block text-xs font-bold text-content-primary mb-2 flex items-center justify-between">
              <span>
                {language === 'zh' ? '2. 量价温度：当前标的技术面处于何种温度状态？' : '2. Trend Temperature: What is the technical volume-price regime?'}
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { key: 'FREEZE', icon: Snowflake, labelZh: '❄️ 冻 (血筹左侧)', labelEn: '❄️ Freeze', color: 'text-blue-500' },
                { key: 'FLAT', icon: Minus, labelZh: '➖ 平 (震荡蓄势)', labelEn: '➖ Flat', color: 'text-content-secondary' },
                { key: 'WARM', icon: Sun, labelZh: '🌤️ 温 (右侧击球)', labelEn: '🌤️ Warm', color: 'text-amber-500' },
                { key: 'HOT', icon: Flame, labelZh: '🔥 热 (主升浪潮)', labelEn: '🔥 Hot', color: 'text-rose-500' }
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setQ2Trend(item.key as any)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center flex flex-col items-center gap-1 cursor-pointer ${
                    q2Trend === item.key
                      ? 'bg-brand text-white border-brand shadow-sm'
                      : 'bg-surface text-content-secondary border-border-subtle'
                  }`}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-[11px]">{language === 'zh' ? item.labelZh : item.labelEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Question 3: Non-Consensus Variant View */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle">
            <label className="block text-xs font-bold text-content-primary mb-1.5 flex items-center justify-between">
              <span>
                {language === 'zh' ? '3. 非共识论点：市场大众共识是什么？你的差异化见解是什么？' : '3. Non-Consensus Variant View: What is the consensus, and what do you see differently?'}
              </span>
            </label>
            <textarea
              rows={2}
              value={q3Consensus}
              onChange={(e) => setQ3Consensus(e.target.value)}
              placeholder={
                language === 'zh'
                  ? '例如：市场认为 AI 资本开支见顶，但我们观察到自研 ASIC 与推理侧边际需求持续爆发...'
                  : 'E.g., Consensus expects capex digestion, but channel checks reveal accelerating custom silicon inference demand...'
              }
              className="w-full bg-surface border border-border-subtle rounded-xl p-3 text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-brand"
            />
          </div>

          {/* Question 4: Bayesian Prior */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-content-primary">
                {language === 'zh' ? '4. 贝叶斯先验置信度 (Prior Probability, ≤95%)' : '4. Bayesian Prior Probability (Prior ≤ 95%)'}
              </label>
              <span className="text-sm font-extrabold text-brand font-mono">{q4Prior}%</span>
            </div>
            <input
              type="range"
              min="10"
              max="95"
              step="5"
              value={q4Prior}
              onChange={(e) => setQ4Prior(Number(e.target.value))}
              className="w-full accent-brand cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-content-muted mt-1">
              <span>10% (低把握试探)</span>
              <span>50% (中性)</span>
              <span>95% (宪法置信度上限，绝不可达 100%)</span>
            </div>
          </div>

          {/* Falsification Trigger (Required) */}
          <div className="prism-surface-subtle p-4 rounded-2xl border border-border-subtle">
            <label className="block text-xs font-bold text-negative mb-1.5 flex items-center justify-between">
              <span>
                {language === 'zh' ? '⚠️ 铁律必填 · 证伪条件与离场信号 (Falsification Trigger)' : '⚠️ Mandatory: Falsification Trigger & Exit Rule'}
              </span>
              <span className="text-[10px] text-negative font-mono">* 必填 (Required)</span>
            </label>
            <input
              type="text"
              required
              value={falsification}
              onChange={(e) => setFalsification(e.target.value)}
              placeholder={
                language === 'zh'
                  ? '例如：季报 FCF 跌入负值 / 毛利率跌破 45% / 股价有效跌破 200 日均线且无法回踩...'
                  : 'E.g., FCF turns negative / Gross margin breaks below 45% / Closes below 200D SMA...'
              }
              className="w-full bg-surface border border-border-subtle rounded-xl p-3 text-xs text-content-primary placeholder-content-muted focus:outline-none focus:border-negative"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-surface-subtle hover:bg-surface border border-border-subtle text-content-secondary font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              {language === 'zh' ? '取消放弃' : 'Cancel'}
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-brand hover:bg-brand-hover text-white font-extrabold rounded-xl text-xs transition-all cursor-pointer shadow-md disabled:opacity-50"
            >
              {submitting
                ? (language === 'zh' ? '保存日志中...' : 'Saving...')
                : (language === 'zh' ? '已对齐宪法 · 确认记录并入场' : 'Constitution Aligned · Log & Execute')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
