import React, { useState } from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Award, ArrowUpRight, Scale, Share2 } from 'lucide-react';
import { ShareVerdictModal } from './ShareVerdictModal';
import { StockData, PricingData, DebateData } from '../types';

interface DebateArenaProps {
  debateData: DebateData | any;
  stock?: StockData | any;
  pricing?: PricingData | any;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ debateData, stock, pricing }) => {
  const { t } = useLanguage();
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  if (!debateData) return null;

  const bull = debateData.bull_argument || {};
  const bear = debateData.bear_argument || {};
  const cio = debateData.cio_verdict || {};

  return (
    <div className="prism-card p-5 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-3 mb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 prism-badge-warning rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-content-primary flex items-center gap-2">
              <span>{t.debateTitle}</span>
            </h3>
            <p className="text-xs text-content-muted">
              {t.debateSubtitle}
            </p>
          </div>
        </div>

        {/* Share Debate Verdict & Preview Modal Trigger */}
        <button
          onClick={() => setIsShareModalOpen(true)}
          className="h-8 px-3.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-brand text-content-primary rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer box-border"
          title={t.shareVerdictTooltip}
        >
          <Share2 className="w-3.5 h-3.5 text-brand" />
          <span>{t.shareVerdictBtn}</span>
        </button>
      </div>

      {/* Arena Debate Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {/* Bull Case Card */}
        <div className="prism-surface-subtle p-4 border-l-4 border-l-positive flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-positive mb-2 pb-2 border-b border-border-subtle">
              <span className="flex items-center gap-1.5">
                <Award className="w-4 h-4" />
                <span>
                  <BilingualHoverCard termKey="BullAgent">
                    {t.bullCase}
                  </BilingualHoverCard>
                </span>
              </span>
            </div>
            <ul className="space-y-2 text-xs text-content-secondary mb-4">
              {(bull.key_points || ["High Free Cash Flow conversion", "Dominant market leadership position"]).map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-positive font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          {bull.upside_catalyst && (
            <div className="prism-badge-positive p-2.5 rounded-lg text-xs">
              <span className="font-bold block mb-0.5 flex items-center gap-1">
                <ArrowUpRight className="w-3.5 h-3.5" /> {t.keyUpsideCatalyst}:
              </span>
              <span className="font-medium text-content-primary">{bull.upside_catalyst}</span>
            </div>
          )}
        </div>

        {/* Bear Case Card */}
        <div className="prism-surface-subtle p-4 border-l-4 border-l-negative flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-negative mb-2 pb-2 border-b border-border-subtle">
              <span className="flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" />
                <span>
                  <BilingualHoverCard termKey="BearAgent">
                    {t.bearCase}
                  </BilingualHoverCard>
                </span>
              </span>
            </div>
            <ul className="space-y-2 text-xs text-content-secondary mb-4">
              {(bear.key_points || ["Macro headwinds & interest rate sensitivity", "Competitive margin compression risks"]).map((pt: string, idx: number) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-negative font-bold">•</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>
          {bear.downside_risk && (
            <div className="prism-badge-negative p-2.5 rounded-lg text-xs">
              <span className="font-bold block mb-0.5 flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" /> {t.keyDownsideRisk}:
              </span>
              <span className="font-medium text-content-primary">{bear.downside_risk}</span>
            </div>
          )}
        </div>
      </div>

      {/* CIO Final Verdict Banner */}
      <div className="prism-surface-subtle p-4 border-l-4 border-l-brand shadow-sm">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
              <Award className="w-4 h-4 text-brand" />
              <BilingualHoverCard termKey="CIOVerdict">
                {t.cioVerdict}
              </BilingualHoverCard>:
            </span>
            <span className="text-xs font-extrabold text-positive">{cio.verdict || "ACCUMULATE ON PULLBACKS"}</span>
          </div>
          <span className="text-xs font-bold text-content-secondary">
            <BilingualHoverCard termKey="RiskReward">
              {t.riskReward}
            </BilingualHoverCard>: <span className="text-brand font-mono">{typeof cio.risk_reward_ratio === 'number' ? cio.risk_reward_ratio.toFixed(1) : (cio.risk_reward_ratio ?? '2.1')}:1</span>
          </span>
        </div>

        <p className="text-xs text-content-primary leading-relaxed font-medium mb-3">
          {cio.judge_summary || "Ground-truth audit confirms solid FCF conversion and wide economic moat, supporting disciplined DCA allocation."}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-border-subtle pt-2.5">
          <div className="text-content-secondary">
            <span className="text-content-muted">
              <BilingualHoverCard termKey="IdealBuyZone">
                {t.recommendedBuyBracket}
              </BilingualHoverCard>: 
            </span>
            <span className="font-bold text-warning"> {cio.recommended_buy_bracket || "Ideal Buy Zone"}</span>
          </div>
          <div className="text-content-secondary">
            <span className="text-content-muted">
              <BilingualHoverCard termKey="PositionSizing">
                {t.positionSizing}
              </BilingualHoverCard>: 
            </span>
            <span className="font-semibold text-positive"> {cio.position_sizing_advice || "3.5% Portfolio Max Weight"}</span>
          </div>
        </div>
      </div>

      {/* Share Verdict Preview & Copy Modal */}
      <ShareVerdictModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        debateData={debateData}
        stock={stock}
        pricing={pricing}
      />
    </div>
  );
};
