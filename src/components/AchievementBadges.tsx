import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { Rocket, TrendingUp, Bot, Shield, Star, Lock } from 'lucide-react';

const getAchievementIcon = (icon: string, unlocked: boolean) => {
  const className = `w-5 h-5 ${unlocked ? 'text-oracle-gold' : 'text-muted-foreground/30'}`;
  switch (icon) {
    case 'rocket': return <Rocket className={className} />;
    case 'trending-up': return <TrendingUp className={className} />;
    case 'bot': return <Bot className={className} />;
    case 'shield': return <Shield className={className} />;
    case 'star': return <Star className={className} />;
    default: return <Star className={className} />;
  }
};

export const AchievementBadges: React.FC = () => {
  const { achievements } = useOracle();
  const unlockedCount = achievements.filter(a => a.unlocked).length;

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-3 border-b border-border/50">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Star className="w-4 h-4 text-oracle-gold" />
            Achievements
          </h3>
          <span className="text-xs text-muted-foreground">{unlockedCount}/{achievements.length}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="grid grid-cols-5 gap-2">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className="group relative animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div
                className={`aspect-square rounded-xl flex items-center justify-center transition-all ${
                  achievement.unlocked
                    ? 'bg-oracle-gold/20 border border-oracle-gold/50 shadow-[0_0_15px_hsl(45_100%_50%/0.3)]'
                    : 'bg-muted/30 border border-border/50'
                }`}
              >
                {achievement.unlocked ? (
                  getAchievementIcon(achievement.icon, true)
                ) : (
                  <Lock className="w-4 h-4 text-muted-foreground/30" />
                )}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-popover border border-border shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
                <p className="text-xs font-medium">{achievement.name}</p>
                <p className="text-[10px] text-muted-foreground">{achievement.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
