import React from 'react';
import { PortfolioCard } from '@/components/PortfolioCard';
import { QuickSpawnAgent } from '@/components/QuickSpawnAgent';
import { ActivityFeed } from '@/components/ActivityFeed';
import { AchievementBadges } from '@/components/AchievementBadges';
import { CapitalManager } from '@/components/CapitalManager';
import { useOracle } from '@/contexts/OracleContext';
import { BookOpen, Zap, Shield, Brain, ChevronRight } from 'lucide-react';

export const HomePage: React.FC = () => {
  const { agents } = useOracle();

  return (
    <div className="space-y-4 animate-fade-in pb-4">
      <header className="pt-2">
        <h1 className="text-2xl font-bold text-gradient-oracle">Oracle OS</h1>
        <p className="text-sm text-muted-foreground">Multi-Agent Trading Intelligence</p>
      </header>

      <PortfolioCard />
      
      {/* Capital Management */}
      <CapitalManager />
      
      {/* Quick Spawn */}
      <QuickSpawnAgent />

      {/* Achievements */}
      <AchievementBadges />

      {/* Activity Feed */}
      <ActivityFeed />

      {/* Oracle Models */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Oracle Models</h2>
        <div className="grid grid-cols-3 gap-2">
          {[
            { name: 'Preview', badge: 'badge-preview', icon: Zap, status: 'Active' },
            { name: 'Exp', badge: 'badge-exp', icon: Brain, status: 'Beta' },
            { name: 'Ultra', badge: 'badge-ultra', icon: Shield, status: 'Soon' },
          ].map((model) => (
            <div key={model.name} className="glass-card p-3 text-center">
              <model.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <span className={model.badge}>{model.name}</span>
              <p className="text-[10px] text-muted-foreground mt-1">{model.status}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Learn Section */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Learn & Trust</h2>
        <div className="space-y-2">
          {[
            { title: 'How Oracle Works', desc: 'Multi-agent intelligence' },
            { title: 'Risk System Layer', desc: 'Capital protection' },
            { title: 'XHR Foresight', desc: 'See the future' },
          ].map((item) => (
            <button key={item.title} className="w-full glass-card p-3 flex items-center justify-between hover:border-primary/30 transition-colors">
              <div className="flex items-center gap-3">
                <BookOpen className="w-4 h-4 text-primary" />
                <div className="text-left">
                  <p className="text-sm font-medium">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
};
