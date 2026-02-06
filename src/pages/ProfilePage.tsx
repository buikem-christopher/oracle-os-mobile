import React, { useState, useEffect } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  User, FileText, Check, X, Wallet, TrendingUp, TrendingDown,
  Award, Clock, Edit, Camera, Shield, Star, Crown, Target, 
  Activity, GraduationCap, CreditCard, Mail, Calendar, ChevronRight, LogOut, Bell, BellOff
} from 'lucide-react';
import { PortfolioSparkline } from '@/components/PortfolioSparkline';
import { StudentVerificationAdvanced } from '@/components/StudentVerificationAdvanced';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import oracleLogo from '@/assets/oracle-logo.jpg';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { 
    user, updateUser, contracts, approveContract, rejectContract, 
    portfolio, achievements, tradeHistory 
  } = useOracle();
  
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name);
  const [showPlans, setShowPlans] = useState(false);
  const [showStudentVerification, setShowStudentVerification] = useState(false);
  const [studentStatus, setStudentStatus] = useState<'none' | 'pending' | 'approved' | 'rejected'>('none');
  const [currentPlan, setCurrentPlan] = useState('none');
  const [userId, setUserId] = useState<string | null>(null);
  
  const { permission, requestPermission, isSupported } = useNotifications();
  
  const pendingContracts = contracts.filter(c => c.status === 'pending');
  const activeContracts = contracts.filter(c => c.status === 'active');
  const unlockedAchievements = achievements.filter(a => a.unlocked);

  useEffect(() => {
    // Get current user ID
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        // Fetch student verification status
        supabase
          .from('profiles')
          .select('student_verification_status')
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.student_verification_status) {
              setStudentStatus(data.student_verification_status as any);
            }
          });
      }
    });
  }, []);
  
  const handleSaveName = () => {
    updateUser({ name: editName });
    setIsEditing(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success('Logged out successfully');
      onLogout();
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const handleVerificationComplete = () => {
    setShowStudentVerification(false);
    setStudentStatus('pending');
    toast.success('Verification submitted!');
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
        <p className="text-xs text-muted-foreground">Account & Subscription Management</p>
      </header>

      {/* User Card */}
      <div className="glass-card p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-2xl" />
        <div className="relative flex items-start gap-4">
          <div className="relative">
            <div className="w-18 h-18 rounded-2xl bg-gradient-oracle flex items-center justify-center shadow-lg shadow-primary/20">
              <img src={oracleLogo} alt="Avatar" className="w-16 h-16 rounded-xl object-cover" />
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-muted border-2 border-background flex items-center justify-center hover:bg-primary/20 transition-colors">
              <Camera className="w-3.5 h-3.5 text-muted-foreground" />
            </button>
          </div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-2 mb-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="bg-muted px-3 py-1.5 rounded-lg text-sm font-medium w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                  autoFocus
                />
                <button onClick={handleSaveName} className="p-2 rounded-lg bg-primary text-primary-foreground">
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setIsEditing(false)} className="p-2 rounded-lg bg-muted">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-lg font-bold truncate">{user.name}</h2>
                <button onClick={() => setIsEditing(true)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Edit className="w-3.5 h-3.5 text-muted-foreground" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
              <Mail className="w-3 h-3" />
              <span className="truncate">{user.email}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold ${
                user.tier === 'enterprise' ? 'bg-oracle-gold/20 text-oracle-gold' :
                user.tier === 'pro' ? 'bg-oracle-purple/20 text-oracle-purple' :
                'bg-muted text-muted-foreground'
              }`}>
                {user.tier}
              </span>
              {studentStatus === 'approved' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full uppercase font-bold bg-oracle-green/20 text-oracle-green">
                  Student
                </span>
              )}
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                Since {user.memberSince.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Trades</span>
          </div>
          <div className="font-mono text-2xl font-bold">{user.totalTrades}</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-oracle-green" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <div className="font-mono text-2xl font-bold text-oracle-green">{user.winRate}%</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-oracle-green" />
            <span className="text-xs text-muted-foreground">Best Trade</span>
          </div>
          <div className="font-mono text-xl font-bold text-oracle-green">+${user.bestTrade}</div>
        </div>
        <div className="glass-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-oracle-red" />
            <span className="text-xs text-muted-foreground">Worst Trade</span>
          </div>
          <div className="font-mono text-xl font-bold text-oracle-red">${user.worstTrade}</div>
        </div>
      </div>

      {/* Capital Overview */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Capital Overview</span>
          </div>
          <PortfolioSparkline />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
            <div className="font-mono text-lg font-bold">${portfolio.totalCapital.toFixed(0)}</div>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Available</div>
            <div className="font-mono text-lg font-bold">${portfolio.availableCapital.toFixed(0)}</div>
          </div>
          <div className="bg-muted/30 rounded-xl p-3 text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">P&L</div>
            <div className={`font-mono text-lg font-bold ${portfolio.totalPnL >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
              {portfolio.totalPnL >= 0 ? '+' : ''}${portfolio.totalPnL.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Push Notifications */}
      {isSupported && (
        <button
          onClick={requestPermission}
          className="w-full glass-card p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              permission === 'granted' ? 'bg-oracle-green/20' : 'bg-muted'
            }`}>
              {permission === 'granted' ? (
                <Bell className="w-5 h-5 text-oracle-green" />
              ) : (
                <BellOff className="w-5 h-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <div className="text-sm font-medium">Push Notifications</div>
              <div className="text-xs text-muted-foreground">
                {permission === 'granted' ? 'Enabled' : 'Enable alerts for trades'}
              </div>
            </div>
          </div>
          {permission === 'granted' && <Check className="w-4 h-4 text-oracle-green" />}
        </button>
      )}

      {/* Student Verification */}
      <button
        onClick={() => setShowStudentVerification(true)}
        className="w-full glass-card p-4 flex items-center justify-between"
        disabled={studentStatus === 'approved' || studentStatus === 'pending'}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            studentStatus === 'approved' ? 'bg-oracle-green/20' : 
            studentStatus === 'pending' ? 'bg-oracle-gold/20' : 'bg-oracle-purple/20'
          }`}>
            <GraduationCap className={`w-5 h-5 ${
              studentStatus === 'approved' ? 'text-oracle-green' : 
              studentStatus === 'pending' ? 'text-oracle-gold' : 'text-oracle-purple'
            }`} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Student Verification</div>
            <div className="text-xs text-muted-foreground">
              {studentStatus === 'approved' ? 'Verified ✓' : 
               studentStatus === 'pending' ? 'Under review (24-48h)' : 
               'Get free access to models'}
            </div>
          </div>
        </div>
        {studentStatus !== 'approved' && studentStatus !== 'pending' && (
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
        )}
        {studentStatus === 'approved' && <Check className="w-4 h-4 text-oracle-green" />}
      </button>

      {/* Advanced Student Verification Modal */}
      {showStudentVerification && userId && studentStatus !== 'approved' && studentStatus !== 'pending' && (
        <StudentVerificationAdvanced 
          userId={userId}
          onComplete={handleVerificationComplete}
          onClose={() => setShowStudentVerification(false)}
        />
      )}

      {/* Subscription Plans */}
      <button
        onClick={() => setShowPlans(!showPlans)}
        className="w-full glass-card p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <CreditCard className="w-5 h-5 text-primary" />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Subscription Plans</div>
            <div className="text-xs text-muted-foreground">Upgrade to access RPM</div>
          </div>
        </div>
        <ChevronRight className={`w-4 h-4 text-muted-foreground transition-transform ${showPlans ? 'rotate-90' : ''}`} />
      </button>

      {showPlans && (
        <SubscriptionPlans currentPlan={currentPlan} onSelectPlan={setCurrentPlan} />
      )}

      {/* Achievements */}
      <div className="glass-card p-4">
        <div className="flex items-center justify-between mb-4">
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
              className={`p-3 rounded-xl text-center transition-all ${
                achievement.unlocked 
                  ? 'bg-muted/50 border border-primary/20' 
                  : 'bg-muted/20 opacity-40'
              }`}
              title={`${achievement.name}: ${achievement.description}`}
            >
              {getTierIcon(achievement.tier)}
              <div className="text-[9px] text-muted-foreground mt-1.5 truncate">{achievement.name}</div>
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
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-oracle-purple/10 flex items-center justify-center">
                      <User className="w-5 h-5 text-oracle-purple" />
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
                    className="flex-1 btn-sell flex items-center justify-center gap-1.5"
                  >
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                  <button 
                    onClick={() => approveContract(contract.id)} 
                    className="flex-1 btn-buy flex items-center justify-center gap-1.5"
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
              <div key={contract.id} className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-oracle-green/10 flex items-center justify-center">
                    <User className="w-5 h-5 text-oracle-green" />
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
                    <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${
                      trade.type === 'buy' ? 'bg-oracle-green/20 text-oracle-green' : 'bg-oracle-red/20 text-oracle-red'
                    }`}>
                      {trade.type}
                    </span>
                    <span className="font-mono text-sm">{trade.market}</span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {trade.timestamp.toLocaleTimeString()} • {trade.agentName || 'Manual'}
                  </div>
                </div>
                {trade.pnl !== undefined && (
                  <span className={`font-mono text-sm font-semibold ${trade.pnl >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                    {trade.pnl >= 0 ? '+' : ''}${trade.pnl.toFixed(2)}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="w-full glass-card p-4 flex items-center justify-center gap-2 text-oracle-red hover:bg-oracle-red/5 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="font-medium">Sign Out</span>
      </button>
    </div>
  );
};
