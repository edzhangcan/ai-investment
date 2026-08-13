import React, { useState } from 'react';
import jargonData from '../../data/jargon_dictionary.json';
import { HelpCircle, Sparkles, Globe } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface BilingualHoverCardProps {
  termKey?: string;
  customEn?: {
    term: string;
    definition: string;
    analogy?: string;
  };
  customZh?: {
    term: string;
    definition: string;
    analogy?: string;
  };
  children?: React.ReactNode;
  isPlainTalk?: boolean;
}

export const BilingualHoverCard: React.FC<BilingualHoverCardProps> = ({
  termKey,
  customEn,
  customZh,
  children,
  isPlainTalk = false
}) => {
  const { language } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Resolution order: jargon dictionary key -> custom props
  const dictData = termKey ? (jargonData as Record<string, any>)[termKey] : null;

  const termEn = customEn?.term || dictData?.term_en || "Financial Metric";
  const termZh = customZh?.term || dictData?.term_zh || "金融术语指标";
  const defEn = customEn?.definition || dictData?.definition_en || "Institutional metric definition.";
  const defZh = customZh?.definition || dictData?.definition_zh || "机构级别指标定义与说明。";
  const analogyEn = customEn?.analogy || dictData?.analogy_en;
  const analogyZh = customZh?.analogy || dictData?.analogy_zh;

  const showPopover = isHovered || isOpen;

  // Language-based title resolution for trigger text
  const displayTitle = children || (language === 'zh' ? termZh : language === 'hybrid' ? `${termZh} (${termEn})` : termEn);

  return (
    <span
      className="relative inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        onClick={() => setIsOpen(!isOpen)}
        className={`cursor-pointer transition-all inline-flex items-center gap-1 ${
          isPlainTalk
            ? 'border-b-2 border-dashed border-amber-400 font-bold text-amber-300 hover:text-amber-200 px-1.5 py-0.5 bg-amber-950/40 rounded-lg shadow-sm'
            : 'hover:text-emerald-300 border-b border-dashed border-slate-600'
        }`}
      >
        {displayTitle}
        <HelpCircle className={`w-3.5 h-3.5 inline shrink-0 ${isPlainTalk ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
      </span>

      {/* Interactive Hover Popover Card respecting strict language modes */}
      {showPopover && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50 w-80 md:w-96 p-4 bg-slate-900/95 backdrop-blur-xl border border-amber-500/40 rounded-2xl shadow-2xl text-left pointer-events-none transition-all">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{language === 'zh' ? termZh : termEn}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30 font-extrabold uppercase">
              <Globe className="w-3 h-3" />
              <span>{language === 'en' ? 'EN Mode' : language === 'zh' ? '中文模式' : 'Hybrid Mode'}</span>
            </div>
          </div>

          {/* Subtitle Chinese (rendered in zh and hybrid modes) */}
          {language !== 'en' && (
            <div className="text-xs font-bold text-slate-200 mb-3 flex items-center gap-1.5">
              <span>🇨🇳 {termZh}</span>
            </div>
          )}

          {/* English Definition (rendered in en and hybrid modes) */}
          {language !== 'zh' && (
            <div className="mb-2.5">
              <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">🇺🇸 English Definition:</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {defEn}
              </p>
            </div>
          )}

          {/* Chinese Definition (rendered in zh and hybrid modes) */}
          {language !== 'en' && (
            <div className="mb-3">
              <div className="text-[10px] font-semibold tracking-wider uppercase text-slate-400 mb-0.5">🇨🇳 中文解析：</div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                {defZh}
              </p>
            </div>
          )}

          {/* Everyday Analogy Box */}
          {((language !== 'zh' && analogyEn) || (language !== 'en' && analogyZh)) && (
            <div className="p-3 bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/40 rounded-xl border border-amber-500/30 text-xs text-amber-200 leading-relaxed">
              <div className="font-bold text-amber-300 text-xs mb-1 flex items-center gap-1">
                <span>💡 Everyday Analogy / 通俗比喻：</span>
              </div>
              {language !== 'zh' && analogyEn && (
                <p className="mb-1 text-[11px] text-amber-200/90 font-normal">🇺🇸 {analogyEn}</p>
              )}
              {language !== 'en' && analogyZh && (
                <p className="text-[11px] text-amber-200/90 font-normal">🇨🇳 {analogyZh}</p>
              )}
            </div>
          )}
        </div>
      )}
    </span>
  );
};
