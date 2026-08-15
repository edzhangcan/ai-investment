import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ className = '', showLabel = true }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`relative inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95 shrink-0 ${
        isDark
          ? 'bg-slate-900/90 border-slate-700/80 text-amber-400 hover:text-amber-300 hover:border-amber-500/40 hover:bg-slate-800'
          : 'bg-white border-slate-200 text-sky-700 hover:text-sky-800 hover:border-sky-300 hover:bg-slate-50 shadow-sm'
      } ${className}`}
    >
      <div className="relative w-4 h-4 flex items-center justify-center shrink-0">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 rotate-0 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-sky-600 transition-transform duration-300 -rotate-12 hover:rotate-0" />
        )}
      </div>
      {showLabel && (
        <span className="hidden sm:inline font-semibold">
          {isDark ? t.themeDark : t.themeLight}
        </span>
      )}
    </button>
  );
};
