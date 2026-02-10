import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type AgentState = 'spawning' | 'active' | 'paused' | 'killed' | 'expired';
export type AgentPerformance = 'profit' | 'loss' | 'volatile' | 'foresight' | 'neutral';
export type OracleModel = 'preview' | 'exp' | 'rpm';
export type TradingMode = 'manual' | 'semi-agentic' | 'full-agentic';
export type RiskPreset = 'conservative' | 'moderate' | 'aggressive' | 'custom';
export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export interface Agent {
  id: string;
  name: string;
  market: string;
  interval: TimeFrame;
  state: AgentState;
  performance: AgentPerformance;
  model: OracleModel;
  pnl: number;
  pnlPercent: number;
  confidence: number;
  trades: number;
  winRate: number;
  capitalAllocated: number;
  spawnedAt: Date;
  lastAction?: string;
  strategy?: string;
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
  marketCap?: number;
}

export interface XHRForesight {
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  horizon: string;
  projectedCandles: { open: number; close: number; high: number; low: number; time: number }[];
  signals: { type: 'buy' | 'sell' | 'hold'; strength: number }[];
}

export interface InvestorContract {
  id: string;
  investorName: string;
  amount: number;
  profitShare: number;
  status: 'pending' | 'active' | 'completed' | 'rejected';
  createdAt: Date;
}

export interface ActivityItem {
  id: string;
  type: 'spawn' | 'kill' | 'trade' | 'profit' | 'loss' | 'deposit' | 'withdraw' | 'alert' | 'system';
  message: string;
  timestamp: Date;
  agentName?: string;
  amount?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
}

export interface TradeHistory {
  id: string;
  agentId?: string;
  agentName?: string;
  market: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  pnl?: number;
  timestamp: Date;
  status: 'open' | 'closed' | 'pending';
}

export interface Alert {
  id: string;
  type: 'price' | 'pnl' | 'agent' | 'system';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  timestamp: Date;
  read: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
  memberSince: Date;
  tier: 'free' | 'pro' | 'enterprise';
  totalTrades: number;
  winRate: number;
  bestTrade: number;
  worstTrade: number;
}

export interface OracleSettings {
  tradingMode: TradingMode;
  defaultModel: OracleModel;
  maxAgents: number;
  maxBalancePerAgent: number;
  maxDailyLoss: number;
  maxDrawdown: number;
  riskPreset: RiskPreset;
  confidenceThreshold: number;
  volatilityTolerance: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  autoExecute: boolean;
  confirmTrades: boolean;
  killSwitchEnabled: boolean;
  killSwitchThreshold: number;
  theme: 'dark' | 'light' | 'system';
  glowIntensity: number;
  foresightOpacity: number;
  compactMode: boolean;
  showPnlInHeader: boolean;
  soundEnabled: boolean;
  pushNotifications: boolean;
  emailAlerts: boolean;
  alertOnProfit: number;
  alertOnLoss: number;
  defaultTimeframe: TimeFrame;
  sessionTimeout: number;
  debugMode: boolean;
  apiRateLimit: number;
  dataRefreshRate: number;
}

interface OracleContextType {
  isLive: boolean;
  setIsLive: (value: boolean) => void;
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
  user: UserProfile;
  updateUser: (updates: Partial<UserProfile>) => void;
  agents: Agent[];
  spawnAgent: (market: string, model: OracleModel, strategy?: string) => void;
  killAgent: (id: string) => void;
  pauseAgent: (id: string) => void;
  resumeAgent: (id: string) => void;
  markets: MarketData[];
  selectedMarket: string;
  setSelectedMarket: (symbol: string) => void;
  foresight: XHRForesight | null;
  showForesight: boolean;
  setShowForesight: (value: boolean) => void;
  portfolio: {
    totalCapital: number;
    availableCapital: number;
    totalPnL: number;
    totalPnLPercent: number;
    activeAgents: number;
    todayPnL: number;
    weekPnL: number;
    monthPnL: number;
  };
  depositCapital: (amount: number) => void;
  withdrawCapital: (amount: number) => void;
  portfolioHistory: { value: number; timestamp: Date }[];
  tradeHistory: TradeHistory[];
  activityFeed: ActivityItem[];
  alerts: Alert[];
  markAlertRead: (id: string) => void;
  clearAlerts: () => void;
  achievements: Achievement[];
  contracts: InvestorContract[];
  approveContract: (id: string) => void;
  rejectContract: (id: string) => void;
  settings: OracleSettings;
  updateSettings: (updates: Partial<OracleSettings>) => void;
  fullAgenticMode: boolean;
  launchFullAgentic: () => void;
  stopFullAgentic: () => void;
  watchlist: string[];
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  loadUserProfile: () => Promise<void>;
}

