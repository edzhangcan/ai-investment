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
      color: 'text-positive',
      bgColor: 'prism-badge-positive',
    },
    {
      label: t.loadingStep2,
      icon: Newspaper,
      color: 'text-brand',
      bgColor: 'prism-badge-brand',
    },
    {
      label: t.loadingStep3,
      icon: TrendingUp,
      color: 'text-warning',
      bgColor: 'prism-badge-warning',
    },
    {
      label: t.loadingStep4,
      icon: Cpu,
      color: 'text-brand',
      bgColor: 'prism-badge-brand',
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
          setProgress(100);
          setCurrentStep(loadingSteps.length - 1);
          clearInterval(interval);
          setTimeout(() => setIsVisible(false), 100);
          return;
        }

        if (currentProgress < 90) {
          currentProgress += 2.25;
        } else if (currentProgress < 99) {
          currentProgress += (99 - currentProgress) * 0.05;
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xl transition-opacity duration-150">
      <div className="relative w-full max-w-lg mx-4 bg-surface border border-border-subtle rounded-3xl p-8 shadow-2xl transition-colors duration-150">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 prism-badge-brand rounded-2xl">
            <Activity className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-content-primary">
              {t.appTitle}
            </h2>
            <p className="text-[11px] text-content-muted font-medium">
              {t.loadingSubtitle}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-surface-subtle rounded-full mb-6 overflow-hidden border border-border-subtle">
          <div
            className="h-full rounded-full bg-brand transition-all duration-100 ease-out"
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
                    ? 'prism-card border-brand shadow-sm scale-[1.01]'
                    : isCompleted
                    ? 'prism-surface-subtle'
                    : 'bg-surface-subtle border-border-subtle opacity-40'
                }`}
              >
                <div className={`p-1.5 rounded-lg ${isActive ? 'prism-badge-brand' : isCompleted ? 'prism-badge-positive' : 'prism-badge-neutral'}`}>
                  {isCompleted ? (
                    <svg className="w-4 h-4 text-positive" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <StepIcon className={`w-4 h-4 ${isActive ? step.color : 'text-content-muted'}`} />
                  )}
                </div>
                <span className={`text-xs font-semibold ${
                  isActive ? 'text-content-primary' : isCompleted ? 'text-content-secondary' : 'text-content-muted'
                }`}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer percentage */}
        <div className="mt-6 flex items-center justify-between text-[11px]">
          <span className="text-content-muted font-medium">
            {t.loadingStepCounter} {Math.min(currentStep + 1, loadingSteps.length)} {t.loadingOf} {loadingSteps.length}
          </span>
          <span className="font-extrabold text-brand font-mono">
            {displayPercent}%
          </span>
        </div>
      </div>
    </div>
  );
};
