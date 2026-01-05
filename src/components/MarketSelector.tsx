import React, { useState } from 'react';
import { ChevronDown, TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useOracle } from '@/contexts/OracleContext';

export const MarketSelector: React.FC = () => {
  const { markets, selectedMarket, setSelectedMarket } = useOracle();
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const selectedMarketData = markets.find(m => m.symbol === selectedMarket);
  
  const filteredMarkets = markets.filter(m => 
    m.symbol.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full glass-card p-3 flex items-center justify-between hover:border-primary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-oracle flex items-center justify-center">
            <span className="text-xs font-bold text-primary-foreground">
              {selectedMarket.split('/')[0].slice(0, 2)}
            </span>
          </div>
          <div className="text-left">
            <p className="font-mono text-sm font-medium">{selectedMarket}</p>
            <p className="font-mono text-xs text-muted-foreground">
              ${selectedMarketData?.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {selectedMarketData && (
            <span className={`font-mono text-xs flex items-center gap-1 ${
              selectedMarketData.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'
            }`}>
              {selectedMarketData.change24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {selectedMarketData.change24h >= 0 ? '+' : ''}{selectedMarketData.change24h.toFixed(2)}%
            </span>
          )}
          <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div
            className="absolute top-full left-0 right-0 mt-2 z-50 glass-card overflow-hidden animate-fade-in"
          >
            {/* Search */}
            <div className="p-2 border-b border-border/50">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search markets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-muted/50 rounded-lg pl-9 pr-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
              </div>
            </div>

            {/* Markets List */}
            <div className="max-h-64 overflow-y-auto">
              {filteredMarkets.map((market) => (
                <button
                  key={market.symbol}
                  onClick={() => {
                    setSelectedMarket(market.symbol);
                    setIsOpen(false);
                    setSearch('');
                  }}
                  className={`w-full p-3 flex items-center justify-between hover:bg-muted/50 transition-colors ${
                    market.symbol === selectedMarket ? 'bg-primary/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                      <span className="text-xs font-bold text-muted-foreground">
                        {market.symbol.split('/')[0].slice(0, 2)}
                      </span>
                    </div>
                    <div className="text-left">
                      <p className="font-mono text-sm font-medium">{market.symbol}</p>
                      <p className="font-mono text-xs text-muted-foreground">
                        Vol: ${(market.volume / 1e9).toFixed(2)}B
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-sm">
                      ${market.price.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    </p>
                    <p className={`font-mono text-xs flex items-center justify-end gap-1 ${
                      market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'
                    }`}>
                      {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
