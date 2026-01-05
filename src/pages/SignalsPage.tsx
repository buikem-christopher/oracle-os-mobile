import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { TrendingUp, TrendingDown, ArrowUpCircle, ArrowDownCircle, MinusCircle } from 'lucide-react';

export const SignalsPage: React.FC = () => {
  const { markets, foresight } = useOracle();

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Signals</h1>
        <p className="text-xs text-muted-foreground">Act Manually with Oracle Insights</p>
      </header>

      {/* Current Signal */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm text-muted-foreground">Oracle Signal</span>
          <span className="badge-preview">Live</span>
        </div>
        <div className="flex items-center gap-4">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${
            foresight?.bias === 'bullish' ? 'bg-oracle-green/20' : 
            foresight?.bias === 'bearish' ? 'bg-oracle-red/20' : 'bg-muted'
          }`}>
            {foresight?.bias === 'bullish' ? <ArrowUpCircle className="w-8 h-8 text-oracle-green" /> :
             foresight?.bias === 'bearish' ? <ArrowDownCircle className="w-8 h-8 text-oracle-red" /> :
             <MinusCircle className="w-8 h-8 text-muted-foreground" />}
          </div>
          <div>
            <p className="text-2xl font-bold capitalize">{foresight?.bias || 'Neutral'}</p>
            <p className="text-sm text-muted-foreground">Confidence: <span className="text-primary font-mono">{foresight?.confidence}%</span></p>
          </div>
        </div>
      </div>

      {/* Market Overview */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Markets</h2>
        <div className="space-y-2">
          {markets.map(market => (
            <div key={market.symbol} className="glass-card p-3 flex items-center justify-between">
              <div>
                <p className="font-mono text-sm font-medium">{market.symbol}</p>
                <p className="font-mono text-xs text-muted-foreground">${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
              </div>
              <span className={`font-mono text-sm flex items-center gap-1 ${market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {market.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
