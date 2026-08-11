import React from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';
import { ShieldAlert, Award, ArrowUpRight, Scale } from 'lucide-react';

interface DebateArenaProps {
  debateData: any;
  isPlainTalk?: boolean;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ debateData, isPlainTalk = false }) => {
  if (!debateData) return null;

  const bull = debateData.bull_argument || {};
  const bear = debateData.bear_argument || {};
  const cio = debateData.cio_verdict || {};

  return (
    <div className={`bg-slate-900/80 border rounded-2xl p-5 backdrop-blur-xl shadow-xl mb-6 transition-all ${
      isPlainTalk ? 'border-amber-500/40 ring-1 ring-amber-500/20' : 'border-slate-800'
    }`}>
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Multi-Agent Debate Arena</span>
              {isPlainTalk && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-semibold">
                  Hover Layovers Active
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              🐂 Bull Agent vs 🐻 Bear Agent Data Debate $\rightarrow$ 👨‍⚖️ CIO Verdict & Evidence Verification
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* 🐂 Bull Agent Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-bold text-emerald-400 text-sm mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐂</span>
                <BilingualHoverCard termKey="BullAgent" isPlainTalk={isPlainTalk}>
                  Bull Agent (多头分析师)
                </BilingualHoverCard>
              </div>
              <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded text-emerald-300 font-semibold">
                Growth & Moats
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {bull.key_points?.map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <ArrowUpRight className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 p-2.5 bg-emerald-900/30 rounded-xl border border-emerald-700/30 text-xs text-emerald-300">
            🚀 <span className="font-semibold">Upside Growth Catalyst:</span> {bull.upside_catalyst}
          </div>
        </div>

        {/* 🐻 Bear Agent Card */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between font-bold text-rose-400 text-sm mb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐻</span>
                <BilingualHoverCard termKey="BearAgent" isPlainTalk={isPlainTalk}>
                  Bear Agent (空头分析师)
                </BilingualHoverCard>
              </div>
              <span className="text-[10px] bg-rose-500/20 px-2 py-0.5 rounded text-rose-300 font-semibold">
                Valuation & Risks
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300">
              {bear.key_points?.map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 p-2.5 bg-rose-900/30 rounded-xl border border-rose-700/30 text-xs text-rose-300">
            ⚠️ <span className="font-semibold">Downside Technical Risk:</span> {bear.downside_risk}
          </div>
        </div>
      </div>

      {/* 👨‍⚖️ CIO Verdict Callout Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Award className="w-5 h-5 text-amber-300" />
            <BilingualHoverCard termKey="CIOVerdict" isPlainTalk={isPlainTalk}>
              CIO Agent Verdict (投委会主席裁决)
            </BilingualHoverCard>
          </div>
          <div className="px-3.5 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full font-bold text-xs text-amber-200">
            {cio.verdict}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Position Sizing Advice:</span>
            <span className="font-bold text-slate-100">{cio.position_sizing_advice}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">Recommended Buy Bracket:</span>
            <span className="font-bold text-emerald-400">{cio.recommended_buy_bracket}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">
              <BilingualHoverCard termKey="RiskReward" isPlainTalk={isPlainTalk}>
                Risk-Reward Ratio
              </BilingualHoverCard>:
            </span>
            <span className="font-bold text-amber-300">{cio.risk_reward_ratio}x</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
          💬 <span className="font-semibold text-amber-300">CIO Summary & Rationale:</span> {cio.judge_summary}
        </p>
      </div>
    </div>
  );
};
