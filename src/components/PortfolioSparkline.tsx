import React from 'react';
import { useOracle } from '@/contexts/OracleContext';

export const PortfolioSparkline: React.FC = () => {
  const { portfolioHistory } = useOracle();
  
  if (portfolioHistory.length < 2) return null;

  const values = portfolioHistory.map(h => h.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  
  const width = 100;
  const height = 28;
  const padding = 1;
  
  const points = values.map((value, index) => {
    const x = padding + (index / (values.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const isPositive = values[values.length - 1] >= values[0];
  const gradientId = `sparkline-gradient-${isPositive ? 'green' : 'red'}`;
  const strokeColor = isPositive ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))';

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.2" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={`url(#${gradientId})`}
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* End dot */}
        <circle
          cx={width - padding}
          cy={height - padding - ((values[values.length - 1] - min) / range) * (height - padding * 2)}
          r="2"
          fill={strokeColor}
        />
      </svg>
    </div>
  );
};
