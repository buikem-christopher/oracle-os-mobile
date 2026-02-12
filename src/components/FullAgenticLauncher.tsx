import React, { useState } from 'react';
import { Rocket, Zap, Shield, AlertTriangle, X, Bot, TrendingUp } from 'lucide-react';
import { useOracle } from '@/contexts/OracleContext';
import { CinematicLaunch } from './CinematicLaunch';

export const FullAgenticLauncher: React.FC = () => {
  const { fullAgenticMode, launchFullAgentic, stopFullAgentic, settings, agents } = useOracle();
  const [showConfirm, setShowConfirm] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [launchProgress, setLaunchProgress] = useState(0);

  const handleLaunch = () => {
    setLaunching(true);
    setShowConfirm(false);
    setLaunchProgress(0);
    
    const progressInterval = setInterval(() => {
      setLaunchProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 2;
      });
    }, 40);

    setTimeout(() => {
      launchFullAgentic();
      setLaunching(false);
      setLaunchProgress(0);
    }, 2200);
  };

  const activeAgents = agents.filter(a => a.state === 'active').length;

  if (fullAgenticMode) {
    return (
      <div className="card-premium p-4 border-oracle-green/30 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-oracle-green/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-oracle-green" />
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-oracle-green animate-pulse shadow-lg shadow-oracle-green/50" />
            </div>
            <div>
              <span className="font-semibold text-sm">Full Agentic Mode Active</span>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{activeAgents} agents deployed</span>
                <span>•</span>
                <span className="text-oracle-green">All systems operational</span>
              </div>
            </div>
          </div>
          <button
            onClick={stopFullAgentic}
            className="px-4 py-2 rounded-xl bg-destructive/15 text-destructive text-sm font-semibold hover:bg-destructive/25 transition-all border border-destructive/25"
          >
            Emergency Stop
          </button>
        </div>
        
        {/* Active agents mini-view */}
        <div className="flex gap-2 mt-3">
          {agents.filter(a => a.state === 'active').slice(0, 4).map((agent) => (
            <div 
              key={agent.id}
              className="flex-1 p-2 rounded-lg bg-muted/30 border border-border/30"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-mono text-muted-foreground">{agent.name}</span>
                <span className={`text-[10px] font-mono ${agent.pnl >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                  {agent.pnl >= 0 ? '+' : ''}{agent.pnlPercent.toFixed(1)}%
                </span>
              </div>
              <div className="text-[10px] text-muted-foreground truncate">{agent.market}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full card-premium p-5 flex items-center gap-4 border-primary/20 hover:border-primary/40 transition-all group"
      >
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-oracle-purple flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/30 transition-all">
          <Rocket className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-bold text-base">Full Agentic Mode</span>
            <span className="badge-exp">Beta</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Deploy {settings.maxAgents} autonomous agents across multiple markets
          </p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Zap className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
          <span className="text-[10px] text-muted-foreground">AUTO</span>
        </div>
      </button>

      {/* Cinematic Launch Sequence */}
      <CinematicLaunch 
        isLaunching={launching} 
        progress={launchProgress} 
        maxAgents={settings.maxAgents} 
      />

      {/* Confirmation Modal - Fixed position */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          
          <div className="relative card-premium p-6 max-w-md w-full animate-scale-in">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-2 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-oracle-orange/15 flex items-center justify-center">
                <AlertTriangle className="w-7 h-7 text-oracle-orange" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Launch Full Agentic Mode?</h3>
                <p className="text-sm text-muted-foreground">This will deploy multiple autonomous agents</p>
              </div>
            </div>

            <div className="space-y-3 mb-6 p-4 bg-muted/30 rounded-xl border border-border/30">
              <div className="flex items-center gap-3 text-sm">
                <Shield className="w-5 h-5 text-oracle-green" />
                <span>Risk System Layer (RSL) active</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Bot className="w-5 h-5 text-primary" />
                <span>{settings.maxAgents} agents will be deployed</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="w-5 h-5 text-oracle-purple" />
                <span>Max {settings.maxBalancePerAgent}% capital per agent</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <AlertTriangle className="w-5 h-5 text-oracle-orange" />
                <span>Kill switch at -{settings.killSwitchThreshold}% drawdown</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-5 py-3 rounded-xl bg-muted hover:bg-muted/80 text-sm font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLaunch}
                className="flex-1 btn-oracle text-sm"
              >
                <Rocket className="w-4 h-4 mr-2 inline" />
                Launch
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
