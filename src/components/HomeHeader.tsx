import React from 'react';
import { Bell, Settings, TrendingUp, TrendingDown } from 'lucide-react';
import oracleLogo from '@/assets/oracle-logo.jpg';
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
        {/* Circular logo with cropping to show only the icon */}
        <div className="w-10 h-10 rounded-full overflow-hidden shadow-lg shadow-primary/20 ring-2 ring-primary/20 flex-shrink-0">
          <img 
            src={oracleLogo} 
            alt="Oracle OS" 
            className="w-full h-full object-cover scale-150" 
          />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight">Oracle OS</h1>
            <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${
              demoMode ? 'bg-oracle-purple/20 text-oracle-purple' : 'bg-oracle-green/20 text-oracle-green'
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
              <span className={isPositive ? 'text-oracle-green' : 'text-oracle-red'}>
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
          className="relative p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Bell className="w-4 h-4 text-muted-foreground" />
          {unreadAlerts > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-oracle-red text-white text-[10px] font-bold rounded-full flex items-center justify-center">
              {unreadAlerts}
            </span>
          )}
        </button>
        <button
          onClick={onSettingsClick}
          className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
