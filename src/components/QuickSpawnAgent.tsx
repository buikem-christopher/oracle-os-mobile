import React, { useState } from 'react';
import { useOracle, OracleModel } from '@/contexts/OracleContext';
import { Bot, Sparkles, ChevronDown } from 'lucide-react';

export const QuickSpawnAgent: React.FC = () => {
  const { spawnAgent, markets, agents, settings, portfolio } = useOracle();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState(markets[0]?.symbol || 'BTC/USDT');
  const [selectedModel, setSelectedModel] = useState<OracleModel>('preview');

  const activeAgents = agents.filter(a => a.state === 'active' || a.state === 'spawning').length;
  const canSpawn = activeAgents < settings.maxAgents && portfolio.availableCapital > 0;

  const handleSpawn = () => {
    if (!canSpawn) return;
    spawnAgent(selectedMarket, selectedModel);
    setIsOpen(false);
  };

  const models: { value: OracleModel; label: string; badge?: string }[] = [
    { value: 'preview', label: 'Preview' },
    { value: 'exp', label: 'Exp', badge: 'BETA' },
    { value: 'ultra', label: 'Ultra', badge: 'SOON' },
  ];

  return (
    <div className="glass-card overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={!canSpawn}
        className="w-full p-4 flex items-center justify-between hover:bg-muted/20 transition-colors disabled:opacity-50"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-oracle flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <p className="font-medium">Quick Spawn Agent</p>
            <p className="text-xs text-muted-foreground">
              {canSpawn 
                ? `${settings.maxAgents - activeAgents} slots available` 
                : activeAgents >= settings.maxAgents 
                  ? 'Max agents reached' 
                  : 'No capital available'}
            </p>
          </div>
        </div>
        <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && canSpawn && (
        <div className="border-t border-border/50 animate-fade-in">
          <div className="p-4 space-y-4">
            {/* Market Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Market</label>
              <div className="grid grid-cols-3 gap-2">
                {markets.slice(0, 6).map(market => (
                  <button
                    key={market.symbol}
                    onClick={() => setSelectedMarket(market.symbol)}
                    className={`p-2 rounded-lg text-xs font-mono transition-all ${
                      selectedMarket === market.symbol
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted'
                    }`}
                  >
                    {market.symbol.split('/')[0]}
                  </button>
                ))}
              </div>
            </div>

            {/* Model Selection */}
            <div>
              <label className="text-xs text-muted-foreground mb-2 block">Oracle Model</label>
              <div className="grid grid-cols-3 gap-2">
                {models.map(model => (
                  <button
                    key={model.value}
                    onClick={() => model.value !== 'ultra' && setSelectedModel(model.value)}
                    disabled={model.value === 'ultra'}
                    className={`p-2 rounded-lg text-xs font-medium transition-all relative ${
                      selectedModel === model.value
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted/50 hover:bg-muted'
                    } ${model.value === 'ultra' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {model.label}
                    {model.badge && (
                      <span className={`absolute -top-1 -right-1 px-1 text-[8px] rounded ${
                        model.badge === 'BETA' ? 'bg-oracle-purple text-white' : 'bg-oracle-gold text-black'
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
              className="w-full py-3 rounded-xl bg-gradient-oracle text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              <Sparkles className="w-4 h-4" />
              Spawn on {selectedMarket}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
