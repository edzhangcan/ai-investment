import React, { useState, useEffect } from 'react';
import { X, Bell, Send, CheckCircle2, ShieldCheck, RefreshCw, Sparkles, TrendingUp, AlertTriangle, Newspaper } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchPushAlertConfig,
  savePushAlertConfig,
  testDiscordWebhook,
  testMacroDigestAlert,
  testBundledBuyAlert,
  testSellDangerAlert,
  testGoldNuggetsAlert
} from '../api/client';

interface DiscordAlertSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DiscordAlertSettingsModal: React.FC<DiscordAlertSettingsModalProps> = ({ isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTest, setActiveTest] = useState<string | null>(null);
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
      setToastMessage({ type: 'success', text: t.discordSavedSuccess });
      setTimeout(() => setToastMessage(null), 4000);
    } catch (e: any) {
      setToastMessage({ type: 'error', text: `${t.discordSaveFailed} ${e.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRunTest = async (testType: 'conn' | 'macro' | 'buy' | 'sell' | 'gold') => {
    if (!webhookUrl.trim()) {
      setToastMessage({ type: 'error', text: t.discordEnterUrlFirst });
      return;
    }

    const activeLang = language === 'zh' ? 'zh' : 'en';

    setActiveTest(testType);
    setToastMessage(null);
    try {
      if (testType === 'conn') {
        await testDiscordWebhook(webhookUrl.trim(), activeLang);
        setToastMessage({ type: 'success', text: t.discordConnTestSuccess });
      } else if (testType === 'macro') {
        await testMacroDigestAlert(webhookUrl.trim(), activeLang);
        setToastMessage({ type: 'success', text: t.discordMacroSuccess });
      } else if (testType === 'buy') {
        await testBundledBuyAlert(webhookUrl.trim(), activeLang);
        setToastMessage({ type: 'success', text: t.discordBuySuccess });
      } else if (testType === 'sell') {
        await testSellDangerAlert(webhookUrl.trim(), activeLang);
        setToastMessage({ type: 'success', text: t.discordSellSuccess });
      } else if (testType === 'gold') {
        await testGoldNuggetsAlert(webhookUrl.trim(), activeLang);
        setToastMessage({ type: 'success', text: t.discordGoldSuccess });
      }
      setTimeout(() => setToastMessage(null), 5000);
    } catch (e: any) {
      setToastMessage({ type: 'error', text: `${t.discordDispatchFailed} ${e.message}` });
    } finally {
      setActiveTest(null);
    }
  };

  if (!isOpen) return null;

  const isConfigured = Boolean(webhookUrl.trim() && webhookUrl.startsWith('http'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-extrabold text-slate-100">
                  {t.discordModalTitle}
                </h2>
                <span className="px-2.5 py-0.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-extrabold rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t.discordZeroKycBadge}</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                {t.discordModalSubtitle}
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
            <span>{t.discordGuideTitle}</span>
          </h3>
          <ol className="text-xs text-slate-400 space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>{t.discordGuideStep1}</li>
            <li>{t.discordGuideStep2}</li>
            <li>{t.discordGuideStep3}</li>
          </ol>
        </div>

        {/* Configuration Form */}
        <div className="space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs">
            <span className="text-slate-400 font-medium">{t.discordChannelStatus}</span>
            <span className={`px-3 py-1 rounded-full font-extrabold flex items-center gap-1.5 ${
              isConfigured && isEnabled
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'bg-slate-800 text-slate-400 border border-slate-700'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isConfigured && isEnabled ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
              <span>{isConfigured && isEnabled ? t.discordConnected : t.discordNotConfigured}</span>
            </span>
          </div>

          {/* Webhook URL Input */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-2">
              {t.discordWebhookInputLabel}
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
                {t.discordEnableToggleTitle}
              </div>
              <div className="text-[11px] text-slate-400">
                {t.discordEnableToggleDesc}
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

          {/* Test 4 Multi-Type Dispatchers Grid */}
          <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-indigo-400" />
                <span>{t.discordTestChannelsTitle}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-medium">{t.discordTestChannelsSub}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRunTest('macro')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-purple-500/50 text-purple-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {activeTest === 'macro' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Newspaper className="w-3.5 h-3.5 text-purple-400" />}
                <span className="truncate">{t.discordTestMacroBtn}</span>
              </button>

              <button
                onClick={() => handleRunTest('buy')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/50 text-emerald-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {activeTest === 'buy' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />}
                <span className="truncate">{t.discordTestBuyBtn}</span>
              </button>

              <button
                onClick={() => handleRunTest('sell')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-rose-500/50 text-rose-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {activeTest === 'sell' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
                <span className="truncate">{t.discordTestSellBtn}</span>
              </button>

              <button
                onClick={() => handleRunTest('gold')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 text-amber-300 rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {activeTest === 'gold' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-amber-400" />}
                <span className="truncate">{t.discordTestGoldBtn}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-800">
            <button
              onClick={() => handleRunTest('conn')}
              disabled={Boolean(activeTest) || !isConfigured}
              className="px-3.5 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {activeTest === 'conn' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              ) : (
                <Send className="w-3.5 h-3.5 text-indigo-400" />
              )}
              <span>{t.discordConnTestBtn}</span>
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
              <span>{isSaving ? t.discordSavingBtn : t.discordSaveConfigBtn}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};


