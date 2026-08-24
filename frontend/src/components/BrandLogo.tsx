import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({ size = 'md', showText = false }) => {
  const sizeMap = {
    sm: { box: 'h-7 w-7', svg: 18, text: 'text-sm', sub: 'text-[9px]' },
    md: { box: 'h-9 w-9', svg: 22, text: 'text-base', sub: 'text-[10px]' },
    lg: { box: 'h-12 w-12', svg: 28, text: 'text-lg', sub: 'text-xs' }
  }[size];

  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex items-center justify-center rounded-xl bg-[#0d0f17] border border-[#242b3d] shadow-sm ${sizeMap.box} group`}>
        {/* Subtle accent glow */}
        <div className="absolute inset-0 rounded-xl bg-[#00f2c3]/10 blur-sm group-hover:bg-[#00f2c3]/20 transition-all duration-300 pointer-events-none" />
        
        {/* Geometric UNTHINKABLE Nexus Icon */}
        <svg
          width={sizeMap.svg}
          height={sizeMap.svg}
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="relative z-10"
        >
          {/* Outer diamond prism */}
          <path
            d="M16 3L29 16L16 29L3 16L16 3Z"
            stroke="#00f2c3"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Inner intelligence core */}
          <path
            d="M16 8L24 16L16 24L8 16L16 8Z"
            fill="#090a0f"
            stroke="#94a3b8"
            strokeWidth="1.25"
          />
          {/* Center precision node */}
          <circle cx="16" cy="16" r="2.5" fill="#00f2c3" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <span className={`font-mono font-extrabold tracking-widest text-[#f8fafc] leading-tight ${sizeMap.text}`}>
            UNTHINKABLE
          </span>
          <span className={`font-sans font-medium text-[#64748b] tracking-wider uppercase ${sizeMap.sub}`}>
            Smart Resume Intelligence
          </span>
        </div>
      )}
    </div>
  );
};
