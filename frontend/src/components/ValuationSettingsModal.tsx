import React, { useState, useEffect } from 'react';
import {
  X,
  Sliders,
  CheckCircle2,
  RefreshCw,
  HelpCircle,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertCircle,
  RotateCcw,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchValuationAlertSettings,
  saveValuationAlertSettings,
  resetValuationAlertSettings,
  fetchWatchlistApi
} from '../api/client';

interface ValuationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved?: () => void;
}

interface TickerOverride {
  target_buy?: number | null;
  target_sell?: number | null;
}

export const ValuationSettingsModal: React.FC<ValuationSettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved
}) => {
  const { t, language } = useLanguage();

  const [activeTab, setActiveTab] = useState<'global' | 'overrides'>('global');
  const [globalMos, setGlobalMos] = useState<number>(15.0);
  const [anchorMode, setAnchorMode] = useState<string>('adaptive_balanced');
  const [tickerOverrides, setTickerOverrides] = useState<Record<string, TickerOverride>>({});
  const [watchlistItems, setWatchlistItems] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Keyboard Escape listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Load settings and watchlist upon opening
  useEffect(() => {
    if (!isOpen) return;
    loadAllData();
  }, [isOpen]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [settingsData, watchlist] = await Promise.all([
        fetchValuationAlertSettings(),
        fetchWatchlistApi().catch(() => [])
      ]);

      if (settingsData) {
        setGlobalMos(settingsData.global_mos_pct ?? 15.0);
        setAnchorMode(settingsData.technical_anchor_mode ?? 'adaptive_balanced');
        setTickerOverrides(settingsData.ticker_overrides ?? {});
      }
      setWatchlistItems(watchlist || []);
    } catch (e) {
      console.warn("Failed to load valuation settings:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);
    try {
      await saveValuationAlertSettings({
        global_mos_pct: globalMos,
        technical_anchor_mode: anchorMode,
        ticker_overrides: tickerOverrides
      });

      setToastMessage({ type: 'success', text: t.settingsSavedSuccess });
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e: any) {
      setToastMessage({ type: 'error', text: `${t.settingsSaveFailed} ${e.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm(t.settingsResetConfirm)) return;
    setIsSaving(true);
    setToastMessage(null);
    try {
      const res = await resetValuationAlertSettings();
      if (res && res.settings) {
        setGlobalMos(res.settings.global_mos_pct ?? 15.0);
        setAnchorMode(res.settings.technical_anchor_mode ?? 'adaptive_balanced');
        setTickerOverrides({});
      }
      setToastMessage({ type: 'success', text: t.settingsResetSuccess });
      if (onSettingsSaved) onSettingsSaved();
      setTimeout(() => setToastMessage(null), 3500);
    } catch (e: any) {
      setToastMessage({ type: 'error', text: `${t.settingsSaveFailed} ${e.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleOverrideChange = (symbol: string, field: 'target_buy' | 'target_sell', value: string) => {
    const num = value.trim() === '' ? null : parseFloat(value);
    setTickerOverrides(prev => {
      const current = prev[symbol] || {};
      const updated = { ...current, [field]: num && !isNaN(num) && num > 0 ? num : null };
      if (!updated.target_buy && !updated.target_sell) {
        const copy = { ...prev };
        delete copy[symbol];
        return copy;
      }
      return { ...prev, [symbol]: updated };
    });
  };

  const clearOverride = (symbol: string) => {
    setTickerOverrides(prev => {
      const copy = { ...prev };
      delete copy[symbol];
      return copy;
    });
  };

  if (!isOpen) return null;

  const overridesCount = Object.keys(tickerOverrides).length;

  const getMosPresetLabel = (val: number) => {
    if (val <= 12.0) return t.settingsMosAggressive;
    if (val <= 17.5) return t.settingsMosBalanced;
    if (val <= 24.5) return t.settingsMosConservative;
    return t.settingsMosDeepValue;
  };

  const getMosBadgeColor = (val: number) => {
    if (val <= 12.0) return 'bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-800';
    if (val <= 17.5) return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800';
    if (val <= 24.5) return 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800';
    return 'bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-300 dark:border-purple-800';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="valuation-settings-title"
        className="relative w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-800 rounded-3xl shadow-2xl flex flex-col overflow-hidden text-content-primary opacity-100 z-50 transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border-subtle bg-surface-subtle">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800/80 shadow-xs">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 id="valuation-settings-title" className="text-base sm:text-lg font-black tracking-tight text-content-primary">
                {t.settingsModalTitle}
              </h2>
              <p className="text-xs text-content-muted mt-0.5">
                {t.settingsModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close settings"
            className="p-2 text-content-muted hover:text-content-primary hover:bg-surface rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 border-b border-border-subtle bg-surface">
          <button
            onClick={() => setActiveTab('global')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'global'
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/30'
                : 'text-content-secondary hover:text-purple-600 hover:bg-surface-subtle border border-transparent'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>{t.settingsTabGlobal}</span>
          </button>

          <button
            onClick={() => setActiveTab('overrides')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'overrides'
                ? 'bg-purple-600 text-white shadow-sm ring-2 ring-purple-400/30'
                : 'text-content-secondary hover:text-purple-600 hover:bg-surface-subtle border border-transparent'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t.settingsTabOverrides}</span>
            {overridesCount > 0 && (
              <span className={`px-1.5 py-0.2 rounded-md text-[10px] font-black ${
                activeTab === 'overrides' ? 'bg-purple-800 text-purple-100' : 'bg-purple-100 dark:bg-purple-900/60 text-purple-700 dark:text-purple-300'
              }`}>
                {overridesCount}
              </span>
            )}
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3 text-content-muted">
              <RefreshCw className="w-6 h-6 animate-spin text-purple-600" />
              <span className="text-xs font-semibold">Loading valuation settings...</span>
            </div>
          ) : activeTab === 'global' ? (
            <>
              {/* 1. Global Margin of Safety Slider Card */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      <h3 className="text-sm font-extrabold text-content-primary">
                        {t.settingsGlobalMosTitle}
                      </h3>
                    </div>
                    <p className="text-xs text-content-muted mt-1 max-w-xl">
                      {t.settingsGlobalMosSubtitle}
                    </p>
                  </div>
                  <div className={`px-3 py-1.5 rounded-xl border text-xs font-black shrink-0 flex items-center gap-2 ${getMosBadgeColor(globalMos)}`}>
                    <span className="text-sm">{globalMos.toFixed(1)}%</span>
                    <span className="text-[11px] font-bold opacity-80">({getMosPresetLabel(globalMos)})</span>
                  </div>
                </div>

                {/* Range Slider */}
                <div className="space-y-2 pt-2">
                  <input
                    type="range"
                    min="10.0"
                    max="30.0"
                    step="0.5"
                    value={globalMos}
                    onChange={(e) => setGlobalMos(parseFloat(e.target.value))}
                    className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-[11px] font-bold text-content-muted px-1">
                    <span>10% (Aggressive)</span>
                    <span>15% (Standard)</span>
                    <span>20% (Conservative)</span>
                    <span>30% (Deep Value)</span>
                  </div>
                </div>

                {/* Preset Fast-Pick Buttons */}
                <div className="flex items-center gap-2 flex-wrap pt-1">
                  <span className="text-xs font-medium text-content-muted mr-1">Presets:</span>
                  {[
                    { label: '10.0% (Aggressive)', val: 10.0 },
                    { label: '15.0% (Standard)', val: 15.0 },
                    { label: '20.0% (Conservative)', val: 20.0 },
                    { label: '30.0% (Graham Value)', val: 30.0 },
                  ].map(p => (
                    <button
                      key={p.val}
                      onClick={() => setGlobalMos(p.val)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        globalMos === p.val
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'bg-surface-subtle hover:bg-slate-200 dark:hover:bg-slate-800 text-content-secondary border border-border-subtle'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Technical Anchor Mode Selector Card */}
              <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4 shadow-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <h3 className="text-sm font-extrabold text-content-primary">
                      {t.settingsAnchorModeTitle}
                    </h3>
                  </div>
                  <p className="text-xs text-content-muted mt-1 max-w-xl">
                    {t.settingsAnchorModeSubtitle}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Mode 1: Adaptive Balanced */}
                  <div
                    onClick={() => setAnchorMode('adaptive_balanced')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      anchorMode === 'adaptive_balanced'
                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-sm ring-1 ring-purple-400/40'
                        : 'bg-surface hover:bg-surface-subtle border-border-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-content-primary">
                          {t.settingsAnchorAdaptive}
                        </span>
                        {anchorMode === 'adaptive_balanced' && (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-content-muted leading-relaxed">
                        {t.settingsAnchorAdaptiveDesc}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 mt-3 block">
                      Recommended for Most Users
                    </span>
                  </div>

                  {/* Mode 2: Strict 200D SMA */}
                  <div
                    onClick={() => setAnchorMode('strict_200d')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      anchorMode === 'strict_200d'
                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-sm ring-1 ring-purple-400/40'
                        : 'bg-surface hover:bg-surface-subtle border-border-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-content-primary">
                          {t.settingsAnchorStrict}
                        </span>
                        {anchorMode === 'strict_200d' && (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-content-muted leading-relaxed">
                        {t.settingsAnchorStrictDesc}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 mt-3 block">
                      Maximum Drawdown Protection
                    </span>
                  </div>

                  {/* Mode 3: Tactical 5% Pullback */}
                  <div
                    onClick={() => setAnchorMode('tactical_pullback')}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                      anchorMode === 'tactical_pullback'
                        ? 'bg-purple-50/70 dark:bg-purple-950/40 border-purple-400 dark:border-purple-600 shadow-sm ring-1 ring-purple-400/40'
                        : 'bg-surface hover:bg-surface-subtle border-border-subtle'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-content-primary">
                          {t.settingsAnchorTactical}
                        </span>
                        {anchorMode === 'tactical_pullback' && (
                          <CheckCircle2 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-content-muted leading-relaxed">
                        {t.settingsAnchorTacticalDesc}
                      </p>
                    </div>
                    <span className="text-[10px] font-bold text-sky-700 dark:text-sky-400 mt-3 block">
                      Momentum Growth Compounders
                    </span>
                  </div>
                </div>
              </div>

              {/* 3. Trade-Off Notice Callout */}
              <div className="bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-content-primary">
                    {t.settingsTradeoffNoticeTitle}
                  </h4>
                  <p className="text-xs text-content-muted mt-0.5 leading-relaxed">
                    {t.settingsTradeoffNoticeDesc}
                  </p>
                </div>
              </div>
            </>
          ) : (
            /* Tab 2: Watchlist Ticker Overrides */
            <div className="bg-surface border border-border-subtle rounded-2xl p-5 space-y-4 shadow-xs">
              <div>
                <h3 className="text-sm font-extrabold text-content-primary">
                  {t.settingsOverridesTitle}
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  {t.settingsOverridesSubtitle}
                </p>
              </div>

              {watchlistItems.length === 0 ? (
                <div className="text-center py-12 text-content-muted">
                  <p className="text-xs">No watchlisted stocks yet. Star stocks in the workstation to configure custom thresholds.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-border-subtle text-content-muted">
                        <th className="py-2.5 px-3 font-bold">{t.settingsTickerCol}</th>
                        <th className="py-2.5 px-3 font-bold">{t.settingsCustomBuyCol}</th>
                        <th className="py-2.5 px-3 font-bold">{t.settingsCustomSellCol}</th>
                        <th className="py-2.5 px-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border-subtle font-medium">
                      {watchlistItems.map((item) => {
                        const sym = item.symbol.toUpperCase();
                        const override = tickerOverrides[sym] || {};
                        const hasOverride = override.target_buy || override.target_sell;

                        return (
                          <tr key={sym} className="hover:bg-surface-subtle transition-colors">
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-content-primary">${sym}</span>
                                <span className="text-[11px] text-content-muted truncate max-w-[140px] sm:max-w-[200px]">
                                  {item.company_name}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-content-muted">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder={item.target_buy_price ? String(item.target_buy_price) : 'Dynamic'}
                                  value={override.target_buy !== undefined && override.target_buy !== null ? override.target_buy : ''}
                                  onChange={(e) => handleOverrideChange(sym, 'target_buy', e.target.value)}
                                  className="w-24 bg-surface border border-border-subtle hover:border-purple-400 focus:border-purple-600 rounded-lg px-2 py-1 text-xs text-content-primary focus:outline-none transition-all"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <div className="flex items-center gap-1.5">
                                <span className="text-content-muted">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  placeholder={item.target_sell_price ? String(item.target_sell_price) : 'Dynamic'}
                                  value={override.target_sell !== undefined && override.target_sell !== null ? override.target_sell : ''}
                                  onChange={(e) => handleOverrideChange(sym, 'target_sell', e.target.value)}
                                  className="w-24 bg-surface border border-border-subtle hover:border-purple-400 focus:border-purple-600 rounded-lg px-2 py-1 text-xs text-content-primary focus:outline-none transition-all"
                                />
                              </div>
                            </td>
                            <td className="py-3 px-3 text-right">
                              {hasOverride ? (
                                <button
                                  onClick={() => clearOverride(sym)}
                                  className="text-[11px] font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                                >
                                  Clear Override
                                </button>
                              ) : (
                                <span className="text-[10px] font-bold text-content-muted px-2 py-0.5 rounded bg-surface-subtle">
                                  Dynamic Auto
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Toast / Notification Banner */}
        {toastMessage && (
          <div className={`mx-6 mb-3 px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-between ${
            toastMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800'
          }`}>
            <div className="flex items-center gap-2">
              {toastMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{toastMessage.text}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="cursor-pointer opacity-70 hover:opacity-100">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-4 border-t border-border-subtle bg-surface-subtle">
          <button
            onClick={handleReset}
            disabled={isSaving}
            className="w-full sm:w-auto px-4 py-2 rounded-xl border border-border-subtle bg-surface hover:bg-slate-100 dark:hover:bg-slate-800 text-content-secondary text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t.settingsResetBtn}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-border-subtle hover:bg-surface text-content-secondary text-xs font-bold transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 active:scale-98 text-white text-xs font-extrabold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>{t.settingsSavingBtn}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{t.settingsSaveBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
