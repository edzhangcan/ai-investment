import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Sparkles, RefreshCw, Trash2, CheckCircle2, ArrowRight, Plus } from 'lucide-react';
import {
  fetchAlertHistoryApi,
  deleteAlertHistoryItemApi,
  clearAllAlertHistoryApi,
  triggerPriceAlertCheckApi,
  setStockBucketApi
} from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export interface AlertNotificationItem {
  id: number;
  symbol: string;
  company_name: string;
  current_price: number;
  target_buy_price: number;
  status?: string;
  message?: string;
  triggered_at?: string;
  notification_channel?: string;
}

interface AlertBadgeConfig {
  badgeText: string;
  badgeClass: string;
  priceLabel: string;
  targetLabel: string;
  isDiscovery?: boolean;
}

const getAlertConfig = (status: string | undefined, language: string): AlertBadgeConfig => {
  switch (status) {
    case 'REGULAR_DISCOVERY_TRIGGERED':
      return {
        badgeText:
          language === 'zh'
            ? '💎 价值发现 (常规)'
            : language === 'hybrid'
            ? '💎 价值发现 (Value Discovery)'
            : '💎 Value Discovery (Regular)',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        priceLabel: language === 'zh' ? '现价' : 'Price',
        targetLabel:
          language === 'zh'
            ? '≤ 90%买入上限'
            : language === 'hybrid'
            ? '≤ 90%上限 (Ceiling)'
            : '≤ 90% Buy Ceiling',
        isDiscovery: true,
      };
    case 'FALSIFICATION_TRIGGERED':
      return {
        badgeText:
          language === 'zh'
            ? '🚨 证伪红线破位 (持仓)'
            : language === 'hybrid'
            ? '🚨 证伪破位 (Falsification Breach)'
            : '🚨 Falsification Breach (Holding)',
        badgeClass: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30',
        priceLabel: language === 'zh' ? '现价' : 'Price',
        targetLabel:
          language === 'zh'
            ? '< 证伪底线'
            : language === 'hybrid'
            ? '< 证伪底线 (Exit Floor)'
            : '< Exit Floor',
      };
    case 'STOP_LOSS_TRIGGERED':
      return {
        badgeText:
          language === 'zh'
            ? '⚠️ 纪律止损预警 (持仓)'
            : language === 'hybrid'
            ? '⚠️ 纪律止损 (Stop-Loss)'
            : '⚠️ Stop-Loss (Holding)',
        badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30',
        priceLabel: language === 'zh' ? '现价' : 'Price',
        targetLabel:
          language === 'zh'
            ? '< 止损底线'
            : language === 'hybrid'
            ? '< 止损底线 (Stop Floor)'
            : '< Stop Floor',
      };
    case 'SELL_TRIGGERED':
      return {
        badgeText:
          language === 'zh'
            ? '💰 止盈目标达成 (持仓)'
            : language === 'hybrid'
            ? '💰 止盈目标 (Profit Target)'
            : '💰 Profit Target (Holding)',
        badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
        priceLabel: language === 'zh' ? '现价' : 'Price',
        targetLabel:
          language === 'zh'
            ? '≥ 止盈目标'
            : language === 'hybrid'
            ? '≥ 止盈目标 (Exit Target)'
            : '≥ Exit Target',
      };
    case 'BUY_TRIGGERED':
    case 'TRIGGERED':
    default:
      return {
        badgeText:
          language === 'zh'
            ? '🎯 自选股买入信号'
            : language === 'hybrid'
            ? '🎯 自选买入 (Watchlist Buy-In)'
            : '🎯 Watchlist Buy-In',
        badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/30',
        priceLabel: language === 'zh' ? '现价' : 'Price',
        targetLabel:
          language === 'zh'
            ? '≤ 95%买入上限'
            : language === 'hybrid'
            ? '≤ 95%目标价 (Target)'
            : '≤ 95% Buy Ceiling',
      };
  }
};