const OracleContext = createContext<OracleContextType | null>(null);

const generateId = () => Math.random().toString(36).substr(2, 9);

// Crypto pairs
const CRYPTO_PAIRS: MarketData[] = [
  { symbol: 'BTC/USDT', price: 67432.50, change24h: 2.34, volume: 28400000000, high24h: 68100, low24h: 65800, marketCap: 1320000000000 },
  { symbol: 'ETH/USDT', price: 3521.80, change24h: 1.87, volume: 14200000000, high24h: 3580, low24h: 3420, marketCap: 423000000000 },
  { symbol: 'SOL/USDT', price: 178.42, change24h: -0.92, volume: 3200000000, high24h: 185, low24h: 172, marketCap: 78000000000 },
  { symbol: 'BNB/USDT', price: 612.30, change24h: 0.45, volume: 1800000000, high24h: 620, low24h: 600, marketCap: 91000000000 },
  { symbol: 'XRP/USDT', price: 0.6234, change24h: 3.21, volume: 2100000000, high24h: 0.65, low24h: 0.58, marketCap: 34000000000 },
  { symbol: 'ADA/USDT', price: 0.4521, change24h: -1.23, volume: 890000000, high24h: 0.47, low24h: 0.44, marketCap: 16000000000 },
  { symbol: 'AVAX/USDT', price: 38.42, change24h: 4.12, volume: 620000000, high24h: 39.5, low24h: 36.2, marketCap: 14500000000 },
  { symbol: 'DOGE/USDT', price: 0.1234, change24h: -2.15, volume: 1200000000, high24h: 0.128, low24h: 0.118, marketCap: 17600000000 },
];

// Forex pairs
const FOREX_PAIRS: MarketData[] = [
  { symbol: 'EUR/USD', price: 1.0842, change24h: 0.12, volume: 850000000000, high24h: 1.0865, low24h: 1.0820 },
  { symbol: 'GBP/USD', price: 1.2654, change24h: -0.08, volume: 420000000000, high24h: 1.2680, low24h: 1.2630 },
  { symbol: 'USD/JPY', price: 149.85, change24h: 0.24, volume: 580000000000, high24h: 150.10, low24h: 149.50 },
  { symbol: 'USD/CHF', price: 0.8842, change24h: -0.15, volume: 180000000000, high24h: 0.8860, low24h: 0.8825 },
  { symbol: 'AUD/USD', price: 0.6532, change24h: 0.32, volume: 220000000000, high24h: 0.6550, low24h: 0.6510 },
  { symbol: 'USD/CAD', price: 1.3625, change24h: -0.18, volume: 195000000000, high24h: 1.3650, low24h: 1.3600 },
  { symbol: 'NZD/USD', price: 0.6125, change24h: 0.08, volume: 85000000000, high24h: 0.6140, low24h: 0.6105 },
  { symbol: 'EUR/GBP', price: 0.8568, change24h: 0.22, volume: 120000000000, high24h: 0.8585, low24h: 0.8550 },
  { symbol: 'EUR/JPY', price: 162.45, change24h: 0.35, volume: 145000000000, high24h: 162.80, low24h: 162.10 },
  { symbol: 'GBP/JPY', price: 189.62, change24h: 0.18, volume: 98000000000, high24h: 190.00, low24h: 189.20 },
  { symbol: 'AUD/JPY', price: 97.85, change24h: 0.55, volume: 72000000000, high24h: 98.20, low24h: 97.50 },
  { symbol: 'EUR/CHF', price: 0.9585, change24h: -0.05, volume: 68000000000, high24h: 0.9600, low24h: 0.9570 },
  { symbol: 'GBP/CHF', price: 1.1195, change24h: -0.22, volume: 52000000000, high24h: 1.1220, low24h: 1.1175 },
  { symbol: 'CAD/JPY', price: 110.02, change24h: 0.42, volume: 45000000000, high24h: 110.30, low24h: 109.75 },
  { symbol: 'AUD/CAD', price: 0.8895, change24h: 0.28, volume: 38000000000, high24h: 0.8915, low24h: 0.8870 },
  { symbol: 'NZD/JPY', price: 91.78, change24h: 0.32, volume: 32000000000, high24h: 92.00, low24h: 91.55 },
  { symbol: 'EUR/AUD', price: 1.6602, change24h: -0.18, volume: 48000000000, high24h: 1.6640, low24h: 1.6575 },
  { symbol: 'GBP/AUD', price: 1.9375, change24h: -0.38, volume: 42000000000, high24h: 1.9420, low24h: 1.9340 },
  { symbol: 'USD/SGD', price: 1.3425, change24h: 0.08, volume: 28000000000, high24h: 1.3440, low24h: 1.3405 },
  { symbol: 'USD/HKD', price: 7.7985, change24h: 0.02, volume: 35000000000, high24h: 7.8000, low24h: 7.7965 },
];

