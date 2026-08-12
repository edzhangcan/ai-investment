import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { MessageSquare, X, Send, CheckCircle2, BellRing, Sun, ShieldAlert, Sparkles, Phone, Copy, ExternalLink, RefreshCw, ShieldCheck, Clock, FileText, AlertTriangle } from 'lucide-react';

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
  const [botPhoneNumber, setBotPhoneNumber] = useState<string>('+14155238886');
  const [optinKeyword, setOptinKeyword] = useState<string>('join invest-9821');
  const [twilioAccountSid, setTwilioAccountSid] = useState<string>('');
  const [twilioAuthToken, setTwilioAuthToken] = useState<string>('');
  const [isVerified, setIsVerified] = useState<boolean>(false);
  const [verificationStatus, setVerificationStatus] = useState<string>('PENDING_OPT_IN');

  const [selectedMessageType, setSelectedMessageType] = useState<string>('TEST_VERIFICATION');
  const [morningDigest, setMorningDigest] = useState<boolean>(true);
  const [buyAlert, setBuyAlert] = useState<boolean>(true);
  const [sellAlert, setSellAlert] = useState<boolean>(true);

  const [saving, setSaving] = useState<boolean>(false);
  const [testing, setTesting] = useState<boolean>(false);
  const [simulating, setSimulating] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string; details?: any } | null>(null);

  const cleanBotPhone = botPhoneNumber.replace(/[^0-9]/g, '');
  const whatsappDeepLink = `https://wa.me/${cleanBotPhone}?text=${encodeURIComponent(optinKeyword)}`;

  const fetchConfig = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/whatsapp/config');
      if (res.ok) {
        const json = await res.json();
        setPhoneNumber(json.phone_number || '+14165550199');
        setBotPhoneNumber(json.bot_phone_number || '+14155238886');
        setOptinKeyword(json.optin_keyword || 'join invest-9821');
        setTwilioAccountSid(json.twilio_account_sid || '');
        setTwilioAuthToken(json.twilio_auth_token || '');
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
            : 'Simulated Opt-In successful! Phone number verified for WhatsApp alerts.',
          details: json
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
          bot_phone_number: botPhoneNumber,
          optin_keyword: optinKeyword,
          twilio_account_sid: twilioAccountSid,
          twilio_auth_token: twilioAuthToken,
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

  const handleSendTestMessage = async (msgType?: string) => {
    const targetType = msgType || selectedMessageType;
    setTesting(true);
    setFeedback(null);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/whatsapp/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipient_phone: phoneNumber,
          message_type: targetType,
          lang: language
        })
      });
      if (res.ok) {
        const json = await res.json();
        const delivery = json.delivery_details?.delivery;
        const sid = json.delivery_details?.sid;

        if (delivery === 'TWILIO_DELIVERED') {
          setFeedback({
            type: 'success',
            message: `✅ Pushed live to phone via Twilio! Message SID: ${sid}`,
            details: json
          });
        } else if (delivery === 'TWILIO_FAILED') {
          setFeedback({
            type: 'error',
            message: `❌ Twilio API Error: ${json.delivery_details?.error || 'Failed to dispatch'}`,
            details: json
          });
        } else {
          setFeedback({
            type: 'info',
            message: `ℹ️ Dispatched payload in Mock Mode. (Add Twilio Account SID & Auth Token to push directly to physical phone)`,
            details: json
          });
        }
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
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative text-slate-100">
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
              WhatsApp 1-on-1 Opt-In & Alert Controls
            </h2>
            <p className="text-xs text-slate-400">
              Select alert payload type, test live dispatch, and manage 2-way verification settings
            </p>
          </div>
        </div>

        {/* Feedback & Result Inspector Banner */}
        {feedback && (
          <div className={`p-4 rounded-2xl mb-6 text-xs font-semibold border space-y-2 ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : feedback.type === 'info'
              ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}>
            <div className="flex items-center gap-2 font-bold">
              {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
              <span>{feedback.message}</span>
            </div>

            {/* Render Sent Message Text Preview if available */}
            {feedback.details?.message_body && (
              <div className="bg-slate-950/90 p-3 rounded-xl border border-slate-800 text-[11px] font-mono text-slate-300 whitespace-pre-wrap max-h-40 overflow-y-auto mt-2">
                <div className="text-[10px] text-slate-500 font-extrabold uppercase mb-1 flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  <span>Dispatched Message Body Preview:</span>
                </div>
                {feedback.details.message_body}
              </div>
            )}
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

        {/* Step 2: Test Payload Type Selection Grid */}
        <div className="mb-6 bg-slate-950/80 p-5 rounded-2xl border border-slate-800">
          <label className="text-xs font-extrabold uppercase tracking-wider text-slate-300 block mb-3 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Select WhatsApp Alert Payload to Push</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {/* Payload 1: Morning 8:00 AM Digest */}
            <button
              onClick={() => { setSelectedMessageType('MORNING_DIGEST'); handleSendTestMessage('MORNING_DIGEST'); }}
              disabled={testing || !isVerified}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                selectedMessageType === 'MORNING_DIGEST'
                  ? 'bg-amber-500/10 border-amber-500/50 text-amber-200'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-slate-100">🌅 8:00 AM Macro Digest</span>
                <span className="text-[11px] text-slate-400">Daily cycle status, Fed stance & top news.</span>
              </div>
            </button>

            {/* Payload 2: Bundled Buy Zone Alert */}
            <button
              onClick={() => { setSelectedMessageType('BUNDLED_BUY_ALERT'); handleSendTestMessage('BUNDLED_BUY_ALERT'); }}
              disabled={testing || !isVerified}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                selectedMessageType === 'BUNDLED_BUY_ALERT'
                  ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-200'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <BellRing className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-slate-100">🟢 Bundled BUY Zone Alert</span>
                <span className="text-[11px] text-slate-400">Bundles all Watchlist buy stocks into 1 msg.</span>
              </div>
            </button>

            {/* Payload 3: Bundled Sell Zone Alert */}
            <button
              onClick={() => { setSelectedMessageType('BUNDLED_SELL_ALERT'); handleSendTestMessage('BUNDLED_SELL_ALERT'); }}
              disabled={testing || !isVerified}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                selectedMessageType === 'BUNDLED_SELL_ALERT'
                  ? 'bg-rose-500/10 border-rose-500/50 text-rose-200'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-slate-100">🔴 Bundled SELL Zone Alert</span>
                <span className="text-[11px] text-slate-400">Bundles stop-loss / risk stocks into 1 msg.</span>
              </div>
            </button>

            {/* Payload 4: Instant Verification Test */}
            <button
              onClick={() => { setSelectedMessageType('TEST_VERIFICATION'); handleSendTestMessage('TEST_VERIFICATION'); }}
              disabled={testing || !isVerified}
              className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 ${
                selectedMessageType === 'TEST_VERIFICATION'
                  ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-200'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
              }`}
            >
              <Send className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-bold block text-slate-100">⚡ Instant Test Message</span>
                <span className="text-[11px] text-slate-400">Verifies recipient connection.</span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 3: Opt-In Instructions & Action Deep Link */}
        <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 mb-6">
          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Twilio Sandbox & Opt-In Configuration</span>
          </h4>

          <div className="space-y-2 mb-4 text-xs text-slate-300">
            <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-400">1. Twilio Bot Number:</span>
              <div className="flex items-center gap-2 font-mono font-bold text-emerald-400">
                <input
                  type="text"
                  value={botPhoneNumber}
                  onChange={(e) => setBotPhoneNumber(e.target.value)}
                  placeholder="+14155238886"
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-emerald-400 font-mono font-bold focus:outline-none focus:border-emerald-500"
                />
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
              <span className="text-slate-400">2. Twilio Sandbox Keyword:</span>
              <div className="flex items-center gap-2 font-mono font-bold text-amber-300">
                <input
                  type="text"
                  value={optinKeyword}
                  onChange={(e) => setOptinKeyword(e.target.value)}
                  placeholder="join code-bear"
                  className="bg-slate-950 border border-slate-700 rounded px-2 py-0.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-amber-400"
                />
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

        {/* Step 4: Recipient Phone & Twilio Credentials */}
        <div className="mb-6 bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5">
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

          <div className="pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Twilio API Credentials (Optional for Live SMS Delivery)</span>
              </label>
              <span className="text-[10px] text-slate-500 font-mono">🔒 Stored in Local SQLite</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Twilio Account SID</span>
                <input
                  type="password"
                  value={twilioAccountSid}
                  onChange={(e) => setTwilioAccountSid(e.target.value)}
                  placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Twilio Auth Token</span>
                <input
                  type="password"
                  value={twilioAuthToken}
                  onChange={(e) => setTwilioAuthToken(e.target.value)}
                  placeholder="••••••••••••••••••••••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-800">
          <button
            onClick={() => handleSendTestMessage()}
            disabled={testing || !isVerified}
            className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 font-extrabold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-emerald-500/30 cursor-pointer disabled:opacity-40"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{testing ? 'Pushing WhatsApp Payload...' : 'Push Selected WhatsApp Alert'}</span>
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
