import React, { useEffect, useState, useRef } from 'react';
import { Activity, Database, Newspaper, TrendingUp, Cpu } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface StartupLoadingOverlayProps {
  isLoading: boolean;
}

export const StartupLoadingOverlay: React.FC<StartupLoadingOverlayProps> = ({ isLoading }) => {
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(isLoading);
  const isApiDoneRef = useRef(false);

  const loadingSteps = [
    {
      label: t.loadingStep1,
      icon: Database,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-500/20',
      borderColor: 'border-emerald-300 dark:border-emerald-500/40',
    },
    {
      label: t.loadingStep2,
      icon: Newspaper,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgColor: 'bg-indigo-50 dark:bg-indigo-500/20',
      borderColor: 'border-indigo-300 dark:border-indigo-500/40',
    },
    {
      label: t.loadingStep3,
      icon: TrendingUp,
      color: 'text-amber-600 dark:text-amber-400',
      bgColor: 'bg-amber-50 dark:bg-amber-500/20',
      borderColor: 'border-amber-300 dark:border-amber-500/40',
    },
    {
      label: t.loadingStep4,
      icon: Cpu,
      color: 'text-violet-600 dark:text-violet-400',
      bgColor: 'bg-violet-50 dark:bg-violet-500/20',
      borderColor: 'border-violet-300 dark:border-violet-500/40',
    },
  ];

  useEffect(() => {
    isApiDoneRef.current = !isLoading;
  }, [isLoading]);

  useEffect(() => {
    if (isLoading) {
      setIsVisible(true);
      setCurrentStep(0);
      setProgress(0);

      const intervalMs = 30;
      let currentProgress = 0;

      const interval = setInterval(() => {
        if (isApiDoneRef.current) {
          // Instant fast-path to 100% when API resolves
          setProgress(100);
          setCurrentStep(loadingSteps.length - 1);
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 100);
          return;
        }

        // Pacing logic: Smooth acceleration to 90%, then asymptotic continuous velocity to 99%
        if (currentProgress < 90) {
          currentProgress += 2.25; // Reaches 90% in ~1.2 seconds
        } else if (currentProgress < 99) {
          currentProgress += (99 - currentProgress) * 0.05; // Continuous decelerating progress (never stalls)
        }

        const displayPct = Math.min(99, currentProgress);
        setProgress(displayPct);

        if (displayPct >= 75) setCurrentStep(3);
        else if (displayPct >= 50) setCurrentStep(2);
        else if (displayPct >= 25) setCurrentStep(1);
        else setCurrentStep(0);
      }, intervalMs);

      return () => clearInterval(interval);
    } else {
      // Immediate unmount if API was already done at mount
      setProgress(100);
      setCurrentStep(loadingSteps.length - 1);
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [isLoading, loadingSteps.length]);

  if (!isVisible) return null;

  const displayPercent = Math.round(progress);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 dark:bg-slate-950/95 backdrop-blur-2xl transition-opacity duration-150">
      {/* Ambient glow effects */}
      <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-emerald-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-indigo-600/15 rounded-full blur-3xl animate-pulse pointer-events-none" />

      <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-8 shadow-2xl backdrop-blur-xl transition-colors duration-200">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-gradient-to-tr from-sky-500 to-indigo-600 dark:from-emerald-500 dark:to-indigo-500 rounded-2xl shadow-md">
            <Activity className="w-6 h-6 text-white dark:text-slate-950" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              {t.appTitle}
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              {t.loadingSubtitle}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full mb-6 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 via-teal-400 to-indigo-500 transition-all duration-100 ease-out"
            style={{ width: `${displayPercent}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-3">
          {loadingSteps.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = idx === currentStep;
            const isCompleted = idx < currentStep || displayPercent === 100;

            return (
              <div
                key={idx}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${
                  isActive
                    ? `${step.bgColor} ${step.borderColor} shadow-sm scale-[1.01]`
                    : isCompleted
                    ? 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/40'
                    : 'bg-slate-100/50 dark:bg-slate-950/30 border-slate-200/50 dark:border-slate-800/30 opacity-40'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? step.bgColor : isCompleted ? 'bg-emerald-100 dark:bg-emerald-500/15' : 'bg-slate-200 dark:bg-slate-800/60'}`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <StepIcon className={`w-4 h-4 ${isActive ? step.color : 'text-slate-400 dark:text-slate-500'} ${isActive ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-slate-900 dark:text-slate-100' : isCompleted ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer percentage */}
        <div className="mt-6 flex items-center justify-between text-[11px]">
          <span className="text-slate-500 font-medium">
            {t.loadingStepCounter} {Math.min(currentStep + 1, loadingSteps.length)} {t.loadingOf} {loadingSteps.length}
          </span>
          <span className="font-extrabold text-sky-600 dark:text-emerald-400 font-mono">
            {displayPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
