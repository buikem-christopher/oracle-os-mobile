import React from 'react';
import { TrendingUp, TrendingDown, Wallet, Bot, DollarSign, Activity } from 'lucide-react';
import { useOracle } from '@/contexts/OracleContext';
import { PortfolioSparkline } from './PortfolioSparkline';

export const PortfolioCard: React.FC = () => {
  const { portfolio, agents, demoMode } = useOracle();
  
  const activeAgents = agents.filter(a => a.state === 'active' || a.state === 'spawning').length;
  const isPositive = portfolio.totalPnLPercent >= 0;

  return (
    <div className="glass-card overflow-hidden animate-fade-in">
      {/* Header Gradient */}
      <div className="h-1.5 bg-gradient-oracle" />
      
      <div className="p-5">
        {/* Demo Badge */}
        {demoMode && (
          <div className="flex items-center gap-2 mb-4">
            <span className="px-2 py-0.5 rounded-full bg-oracle-purple/20 text-oracle-purple text-xs font-medium border border-oracle-purple/30">
              Demo Mode
            </span>
          </div>
        )}

        {/* Total Capital with Sparkline */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2 text-muted-foreground text-sm">
              <Wallet className="w-4 h-4" />
              Total Portfolio Value
            </div>
            <PortfolioSparkline />
          </div>
          <div className="flex items-baseline gap-3">
            <span className="font-mono text-3xl font-bold text-foreground">
              ${portfolio.totalCapital.toLocaleString()}
            </span>
            <span className={`font-mono text-sm flex items-center gap-1 ${
              isPositive ? 'text-oracle-green' : 'text-oracle-red'
            }`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{portfolio.totalPnLPercent.toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <DollarSign className="w-3.5 h-3.5" />
              Available
            </div>
            <p className="font-mono text-lg font-semibold">
              ${portfolio.availableCapital.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-3">
            <div className="flex items-center gap-2 text-muted-foreground text-xs mb-1">
              <Activity className="w-3.5 h-3.5" />
              Total P&L
            </div>
            <p className={`font-mono text-lg font-semibold ${
              portfolio.totalPnL >= 0 ? 'text-oracle-green' : 'text-oracle-red'
            }`}>
              {portfolio.totalPnL >= 0 ? '+' : ''}${portfolio.totalPnL.toLocaleString()}
            </p>
          </div>
          
          <div className="bg-muted/30 rounded-xl p-3 col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground text-xs">
                <Bot className="w-3.5 h-3.5" />
                Active Agents
              </div>
              <div className="flex items-center gap-1">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i < activeAgents 
                        ? 'bg-oracle-green shadow-[0_0_6px_hsl(145_80%_55%/0.6)]' 
                        : 'bg-muted'
                    }`}
                  />
                ))}
              </div>
            </div>
            <p className="font-mono text-lg font-semibold mt-1">
              {activeAgents} <span className="text-muted-foreground text-sm font-normal">/ 6</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
