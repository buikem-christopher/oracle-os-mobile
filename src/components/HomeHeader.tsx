import React from 'react';
import { Bell, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import oracleLogo from '@/assets/oracle-logo-new.jpg';
import { useOracle } from '@/contexts/OracleContext';

interface HomeHeaderProps {
  onSettingsClick: () => void;
  onNotificationsClick: () => void;
}

export const HomeHeader: React.FC<HomeHeaderProps> = ({ onSettingsClick, onNotificationsClick }) => {
  const { portfolio, demoMode, alerts, settings } = useOracle();
  const unreadAlerts = alerts.filter(a => !a.read).length;
  const isPositive = portfolio.totalPnL >= 0;

  return (
    <header className="flex items-center justify-between py-3 animate-fade-in">
      {/* Left - Logo & Title */}
      <div className="flex items-center gap-3">
        {/* Circular logo - owl only */}
        <div className="w-11 h-11 rounded-full overflow-hidden shadow-lg shadow-primary/30 ring-2 ring-primary/30 flex-shrink-0 bg-background">
          <img 
            src={oracleLogo} 
            alt="Oracle OS" 
            className="w-full h-full object-cover" 
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-gradient-oracle">Oracle OS</h1>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${
              demoMode ? 'bg-oracle-orange/15 text-oracle-orange border border-oracle-orange/25' : 'bg-oracle-green/15 text-oracle-green border border-oracle-green/25'
            }`}>
              {demoMode ? 'DEMO' : 'LIVE'}
            </span>
          </div>
          {settings.showPnlInHeader && (
            <div className="flex items-center gap-1 text-xs">
              {isPositive ? (
                <TrendingUp className="w-3 h-3 text-oracle-green" />
              ) : (
                <TrendingDown className="w-3 h-3 text-oracle-red" />
              )}
              <span className={isPositive ? 'text-oracle-green font-mono' : 'text-oracle-red font-mono'}>
                {isPositive ? '+' : ''}{portfolio.totalPnLPercent.toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Right - Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onNotificationsClick}
          className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-all hover:border-primary/30"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-oracle-red text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-lg shadow-oracle-red/30">
              {unreadAlerts}
            </span>
          )}
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted border border-border/50 transition-all hover:border-primary/30"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
