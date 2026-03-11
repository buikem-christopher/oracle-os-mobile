import React, { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { TrendingUp, TrendingDown, Eye, Activity, BarChart2, EyeOff } from 'lucide-react';

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
  
  // Create realistic market microstructure
  let trend = 0;
  let volatilityRegime = 0.005;
  
  for (let i = 0; i < count; i++) {
    // Regime changes
    if (Math.random() < 0.08) {
      trend = (Math.random() - 0.5) * 0.003;
      volatilityRegime = 0.003 + Math.random() * 0.008;
    }
    
    const momentum = Math.sin(i / 7) * 0.001 + trend;
    const noise = (Math.random() - 0.5) * volatilityRegime;
    const change = (momentum + noise) * price;
    
    const open = price;
    const close = price + change;
    
    // Realistic wicks - upper wick tends to be longer in uptrends
    const upperWickRatio = 0.15 + Math.random() * 0.6;
    const lowerWickRatio = 0.15 + Math.random() * 0.6;
    const bodyRange = Math.abs(change);
    const high = Math.max(open, close) + bodyRange * upperWickRatio;
    const low = Math.min(open, close) - bodyRange * lowerWickRatio;
    
    // Volume correlates with price movement magnitude
    const baseVol = 2000000 + Math.random() * 3000000;
    const movementVol = Math.abs(change / price) * 50000000;
    const volume = baseVol + movementVol + (Math.random() < 0.1 ? Math.random() * 8000000 : 0);
    
    const timestamp = now - (count - i) * 900000;
    
    candles.push({ 
      time: new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp,
      open, high, low, close,
      volume,
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
  const [xhrVisible, setXhrVisible] = useState(true);
  
  const [candles, setCandles] = useState<CandleData[]>(() => generateHistoricalCandles(basePrice, 60));
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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
        // More realistic tick generation
        const recentTrend = (prev[prev.length - 1].close - prev[Math.max(0, prev.length - 5)].close) / prev[Math.max(0, prev.length - 5)].close;
        const meanReversion = -recentTrend * 0.1;
        const volatility = 0.002 + Math.random() * 0.005;
        const trend = Math.random() > 0.47 ? 1 : -1;
        const change = (trend * volatility + meanReversion) * lastCandle.close;
        const open = lastCandle.close;
        const close = open + change;
        const bodyRange = Math.abs(change);
        const high = Math.max(open, close) + bodyRange * (0.2 + Math.random() * 0.5);
        const low = Math.min(open, close) - bodyRange * (0.2 + Math.random() * 0.5);
        const now = Date.now();
        const baseVol = 2000000 + Math.random() * 3000000;
        const movementVol = Math.abs(change / open) * 40000000;
        return [...prev.slice(1), { 
          time: new Date(now).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          timestamp: now, open, high, low, close,
          volume: baseVol + movementVol,
        }];
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [demoMode]);

  const showXHR = showForesight && xhrVisible;

  const chartData = useMemo(() => {
    const data = [...candles];
    if (showXHR && foresight && foresight.confidence > 60) {
      const lastPrice = data[data.length - 1]?.close || basePrice;
      let price = lastPrice;
      const now = Date.now();
      for (let i = 0; i < 5; i++) {
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
  }, [candles, showXHR, foresight, basePrice]);

  const realCandles = chartData.filter(c => !c.isXHR);
  const currentPrice = realCandles[realCandles.length - 1]?.close || basePrice;
  const openPrice = chartData[0]?.open || currentPrice;
  const priceChange = currentPrice - openPrice;
  const priceChangePercent = (priceChange / openPrice) * 100;
  const isPositive = priceChange >= 0;

  const minPrice = Math.min(...chartData.map(d => d.low));
  const maxPrice = Math.max(...chartData.map(d => d.high));
  const priceRange = maxPrice - minPrice;
  const paddedMin = minPrice - priceRange * 0.08;
  const paddedMax = maxPrice + priceRange * 0.08;
  const paddedRange = paddedMax - paddedMin;

  const maxVolume = Math.max(...chartData.map(d => d.volume));

  const chartHeight = 260;
  const volumeHeight = 55;
  const totalHeight = chartHeight + volumeHeight;
  const chartWidth = containerWidth;
  const leftPad = 0;
  const rightPad = 58;
  const usableWidth = chartWidth - leftPad - rightPad;
  const candleWidth = Math.max(3, usableWidth / chartData.length - 1.5);
  const candleGap = 1.5;

  const priceToY = (price: number) => chartHeight - ((price - paddedMin) / paddedRange) * chartHeight;

  // EMA 9 and EMA 21 for more sophisticated indicators
  const ema = useMemo(() => {
    const ema9: (number | null)[] = [];
    const ema21: (number | null)[] = [];
    let e9 = chartData[0]?.close || 0;
    let e21 = chartData[0]?.close || 0;
    const k9 = 2 / 10;
    const k21 = 2 / 22;
    chartData.forEach((c, i) => {
      e9 = c.close * k9 + e9 * (1 - k9);
      e21 = c.close * k21 + e21 * (1 - k21);
      ema9.push(i >= 8 ? e9 : null);
      ema21.push(i >= 20 ? e21 : null);
    });
    return { ema9, ema21 };
  }, [chartData]);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  }, []);

  const priceLabels = useMemo(() => {
    const labels = [];
    const steps = 6;
    for (let i = 0; i <= steps; i++) {
      const price = paddedMin + (paddedRange / steps) * i;
      labels.push({ price, y: priceToY(price) });
    }
    return labels;
  }, [paddedMin, paddedRange, chartHeight]);

  // XHR confidence gradient zone
  const xhrZone = useMemo(() => {
    if (!showXHR || !foresight) return null;
    const xhrCandles = chartData.filter(c => c.isXHR);
    if (xhrCandles.length === 0) return null;
    
    const firstXhrIdx = chartData.findIndex(c => c.isXHR);
    const startX = leftPad + firstXhrIdx * (candleWidth + candleGap);
    const endX = leftPad + (chartData.length - 1) * (candleWidth + candleGap) + candleWidth;
    
    return { startX, endX, confidence: foresight.confidence };
  }, [showXHR, foresight, chartData, leftPad, candleWidth, candleGap]);

  // Volume color gradient based on relative volume
  const avgVolume = useMemo(() => {
    const vols = chartData.filter(c => !c.isXHR).map(c => c.volume);
    return vols.reduce((s, v) => s + v, 0) / vols.length;
  }, [chartData]);

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
        
        <div className="text-right">
          {showForesight && foresight && (
            <>
              <div className="flex items-center gap-2 justify-end mb-1.5">
                <button 
                  onClick={() => setXhrVisible(!xhrVisible)}
                  className={`p-1 rounded transition-colors ${xhrVisible ? 'text-primary' : 'text-muted-foreground'}`}
                >
                  {xhrVisible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                </button>
                <span className="badge-preview">XHR</span>
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
            </>
          )}
        </div>
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
          <defs>
            <linearGradient id="xhrConfGrad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.12} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
            <linearGradient id="regimeGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={foresight?.bias === 'bullish' ? 'hsl(var(--oracle-green))' : foresight?.bias === 'bearish' ? 'hsl(var(--oracle-red))' : 'hsl(var(--muted-foreground))'} stopOpacity={0.08} />
              <stop offset="100%" stopColor="transparent" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="volGradGreen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--oracle-green))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--oracle-green))" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="volGradRed" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--oracle-red))" stopOpacity="0.5" />
              <stop offset="100%" stopColor="hsl(var(--oracle-red))" stopOpacity="0.15" />
            </linearGradient>
            <filter id="candleGlow">
              <feGaussianBlur stdDeviation="1" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* XHR projection zone background */}
          {xhrZone && (
            <>
              <rect x={xhrZone.startX - 2} y={0} width={xhrZone.endX - xhrZone.startX + 4} height={chartHeight}
                fill="url(#xhrConfGrad)" />
              <rect x={xhrZone.startX - 2} y={0} width={xhrZone.endX - xhrZone.startX + 4} height={chartHeight}
                fill="url(#regimeGrad)" />
              <line x1={xhrZone.startX - 2} y1={0} x2={xhrZone.startX - 2} y2={chartHeight}
                stroke="hsl(var(--primary))" strokeOpacity={0.25} strokeDasharray="4 4" strokeWidth={1} />
              <text x={xhrZone.startX + 4} y={14} fontSize="8" fontFamily="var(--font-mono)" fill="hsl(var(--primary))" opacity={0.6}>
                PROJECTION
              </text>
            </>
          )}

          {/* Horizontal grid lines */}
          {priceLabels.map((label, i) => (
            <line key={i} x1={leftPad} y1={label.y} x2={chartWidth - rightPad} y2={label.y}
              stroke="hsl(var(--border))" strokeOpacity="0.15" strokeDasharray="2 4" />
          ))}

          {/* Current price dashed line */}
          <line x1={leftPad} y1={priceToY(currentPrice)} x2={chartWidth - rightPad} y2={priceToY(currentPrice)}
            stroke="hsl(var(--primary))" strokeOpacity="0.5" strokeDasharray="4 3" strokeWidth="0.75" />

          {/* EMA Lines */}
          <path
            d={ema.ema21.map((val, i) => {
              if (val === null) return '';
              const x = leftPad + i * (candleWidth + candleGap) + candleWidth / 2;
              const y = priceToY(val);
              const first = ema.ema21.findIndex(v => v !== null);
              return `${i === first ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none" stroke="hsl(var(--oracle-purple))" strokeWidth="1" strokeOpacity="0.4"
          />
          <path
            d={ema.ema9.map((val, i) => {
              if (val === null) return '';
              const x = leftPad + i * (candleWidth + candleGap) + candleWidth / 2;
              const y = priceToY(val);
              const first = ema.ema9.findIndex(v => v !== null);
              return `${i === first ? 'M' : 'L'} ${x} ${y}`;
            }).join(' ')}
            fill="none" stroke="hsl(var(--oracle-cyan))" strokeWidth="1" strokeOpacity="0.5"
          />

          {/* Candlesticks - institutional style */}
          {chartData.map((candle, i) => {
            const x = leftPad + i * (candleWidth + candleGap);
            const isGreen = candle.close >= candle.open;
            const bodyTop = priceToY(Math.max(candle.open, candle.close));
            const bodyBottom = priceToY(Math.min(candle.open, candle.close));
            const bodyHeight = Math.max(1, bodyBottom - bodyTop);
            const wickTop = priceToY(candle.high);
            const wickBottom = priceToY(candle.low);
            const greenColor = 'hsl(var(--oracle-green))';
            const redColor = 'hsl(var(--oracle-red))';
            const color = isGreen ? greenColor : redColor;
            
            // XHR opacity
            const xhrCandles = chartData.filter(c => c.isXHR);
            const xhrIndex = candle.isXHR ? xhrCandles.indexOf(candle) : -1;
            const opacity = candle.isXHR 
              ? Math.max(0.15, (settings.foresightOpacity / 100) * (1 - xhrIndex * 0.18))
              : 1;

            // Highlight last candle
            const isLast = i === realCandles.length - 1 && !candle.isXHR;

            return (
              <g key={i} opacity={opacity}
                onMouseEnter={() => setHoveredCandle(candle)}
              >
                {/* Upper wick */}
                <line x1={x + candleWidth / 2} y1={wickTop} x2={x + candleWidth / 2} y2={bodyTop}
                  stroke={color} strokeWidth={candleWidth > 5 ? 1 : 0.8} />
                {/* Lower wick */}
                <line x1={x + candleWidth / 2} y1={bodyBottom} x2={x + candleWidth / 2} y2={wickBottom}
                  stroke={color} strokeWidth={candleWidth > 5 ? 1 : 0.8} />
                {/* Body */}
                <rect x={x} y={bodyTop} width={candleWidth} height={bodyHeight}
                  fill={isGreen ? color : 'transparent'} stroke={color} strokeWidth={0.8} rx={0.5} />
                {/* Last candle glow */}
                {isLast && (
                  <rect x={x - 1} y={bodyTop - 1} width={candleWidth + 2} height={bodyHeight + 2}
                    fill="none" stroke={color} strokeWidth={1.5} rx={1} opacity={0.4}
                    filter="url(#candleGlow)" />
                )}
                {/* XHR candle marker */}
                {candle.isXHR && (
                  <rect x={x - 0.5} y={bodyTop - 0.5} width={candleWidth + 1} height={bodyHeight + 1}
                    fill="none" stroke="hsl(var(--primary))" strokeWidth={0.8} rx={0.5} opacity={0.3} strokeDasharray="2 2" />
                )}
              </g>
            );
          })}

          {/* Volume bars - gradient style */}
          {chartData.map((candle, i) => {
            if (candle.isXHR) return null;
            const x = leftPad + i * (candleWidth + candleGap);
            const volRatio = maxVolume > 0 ? candle.volume / maxVolume : 0;
            const barH = volRatio * volumeHeight * 0.85;
            const isGreen = candle.close >= candle.open;
            const isHighVol = candle.volume > avgVolume * 1.5;
            return (
              <g key={`v-${i}`}>
                <rect x={x} y={chartHeight + (volumeHeight - barH) + 10}
                  width={candleWidth} height={barH}
                  fill={isGreen ? 'url(#volGradGreen)' : 'url(#volGradRed)'}
                  rx={0.5}
                />
                {/* High volume indicator line */}
                {isHighVol && (
                  <line x1={x} y1={chartHeight + (volumeHeight - barH) + 10} 
                    x2={x + candleWidth} y2={chartHeight + (volumeHeight - barH) + 10}
                    stroke={isGreen ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))'} strokeWidth={1} opacity={0.6} />
                )}
              </g>
            );
          })}

          {/* Y-axis labels */}
          {priceLabels.map((label, i) => (
            <text key={`pl-${i}`} x={chartWidth - 4} y={label.y + 3}
              textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)"
              fill="hsl(var(--muted-foreground))" opacity={0.6}>
              {label.price < 10 ? label.price.toFixed(4) : label.price.toFixed(2)}
            </text>
          ))}

          {/* Current price tag */}
          <g>
            <rect x={chartWidth - rightPad + 2} y={priceToY(currentPrice) - 10} width={rightPad - 4} height={20}
              fill="hsl(var(--primary))" rx={4} />
            <text x={chartWidth - rightPad + 7} y={priceToY(currentPrice) + 4}
              fontSize="9" fontFamily="var(--font-mono)" fontWeight="600" fill="hsl(var(--primary-foreground))">
              {currentPrice < 10 ? currentPrice.toFixed(4) : currentPrice.toFixed(2)}
            </text>
          </g>

          {/* Crosshair */}
          {hoveredCandle && (
            <>
              <line x1={mousePos.x} y1={0} x2={mousePos.x} y2={totalHeight}
                stroke="hsl(var(--muted-foreground))" strokeOpacity={0.25} strokeDasharray="3 3" />
              <line x1={leftPad} y1={mousePos.y} x2={chartWidth - rightPad} y2={mousePos.y}
                stroke="hsl(var(--muted-foreground))" strokeOpacity={0.25} strokeDasharray="3 3" />
              {mousePos.y > 0 && mousePos.y < chartHeight && (
                <g>
                  <rect x={chartWidth - rightPad + 2} y={mousePos.y - 9} width={rightPad - 4} height={18}
                    fill="hsl(var(--muted))" rx={3} stroke="hsl(var(--border))" strokeWidth={0.5} />
                  <text x={chartWidth - rightPad + 7} y={mousePos.y + 3}
                    fontSize="8" fontFamily="var(--font-mono)" fill="hsl(var(--foreground))">
                    {(paddedMax - (mousePos.y / chartHeight) * paddedRange).toFixed(2)}
                  </text>
                </g>
              )}
            </>
          )}

          {/* Volume label */}
          {chartData.length > 0 && (() => {
            const lastReal = [...chartData].filter(c => !c.isXHR).pop();
            if (!lastReal) return null;
            const volStr = lastReal.volume >= 1e6 ? `${(lastReal.volume / 1e6).toFixed(2)}M` : lastReal.volume.toLocaleString();
            return (
              <text x={chartWidth - 4} y={chartHeight + 20}
                textAnchor="end" fontSize="8.5" fontFamily="var(--font-mono)"
                fill="hsl(var(--oracle-cyan))" opacity={0.7}>
                Vol {volStr}
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
              <div className="mt-2 pt-2 border-t border-border">
                <div className="text-[10px] text-primary flex items-center gap-1 mb-1">
                  <Eye className="w-3 h-3" />
                  Oracle Projection
                </div>
                <div className="text-[9px] text-muted-foreground">
                  Confidence: {foresight?.confidence}% • Non-tradable
                </div>
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
            <span className="w-2 h-0.5 bg-oracle-cyan rounded" /> EMA9
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-0.5 bg-oracle-purple rounded" /> EMA21
          </span>
        </div>
        {showForesight && foresight && (
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full shadow-lg ${xhrVisible ? 'bg-primary animate-pulse shadow-primary/50' : 'bg-muted-foreground'}`} />
            <span className="text-xs text-muted-foreground">{xhrVisible ? 'XHR Active' : 'XHR Off'}</span>
          </div>
        )}
      </div>
    </div>
  );
};
