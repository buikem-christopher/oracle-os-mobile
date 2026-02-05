import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, BarChart, Bar } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Target, Flame, Award } from 'lucide-react';

export const AnalyticsDashboard: React.FC = () => {
  const { portfolio, portfolioHistory, tradeHistory, user } = useOracle();

  // Generate performance data
  const performanceData = portfolioHistory.map((p, i) => ({
    time: i,
    value: p.value,
  }));

  // Calculate drawdown
  let peak = portfolio.totalCapital;
  const drawdownData = portfolioHistory.map((p) => {
    if (p.value > peak) peak = p.value;
    const drawdown = ((peak - p.value) / peak) * 100;
    return { value: p.value, drawdown };
  });

  // P&L breakdown
  const wins = tradeHistory.filter(t => (t.pnl || 0) > 0).length;
  const losses = tradeHistory.filter(t => (t.pnl || 0) < 0).length;
  const totalWinAmount = tradeHistory.filter(t => (t.pnl || 0) > 0).reduce((sum, t) => sum + (t.pnl || 0), 0);
  const totalLossAmount = Math.abs(tradeHistory.filter(t => (t.pnl || 0) < 0).reduce((sum, t) => sum + (t.pnl || 0), 0));

  const pnlData = [
    { name: 'Wins', value: wins, amount: totalWinAmount, fill: 'hsl(var(--oracle-green))' },
    { name: 'Losses', value: losses, amount: totalLossAmount, fill: 'hsl(var(--oracle-red))' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Performance Chart */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Portfolio Performance</span>
          </div>
          <span className={`font-mono text-sm ${portfolio.totalPnLPercent >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
            {portfolio.totalPnLPercent >= 0 ? '+' : ''}{portfolio.totalPnLPercent.toFixed(2)}%
          </span>
        </div>
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <defs>
                <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" hide />
              <YAxis hide domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, 'Value']}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                fill="url(#colorPerf)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-3.5 h-3.5 text-oracle-green" />
            <span className="text-[10px] text-muted-foreground uppercase">Win Rate</span>
          </div>
          <div className="font-mono text-xl font-bold text-oracle-green">{user.winRate.toFixed(1)}%</div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-3.5 h-3.5 text-oracle-purple" />
            <span className="text-[10px] text-muted-foreground uppercase">Total Trades</span>
          </div>
          <div className="font-mono text-xl font-bold">{user.totalTrades}</div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-oracle-green" />
            <span className="text-[10px] text-muted-foreground uppercase">Best Trade</span>
          </div>
          <div className="font-mono text-lg font-bold text-oracle-green">+${user.bestTrade}</div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-oracle-red" />
            <span className="text-[10px] text-muted-foreground uppercase">Worst Trade</span>
          </div>
          <div className="font-mono text-lg font-bold text-oracle-red">${user.worstTrade}</div>
        </div>
      </div>

      {/* P&L Breakdown */}
      <div className="glass-card p-4">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">Win/Loss Breakdown</span>
        </div>
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={pnlData} layout="vertical">
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="name" hide />
              <Bar dataKey="value" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-3">
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-oracle-green">{wins}</div>
            <div className="text-[10px] text-muted-foreground">Winning Trades</div>
          </div>
          <div className="text-center">
            <div className="font-mono text-lg font-bold text-oracle-red">{losses}</div>
            <div className="text-[10px] text-muted-foreground">Losing Trades</div>
          </div>
        </div>
      </div>
    </div>
  );
};
