import React from 'react';
import { TradingChartPro } from '@/components/TradingChartPro';
import { MarketSelector } from '@/components/MarketSelector';
import { FullAgenticLauncher } from '@/components/FullAgenticLauncher';
import { AgentCarousel } from '@/components/AgentCarousel';
import { RSLGauge } from '@/components/RSLGauge';
import { OIIPanel } from '@/components/OIIPanel';
import { Motion3DCard } from '@/components/Motion3DCard';
import { useOracle } from '@/contexts/OracleContext';
import { Eye, EyeOff, Plus, Activity, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';

export const EnvironmentsPage: React.FC = () => {
  const { selectedMarket, showForesight, setShowForesight, agents, spawnAgent, settings, portfolio } = useOracle();
  const activeAgents = agents.filter(a => a.state !== 'killed' && a.state !== 'expired');
  const canSpawn = activeAgents.length < settings.maxAgents && portfolio.availableCapital > 10;
  const [showOII, setShowOII] = useState(false);

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
      <TradingChartPro symbol={selectedMarket} showForesight={showForesight} />
      
      {/* RSL Risk Gauge */}
      <Motion3DCard intensity={0.5}>
        <RSLGauge />
      </Motion3DCard>

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

      {/* OII Panel Toggle */}
      <button
        onClick={() => setShowOII(!showOII)}
        className="w-full glass-card p-3 flex items-center justify-between text-sm font-medium hover:bg-primary/5 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-primary/10 flex items-center justify-center">
            <Activity className="w-3 h-3 text-primary" />
          </div>
          <span>Oracle Intelligence Interface</span>
          <span className="badge-live text-[7px]">OII</span>
        </div>
        {showOII ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
      </button>

      {showOII && <OIIPanel />}

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

      {/* Agent Carousel */}
      <AgentCarousel />

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
