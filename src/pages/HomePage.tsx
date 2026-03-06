import React, { useState } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  Activity, Wallet, Bot, Target, BarChart3, Clock, ChevronRight,
  Sparkles, Zap, Eye, ArrowUpRight, ArrowDownRight, Award, Radio, Plus,
  Send, CreditCard, ArrowDownToLine, History, TrendingUp, Shield, Flame, Globe
} from 'lucide-react';
import { PortfolioSparkline } from '@/components/PortfolioSparkline';
import { HomeHeader } from '@/components/HomeHeader';
import { MarketTicker } from '@/components/MarketTicker';
import { LivePriceCard } from '@/components/LivePriceCard';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Motion3DCard } from '@/components/Motion3DCard';

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
    { label: 'Win Rate', value: agents.length > 0 ? `${(agents.reduce((sum, a) => sum + a.winRate, 0) / Math.max(agents.length, 1)).toFixed(0)}%` : '—', icon: Target, color: 'text-oracle-green' },
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

      {/* Main Portfolio Card - Premium */}
      <Motion3DCard intensity={0.4}>
      <div className="card-premium p-5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-transparent to-oracle-purple/8" />
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-xl shadow-primary/25">
                <Wallet className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-0.5">Total Portfolio Value</div>
                <div className="font-mono text-3xl font-bold">
                  ${(portfolio.totalCapital + totalPnL).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
              </div>
            </div>
            <PortfolioSparkline />
          </div>

          {/* Portfolio Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mb-4">
            <div className="metric-card">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Available</div>
              <div className="font-mono text-sm font-semibold">${portfolio.availableCapital.toFixed(0)}</div>
            </div>
            <div className="metric-card">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Session P&L</div>
              <div className={`font-mono text-sm font-semibold flex items-center gap-1 ${isPositive ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {isPositive ? '+' : ''}${totalPnL.toFixed(2)}
              </div>
            </div>
            <div className="metric-card">
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Today</div>
              <div className={`font-mono text-sm font-semibold ${portfolio.todayPnL >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                {portfolio.todayPnL >= 0 ? '+' : ''}{portfolio.todayPnL.toFixed(2)}%
              </div>
            </div>
          </div>

          {/* Portfolio Actions */}
          <div className="grid grid-cols-4 gap-2">
            <button className="btn-portfolio-action">
              <CreditCard className="w-5 h-5 text-primary" />
              <span className="text-[10px] font-medium">Fund</span>
            </button>
            <button className="btn-portfolio-action">
              <Send className="w-5 h-5 text-oracle-purple" />
              <span className="text-[10px] font-medium">Send</span>
            </button>
            <button className="btn-portfolio-action">
              <ArrowDownToLine className="w-5 h-5 text-oracle-green" />
              <span className="text-[10px] font-medium">Withdraw</span>
            </button>
            <button className="btn-portfolio-action">
              <History className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] font-medium">History</span>
            </button>
          </div>
        </div>
      </div>
      </Motion3DCard>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        {quickStats.map((stat) => (
          <div key={stat.label} className="card-elevated p-3 text-center">
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
        <Motion3DCard intensity={0.5}>
        <div className="card-premium p-4 relative overflow-hidden">
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold">Oracle Foresight</span>
                <span className="badge-preview">XHR</span>
              </div>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                foresight.bias === 'bullish' ? 'bg-oracle-green/15 text-oracle-green' :
                foresight.bias === 'bearish' ? 'bg-oracle-red/15 text-oracle-red' :
                'bg-muted text-muted-foreground'
              }`}>
                {foresight.bias.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Confidence</div>
                <div className="flex items-center gap-2">
                  <div className="w-36 h-2.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500"
                      style={{ 
                        width: `${foresight.confidence}%`,
                        background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--oracle-purple)))'
                      }}
                    />
                  </div>
                  <span className="font-mono text-sm font-bold">{foresight.confidence}%</span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-muted-foreground">Horizon</div>
                <div className="font-mono text-sm font-semibold">{foresight.horizon}</div>
              </div>
            </div>
          </div>
        </div>
        </Motion3DCard>
      )}

      {/* Top Performer */}
      {topPerformer && (
        <div className="card-elevated p-4 border-l-4 border-oracle-green">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-oracle-green/15 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-oracle-green" />
              </div>
              <div>
                <div className="text-xs text-muted-foreground">Top Performer</div>
                <div className="font-mono text-sm font-semibold">{topPerformer.name}</div>
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
        className="w-full card-elevated p-4 flex items-center justify-center gap-2 text-sm font-semibold text-primary hover:bg-primary/5 transition-colors"
      >
        <Plus className="w-4 h-4" />
        Quick Spawn Agent
      </button>

      {/* Analytics Toggle */}
      <button
        onClick={() => setShowAnalytics(!showAnalytics)}
        className="w-full card-elevated p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-oracle-purple/15 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-oracle-purple" />
          </div>
          <div className="text-left">
            <span className="text-sm font-medium">Analytics Dashboard</span>
            <p className="text-xs text-muted-foreground">Performance metrics & insights</p>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showAnalytics ? 'rotate-90' : ''}`} />
      </button>

      {showAnalytics && <AnalyticsDashboard />}

      {/* Market Overview */}
      <div className="card-premium p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Watchlist</span>
          </div>
          <span className="text-xs text-muted-foreground">{watchlist.length} pairs</span>
        </div>
        <div className="space-y-1.5">
          {markets.filter(m => watchlist.includes(m.symbol)).slice(0, 5).map((market) => (
            <div key={market.symbol} className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-muted/30 border border-border/30">
              <div className="flex items-center gap-2">
                <Radio className="w-2 h-2 text-oracle-green animate-pulse" />
                <span className="font-mono text-sm font-semibold">{market.symbol}</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="font-mono text-sm">
                  ${market.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className={`font-mono text-xs min-w-[55px] text-right px-2 py-0.5 rounded ${
                  market.change24h >= 0 ? 'text-oracle-green bg-oracle-green/10' : 'text-oracle-red bg-oracle-red/10'
                }`}>
                  {market.change24h >= 0 ? '+' : ''}{market.change24h.toFixed(2)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Oracle Models */}
      <div className="card-premium p-4">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Oracle Models</span>
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
                model.available ? 'border-border/50 bg-muted/30 hover:bg-muted/50 hover:border-primary/30' : 'border-border/30 bg-muted/10 opacity-60'
              }`}
            >
              <span className={model.badge}>{model.name}</span>
              <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">{model.status}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI-Powered Insights */}
      <div className="card-elevated p-4">
        <div className="flex items-center gap-2 mb-3">
          <Flame className="w-4 h-4 text-oracle-orange" />
          <span className="text-sm font-semibold">AI Market Insights</span>
          <span className="badge-soon">New</span>
        </div>
        <div className="space-y-2">
          <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3 h-3 text-oracle-green" />
              <span className="text-xs font-medium">Bullish momentum detected</span>
            </div>
            <p className="text-[11px] text-muted-foreground">BTC showing strong accumulation patterns in the 4h timeframe</p>
          </div>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/30">
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-3 h-3 text-primary" />
              <span className="text-xs font-medium">Risk assessment: Moderate</span>
            </div>
            <p className="text-[11px] text-muted-foreground">Market volatility within acceptable range for current settings</p>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card-premium p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-semibold">Recent Activity</span>
          </div>
        </div>
        <ActivityFeed limit={5} />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        <button className="card-elevated p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
          <Award className="w-5 h-5 text-oracle-gold" />
          <div className="text-left">
            <div className="text-sm font-medium">Achievements</div>
            <div className="text-xs text-muted-foreground">View progress</div>
          </div>
        </button>
        <button className="card-elevated p-4 flex items-center gap-3 hover:bg-muted/30 transition-colors">
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
