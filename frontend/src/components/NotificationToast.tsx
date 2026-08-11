import React, { useState, useEffect } from 'react';
import { Bell, X, ArrowDownRight, Sparkles } from 'lucide-react';

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
      const res = await fetch('http://127.0.0.1:8000/api/alerts/history');
      if (res.ok) {
        const json = await res.json();
        if (json && json.length > 0) {
          // Take top 2 most recent triggered alerts
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
          className="bg-slate-900/95 border border-emerald-500/60 rounded-2xl p-4 shadow-2xl backdrop-blur-xl flex items-start justify-between gap-3 text-xs ring-1 ring-emerald-500/30"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400 shrink-0 mt-0.5">
              <Bell className="w-4 h-4 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-extrabold text-sm text-slate-100">${alert.symbol}</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Target Price Hit!
                </span>
              </div>
              <p className="text-slate-300 font-medium mb-2 leading-relaxed">
                {alert.company_name} entered your Buy Zone! Current: <span className="font-bold text-emerald-400">${alert.current_price}</span> $\le$ Target: <span className="font-bold text-amber-300">${alert.target_buy_price}</span>
              </p>
              <button
                onClick={() => onSelectTicker(alert.symbol)}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg text-[11px] transition-all flex items-center gap-1 cursor-pointer"
              >
                <Sparkles className="w-3 h-3" />
                <span>立即深度分析 (${alert.symbol})</span>
              </button>
            </div>
          </div>

          <button
            onClick={() => handleDismiss(alert.id)}
            aria-label="关闭提醒"
            className="p-1 text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
