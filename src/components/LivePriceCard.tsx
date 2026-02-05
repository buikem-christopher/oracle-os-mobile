import React, { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Radio } from 'lucide-react';

interface LivePriceCardProps {
  symbol: string;
  initialPrice: number;
}

export const LivePriceCard: React.FC<LivePriceCardProps> = ({ symbol, initialPrice }) => {
  const [price, setPrice] = useState(initialPrice);
  const [previousPrice, setPreviousPrice] = useState(initialPrice);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Simulated WebSocket connection for demo
    // In production, connect to real exchange WebSocket
    const ws = new WebSocket(`wss://stream.binance.com:9443/ws/${symbol.toLowerCase().replace('/', '')}@trade`);
    
    ws.onopen = () => {
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.p) {
          setPreviousPrice(price);
          setPrice(parseFloat(data.p));
        }
      } catch (e) {
        // Handle parse error
      }
    };

    ws.onerror = () => {
      setIsConnected(false);
      // Fallback to simulated updates
      const interval = setInterval(() => {
        setPreviousPrice((prev) => price);
        setPrice((prev) => prev + (Math.random() - 0.5) * prev * 0.001);
      }, 1000);
      return () => clearInterval(interval);
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    return () => {
      ws.close();
    };
  }, [symbol]);

  const isUp = price >= previousPrice;
  const changePercent = ((price - initialPrice) / initialPrice) * 100;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radio className={`w-3 h-3 ${isConnected ? 'text-oracle-green animate-pulse' : 'text-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Live' : 'Simulated'}
          </span>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{symbol}</span>
      </div>
      <div className="flex items-end justify-between">
        <div className={`font-mono text-2xl font-bold transition-colors ${isUp ? 'text-oracle-green' : 'text-oracle-red'}`}>
          ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className={`flex items-center gap-1 ${changePercent >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
          {changePercent >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
          <span className="font-mono text-sm">{changePercent >= 0 ? '+' : ''}{changePercent.toFixed(2)}%</span>
        </div>
      </div>
    </div>
  );
};