const MARKET_PAIRS: MarketData[] = [...CRYPTO_PAIRS, ...FOREX_PAIRS];

const AGENT_NAMES = [
  'Nexus-α', 'Quantum-Σ', 'Cipher-Ω', 'Vector-Δ', 
  'Pulse-Ψ', 'Helix-Φ', 'Nova-Θ', 'Apex-Λ',
  'Titan-Ξ', 'Prism-Γ', 'Echo-Π', 'Flux-Υ'
];

const STRATEGIES = [
  'Momentum Surge', 'Mean Reversion', 'Breakout Hunter', 
  'Trend Follower', 'Scalper Pro', 'Swing Master'
];

const defaultSettings: OracleSettings = {
  tradingMode: 'semi-agentic',
  defaultModel: 'preview',
  maxAgents: 6,
  maxBalancePerAgent: 15,
  maxDailyLoss: 10,
  maxDrawdown: 20,
  riskPreset: 'moderate',
  confidenceThreshold: 70,
  volatilityTolerance: 50,
  stopLossPercent: 5,
  takeProfitPercent: 10,
  autoExecute: false,
  confirmTrades: true,
  killSwitchEnabled: true,
  killSwitchThreshold: 15,
  theme: 'dark',
  glowIntensity: 60,
  foresightOpacity: 45,
  compactMode: false,
  showPnlInHeader: true,
  soundEnabled: true,
  pushNotifications: true,
  emailAlerts: false,
  alertOnProfit: 100,
  alertOnLoss: 50,
  defaultTimeframe: '15m',
  sessionTimeout: 30,
  debugMode: false,
  apiRateLimit: 100,
  dataRefreshRate: 2,
};

