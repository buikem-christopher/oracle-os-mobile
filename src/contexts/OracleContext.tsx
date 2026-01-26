import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

export type AgentState = 'spawning' | 'active' | 'paused' | 'killed' | 'expired';
export type AgentPerformance = 'profit' | 'loss' | 'volatile' | 'foresight' | 'neutral';
export type OracleModel = 'preview' | 'exp' | 'ultra';

export interface Agent {
  id: string;
  name: string;
  market: string;
  interval: string;
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
}

export interface MarketData {
  symbol: string;
  price: number;
  change24h: number;
  volume: number;
  high24h: number;
  low24h: number;
}

export interface XHRForesight {
  bias: 'bullish' | 'bearish' | 'neutral';
  confidence: number;
  horizon: string;
  projectedCandles: { open: number; close: number; high: number; low: number }[];
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
  type: 'spawn' | 'kill' | 'trade' | 'profit' | 'loss' | 'deposit' | 'withdraw';
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
}

interface OracleContextType {
  // Demo Mode
  demoMode: boolean;
  setDemoMode: (value: boolean) => void;
  
  // Agents
  agents: Agent[];
  spawnAgent: (market: string, model: OracleModel) => void;
  killAgent: (id: string) => void;
  pauseAgent: (id: string) => void;
  resumeAgent: (id: string) => void;
  
  // Market Data
  markets: MarketData[];
  selectedMarket: string;
  setSelectedMarket: (symbol: string) => void;
  
  // XHR Foresight
  foresight: XHRForesight | null;
  showForesight: boolean;
  setShowForesight: (value: boolean) => void;
  
  // User Portfolio
  portfolio: {
    totalCapital: number;
    availableCapital: number;
    totalPnL: number;
    totalPnLPercent: number;
    activeAgents: number;
  };
  depositCapital: (amount: number) => void;
  withdrawCapital: (amount: number) => void;
  portfolioHistory: number[];
  
  // Activity Feed
  activityFeed: ActivityItem[];
  
  // Achievements
  achievements: Achievement[];
  
  // Contracts
  contracts: InvestorContract[];
  approveContract: (id: string) => void;
  rejectContract: (id: string) => void;
  
  // Settings
  settings: {
    maxAgents: number;
    maxBalancePerAgent: number;
    riskPreset: 'conservative' | 'moderate' | 'aggressive';
    confidenceThreshold: number;
    volatilityTolerance: number;
    glowIntensity: number;
    foresightOpacity: number;
  };
  updateSettings: (updates: Partial<OracleContextType['settings']>) => void;
  
  // Full Agentic Mode
  fullAgenticMode: boolean;
  launchFullAgentic: () => void;
  stopFullAgentic: () => void;
}

const OracleContext = createContext<OracleContextType | null>(null);

const generateId = () => Math.random().toString(36).substr(2, 9);

const MARKET_PAIRS = [
  { symbol: 'BTC/USDT', price: 67432.50, change24h: 2.34, volume: 28400000000, high24h: 68100, low24h: 65800 },
  { symbol: 'ETH/USDT', price: 3521.80, change24h: 1.87, volume: 14200000000, high24h: 3580, low24h: 3420 },
  { symbol: 'SOL/USDT', price: 178.42, change24h: -0.92, volume: 3200000000, high24h: 185, low24h: 172 },
  { symbol: 'BNB/USDT', price: 612.30, change24h: 0.45, volume: 1800000000, high24h: 620, low24h: 600 },
  { symbol: 'XRP/USDT', price: 0.6234, change24h: 3.21, volume: 2100000000, high24h: 0.65, low24h: 0.58 },
  { symbol: 'ADA/USDT', price: 0.4521, change24h: -1.23, volume: 890000000, high24h: 0.47, low24h: 0.44 },
];

const AGENT_NAMES = [
  'Nexus-Alpha', 'Quantum-7', 'Cipher-X9', 'Vector-Prime', 
  'Pulse-Delta', 'Helix-Omega', 'Nova-Sigma', 'Apex-Zeta'
];

