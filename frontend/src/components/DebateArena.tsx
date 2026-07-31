import React from 'react';
import { JargonTooltip } from './JargonTooltip';
import { ShieldAlert, Award, ArrowUpRight, Scale } from 'lucide-react';

interface DebateArenaProps {
  debateData: any;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ debateData }) => {
  if (!debateData) return null;

  const bull = debateData.bull_argument || {};
  const bear = debateData.bear_argument || {};
  const cio = debateData.cio_verdict || {};

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-xl shadow-xl mb-6">
      <div className="flex items-center gap-3 border-b border-slate-800 pb-3 mb-5">
        <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
          <Scale className="w-6 h-6" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">
            三方 Agent 辩论场 (Multi-Agent Debate Arena)
          </h3>
          <p className="text-xs text-slate-400">
            🐂 多头 vs 🐻 空头 展开数据辩论 $\rightarrow$ 👨‍⚖️ CIO 投委会主席强制数据举证裁决
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
        {/* 🐂 Bull Agent Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm mb-3">
              <span className="text-xl">🐂</span>
              <span>多头分析师 (Bull Agent)</span>
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
            🚀 <span className="font-semibold">看涨催化剂：</span> {bull.upside_catalyst}
          </div>
        </div>

        {/* 🐻 Bear Agent Card */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 font-bold text-rose-400 text-sm mb-3">
              <span className="text-xl">🐻</span>
              <span>空头分析师 (Bear Agent)</span>
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
            ⚠️ <span className="font-semibold">最大下行风险：</span> {bear.downside_risk}
          </div>
        </div>
      </div>

      {/* 👨‍⚖️ CIO Verdict Callout Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 border border-amber-500/40 rounded-2xl p-5 shadow-2xl">
        <div className="flex items-center justify-between gap-4 mb-3 border-b border-amber-500/20 pb-3">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Award className="w-5 h-5 text-amber-300" />
            <span>👨‍⚖️ CIO 投委会主席裁决 verdict</span>
          </div>
          <div className="px-3 py-1 bg-amber-500/20 border border-amber-400/40 rounded-full font-bold text-xs text-amber-200">
            {cio.verdict}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mb-3">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">建议建仓仓位 (Position Sizing):</span>
            <span className="font-bold text-slate-100">{cio.position_sizing_advice}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1">建议分批买入区间 (Buy Bracket):</span>
            <span className="font-bold text-emerald-400">{cio.recommended_buy_bracket}</span>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block mb-1"><JargonTooltip termKey="Risk-Reward Ratio">风险收益赔率比</JargonTooltip>:</span>
            <span className="font-bold text-amber-300">{cio.risk_reward_ratio}x</span>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
          💬 <span className="font-semibold text-amber-300">主席总结：</span> {cio.judge_summary}
        </p>
      </div>
    </div>
  );
};
