import React from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Award, ArrowUpRight, Scale } from 'lucide-react';

interface DebateArenaProps {
  debateData: any;
  isPlainTalk?: boolean;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ debateData, isPlainTalk = false }) => {
  const { t } = useLanguage();
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
              <span>{t.debateTitle}</span>
              {isPlainTalk && (
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded text-[10px] font-semibold">
                  PlainTalk Mode
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400">
              🐂 Bull Agent vs 🐻 Bear Agent Data Debate $\rightarrow$ 👨‍⚖️ CIO Verdict & Evidence Verification
            </p>
          </div>
        </div>
      </div>

      {/* Arena Debate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Bull Case Card */}
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mb-2 pb-2 border-b border-emerald-500/20">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>
                  <BilingualHoverCard termKey="BullAgent" isPlainTalk={isPlainTalk}>
                    {t.bullCase}
                  </BilingualHoverCard>
                </span>
              </span>
              <span className="text-[10px] text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded font-mono">
                Agent: {bull.agent || "Bullish Analyst"}
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 mb-4">
              {(bull.key_points || ["High Free Cash Flow conversion", "Dominant market leadership position"]).map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          {bull.upside_catalyst && (
            <div className="bg-emerald-900/30 border border-emerald-500/30 p-2.5 rounded-lg text-xs">
              <span className="text-emerald-400 font-bold block mb-0.5 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> {t.keyUpsideCatalyst}:
              </span>
              <span className="text-slate-200 font-medium">{bull.upside_catalyst}</span>
            </div>
          )}
        </div>

        {/* Bear Case Card */}
        <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-rose-400 mb-2 pb-2 border-b border-rose-500/20">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>
                  <BilingualHoverCard termKey="BearAgent" isPlainTalk={isPlainTalk}>
                    {t.bearCase}
                  </BilingualHoverCard>
                </span>
              </span>
              <span className="text-[10px] text-rose-300 bg-rose-500/10 px-2 py-0.5 rounded font-mono">
                Agent: {bear.agent || "Bearish Auditor"}
              </span>
            </div>
            <ul className="space-y-2 text-xs text-slate-300 mb-4">
              {(bear.key_points || ["Macro headwinds & interest rate sensitivity", "Competitive margin compression risks"]).map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          {bear.downside_risk && (
            <div className="bg-rose-900/30 border border-rose-500/30 p-2.5 rounded-lg text-xs">
              <span className="text-rose-400 font-bold block mb-0.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {t.keyDownsideRisk}:
              </span>
              <span className="text-slate-200 font-medium">{bear.downside_risk}</span>
            </div>
          )}
        </div>
      </div>

      {/* CIO Final Verdict Banner */}
      <div className="bg-gradient-to-r from-amber-950/30 via-slate-900 to-indigo-950/30 border border-amber-500/40 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-extrabold">
              <BilingualHoverCard termKey="CIOVerdict" isPlainTalk={isPlainTalk}>
                {t.cioVerdict}
              </BilingualHoverCard>
            </span>
            <span className="text-xs font-extrabold text-emerald-400">{cio.verdict || "ACCUMULATE ON PULLBACKS"}</span>
          </div>
          <span className="text-xs font-bold text-slate-300">
            <BilingualHoverCard termKey="RiskReward" isPlainTalk={isPlainTalk}>
              {t.riskReward}
            </BilingualHoverCard>: <span className="text-indigo-400 font-mono">{cio.risk_reward_ratio || 2.4}:1</span>
          </span>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed font-medium mb-3">
          {cio.judge_summary || "Ground-truth audit confirms solid FCF conversion and wide economic moat, supporting disciplined DCA allocation."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-2.5">
          <div className="text-slate-300">
            <span className="text-slate-400">
              <BilingualHoverCard termKey="IdealBuyZone" isPlainTalk={isPlainTalk}>
                {t.recommendedBuyBracket}
              </BilingualHoverCard>: 
            </span>
            <span className="font-bold text-amber-300"> {cio.recommended_buy_bracket || "Ideal Buy Zone"}</span>
          </div>
          <div className="text-slate-300">
            <span className="text-slate-400">
              <BilingualHoverCard termKey="PositionSizing" isPlainTalk={isPlainTalk}>
                {t.positionSizing}
              </BilingualHoverCard>: 
            </span>
            <span className="font-semibold text-emerald-400"> {cio.position_sizing_advice || "3.5% Portfolio Max Weight"}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
