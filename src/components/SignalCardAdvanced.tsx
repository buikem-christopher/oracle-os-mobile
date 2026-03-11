import React, { useMemo, useState, useEffect } from 'react';
import { Radio, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { MarketData } from '@/contexts/OracleContext';

interface SignalCardAdvancedProps {
  market: MarketData;
  demoMode: boolean;
}

const generateSignal = (market: MarketData) => {
  const m = market.change24h;
  if (m > 1.5) return { label: 'S.Buy', full: 'Strong Buy', color: 'text-oracle-green', bg: 'bg-oracle-green/15', barColor: 'hsl(var(--oracle-green))', strength: 0.9 };
  if (m > 0.5) return { label: 'Buy', full: 'Buy', color: 'text-oracle-green', bg: 'bg-oracle-green/10', barColor: 'hsl(var(--oracle-green))', strength: 0.7 };
  if (m < -1.5) return { label: 'S.Sell', full: 'Strong Sell', color: 'text-oracle-red', bg: 'bg-oracle-red/15', barColor: 'hsl(var(--oracle-red))', strength: 0.9 };
  if (m < -0.5) return { label: 'Sell', full: 'Sell', color: 'text-oracle-red', bg: 'bg-oracle-red/10', barColor: 'hsl(var(--oracle-red))', strength: 0.7 };
  return { label: 'Hold', full: 'Hold', color: 'text-muted-foreground', bg: 'bg-muted', barColor: 'hsl(var(--muted-foreground))', strength: 0.4 };
};

export const SignalCardAdvanced: React.FC<SignalCardAdvancedProps> = ({ market, demoMode }) => {
  const signal = generateSignal(market);
  const isPositive = market.change24h >= 0;
  const [animKey, setAnimKey] = useState(0);

  // Re-trigger sparkline animation on signal change
  useEffect(() => {
    setAnimKey(prev => prev + 1);
  }, [signal.label]);

  // Generate sophisticated OHLC micro-candles
  const { priceLine, volumeBars, areaPath, microCandles } = useMemo(() => {
    const pts: number[] = [];
    const vols: number[] = [];
    const candles: { x: number; o: number; h: number; l: number; c: number; v: number }[] = [];
    let val = 50;
    const count = 40;
    
    for (let i = 0; i < count; i++) {
      const bias = isPositive ? 0.42 : 0.58;
      val += (Math.random() - bias) * 5;
      val = Math.max(12, Math.min(88, val));
      pts.push(val);
      vols.push(15 + Math.random() * 50);
    }

    const w = 100, h = 55;
    const stepX = w / (pts.length - 1);
    
    // Smooth cubic bezier path
    const linePoints = pts.map((p, i) => ({ x: i * stepX, y: h - (p / 100) * h }));
    let pathD = `M ${linePoints[0].x} ${linePoints[0].y}`;
    for (let i = 1; i < linePoints.length; i++) {
      const prev = linePoints[i - 1];
      const curr = linePoints[i];
      const cpx1 = prev.x + (curr.x - prev.x) * 0.4;
      const cpx2 = prev.x + (curr.x - prev.x) * 0.6;
      pathD += ` C ${cpx1} ${prev.y}, ${cpx2} ${curr.y}, ${curr.x} ${curr.y}`;
    }
    const area = pathD + ` L ${w} ${h} L 0 ${h} Z`;

    // Micro candles for institutional look
    const candleW = w / count - 0.8;
    const mc = pts.map((p, i) => {
      const open = i > 0 ? pts[i - 1] : p;
      const close = p;
      const high = Math.max(open, close) + Math.random() * 3;
      const low = Math.min(open, close) - Math.random() * 3;
      return {
        x: i * (w / count),
        o: h - (open / 100) * h,
        h: h - (Math.min(100, high) / 100) * h,
        l: h - (Math.max(0, low) / 100) * h,
        c: h - (close / 100) * h,
        v: vols[i],
      };
    });
    
    const volBars = vols.map((v, i) => ({
      x: i * (w / vols.length),
      h: (v / 65) * 10,
      w: (w / vols.length) - 0.4,
    }));

    return { priceLine: pathD, volumeBars: volBars, areaPath: area, microCandles: mc };
  }, [isPositive, animKey]);

  const color = isPositive ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))';
  const gradId = `sig-adv-${market.symbol.replace(/\//g, '')}`;
  const glowId = `glow-${market.symbol.replace(/\//g, '')}`;

  // Volatility indicator
  const volatility = Math.abs(market.change24h);
  const volLevel = volatility > 3 ? 'HIGH' : volatility > 1 ? 'MED' : 'LOW';
  const volDotColor = volatility > 3 ? 'bg-oracle-red' : volatility > 1 ? 'bg-oracle-orange' : 'bg-oracle-green';

  return (
    <div className="card-elevated p-3 flex flex-col justify-between min-h-[170px] card-3d-hover relative overflow-hidden group">
      {/* Ambient glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 50% 80%, ${color}10, transparent 70%)` }} />

      {/* Header */}
      <div className="flex items-center justify-between mb-1 relative">
        <div className="flex items-center gap-1.5 min-w-0">
          <Radio className={`w-2 h-2 flex-shrink-0 ${demoMode ? 'text-oracle-orange' : 'text-oracle-green animate-pulse'}`} />
          <span className="font-mono text-xs font-bold truncate">{market.symbol}</span>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <div className={`w-1 h-1 rounded-full ${volDotColor}`} />
          <span className="text-[7px] font-mono text-muted-foreground">{volLevel}</span>
          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold whitespace-nowrap ${signal.bg} ${signal.color} transition-all duration-300`}>
            {signal.label}
          </span>
        </div>
      </div>

      {/* Advanced Chart with micro candles */}
      <div className="flex-1 my-1 relative">
        <svg viewBox="0 0 100 65" className="w-full h-16" preserveAspectRatio="none">
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.2" />
              <stop offset="60%" stopColor={color} stopOpacity="0.05" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
            <filter id={glowId}>
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Regime shading bands */}
          <rect x="0" y="0" width="100" height="18" fill={color} opacity="0.02" />
          <rect x="0" y="37" width="100" height="18" fill={color} opacity="0.02" />

          {/* Volume micro bars */}
          {volumeBars.map((bar, i) => (
            <rect key={i} x={bar.x} y={55 - bar.h} width={bar.w} height={bar.h}
              fill={color} opacity={0.08 + (i / volumeBars.length) * 0.08} rx={0.2} />
          ))}

          {/* Area fill */}
          <path d={areaPath} fill={`url(#${gradId})`} />

          {/* Micro candle wicks */}
          {microCandles.map((c, i) => {
            const isGreen = c.c <= c.o;
            const candleColor = isGreen ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))';
            const bodyTop = Math.min(c.o, c.c);
            const bodyH = Math.max(0.5, Math.abs(c.o - c.c));
            return (
              <g key={i} opacity={0.4 + (i / microCandles.length) * 0.5}>
                <line x1={c.x + 1} y1={c.h} x2={c.x + 1} y2={c.l}
                  stroke={candleColor} strokeWidth="0.3" />
                <rect x={c.x + 0.3} y={bodyTop} width="1.4" height={bodyH}
                  fill={isGreen ? candleColor : 'transparent'} stroke={candleColor} strokeWidth="0.2" rx="0.1" />
              </g>
            );
          })}

          {/* Main trend line */}
          <path d={priceLine} fill="none" stroke={color} strokeWidth="1.2" 
            vectorEffect="non-scaling-stroke" filter={`url(#${glowId})`} />
        </svg>
      </div>

      {/* Footer */}
      <div className="relative">
        <div className="flex items-end justify-between">
          <div>
            <span className="font-mono text-sm font-bold">
              {market.price < 10 ? market.price.toFixed(4) : `$${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            </span>
            <div className="flex items-center gap-1 mt-0.5">
              <div className="h-1 w-12 rounded-full bg-muted/50 overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${signal.strength * 100}%`, backgroundColor: signal.barColor }} />
              </div>
              <span className="text-[8px] font-mono text-muted-foreground">{(signal.strength * 100).toFixed(0)}%</span>
            </div>
          </div>
          <div className="text-right">
            <span className={`font-mono text-[12px] font-bold ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
              {isPositive ? '+' : ''}{market.change24h.toFixed(2)}%
            </span>
            <div className="text-[8px] text-muted-foreground font-mono">
              Vol {market.volume >= 1e9 ? `${(market.volume / 1e9).toFixed(1)}B` : `${(market.volume / 1e6).toFixed(0)}M`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
