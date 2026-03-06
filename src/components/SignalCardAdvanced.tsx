import React, { useMemo } from 'react';
import { Radio } from 'lucide-react';
import { MarketData } from '@/contexts/OracleContext';

interface SignalCardAdvancedProps {
  market: MarketData;
  demoMode: boolean;
}

const generateSignal = (market: MarketData) => {
  const m = market.change24h;
  if (m > 1.5) return { label: 'S.Buy', full: 'Strong Buy', color: 'text-oracle-green', bg: 'bg-oracle-green/15', strength: 0.9 };
  if (m > 0.5) return { label: 'Buy', full: 'Buy', color: 'text-oracle-green', bg: 'bg-oracle-green/10', strength: 0.7 };
  if (m < -1.5) return { label: 'S.Sell', full: 'Strong Sell', color: 'text-oracle-red', bg: 'bg-oracle-red/15', strength: 0.9 };
  if (m < -0.5) return { label: 'Sell', full: 'Sell', color: 'text-oracle-red', bg: 'bg-oracle-red/10', strength: 0.7 };
  return { label: 'Hold', full: 'Hold', color: 'text-muted-foreground', bg: 'bg-muted', strength: 0.4 };
};

export const SignalCardAdvanced: React.FC<SignalCardAdvancedProps> = ({ market, demoMode }) => {
  const signal = generateSignal(market);
  const isPositive = market.change24h >= 0;

  // Advanced sparkline with volume micro-bars
  const { priceLine, volumeBars, areaPath } = useMemo(() => {
    const pts: number[] = [];
    const vols: number[] = [];
    let val = 50;
    for (let i = 0; i < 30; i++) {
      val += (Math.random() - (isPositive ? 0.4 : 0.6)) * 6;
      val = Math.max(15, Math.min(85, val));
      pts.push(val);
      vols.push(20 + Math.random() * 40);
    }
    const w = 100, h = 60;
    const stepX = w / (pts.length - 1);
    
    // Smooth bezier interpolation
    const linePoints = pts.map((p, i) => ({ x: i * stepX, y: h - (p / 100) * h }));
    let pathD = `M ${linePoints[0].x} ${linePoints[0].y}`;
    for (let i = 1; i < linePoints.length; i++) {
      const prev = linePoints[i - 1];
      const curr = linePoints[i];
      const cpx = (prev.x + curr.x) / 2;
      pathD += ` C ${cpx} ${prev.y}, ${cpx} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const area = pathD + ` L ${w} ${h} L 0 ${h} Z`;
    
    const volBars = vols.map((v, i) => ({
      x: i * (w / vols.length),
      h: (v / 60) * 12,
      w: (w / vols.length) - 0.5,
    }));

    return { priceLine: pathD, volumeBars: volBars, areaPath: area };
  }, [isPositive]);

  const color = isPositive ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))';
  const gradId = `sig-${market.symbol.replace(/\//g, '')}`;

  return (
    <div className="card-elevated p-3 flex flex-col justify-between min-h-[150px] card-3d-hover">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5 min-w-0">
          <Radio className={`w-2 h-2 flex-shrink-0 ${demoMode ? 'text-oracle-orange' : 'text-oracle-green animate-pulse'}`} />
          <span className="font-mono text-xs font-bold truncate">{market.symbol}</span>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${signal.bg} ${signal.color}`}>
            {signal.label}
          </span>
          <span className="text-[9px] font-mono text-muted-foreground">{(signal.strength * 100).toFixed(0)}%</span>
        </div>
      </div>

      {/* Advanced Chart */}
      <div className="flex-1 my-1 relative">
        <svg viewBox="0 0 100 60" className="w-full h-14" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Volume micro bars */}
          {volumeBars.map((bar, i) => (
            <rect key={i} x={bar.x} y={60 - bar.h} width={bar.w} height={bar.h}
              fill={color} opacity={0.12} rx={0.3} />
          ))}
          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />
          {/* Price line */}
          <path d={priceLine} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>

      {/* Footer */}
      <div className="flex items-end justify-between">
        <span className="font-mono text-sm font-bold">
          {market.price < 10 ? market.price.toFixed(4) : `$${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
        </span>
        <span className={`font-mono text-[11px] font-semibold ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
          {isPositive ? '+' : ''}{market.change24h.toFixed(2)}%
        </span>
      </div>
    </div>
  );
};
