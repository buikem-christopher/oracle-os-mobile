import React, { useState } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  Activity, Wallet, Bot, Target, BarChart3, Clock, ChevronRight,
  Sparkles, Zap, Eye, ArrowUpRight, ArrowDownRight, Award, Radio, Plus
} from 'lucide-react';
import { PortfolioSparkline } from '@/components/PortfolioSparkline';
import { HomeHeader } from '@/components/HomeHeader';
import { MarketTicker } from '@/components/MarketTicker';
import { LivePriceCard } from '@/components/LivePriceCard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ActivityFeed } from '@/components/ActivityFeed';

interface HomePageProps {
  onSettingsClick: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onSettingsClick }) => {
  const { portfolio, agents, markets, foresight, settings, watchlist, spawnAgent, selectedMarket, demoMode } = useOracle();
  const [showAnalytics, setShowAnalytics] = useState(false);
  
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
      <HomeHeader 
        onSettingsClick={onSettingsClick} 
        onNotificationsClick={() => {}} 
      />

      {/* Market Ticker */}
      <MarketTicker />

      {/* Main Portfolio Card */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-oracle-purple/5" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-oracle flex items-center justify-center shadow-lg shadow-primary/20">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Total Portfolio Value</div>
                <div className="font-mono text-2xl font-bold">
                  ${(portfolio.totalCapital + totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <PortfolioSparkline />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Available</div>
              <div className="font-mono text-sm font-semibold">${portfolio.availableCapital.toFixed(0)}</div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Session P&L</div>
              <div className={`font-mono text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isPositive ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="bg-muted/30 rounded-xl p-3">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Today</div>
              <div className={`font-mono text-sm font-semibold ${portfolio.todayPnL >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {portfolio.todayPnL >= 0 ? '+' : ''}{portfolio.todayPnL.toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        {quickStats.map((stat) => (
          <div key={stat.label} className="glass-card p-3 text-center">
            <stat.icon className={`w-4 h-4 mx-auto mb-1.5 ${stat.color}`} />
            <div className="font-mono text-lg font-bold">{stat.value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Live Price Widget */}
      <LivePriceCard 
        symbol={selectedMarket} 
        initialPrice={markets[0]?.price || 67000} 
        demoMode={demoMode}
      />

      {/* Oracle Foresight Card */}
      {foresight && (
        <div className="glass-card p-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
          <div className="relative">
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
                  <div className="w-32 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-oracle rounded-full transition-all duration-500"
                      style={{ width: `${foresight.confidence}%` }}
                    />
                  </div>
                  <span className="font-mono text-sm font-semibold">{foresight.confidence}%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Horizon</div>
                <div className="font-mono text-sm font-semibold">{foresight.horizon}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Top Performer */}
      {topPerformer && (
        <div className="glass-card p-4 border-l-2 border-oracle-green">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-oracle-green/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-oracle-green" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Top Performer</div>
                <div className="font-mono text-sm font-medium">{topPerformer.name}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`font-mono text-lg font-bold ${topPerformer.pnl >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {topPerformer.pnl >= 0 ? '+' : ''}{topPerformer.pnlPercent.toFixed(2)}%
              </div>
              <div className="text-xs text-muted-foreground">{topPerformer.market}</div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Spawn */}
      <button
        onClick={() => spawnAgent(selectedMarket, settings.defaultModel)}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 text-sm font-medium text-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Quick Spawn Agent
      </button>

      {/* Analytics Toggle */}
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="w-full glass-card p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Analytics Dashboard</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showAnalytics ? 'rotate-90' : ''}`} />
      </button>

      {showAnalytics && <AnalyticsDashboard />}

      {/* Market Overview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Watchlist</span>
          </div>
          <span className="text-xs text-muted-foreground">{watchlist.length} pairs</span>
        </div>
        <div className="space-y-2">
          {markets.filter(m => watchlist.includes(m.symbol)).slice(0, 5).map((market) => (
            <div key={market.symbol} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
              <div className="flex items-center gap-2">
                <Radio className="w-2 h-2 text-oracle-green animate-pulse" />
                <span className="font-mono text-sm font-medium">{market.symbol}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm">
                  ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-mono text-xs min-w-[50px] text-right ${market.change24h >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
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
            { name: 'RPM', badge: 'badge-rpm', status: 'Pro', available: true },
          ].map((model) => (
            <div 
              key={model.name} 
              className={`p-3 rounded-xl border text-center transition-all ${
                model.available ? 'border-border/50 bg-muted/30 hover:bg-muted/50' : 'border-border/30 bg-muted/10 opacity-60'
              }`}
            >
              <span className={model.badge}>{model.name}</span>
              <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{model.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Recent Activity</span>
          </div>
        </div>
        <ActivityFeed limit={5} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="glass-card p-4 flex items-center gap-3 hover:bg-muted/20 transition-colors">
          <Award className="w-5 h-5 text-oracle-gold" />
          <div className="text-left">
            <div className="text-sm font-medium">Achievements</div>
            <div className="text-xs text-muted-foreground">View progress</div>
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
