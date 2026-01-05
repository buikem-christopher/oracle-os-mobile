import React, { useMemo, useEffect, useState } from 'react';
import { useOracle } from '@/contexts/OracleContext';

interface Candle {
  open: number;
  high: number;
  low: number;
  close: number;
  isXHR?: boolean;
}

interface CandlestickChartProps {
  symbol: string;
  showForesight?: boolean;
}

const generateHistoricalCandles = (basePrice: number, count: number): Candle[] => {
  const candles: Candle[] = [];
  let price = basePrice * 0.95;
  
  for (let i = 0; i < count; i++) {
    const volatility = 0.008 + Math.random() * 0.012;
    const change = (Math.random() - 0.48) * volatility * price;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility * price * 0.5;
    const low = Math.min(open, close) - Math.random() * volatility * price * 0.5;
    
    candles.push({ open, high, low, close });
    price = close;
  }
  
  return candles;
};

export const CandlestickChart: React.FC<CandlestickChartProps> = ({ 
  symbol, 
  showForesight = true 
}) => {
  const { markets, foresight, settings, demoMode } = useOracle();
  const market = markets.find(m => m.symbol === symbol);
  const basePrice = market?.price || 67000;
  
  const [candles, setCandles] = useState<Candle[]>(() => 
    generateHistoricalCandles(basePrice, 30)
  );

  // Simulate new candles in demo mode
  useEffect(() => {
    if (!demoMode) return;
    
    const interval = setInterval(() => {
      setCandles(prev => {
        const lastCandle = prev[prev.length - 1];
        const volatility = 0.005 + Math.random() * 0.01;
        const change = (Math.random() - 0.48) * volatility * lastCandle.close;
        const open = lastCandle.close;
        const close = open + change;
        const high = Math.max(open, close) + Math.random() * volatility * open * 0.3;
        const low = Math.min(open, close) - Math.random() * volatility * open * 0.3;
        
        return [...prev.slice(1), { open, high, low, close }];
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [demoMode]);

  const xhrCandles = useMemo(() => {
    if (!showForesight || !foresight) return [];
    return foresight.projectedCandles.map(c => ({ ...c, isXHR: true }));
  }, [showForesight, foresight]);

  const allCandles = useMemo(() => [...candles, ...xhrCandles], [candles, xhrCandles]);

  const { minPrice, maxPrice } = useMemo(() => {
    const prices = allCandles.flatMap(c => [c.high, c.low]);
    return {
      minPrice: Math.min(...prices) * 0.998,
      maxPrice: Math.max(...prices) * 1.002,
    };
  }, [allCandles]);

  const chartHeight = 280;
  const candleWidth = 2.5;
  const candleGap = 0.8;

  const priceToY = (price: number) => {
    return ((maxPrice - price) / (maxPrice - minPrice)) * chartHeight;
  };

  return (
    <div className="relative w-full bg-card/50 rounded-xl p-4 overflow-hidden">
      {/* Background Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-border" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* Chart Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div>
          <h3 className="font-mono text-lg font-bold text-foreground">{symbol}</h3>
          <p className="font-mono text-2xl font-bold text-gradient-oracle">
            ${basePrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
        {showForesight && foresight && (
          <div className="text-right">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                foresight.bias === 'bullish' ? 'bg-oracle-green/20 text-oracle-green' :
                foresight.bias === 'bearish' ? 'bg-oracle-red/20 text-oracle-red' :
                'bg-muted text-muted-foreground'
              }`}>
                {foresight.bias.toUpperCase()}
              </span>
              <span className="badge-preview">XHR</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Confidence: <span className="text-primary font-mono">{foresight.confidence}%</span>
            </p>
          </div>
        )}
      </div>

      {/* Candlestick Chart */}
      <div className="relative z-10" style={{ height: chartHeight }}>
        <svg width="100%" height={chartHeight} className="overflow-visible">
          {allCandles.map((candle, index) => {
            const x = index * (candleWidth + candleGap);
            const isGreen = candle.close >= candle.open;
            const bodyTop = priceToY(Math.max(candle.open, candle.close));
            const bodyHeight = Math.abs(priceToY(candle.open) - priceToY(candle.close)) || 1;
            const wickTop = priceToY(candle.high);
            const wickBottom = priceToY(candle.low);
            
            const color = candle.isXHR 
              ? 'hsl(185 100% 60%)' 
              : isGreen 
                ? 'hsl(145 70% 45%)' 
                : 'hsl(0 70% 50%)';
            
            const opacity = candle.isXHR ? settings.foresightOpacity / 100 : 1;

            return (
              <g
                key={index}
                style={{ 
                  opacity,
                  filter: candle.isXHR ? 'blur(0.5px)' : 'none',
                  transition: 'opacity 0.3s ease'
                }}
              >
                {/* Wick */}
                <line
                  x1={`${x + candleWidth / 2}%`}
                  y1={wickTop}
                  x2={`${x + candleWidth / 2}%`}
                  y2={wickBottom}
                  stroke={color}
                  strokeWidth={1}
                />
                {/* Body */}
                <rect
                  x={`${x}%`}
                  y={bodyTop}
                  width={`${candleWidth}%`}
                  height={bodyHeight}
                  fill={isGreen || candle.isXHR ? color : 'transparent'}
                  stroke={color}
                  strokeWidth={1}
                  rx={1}
                />
                {/* XHR Glow Effect */}
                {candle.isXHR && (
                  <rect
                    x={`${x - 0.5}%`}
                    y={bodyTop - 5}
                    width={`${candleWidth + 1}%`}
                    height={bodyHeight + 10}
                    fill="none"
                    stroke="hsl(185 100% 60% / 0.3)"
                    strokeWidth={4}
                    rx={2}
                    filter="blur(4px)"
                  />
                )}
              </g>
            );
          })}
          
          {/* XHR Separator Line */}
          {xhrCandles.length > 0 && (
            <line
              x1={`${candles.length * (candleWidth + candleGap) - candleGap / 2}%`}
              y1={0}
              x2={`${candles.length * (candleWidth + candleGap) - candleGap / 2}%`}
              y2={chartHeight}
              stroke="hsl(185 100% 60% / 0.4)"
              strokeWidth={1}
              strokeDasharray="4 4"
            />
          )}
        </svg>

        {/* XHR Dream Overlay Gradient */}
        {xhrCandles.length > 0 && (
          <div 
            className="absolute top-0 bottom-0 right-0 pointer-events-none"
            style={{
              left: `${(candles.length / allCandles.length) * 100}%`,
              background: 'linear-gradient(90deg, transparent, hsl(185 100% 60% / 0.05))',
            }}
          />
        )}
      </div>

      {/* Price Labels */}
      <div className="absolute right-2 top-16 bottom-8 flex flex-col justify-between text-right">
        <span className="font-mono text-[10px] text-muted-foreground">
          ${maxPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          ${((maxPrice + minPrice) / 2).toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground">
          ${minPrice.toLocaleString(undefined, { maximumFractionDigits: 0 })}
        </span>
      </div>
    </div>
  );
};
