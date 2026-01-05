import React from 'react';
import { motion } from 'framer-motion';
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
    <nav className="fixed bottom-0 left-0 right-0 z-50">
      {/* Gradient blur background */}
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-xl" />
      
      {/* Top border glow */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      
      <div className="relative flex items-center justify-around px-2 py-2 pb-6">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center w-16 h-14 transition-all duration-300"
            >
              {/* Active indicator background */}
              {isActive && (
                <div className="absolute inset-1 rounded-xl bg-primary/10 transition-all duration-300" />
              )}
              
              {/* Glow effect for active tab */}
              {isActive && (
                <div
                  className="absolute inset-0 rounded-xl transition-opacity duration-300"
                  style={{
                    background: 'radial-gradient(ellipse at center, hsl(185 100% 60% / 0.15), transparent 70%)',
                  }}
                />
              )}
              
              <div
                className={`relative z-10 transition-transform duration-300 ${isActive ? 'scale-110 -translate-y-0.5' : ''}`}
              >
                <Icon 
                  className={`w-5 h-5 transition-colors duration-300 ${
                    isActive 
                      ? 'text-primary drop-shadow-[0_0_8px_hsl(185_100%_60%/0.6)]' 
                      : 'text-muted-foreground'
                  }`}
                />
              </div>
              
              <span
                className={`relative z-10 mt-1 text-[10px] font-medium transition-all duration-300 ${
                  isActive ? 'text-primary opacity-100' : 'text-muted-foreground opacity-60'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
