import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../api/client';
import { useLanguage } from '../context/LanguageContext';

export interface AlertNotificationPayload {
  id: number;
  symbol: string;
  company_name: string;
  current_price: number;
  target_buy_price: number;
  message: string;
}

interface NotificationToastProps {
  onSelectTicker: (symbol: string) => void;
}

const SESSION_DISMISSED_IDS_KEY = 'prism_loop_session_dismissed_alert_ids';
const SESSION_DISMISSED_SYMBOLS_KEY = 'prism_loop_session_dismissed_alert_symbols';

const getDismissedIds = (): Set<number> => {
  try {
    const raw = sessionStorage.getItem(SESSION_DISMISSED_IDS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};

const getDismissedSymbols = (): Set<string> => {
  try {
    const raw = sessionStorage.getItem(SESSION_DISMISSED_SYMBOLS_KEY);
    if (!raw) return new Set();
    const arr = JSON.parse(raw);
    return new Set(Array.isArray(arr) ? arr.map((s: string) => String(s).toUpperCase()) : []);
  } catch {
    return new Set();
  }
};

const dismissAlertForSession = (id: number, symbol?: string) => {
  try {
    const ids = getDismissedIds();
    ids.add(id);
    sessionStorage.setItem(SESSION_DISMISSED_IDS_KEY, JSON.stringify(Array.from(ids)));

    if (symbol) {
      const symbols = getDismissedSymbols();
      symbols.add(symbol.toUpperCase());
      sessionStorage.setItem(SESSION_DISMISSED_SYMBOLS_KEY, JSON.stringify(Array.from(symbols)));
    }
  } catch {
    // Graceful fallback if sessionStorage is blocked
  }
};

export const NotificationToast: React.FC<NotificationToastProps> = ({ onSelectTicker }) => {
  const { t } = useLanguage();
  const [activeAlerts, setActiveAlerts] = useState<AlertNotificationPayload[]>([]);

  const isAlertDismissed = useCallback((alert: AlertNotificationPayload): boolean => {
    const dismissedIds = getDismissedIds();
    const dismissedSymbols = getDismissedSymbols();
    if (dismissedIds.has(alert.id)) return true;
    if (alert.symbol && dismissedSymbols.has(alert.symbol.toUpperCase())) return true;
    return false;
  }, []);

  const fetchAlertHistory = useCallback(async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/alerts/history`);
      if (res.ok) {
        const json: AlertNotificationPayload[] = await res.json();
        if (json && Array.isArray(json) && json.length > 0) {
          const visible = json.filter((a) => !isAlertDismissed(a));
          setActiveAlerts(visible.slice(0, 2));
        } else {
          setActiveAlerts([]);
        }
      }
    } catch {
      // Background poll silently fails if offline
    }
  }, [isAlertDismissed]);

  useEffect(() => {
    fetchAlertHistory();
    const interval = setInterval(fetchAlertHistory, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, [fetchAlertHistory]);

  const handleDismiss = (alert: AlertNotificationPayload) => {
    dismissAlertForSession(alert.id, alert.symbol);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alert.id && a.symbol !== alert.symbol));
  };

  const handleDeepDive = (alert: AlertNotificationPayload) => {
    // 1. Suppress this alert and ticker from triggering again during this session
    dismissAlertForSession(alert.id, alert.symbol);
    setActiveAlerts((prev) => prev.filter((a) => a.id !== alert.id && a.symbol !== alert.symbol));
    // 2. Open single-stock deep dive
    onSelectTicker(alert.symbol);
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-auto animate-bounce-short">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-white dark:bg-slate-900 border border-positive/80 rounded-2xl p-4 shadow-2xl flex items-start justify-between gap-3 text-xs z-50 transition-colors duration-150"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 prism-badge-positive rounded-xl shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-sm text-content-primary">${alert.symbol}</span>
                <span className="prism-badge-positive text-[10px]">
                  {t.toastTargetHit || 'Target Price Hit!'}
                </span>
              </div>
              <p className="text-content-secondary font-medium mb-2 leading-relaxed">
                {alert.company_name} {t.toastEnteredBuyZone || 'entered your Buy Zone! Live:'}{' '}
                <span className="font-bold text-positive">${alert.current_price}</span>{' '}
                {t.toastTargetLabel || '≤ Target:'}{' '}
                <span className="font-bold text-warning">${alert.target_buy_price}</span>
              </p>
              <button
                onClick={() => handleDeepDive(alert)}
                className="px-3 py-1 bg-positive hover:opacity-90 text-white font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                <span>
                  {t.toastDeepDiveBtn ? `${t.toastDeepDiveBtn} ($${alert.symbol})` : `立即深度分析 ($${alert.symbol})`}
                </span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(alert)}
            aria-label={t.toastCloseAria || 'Dismiss alert'}
            className="p-1 text-content-muted hover:text-content-primary rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
