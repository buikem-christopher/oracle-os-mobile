import React, { useState } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  User, FileText, Check, X, Wallet, TrendingUp, TrendingDown,
  Award, Clock, BarChart3, Settings, Edit, Camera, Shield,
  Star, Crown, Zap, Target, Activity
} from 'lucide-react';
import { PortfolioSparkline } from '@/components/PortfolioSparkline';

export const ProfilePage: React.FC = () => {
  const { 
    user, updateUser, contracts, approveContract, rejectContract, 
    portfolio, achievements, tradeHistory 
  } = useOracle();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  
  const pendingContracts = contracts.filter(c => c.status === 'pending');
  const activeContracts = contracts.filter(c => c.status === 'active');
  const unlockedAchievements = achievements.filter(a => a.unlocked);
  
  const handleSaveName = () => {
    updateUser({ name: editName });
    setIsEditing(false);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'bronze': return <Award className="w-4 h-4 text-orange-400" />;
      case 'silver': return <Award className="w-4 h-4 text-gray-400" />;
      case 'gold': return <Star className="w-4 h-4 text-oracle-gold" />;
      case 'platinum': return <Crown className="w-4 h-4 text-oracle-purple" />;
      default: return <Award className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-xs text-muted-foreground">Account & Capital Management</p>
      </header>

      {/* User Card */}
      <div className="glass-card p-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-xl bg-gradient-oracle flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center">
              <Camera className="w-3 h-3 text-muted-foreground" />
            </button>
          </div>
          
          <div className="flex-1">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-muted px-2 py-1 rounded text-sm font-medium w-full"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-1.5 rounded bg-primary text-primary-foreground">
                  <Check className="w-3 h-3" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-1.5 rounded bg-muted">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{user.name}</h2>
                <button onClick={() => setIsEditing(true)} className="p-1 rounded hover:bg-muted">
                  <Edit className="w-3 h-3 text-muted-foreground" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold ${
                user.tier === 'enterprise' ? 'bg-oracle-gold/20 text-oracle-gold' :
                user.tier === 'pro' ? 'bg-oracle-purple/20 text-oracle-purple' :
                'bg-muted text-muted-foreground'
              }`}>
                {user.tier}
              </span>
              <span className="text-xs text-muted-foreground">
                Member since {user.memberSince.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Trades</span>
          </div>
          <div className="font-mono text-xl font-semibold">{user.totalTrades}</div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-oracle-green" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <div className="font-mono text-xl font-semibold text-oracle-green">{user.winRate}%</div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-oracle-green" />
            <span className="text-xs text-muted-foreground">Best Trade</span>
          </div>
          <div className="font-mono text-xl font-semibold text-oracle-green">+${user.bestTrade}</div>
        </div>
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-oracle-red" />
            <span className="text-xs text-muted-foreground">Worst Trade</span>
          </div>
          <div className="font-mono text-xl font-semibold text-oracle-red">${user.worstTrade}</div>
        </div>
      </div>

      {/* Capital Overview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Capital</span>
          </div>
          <PortfolioSparkline />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="metric-card text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
            <div className="font-mono text-sm font-semibold">${portfolio.totalCapital.toFixed(0)}</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Available</div>
            <div className="font-mono text-sm font-semibold">${portfolio.availableCapital.toFixed(0)}</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">P&L</div>
            <div className={`font-mono text-sm font-semibold ${portfolio.totalPnL >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
              {portfolio.totalPnL >= 0 ? '+' : ''}${portfolio.totalPnL.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Award className="w-4 h-4 text-oracle-gold" />
            <span className="text-sm font-medium">Achievements</span>
          </div>
          <span className="text-xs text-muted-foreground">
            {unlockedAchievements.length}/{achievements.length}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {achievements.slice(0, 8).map((achievement) => (
            <div 
              key={achievement.id}
              className={`p-2 rounded-lg text-center ${
                achievement.unlocked 
                  ? 'bg-muted/50 border border-primary/20' 
                  : 'bg-muted/20 opacity-40'
              }`}
              title={`${achievement.name}: ${achievement.description}`}
            >
              {getTierIcon(achievement.tier)}
              <div className="text-[9px] text-muted-foreground mt-1 truncate">{achievement.name}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Pending Contracts */}
      {pendingContracts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Pending Contracts
          </h2>
          <div className="space-y-2">
            {pendingContracts.map(contract => (
              <div key={contract.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-oracle-purple/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-oracle-purple" />
                    </div>
                    <div>
                      <span className="font-medium text-sm">{contract.investorName}</span>
                      <div className="text-xs text-muted-foreground">
                        ${contract.amount.toLocaleString()} • {contract.profitShare}% share
                      </div>
                    </div>
                  </div>
                  <span className="badge-exp">Pending</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => rejectContract(contract.id)} 
                    className="flex-1 btn-sell flex items-center justify-center gap-1"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button 
                    onClick={() => approveContract(contract.id)} 
                    className="flex-1 btn-buy flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Active Contracts */}
      {activeContracts.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Shield className="w-4 h-4" />
            Active Contracts
          </h2>
          <div className="space-y-2">
            {activeContracts.map(contract => (
              <div key={contract.id} className="glass-card p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-oracle-green/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-oracle-green" />
                  </div>
                  <div>
                    <span className="font-medium text-sm">{contract.investorName}</span>
                    <div className="text-xs text-muted-foreground">
                      ${contract.amount.toLocaleString()} • {contract.profitShare}% share
                    </div>
                  </div>
                </div>
                <span className="badge-live">Active</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent Trade History */}
      {tradeHistory.length > 0 && (
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Recent Trades
          </h2>
          <div className="glass-card divide-y divide-border/50">
            {tradeHistory.slice(0, 5).map(trade => (
              <div key={trade.id} className="p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-semibold uppercase ${
                      trade.type === 'buy' ? 'text-oracle-green' : 'text-oracle-red'
                    }`}>
                      {trade.type}
                    </span>
                    <span className="font-mono text-sm">{trade.market}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {trade.timestamp.toLocaleTimeString()} • {trade.agentName || 'Manual'}
                  </div>
                </div>
                {trade.pnl !== undefined && (
                  <span className={`font-mono text-sm ${trade.pnl >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
