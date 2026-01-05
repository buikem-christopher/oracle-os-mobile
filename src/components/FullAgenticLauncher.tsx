import React, { useState } from 'react';
import { Rocket, Zap, Shield, AlertTriangle, X } from 'lucide-react';
import { useOracle } from '@/contexts/OracleContext';

export const FullAgenticLauncher: React.FC = () => {
  const { fullAgenticMode, launchFullAgentic, stopFullAgentic, settings } = useOracle();
  const [showConfirm, setShowConfirm] = useState(false);
  const [launching, setLaunching] = useState(false);

  const handleLaunch = () => {
    setLaunching(true);
    setShowConfirm(false);
    
    setTimeout(() => {
      launchFullAgentic();
      setLaunching(false);
    }, 2500);
  };

  if (fullAgenticMode) {
    return (
      <div className="glass-card p-4 border-oracle-red/30 animate-fade-in">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-oracle-red animate-pulse" />
            <span className="font-medium text-sm">Full Agentic Mode Active</span>
          </div>
          <button
            onClick={stopFullAgentic}
            className="px-3 py-1.5 rounded-lg bg-destructive/20 text-destructive text-sm font-medium hover:bg-destructive/30 transition-colors"
          >
            Emergency Stop
          </button>
        </div>
        <p className="text-xs text-muted-foreground">
          {settings.maxAgents} agents scanning all markets autonomously
        </p>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="w-full glass-card p-4 flex items-center gap-4 border-primary/20 hover:border-primary/40 transition-all hover:scale-[1.02] active:scale-[0.98] group"
      >
        <div className="w-12 h-12 rounded-xl bg-gradient-oracle flex items-center justify-center group-hover:shadow-[0_0_30px_hsl(185_100%_60%/0.4)] transition-shadow">
          <Rocket className="w-6 h-6 text-primary-foreground" />
        </div>
        <div className="flex-1 text-left">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold">Full Agentic Mode</span>
            <span className="badge-soon">Beta</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Launch {settings.maxAgents} autonomous agents across all markets
          </p>
        </div>
        <Zap className="w-5 h-5 text-primary opacity-50 group-hover:opacity-100 transition-opacity" />
      </button>

      {/* Cinematic Launch Overlay */}
      {launching && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
          <div className="absolute inset-0 bg-background/95 backdrop-blur-sm" />
          
          <div className="relative z-10 text-center">
            {/* Animated rings */}
            <div className="relative w-48 h-48 mx-auto mb-8">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border border-primary/30 animate-ping"
                  style={{ animationDelay: `${i * 0.4}s`, animationDuration: '2s' }}
                />
              ))}
              <div className="absolute inset-8 rounded-full bg-gradient-oracle flex items-center justify-center animate-pulse">
                <Rocket className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gradient-oracle mb-2">
              Initializing Full Agentic Mode
            </h2>
            
            <p className="text-muted-foreground mb-4">
              Spawning {settings.maxAgents} agents...
            </p>

            <div className="h-1 bg-gradient-oracle rounded-full mx-auto max-w-xs animate-pulse" />
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setShowConfirm(false)}
          />
          
          <div className="relative glass-card p-6 max-w-md w-full animate-scale-in">
            <button
              onClick={() => setShowConfirm(false)}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-muted transition-colors"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-oracle-orange/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-oracle-orange" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">Launch Full Agentic Mode?</h3>
                <p className="text-sm text-muted-foreground">This action will deploy multiple agents</p>
              </div>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-2 text-sm">
                <Shield className="w-4 h-4 text-oracle-green" />
                <span>Risk System Layer active</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-primary" />
                <span>{settings.maxAgents} agents will be deployed</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-oracle-orange" />
                <span>Max {settings.maxBalancePerAgent}% capital per agent</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 px-4 py-2.5 rounded-lg bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
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
