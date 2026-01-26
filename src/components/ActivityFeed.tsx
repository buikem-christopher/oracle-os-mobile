import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { Bot, TrendingUp, TrendingDown, Skull, Plus, Minus, Activity } from 'lucide-react';

const getActivityIcon = (type: string) => {
  switch (type) {
    case 'spawn': return <Bot className="w-3.5 h-3.5 text-oracle-cyan" />;
    case 'kill': return <Skull className="w-3.5 h-3.5 text-oracle-red" />;
    case 'profit': return <TrendingUp className="w-3.5 h-3.5 text-oracle-green" />;
    case 'loss': return <TrendingDown className="w-3.5 h-3.5 text-oracle-red" />;
    case 'deposit': return <Plus className="w-3.5 h-3.5 text-oracle-green" />;
    case 'withdraw': return <Minus className="w-3.5 h-3.5 text-oracle-orange" />;
    default: return <Activity className="w-3.5 h-3.5 text-muted-foreground" />;
  }
};

const getTimeAgo = (date: Date) => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
};

export const ActivityFeed: React.FC = () => {
  const { activityFeed } = useOracle();

  if (activityFeed.length === 0) {
    return (
      <div className="glass-card p-4 text-center">
        <Activity className="w-6 h-6 mx-auto mb-2 text-muted-foreground/50" />
        <p className="text-xs text-muted-foreground">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-3 border-b border-border/50">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Live Activity
        </h3>
      </div>
      <div className="max-h-48 overflow-y-auto">
        {activityFeed.slice(0, 10).map((item) => (
          <div
            key={item.id}
            className="px-3 py-2 border-b border-border/30 last:border-0 hover:bg-muted/20 transition-colors animate-fade-in"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center">
                {getActivityIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs truncate">{item.message}</p>
                <p className="text-[10px] text-muted-foreground">{getTimeAgo(item.timestamp)}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
