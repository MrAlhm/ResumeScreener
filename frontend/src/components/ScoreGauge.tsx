import React from 'react';

interface ScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showLabel?: boolean;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  size = 'md',
  showLabel = true
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score * 10) / 10));

  const config = {
    sm: { radius: 18, stroke: 3, text: 'text-xs', labelText: 'text-[9px]', box: 'h-10 w-10' },
    md: { radius: 26, stroke: 4, text: 'text-base', labelText: 'text-[10px]', box: 'h-16 w-16' },
    lg: { radius: 38, stroke: 5.5, text: 'text-2xl', labelText: 'text-xs', box: 'h-24 w-24' },
    xl: { radius: 52, stroke: 7, text: 'text-3xl', labelText: 'text-sm', box: 'h-32 w-32' }
  }[size];

  const circumference = 2 * Math.PI * config.radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let colorClass = '#f43f5e'; // Rose
  let label = 'POOR MATCH';
  let badgeStyle = 'bg-rose-950/40 text-rose-300 border-rose-800/60';

  if (clampedScore >= 90) {
    colorClass = '#00f2c3'; // UNTHINKABLE Accent Teal
    label = 'EXCELLENT MATCH';
    badgeStyle = 'bg-[#00f2c3]/15 text-[#00f2c3] border-[#00f2c3]/40';
  } else if (clampedScore >= 75) {
    colorClass = '#14b8a6'; // Teal
    label = 'STRONG MATCH';
    badgeStyle = 'bg-teal-950/40 text-teal-300 border-teal-800/60';
  } else if (clampedScore >= 60) {
    colorClass = '#38bdf8'; // Sky
    label = 'MODERATE MATCH';
    badgeStyle = 'bg-sky-950/40 text-sky-300 border-sky-800/60';
  } else if (clampedScore >= 40) {
    colorClass = '#f59e0b'; // Amber
    label = 'WEAK MATCH';
    badgeStyle = 'bg-amber-950/40 text-amber-300 border-amber-800/60';
  }

  return (
    <div className="flex items-center gap-3">
      <div className={`relative flex items-center justify-center ${config.box}`}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${config.radius * 2 + 16} ${config.radius * 2 + 16}`}>
          {/* Track Circle */}
          <circle
            cx={config.radius + 8}
            cy={config.radius + 8}
            r={config.radius}
            stroke="#1e2433"
            strokeWidth={config.stroke}
            fill="transparent"
          />
          {/* Score Indicator Arc */}
          <circle
            cx={config.radius + 8}
            cy={config.radius + 8}
            r={config.radius}
            stroke={colorClass}
            strokeWidth={config.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Score Number in Center */}
        <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-[#f8fafc]">
          <span className={config.text}>{clampedScore}</span>
        </div>
      </div>

      {showLabel && (
        <div className="flex flex-col">
          <span className={`px-2 py-0.5 rounded-md font-mono font-bold uppercase tracking-wider border ${badgeStyle} ${config.labelText}`}>
            {label}
          </span>
        </div>
      )}
    </div>
  );
};
