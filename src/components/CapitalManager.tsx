import React, { useState } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { Plus, Minus, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const CapitalManager: React.FC = () => {
  const { portfolio, depositCapital, withdrawCapital, demoMode } = useOracle();
  const [mode, setMode] = useState<'deposit' | 'withdraw' | null>(null);
  const [amount, setAmount] = useState('');

  const handleAction = () => {
    const value = parseFloat(amount);
    if (isNaN(value) || value <= 0) return;
    
    if (mode === 'deposit') {
      depositCapital(value);
    } else if (mode === 'withdraw') {
      if (value > portfolio.availableCapital) return;
      withdrawCapital(value);
    }
    
    setAmount('');
    setMode(null);
  };

  const presetAmounts = mode === 'deposit' 
    ? [100, 500, 1000] 
    : [
        Math.floor(portfolio.availableCapital * 0.25),
        Math.floor(portfolio.availableCapital * 0.5),
        Math.floor(portfolio.availableCapital)
      ].filter(v => v > 0);

  return (
    <div className="glass-card overflow-hidden">
      {!mode ? (
        <div className="p-3 flex gap-2 animate-fade-in">
          <button
            onClick={() => setMode('deposit')}
            className="flex-1 p-3 rounded-xl bg-oracle-green/10 border border-oracle-green/30 hover:bg-oracle-green/20 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowDownRight className="w-4 h-4 text-oracle-green" />
            <span className="text-sm font-medium text-oracle-green">Deposit</span>
          </button>
          <button
            onClick={() => setMode('withdraw')}
            disabled={portfolio.availableCapital <= 0}
            className="flex-1 p-3 rounded-xl bg-oracle-orange/10 border border-oracle-orange/30 hover:bg-oracle-orange/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowUpRight className="w-4 h-4 text-oracle-orange" />
            <span className="text-sm font-medium text-oracle-orange">Withdraw</span>
          </button>
        </div>
      ) : (
        <div className="p-3 space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">
              {mode === 'deposit' ? 'Deposit' : 'Withdraw'} Capital
              {demoMode && <span className="text-oracle-purple ml-2">(Demo)</span>}
            </span>
            <button
              onClick={() => { setMode(null); setAmount(''); }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
          
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-7 pr-4 py-3 rounded-xl bg-muted/50 border border-border focus:border-primary focus:outline-none font-mono text-lg"
              autoFocus
            />
          </div>

          <div className="flex gap-2">
            {presetAmounts.map(preset => (
              <button
                key={preset}
                onClick={() => setAmount(preset.toString())}
                className="flex-1 py-1.5 rounded-lg bg-muted/50 hover:bg-muted text-xs font-mono transition-colors"
              >
                ${preset}
              </button>
            ))}
          </div>

          {mode === 'withdraw' && (
            <p className="text-xs text-muted-foreground">
              Available: <span className="font-mono text-foreground">${portfolio.availableCapital.toLocaleString()}</span>
            </p>
          )}

          <button
            onClick={handleAction}
            disabled={!amount || parseFloat(amount) <= 0 || (mode === 'withdraw' && parseFloat(amount) > portfolio.availableCapital)}
            className={`w-full py-3 rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              mode === 'deposit'
                ? 'bg-oracle-green text-black hover:bg-oracle-green/90'
                : 'bg-oracle-orange text-black hover:bg-oracle-orange/90'
            }`}
          >
            {mode === 'deposit' ? (
              <span className="flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> Deposit ${amount || '0'}
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Minus className="w-4 h-4" /> Withdraw ${amount || '0'}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  );
};
