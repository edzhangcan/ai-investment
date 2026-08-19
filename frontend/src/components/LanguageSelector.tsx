import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { LanguageMode } from '../i18n/translations';
import { Globe, ChevronDown, Check } from 'lucide-react';

export const LanguageSelector: React.FC = () => {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const options: { mode: LanguageMode; label: string; badge: string }[] = [
    { mode: 'en', label: 'English (Default)', badge: 'EN' },
    { mode: 'zh', label: '简体中文', badge: '中' },
    { mode: 'hybrid', label: '混合模式 (Hybrid)', badge: '中/EN' }
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
        className="h-8 px-3 bg-surface hover:bg-surface-subtle border border-border-subtle hover:border-brand rounded-xl text-xs font-semibold text-content-primary inline-flex items-center gap-2 transition-all cursor-pointer shadow-sm"
        title="Switch Interface Language (切换系统语言)"
      >
        <Globe className="w-3.5 h-3.5 text-brand" />
        <span className="font-bold text-content-primary">{currentOpt.badge}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-content-muted transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 py-1.5 animate-fade-in">
          <div className="px-3 py-1.5 border-b border-border-subtle text-[10px] font-bold text-content-muted uppercase tracking-wider">
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
                    ? 'prism-badge-brand'
                    : 'text-content-secondary hover:bg-surface-subtle hover:text-content-primary'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="prism-badge-neutral text-[10px]">{opt.badge}</span>
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-brand" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
