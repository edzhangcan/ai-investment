import React, { createContext, useContext, useState, useEffect } from 'react';
import { LanguageMode, Translations, TRANSLATIONS } from '../i18n/translations';

interface LanguageContextType {
  language: LanguageMode;
  setLanguage: (mode: LanguageMode) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'ai_investment_lang_mode';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY) as LanguageMode;
    if (saved && ['en', 'zh', 'hybrid'].includes(saved)) {
      return saved;
    }
    return 'en'; // Default is English
  });

  const setLanguage = (mode: LanguageMode) => {
    setLanguageState(mode);
    localStorage.setItem(LOCAL_STORAGE_KEY, mode);
  };

  const t = TRANSLATIONS[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
