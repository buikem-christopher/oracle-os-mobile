import React from 'react';
import { CandlestickChart } from '@/components/CandlestickChart';
import { MarketSelector } from '@/components/MarketSelector';
import { FullAgenticLauncher } from '@/components/FullAgenticLauncher';
import { AgentCard } from '@/components/AgentCard';
import { useOracle } from '@/contexts/OracleContext';
import { Eye, EyeOff, Plus } from 'lucide-react';

export const EnvironmentsPage: React.FC = () => {
  const { selectedMarket, showForesight, setShowForesight, agents, spawnAgent } = useOracle();
  const activeAgents = agents.filter(a => a.state !== 'killed');

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold">Environments</h1>
          <p className="text-xs text-muted-foreground">See the Future with Oracle</p>
        </div>
        <button
          onClick={() => setShowForesight(!showForesight)}
          className={`p-2 rounded-lg transition-colors ${showForesight ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}
        >
          {showForesight ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
        </button>
      </header>

      <MarketSelector />
      <CandlestickChart symbol={selectedMarket} showForesight={showForesight} />
      <FullAgenticLauncher />

      {/* Spawn Agent Button */}
      <button
        onClick={() => spawnAgent(selectedMarket, 'preview')}
        className="w-full glass-card p-3 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/10 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Spawn Semi-Agentic Agent
      </button>

      {/* Active Agents */}
      {activeAgents.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Active Agents</h2>
          <div className="grid gap-3">
            {activeAgents.map(agent => (
              <AgentCard key={agent.id} agent={agent} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
