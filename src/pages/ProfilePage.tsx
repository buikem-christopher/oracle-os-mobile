import React, { useState, useEffect } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  User, FileText, Check, X, Wallet, TrendingUp, TrendingDown,
  Award, Edit, Camera, Shield, Star, Crown, Target, 
  Activity, GraduationCap, CreditCard, Mail, Calendar, ChevronRight, LogOut, Bell, BellOff
} from 'lucide-react';
import { PortfolioSparkline } from '@/components/PortfolioSparkline';
import { StudentVerificationAdvanced } from '@/components/StudentVerificationAdvanced';
import { SubscriptionPlans } from '@/components/SubscriptionPlans';
import oracleLogo from '@/assets/oracle-logo-new.jpg';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNotifications } from '@/hooks/useNotifications';

interface ProfilePageProps {
  onLogout: () => void;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ onLogout }) => {
  const { 
    user, updateUser, contracts, approveContract, rejectContract, 
    portfolio, achievements 
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
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        supabase
          .from('profiles')
          .select('student_verification_status, subscription_plan, tier')
          .eq('user_id', user.id)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.student_verification_status) {
              setStudentStatus(data.student_verification_status as any);
            }
            if (data?.subscription_plan) {
              setCurrentPlan(data.subscription_plan);
            }
          });
      }
    });
  }, []);
  
  const handleSaveName = async () => {
    updateUser({ name: editName });
    setIsEditing(false);
    
    // Update in database
    if (userId) {
      await supabase.from('profiles').update({ name: editName }).eq('user_id', userId);
    }
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

  // Check if user has earned tier
  const hasEarnedTier = user.tier !== 'free';

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-xs text-muted-foreground">Account & Subscription Management</p>
      </header>

      {/* User Card - Premium */}
      <div className="card-premium p-5 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-bl from-primary/10 to-transparent rounded-full blur-3xl" />
        <div className="relative flex items-start gap-4">
          <div className="relative">
            <div className="w-18 h-18 rounded-2xl bg-gradient-to-br from-primary/20 to-oracle-purple/20 p-[2px] shadow-xl shadow-primary/20">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-background">
                <img 
                  src={user.avatar || oracleLogo} 
                  alt="Avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            </div>
            <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-primary/20 border-2 border-background flex items-center justify-center hover:bg-primary/30 transition-colors">
              <Camera className="w-3.5 h-3.5 text-primary" />
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
              {/* Only show tier badge if earned */}
              {hasEarnedTier && (
                <span className={`text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold ${
                  user.tier === 'enterprise' ? 'bg-oracle-gold/15 text-oracle-gold border border-oracle-gold/25' :
                  user.tier === 'pro' ? 'bg-oracle-purple/15 text-oracle-purple border border-oracle-purple/25' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {user.tier}
                </span>
              )}
              {studentStatus === 'approved' && (
                <span className="text-[10px] px-2.5 py-0.5 rounded-full uppercase font-bold bg-oracle-green/15 text-oracle-green border border-oracle-green/25">
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

      {/* Stats Grid - Only show real data */}
      <div className="grid grid-cols-2 gap-2">
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-primary" />
            <span className="text-xs text-muted-foreground">Total Trades</span>
          </div>
          <div className="font-mono text-2xl font-bold">{user.totalTrades}</div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="w-4 h-4 text-oracle-green" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <div className={`font-mono text-2xl font-bold ${user.winRate > 0 ? 'text-oracle-green' : 'text-muted-foreground'}`}>
            {user.winRate > 0 ? `${user.winRate.toFixed(1)}%` : '—'}
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-oracle-green" />
            <span className="text-xs text-muted-foreground">Best Trade</span>
          </div>
          <div className={`font-mono text-xl font-bold ${user.bestTrade > 0 ? 'text-oracle-green' : 'text-muted-foreground'}`}>
            {user.bestTrade > 0 ? `+$${user.bestTrade}` : '—'}
          </div>
        </div>
        <div className="card-elevated p-4">
          <div className="flex items-center gap-2 mb-2">
            <TrendingDown className="w-4 h-4 text-oracle-red" />
            <span className="text-xs text-muted-foreground">Worst Trade</span>
          </div>
          <div className={`font-mono text-xl font-bold ${user.worstTrade < 0 ? 'text-oracle-red' : 'text-muted-foreground'}`}>
            {user.worstTrade < 0 ? `$${user.worstTrade}` : '—'}
          </div>
        </div>
      </div>

      {/* Capital Overview */}
      <div className="card-premium p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Capital Overview</span>
          </div>
          <PortfolioSparkline />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="metric-card text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</div>
            <div className="font-mono text-lg font-bold">${portfolio.totalCapital.toFixed(0)}</div>
          </div>
          <div className="metric-card text-center">
            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Available</div>
            <div className="font-mono text-lg font-bold">${portfolio.availableCapital.toFixed(0)}</div>
          </div>
          <div className="metric-card text-center">
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
          className="w-full card-elevated p-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
              permission === 'granted' ? 'bg-oracle-green/15' : 'bg-muted'
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

      {/* Student Support */}
      <button
        onClick={() => setShowStudentVerification(true)}
        className="w-full card-elevated p-4 flex items-center justify-between"
        disabled={studentStatus === 'approved' || studentStatus === 'pending'}
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            studentStatus === 'approved' ? 'bg-oracle-green/15' : 
            studentStatus === 'pending' ? 'bg-oracle-gold/15' : 'bg-oracle-purple/15'
          }`}>
            <GraduationCap className={`w-5 h-5 ${
              studentStatus === 'approved' ? 'text-oracle-green' : 
              studentStatus === 'pending' ? 'text-oracle-gold' : 'text-oracle-purple'
            }`} />
          </div>
          <div className="text-left">
            <div className="text-sm font-medium">Student Support</div>
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
        className="w-full card-elevated p-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/15 flex items-center justify-center">
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
      <div className="card-premium p-4">
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
                  ? 'bg-muted/50 border border-primary/20 shadow-sm' 
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
              <div key={contract.id} className="card-elevated p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-oracle-purple/15 flex items-center justify-center">
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
              <div key={contract.id} className="card-elevated p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-oracle-green/15 flex items-center justify-center">
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

      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="w-full card-elevated p-4 flex items-center justify-center gap-2 text-destructive hover:bg-destructive/10 transition-colors"
      >
        <LogOut className="w-4 h-4" />
        <span className="font-medium">Sign Out</span>
      </button>

      {/* Version */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <p className="font-mono">Oracle OS v1.1.0</p>
        <p className="mt-1">© 2026 Oracle Trading Intelligence</p>
      </div>
    </div>
  );
};
