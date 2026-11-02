import React from 'react';

interface AutoPostLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  animated?: boolean;
  className?: string;
}

/**
 * AutoPost logo icon — renders the user-supplied high-res PNG
 * (/logo.png) statically without movement animation.
 */
export const PaperPlaneIcon: React.FC<{
  sizeClass?: string;
  animated?: boolean;
}> = ({ sizeClass = 'w-10 h-10' }) => {
  return (
    <div
      className={`group relative ${sizeClass} rounded-2xl bg-gradient-to-b from-white via-indigo-50/70 to-slate-100 p-1 flex items-center justify-center shadow-md shadow-indigo-950/20 border border-white/90 shrink-0 select-none overflow-hidden`}
    >
      <img
        src="/logo.png"
        alt="AutoPost logo"
        className="w-full h-full object-contain"
        draggable={false}
        width={500}
        height={500}
      />
    </div>
  );
};

export const AutoPostLogo: React.FC<AutoPostLogoProps> = ({
  variant = 'light',
  size = 'md',
  showText = true,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-8 h-8', text: 'text-xl' },
    md: { box: 'w-10 h-10', text: 'text-2xl' },
    lg: { box: 'w-12 h-12', text: 'text-3xl' },
  };

  const currentSize = sizeMap[size];

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <PaperPlaneIcon sizeClass={currentSize.box} animated={false} />
      {showText && (
        <span className={`font-black tracking-tight ${currentSize.text}`}>
          <span className={variant === 'light' ? 'text-white' : 'text-[#312e81]'}>
            Auto
          </span>
          <span className="text-[#f97316]">Post</span>
        </span>
      )}
    </div>
  );
};

export default AutoPostLogo;
