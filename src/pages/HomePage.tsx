import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  TrendingUp, TrendingDown, Activity, Wallet, 
  Bot, Target, BarChart3, Clock, ChevronRight,
  Sparkles, Zap, Eye
} from 'lucide-react';
import { PortfolioSparkline } from '@/components/PortfolioSparkline';

export const HomePage: React.FC = () => {
  const { portfolio, agents, markets, foresight, demoMode, settings } = useOracle();
  
  const activeAgents = agents.filter(a => a.state === 'active').length;
  const topPerformer = agents.filter(a => a.state === 'active').sort((a, b) => b.pnl - a.pnl)[0];
  const totalPnL = portfolio.totalPnL;
  const isPositive = totalPnL >= 0;

  const quickStats = [
    { label: 'Active', value: activeAgents.toString(), icon: Bot, color: 'text-primary' },
    { label: 'Win Rate', value: `${agents.length > 0 ? (agents.reduce((sum, a) => sum + a.winRate, 0) / Math.max(agents.length, 1)).toFixed(0) : 0}%`, icon: Target, color: 'text-oracle-green' },
    { label: 'Trades', value: agents.reduce((sum, a) => sum + a.trades, 0).toString(), icon: Activity, color: 'text-oracle-purple' },
  ];

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      {/* Header */}
      <header className="pt-3 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-lg font-bold tracking-tight">Oracle OS</h1>
            <span className={demoMode ? 'badge-demo' : 'badge-live'}>
              {demoMode ? 'DEMO' : 'LIVE'}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">Trading Intelligence Platform</p>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Portfolio</div>
          <div className="font-mono text-lg font-semibold">
            ${(portfolio.totalCapital + totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </header>

      {/* Main Portfolio Card */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-oracle flex items-center justify-center">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xs text-muted-foreground">Total Value</div>
              <div className="font-mono text-xl font-bold">
                ${(portfolio.totalCapital + totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>
          <PortfolioSparkline />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="metric-card">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Available</div>
            <div className="font-mono text-sm font-medium">${portfolio.availableCapital.toFixed(0)}</div>
          </div>
          <div className="metric-card">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Session P&L</div>
            <div className={`font-mono text-sm font-medium flex items-center gap-1 ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
              {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {isPositive ? '+' : ''}${totalPnL.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        {quickStats.map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <stat.icon className={`w-4 h-4 mx-auto mb-1 ${stat.color}`} />
            <div className="font-mono text-lg font-semibold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Oracle Foresight Card */}
      {foresight && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Oracle Foresight</span>
              <span className="badge-preview">XHR</span>
            </div>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
              foresight.bias === 'bullish' ? 'bg-oracle-green/10 text-oracle-green' :
              foresight.bias === 'bearish' ? 'bg-oracle-red/10 text-oracle-red' :
              'bg-muted text-muted-foreground'
            }`}>
              {foresight.bias.toUpperCase()}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-muted-foreground">Confidence</div>
              <div className="flex items-center gap-2">
                <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-oracle rounded-full transition-all duration-500"
                    style={{ width: `${foresight.confidence}%` }}
                  />
                </div>
                <span className="font-mono text-sm font-medium">{foresight.confidence}%</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-muted-foreground">Horizon</div>
              <div className="font-mono text-sm">{foresight.horizon}</div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performer */}
      {topPerformer && (
        <div className="glass-card p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-oracle-green/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-oracle-green" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Top Performer</div>
                <div className="font-mono text-sm font-medium">{topPerformer.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-mono text-lg font-semibold ${topPerformer.pnl >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {topPerformer.pnl >= 0 ? '+' : ''}{topPerformer.pnlPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">{topPerformer.market}</div>
            </div>
          </div>
        </div>
      )}

      {/* Market Overview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Markets</span>
          </div>
          <span className="text-xs text-muted-foreground">{markets.length} pairs</span>
        </div>
        <div className="space-y-2">
          {markets.slice(0, 4).map((market) => (
            <div key={market.symbol} className="flex items-center justify-between py-1.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm">{market.symbol}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-mono text-sm">
                  ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-mono text-xs ${market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                  {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oracle Models */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Oracle Models</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Preview', badge: 'badge-preview', status: 'Active', available: true },
            { name: 'Exp', badge: 'badge-exp', status: 'Beta', available: true },
            { name: 'RPM', badge: 'badge-rpm', status: 'Soon', available: false },
          ].map((model) => (
            <div 
              key={model.name} 
              className={`p-3 rounded-lg border text-center ${
                model.available ? 'border-border/50 bg-muted/30' : 'border-border/30 bg-muted/10 opacity-60'
              }`}
            >
              <span className={model.badge}>{model.name}</span>
              <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{model.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="glass-card p-4 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <Activity className="w-5 h-5 text-primary" />
          <div className="text-left">
            <div className="text-sm font-medium">Activity</div>
            <div className="text-xs text-muted-foreground">View feed</div>
          </div>
        </button>
        <button className="glass-card p-4 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <Clock className="w-5 h-5 text-primary" />
          <div className="text-left">
            <div className="text-sm font-medium">History</div>
            <div className="text-xs text-muted-foreground">Past trades</div>
          </div>
        </button>
      </div>
    </div>
  );
};
