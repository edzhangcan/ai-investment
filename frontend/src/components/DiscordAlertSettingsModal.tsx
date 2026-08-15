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
      let res: any;
      if (testType === 'conn') {
        res = await testDiscordWebhook(webhookUrl);
      } else if (testType === 'macro') {
        res = await testMacroDigestAlert(webhookUrl, activeLang);
      } else if (testType === 'buy') {
        res = await testBundledBuyAlert(webhookUrl, activeLang);
      } else if (testType === 'sell') {
        res = await testSellDangerAlert(webhookUrl, activeLang);
      } else if (testType === 'gold') {
        res = await testGoldNuggetsAlert(webhookUrl, activeLang);
      }

      if (res && res.status === 'ok') {
        const msg = testType === 'conn' ? t.discordConnTestSuccess
          : testType === 'macro' ? t.discordMacroSuccess
          : testType === 'buy' ? t.discordBuySuccess
          : testType === 'sell' ? t.discordSellSuccess
          : t.discordGoldSuccess;
        setToastMessage({ type: 'success', text: msg });
      } else {
        setToastMessage({ type: 'error', text: `${t.discordDispatchFailed}: ${res?.error || 'Unknown error'}` });
      }
    } catch (e: any) {
      setToastMessage({ type: 'error', text: `${t.discordDispatchFailed}: ${e.message}` });
    } finally {
      setActiveTest(null);
      setTimeout(() => setToastMessage(null), 5000);
    }
  };

  if (!isOpen) return null;

  const isConfigured = Boolean(webhookUrl.trim() && webhookUrl.startsWith('http'));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 md:p-8 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto z-10 transition-colors duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border-subtle mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 prism-badge-brand rounded-2xl">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-extrabold text-content-primary">
                  {t.discordModalTitle}
                </h2>
                <span className="prism-badge-positive text-[10px] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  <span>{t.discordZeroKycBadge}</span>
                </span>
              </div>
              <p className="text-xs text-content-muted">
                {t.discordModalSubtitle}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toast Feedback */}
        {toastMessage && (
          <div className={`mb-6 p-3 rounded-2xl text-xs font-semibold border flex items-center gap-2 ${
            toastMessage.type === 'success'
              ? 'prism-badge-positive'
              : 'prism-badge-negative'
          }`}>
            <span>{toastMessage.text}</span>
          </div>
        )}

        {/* Setup Guide Banner */}
        <div className="prism-surface-subtle p-4 mb-6 shadow-sm">
          <h3 className="text-xs font-bold text-content-primary mb-2 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand" />
            <span>{t.discordGuideTitle}</span>
          </h3>
          <ol className="text-xs text-content-secondary space-y-1.5 list-decimal list-inside leading-relaxed">
            <li>{t.discordGuideStep1}</li>
            <li>{t.discordGuideStep2}</li>
            <li>{t.discordGuideStep3}</li>
          </ol>
        </div>

        {/* Configuration Form */}
        <div className="space-y-5">
          {/* Status Badge */}
          <div className="flex items-center justify-between p-3 prism-surface-subtle text-xs shadow-sm">
            <span className="text-content-secondary font-medium">{t.discordChannelStatus}</span>
            <span className={`px-3 py-1 rounded-xl font-extrabold flex items-center gap-1.5 ${
              isConfigured && isEnabled
                ? 'prism-badge-positive'
                : 'prism-badge-neutral'
            }`}>
              <span>{isConfigured && isEnabled ? t.discordConnected : t.discordNotConfigured}</span>
            </span>
          </div>

          {/* Webhook URL Input */}
          <div>
            <label className="block text-xs font-bold text-content-primary mb-2">
              {t.discordWebhookInputLabel}
            </label>
            <input
              type="text"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://discord.com/api/webhooks/123456789/AbCdEfGh..."
              className="w-full bg-surface border border-border-subtle rounded-xl px-4 py-2.5 text-xs text-content-primary placeholder:text-content-muted focus:outline-none focus:border-brand transition-all font-mono shadow-sm"
            />
          </div>

          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 prism-surface-subtle shadow-sm">
            <div>
              <div className="text-xs font-bold text-content-primary">
                {t.discordEnableToggleTitle}
              </div>
              <div className="text-[11px] text-content-muted">
                {t.discordEnableToggleDesc}
              </div>
            </div>
            <button
              onClick={() => setIsEnabled(!isEnabled)}
              className={`w-12 h-6 rounded-full transition-all relative p-1 cursor-pointer ${
                isEnabled ? 'bg-positive' : 'bg-surface border border-border-subtle'
              }`}
            >
              <div className={`w-4 h-4 rounded-full bg-white transition-all transform ${
                isEnabled ? 'translate-x-6' : 'translate-x-0'
              }`} />
            </button>
          </div>

          {/* Test 4 Multi-Type Dispatchers Grid */}
          <div className="p-4 prism-surface-subtle space-y-3 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-content-primary uppercase tracking-wider flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5 text-brand" />
                <span>{t.discordTestChannelsTitle}</span>
              </span>
              <span className="text-[10px] text-content-muted font-medium">{t.discordTestChannelsSub}</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleRunTest('macro')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-brand text-brand rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {activeTest === 'macro' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Newspaper className="w-3.5 h-3.5 text-brand" />}
                <span className="truncate">{t.discordTestMacroBtn}</span>
              </button>

              <button
                onClick={() => handleRunTest('buy')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-positive text-positive rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {activeTest === 'buy' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <TrendingUp className="w-3.5 h-3.5 text-positive" />}
                <span className="truncate">{t.discordTestBuyBtn}</span>
              </button>

              <button
                onClick={() => handleRunTest('sell')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-negative text-negative rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {activeTest === 'sell' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <AlertTriangle className="w-3.5 h-3.5 text-negative" />}
                <span className="truncate">{t.discordTestSellBtn}</span>
              </button>

              <button
                onClick={() => handleRunTest('gold')}
                disabled={Boolean(activeTest) || !isConfigured}
                className="p-2.5 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-warning text-warning rounded-xl text-[11px] font-bold transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
              >
                {activeTest === 'gold' ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5 text-warning" />}
                <span className="truncate">{t.discordTestGoldBtn}</span>
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
            <button
              onClick={() => handleRunTest('conn')}
              disabled={Boolean(activeTest) || !isConfigured}
              className="px-3.5 py-2 bg-surface border border-border-subtle hover:border-brand text-brand rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-sm"
            >
              {activeTest === 'conn' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-brand" />
              ) : (
                <Send className="w-3.5 h-3.5 text-brand" />
              )}
              <span>{t.discordConnTestBtn}</span>
            </button>

            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-5 py-2.5 bg-brand hover:opacity-90 text-white font-extrabold rounded-xl text-xs shadow-sm transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
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
