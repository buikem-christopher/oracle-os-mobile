import React, { useState } from 'react';
import { useOracle, OracleModel } from '@/contexts/OracleContext';
import { Bot, Sparkles, ChevronDown } from 'lucide-react';

export const QuickSpawnAgent: React.FC = () => {
  const { spawnAgent, markets, agents, settings, portfolio } = useOracle();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(markets[0]?.symbol || 'BTC/USDT');
  const [selectedModel, setSelectedModel] = useState<OracleModel>('preview');

  const activeAgents = agents.filter(a => a.state === 'active' || a.state === 'spawning').length;
  const canSpawn = activeAgents < settings.maxAgents && portfolio.availableCapital > 10;

  const handleSpawn = () => {
    if (!canSpawn) return;
    spawnAgent(selectedMarket, selectedModel);
    setIsOpen(false);
  };

  const models: { value: OracleModel; label: string; badge?: string; disabled?: boolean }[] = [
    { value: 'preview', label: 'Preview' },
    { value: 'exp', label: 'Experimental', badge: 'BETA' },
    { value: 'rpm', label: 'RPM', badge: 'SOON', disabled: true },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!canSpawn}
        className="w-full p-3 flex items-center justify-between hover:bg-muted/20 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-oracle flex items-center justify-center">
            <Bot className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium">Quick Deploy Agent</p>
            <p className="text-xs text-muted-foreground">
              {canSpawn 
                ? `${settings.maxAgents - activeAgents} slots available` 
                : activeAgents >= settings.maxAgents 
                  ? 'Max agents reached' 
                  : 'Insufficient capital'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && canSpawn && (
        <div className="border-t border-border/50 animate-fade-in">
          <div className="p-3 space-y-3">
            {/* Market Selection */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Select Market
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {markets.slice(0, 8).map(market => (
                  <button
                    key={market.symbol}
                    onClick={() => setSelectedMarket(market.symbol)}
                    className={`p-1.5 rounded text-xs font-mono transition-all ${
                      selectedMarket === market.symbol
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted text-muted-foreground'
                    }`}
                  >
                    {market.symbol.split('/')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5 block">
                Oracle Model
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {models.map(model => (
                  <button
                    key={model.value}
                    onClick={() => !model.disabled && setSelectedModel(model.value)}
                    disabled={model.disabled}
                    className={`p-2 rounded text-xs font-medium transition-all relative ${
                      selectedModel === model.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted'
                    } ${model.disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
                  >
                    {model.label}
                    {model.badge && (
                      <span className={`absolute -top-1 -right-1 px-1 text-[8px] rounded font-semibold ${
                        model.badge === 'BETA' ? 'bg-oracle-purple text-white' : 'bg-muted text-muted-foreground'
                      }`}>
                        {model.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Spawn Button */}
            <button
              onClick={handleSpawn}
              className="w-full py-2.5 rounded-lg bg-gradient-oracle text-white text-sm font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Deploy on {selectedMarket}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
