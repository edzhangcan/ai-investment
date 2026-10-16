import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, X, Sparkles, RefreshCw, Trash2, CheckCircle2, ArrowRight } from 'lucide-react';
import {
  fetchAlertHistoryApi,
  deleteAlertHistoryItemApi,
  clearAllAlertHistoryApi,
  triggerPriceAlertCheckApi
} from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export interface AlertNotificationItem {
  id: number;
  symbol: string;
  company_name: string;
  current_price: number;
  target_buy_price: number;
  message?: string;
  triggered_at?: string;
  notification_channel?: string;
}

interface NotificationCenterProps {
  onSelectTicker: (symbol: string) => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ onSelectTicker }) => {
  const { t, language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertNotificationItem[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

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
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 md:w-[420px] bg-white dark:bg-slate-900 border border-border-subtle rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 slide-in-from-top-2 duration-150">
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
              alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="p-3.5 hover:bg-surface-subtle transition-colors group relative flex flex-col gap-2"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-content-primary tracking-tight">
                        ${alert.symbol}
                      </span>
                      <span className="prism-badge-positive text-[10px] px-2 py-0.5 font-bold">
                        {t.toastTargetHit}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
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

                  {/* Price & Target Trigger Information */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="text-[11px] font-semibold text-content-muted flex items-center gap-1.5">
                      <span>{t.toastEnteredBuyZone}</span>
                      <span className="font-extrabold text-positive">
                        ${Number(alert.current_price).toFixed(2)}
                      </span>
                      <span>{t.toastTargetLabel}</span>
                      <span className="font-bold text-warning">
                        ${Number(alert.target_buy_price).toFixed(2)}
                      </span>
                    </div>

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
              ))
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
