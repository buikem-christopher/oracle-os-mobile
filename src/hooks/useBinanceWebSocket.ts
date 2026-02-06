import { useState, useEffect, useCallback, useRef } from 'react';

interface BinancePrice {
  symbol: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume: number;
}

interface UseBinanceWebSocketOptions {
  symbols: string[];
  enabled: boolean;
}

// Map our symbol format to Binance format
const toBinanceSymbol = (symbol: string): string => {
  return symbol.replace('/', '').toLowerCase();
};

// Map Binance symbol back to our format
const fromBinanceSymbol = (symbol: string): string => {
  const upper = symbol.toUpperCase();
  if (upper.endsWith('USDT')) {
    return upper.replace('USDT', '/USDT');
  }
  return upper;
};

export const useBinanceWebSocket = ({ symbols, enabled }: UseBinanceWebSocketOptions) => {
  const [prices, setPrices] = useState<Record<string, BinancePrice>>({});
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);

  const connect = useCallback(() => {
    if (!enabled || symbols.length === 0) return;

    // Clean up existing connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    const binanceSymbols = symbols.map(toBinanceSymbol);
    
    // Use combined streams for multiple symbols
    const streams = binanceSymbols.map(s => `${s}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('Binance WebSocket connected');
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.stream && data.data) {
            const ticker = data.data;
            const symbol = fromBinanceSymbol(ticker.s);
            
            setPrices(prev => ({
              ...prev,
              [symbol]: {
                symbol,
                price: parseFloat(ticker.c),
                change24h: parseFloat(ticker.P),
                high24h: parseFloat(ticker.h),
                low24h: parseFloat(ticker.l),
                volume: parseFloat(ticker.v),
              },
            }));
          }
        } catch (e) {
          console.error('Error parsing Binance message:', e);
        }
      };

      ws.onerror = (event) => {
        console.error('Binance WebSocket error:', event);
        setError('Connection error');
        setIsConnected(false);
      };

      ws.onclose = (event) => {
        console.log('Binance WebSocket closed:', event.code, event.reason);
        setIsConnected(false);
        
        // Attempt to reconnect with exponential backoff
        if (enabled && reconnectAttempts.current < 5) {
          const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
          reconnectAttempts.current += 1;
          
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Attempting to reconnect (attempt ${reconnectAttempts.current})...`);
            connect();
          }, delay);
        }
      };
    } catch (e) {
      console.error('Error creating WebSocket:', e);
      setError('Failed to connect');
    }
  }, [enabled, symbols]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  useEffect(() => {
    if (enabled) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [enabled, connect, disconnect]);

  // Reconnect when symbols change
  useEffect(() => {
    if (enabled && isConnected) {
      disconnect();
      connect();
    }
  }, [symbols.join(',')]);

  return {
    prices,
    isConnected,
    error,
    reconnect: connect,
  };
};
