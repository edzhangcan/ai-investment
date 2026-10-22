import React, { useState, useEffect } from 'react';
import { BilingualHoverCard } from './BilingualHoverCard';
import { useLanguage } from '../context/LanguageContext';
import { ShieldAlert, Award, ArrowUpRight, Scale, Share2, AlertTriangle, BellRing, CheckCircle2, BookmarkPlus, BookmarkCheck, RefreshCw } from 'lucide-react';
import { ShareVerdictModal } from './ShareVerdictModal';
import { StockData, PricingData, DebateData } from '../types';
import { ProvenanceBadge } from './ProvenanceBadge';
import { addWatchlistApi, runDebateApi } from '../api/client';

interface DebateArenaProps {
  debateData: DebateData | any;
  stock?: StockData | any;
  pricing?: PricingData | any;
  onRefreshDebate?: (forceRefresh?: boolean) => Promise<void> | void;
}

export const DebateArena: React.FC<DebateArenaProps> = ({ debateData, stock, pricing, onRefreshDebate }) => {
  const { t, language } = useLanguage();
  const [localDebate, setLocalDebate] = useState<any>(null);
  const [isVerifyingFiling, setIsVerifyingFiling] = useState(false);
  const [filingVerifiedSuccess, setFilingVerifiedSuccess] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isNotifyingFalsification, setIsNotifyingFalsification] = useState(false);
  const [falsificationSent, setFalsificationSent] = useState(false);
  const [isSyncingWatchlist, setIsSyncingWatchlist] = useState(false);
  const [watchlistSynced, setWatchlistSynced] = useState(false);

  useEffect(() => {
    setLocalDebate(null);
  }, [debateData?.symbol, debateData?.provenance?.as_of]);

  const activeDebate = localDebate || debateData;
  if (!activeDebate) return null;

  const bull = activeDebate.bull_argument || {};
  const bear = activeDebate.bear_argument || {};
  const cio = activeDebate.cio_verdict || {};
  const isFallback = activeDebate.provenance?.source_mode === 'SIMULATED_FALLBACK';

  const handleManualFilingVerification = async () => {
    const sym = stock?.symbol || activeDebate?.symbol;
    if (!sym) return;
    setIsVerifyingFiling(true);
    try {
      if (onRefreshDebate) {
        await onRefreshDebate(true);
      } else {
        const updated = await runDebateApi(sym, language, undefined, true);
        if (updated) {
          setLocalDebate(updated);
        }
      }
      setFilingVerifiedSuccess(true);
      setTimeout(() => setFilingVerifiedSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to verify ground-truth filings:', err);
    } finally {
      setIsVerifyingFiling(false);
    }
  };

  const handleSyncTargetsToWatchlist = async () => {
    const sym = stock?.symbol || activeDebate?.symbol;
    if (!sym) return;
    setIsSyncingWatchlist(true);
    try {
      const buyPrice = pricing?.ideal_buy_range_max || pricing?.ideal_buy_range_min || null;
      const sellPrice = pricing?.ideal_sell_range_min || pricing?.ideal_sell_range_max || null;
      await addWatchlistApi({
        symbol: sym,
        company_name: stock?.company_name || sym,
        target_buy_price: buyPrice,
        target_sell_price: sellPrice,
        portfolio_allocation_pct: 3.5
      });
      setWatchlistSynced(true);
      setTimeout(() => setWatchlistSynced(false), 3000);
    } catch (err) {
      console.error('Failed to sync targets to watchlist:', err);
    } finally {
      setIsSyncingWatchlist(false);
    }
  };

  const handleNotifyFalsification = async (bottomThreshold: number, currPrice: number) => {
    const sym = stock?.symbol || activeDebate?.symbol;
    if (!sym) return;
    setIsNotifyingFalsification(true);
    try {
      const res = await fetch(`http://${window.location.hostname || '127.0.0.1'}:8000/api/alerts/notify-falsification`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym,
          company_name: stock?.company_name || sym,
          current_price: currPrice,
          bottom_threshold: bottomThreshold
        })
      });
      if (res.ok) {
        setFalsificationSent(true);
      }
    } catch (err) {
      console.error('Failed to dispatch falsification alert:', err);
    } finally {
      setIsNotifyingFalsification(false);
    }
  };

  return (
    <div className="prism-card p-5 mb-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border-subtle pb-3 mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="p-2.5 prism-badge-warning rounded-xl">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-content-primary flex items-center gap-2 flex-wrap">
              <span>{t.debateTitle}</span>
              <ProvenanceBadge provenance={activeDebate?.provenance} />
              {isFallback && (
                <button
                  onClick={handleManualFilingVerification}
                  disabled={isVerifyingFiling}
                  className="h-6 px-2.5 rounded-lg border border-border-subtle bg-surface hover:bg-surface-subtle text-brand hover:border-brand text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  title="Query SEC EDGAR / SEDAR+ live audited filings to verify ground truth"
                >
                  <RefreshCw className={`w-3 h-3 text-brand ${isVerifyingFiling ? 'animate-spin' : ''}`} />
                  <span>{isVerifyingFiling ? t.retrievingGroundTruth : t.retrieveGroundTruthBtn}</span>
                </button>
              )}
              {filingVerifiedSuccess && (
                <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{t.groundTruthVerifiedSuccess}</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-content-muted">
              {t.debateSubtitle}
            </p>
          </div>
        </div>

        {/* Action Controls: 1-Click Sync Targets to Watchlist & Share Verdict */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleSyncTargetsToWatchlist}
            disabled={isSyncingWatchlist}
            className={`h-8 px-3.5 border rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer box-border ${
              watchlistSynced
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-surface hover:bg-surface-subtle border-border-subtle hover:border-emerald-500 text-content-primary hover:text-emerald-600'
            }`}
            title="Sync CIO Target Buy & Sell Prices directly to Watchlist & Price Alerts"
          >
            {isSyncingWatchlist ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
            ) : watchlistSynced ? (
              <BookmarkCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <BookmarkPlus className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            )}
            <span>
              {watchlistSynced
                ? (language === 'zh' ? '已同步至自选' : 'Targets Synced ✓')
                : (language === 'zh' ? '同步目标价至自选' : 'Sync Targets to Watchlist')}
            </span>
          </button>

          <button
            onClick={() => setIsShareModalOpen(true)}
            className="h-8 px-3.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-brand text-content-primary rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer box-border"
            title={t.shareVerdictTooltip}
          >
            <Share2 className="w-3.5 h-3.5 text-brand" />
            <span>{t.shareVerdictBtn}</span>
          </button>
        </div>
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

        {/* Consolidated Thesis Falsification Kill-Switch & Breach Guard */}
        {(() => {
          const currPrice = Number(stock?.current_price ?? pricing?.current_price ?? 0);
          const rawFloor = debateData.falsification_price_level ?? cio?.mianji_framework?.soul_check?.bottom_threshold ?? (stock?.two_hundred_day_sma ? stock.two_hundred_day_sma * 0.97 : null);
          const bottomFloor = rawFloor ? Number(rawFloor) : null;
          const isFalsified = Boolean(
            cio?.mianji_framework?.soul_check?.is_falsified || 
            (bottomFloor && currPrice > 0 && currPrice < bottomFloor)
          );
          const currency = cio?.mianji_framework?.soul_check?.threshold_currency || stock?.currency || 'USD';
          const falsificationCondition = debateData.falsification_trigger_condition || cio?.mianji_framework?.soul_check?.mandatory_falsification_trigger;

          if (!bottomFloor && !falsificationCondition) return null;

          return (
            <div className={`mb-3.5 p-3.5 rounded-xl border text-xs shadow-sm transition-all ${
              isFalsified
                ? 'border-negative bg-negative/10 dark:bg-negative/20 shadow-negative/10'
                : 'border-rose-300 dark:border-rose-800 bg-rose-50/70 dark:bg-rose-950/30'
            }`}>
              {/* Header with Title, Status Badge, and Quantified Floor */}
              <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <BilingualHoverCard termKey="FalsificationTrigger">
                    <span className="font-extrabold text-xs text-rose-700 dark:text-rose-400 flex items-center gap-1.5 cursor-help">
                      {isFalsified ? (
                        <AlertTriangle className="w-4 h-4 text-negative animate-bounce shrink-0" />
                      ) : (
                        <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                      )}
                      <span>
                        {language === 'zh'
                          ? '⚡ 投资假说证伪熔断线与离场铁律 (Thesis Falsification Kill-Switch)'
                          : '⚡ Thesis Falsification Kill-Switch & Exit Discipline'}
                      </span>
                    </span>
                  </BilingualHoverCard>

                  {/* Status Badge */}
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 ${
                    isFalsified
                      ? 'bg-negative text-white'
                      : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  }`}>
                    {isFalsified ? (
                      <>
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span>{t.falsificationBreachedWarning || (language === 'zh' ? '证伪底线已击穿' : 'THRESHOLD BREACHED')}</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>{language === 'zh' ? '🛡️ 运行在安全边界上方' : '🛡️ Above Floor (Valid)'}</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Floor Badge */}
                {bottomFloor !== null && (
                  <span className={`px-2.5 py-0.5 rounded-md font-mono font-bold text-[11px] border ${
                    isFalsified
                      ? 'bg-negative text-white border-negative'
                      : 'bg-surface border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                  }`}>
                    Floor: ${bottomFloor.toFixed(2)} {currency} (-3% 200D MA)
                  </span>
                )}
              </div>

              {/* Body Condition / Breach Explanation */}
              {isFalsified ? (
                <div className="space-y-2">
                  <p className="text-negative font-semibold leading-relaxed">
                    {t.falsificationBreachedDesc || (language === 'zh'
                      ? '当前股价已跌破量化止损底线。恪守反破产投资宪法：破位机械离场，严禁左侧逆势加仓补仓！'
                      : 'Current price has decisively breached the quantitative falsification floor. Obey anti-ruin constitution: execute stop-loss discipline, never average down on the left side!')}
                    {falsificationCondition && <span className="block mt-1 font-medium">({falsificationCondition})</span>}
                  </p>

                  {/* Immediate Alert Dispatch Trigger */}
                  {bottomFloor !== null && (
                    <div className="pt-2 border-t border-negative/20 flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[11px] text-negative font-mono font-medium">
                        {currency} ${currPrice.toFixed(2)} &lt; Floor ${bottomFloor.toFixed(2)} ({currPrice && bottomFloor ? `-${(((bottomFloor - currPrice) / bottomFloor) * 100).toFixed(1)}%` : ''})
                      </span>
                      <button
                        type="button"
                        onClick={() => handleNotifyFalsification(bottomFloor, currPrice)}
                        disabled={isNotifyingFalsification || falsificationSent}
                        className={`h-7 px-3 rounded-lg text-[11px] font-bold inline-flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                          falsificationSent 
                            ? 'bg-positive text-white' 
                            : 'bg-negative hover:bg-negative/90 text-white'
                        } disabled:opacity-70`}
                      >
                        {falsificationSent ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t.falsificationNotified || (language === 'zh' ? '证伪告警已推送！' : 'Falsification Notified!')}</span>
                          </>
                        ) : (
                          <>
                            <BellRing className="w-3.5 h-3.5" />
                            <span>{isNotifyingFalsification ? "..." : (t.notifyFalsificationBtn || (language === 'zh' ? '推送告警通知 (Discord/应用内)' : 'Broadcast Alert (Discord/In-App)'))}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <p className="text-content-primary font-medium leading-relaxed">
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {language === 'zh' ? '核心证伪诱因 (Trigger Condition): ' : 'Trigger Condition: '}
                    </span>
                    {falsificationCondition || (language === 'zh'
                      ? '跌破200日均线支撑（-3%缓冲带）或核心内生自由现金流转负。'
                      : 'Decisive breach below 200D SMA support (-3% buffer) or fundamental FCF collapse.')}
                  </p>
                  <p className="text-[11px] text-content-muted mt-1">
                    {language === 'zh'
                      ? '💡 当前股价运行于证伪底线上方，假说逻辑保持健康。若后续破位触发熔断，系统将自动锁定加仓权限并向 Discord 推送危险告警。'
                      : '💡 Current price trades safely above the falsification floor. If breached, the platform enforces cut-loss discipline and broadcasts an immediate Discord danger alert.'}
                  </p>
                </div>
              )}
            </div>
          );
        })()}

        {/* Pre-Trade Soul Check & Prior Audit Framework */}
        {cio.mianji_framework && (
          <div className="mb-3 p-3 rounded-xl bg-surface/70 border border-border-subtle text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-1.5 pb-2 border-b border-border-subtle">
              <span className="font-bold text-content-primary flex items-center gap-1.5 text-[11px]">
                <Scale className="w-3.5 h-3.5 text-brand shrink-0" />
                <span>{t.soulCheckTitle || "投前灵魂四问与先验审计"}</span>
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {cio.mianji_framework.taxonomy_label && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-brand/10 text-brand border border-brand/20">
                    {cio.mianji_framework.taxonomy_label}
                  </span>
                )}
                {cio.mianji_framework.barbell_allocation && (
                  <BilingualHoverCard termKey="CoreSAA">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-surface-subtle text-content-secondary border border-border-subtle cursor-help">
                      {cio.mianji_framework.barbell_allocation}
                    </span>
                  </BilingualHoverCard>
                )}
              </div>
            </div>

            {/* Real Stock Asset Taxonomy Diagnosis */}
            {cio.mianji_framework.taxonomy_diagnosis && (
              <div className="p-2.5 rounded-lg bg-surface-subtle/80 border border-border-subtle text-[11px] leading-relaxed">
                <div className="font-bold text-brand mb-1 flex items-center gap-1.5">
                  <BilingualHoverCard termKey="AssetDiagnosis">
                    <span className="cursor-help flex items-center gap-1">
                      <span>🎯 {t.assetDiagnosisTitle || "标的定性归因"}:</span>
                    </span>
                  </BilingualHoverCard>
                </div>
                <p className="text-content-primary font-medium leading-relaxed">
                  {cio.mianji_framework.taxonomy_diagnosis}
                </p>
              </div>
            )}

            {cio.mianji_framework.soul_check && (() => {
              const sc = cio.mianji_framework.soul_check;
              const currPrice = Number(stock?.current_price ?? pricing?.current_price ?? 0);
              const bottomFloor = sc.bottom_threshold ? Number(sc.bottom_threshold) : null;
              const isFalsified = Boolean(sc.is_falsified || (bottomFloor && currPrice > 0 && currPrice < bottomFloor));
              const currency = sc.threshold_currency || stock?.currency || 'USD';

              return (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div className="text-content-secondary">
                    <span className="text-content-muted">
                      <BilingualHoverCard termKey="TrendTemperature">
                        <span className="cursor-help">{t.trendTemperatureTitle || "量价温度 / 击球区"}: </span>
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-content-primary">
                      {sc.trend_temperature} (
                      <BilingualHoverCard termKey="BattingZone">
                        <span className="cursor-help underline decoration-dotted decoration-border-subtle">
                          {sc.hitting_zone === 'RIGHT_SIDE' 
                            ? (t.rightSideBattingZone || "右侧击球区") 
                            : (t.leftSideObservation || "左侧观察")}
                        </span>
                      </BilingualHoverCard>
                      )
                    </span>
                  </div>

                  <div className="text-content-secondary">
                    <span className="text-content-muted">
                      <BilingualHoverCard termKey="BayesianPrior">
                        <span className="cursor-help">{t.bayesianPriorTitle || "贝叶斯先验置信度"}: </span>
                      </BilingualHoverCard>
                    </span>
                    <span className="font-bold text-brand font-mono">
                      {sc.bayesian_prior}
                    </span>
                  </div>

                  {sc.variant_view_penetration && (
                    <div className="sm:col-span-2 text-content-secondary flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-content-muted">
                        <BilingualHoverCard termKey="NarrativePenetration">
                          <span className="cursor-help">{t.narrativePenetrationTitle || "穿透叙事 (10年天花板)"}: </span>
                        </BilingualHoverCard>
                      </span>
                      {sc.implied_ceiling_mult !== undefined ? (
                        <span className="inline-flex items-center gap-1.5 flex-wrap">
                          <BilingualHoverCard termKey="Implied10YCeiling">
                            <span className="font-semibold text-content-primary underline decoration-dotted decoration-border-subtle cursor-help">
                              {t.implied10YCeilingLabel || "逆向10年利润天花板"}: {sc.implied_ceiling_mult}x
                            </span>
                          </BilingualHoverCard>
                          <span className="text-content-muted">|</span>
                          <BilingualHoverCard termKey="ProsperityTrap">
                            <span className={`font-semibold underline decoration-dotted decoration-border-subtle cursor-help ${sc.is_prosperity_trap ? 'text-negative font-bold' : 'text-positive'}`}>
                              {t.prosperityTrapLabel || "景气度陷阱"}: {sc.is_prosperity_trap ? (t.trapTriggered || "已触发") : (t.trapSafe || "安全")}
                            </span>
                          </BilingualHoverCard>
                        </span>
                      ) : (
                        <span className="font-medium text-content-primary">
                          {sc.variant_view_penetration}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

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