export const OracleProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [demoMode, setDemoMode] = useState(true);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [markets, setMarkets] = useState<MarketData[]>(MARKET_PAIRS);
  const [selectedMarket, setSelectedMarket] = useState('BTC/USDT');
  const [showForesight, setShowForesight] = useState(true);
  const [fullAgenticMode, setFullAgenticMode] = useState(false);
  const [contracts, setContracts] = useState<InvestorContract[]>([
    {
      id: '1',
      investorName: 'Alpha Capital',
      amount: 50000,
      profitShare: 20,
      status: 'pending',
      createdAt: new Date(),
    },
    {
      id: '2',
      investorName: 'Nexus Ventures',
      amount: 125000,
      profitShare: 15,
      status: 'active',
      createdAt: new Date(Date.now() - 86400000 * 5),
    },
  ]);
  
  const [settings, setSettings] = useState({
    maxAgents: 6,
    maxBalancePerAgent: 15,
    riskPreset: 'moderate' as const,
    confidenceThreshold: 70,
    volatilityTolerance: 50,
    glowIntensity: 80,
    foresightOpacity: 40,
  });

  const [portfolio, setPortfolio] = useState({
    totalCapital: 1000,
    availableCapital: 850,
    totalPnL: 45,
    totalPnLPercent: 4.5,
    activeAgents: 0,
  });

  const [activityFeed, setActivityFeed] = useState<ActivityItem[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: '1', name: 'First Steps', description: 'Spawn your first agent', icon: 'rocket', unlocked: false },
    { id: '2', name: 'Profitable', description: 'Earn $100 in profit', icon: 'trending-up', unlocked: false },
    { id: '3', name: 'Multi-Agent', description: 'Run 3 agents simultaneously', icon: 'bot', unlocked: false },
    { id: '4', name: 'Risk Manager', description: 'Kill an underperforming agent', icon: 'shield', unlocked: false },
    { id: '5', name: 'Whale', description: 'Reach $10,000 portfolio value', icon: 'star', unlocked: false },
  ]);
  const [portfolioHistory, setPortfolioHistory] = useState<number[]>([1000]);

  const [foresight, setForesight] = useState<XHRForesight>({
    bias: 'bullish',
    confidence: 78,
    horizon: '4h',
    projectedCandles: [
      { open: 67432, close: 67890, high: 68100, low: 67300 },
      { open: 67890, close: 68250, high: 68400, low: 67750 },
      { open: 68250, close: 68100, high: 68500, low: 67900 },
    ],
  });

  // Simulate market updates
  useEffect(() => {
    if (!demoMode) return;
    
    const interval = setInterval(() => {
      setMarkets(prev => prev.map(m => ({
        ...m,
        price: m.price * (1 + (Math.random() - 0.5) * 0.002),
        change24h: m.change24h + (Math.random() - 0.5) * 0.1,
      })));
    }, 2000);
    
    return () => clearInterval(interval);
  }, [demoMode]);

  // Simulate agent updates
  useEffect(() => {
    if (!demoMode || agents.length === 0) return;
    
    const interval = setInterval(() => {
      setAgents(prev => prev.map(agent => {
        if (agent.state !== 'active') return agent;
        
        const pnlChange = (Math.random() - 0.48) * 100;
        const newPnl = agent.pnl + pnlChange;
        const newPnlPercent = (newPnl / agent.capitalAllocated) * 100;
        
        let performance: AgentPerformance = 'neutral';
        if (newPnlPercent > 2) performance = 'profit';
        else if (newPnlPercent < -2) performance = 'loss';
        else if (Math.abs(newPnlPercent) > 1) performance = 'volatile';
        if (agent.confidence > 85) performance = 'foresight';
        
        return {
          ...agent,
          pnl: newPnl,
          pnlPercent: newPnlPercent,
          performance,
          confidence: Math.max(50, Math.min(95, agent.confidence + (Math.random() - 0.5) * 5)),
          trades: agent.trades + (Math.random() > 0.7 ? 1 : 0),
        };
      }));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [demoMode, agents.length]);

  // Update foresight periodically
  useEffect(() => {
    if (!demoMode) return;
    
    const interval = setInterval(() => {
      setForesight(prev => ({
        ...prev,
        confidence: Math.max(60, Math.min(95, prev.confidence + (Math.random() - 0.5) * 10)),
        bias: Math.random() > 0.7 ? (Math.random() > 0.5 ? 'bullish' : 'bearish') : prev.bias,
      }));
    }, 5000);
    
    return () => clearInterval(interval);
  }, [demoMode]);

  // Activity Feed helper
  const addActivity = useCallback((type: ActivityItem['type'], message: string, agentName?: string, amount?: number) => {
    const newActivity: ActivityItem = {
      id: generateId(),
      type,
      message,
      timestamp: new Date(),
      agentName,
      amount,
    };
    setActivityFeed(prev => [newActivity, ...prev].slice(0, 50));
  }, []);

  // Achievement unlock helper
  const unlockAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => prev.map(a => 
      a.id === achievementId && !a.unlocked 
        ? { ...a, unlocked: true, unlockedAt: new Date() } 
        : a
    ));
  }, []);

  // Check achievements
  useEffect(() => {
    const activeCount = agents.filter(a => a.state === 'active' || a.state === 'spawning').length;
    if (activeCount >= 1) unlockAchievement('1'); // First Steps
    if (activeCount >= 3) unlockAchievement('3'); // Multi-Agent
    if (portfolio.totalPnL >= 100) unlockAchievement('2'); // Profitable
    if (portfolio.totalCapital >= 10000) unlockAchievement('5'); // Whale
  }, [agents, portfolio, unlockAchievement]);

  // Update portfolio history
  useEffect(() => {
    if (!demoMode) return;
    const interval = setInterval(() => {
      setPortfolioHistory(prev => [...prev.slice(-29), portfolio.totalCapital]);
    }, 5000);
    return () => clearInterval(interval);
  }, [demoMode, portfolio.totalCapital]);

  // Deposit capital
  const depositCapital = useCallback((amount: number) => {
    if (amount <= 0) return;
    setPortfolio(prev => ({
      ...prev,
      totalCapital: prev.totalCapital + amount,
      availableCapital: prev.availableCapital + amount,
    }));
    addActivity('deposit', `Deposited $${amount.toLocaleString()}`, undefined, amount);
  }, [addActivity]);

  // Withdraw capital
  const withdrawCapital = useCallback((amount: number) => {
    if (amount <= 0 || amount > portfolio.availableCapital) return;
    setPortfolio(prev => ({
      ...prev,
      totalCapital: prev.totalCapital - amount,
      availableCapital: prev.availableCapital - amount,
    }));
    addActivity('withdraw', `Withdrew $${amount.toLocaleString()}`, undefined, amount);
  }, [portfolio.availableCapital, addActivity]);

  const spawnAgent = useCallback((market: string, model: OracleModel) => {
    const usedNames = agents.map(a => a.name);
    const availableNames = AGENT_NAMES.filter(n => !usedNames.includes(n));
    const name = availableNames[0] || `Agent-${generateId().slice(0, 4)}`;
    
    const capital = portfolio.availableCapital * (settings.maxBalancePerAgent / 100);
    
    const newAgent: Agent = {
      id: generateId(),
      name,
      market,
      interval: '15m',
      state: 'spawning',
      performance: 'neutral',
      model,
      pnl: 0,
      pnlPercent: 0,
      confidence: 65 + Math.random() * 20,
      trades: 0,
      winRate: 0,
      capitalAllocated: capital,
      spawnedAt: new Date(),
    };
    
    setAgents(prev => [...prev, newAgent]);
    setPortfolio(prev => ({
      ...prev,
      availableCapital: prev.availableCapital - capital,
      activeAgents: prev.activeAgents + 1,
    }));
    
    addActivity('spawn', `${name} spawned on ${market}`, name, capital);
    
    // Transition to active after spawn animation
    setTimeout(() => {
      setAgents(prev => prev.map(a => 
        a.id === newAgent.id ? { ...a, state: 'active' } : a
      ));
    }, 1500);
  }, [agents, portfolio.availableCapital, settings.maxBalancePerAgent, addActivity]);

  const killAgent = useCallback((id: string) => {
    const agent = agents.find(a => a.id === id);
    setAgents(prev => prev.map(a => 
      a.id === id ? { ...a, state: 'killed' } : a
    ));
    
    if (agent) {
      setPortfolio(prev => ({
        ...prev,
        availableCapital: prev.availableCapital + agent.capitalAllocated + agent.pnl,
        totalPnL: prev.totalPnL + agent.pnl,
        activeAgents: Math.max(0, prev.activeAgents - 1),
      }));
      addActivity('kill', `${agent.name} terminated with ${agent.pnl >= 0 ? '+' : ''}$${agent.pnl.toFixed(2)} P&L`, agent.name, agent.pnl);
      unlockAchievement('4'); // Risk Manager
    }
  }, [agents, addActivity, unlockAchievement]);

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

  const updateSettings = useCallback((updates: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  const launchFullAgentic = useCallback(() => {
    setFullAgenticMode(true);
    // Spawn multiple agents across different markets
    MARKET_PAIRS.slice(0, settings.maxAgents).forEach((market, index) => {
      setTimeout(() => {
        spawnAgent(market.symbol, 'preview');
      }, index * 800);
    });
  }, [settings.maxAgents, spawnAgent]);

  const stopFullAgentic = useCallback(() => {
    setFullAgenticMode(false);
    agents.forEach(agent => {
      if (agent.state === 'active' || agent.state === 'spawning') {
        killAgent(agent.id);
      }
    });
  }, [agents, killAgent]);

  return (
    <OracleContext.Provider value={{
      demoMode,
      setDemoMode,
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
      activityFeed,
      achievements,
      contracts,
      approveContract,
      rejectContract,
      settings,
      updateSettings,
      fullAgenticMode,
      launchFullAgentic,
      stopFullAgentic,
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
