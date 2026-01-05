import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { Shield, Sliders, Eye, Bot, Zap } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, demoMode, setDemoMode } = useOracle();

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-xs text-muted-foreground">Configure Oracle OS</p>
      </header>

      {/* Risk Settings */}
      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="w-4 h-4 text-primary" />
          <h2 className="font-medium">Risk System Layer</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Max Agents</span>
              <span className="font-mono">{settings.maxAgents}</span>
            </div>
            <input type="range" min="1" max="10" value={settings.maxAgents} onChange={(e) => updateSettings({ maxAgents: Number(e.target.value) })} className="w-full accent-primary" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Max % per Agent</span>
              <span className="font-mono">{settings.maxBalancePerAgent}%</span>
            </div>
            <input type="range" min="5" max="50" value={settings.maxBalancePerAgent} onChange={(e) => updateSettings({ maxBalancePerAgent: Number(e.target.value) })} className="w-full accent-primary" />
          </div>

          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Confidence Threshold</span>
              <span className="font-mono">{settings.confidenceThreshold}%</span>
            </div>
            <input type="range" min="50" max="95" value={settings.confidenceThreshold} onChange={(e) => updateSettings({ confidenceThreshold: Number(e.target.value) })} className="w-full accent-primary" />
          </div>
        </div>
      </section>

      {/* Visual Settings */}
      <section className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Eye className="w-4 h-4 text-primary" />
          <h2 className="font-medium">Visual</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Foresight Opacity</span>
              <span className="font-mono">{settings.foresightOpacity}%</span>
            </div>
            <input type="range" min="10" max="80" value={settings.foresightOpacity} onChange={(e) => updateSettings({ foresightOpacity: Number(e.target.value) })} className="w-full accent-primary" />
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-muted-foreground">Glow Intensity</span>
              <span className="font-mono">{settings.glowIntensity}%</span>
            </div>
            <input type="range" min="20" max="100" value={settings.glowIntensity} onChange={(e) => updateSettings({ glowIntensity: Number(e.target.value) })} className="w-full accent-primary" />
          </div>
        </div>
      </section>

      {/* Demo Mode (Hidden toggle) */}
      <section className="glass-card p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-oracle-purple" />
            <div>
              <h2 className="font-medium">Demo Mode</h2>
              <p className="text-xs text-muted-foreground">Simulated trading</p>
            </div>
          </div>
          <button
            onClick={() => setDemoMode(!demoMode)}
            className={`w-12 h-6 rounded-full transition-colors ${demoMode ? 'bg-oracle-purple' : 'bg-muted'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-foreground transition-transform ${demoMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
          </button>
        </div>
      </section>
    </div>
  );
};
