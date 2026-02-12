import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Pause, Play, X, 
  ChevronDown, ChevronUp, Zap, Target, Clock, CircleDot
} from 'lucide-react';
import { Agent, useOracle } from '@/contexts/OracleContext';

interface AgentCardProps {
  agent: Agent;
}

const getGlowClass = (performance: Agent['performance'], state: Agent['state']) => {
  if (state === 'killed') return 'agent-glow-killed';
  if (state === 'paused' || state === 'idle') return 'opacity-70';
  if (state === 'spawning' || state === 'scanning') return 'agent-glow-foresight';
  if (state === 'blocked') return 'agent-glow-volatile';
  
  switch (performance) {
    case 'profit': return 'agent-glow-profit';
    case 'loss': return 'agent-glow-loss';
    case 'volatile': return 'agent-glow-volatile';
    case 'foresight': return 'agent-glow-foresight';
    default: return '';
  }
};

const getModelBadge = (model: Agent['model']) => {
  switch (model) {
    case 'preview': return <span className="badge-preview">Preview</span>;
    case 'exp': return <span className="badge-exp">Exp</span>;
    case 'rpm': return <span className="badge-rpm">RPM</span>;
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const [expanded, setExpanded] = useState(false);
  const { killAgent, pauseAgent, resumeAgent } = useOracle();
  
  const isPositive = agent.pnlPercent >= 0;
  const glowClass = getGlowClass(agent.performance, agent.state);

  return (
    <div className={`glass-card ${glowClass} transition-all duration-300 animate-fade-in`}>
      {/* Header */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <CircleDot className={`w-3 h-3 ${
              agent.state === 'active' || agent.state === 'executing' ? 'text-oracle-green' :
              agent.state === 'paused' || agent.state === 'idle' ? 'text-oracle-orange' :
              agent.state === 'killed' || agent.state === 'expired' ? 'text-oracle-red' :
              agent.state === 'blocked' ? 'text-oracle-gold' :
              agent.state === 'scanning' || agent.state === 'evaluating' ? 'text-oracle-cyan' :
              'text-primary animate-pulse'
            }`} />
            <span className="font-mono text-sm font-medium text-foreground">
              {agent.name}
            </span>
            {getModelBadge(agent.model)}
          </div>
          
          <div className="flex items-center gap-1">
            {agent.state === 'active' && (
              <button
                onClick={() => pauseAgent(agent.id)}
                className="p-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <Pause className="w-3 h-3 text-muted-foreground" />
              </button>
            )}
            {agent.state === 'paused' && (
              <button
                onClick={() => resumeAgent(agent.id)}
                className="p-1.5 rounded-md bg-muted/50 hover:bg-muted transition-colors"
              >
                <Play className="w-3 h-3 text-oracle-green" />
              </button>
            )}
            {agent.state !== 'killed' && (
              <button
                onClick={() => killAgent(agent.id)}
                className="p-1.5 rounded-md bg-muted/50 hover:bg-destructive/20 transition-colors group"
              >
                <X className="w-3 h-3 text-muted-foreground group-hover:text-destructive" />
              </button>
            )}
          </div>
        </div>

        {/* Market & Performance */}
        <div className="flex items-center justify-between mb-2">
          <div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Market</div>
            <div className="font-mono text-sm">{agent.market}</div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">P&L</div>
            <div className={`font-mono text-base font-semibold flex items-center gap-1 ${
              isPositive ? 'text-oracle-green' : 'text-oracle-red'
            }`}>
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{agent.pnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="metric-card text-center py-1.5">
            <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
              <Zap className="w-2.5 h-2.5" />
              Conf
            </div>
            <div className="font-mono text-xs font-medium text-primary">
              {agent.confidence.toFixed(0)}%
            </div>
          </div>
          <div className="metric-card text-center py-1.5">
            <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
              <Target className="w-2.5 h-2.5" />
              Trades
            </div>
            <div className="font-mono text-xs font-medium">
              {agent.trades}
            </div>
          </div>
          <div className="metric-card text-center py-1.5">
            <div className="flex items-center justify-center gap-0.5 text-[10px] text-muted-foreground uppercase tracking-wider">
              <Activity className="w-2.5 h-2.5" />
              Win
            </div>
            <div className="font-mono text-xs font-medium text-oracle-green">
              {agent.winRate.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider"
        >
          {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          {expanded ? 'Less' : 'Details'}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border/50 animate-fade-in">
          <div className="p-3 space-y-2 text-sm">
            {agent.strategy && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Strategy</span>
                <span className="font-medium">{agent.strategy}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Capital</span>
              <span className="font-mono">${agent.capitalAllocated.toFixed(0)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeframe</span>
              <span className="font-mono">{agent.interval}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Raw P&L</span>
              <span className={`font-mono ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {isPositive ? '+' : ''}${agent.pnl.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Active since</span>
              <span className="font-mono text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {agent.spawnedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