interface NotificationCenterProps {
  onSelectTicker: (symbol: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectTicker }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertNotificationItem[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [addingSymbols, setAddingSymbols] = useState<string[]>([]);
  const [addedSymbols, setAddedSymbols] = useState<string[]>([]);

  const containerRef = useRef<HTMLDivElement>(null);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await fetchAlertHistoryApi();
      if (Array.isArray(data)) {
        setAlerts(data);
      }
    } catch {
      // Background poll fails gracefully
    }
  }, []);

  useEffect(() => {
    loadAlerts();
    const interval = setInterval(loadAlerts, 20000); // Poll every 20s
    return () => clearInterval(interval);
  }, [loadAlerts]);

  // Click outside and ESC key listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleCheckNow = async () => {
    setIsChecking(true);
    try {
      await triggerPriceAlertCheckApi();
      await loadAlerts();
    } catch (e) {
      console.warn('Failed to trigger alert check:', e);
    } finally {
      setIsChecking(false);
    }
  };

  const handleClearAll = async () => {
    setIsClearing(true);
    try {
      await clearAllAlertHistoryApi();
      setAlerts([]);
    } catch (e) {
      console.warn('Failed to clear alerts:', e);
    } finally {
      setIsClearing(false);
    }
  };

  const handleDeleteItem = async (e: React.MouseEvent, alertId: number) => {
    e.stopPropagation();
    try {
      await deleteAlertHistoryItemApi(alertId);
      setAlerts((prev) => prev.filter((item) => item.id !== alertId));
    } catch (e) {
      console.warn('Failed to delete alert item:', e);
    }
  };

  const handleAddToWatchlist = async (e: React.MouseEvent, symbol: string, alertId?: number) => {
    e.stopPropagation();
    if (addingSymbols.includes(symbol) || addedSymbols.includes(symbol)) return;
    setAddingSymbols((prev) => [...prev, symbol]);
    try {
      await setStockBucketApi({ symbol, bucket: 'WATCHLIST' });
      setAddedSymbols((prev) => [...prev, symbol]);
      if (alertId) {
        setTimeout(async () => {
          try {
            await deleteAlertHistoryItemApi(alertId);
            setAlerts((prev) => prev.filter((item) => item.id !== alertId));
          } catch {
            // best-effort cleanup
          }
        }, 1200);
      }
    } catch (err) {
      console.warn('Failed to add to watchlist:', err);
    } finally {
      setAddingSymbols((prev) => prev.filter((s) => s !== symbol));
    }
  };

  const handleDeepDive = (symbol: string) => {
    setIsOpen(false);
    onSelectTicker(symbol);
  };

  const formatTimestamp = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const unreadCount = alerts.length;

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Bell Icon Trigger Button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={t.notificationCenterAria}
        aria-expanded={isOpen}
        className={`relative p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-center ${
          isOpen
            ? 'bg-brand/10 border-brand text-brand shadow-sm ring-2 ring-brand/20'
            : unreadCount > 0
            ? 'bg-brand/5 dark:bg-brand/10 border-brand/40 text-brand hover:bg-brand/10'
            : 'bg-surface hover:bg-surface-subtle border-border-subtle text-content-secondary hover:text-content-primary shadow-sm'
        }`}
        title={t.notificationCenterTitle}
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-brand text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-in zoom-in-50">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Popover Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 md:w-[440px] bg-white dark:bg-slate-900 border border-border-subtle rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
          {/* Header Bar */}
          <div className="p-4 border-b border-border-subtle flex items-center justify-between gap-3 bg-surface-subtle">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-brand/10 text-brand">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-content-primary">
                    {t.notificationCenterTitle}
                  </h3>
                  {unreadCount > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-brand/10 text-brand text-[10px] font-extrabold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-content-muted">
                  {unreadCount > 0
                    ? `${unreadCount} ${t.unreadCountBadge}`
                    : t.noNotificationsTitle}
                </p>
              </div>
            </div>

            {/* Actions: Scan & Clear All */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCheckNow}
                disabled={isChecking}
                aria-label={t.checkAlertsNow}
                title={t.checkAlertsNow}
                className="p-1.5 text-content-muted hover:text-brand hover:bg-surface rounded-lg transition-colors cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChecking ? 'animate-spin text-brand' : ''}`} />
              </button>

              {unreadCount > 0 && (
                <button
                  onClick={handleClearAll}
                  disabled={isClearing}
                  className="px-2 py-1 text-[11px] font-bold text-negative hover:bg-negative/10 rounded-lg transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                  title={t.clearAllNotifications}
                >
                  <Trash2 className="w-3 h-3" />
                  <span>{t.clearAllNotifications}</span>
                </button>
              )}
            </div>
          </div>

          {/* Alert Items List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-border-subtle">
            {alerts.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-2 text-content-muted">
                <div className="p-3 rounded-full bg-surface-subtle text-content-muted">
                  <CheckCircle2 className="w-6 h-6 text-positive" />
                </div>
                <h4 className="text-xs font-bold text-content-primary mt-1">
                  {t.noNotificationsTitle}
                </h4>
                <p className="text-[11px] text-content-secondary max-w-[260px] leading-relaxed">
                  {t.noNotificationsDesc}
                </p>
                <button
                  onClick={handleCheckNow}
                  disabled={isChecking}
                  className="mt-3 px-3 py-1.5 bg-surface-subtle hover:bg-surface border border-border-subtle text-content-primary rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3 h-3 ${isChecking ? 'animate-spin text-brand' : ''}`} />
                  <span>{isChecking ? t.checkingAlerts : t.checkAlertsNow}</span>
                </button>
              </div>
            ) : (
              alerts.map((alert) => {
                const config = getAlertConfig(alert.status, language);
                return (
                  <div
                    key={alert.id}
                    className="p-3.5 hover:bg-surface-subtle transition-colors group relative flex flex-col gap-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-black text-content-primary tracking-tight">
                          ${alert.symbol}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-md font-bold ${config.badgeClass}`}>
                          {config.badgeText}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {alert.triggered_at && (
                          <span className="text-[10px] text-content-muted">
                            {formatTimestamp(alert.triggered_at)}
                          </span>
                        )}
                        <button
                          onClick={(e) => handleDeleteItem(e, alert.id)}
                          className="p-1 text-content-muted hover:text-negative hover:bg-negative/10 rounded-md transition-colors cursor-pointer"
                          title={t.dismissNotification}
                          aria-label={t.dismissNotification}
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-content-secondary line-clamp-1 font-medium">
                      {alert.company_name}
                    </p>

                    {/* Detailed Rationale Message */}
                    {alert.message && (
                      <div className="text-[11px] text-content-secondary bg-surface dark:bg-slate-800/80 p-2 rounded-lg border border-border-subtle/60 leading-relaxed font-normal">
                        {alert.message}
                      </div>
                    )}

                    {/* Price & Target Trigger Information */}
                    <div className="flex items-center justify-between gap-2 pt-1 flex-wrap">
                      <div className="text-[11px] font-semibold text-content-muted flex items-center gap-1.5 flex-wrap">
                        <span>{config.priceLabel}:</span>
                        <span className="font-extrabold text-content-primary">
                          ${Number(alert.current_price).toFixed(2)}
                        </span>
                        <span className="text-content-muted/60">•</span>
                        <span>{config.targetLabel}:</span>
                        <span className="font-bold text-warning">
                          ${Number(alert.target_buy_price).toFixed(2)}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-auto">
                        {config.isDiscovery && (
                          <button
                            onClick={(e) => handleAddToWatchlist(e, alert.symbol, alert.id)}
                            disabled={addingSymbols.includes(alert.symbol) || addedSymbols.includes(alert.symbol)}
                            className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold rounded-lg text-[10px] transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50"
                            title={language === 'zh' ? '移至自选股观察池' : 'Move to Watchlist'}
                          >
                            {addedSymbols.includes(alert.symbol) ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                <span>{language === 'zh' ? '已加入自选' : 'Added ✓'}</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
                                <span>{language === 'zh' ? '+ 自选' : '+ Watchlist'}</span>
                              </>
                            )}
                          </button>
                        )}

                        <button
                          onClick={() => handleDeepDive(alert.symbol)}
                          className="px-2.5 py-1 bg-brand hover:opacity-90 text-white font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-sm shrink-0"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{t.viewDeepDive}</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Bar */}
          <div className="p-2.5 bg-surface-subtle border-t border-border-subtle flex items-center justify-between text-[10px] text-content-muted px-4">
            <span>{t.notificationInbox}</span>
            <span>
              {language === 'zh'
                ? '监控来自自选股与精选买入区间'
                : 'Synced from Watchlist & Target Buy Zones'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
