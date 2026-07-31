import React, { useState } from 'react';
import jargonData from '../../data/jargon_dictionary.json';
import { HelpCircle, Sparkles } from 'lucide-react';

interface JargonTooltipProps {
  termKey: string;
  children?: React.ReactNode;
}

export const JargonTooltip: React.FC<JargonTooltipProps> = ({ termKey, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const jargon = (jargonData as Record<string, any>)[termKey];

  if (!jargon) {
    return <>{children || termKey}</>;
  }

  return (
    <span className="relative inline-block group">
      <span
        onClick={() => setIsOpen(!isOpen)}
        className="cursor-pointer border-b-2 border-dashed border-emerald-400 font-semibold text-emerald-300 hover:text-emerald-200 transition-colors px-1 bg-emerald-950/30 rounded inline-flex items-center gap-1"
      >
        {children || jargon.simple_name || termKey}
        <HelpCircle className="w-3.5 h-3.5 text-emerald-400 inline" />
      </span>

      {/* Hover Card / Tap Modal */}
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-50 w-72 md:w-80 p-4 bg-slate-900/95 backdrop-blur-md border border-emerald-500/30 rounded-xl shadow-2xl text-left pointer-events-none transition-all">
        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{jargon.term}</span>
        </div>
        <p className="text-xs text-slate-300 mb-2 leading-relaxed">
          {jargon.definition}
        </p>
        <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/50 text-xs text-amber-300/90 leading-relaxed">
          <span className="font-semibold text-amber-400">💡 白话通俗比喻：</span> {jargon.analogy}
        </div>
      </div>
    </span>
  );
};
