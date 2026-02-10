import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { TrendingUp, TrendingDown, Eye, Activity, BarChart2 } from 'lucide-react';

interface CandleData {
  time: string;
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isXHR?: boolean;
}

interface TradingChartProProps {
  symbol: string;
  showForesight?: boolean;
}

const generateHistoricalCandles = (basePrice: number, count: number): CandleData[] => {
  const candles: CandleData[] = [];
  let price = basePrice * 0.97;
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const volatility = 0.004 + Math.random() * 0.008;
    const trend = Math.random() > 0.45 ? 1 : -1;
    const momentum = Math.sin(i / 5) * 0.002;
    const change = (trend * volatility + momentum) * price * (0.3 + Math.random() * 0.7);
    const open = price;
    const close = price + change;
    const wickMultiplier = 0.2 + Math.random() * 0.4;
    const high = Math.max(open, close) + Math.abs(change) * wickMultiplier;
    const low = Math.min(open, close) - Math.abs(change) * wickMultiplier;
    const timestamp = now - (count - i) * 900000;
    
    candles.push({ 
      time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp,
      open, high, low, close,
      volume: 1000000 + Math.random() * 5000000
    });
    price = close;
  }
  return candles;
};

export const TradingChartPro: React.FC<TradingChartProProps> = ({ symbol, showForesight = true }) => {
  const { markets, foresight, settings, demoMode } = useOracle();
  const market = markets.find(m => m.symbol === symbol);
  const basePrice = market?.price || 67000;
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(600);
  
  const [candles, setCandles] = useState<CandleData[]>(() => generateHistoricalCandles(basePrice, 50));
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Measure container
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(entries => {
      for (const e of entries) setContainerWidth(e.contentRect.width);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!demoMode) return;
    const interval = setInterval(() => {
      setCandles(prev => {
        const lastCandle = prev[prev.length - 1];
        const volatility = 0.003 + Math.random() * 0.006;
        const trend = Math.random() > 0.45 ? 1 : -1;
        const change = trend * volatility * lastCandle.close;
        const open = lastCandle.close;
        const close = open + change;
        const high = Math.max(open, close) + Math.abs(change) * 0.25;
        const low = Math.min(open, close) - Math.abs(change) * 0.25;
        const now = Date.now();
        return [...prev.slice(1), { 
          time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: now, open, high, low, close,
          volume: 1000000 + Math.random() * 5000000
        }];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [demoMode]);

  const chartData = useMemo(() => {
    const data = [...candles];
    if (showForesight && foresight && foresight.confidence > 60) {
      const lastPrice = data[data.length - 1]?.close || basePrice;
      let price = lastPrice;
      const now = Date.now();
      for (let i = 0; i < 4; i++) {
        const bias = foresight.bias === 'bullish' ? 0.65 : foresight.bias === 'bearish' ? 0.35 : 0.5;
        const trend = Math.random() < bias ? 1 : -1;
        const intensity = (foresight.confidence / 100) * 0.006;
        const change = trend * intensity * price;
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.abs(change) * 0.3;
        const low = Math.min(open, close) - Math.abs(change) * 0.3;
        data.push({ time: `+${(i + 1) * 15}m`, timestamp: now + (i + 1) * 900000, open, high, low, close, volume: 0, isXHR: true });
        price = close;
      }
    }
    return data;
  }, [candles, showForesight, foresight, basePrice]);

  const currentPrice = chartData[chartData.length - (showForesight && foresight ? 5 : 1)]?.close || basePrice;
  const openPrice = chartData[0]?.open || currentPrice;
  const priceChange = currentPrice - openPrice;
  const priceChangePercent = (priceChange / openPrice) * 100;
  const isPositive = priceChange >= 0;

  const minPrice = Math.min(...chartData.map(d => d.low));
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const priceRange = maxPrice - minPrice;
  const paddedMin = minPrice - priceRange * 0.05;
  const paddedMax = maxPrice + priceRange * 0.05;
  const paddedRange = paddedMax - paddedMin;

  const maxVolume = Math.max(...chartData.map(d => d.volume));

  const chartHeight = 240;
  const volumeHeight = 50;
  const totalHeight = chartHeight + volumeHeight;
  const chartWidth = containerWidth;
  const leftPad = 0;
  const rightPad = 55;
  const usableWidth = chartWidth - leftPad - rightPad;
  const candleWidth = Math.max(3, usableWidth / chartData.length - 1.5);
  const candleGap = 1.5;

  const priceToY = (price: number) => chartHeight - ((price - paddedMin) / paddedRange) * chartHeight;

  const ma20 = useMemo(() => {
    return chartData.map((_, i) => {
      if (i < 19) return null;
      const sum = chartData.slice(i - 19, i + 1).reduce((acc, c) => acc + c.close, 0);
      return sum / 20;
    });
  }, [chartData]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  // Price labels on y-axis
  const priceLabels = useMemo(() => {
    const labels = [];
    const steps = 5;
    for (let i = 0; i <= steps; i++) {
      const price = paddedMin + (paddedRange / steps) * i;
      labels.push({ price, y: priceToY(price) });
    }
    return labels;
  }, [paddedMin, paddedRange, chartHeight]);

  return (
    <div className="card-premium p-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="font-mono text-lg font-bold">{symbol}</h3>
            <span className="text-xs text-muted-foreground px-2 py-0.5 bg-muted/50 rounded-md">15m</span>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Activity className="w-3 h-3" />
              <span>Live</span>
            </div>
          </div>
          <div className="flex items-center gap-3 mt-1">
            <span className="font-mono text-2xl font-bold">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`flex items-center gap-1 font-mono text-sm px-2 py-0.5 rounded-md ${
              isPositive ? 'text-oracle-green bg-oracle-green/10' : 'text-oracle-red bg-oracle-red/10'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {showForesight && foresight && (
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end mb-1.5">
              <Eye className="w-4 h-4 text-primary" />
              <span className="badge-preview">XHR Foresight</span>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
                foresight.bias === 'bullish' ? 'bg-oracle-green/15 text-oracle-green' :
                foresight.bias === 'bearish' ? 'bg-oracle-red/15 text-oracle-red' :
                'bg-muted text-muted-foreground'
              }`}>
                {foresight.bias.toUpperCase()}
              </span>
              <span className="font-mono text-sm text-primary font-semibold">{foresight.confidence}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart Area */}
      <div ref={containerRef} className="relative rounded-xl overflow-hidden border border-border/30" style={{ height: totalHeight + 20, background: 'hsl(var(--card))' }}>
        <svg 
          width="100%" 
          height={totalHeight + 20}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHoveredCandle(null)}
          style={{ cursor: 'crosshair' }}
        >
          {/* Horizontal grid lines */}
          {priceLabels.map((label, i) => (
            <line key={i} x1={leftPad} y1={label.y} x2={chartWidth - rightPad} y2={label.y}
              stroke="hsl(var(--border))" strokeOpacity="0.25" strokeDasharray="2 3" />
          ))}

          {/* Current price dashed line */}
          <line x1={leftPad} y1={priceToY(currentPrice)} x2={chartWidth - rightPad} y2={priceToY(currentPrice)}
            stroke="hsl(var(--primary))" strokeOpacity="0.5" strokeDasharray="4 3" strokeWidth="0.75" />

          {/* MA20 Line */}
          <path
            d={ma20.map((ma, i) => {
              if (ma === null) return '';
              const x = leftPad + i * (candleWidth + candleGap) + candleWidth / 2;
              const y = priceToY(ma);
              return `${i === 19 ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none" stroke="hsl(var(--oracle-purple))" strokeWidth="1.2" strokeOpacity="0.5"
          />

          {/* Candlesticks */}
          {chartData.map((candle, i) => {
            const x = leftPad + i * (candleWidth + candleGap);
            const isGreen = candle.close >= candle.open;
            const bodyTop = priceToY(Math.max(candle.open, candle.close));
            const bodyBottom = priceToY(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            const wickTop = priceToY(candle.high);
            const wickBottom = priceToY(candle.low);
            const color = isGreen ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))';
            const opacity = candle.isXHR ? settings.foresightOpacity / 100 : 1;

            return (
              <g key={i} opacity={opacity}
                onMouseEnter={() => setHoveredCandle(candle)}
              >
                {/* Wick */}
                <line x1={x + candleWidth / 2} y1={wickTop} x2={x + candleWidth / 2} y2={wickBottom}
                  stroke={color} strokeWidth={0.8} />
                {/* Body */}
                <rect x={x} y={bodyTop} width={candleWidth} height={bodyHeight}
                  fill={isGreen ? color : 'transparent'} stroke={color} strokeWidth={0.8} rx={0.5} />
                {/* XHR marker */}
                {candle.isXHR && (
                  <rect x={x - 1} y={bodyTop - 1} width={candleWidth + 2} height={bodyHeight + 2}
                    fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} rx={1} opacity={0.35} />
                )}
              </g>
            );
          })}

          {/* Volume bars */}
          {chartData.map((candle, i) => {
            if (candle.isXHR) return null;
            const x = leftPad + i * (candleWidth + candleGap);
            const volRatio = maxVolume > 0 ? candle.volume / maxVolume : 0;
            const barH = volRatio * volumeHeight * 0.8;
            const isGreen = candle.close >= candle.open;
            return (
              <rect key={`v-${i}`} x={x} y={chartHeight + (volumeHeight - barH) + 10}
                width={candleWidth} height={barH}
                fill={isGreen ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))'}
                opacity={0.35} rx={0.5}
              />
            );
          })}

          {/* Y-axis price labels */}
          {priceLabels.map((label, i) => (
            <text key={`pl-${i}`} x={chartWidth - 4} y={label.y + 3}
              textAnchor="end" fontSize="9" fontFamily="var(--font-mono)"
              fill="hsl(var(--muted-foreground))">
              {label.price < 10 ? label.price.toFixed(4) : label.price.toFixed(2)}
            </text>
          ))}

          {/* Current price tag */}
          <g>
            <rect x={chartWidth - rightPad + 2} y={priceToY(currentPrice) - 9} width={rightPad - 4} height={18}
              fill="hsl(var(--primary))" rx={3} />
            <text x={chartWidth - rightPad + 6} y={priceToY(currentPrice) + 3.5}
              fontSize="9" fontFamily="var(--font-mono)" fill="hsl(var(--primary-foreground))">
              {currentPrice < 10 ? currentPrice.toFixed(4) : currentPrice.toFixed(2)}
            </text>
          </g>

          {/* Crosshair */}
          {hoveredCandle && (
            <>
              <line x1={mousePos.x} y1={0} x2={mousePos.x} y2={totalHeight}
                stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeDasharray="2 2" />
              <line x1={leftPad} y1={mousePos.y} x2={chartWidth - rightPad} y2={mousePos.y}
                stroke="hsl(var(--muted-foreground))" strokeOpacity={0.3} strokeDasharray="2 2" />
            </>
          )}

          {/* Volume label */}
          {chartData.length > 0 && (() => {
            const lastReal = [...chartData].filter(c => !c.isXHR).pop();
            if (!lastReal) return null;
            const volStr = lastReal.volume >= 1e6 ? `${(lastReal.volume / 1e6).toFixed(2)} M` : lastReal.volume.toLocaleString();
            return (
              <text x={chartWidth - 4} y={chartHeight + 20}
                textAnchor="end" fontSize="9" fontFamily="var(--font-mono)"
                fill="hsl(var(--oracle-cyan))">
                {volStr}
              </text>
            );
          })()}
        </svg>

        {/* Tooltip */}
        {hoveredCandle && (
          <div className="absolute top-2 left-2 bg-popover/95 backdrop-blur-sm border border-border rounded-lg p-3 shadow-xl z-10">
            <div className="text-xs text-muted-foreground mb-1.5">{hoveredCandle.time}</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
              <span className="text-muted-foreground">O:</span>
              <span className="font-mono text-right">{hoveredCandle.open?.toFixed(2)}</span>
              <span className="text-muted-foreground">H:</span>
              <span className="font-mono text-right text-oracle-green">{hoveredCandle.high?.toFixed(2)}</span>
              <span className="text-muted-foreground">L:</span>
              <span className="font-mono text-right text-oracle-red">{hoveredCandle.low?.toFixed(2)}</span>
              <span className="text-muted-foreground">C:</span>
              <span className={`font-mono text-right ${hoveredCandle.close >= hoveredCandle.open ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {hoveredCandle.close?.toFixed(2)}
              </span>
              {hoveredCandle.volume > 0 && (
                <>
                  <span className="text-muted-foreground">Vol:</span>
                  <span className="font-mono text-right text-oracle-cyan">{(hoveredCandle.volume / 1e6).toFixed(2)}M</span>
                </>
              )}
            </div>
            {hoveredCandle.isXHR && (
              <div className="mt-2 pt-2 border-t border-border text-[10px] text-primary flex items-center gap-1">
                <Eye className="w-3 h-3" />
                Oracle Foresight Projection
              </div>
            )}
          </div>
        )}
      </div>

      {/* Chart footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/30">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <BarChart2 className="w-3 h-3" />
            H: <span className="font-mono text-foreground">${maxPrice.toFixed(2)}</span>
          </span>
          <span>L: <span className="font-mono text-foreground">${minPrice.toFixed(2)}</span></span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-oracle-purple rounded" />
            MA20
          </span>
        </div>
        {showForesight && foresight && (
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse shadow-lg shadow-primary/50" />
            <span className="text-xs text-muted-foreground">XHR Active</span>
          </div>
        )}
      </div>
    </div>
  );
};
