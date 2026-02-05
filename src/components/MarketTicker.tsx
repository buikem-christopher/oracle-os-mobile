import React from 'react';
import { useOracle } from '@/contexts/OracleContext';

export const MarketTicker: React.FC = () => {
  const { markets } = useOracle();

  return (
    <div className="relative overflow-hidden py-2">
      <div className="flex gap-6 animate-ticker">
        {[...markets, ...markets].map((market, i) => (
          <div key={`${market.symbol}-${i}`} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-mono text-xs text-muted-foreground">{market.symbol}</span>
            <span className="font-mono text-xs">
              ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className={`font-mono text-[10px] ${market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
              {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
