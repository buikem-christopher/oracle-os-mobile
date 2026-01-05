import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Activity, Pause, Play, X, 
  ChevronDown, ChevronUp, Zap, Target, Clock
} from 'lucide-react';
import { Agent, useOracle } from '@/contexts/OracleContext';

interface AgentCardProps {
  agent: Agent;
}

const getGlowClass = (performance: Agent['performance'], state: Agent['state']) => {
  if (state === 'killed') return 'agent-glow-killed';
  if (state === 'paused') return 'opacity-70';
  if (state === 'spawning') return 'agent-glow-foresight animate-pulse';
  
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
    case 'ultra': return <span className="badge-ultra">Ultra</span>;
  }
};

export const AgentCard: React.FC<AgentCardProps> = ({ agent }) => {
  const [expanded, setExpanded] = useState(false);
  const { killAgent, pauseAgent, resumeAgent } = useOracle();
  
  const isPositive = agent.pnlPercent >= 0;
  const glowClass = getGlowClass(agent.performance, agent.state);

  return (
    <div
      className={`glass-card ${glowClass} transition-all duration-500 animate-fade-in`}
    >
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              agent.state === 'active' ? 'bg-oracle-green animate-pulse' :
              agent.state === 'paused' ? 'bg-oracle-orange' :
              agent.state === 'killed' ? 'bg-oracle-red' :
              'bg-primary animate-pulse'
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
                className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Pause className="w-3.5 h-3.5 text-muted-foreground" />
              </button>
            )}
            {agent.state === 'paused' && (
              <button
                onClick={() => resumeAgent(agent.id)}
                className="p-1.5 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Play className="w-3.5 h-3.5 text-oracle-green" />
              </button>
            )}
            {agent.state !== 'killed' && (
              <button
                onClick={() => killAgent(agent.id)}
                className="p-1.5 rounded-lg bg-muted/50 hover:bg-destructive/20 transition-colors"
              >
                <X className="w-3.5 h-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            )}
          </div>
        </div>

        {/* Market & Performance */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">Market</div>
            <div className="font-mono text-sm font-medium">{agent.market}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground mb-0.5">P&L</div>
            <div className={`font-mono text-lg font-bold flex items-center gap-1 ${
              isPositive ? 'text-oracle-green' : 'text-oracle-red'
            }`}>
              {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {isPositive ? '+' : ''}{agent.pnlPercent.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
              <Zap className="w-3 h-3" />
              Conf
            </div>
            <div className="font-mono text-sm font-medium text-primary">
              {agent.confidence.toFixed(0)}%
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
              <Target className="w-3 h-3" />
              Trades
            </div>
            <div className="font-mono text-sm font-medium">
              {agent.trades}
            </div>
          </div>
          <div className="bg-muted/30 rounded-lg p-2 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-0.5">
              <Activity className="w-3 h-3" />
              Win
            </div>
            <div className="font-mono text-sm font-medium text-oracle-green">
              {agent.winRate.toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Expand Toggle */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-center gap-1 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          {expanded ? 'Less' : 'Details'}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded && (
        <div className="border-t border-border/50 animate-fade-in">
          <div className="p-4 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Capital Allocated</span>
              <span className="font-mono">${agent.capitalAllocated.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interval</span>
              <span className="font-mono">{agent.interval}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Raw P&L</span>
              <span className={`font-mono ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {isPositive ? '+' : ''}${agent.pnl.toFixed(2)}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Spawned</span>
              <span className="font-mono text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {agent.spawnedAt.toLocaleTimeString()}
              </span>
            </div>
            
            {/* Mini Chart Placeholder */}
            <div className="h-20 bg-muted/20 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-muted-foreground/50" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
