import React, { useState, useEffect } from 'react';
import { Bell, X, Sparkles } from 'lucide-react';
import { getApiBaseUrl } from '../api/client';

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

export const NotificationToast: React.FC<NotificationToastProps> = ({ onSelectTicker }) => {
  const [activeAlerts, setActiveAlerts] = useState<AlertNotificationPayload[]>([]);

  const fetchAlertHistory = async () => {
    try {
      const res = await fetch(`${getApiBaseUrl()}/api/alerts/history`);
      if (res.ok) {
        const json = await res.json();
        if (json && json.length > 0) {
          setActiveAlerts(json.slice(0, 2));
        }
      }
    } catch (e) {
      // Background poll silently fails if offline
    }
  };

  useEffect(() => {
    fetchAlertHistory();
    const interval = setInterval(fetchAlertHistory, 15000); // Check every 15s
    return () => clearInterval(interval);
  }, []);

  const handleDismiss = (id: number) => {
    setActiveAlerts(activeAlerts.filter((a) => a.id !== id));
  };

  if (activeAlerts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-auto animate-bounce-short">
      {activeAlerts.map((alert) => (
        <div
          key={alert.id}
          className="bg-white dark:bg-slate-900 border border-positive rounded-2xl p-4 shadow-2xl flex items-start justify-between gap-3 text-xs z-50 transition-colors duration-150"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 prism-badge-positive rounded-xl shrink-0 mt-0.5">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-sm text-content-primary">${alert.symbol}</span>
                <span className="prism-badge-positive text-[10px]">
                  Target Price Hit!
                </span>
              </div>
              <p className="text-content-secondary font-medium mb-2 leading-relaxed">
                {alert.company_name} entered your Buy Zone! Current: <span className="font-bold text-positive">${alert.current_price}</span> ≤ Target: <span className="font-bold text-warning">${alert.target_buy_price}</span>
              </p>
              <button
                onClick={() => onSelectTicker(alert.symbol)}
                className="px-3 py-1 bg-positive hover:opacity-90 text-white font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3 h-3" />
                <span>立即深度分析 (${alert.symbol})</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(alert.id)}
            aria-label="关闭提醒"
            className="p-1 text-content-muted hover:text-content-primary cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
