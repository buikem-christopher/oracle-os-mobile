import React from 'react';
import { Home, BarChart3, Radio, User, Settings } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'environments', label: 'Oracle', icon: BarChart3 },
  { id: 'signals', label: 'Signals', icon: Radio },
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-xl border-t border-border/50">
      <div className="flex items-center justify-around px-1 py-1.5 pb-5 max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative flex flex-col items-center justify-center w-14 h-12 rounded-lg transition-all duration-200 ${
                isActive ? 'bg-primary/10' : 'hover:bg-muted/50'
              }`}
            >
              <Icon 
                className={`w-5 h-5 transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              />
              <span
                className={`mt-0.5 text-[10px] font-medium transition-colors duration-200 ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <div className="absolute -top-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-primary rounded-full" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
