import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, X, Send, CheckCircle2, BellRing, Sun, ShieldAlert, Sparkles, Phone, Copy, ExternalLink, RefreshCw, ShieldCheck, Clock } from 'lucide-react';

interface WhatsAppSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppSettingsModal: React.FC<WhatsAppSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { language, t } = useLanguage();
  const [phoneNumber, setPhoneNumber] = useState<string>('+14165550199');
  const [optinKeyword, setOptinKeyword] = useState<string>('join invest-9821');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('PENDING_OPT_IN');

  const [morningDigest, setMorningDigest] = useState<boolean>(true);
  const [buyAlert, setBuyAlert] = useState<boolean>(true);
  const [sellAlert, setSellAlert] = useState<boolean>(true);

  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const botPhoneNumber = '+14155238886';
  const whatsappDeepLink = `https://wa.me/14155238886?text=${encodeURIComponent(optinKeyword)}`;

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/whatsapp/config');
      if (res.ok) {
        const json = await res.json();
        setPhoneNumber(json.phone_number || '+14165550199');
        setOptinKeyword(json.optin_keyword || 'join invest-9821');
        setIsVerified(json.is_verified || false);
        setVerificationStatus(json.verification_status || 'PENDING_OPT_IN');
        setMorningDigest(json.morning_digest_enabled);
        setBuyAlert(json.buy_alert_enabled);
        setSellAlert(json.sell_alert_enabled);
      }
    } catch (e) {
      console.warn("WhatsApp config fetch error:", e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchConfig();
    }
  }, [isOpen]);

  const copyToClipboard = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSimulateOptIn = async () => {
    setSimulating(true);
    setFeedback(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/whatsapp/verify-simulated', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          optin_keyword: optinKeyword,
          lang: language
        })
      });
      if (res.ok) {
        const json = await res.json();
        setIsVerified(true);
        setVerificationStatus('VERIFIED');
        setFeedback({
          type: 'success',
          message: language === 'zh'
            ? '模拟验证成功！手机号已成功激活 1 对 1 WhatsApp 通知。'
            : 'Simulated Opt-In successful! Phone number verified for WhatsApp alerts.'
        });
      }
    } catch (e) {
      setFeedback({
        type: 'error',
        message: language === 'zh' ? '模拟验证失败。' : 'Simulated opt-in failed.'
      });
    } finally {
      setSimulating(false);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/whatsapp/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone_number: phoneNumber,
          morning_digest_enabled: morningDigest,
          buy_alert_enabled: buyAlert,
          sell_alert_enabled: sellAlert,
          lang: language
        })
      });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: language === 'zh' ? 'WhatsApp 通知设置已保存！' : 'WhatsApp alert settings saved!'
        });
      }
    } catch (e) {
      setFeedback({
        type: 'error',
        message: language === 'zh' ? '保存失败。' : 'Failed to save settings.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSendTestMessage = async () => {
    setTesting(true);
    setFeedback(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_phone: phoneNumber,
          lang: language
        })
      });
      if (res.ok) {
        setFeedback({
          type: 'success',
          message: language === 'zh'
            ? '测试消息已成功推送至 WhatsApp！'
            : 'Test message sent to WhatsApp successfully!'
        });
      }
    } catch (e) {
      setFeedback({
        type: 'error',
        message: language === 'zh' ? '测试消息推送失败。' : 'Failed to send test message.'
      });
    } finally {
      setTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-slate-100">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-slate-400 hover:text-slate-100 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
          <span className="p-3 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl text-slate-950 shadow-md">
            <MessageSquare className="w-6 h-6" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              WhatsApp 1-on-1 Opt-In & Alert Settings
            </h2>
            <p className="text-xs text-slate-400">
              Compliant 2-way opt-in for daily 8:00 AM EST Macro Digest & bundled Watchlist alerts
            </p>
          </div>
        </div>

        {/* Feedback Alert Banner */}
        {feedback && (
          <div className={`p-3.5 rounded-2xl mb-5 text-xs font-semibold flex items-center gap-2 border ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{feedback.message}</span>
          </div>
        )}

        {/* Step 1: Verification Status Badge Card */}
        <div className={`p-4 rounded-2xl border mb-6 ${
          isVerified
            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
            : 'bg-amber-950/40 border-amber-500/40 text-amber-200'
        }`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-extrabold text-xs">
              {isVerified ? (
                <>
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>WhatsApp Verified & Active ({phoneNumber})</span>
                </>
              ) : (
                <>
                  <Clock className="w-5 h-5 text-amber-400 animate-pulse" />
                  <span>Awaiting WhatsApp 1-on-1 Opt-In Message</span>
                </>
              )}
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
              isVerified
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
            }`}>
              {isVerified ? 'VERIFIED' : 'PENDING'}
            </span>
          </div>
        </div>

        {/* Step 2: Opt-In Instructions & Action Deep Link */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 mb-6">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>1-Time WhatsApp Opt-In Instructions</span>
          </h4>

          <div className="space-y-2 mb-4 text-xs text-slate-300">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">1. Bot Phone Number:</span>
              <div className="flex items-center gap-2 font-mono font-bold text-emerald-400">
                <span>{botPhoneNumber}</span>
                <button
                  onClick={() => copyToClipboard(botPhoneNumber, 'phone')}
                  className="p-1 hover:text-slate-100 transition-colors cursor-pointer"
                  title="Copy Phone Number"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">2. Verification Keyword:</span>
              <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                <span>{optinKeyword}</span>
                <button
                  onClick={() => copyToClipboard(optinKeyword, 'keyword')}
                  className="p-1 hover:text-slate-100 transition-colors cursor-pointer"
                  title="Copy Join Keyword"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons: wa.me Deep Link & Simulate Opt-in */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={whatsappDeepLink}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 shadow-md"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Open in WhatsApp App</span>
            </a>

            <button
              onClick={handleSimulateOptIn}
              disabled={simulating}
              className="px-4 py-2.5 bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${simulating ? 'animate-spin' : ''}`} />
              <span>Simulate Opt-In (Dev Test)</span>
            </button>
          </div>
        </div>

        {/* Step 3: Recipient Phone & Alert Toggles */}
        <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          <label className="block text-xs font-bold text-slate-300 mb-2">
            Your WhatsApp Recipient Phone Number
          </label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1 (416) 555-0199"
            className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-mono font-bold text-emerald-300 focus:outline-none focus:border-emerald-500 transition-all"
          />
        </div>

        {/* 3 Alert Mechanism Toggles */}
        <div className="space-y-3 mb-6">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
            Automated Alert Mechanisms
          </label>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-2.5">
              <Sun className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Morning Macro & News Digest (8:00 AM EST)
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Daily macro cycle status, Fed/BoC sentiment & top policy news.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={morningDigest}
              onChange={(e) => setMorningDigest(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-2.5">
              <BellRing className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Bundled Watchlist BUY Zone Alert
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Gathers all Watchlist stocks entering BUY Zone into 1 message.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={buyAlert}
              onChange={(e) => setBuyAlert(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-950/80 rounded-2xl border border-slate-800">
            <div className="flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
              <div>
                <span className="text-xs font-bold text-slate-200 block">
                  Bundled DANGER / SELL Zone Alert
                </span>
                <span className="text-[11px] text-slate-400 block">
                  Gathers all Watchlist stocks entering SELL/stop-loss zones into 1 message.
                </span>
              </div>
            </div>
            <input
              type="checkbox"
              checked={sellAlert}
              onChange={(e) => setSellAlert(e.target.checked)}
              className="w-5 h-5 accent-emerald-500 rounded cursor-pointer"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={handleSendTestMessage}
            disabled={testing || !isVerified}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-emerald-500/30 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'Sending Test...' : 'Send Test WhatsApp Message'}</span>
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSaveConfig}
              disabled={saving}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-extrabold rounded-xl text-xs transition-all shadow-md cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
