import React from 'react';
import { TradingChart } from '@/components/TradingChart';
import { MarketSelector } from '@/components/MarketSelector';
import { FullAgenticLauncher } from '@/components/FullAgenticLauncher';
import { AgentCard } from '@/components/AgentCard';
import { useOracle } from '@/contexts/OracleContext';
import { Eye, EyeOff, Plus, Bot, Activity, Zap } from 'lucide-react';

export const EnvironmentsPage: React.FC = () => {
  const { selectedMarket, showForesight, setShowForesight, agents, spawnAgent, settings, portfolio } = useOracle();
  const activeAgents = agents.filter(a => a.state !== 'killed');
  const canSpawn = activeAgents.length < settings.maxAgents && portfolio.availableCapital > 10;

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold">Environments</h1>
          <p className="text-xs text-muted-foreground">Oracle Foresight & Agent Control</p>
        </div>
        <button
          onClick={() => setShowForesight(!showForesight)}
          className={`p-2 rounded-lg transition-all ${
            showForesight 
              ? 'bg-primary/10 text-primary border border-primary/20' 
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {showForesight ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </header>

      <MarketSelector />
      <TradingChart symbol={selectedMarket} showForesight={showForesight} />
      
      {/* Trading Mode Indicator */}
      <div className="glass-card p-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Mode</span>
        </div>
        <span className="text-xs font-medium px-2 py-1 rounded bg-muted capitalize">
          {settings.tradingMode.replace('-', ' ')}
        </span>
      </div>

      <FullAgenticLauncher />

      {/* Spawn Agent Button */}
      <button
        onClick={() => spawnAgent(selectedMarket, settings.defaultModel)}
        disabled={!canSpawn}
        className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 h-4" />
        Deploy Agent on {selectedMarket}
      </button>

      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Bot className="w-4 h-4" />
              Active Agents
            </h2>
            <span className="text-xs text-muted-foreground">{activeAgents.length}/{settings.maxAgents}</span>
          </div>
          <div className="grid gap-2">
            {activeAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}

      {activeAgents.length === 0 && (
        <div className="glass-card p-8 text-center">
          <Activity className="w-10 h-10 mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No active agents</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Deploy an agent to start trading</p>
        </div>
      )}
    </div>
  );
};
