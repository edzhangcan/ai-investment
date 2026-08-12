import React, { useState, useEffect } from 'react';
import { X, Bell, Send, CheckCircle2, ShieldCheck, ExternalLink, RefreshCw, AlertCircle } from 'lucide-react';
import { fetchPushAlertConfig, savePushAlertConfig, testDiscordWebhook } from '../api/client';

interface DiscordAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordAlertSettingsModal: React.FC<DiscordAlertSettingsModalProps> = ({ isOpen, onClose }) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    loadConfig();
  }, [isOpen]);

  const loadConfig = async () => {
    setIsLoading(true);
    try {
      const data = await fetchPushAlertConfig();
      setWebhookUrl(data.discord_webhook_url || '');
      setIsEnabled(data.is_discord_enabled || false);
    } catch (e) {
      console.warn("Failed to load Discord push alert config:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setToastMessage(null);
    try {
      await savePushAlertConfig(webhookUrl, isEnabled);
      setToastMessage({ type: 'success', text: '✅ Discord Webhook configuration saved successfully!' });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: any) {
      setToastMessage({ type: 'error', text: `❌ Save failed: ${e.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!webhookUrl.trim()) {
      setToastMessage({ type: 'error', text: '⚠️ Please enter a valid Discord Webhook URL first.' });
      return;
    }

    setIsTesting(true);
    setToastMessage(null);
    try {
      await testDiscordWebhook(webhookUrl.trim());
      setToastMessage({ type: 'success', text: '🚀 Test alert sent! Check your Discord channel.' });
      setTimeout(() => setToastMessage(null), 5000);
    } catch (e: any) {
      setToastMessage({ type: 'error', text: `❌ Test failed: ${e.message}` });
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  const isConfigured = Boolean(webhookUrl.trim() && webhookUrl.startsWith('http'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-100">
                  Discord Push Alerts
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Zero-KYC</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Receive real-time Watchlist Buy-Zone alerts directly in your Discord server.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className={`mb-6 p-3 rounded-2xl text-xs font-semibold border flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
          }`}>
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Setup Guide Banner */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4 mb-6">
          <h3 className="text-xs font-bold text-slate-200 mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-indigo-400" />
            <span>30-Second Discord Setup Guide</span>
          </h3>
          <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>Open Discord $\rightarrow$ Channel Settings (⚙️) $\rightarrow$ <strong>Integrations</strong>.</li>
            <li>Click <strong>Webhooks</strong> $\rightarrow$ <strong>New Webhook</strong>.</li>
            <li>Click <strong>Copy Webhook URL</strong> and paste it below.</li>
          </ol>
        </div>

        {/* Configuration Form */}
        <div className="space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs">
            <span className="text-slate-400 font-medium">Channel Status:</span>
            <span className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 ${
              isConfigured && isEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConfigured && isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isConfigured && isEnabled ? 'Discord Connected' : 'Not Configured'}</span>
            </span>
          </div>

          {/* Webhook URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              Discord Webhook URL
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/123456789/AbCdEfGh..."
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-all font-mono"
            />
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-slate-950/60 border border-slate-800 rounded-2xl">
            <div>
              <div className="text-xs font-bold text-slate-200">
                Enable Discord Webhook Alerts
              </div>
              <div className="text-[11px] text-slate-400">
                Automatically dispatch rich embeds when Watchlist stocks hit Target Buy Prices.
              </div>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`w-12 h-6 rounded-full transition-all relative p-1 ${
                isEnabled ? 'bg-emerald-500' : 'bg-slate-800'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              onClick={handleTestNotification}
              disabled={isTesting || !webhookUrl.trim()}
              className="px-4 py-2.5 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isTesting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
              ) : (
                <Send className="w-4 h-4 text-indigo-400" />
              )}
              <span>{isTesting ? 'Sending Test...' : 'Send Test Alert'}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSaving ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save Configuration'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
