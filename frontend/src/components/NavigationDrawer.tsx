import React, { useEffect } from 'react';
import {
  X,
  Star,
  Bell,
  Sliders,
  Calculator,
  Command,
  ChevronRight,
  User,
  LayoutDashboard,
  Sparkles,
  LineChart,
  Sun,
  Moon,
  Globe,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { PrismLoopLogo } from './PrismLoopLogo';
import { LanguageMode } from '../i18n/translations';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  // Module launchers
  onOpenWatchlist: () => void;
  onOpenDiscord: () => void;
  onOpenValuationSettings: () => void;
  onOpenCalculator: () => void;
  onOpenCommandPalette: () => void;
  // Navigation tabs
  activeTab: 'macro' | 'picks' | 'stock';
  onSelectTab: (tab: 'macro' | 'picks' | 'stock') => void;
  currentTicker: string;
  // Badges & Metrics
  watchlistCount: number;
  // Macro jurisdiction
  macroCountry?: 'US' | 'CA';
  onSelectMacroCountry?: (country: 'US' | 'CA') => void;
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  onOpenWatchlist,
  onOpenDiscord,
  onOpenValuationSettings,
  onOpenCalculator,
  onOpenCommandPalette,
  activeTab,
  onSelectTab,
  currentTicker,
  watchlistCount,
  macroCountry = 'US',
  onSelectMacroCountry,
}) => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isDark = theme === 'dark';

  const languageOptions: { mode: LanguageMode; label: string; badge: string }[] = [
    { mode: 'en', label: 'English', badge: 'EN' },
    { mode: 'zh', label: '简体中文', badge: '中' },
    { mode: 'hybrid', label: '混合 (Hybrid)', badge: '中/EN' }
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-fade-in flex justify-start"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nav-drawer-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 h-full p-5 sm:p-6 shadow-2xl flex flex-col justify-between overflow-y-auto z-10 transition-colors duration-150 animate-in slide-in-from-left duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="space-y-6">
          {/* Drawer Top Header: Logo + Close Button */}
          <div className="flex items-center justify-between border-b border-border-subtle pb-4">
            <div className="flex items-center gap-3">
              <PrismLoopLogo size="md" className="hover:scale-105 transition-transform duration-200" />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="text-lg font-black tracking-tight text-content-primary">
                    PRISM
                  </span>
                  <span className="text-lg font-black tracking-tight text-brand">
                    LOOP
                  </span>
                </div>
                <span className="text-[10px] font-medium text-content-muted tracking-wide mt-0.5">
                  {t.navDrawerSubtitle}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label={t.navCloseDrawer}
              className="p-1.5 text-content-muted hover:text-content-primary hover:bg-surface-subtle rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Section 1: Member Profile & Auth Area (Reserved for Issue #36) */}
          <div className="p-3.5 bg-surface-subtle border border-border-subtle rounded-2xl flex items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-brand/10 text-brand flex items-center justify-center font-bold text-xs shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-content-primary">
                    {t.navGuestAnalyst}
                  </span>
                  <span className="px-1.5 py-0.5 rounded-md bg-positive/10 text-positive text-[9px] font-extrabold uppercase">
                    {t.navFreeTier}
                  </span>
                </div>
                <p className="text-[10px] text-content-muted mt-0.5">
                  {t.navSignInPlaceholder}
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Core Workstation Modules (5 Tools with Multi-Color Signatures) */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase text-content-muted tracking-wider px-1">
              {t.navCoreModules}
            </div>

            {/* 1. Watchlist & Price Alerts (Amber Gold) */}
            <button
              onClick={() => {
                onClose();
                onOpenWatchlist();
              }}
              className="w-full group flex items-center justify-between p-3 rounded-2xl border border-amber-200 dark:border-amber-800/60 bg-amber-50/70 dark:bg-amber-950/30 hover:bg-amber-100/70 dark:hover:bg-amber-900/40 text-left transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400 shrink-0">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-600 dark:text-amber-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-amber-950 dark:text-amber-200">
                      {t.watchlistTitle}
                    </span>
                    {watchlistCount > 0 && (
                      <span className="min-w-[18px] h-[18px] px-1.5 flex items-center justify-center bg-amber-600 text-white text-[10px] font-black rounded-md shadow-sm">
                        {watchlistCount}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-amber-800/80 dark:text-amber-400/80 mt-0.5">
                    {t.navWatchlistDesc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-600 dark:text-amber-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* 2. Discord Push Alerts (Indigo Violet) */}
            <button
              onClick={() => {
                onClose();
                onOpenDiscord();
              }}
              className="w-full group flex items-center justify-between p-3 rounded-2xl border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/30 hover:bg-indigo-100/70 dark:hover:bg-indigo-900/40 text-left transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 shrink-0">
                  <Bell className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-indigo-950 dark:text-indigo-200">
                    {t.discordButtonTitle}
                  </span>
                  <p className="text-[10px] text-indigo-800/80 dark:text-indigo-400/80 mt-0.5">
                    {t.navDiscordDesc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* 3. Valuation Range & MoS Settings (Purple) */}
            <button
              onClick={() => {
                onClose();
                onOpenValuationSettings();
              }}
              className="w-full group flex items-center justify-between p-3 rounded-2xl border border-purple-200 dark:border-purple-800/60 bg-purple-50/70 dark:bg-purple-950/30 hover:bg-purple-100/70 dark:hover:bg-purple-900/40 text-left transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-purple-100 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400 shrink-0">
                  <Sliders className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-purple-950 dark:text-purple-200">
                    {t.settingsButtonTitle}
                  </span>
                  <p className="text-[10px] text-purple-800/80 dark:text-purple-400/80 mt-0.5">
                    {t.navValuationDesc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-purple-600 dark:text-purple-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* 4. Position Sizing & Kelly Calculator (Emerald Green) */}
            <button
              onClick={() => {
                onClose();
                onOpenCalculator();
              }}
              className="w-full group flex items-center justify-between p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/70 dark:bg-emerald-950/30 hover:bg-emerald-100/70 dark:hover:bg-emerald-900/40 text-left transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 shrink-0">
                  <Calculator className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <span className="text-xs font-extrabold text-emerald-950 dark:text-emerald-200">
                    {t.calcButtonTitle}
                  </span>
                  <p className="text-[10px] text-emerald-800/80 dark:text-emerald-400/80 mt-0.5">
                    {t.navCalcDesc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>

            {/* 5. Command Palette (Sky Blue) */}
            <button
              onClick={() => {
                onClose();
                onOpenCommandPalette();
              }}
              className="w-full group flex items-center justify-between p-3 rounded-2xl border border-sky-200 dark:border-sky-800/60 bg-sky-50/70 dark:bg-sky-950/30 hover:bg-sky-100/70 dark:hover:bg-sky-900/40 text-left transition-all cursor-pointer shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-sky-100 dark:bg-sky-900/50 text-sky-600 dark:text-sky-400 shrink-0">
                  <Command className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:scale-110 transition-transform" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-sky-950 dark:text-sky-200">
                      {t.commandPaletteTitle}
                    </span>
                    <span className="px-1.5 py-0.5 bg-surface border border-border-subtle text-[9px] font-mono font-bold text-content-muted rounded shadow-2xs">
                      Ctrl+K
                    </span>
                  </div>
                  <p className="text-[10px] text-sky-800/80 dark:text-sky-400/80 mt-0.5">
                    {t.navCommandDesc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-sky-600 dark:text-sky-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </button>
          </div>

          {/* Section 3: Research Perspectives (3-Tab Quick Jump) */}
          <div className="space-y-2">
            <div className="text-[10px] font-black uppercase text-content-muted tracking-wider px-1">
              {t.navQuickTabs}
            </div>

            <div className="grid grid-cols-1 gap-2">
              {/* Tab 1: Macro Dashboard with US / CA Selection */}
              <div className="space-y-1.5 p-1 rounded-2xl bg-surface-subtle border border-border-subtle">
                <button
                  onClick={() => {
                    onSelectTab('macro');
                    onClose();
                  }}
                  className={`w-full p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'macro'
                      ? 'bg-sky-600 text-white shadow-sm'
                      : 'bg-surface hover:bg-surface-subtle text-content-secondary hover:text-content-primary'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayoutDashboard className="w-4 h-4" />
                    <span>1. {t.tabMacro}</span>
                    <span className="text-xs">{macroCountry === 'CA' ? '🇨🇦' : '🇺🇸'}</span>
                  </div>
                  {activeTab === 'macro' && <ShieldCheck className="w-4 h-4" />}
                </button>

                {/* Sub-selector: US vs CA Macro */}
                <div className="grid grid-cols-2 gap-1.5 px-1 pb-1">
                  <button
                    onClick={() => {
                      onSelectMacroCountry?.('US');
                      onSelectTab('macro');
                      onClose();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer border ${
                      activeTab === 'macro' && macroCountry === 'US'
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                        : 'bg-surface border-border-subtle text-content-secondary hover:text-content-primary hover:border-brand'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>🇺🇸</span>
                      <span>{t.macroMarketUS}</span>
                    </div>
                    {activeTab === 'macro' && macroCountry === 'US' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      onSelectMacroCountry?.('CA');
                      onSelectTab('macro');
                      onClose();
                    }}
                    className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-between transition-all cursor-pointer border ${
                      activeTab === 'macro' && macroCountry === 'CA'
                        ? 'bg-sky-50 dark:bg-sky-950/60 border-sky-400 dark:border-sky-700 text-sky-700 dark:text-sky-300'
                        : 'bg-surface border-border-subtle text-content-secondary hover:text-content-primary hover:border-brand'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span>🇨🇦</span>
                      <span>{t.macroMarketCA}</span>
                    </div>
                    {activeTab === 'macro' && macroCountry === 'CA' && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Tab 2: Stock Picks */}
              <button
                onClick={() => {
                  onSelectTab('picks');
                  onClose();
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'picks'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-surface hover:bg-surface-subtle text-content-secondary hover:text-content-primary border border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>2. {t.tabPicks}</span>
                </div>
                {activeTab === 'picks' && <ShieldCheck className="w-4 h-4" />}
              </button>

              {/* Tab 3: Deep-Dive */}
              <button
                onClick={() => {
                  onSelectTab('stock');
                  onClose();
                }}
                className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'stock'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-surface hover:bg-surface-subtle text-content-secondary hover:text-content-primary border border-border-subtle'
                }`}
              >
                <div className="flex items-center gap-2">
                  <LineChart className="w-4 h-4" />
                  <span>3. {t.tabStock} (${currentTicker})</span>
                </div>
                {activeTab === 'stock' && <ShieldCheck className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Section 4: Preferences & Appearance */}
          <div className="space-y-2 pt-2 border-t border-border-subtle">
            <div className="text-[10px] font-black uppercase text-content-muted tracking-wider px-1">
              {t.navPreferences}
            </div>

            {/* Theme Switcher Segmented Control */}
            <div className="flex items-center justify-between p-2.5 bg-surface-subtle border border-border-subtle rounded-xl">
              <div className="flex items-center gap-2 text-xs font-bold text-content-primary">
                {isDark ? (
                  <Moon className="w-4 h-4 text-brand" />
                ) : (
                  <Sun className="w-4 h-4 text-amber-500" />
                )}
                <span>{isDark ? t.themeDark : t.themeLight}</span>
              </div>
              <button
                onClick={toggleTheme}
                className="px-3 py-1 bg-surface hover:bg-surface-subtle border border-border-subtle rounded-lg text-xs font-extrabold text-content-primary transition-all cursor-pointer shadow-2xs"
              >
                {isDark ? '☀️ Light' : '🌙 Dark'}
              </button>
            </div>

            {/* Language Segmented Control */}
            <div className="p-2.5 bg-surface-subtle border border-border-subtle rounded-xl space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-content-primary">
                <Globe className="w-3.5 h-3.5 text-brand" />
                <span>Language / 语言</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {languageOptions.map((opt) => (
                  <button
                    key={opt.mode}
                    onClick={() => setLanguage(opt.mode)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer text-center ${
                      language === opt.mode
                        ? 'bg-brand text-white shadow-xs'
                        : 'bg-surface hover:bg-surface-subtle text-content-secondary border border-border-subtle'
                    }`}
                  >
                    {opt.badge}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Area: Platform Attribution & Version */}
        <div className="pt-6 border-t border-border-subtle text-[11px] text-content-muted flex items-center justify-between">
          <span>Prism Loop v7.0.0</span>
          <a
            href="https://github.com/edzhangcan/ai-investment"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-brand transition-colors font-medium"
          >
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