export const OracleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLive, setIsLive] = useState(false);
  const [demoMode, setDemoMode] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [markets, setMarkets] = useState<MarketData[]>(MARKET_PAIRS);
  const [selectedMarket, setSelectedMarket] = useState('BTC/USDT');
  const [showForesight, setShowForesight] = useState(true);
  const [fullAgenticMode, setFullAgenticMode] = useState(false);
  const [watchlist, setWatchlist] = useState<string[]>(['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'EUR/USD', 'GBP/USD']);
  const [tradeHistory, setTradeHistory] = useState<TradeHistory[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: '1',
      type: 'system',
      title: 'Welcome to Oracle OS v1',
      message: 'Your trading intelligence platform is ready. Start by exploring the markets.',
      severity: 'info',
      timestamp: new Date(),
      read: false,
    }
  ]);

  const [user, setUser] = useState<UserProfile>({
    name: 'User',
    email: 'user@example.com',
    memberSince: new Date(),
    tier: 'free',
    totalTrades: 0,
    winRate: 0,
    bestTrade: 0,
    worstTrade: 0,
  });

  const [contracts, setContracts] = useState<InvestorContract[]>([]);
  
  const [settings, setSettings] = useState<OracleSettings>(defaultSettings);

  const [portfolio, setPortfolio] = useState({
    totalCapital: 1000,
    availableCapital: 1000,
    totalPnL: 0,
    totalPnLPercent: 0,
    activeAgents: 0,
    todayPnL: 0,
    weekPnL: 0,
    monthPnL: 0,
  });

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([
    { id: '1', type: 'system', message: 'Oracle OS v1 initialized', timestamp: new Date() }
  ]);
  
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', name: 'First Steps', description: 'Spawn your first agent', icon: 'rocket', unlocked: false, tier: 'bronze' },
    { id: '2', name: 'Profitable', description: 'Earn $100 in profit', icon: 'trending-up', unlocked: false, tier: 'bronze' },
    { id: '3', name: 'Multi-Agent', description: 'Run 3 agents simultaneously', icon: 'bot', unlocked: false, tier: 'silver' },
    { id: '4', name: 'Risk Manager', description: 'Kill an underperforming agent', icon: 'shield', unlocked: false, tier: 'bronze' },
    { id: '5', name: 'Whale Status', description: 'Reach $10,000 portfolio value', icon: 'star', unlocked: false, tier: 'gold' },
    { id: '6', name: 'Oracle Master', description: 'Achieve 80% win rate', icon: 'crown', unlocked: false, tier: 'platinum' },
    { id: '7', name: 'Full Agentic', description: 'Launch full agentic mode', icon: 'zap', unlocked: false, tier: 'silver' },
    { id: '8', name: 'Streak', description: '5 profitable trades in a row', icon: 'flame', unlocked: false, tier: 'gold' },
  ]);

  const [portfolioHistory, setPortfolioHistory] = useState<{ value: number; timestamp: Date }[]>([
    { value: 1000, timestamp: new Date() }
  ]);

  const [foresight, setForesight] = useState<XHRForesight>({
    bias: 'bullish',
    confidence: 78,
    horizon: '4h',
    projectedCandles: [],
    signals: [{ type: 'buy', strength: 0.72 }],
  });

  // Load user profile from Supabase
  const loadUserProfile = useCallback(async () => {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .maybeSingle();

      if (profile) {
        setUser({
          name: profile.name || 'User',
          email: profile.email || authUser.email || '',
          avatar: profile.avatar_url || undefined,
          memberSince: new Date(profile.created_at || Date.now()),
          tier: (profile.tier as 'free' | 'pro' | 'enterprise') || 'free',
          totalTrades: profile.total_trades || 0,
          winRate: profile.win_rate || 0,
          bestTrade: profile.best_trade || 0,
          worstTrade: profile.worst_trade || 0,
        });

        setPortfolio(prev => ({
          ...prev,
          totalCapital: profile.total_capital || 1000,
          availableCapital: profile.available_capital || 1000,
          totalPnL: profile.total_pnl || 0,
        }));
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }, []);

  // Load profile on mount
  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  // Apply theme
  useEffect(() => {
    const root = document.documentElement;
    if (settings.theme === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else if (settings.theme === 'dark') {
      root.classList.remove('light');
      root.classList.add('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
        root.classList.remove('light');
      } else {
        root.classList.add('light');
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  // Binance WebSocket for live crypto data
  useEffect(() => {
    if (demoMode) return;
    
    const cryptoSymbols = CRYPTO_PAIRS.map(p => p.symbol.replace('/', '').toLowerCase());
    const streams = cryptoSymbols.map(s => `${s}@ticker`).join('/');
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;
    
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;
    
    const connect = () => {
      try {
        ws = new WebSocket(wsUrl);
        ws.onopen = () => console.log('Binance WS connected for live data');
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.stream && data.data) {
              const t = data.data;
              const upper = t.s.toUpperCase();
              const symbol = upper.endsWith('USDT') ? upper.replace('USDT', '/USDT') : upper;
              setMarkets(prev => prev.map(m => {
                if (m.symbol !== symbol) return m;
                return {
                  ...m,
                  price: parseFloat(t.c),
                  change24h: parseFloat(t.P),
                  high24h: parseFloat(t.h),
                  low24h: parseFloat(t.l),
                  volume: parseFloat(t.v),
                };
              }));
            }
          } catch (e) { /* ignore parse errors */ }
        };
        ws.onclose = () => {
          reconnectTimeout = setTimeout(connect, 5000);
        };
        ws.onerror = () => ws?.close();
      } catch (e) {
        console.error('Binance WS error:', e);
      }
    };
    
    connect();
    
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      ws?.close();
    };
  }, [demoMode]);

  // Realistic market simulation (demo mode only)
  useEffect(() => {
    if (!demoMode) return;
    
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => {
        const isForex = m.symbol.includes('/USD') && !m.symbol.includes('USDT');
        const volatility = isForex ? 0.0002 : m.symbol.includes('BTC') ? 0.0008 : 0.0015;
        const trend = Math.random() > 0.48 ? 1 : -1;
        const change = trend * volatility * m.price * (0.5 + Math.random());
        const newPrice = Math.max(m.price * 0.95, Math.min(m.price * 1.05, m.price + change));
        
        return {
          ...m,
          price: newPrice,
          change24h: m.change24h + (Math.random() - 0.5) * 0.05,
          high24h: Math.max(m.high24h, newPrice),
          low24h: Math.min(m.low24h, newPrice),
        };
      }));
    }, settings.dataRefreshRate * 1000);
    
    return () => clearInterval(interval);
  }, [demoMode, settings.dataRefreshRate]);

  // Realistic agent P&L simulation
  useEffect(() => {
    if (!demoMode || agents.length === 0) return;
    
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.state !== 'active') return agent;
        
        const modelMultiplier = agent.model === 'rpm' ? 1.5 : agent.model === 'exp' ? 1.2 : 1;
        const winProbability = 0.52 + (agent.confidence / 1000);
        const isWin = Math.random() < winProbability;
        
        const baseChange = agent.capitalAllocated * 0.002;
        const pnlChange = isWin ? baseChange * modelMultiplier : -baseChange * 0.8;
        
        const newPnl = agent.pnl + pnlChange;
        const newPnlPercent = (newPnl / agent.capitalAllocated) * 100;
        
        let performance: AgentPerformance = 'neutral';
        if (newPnlPercent > 3) performance = 'profit';
        else if (newPnlPercent < -3) performance = 'loss';
        else if (Math.abs(newPnlPercent) > 1.5) performance = 'volatile';
        if (agent.confidence > 85) performance = 'foresight';
        
        const shouldTrade = Math.random() > 0.85;
        const newTrades = shouldTrade ? agent.trades + 1 : agent.trades;
        const newWinRate = shouldTrade && isWin 
          ? ((agent.winRate * agent.trades) + 100) / newTrades
          : shouldTrade 
            ? ((agent.winRate * agent.trades)) / newTrades
            : agent.winRate;
        
        return {
          ...agent,
          pnl: newPnl,
          pnlPercent: newPnlPercent,
          performance,
          confidence: Math.max(50, Math.min(98, agent.confidence + (Math.random() - 0.5) * 3)),
          trades: newTrades,
          winRate: Math.max(0, Math.min(100, newWinRate)),
        };
      }));

      const totalAgentPnl = agents.reduce((sum, a) => sum + a.pnl, 0);
      setPortfolio(prev => ({
        ...prev,
        totalPnL: totalAgentPnl,
        totalPnLPercent: (totalAgentPnl / prev.totalCapital) * 100,
        todayPnL: prev.todayPnL + (Math.random() - 0.48) * 0.1,
      }));
    }, 2500);
    
    return () => clearInterval(interval);
  }, [demoMode, agents]);

  // Update foresight periodically
  useEffect(() => {
    if (!demoMode) return;
    
    const interval = setInterval(() => {
      setForesight(prev => ({
        ...prev,
        confidence: Math.max(55, Math.min(95, prev.confidence + (Math.random() - 0.5) * 8)),
        bias: Math.random() > 0.85 
          ? (Math.random() > 0.5 ? 'bullish' : 'bearish') 
          : prev.bias,
        signals: [{ 
          type: Math.random() > 0.6 ? 'buy' : Math.random() > 0.5 ? 'sell' : 'hold', 
          strength: 0.5 + Math.random() * 0.4 
        }],
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [demoMode]);

  // Portfolio history tracking
  useEffect(() => {
    if (!demoMode) return;
    const interval = setInterval(() => {
      setPortfolioHistory(prev => [
        ...prev.slice(-99),
        { value: portfolio.totalCapital + portfolio.totalPnL, timestamp: new Date() }
      ]);
    }, 10000);
    return () => clearInterval(interval);
  }, [demoMode, portfolio.totalCapital, portfolio.totalPnL]);

  const addActivity = useCallback((type: ActivityItem['type'], message: string, agentName?: string, amount?: number) => {
    const newActivity: ActivityItem = {
      id: generateId(),
      type,
      message,
      timestamp: new Date(),
      agentName,
      amount,
    };
    setActivityFeed(prev => [newActivity, ...prev].slice(0, 100));
  }, []);

  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.map(a => 
      a.id === achievementId && !a.unlocked 
        ? { ...a, unlocked: true, unlockedAt: new Date() } 
        : a
    ));
  }, []);

  // Achievement checks
  useEffect(() => {
    const activeCount = agents.filter(a => a.state === 'active' || a.state === 'spawning').length;
    if (activeCount >= 1) unlockAchievement('1');
    if (activeCount >= 3) unlockAchievement('3');
    if (portfolio.totalPnL >= 100) unlockAchievement('2');
    if (portfolio.totalCapital + portfolio.totalPnL >= 10000) unlockAchievement('5');
    if (fullAgenticMode) unlockAchievement('7');
  }, [agents, portfolio, fullAgenticMode, unlockAchievement]);

  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => ({ ...prev, ...updates }));
  }, []);

  const depositCapital = useCallback((amount: number) => {
    if (amount <= 0) return;
    setPortfolio(prev => ({
      ...prev,
      totalCapital: prev.totalCapital + amount,
      availableCapital: prev.availableCapital + amount,
    }));
    addActivity('deposit', `Deposited $${amount.toLocaleString()}`, undefined, amount);
  }, [addActivity]);

  const withdrawCapital = useCallback((amount: number) => {
    if (amount <= 0 || amount > portfolio.availableCapital) return;
    setPortfolio(prev => ({
      ...prev,
      totalCapital: prev.totalCapital - amount,
      availableCapital: prev.availableCapital - amount,
    }));
    addActivity('withdraw', `Withdrew $${amount.toLocaleString()}`, undefined, amount);
  }, [portfolio.availableCapital, addActivity]);

  const spawnAgent = useCallback((market: string, model: OracleModel, strategy?: string) => {
    if (agents.filter(a => a.state === 'active' || a.state === 'spawning').length >= settings.maxAgents) {
      return;
    }

    const usedNames = agents.map(a => a.name);
    const availableNames = AGENT_NAMES.filter(n => !usedNames.includes(n));
    const name = availableNames[0] || `Agent-${generateId().slice(0, 4)}`;
    
    const capital = Math.min(
      portfolio.availableCapital * (settings.maxBalancePerAgent / 100),
      portfolio.availableCapital
    );
    
    if (capital < 10) return;

    const newAgent: Agent = {
      id: generateId(),
      name,
      market,
      interval: settings.defaultTimeframe,
      state: 'spawning',
      performance: 'neutral',
      model,
      pnl: 0,
      pnlPercent: 0,
      confidence: 60 + Math.random() * 25,
      trades: 0,
      winRate: 0,
      capitalAllocated: capital,
      spawnedAt: new Date(),
      strategy: strategy || STRATEGIES[Math.floor(Math.random() * STRATEGIES.length)],
    };
    
    setAgents(prev => [...prev, newAgent]);
    setPortfolio(prev => ({
      ...prev,
      availableCapital: prev.availableCapital - capital,
      activeAgents: prev.activeAgents + 1,
    }));
    
    addActivity('spawn', `${name} deployed on ${market}`, name, capital);
    
    setTimeout(() => {
      setAgents(prev => prev.map(a => 
        a.id === newAgent.id ? { ...a, state: 'active' } : a
      ));
    }, 1200);
  }, [agents, portfolio.availableCapital, settings.maxAgents, settings.maxBalancePerAgent, settings.defaultTimeframe, addActivity]);

  const killAgent = useCallback((id: string) => {
    const agent = agents.find(a => a.id === id);
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, state: 'killed' } : a
    ));
    
    if (agent) {
      const returnedCapital = agent.capitalAllocated + agent.pnl;
      
      setTradeHistory(prev => [...prev, {
        id: generateId(),
        agentId: agent.id,
        agentName: agent.name,
        market: agent.market,
        type: 'sell',
        amount: agent.capitalAllocated,
        price: markets.find(m => m.symbol === agent.market)?.price || 0,
        pnl: agent.pnl,
        timestamp: new Date(),
        status: 'closed',
      }]);

      setPortfolio(prev => ({
        ...prev,
        availableCapital: prev.availableCapital + returnedCapital,
        totalPnL: prev.totalPnL + agent.pnl,
        activeAgents: Math.max(0, prev.activeAgents - 1),
      }));
      
      addActivity('kill', `${agent.name} terminated | ${agent.pnl >= 0 ? '+' : ''}$${agent.pnl.toFixed(2)}`, agent.name, agent.pnl);
      unlockAchievement('4');
    }
  }, [agents, markets, addActivity, unlockAchievement]);

  const pauseAgent = useCallback((id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, state: 'paused' } : a
    ));
  }, []);

  const resumeAgent = useCallback((id: string) => {
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, state: 'active' } : a
    ));
  }, []);

  const approveContract = useCallback((id: string) => {
    setContracts(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'active' } : c
    ));
  }, []);

  const rejectContract = useCallback((id: string) => {
    setContracts(prev => prev.map(c => 
      c.id === id ? { ...c, status: 'rejected' } : c
    ));
  }, []);

  const updateSettings = useCallback((updates: Partial<OracleSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const markAlertRead = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  const clearAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  const addToWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => prev.includes(symbol) ? prev : [...prev, symbol]);
  }, []);

  const removeFromWatchlist = useCallback((symbol: string) => {
    setWatchlist(prev => prev.filter(s => s !== symbol));
  }, []);

  const launchFullAgentic = useCallback(() => {
    setFullAgenticMode(true);
    addActivity('system', 'Full Agentic Mode activated');
    
    const marketsToTrade = MARKET_PAIRS.slice(0, Math.min(settings.maxAgents, 4));
    marketsToTrade.forEach((market, index) => {
      setTimeout(() => {
        spawnAgent(market.symbol, settings.defaultModel);
      }, index * 600);
    });
  }, [settings.maxAgents, settings.defaultModel, spawnAgent, addActivity]);

  const stopFullAgentic = useCallback(() => {
    setFullAgenticMode(false);
    addActivity('system', 'Full Agentic Mode deactivated');
    
    agents.forEach(agent => {
      if (agent.state === 'active' || agent.state === 'spawning') {
        killAgent(agent.id);
      }
    });
  }, [agents, killAgent, addActivity]);

  return (
    <OracleContext.Provider value={{
      isLive,
      setIsLive,
      demoMode,
      setDemoMode,
      user,
      updateUser,
      agents,
      spawnAgent,
      killAgent,
      pauseAgent,
      resumeAgent,
      markets,
      selectedMarket,
      setSelectedMarket,
      foresight,
      showForesight,
      setShowForesight,
      portfolio,
      depositCapital,
      withdrawCapital,
      portfolioHistory,
      tradeHistory,
      activityFeed,
      alerts,
      markAlertRead,
      clearAlerts,
      achievements,
      contracts,
      approveContract,
      rejectContract,
      settings,
      updateSettings,
      fullAgenticMode,
      launchFullAgentic,
      stopFullAgentic,
      watchlist,
      addToWatchlist,
      removeFromWatchlist,
      loadUserProfile,
    }}>
      {children}
    </OracleContext.Provider>
  );
};

export const useOracle = () => {
  const context = useContext(OracleContext);
  if (!context) {
    throw new Error('useOracle must be used within OracleProvider');
  }
  return context;
};
