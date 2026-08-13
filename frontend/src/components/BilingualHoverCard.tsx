import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
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
  const triggerRef = useRef<HTMLSpanElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [positionStyle, setPositionStyle] = useState<{
    left: number;
    top?: number;
    bottom?: number;
    width: number;
  }>({ left: 0, top: 0, width: 384 });

  // Resolution order: jargon dictionary key -> custom props
  const dictData = termKey ? (jargonData as Record<string, any>)[termKey] : null;

  const termEn = customEn?.term || dictData?.term_en || "Financial Metric";
  const termZh = customZh?.term || dictData?.term_zh || "金融术语指标";
  const defEn = customEn?.definition || dictData?.definition_en || "Institutional metric definition.";
  const defZh = customZh?.definition || dictData?.definition_zh || "机构级别指标定义与说明。";
  const analogyEn = customEn?.analogy || dictData?.analogy_en;
  const analogyZh = customZh?.analogy || dictData?.analogy_zh;

  const showPopover = isHovered || isOpen;

  useLayoutEffect(() => {
    if (showPopover && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const cardWidth = Math.min(384, window.innerWidth - 32);
      
      // Calculate horizontal center relative to trigger element
      let leftPos = rect.left + rect.width / 2 - cardWidth / 2;
      leftPos = Math.max(16, Math.min(window.innerWidth - cardWidth - 16, leftPos));

      // Calculate space above the trigger
      const spaceAbove = rect.top;

      // Position ABOVE the trigger if there's at least 260px above, otherwise position BELOW
      if (spaceAbove >= 260) {
        // Anchorage: bottom of popover is exactly 8px above trigger's top edge
        const bottomOffset = window.innerHeight - rect.top + 8;
        setPositionStyle({
          left: leftPos,
          bottom: bottomOffset,
          width: cardWidth,
        });
      } else {
        // Anchorage: top of popover is exactly 8px below trigger's bottom edge
        const topOffset = rect.bottom + 8;
        setPositionStyle({
          left: leftPos,
          top: topOffset,
          width: cardWidth,
        });
      }
    }
  }, [showPopover, isHovered, isOpen, language]);

  // Language-based title resolution for trigger text
  const displayTitle = children || (language === 'zh' ? termZh : language === 'hybrid' ? `${termZh} (${termEn})` : termEn);

  const popoverContent = (
    <div
      ref={popoverRef}
      style={{
        position: 'fixed',
        left: `${positionStyle.left}px`,
        ...(positionStyle.bottom !== undefined ? { bottom: `${positionStyle.bottom}px` } : {}),
        ...(positionStyle.top !== undefined ? { top: `${positionStyle.top}px` } : {}),
        width: `${positionStyle.width}px`,
        zIndex: 9999999,
      }}
      className="p-4 bg-slate-900 border-2 border-amber-500/70 rounded-2xl shadow-[0_25px_60px_rgba(0,0,0,0.95)] text-left pointer-events-auto transition-opacity duration-150 animate-fade-in"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Header Badge */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>{language === 'zh' ? termZh : termEn}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/40 font-extrabold uppercase">
          <Globe className="w-3 h-3" />
          <span>{language === 'en' ? 'EN Mode' : language === 'zh' ? '中文模式' : 'Hybrid Mode'}</span>
        </div>
      </div>

      {/* Subtitle Chinese (rendered in zh and hybrid modes) */}
      {language !== 'en' && (
        <div className="text-xs font-bold text-slate-200 mb-2.5 flex items-center gap-1.5">
          <span>🇨🇳 {termZh}</span>
        </div>
      )}

      {/* English Definition (rendered in en and hybrid modes) */}
      {language !== 'zh' && (
        <div className="mb-2.5">
          <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400/90 mb-0.5">🇺🇸 English Definition:</div>
          <p className="text-xs text-slate-100 font-medium leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            {defEn}
          </p>
        </div>
      )}

      {/* Chinese Definition (rendered in zh and hybrid modes) */}
      {language !== 'en' && (
        <div className="mb-2.5">
          <div className="text-[10px] font-bold tracking-wider uppercase text-amber-400/90 mb-0.5">🇨🇳 中文解析：</div>
          <p className="text-xs text-slate-100 font-medium leading-relaxed bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            {defZh}
          </p>
        </div>
      )}

      {/* Everyday Analogy Box */}
      {((language !== 'zh' && analogyEn) || (language !== 'en' && analogyZh)) && (
        <div className="p-3 bg-slate-950 rounded-xl border border-amber-500/40 text-xs text-amber-200 leading-relaxed shadow-md">
          <div className="font-bold text-amber-300 text-xs mb-1 flex items-center gap-1">
            <span>💡 Everyday Analogy / 通俗比喻：</span>
          </div>
          {language !== 'zh' && analogyEn && (
            <p className="mb-1 text-[11px] text-amber-100 font-normal">🇺🇸 {analogyEn}</p>
          )}
          {language !== 'en' && analogyZh && (
            <p className="text-[11px] text-amber-100 font-normal">🇨🇳 {analogyZh}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <span
      ref={triggerRef}
      className="relative inline-block cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={(e) => {
        e.stopPropagation();
        setIsOpen((prev) => !prev);
      }}
    >
      <span
        className={`transition-all inline-flex items-center gap-1 ${
          isPlainTalk
            ? 'border-b-2 border-dashed border-amber-400 font-bold text-amber-300 hover:text-amber-200 px-1.5 py-0.5 bg-amber-950/40 rounded-lg shadow-sm'
            : 'hover:text-emerald-300 border-b border-dashed border-slate-600'
        }`}
      >
        {displayTitle}
        <HelpCircle className={`w-3.5 h-3.5 inline shrink-0 ${isPlainTalk ? 'text-amber-400 animate-pulse' : 'text-slate-400'}`} />
      </span>

      {/* Render popover via React Portal directly into document.body */}
      {showPopover && createPortal(popoverContent, document.body)}
    </span>
  );
};
