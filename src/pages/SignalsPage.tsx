import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, MinusCircle,
  Activity, Eye, BarChart2, Zap, Globe, Radio, Flame
} from 'lucide-react';

export const SignalsPage: React.FC = () => {
  const { markets, foresight, demoMode } = useOracle();

  // Separate crypto and forex
  const cryptoMarkets = markets.filter(m => m.symbol.includes('USDT'));
  const forexMarkets = markets.filter(m => !m.symbol.includes('USDT'));

  // Generate signals for display
  const generateSignal = (market: { symbol: string; change24h: number; price: number }) => {
    const momentum = market.change24h;
    if (momentum > 1.5) return { type: 'strong-buy', label: 'Strong Buy', color: 'text-oracle-green', bg: 'bg-oracle-green/15' };
    if (momentum > 0.5) return { type: 'buy', label: 'Buy', color: 'text-oracle-green', bg: 'bg-oracle-green/10' };
    if (momentum < -1.5) return { type: 'strong-sell', label: 'Strong Sell', color: 'text-oracle-red', bg: 'bg-oracle-red/15' };
    if (momentum < -0.5) return { type: 'sell', label: 'Sell', color: 'text-oracle-red', bg: 'bg-oracle-red/10' };
    return { type: 'hold', label: 'Hold', color: 'text-muted-foreground', bg: 'bg-muted' };
  };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Signals</h1>
        <p className="text-xs text-muted-foreground">Oracle Market Intelligence & Trade Signals</p>
      </header>

      {/* Main Signal Card */}
      <div className="card-premium p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Oracle Master Signal</span>
          </div>
          <div className="flex items-center gap-2">
            <Radio className="w-3 h-3 text-oracle-green animate-pulse" />
            <span className="badge-live">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-5">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${
            foresight?.bias === 'bullish' ? 'bg-oracle-green/15 border border-oracle-green/25' : 
            foresight?.bias === 'bearish' ? 'bg-oracle-red/15 border border-oracle-red/25' : 'bg-muted border border-border'
          }`}>
            {foresight?.bias === 'bullish' ? <ArrowUpCircle className="w-10 h-10 text-oracle-green" /> :
             foresight?.bias === 'bearish' ? <ArrowDownCircle className="w-10 h-10 text-oracle-red" /> :
             <MinusCircle className="w-10 h-10 text-muted-foreground" />}
          </div>
          <div className="flex-1">
            <p className="text-3xl font-bold capitalize mb-1">{foresight?.bias || 'Neutral'}</p>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">Confidence: <span className="text-primary font-mono font-semibold">{foresight?.confidence}%</span></span>
              <span className="text-muted-foreground">Horizon: <span className="font-mono">{foresight?.horizon}</span></span>
            </div>
          </div>
        </div>
        
        {/* Signal strength bar */}
        <div className="mt-4 pt-4 border-t border-border/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Signal Strength</span>
            <span className="text-xs font-mono text-primary">{foresight?.signals[0]?.strength ? `${(foresight.signals[0].strength * 100).toFixed(0)}%` : '—'}</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                foresight?.bias === 'bullish' ? 'bg-oracle-green' : 
                foresight?.bias === 'bearish' ? 'bg-oracle-red' : 'bg-muted-foreground'
              }`}
              style={{ width: `${(foresight?.signals[0]?.strength || 0) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card-elevated p-3 text-center">
          <Flame className="w-4 h-4 mx-auto mb-1.5 text-oracle-orange" />
          <div className="font-mono text-lg font-bold">{cryptoMarkets.filter(m => m.change24h > 0).length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Bullish Crypto</div>
        </div>
        <div className="card-elevated p-3 text-center">
          <Globe className="w-4 h-4 mx-auto mb-1.5 text-primary" />
          <div className="font-mono text-lg font-bold">{forexMarkets.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Forex Pairs</div>
        </div>
        <div className="card-elevated p-3 text-center">
          <Zap className="w-4 h-4 mx-auto mb-1.5 text-oracle-gold" />
          <div className="font-mono text-lg font-bold">{markets.filter(m => Math.abs(m.change24h) > 2).length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">High Vol</div>
        </div>
      </div>

      {/* Top Movers */}
      <div className="card-premium p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-oracle-green" />
            <span className="text-sm font-medium">Top Movers</span>
          </div>
          <span className="text-xs text-muted-foreground">24h</span>
        </div>
        <div className="space-y-2">
          {[...markets].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 5).map((market) => {
            const signal = generateSignal(market);
            return (
              <div key={market.symbol} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/30">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${signal.bg} flex items-center justify-center`}>
                    {market.change24h >= 0 ? 
                      <TrendingUp className={`w-4 h-4 ${signal.color}`} /> : 
                      <TrendingDown className={`w-4 h-4 ${signal.color}`} />
                    }
                  </div>
                  <div>
                    <p className="font-mono text-sm font-semibold">{market.symbol}</p>
                    <p className="text-xs text-muted-foreground">${market.price.toLocaleString(undefined, { maximumFractionDigits: market.price < 1 ? 4 : 2 })}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`font-mono text-sm font-semibold ${market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                    {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                  </span>
                  <p className={`text-[10px] font-semibold ${signal.color}`}>{signal.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Forex Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-medium">Forex Markets</h2>
          </div>
          <span className="text-xs text-muted-foreground">{forexMarkets.length} pairs</span>
        </div>
        <div className="space-y-1.5">
          {forexMarkets.map(market => {
            const signal = generateSignal(market);
            return (
              <div key={market.symbol} className="card-elevated p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className={`w-2 h-2 ${demoMode ? 'text-oracle-orange' : 'text-oracle-green animate-pulse'}`} />
                  <div>
                    <p className="font-mono text-sm font-semibold">{market.symbol}</p>
                    <p className="font-mono text-xs text-muted-foreground">{market.price.toFixed(4)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm ${market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                    {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${signal.bg} ${signal.color}`}>
                    {signal.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Crypto Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-oracle-gold" />
            <h2 className="text-sm font-medium">Crypto Markets</h2>
          </div>
          <span className="text-xs text-muted-foreground">{cryptoMarkets.length} pairs</span>
        </div>
        <div className="space-y-1.5">
          {cryptoMarkets.map(market => {
            const signal = generateSignal(market);
            return (
              <div key={market.symbol} className="card-elevated p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Radio className={`w-2 h-2 ${demoMode ? 'text-oracle-orange' : 'text-oracle-green animate-pulse'}`} />
                  <div>
                    <p className="font-mono text-sm font-semibold">{market.symbol}</p>
                    <p className="font-mono text-xs text-muted-foreground">${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`font-mono text-sm ${market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                    {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${signal.bg} ${signal.color}`}>
                    {signal.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Signal Legend */}
      <div className="card-elevated p-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Signal Legend</h3>
        <div className="grid grid-cols-5 gap-2 text-center text-[10px]">
          <div className="p-2 rounded-lg bg-oracle-green/15">
            <span className="text-oracle-green font-semibold">Strong Buy</span>
          </div>
          <div className="p-2 rounded-lg bg-oracle-green/10">
            <span className="text-oracle-green font-semibold">Buy</span>
          </div>
          <div className="p-2 rounded-lg bg-muted">
            <span className="text-muted-foreground font-semibold">Hold</span>
          </div>
          <div className="p-2 rounded-lg bg-oracle-red/10">
            <span className="text-oracle-red font-semibold">Sell</span>
          </div>
          <div className="p-2 rounded-lg bg-oracle-red/15">
            <span className="text-oracle-red font-semibold">Strong Sell</span>
          </div>
        </div>
      </div>
    </div>
  );
};
