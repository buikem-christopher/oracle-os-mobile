import React from 'react';
import { useOracle } from '@/contexts/OracleContext';

export const PortfolioSparkline: React.FC = () => {
  const { portfolioHistory } = useOracle();
  
  if (portfolioHistory.length < 2) return null;

  const min = Math.min(...portfolioHistory);
  const max = Math.max(...portfolioHistory);
  const range = max - min || 1;
  
  const width = 100;
  const height = 32;
  const padding = 2;
  
  const points = portfolioHistory.map((value, index) => {
    const x = padding + (index / (portfolioHistory.length - 1)) * (width - padding * 2);
    const y = height - padding - ((value - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(' ');

  const isPositive = portfolioHistory[portfolioHistory.length - 1] >= portfolioHistory[0];
  const gradientId = `sparkline-gradient-${isPositive ? 'green' : 'red'}`;
  const strokeColor = isPositive ? 'hsl(145, 80%, 55%)' : 'hsl(0, 90%, 60%)';

  return (
    <div className="relative">
      <svg width={width} height={height} className="overflow-visible">
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop 
              offset="0%" 
              stopColor={strokeColor} 
              stopOpacity="0.3" 
            />
            <stop 
              offset="100%" 
              stopColor={strokeColor} 
              stopOpacity="0" 
            />
          </linearGradient>
        </defs>
        
        {/* Area fill */}
        <polygon
          points={`${padding},${height - padding} ${points} ${width - padding},${height - padding}`}
          fill={`url(#${gradientId})`}
          className="animate-fade-in"
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="animate-fade-in"
        />
        
        {/* End dot */}
        <circle
          cx={width - padding}
          cy={height - padding - ((portfolioHistory[portfolioHistory.length - 1] - min) / range) * (height - padding * 2)}
          r="2"
          fill={strokeColor}
          className="animate-fade-in"
        />
      </svg>
    </div>
  );
};
