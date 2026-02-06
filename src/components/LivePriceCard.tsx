import React, { useEffect, useState, useRef } from 'react';
import { TrendingUp, TrendingDown, Radio, RefreshCw } from 'lucide-react';

interface LivePriceCardProps {
  symbol: string;
  initialPrice: number;
  demoMode?: boolean;
}

export const LivePriceCard: React.FC<LivePriceCardProps> = ({ symbol, initialPrice, demoMode = true }) => {
  const [price, setPrice] = useState(initialPrice);
  const [previousPrice, setPreviousPrice] = useState(initialPrice);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const simulationIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clean up function
    const cleanup = () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      if (simulationIntervalRef.current) {
        clearInterval(simulationIntervalRef.current);
        simulationIntervalRef.current = null;
      }
    };

    if (demoMode) {
      // Use simulated data in demo mode
      setIsConnected(false);
      simulationIntervalRef.current = setInterval(() => {
        setPrice(prev => {
          setPreviousPrice(prev);
          const change = (Math.random() - 0.5) * prev * 0.001;
          return prev + change;
        });
      }, 1500);
      return cleanup;
    }

    // Real Binance WebSocket connection
    const binanceSymbol = symbol.replace('/', '').toLowerCase();
    const wsUrl = `wss://stream.binance.com:9443/ws/${binanceSymbol}@trade`;

    const connect = () => {
      try {
        const ws = new WebSocket(wsUrl);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log(`WebSocket connected for ${symbol}`);
          setIsConnected(true);
          setConnectionError(null);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.p) {
              setPreviousPrice(price);
              setPrice(parseFloat(data.p));
            }
          } catch (e) {
            // Handle parse error silently
          }
        };

        ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          setConnectionError('Connection error');
          setIsConnected(false);
        };

        ws.onclose = (event) => {
          console.log('WebSocket closed:', event.code);
          setIsConnected(false);
          
          // Reconnect after 5 seconds
          if (!demoMode) {
            reconnectTimeoutRef.current = setTimeout(() => {
              console.log('Attempting to reconnect...');
              connect();
            }, 5000);
          }
        };
      } catch (e) {
        console.error('Failed to create WebSocket:', e);
        setConnectionError('Failed to connect');
        
        // Fall back to simulation
        simulationIntervalRef.current = setInterval(() => {
          setPrice(prev => {
            setPreviousPrice(prev);
            const change = (Math.random() - 0.5) * prev * 0.001;
            return prev + change;
          });
        }, 1500);
      }
    };

    connect();
    return cleanup;
  }, [symbol, demoMode]);

  const isUp = price >= previousPrice;
  const changePercent = ((price - initialPrice) / initialPrice) * 100;

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Radio className={`w-3 h-3 ${isConnected ? 'text-oracle-green animate-pulse' : demoMode ? 'text-oracle-orange' : 'text-muted-foreground'}`} />
          <span className="text-xs text-muted-foreground">
            {isConnected ? 'Live' : demoMode ? 'Demo' : connectionError || 'Connecting...'}
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
