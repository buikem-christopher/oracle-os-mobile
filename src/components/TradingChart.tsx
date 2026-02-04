import React, { useMemo, useEffect, useState } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  ComposedChart, Bar, Line, XAxis, YAxis, Tooltip, 
  ResponsiveContainer, ReferenceLine, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, Eye, Clock, Maximize2 } from 'lucide-react';

interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  isXHR?: boolean;
}

interface CandlestickChartProps {
  symbol: string;
  showForesight?: boolean;
}

const generateHistoricalCandles = (basePrice: number, count: number): CandleData[] => {
  const candles: CandleData[] = [];
  let price = basePrice * 0.97;
  const now = Date.now();
  
  for (let i = 0; i < count; i++) {
    const volatility = 0.006 + Math.random() * 0.01;
    const trend = Math.random() > 0.45 ? 1 : -1;
    const change = trend * volatility * price * (0.3 + Math.random() * 0.7);
    const open = price;
    const close = price + change;
    const wickMultiplier = 0.3 + Math.random() * 0.4;
    const high = Math.max(open, close) + Math.abs(change) * wickMultiplier;
    const low = Math.min(open, close) - Math.abs(change) * wickMultiplier;
    
    candles.push({ 
      time: new Date(now - (count - i) * 900000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      open, 
      high, 
      low, 
      close,
      volume: 1000000 + Math.random() * 5000000
    });
    price = close;
  }
  
  return candles;
};

export const TradingChart: React.FC<CandlestickChartProps> = ({ 
  symbol, 
  showForesight = true 
}) => {
  const { markets, foresight, settings, demoMode } = useOracle();
  const market = markets.find(m => m.symbol === symbol);
  const basePrice = market?.price || 67000;
  
  const [candles, setCandles] = useState<CandleData[]>(() => 
    generateHistoricalCandles(basePrice, 24)
  );

  // Simulate new candles in demo mode
  useEffect(() => {
    if (!demoMode) return;
    
    const interval = setInterval(() => {
      setCandles(prev => {
        const lastCandle = prev[prev.length - 1];
        const volatility = 0.004 + Math.random() * 0.008;
        const trend = Math.random() > 0.45 ? 1 : -1;
        const change = trend * volatility * lastCandle.close;
        const open = lastCandle.close;
        const close = open + change;
        const high = Math.max(open, close) + Math.abs(change) * 0.3;
        const low = Math.min(open, close) - Math.abs(change) * 0.3;
        
        return [...prev.slice(1), { 
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          open, 
          high, 
          low, 
          close,
          volume: 1000000 + Math.random() * 5000000
        }];
      });
    }, 4000);
    
    return () => clearInterval(interval);
  }, [demoMode]);

  const chartData = useMemo(() => {
    const data = candles.map(c => ({
      ...c,
      wickTop: c.high,
      wickBottom: c.low,
      bodyTop: Math.max(c.open, c.close),
      bodyBottom: Math.min(c.open, c.close),
      isGreen: c.close >= c.open,
    }));

    // Add XHR foresight candles
    if (showForesight && foresight && foresight.projectedCandles.length > 0) {
      const lastPrice = data[data.length - 1]?.close || basePrice;
      let price = lastPrice;
      
      for (let i = 0; i < 3; i++) {
        const bias = foresight.bias === 'bullish' ? 0.6 : foresight.bias === 'bearish' ? 0.4 : 0.5;
        const trend = Math.random() < bias ? 1 : -1;
        const change = trend * 0.005 * price * (foresight.confidence / 100);
        const open = price;
        const close = price + change;
        const high = Math.max(open, close) + Math.abs(change) * 0.4;
        const low = Math.min(open, close) - Math.abs(change) * 0.4;
        
        data.push({
          time: `+${(i + 1) * 15}m`,
          open,
          high,
          low,
          close,
          volume: 0,
          wickTop: high,
          wickBottom: low,
          bodyTop: Math.max(open, close),
          bodyBottom: Math.min(open, close),
          isGreen: close >= open,
          isXHR: true,
        });
        price = close;
      }
    }

    return data;
  }, [candles, showForesight, foresight, basePrice]);

  const currentPrice = chartData[chartData.length - (showForesight ? 4 : 1)]?.close || basePrice;
  const priceChange = currentPrice - (chartData[0]?.open || currentPrice);
  const priceChangePercent = (priceChange / chartData[0]?.open || 0) * 100;
  const isPositive = priceChange >= 0;

  const minPrice = Math.min(...chartData.map(d => d.low)) * 0.9995;
  const maxPrice = Math.max(...chartData.map(d => d.high)) * 1.0005;

  return (
    <div className="glass-card p-4">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-mono text-base font-semibold">{symbol}</h3>
            <span className="text-xs text-muted-foreground">15m</span>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="font-mono text-xl font-bold">
              ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`flex items-center gap-0.5 font-mono text-sm ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{priceChangePercent.toFixed(2)}%
            </span>
          </div>
        </div>
        
        {showForesight && foresight && (
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end mb-1">
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span className="badge-preview">XHR</span>
              <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${
                foresight.bias === 'bullish' ? 'bg-oracle-green/10 text-oracle-green' :
                foresight.bias === 'bearish' ? 'bg-oracle-red/10 text-oracle-red' :
                'bg-muted text-muted-foreground'
              }`}>
                {foresight.bias.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-1 justify-end text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              <span>{foresight.horizon}</span>
              <span className="font-mono text-primary ml-1">{foresight.confidence}%</span>
            </div>
          </div>
        )}
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              interval="preserveStartEnd"
            />
            <YAxis 
              domain={[minPrice, maxPrice]}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `$${(value / 1000).toFixed(1)}k`}
              orientation="right"
              width={45}
            />
            
            {/* Current price reference line */}
            <ReferenceLine 
              y={currentPrice} 
              stroke="hsl(var(--primary))" 
              strokeDasharray="3 3" 
              strokeOpacity={0.5}
            />
            
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload?.length) return null;
                const data = payload[0].payload;
                return (
                  <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
                    <div className="text-xs text-muted-foreground mb-1">{data.time}</div>
                    <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
                      <span className="text-muted-foreground">O:</span>
                      <span className="font-mono">${data.open?.toFixed(2)}</span>
                      <span className="text-muted-foreground">H:</span>
                      <span className="font-mono">${data.high?.toFixed(2)}</span>
                      <span className="text-muted-foreground">L:</span>
                      <span className="font-mono">${data.low?.toFixed(2)}</span>
                      <span className="text-muted-foreground">C:</span>
                      <span className={`font-mono ${data.isGreen ? 'text-oracle-green' : 'text-oracle-red'}`}>
                        ${data.close?.toFixed(2)}
                      </span>
                    </div>
                    {data.isXHR && (
                      <div className="mt-1 pt-1 border-t border-border text-[10px] text-primary">
                        Oracle Foresight
                      </div>
                    )}
                  </div>
                );
              }}
            />

            {/* Wicks */}
            <Bar dataKey="wickTop" fill="transparent" />
            
            {/* Candle bodies */}
            <Bar 
              dataKey="bodyTop" 
              barSize={6}
              shape={(props: any) => {
                const { x, y, width, payload } = props;
                const bodyHeight = Math.max(1, Math.abs(payload.bodyTop - payload.bodyBottom) / (maxPrice - minPrice) * 230);
                const wickHeight = Math.abs(payload.high - payload.low) / (maxPrice - minPrice) * 230;
                const wickY = 230 - ((payload.high - minPrice) / (maxPrice - minPrice) * 230) + 10;
                const bodyY = 230 - ((payload.bodyTop - minPrice) / (maxPrice - minPrice) * 230) + 10;
                
                const color = payload.isGreen ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))';
                const opacity = payload.isXHR ? settings.foresightOpacity / 100 : 1;
                
                return (
                  <g opacity={opacity}>
                    {/* Wick */}
                    <line
                      x1={x + width / 2}
                      y1={wickY}
                      x2={x + width / 2}
                      y2={wickY + wickHeight}
                      stroke={color}
                      strokeWidth={1}
                    />
                    {/* Body */}
                    <rect
                      x={x}
                      y={bodyY}
                      width={width}
                      height={bodyHeight}
                      fill={payload.isGreen ? color : 'transparent'}
                      stroke={color}
                      strokeWidth={1}
                      rx={1}
                    />
                    {/* XHR glow */}
                    {payload.isXHR && (
                      <rect
                        x={x - 2}
                        y={bodyY - 2}
                        width={width + 4}
                        height={bodyHeight + 4}
                        fill="none"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        rx={2}
                        opacity={0.3}
                        filter="blur(2px)"
                      />
                    )}
                  </g>
                );
              }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Chart footer */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>H: <span className="font-mono text-foreground">${maxPrice.toFixed(0)}</span></span>
          <span>L: <span className="font-mono text-foreground">${minPrice.toFixed(0)}</span></span>
        </div>
        {showForesight && foresight && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="text-xs text-muted-foreground">Foresight active</span>
          </div>
        )}
      </div>
    </div>
  );
};
