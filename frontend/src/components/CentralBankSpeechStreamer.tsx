import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { CentralBankSpeechMetadata, CentralBankSpeechStreamEvent, SpeechSegment } from '../types';
import { fetchCentralBankSpeeches, getSpeechStreamUrl } from '../api/client';
import {
  Play,
  Pause,
  RotateCcw,
  Radio,
  Building2,
  TrendingUp,
  Activity,
  Zap,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Volume2,
  Sliders,
  DollarSign,
  Layers
} from 'lucide-react';

interface CentralBankSpeechStreamerProps {
  country?: 'US' | 'CA';
}

export const CentralBankSpeechStreamer: React.FC<CentralBankSpeechStreamerProps> = ({ country = 'US' }) => {
  const { language } = useLanguage();
  const isZh = language === 'zh';

  const [speeches, setSpeeches] = useState<CentralBankSpeechMetadata[]>([]);
  const [selectedSpeechId, setSelectedSpeechId] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1.5);
  const [streamProgress, setStreamProgress] = useState<number>(0);
  const [segments, setSegments] = useState<SpeechSegment[]>([]);
  const [activeSegment, setActiveSegment] = useState<SpeechSegment | null>(null);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0.0);
  const [stanceDelta, setStanceDelta] = useState<number>(0.0);
  const [finalStance, setFinalStance] = useState<string>('');
  const [marketImplications, setMarketImplications] = useState<any>(null);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);

  const eventSourceRef = useRef<EventSource | null>(null);
  const scrollEndRef = useRef<HTMLDivElement | null>(null);

  // Load available central bank speeches
  useEffect(() => {
    let isMounted = true;
    const loadSpeeches = async () => {
      try {
        const data = await fetchCentralBankSpeeches(country);
        if (isMounted && data.length > 0) {
          setSpeeches(data);
          // Set default selected speech matching current country
          const matched = data.find(s => s.country === country) || data[0];
          setSelectedSpeechId(matched.id);
          resetStreamState();
        }
      } catch (err) {
        console.error('Failed to fetch central bank speeches:', err);
      }
    };
    loadSpeeches();
    return () => {
      isMounted = false;
      stopStream();
    };
  }, [country]);

  // Auto-scroll teleprompter to latest segment
  useEffect(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [segments, activeSegment]);

  const resetStreamState = () => {
    stopStream();
    setSegments([]);
    setActiveSegment(null);
    setStreamProgress(0);
    setCumulativeScore(0.0);
    setStanceDelta(0.0);
    setFinalStance('');
    setMarketImplications(null);
    setIsCompleted(false);
  };

  const stopStream = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    setIsStreaming(false);
  };

  const handleSpeechChange = (speechId: string) => {
    setSelectedSpeechId(speechId);
    resetStreamState();
  };

  const startStream = () => {
    if (!selectedSpeechId) return;
    resetStreamState();
    setIsStreaming(true);

    const streamUrl = getSpeechStreamUrl(selectedSpeechId, speedMultiplier, isZh ? 'zh' : 'en');
    const es = new EventSource(streamUrl);
    eventSourceRef.current = es;

    es.onmessage = (event) => {
      try {
        const data: CentralBankSpeechStreamEvent = JSON.parse(event.data);

        if (data.event_type === 'init') {
          setCumulativeScore(data.baseline_score || 0.0);
        } else if (data.event_type === 'chunk' && data.segment) {
          setActiveSegment(data.segment);
          setSegments(prev => [...prev, data.segment!]);
          setCumulativeScore(data.segment.cumulative_score);
          if (data.progress_pct !== undefined) {
            setStreamProgress(data.progress_pct);
          }
        } else if (data.event_type === 'complete') {
          setIsCompleted(true);
          setStreamProgress(100);
          setCumulativeScore(data.final_score ?? 0.0);
          setStanceDelta(data.stance_delta ?? 0.0);
          setFinalStance(data.final_stance || '');
          setMarketImplications(data.market_implications || null);
          stopStream();
        } else if (data.event_type === 'error') {
          console.error('SSE Stream error:', data.error);
          stopStream();
        }
      } catch (err) {
        console.error('Error parsing SSE event data:', err);
      }
    };

    es.onerror = (err) => {
      console.error('EventSource connection error:', err);
      stopStream();
    };
  };

  const selectedSpeech = speeches.find(s => s.id === selectedSpeechId);

  // Render text with highlighted keywords
  const renderHighlightedText = (text: string, hawkishTerms: string[] = [], dovishTerms: string[] = []) => {
    if (!hawkishTerms.length && !dovishTerms.length) {
      return <span>{text}</span>;
    }

    // Build regex pattern matching any identified term
    const allTerms = [...hawkishTerms, ...dovishTerms].filter(Boolean);
    if (!allTerms.length) return <span>{text}</span>;

    const regex = new RegExp(`(${allTerms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'gi');
    const parts = text.split(regex);

    return (
      <span>
        {parts.map((part, i) => {
          const lowerPart = part.toLowerCase();
          const isHawk = hawkishTerms.some(term => term.toLowerCase() === lowerPart);
          const isDove = dovishTerms.some(term => term.toLowerCase() === lowerPart);

          if (isHawk) {
            return (
              <mark
                key={i}
                className="bg-rose-500/20 text-rose-700 dark:text-rose-300 font-semibold px-1 rounded mx-0.5 border border-rose-500/30"
              >
                {part}
              </mark>
            );
          }
          if (isDove) {
            return (
              <mark
                key={i}
                className="bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-semibold px-1 rounded mx-0.5 border border-emerald-500/30"
              >
                {part}
              </mark>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  // Stance needle position calculation (-1.0 to +1.0 mapped to 0% to 100%)
  const needlePercent = Math.max(0, Math.min(100, ((cumulativeScore + 1.0) / 2.0) * 100));

  return (
    <div className="prism-card p-6 md:p-8 mb-8 transition-all">
      {/* Header and Title */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 mb-6 pb-6 border-b border-border-subtle">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-brand/10 text-brand">
              <Radio className="w-5 h-5 animate-pulse" />
            </span>
            <h3 className="text-lg font-bold text-content-primary">
              {isZh ? '央行利率决议与发言实时流式解析 (NLP 鹰鸽量度)' : 'Central Bank Policy Speech Real-Time NLP Stream'}
            </h3>
            <span className="prism-badge-brand text-xs font-mono font-bold uppercase">
              PL-705 Live
            </span>
          </div>
          <p className="text-xs text-content-muted leading-relaxed">
            {isZh
              ? '实时逐句流式解析美联储 (Fed FOMC) 与加拿大央行 (BoC) 利率决议及新闻发布会讲话，实时计算鹰派/鸽派关键词情绪增量 (Delta) 与大类资产配置影响。'
              : 'Streams live FOMC and Bank of Canada statement transcripts sentence-by-sentence with real-time NLP sentiment decoding, keyword highlighting, and macro asset allocation delta.'}
          </p>
        </div>

        {/* Speech Selector Dropdown */}
        <div className="flex items-center gap-3 w-full lg:w-auto">
          <select
            value={selectedSpeechId}
            onChange={(e) => handleSpeechChange(e.target.value)}
            disabled={isStreaming}
            className="w-full lg:w-72 px-3 py-2 text-xs font-medium rounded-xl border border-border-subtle bg-surface text-content-primary focus:outline-none focus:ring-2 focus:ring-brand/40 transition-all cursor-pointer disabled:opacity-50"
          >
            {speeches.map((s) => (
              <option key={s.id} value={s.id}>
                {s.country === 'CA' ? '🇨🇦' : '🇺🇸'} {s.title} ({s.date})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Control Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 p-3.5 rounded-2xl bg-surface-subtle border border-border-subtle">
        <div className="flex items-center gap-3">
          {!isStreaming ? (
            <button
              onClick={startStream}
              className="px-4 py-2 rounded-xl bg-brand hover:bg-brand/90 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>{isCompleted ? (isZh ? '重新播报分析' : 'Replay Stream') : (isZh ? '开始实时流式解析' : 'Start Live Stream')}</span>
            </button>
          ) : (
            <button
              onClick={stopStream}
              className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Pause className="w-4 h-4 fill-white" />
              <span>{isZh ? '暂停解析' : 'Pause Stream'}</span>
            </button>
          )}

          <button
            onClick={resetStreamState}
            disabled={isStreaming || (!segments.length && !isCompleted)}
            className="p-2 rounded-xl border border-border-subtle bg-surface text-content-muted hover:text-content-primary hover:bg-surface-subtle transition-all cursor-pointer disabled:opacity-40"
            title={isZh ? '重置' : 'Reset'}
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Speed Selector */}
          <div className="flex items-center gap-1.5 ml-2 border-l border-border-subtle pl-3 text-xs text-content-muted font-medium">
            <span>{isZh ? '流速' : 'Speed'}:</span>
            {[1.0, 1.5, 3.0].map((spd) => (
              <button
                key={spd}
                onClick={() => setSpeedMultiplier(spd)}
                disabled={isStreaming}
                className={`px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer ${
                  speedMultiplier === spd
                    ? 'bg-brand text-white'
                    : 'bg-surface text-content-muted hover:text-content-primary'
                } disabled:opacity-50`}
              >
                {spd}x
              </button>
            ))}
          </div>
        </div>

        {/* Live Broadcast Indicator & Progress */}
        <div className="flex items-center gap-4 text-xs">
          {isStreaming && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-600 dark:text-rose-400 font-bold font-mono text-[11px] border border-rose-500/20 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
              {isZh ? '● 正在实时流式转录' : '● LIVE INGESTION'}
            </span>
          )}

          {isCompleted && (
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold font-mono text-[11px] border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              {isZh ? '解析已完成' : 'TRANSCRIPT COMPLETED'}
            </span>
          )}

          <div className="flex items-center gap-2">
            <span className="text-content-muted font-mono">{streamProgress}%</span>
            <div className="w-24 h-2 rounded-full bg-border-subtle overflow-hidden">
              <div
                className="h-full bg-brand transition-all duration-300"
                style={{ width: `${streamProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stream Grid: Teleprompter & Live Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
        {/* Left Teleprompter Box */}
        <div className="lg:col-span-7 flex flex-col h-[380px] rounded-2xl border border-border-subtle bg-surface-subtle p-4 overflow-hidden">
          <div className="flex items-center justify-between pb-3 mb-2 border-b border-border-subtle text-xs text-content-muted font-semibold">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-brand" />
              <span>{selectedSpeech?.speaker || 'Central Banker'}</span>
            </div>
            <span className="font-mono text-[11px]">
              {selectedSpeech?.central_bank} • {selectedSpeech?.date}
            </span>
          </div>

          {/* Scrolling Transcript */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
            {!segments.length && !isStreaming ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-content-muted text-xs p-6">
                <Volume2 className="w-8 h-8 mb-2 opacity-30 text-brand" />
                <p className="font-semibold">{isZh ? '准备就绪' : 'Ready to Stream'}</p>
                <p className="text-[11px] mt-1 max-w-sm">
                  {isZh
                    ? '点击上方 "开始实时流式解析" 按钮，启动中央银行利率发言文本 NLP 逐句扫描。'
                    : 'Click "Start Live Stream" above to start sentence-by-sentence NLP policy stance decoding.'}
                </p>
              </div>
            ) : (
              segments.map((seg) => (
                <div
                  key={seg.index}
                  className="p-3 rounded-xl bg-surface border border-border-subtle/80 shadow-sm transition-all text-xs leading-relaxed"
                >
                  <div className="flex items-center justify-between text-[10px] text-content-muted mb-1 font-mono">
                    <span className="font-bold text-content-primary">{seg.speaker}</span>
                    <span>{seg.timestamp}</span>
                  </div>
                  <div className="text-content-primary font-medium">
                    {renderHighlightedText(seg.text, seg.hawkish_terms, seg.dovish_terms)}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[10px] pt-1.5 border-t border-border-subtle/40">
                    <span className="text-content-muted">{isZh ? '本句倾向' : 'Chunk Stance'}:</span>
                    <span
                      className={`font-mono font-bold ${
                        seg.segment_sentiment > 0.15
                          ? 'text-rose-600 dark:text-rose-400'
                          : seg.segment_sentiment < -0.15
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : 'text-content-muted'
                      }`}
                    >
                      {seg.stance} ({seg.segment_sentiment > 0 ? `+${seg.segment_sentiment}` : seg.segment_sentiment})
                    </span>
                  </div>
                </div>
              ))
            )}
            <div ref={scrollEndRef} />
          </div>
        </div>

        {/* Right Live Hawkish/Dovish Spectrum Gauge */}
        <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl border border-border-subtle bg-surface">
          <div>
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-border-subtle">
              <span className="text-xs font-bold text-content-primary flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-brand" />
                {isZh ? '实时鹰鸽情绪量度' : 'Live Hawkish / Dovish Gauge'}
              </span>
              <span className="text-[11px] text-content-muted font-mono font-semibold">
                Score: {cumulativeScore > 0 ? `+${cumulativeScore}` : cumulativeScore}
              </span>
            </div>

            {/* Visual Gauge Bar */}
            <div className="relative mt-6 mb-8 px-2">
              <div className="h-3 w-full rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-rose-500 opacity-90 shadow-inner"></div>

              {/* Moving Needle */}
              <div
                className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 transition-all duration-300"
                style={{ left: `${needlePercent}%` }}
              >
                <div className="w-5 h-5 rounded-full bg-white dark:bg-slate-900 border-2 border-brand shadow-lg flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-brand"></div>
                </div>
                <div className="text-[10px] font-mono font-extrabold text-brand mt-1 whitespace-nowrap -translate-x-1/4">
                  {cumulativeScore > 0 ? `+${cumulativeScore}` : cumulativeScore}
                </div>
              </div>

              {/* Range Labels */}
              <div className="flex justify-between text-[10px] font-bold text-content-muted mt-5">
                <span className="text-emerald-600 dark:text-emerald-400">
                  {isZh ? '◀ 鸽派宽松 (-1.0)' : '◀ Dovish Easing (-1.0)'}
                </span>
                <span className="text-amber-600 dark:text-amber-400">
                  {isZh ? '中立 (0.0)' : 'Neutral (0.0)'}
                </span>
                <span className="text-rose-600 dark:text-rose-400">
                  {isZh ? '鹰派紧缩 (+1.0) ▶' : 'Hawkish (+1.0) ▶'}
                </span>
              </div>
            </div>

            {/* Metrics Breakdown Cards */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <span className="text-[10px] text-content-muted block">{isZh ? '基准会议前瞻' : 'Meeting Baseline'}</span>
                <span className="text-sm font-bold font-mono text-content-primary">
                  {selectedSpeech?.baseline_score !== undefined
                    ? (selectedSpeech.baseline_score > 0 ? `+${selectedSpeech.baseline_score}` : selectedSpeech.baseline_score)
                    : '0.0'}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
                <span className="text-[10px] text-content-muted block">{isZh ? '政策意向变化 (Δ Delta)' : 'Policy Delta (Δ)'}</span>
                <span
                  className={`text-sm font-bold font-mono ${
                    stanceDelta > 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : stanceDelta < 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : 'text-content-primary'
                  }`}
                >
                  {stanceDelta > 0 ? `+${stanceDelta} (Hawkish Shift)` : (stanceDelta < 0 ? `${stanceDelta} (Dovish Shift)` : '0.0 (Unchanged)')}
                </span>
              </div>
            </div>
          </div>

          {/* Active / Final Policy Stance Callout */}
          <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle/80 flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-brand shrink-0" />
            <div className="text-xs">
              <span className="text-content-muted block text-[10px]">
                {isZh ? '综合政策立场评估' : 'Synthesized Policy Stance'}
              </span>
              <span className="font-bold text-content-primary">
                {finalStance || activeSegment?.stance || (isZh ? '等待流式信号...' : 'Awaiting speech stream...')}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Multi-Asset Institutional Implications (Available during / upon completion) */}
      {marketImplications && (
        <div className="mt-4 pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-brand" />
            <span className="text-xs font-bold text-content-primary">
              {isZh ? '宏观政策对大类资产影响矩阵 (Institutional Market Implications)' : 'Cross-Asset Institutional Market Implications'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-content-primary mb-1">
                <span className="w-2 h-2 rounded-full bg-sky-500"></span>
                <span>{isZh ? '10年期国债收益率' : '10Y Sovereign Yields'}</span>
              </div>
              <p className="text-[11px] text-content-muted leading-relaxed">
                {marketImplications.treasury_yields}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-content-primary mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>{isZh ? '权益市场估值倍数' : 'Equity Multiples (P/E)'}</span>
              </div>
              <p className="text-[11px] text-content-muted leading-relaxed">
                {marketImplications.equity_multiples}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-border-subtle">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-content-primary mb-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span>{isZh ? '汇率与跨境资本 (FX)' : 'USD / CAD FX Impact'}</span>
              </div>
              <p className="text-[11px] text-content-muted leading-relaxed">
                {marketImplications.fx_impact}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-surface-subtle border border-brand/20 bg-brand/5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand mb-1">
                <Layers className="w-3.5 h-3.5" />
                <span>{isZh ? '80/20 杠铃配置策略' : '80/20 Barbell SAA'}</span>
              </div>
              <p className="text-[11px] text-content-secondary leading-relaxed">
                {marketImplications.barbell_strategy}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
