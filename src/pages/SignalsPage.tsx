import React, { useState, useMemo } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, MinusCircle,
  Activity, Eye, BarChart2, Zap, Globe, Radio, Flame, ChevronDown
} from 'lucide-react';
import { PortfolioSparkline } from '@/components/PortfolioSparkline';
import { SignalCardAdvanced } from '@/components/SignalCardAdvanced';
import { Motion3DCard } from '@/components/Motion3DCard';

type MarketTab = 'overview' | 'forex' | 'crypto';

export const SignalsPage: React.FC = () => {
  const { markets, foresight, demoMode } = useOracle();
  const [activeTab, setActiveTab] = useState<MarketTab>('overview');

  const cryptoMarkets = markets.filter(m => m.symbol.includes('USDT'));
  const forexMarkets = markets.filter(m => !m.symbol.includes('USDT'));

  const topMovers = useMemo(() => 
    [...markets].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 6),
  [markets]);

  const tabs: { key: MarketTab; label: string }[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'forex', label: 'Forex' },
    { key: 'crypto', label: 'Crypto' },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Signals</h1>
        <p className="text-xs text-muted-foreground">Oracle Market Intelligence & Trade Signals</p>
      </header>

      {/* Tab bar */}
      <div className="flex gap-2">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeTab === tab.key 
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25' 
                : 'bg-muted/50 text-muted-foreground hover:bg-muted'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Master Signal */}
      <Motion3DCard intensity={0.4}>
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
            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
              foresight?.bias === 'bullish' ? 'bg-oracle-green/15 border border-oracle-green/25' : 
              foresight?.bias === 'bearish' ? 'bg-oracle-red/15 border border-oracle-red/25' : 'bg-muted border border-border'
            }`}>
              {foresight?.bias === 'bullish' ? <ArrowUpCircle className="w-8 h-8 text-oracle-green" /> :
               foresight?.bias === 'bearish' ? <ArrowDownCircle className="w-8 h-8 text-oracle-red" /> :
               <MinusCircle className="w-8 h-8 text-muted-foreground" />}
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold capitalize mb-1">{foresight?.bias || 'Neutral'}</p>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-muted-foreground">Confidence: <span className="text-primary font-mono font-semibold">{foresight?.confidence}%</span></span>
                <span className="text-muted-foreground">Horizon: <span className="font-mono">{foresight?.horizon}</span></span>
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-border/30">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-muted-foreground">Signal Strength</span>
              <span className="text-xs font-mono text-primary">{foresight?.signals[0]?.strength ? `${(foresight.signals[0].strength * 100).toFixed(0)}%` : '—'}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-500 ${
                  foresight?.bias === 'bullish' ? 'bg-oracle-green' : 
                  foresight?.bias === 'bearish' ? 'bg-oracle-red' : 'bg-muted-foreground'
                }`}
                style={{ width: `${(foresight?.signals[0]?.strength || 0) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </Motion3DCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="card-elevated p-3 text-center">
          <Flame className="w-4 h-4 mx-auto mb-1.5 text-oracle-orange" />
          <div className="font-mono text-lg font-bold">{cryptoMarkets.filter(m => m.change24h > 0).length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Bullish</div>
        </div>
        <div className="card-elevated p-3 text-center">
          <Globe className="w-4 h-4 mx-auto mb-1.5 text-primary" />
          <div className="font-mono text-lg font-bold">{forexMarkets.length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">Forex</div>
        </div>
        <div className="card-elevated p-3 text-center">
          <Zap className="w-4 h-4 mx-auto mb-1.5 text-oracle-gold" />
          <div className="font-mono text-lg font-bold">{markets.filter(m => Math.abs(m.change24h) > 2).length}</div>
          <div className="text-[10px] text-muted-foreground uppercase">High Vol</div>
        </div>
      </div>

      {/* Overview: Top Movers Grid */}
      {activeTab === 'overview' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-oracle-green" />
              <h2 className="text-sm font-medium">Top Movers</h2>
            </div>
            <span className="text-xs text-muted-foreground">24h</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {topMovers.map(market => (
              <SignalCardAdvanced key={market.symbol} market={market} demoMode={demoMode} />
            ))}
          </div>
        </>
      )}

      {/* Forex Tab */}
      {activeTab === 'forex' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <h2 className="text-sm font-medium">Forex Markets</h2>
            </div>
            <span className="text-xs text-muted-foreground">{forexMarkets.length} pairs</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {forexMarkets.map(market => (
              <SignalCardAdvanced key={market.symbol} market={market} demoMode={demoMode} />
            ))}
          </div>
        </>
      )}

      {/* Crypto Tab */}
      {activeTab === 'crypto' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-oracle-gold" />
              <h2 className="text-sm font-medium">Crypto Markets</h2>
            </div>
            <span className="text-xs text-muted-foreground">{cryptoMarkets.length} pairs</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {cryptoMarkets.map(market => (
              <SignalCardAdvanced key={market.symbol} market={market} demoMode={demoMode} />
            ))}
          </div>
        </>
      )}

      {/* Signal Legend */}
      <div className="card-elevated p-4">
        <h3 className="text-xs font-medium text-muted-foreground mb-3 uppercase tracking-wider">Signal Legend</h3>
        <div className="grid grid-cols-5 gap-1.5 text-center text-[9px]">
          <div className="p-2 rounded-lg bg-oracle-green/15">
            <span className="text-oracle-green font-semibold">S.Buy</span>
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
            <span className="text-oracle-red font-semibold">S.Sell</span>
          </div>
        </div>
      </div>
    </div>
  );
};
