import React, { useEffect, useState, useRef } from 'react';
import { Activity, Database, Newspaper, TrendingUp, Cpu } from 'lucide-react';

interface StartupLoadingOverlayProps {
  isLoading: boolean;
}

const LOADING_STEPS = [
  {
    label: 'Connecting to Federal Reserve (FRED) & Bank of Canada Economic Data...',
    icon: Database,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/40',
  },
  {
    label: 'Ingesting Live Central Bank Policy Statements & Macro News Stream...',
    icon: Newspaper,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/20',
    borderColor: 'border-indigo-500/40',
  },
  {
    label: 'Analyzing Top 3-5 Equity Recommendations & CIO Sector Allocations...',
    icon: TrendingUp,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/20',
    borderColor: 'border-amber-500/40',
  },
  {
    label: 'Initializing Multi-Agent AI Debate Arena & Portfolio Engine...',
    icon: Cpu,
    color: 'text-violet-400',
    bgColor: 'bg-violet-500/20',
    borderColor: 'border-violet-500/40',
  },
];

export const StartupLoadingOverlay: React.FC<StartupLoadingOverlayProps> = ({ isLoading }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(isLoading);
  const startTimeRef = useRef<number>(Date.now());

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setCurrentStep(0);
      setProgress(0);
      startTimeRef.current = Date.now();

      // Smooth progress animation spanning ~4.5 seconds evenly
      const interval = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        
        // Logarithmic smooth curve mapping elapsed time (0 -> 4500ms) to progress (0 -> 94%)
        let targetProgress = Math.min(94, Math.floor((1 - Math.exp(-elapsed / 1800)) * 95));
        
        setProgress(targetProgress);

        // Update active step comfortably based on progress thresholds
        if (targetProgress >= 72) setCurrentStep(3);
        else if (targetProgress >= 48) setCurrentStep(2);
        else if (targetProgress >= 24) setCurrentStep(1);
        else setCurrentStep(0);

      }, 50);

      return () => clearInterval(interval);
    } else {
      // API call finished! Instantly snap progress to 100% and render interface immediately
      setProgress(100);
      setCurrentStep(LOADING_STEPS.length - 1);
      
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 120); // 120ms quick finish transition

      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!isVisible) return null;

  const displayPercent = Math.round(progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/95 backdrop-blur-2xl transition-opacity duration-150">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-lg mx-4 bg-slate-900/90 border border-slate-700/60 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-2xl shadow-lg shadow-emerald-500/20">
            <Activity className="w-6 h-6 text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-indigo-300 bg-clip-text text-transparent">
              AI Investment Platform
            </h2>
            <p className="text-[11px] text-slate-400 font-medium">
              Initializing real-time market intelligence systems...
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 transition-all duration-200 ease-out"
            style={{ width: `${displayPercent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {LOADING_STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep || displayPercent === 100;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? `${step.bgColor} ${step.borderColor} shadow-lg scale-[1.01]`
                    : isCompleted
                    ? 'bg-slate-800/40 border-slate-700/40'
                    : 'bg-slate-950/30 border-slate-800/30 opacity-40'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? step.bgColor : isCompleted ? 'bg-emerald-500/15' : 'bg-slate-800/60'}`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <StepIcon className={`w-4 h-4 ${isActive ? step.color : 'text-slate-500'} ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-slate-100' : isCompleted ? 'text-slate-400' : 'text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer percentage */}
        <div className="mt-6 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">Step {Math.min(currentStep + 1, LOADING_STEPS.length)} of {LOADING_STEPS.length}</span>
          <span className="font-extrabold bg-gradient-to-r from-emerald-400 to-indigo-400 bg-clip-text text-transparent font-mono">
            {displayPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
