import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageMode } from '../i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { mode: LanguageMode; label: string; flag: string; badge: string }[] = [
    { mode: 'en', label: 'English (Default)', flag: '🇺🇸', badge: 'EN' },
    { mode: 'zh', label: '简体中文', flag: '🇨🇳', badge: '中文' },
    { mode: 'hybrid', label: '混合模式 (Hybrid)', flag: '🔀', badge: '中/英' }
  ];

  const currentOpt = options.find((o) => o.mode === language) || options[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-sky-500/50 dark:hover:border-emerald-500/50 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        title="Switch Interface Language (切换系统语言)"
      >
        <Globe className="w-3.5 h-3.5 text-sky-600 dark:text-emerald-400" />
        <span className="flex items-center gap-1">
          <span>{currentOpt.flag}</span>
          <span className="font-bold text-slate-900 dark:text-slate-100">{currentOpt.badge}</span>
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900/95 border border-slate-200 dark:border-slate-700/90 rounded-2xl shadow-xl dark:shadow-2xl backdrop-blur-xl z-50 py-1.5 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Language / 语言模式
          </div>
          {options.map((opt) => {
            const isSelected = opt.mode === language;
            return (
              <button
                key={opt.mode}
                onClick={() => {
                  setLanguage(opt.mode);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-50 dark:bg-emerald-500/10 text-sky-600 dark:text-emerald-400 font-bold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span>{opt.flag}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-sky-600 dark:text-emerald-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
