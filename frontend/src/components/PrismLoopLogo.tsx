import React from 'react';

interface PrismLoopLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'color' | 'monotone-white' | 'monotone-dark';
  className?: string;
}

export const PrismLoopLogo: React.FC<PrismLoopLogoProps> = ({
  size = 'md',
  variant = 'color',
  className = '',
}) => {
  const sizeMap = {
    xs: 'w-5 h-5',
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
    xl: 'w-14 h-14',
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  if (variant === 'monotone-white') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize} ${className} shrink-0`}
        aria-label="Prism Loop Logo"
      >
        <polygon points="50,8 14,29 32,40 50,50" fill="#F8FAFC" fillOpacity="0.95" />
        <polygon points="14,29 14,71 32,55 32,40" fill="#F8FAFC" fillOpacity="0.75" />
        <polygon points="14,71 50,92 32,55" fill="#F8FAFC" fillOpacity="0.55" />
        <polygon points="50,8 86,29 68,40 50,50" fill="#F8FAFC" fillOpacity="0.85" />
        <polygon points="86,29 86,71 68,55 68,40" fill="#F8FAFC" fillOpacity="0.65" />
        <polygon points="86,71 50,92 68,55" fill="#F8FAFC" fillOpacity="0.45" />
        <polygon points="50,50 32,40 32,55 50,92 68,55 68,40" fill="#F8FAFC" fillOpacity="0.3" />
        <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" stroke="#FFFFFF" strokeWidth="1.2" fill="none" />
        <line x1="50" y1="8" x2="50" y2="92" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" />
        <line x1="14" y1="29" x2="86" y2="71" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" />
        <line x1="14" y1="71" x2="86" y2="29" stroke="#FFFFFF" strokeOpacity="0.45" strokeWidth="0.8" />
      </svg>
    );
  }

  if (variant === 'monotone-dark') {
    return (
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${currentSize} ${className} shrink-0`}
        aria-label="Prism Loop Logo"
      >
        <polygon points="50,8 14,29 32,40 50,50" fill="#0F172A" fillOpacity="0.95" />
        <polygon points="14,29 14,71 32,55 32,40" fill="#0F172A" fillOpacity="0.75" />
        <polygon points="14,71 50,92 32,55" fill="#0F172A" fillOpacity="0.55" />
        <polygon points="50,8 86,29 68,40 50,50" fill="#0F172A" fillOpacity="0.85" />
        <polygon points="86,29 86,71 68,55 68,40" fill="#0F172A" fillOpacity="0.65" />
        <polygon points="86,71 50,92 68,55" fill="#0F172A" fillOpacity="0.45" />
        <polygon points="50,50 32,40 32,55 50,92 68,55 68,40" fill="#0F172A" fillOpacity="0.3" />
        <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" stroke="#0F172A" strokeWidth="1.2" fill="none" />
        <line x1="50" y1="8" x2="50" y2="92" stroke="#0F172A" strokeOpacity="0.45" strokeWidth="0.8" />
        <line x1="14" y1="29" x2="86" y2="71" stroke="#0F172A" strokeOpacity="0.45" strokeWidth="0.8" />
        <line x1="14" y1="71" x2="86" y2="29" stroke="#0F172A" strokeOpacity="0.45" strokeWidth="0.8" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${currentSize} ${className} shrink-0 drop-shadow-sm`}
      aria-label="Prism Loop Logo"
    >
      <defs>
        <linearGradient id="prismGoldPeak" x1="50" y1="8" x2="32" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
        <linearGradient id="prismAmberLeft" x1="14" y1="29" x2="32" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>
        <linearGradient id="prismAmberLower" x1="14" y1="71" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#B45309" />
          <stop offset="100%" stopColor="#1E40AF" />
        </linearGradient>
        <linearGradient id="prismCyanPeak" x1="50" y1="8" x2="68" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#BAE6FD" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="prismCyanRight" x1="86" y1="29" x2="68" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0EA5E9" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="prismCobaltLower" x1="86" y1="71" x2="50" y2="92" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>
        <linearGradient id="prismSapphireCore" x1="50" y1="92" x2="50" y2="50" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
      </defs>

      {/* Faceted Polygons */}
      <polygon points="50,8 14,29 32,40 50,50" fill="url(#prismGoldPeak)" />
      <polygon points="14,29 14,71 32,55 32,40" fill="url(#prismAmberLeft)" />
      <polygon points="14,71 50,92 32,55" fill="url(#prismAmberLower)" />
      <polygon points="50,8 86,29 68,40 50,50" fill="url(#prismCyanPeak)" />
      <polygon points="86,29 86,71 68,55 68,40" fill="url(#prismCyanRight)" />
      <polygon points="86,71 50,92 68,55" fill="url(#prismCobaltLower)" />
      <polygon points="50,50 32,40 32,55 50,92 68,55 68,40" fill="url(#prismSapphireCore)" opacity="0.9" />

      {/* Razor-Sharp Facet Dividers */}
      <polygon points="50,8 86,29 86,71 50,92 14,71 14,29" stroke="#FFFFFF" strokeOpacity="0.5" strokeWidth="1.2" fill="none" />
      <line x1="50" y1="8" x2="50" y2="92" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
      <line x1="14" y1="29" x2="86" y2="71" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
      <line x1="14" y1="71" x2="86" y2="29" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />
    </svg>
  );
};
