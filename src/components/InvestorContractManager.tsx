import React, { useState, useEffect, useCallback } from 'react';
import { 
  FileText, Plus, X, Check, Clock, AlertTriangle, 
  DollarSign, Shield, TrendingUp, Send, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { PremiumCard } from './PremiumCard';

interface Contract {
  id: string;
  investor_name: string;
  investor_email: string | null;
  contract_type: string;
  amount: number;
  profit_share: number;
  capital_limit: number | null;
  risk_constraint_max_drawdown: number | null;
  risk_constraint_max_daily_loss: number | null;
  duration_days: number | null;
  status: string;
  performance_pnl: number | null;
  performance_trades: number | null;
  activated_at: string | null;
  expires_at: string | null;
  created_at: string;
}

const CONTRACT_TYPES = [
  { value: 'profit-sharing', label: 'Profit Sharing' },
  { value: 'capital-delegation', label: 'Capital Delegation' },
  { value: 'performance-linked', label: 'Performance Linked' },
  { value: 'time-bound', label: 'Time Bound' },
];

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  created: { label: 'Draft', color: 'text-muted-foreground', bg: 'bg-muted' },
  sent: { label: 'Sent', color: 'text-oracle-blue', bg: 'bg-oracle-blue/15' },
  accepted: { label: 'Accepted', color: 'text-oracle-green', bg: 'bg-oracle-green/15' },
  rejected: { label: 'Rejected', color: 'text-oracle-red', bg: 'bg-oracle-red/15' },
  activated: { label: 'Active', color: 'text-oracle-green', bg: 'bg-oracle-green/15' },
  expired: { label: 'Expired', color: 'text-muted-foreground', bg: 'bg-muted' },
  renewed: { label: 'Renewed', color: 'text-oracle-purple', bg: 'bg-oracle-purple/15' },
};

export const InvestorContractManager: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Form state
  const [form, setForm] = useState({
    investor_name: '',
    investor_email: '',
    contract_type: 'profit-sharing',
    amount: 1000,
    profit_share: 20,
    capital_limit: 5000,
    risk_constraint_max_drawdown: 20,
    risk_constraint_max_daily_loss: 10,
    duration_days: 90,
  });

  const loadContracts = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setUserId(user.id);

    const { data, error } = await supabase
      .from('investor_contracts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setContracts(data as unknown as Contract[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadContracts();
  }, [loadContracts]);

  const createContract = async () => {
    if (!userId || !form.investor_name) {
      toast.error('Investor name is required');
      return;
    }

    const { error } = await supabase.from('investor_contracts').insert({
      user_id: userId,
      investor_name: form.investor_name,
      investor_email: form.investor_email || null,
      contract_type: form.contract_type,
      amount: form.amount,
      profit_share: form.profit_share,
      capital_limit: form.capital_limit,
      risk_constraint_max_drawdown: form.risk_constraint_max_drawdown,
      risk_constraint_max_daily_loss: form.risk_constraint_max_daily_loss,
      duration_days: form.duration_days,
      status: 'created',
    } as any);

    if (error) {
      toast.error('Failed to create contract');
      return;
    }

    toast.success('Contract created');
    setShowCreate(false);
    setForm({
      investor_name: '', investor_email: '', contract_type: 'profit-sharing',
      amount: 1000, profit_share: 20, capital_limit: 5000,
      risk_constraint_max_drawdown: 20, risk_constraint_max_daily_loss: 10, duration_days: 90,
    });
    loadContracts();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'activated') {
      updates.activated_at = new Date().toISOString();
      const contract = contracts.find(c => c.id === id);
      if (contract?.duration_days) {
        const expires = new Date();
        expires.setDate(expires.getDate() + contract.duration_days);
        updates.expires_at = expires.toISOString();
      }
    }
    
    const { error } = await supabase.from('investor_contracts').update(updates).eq('id', id);
    if (error) {
      toast.error('Failed to update contract');
      return;
    }
    toast.success(`Contract ${newStatus}`);
    loadContracts();
  };

  const getStatusInfo = (status: string) => STATUS_MAP[status] || STATUS_MAP.created;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Investor Contracts</span>
        </div>
        <button 
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          New Contract
        </button>
      </div>

      {/* Create Form */}
      {showCreate && (
        <PremiumCard className="p-4 animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Create Contract</h3>
            <button onClick={() => setShowCreate(false)} className="p-1 rounded hover:bg-muted">
              <X className="w-4 h-4 text-muted-foreground" />
            </button>
          </div>
          
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Investor Name *</label>
                <input 
                  value={form.investor_name} 
                  onChange={e => setForm(p => ({ ...p, investor_name: e.target.value }))}
                  className="w-full mt-1 bg-muted border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="Name"
                />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Email</label>
                <input 
                  value={form.investor_email} 
                  onChange={e => setForm(p => ({ ...p, investor_email: e.target.value }))}
                  className="w-full mt-1 bg-muted border border-border/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50" 
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Contract Type</label>
              <select 
                value={form.contract_type}
                onChange={e => setForm(p => ({ ...p, contract_type: e.target.value }))}
                className="w-full mt-1 bg-muted border border-border/50 rounded-xl px-3 py-2 text-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {CONTRACT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Amount ($)</label>
                <input type="number" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: +e.target.value }))}
                  className="w-full mt-1 bg-muted border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Profit Share (%)</label>
                <input type="number" value={form.profit_share} onChange={e => setForm(p => ({ ...p, profit_share: +e.target.value }))}
                  className="w-full mt-1 bg-muted border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Duration (days)</label>
                <input type="number" value={form.duration_days} onChange={e => setForm(p => ({ ...p, duration_days: +e.target.value }))}
                  className="w-full mt-1 bg-muted border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Drawdown (%)</label>
                <input type="number" value={form.risk_constraint_max_drawdown} onChange={e => setForm(p => ({ ...p, risk_constraint_max_drawdown: +e.target.value }))}
                  className="w-full mt-1 bg-muted border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Max Daily Loss (%)</label>
                <input type="number" value={form.risk_constraint_max_daily_loss} onChange={e => setForm(p => ({ ...p, risk_constraint_max_daily_loss: +e.target.value }))}
                  className="w-full mt-1 bg-muted border border-border/50 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/50" />
              </div>
            </div>

            <button onClick={createContract} className="w-full btn-oracle text-sm flex items-center justify-center gap-2">
              <FileText className="w-4 h-4" />
              Create Contract
            </button>
          </div>
        </PremiumCard>
      )}

      {/* Contract List */}
      {loading ? (
        <div className="text-center py-6 text-xs text-muted-foreground">Loading contracts...</div>
      ) : contracts.length === 0 ? (
        <PremiumCard className="p-6 text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No contracts yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">Create your first investor contract</p>
        </PremiumCard>
      ) : (
        <div className="space-y-2">
          {contracts.map(contract => {
            const statusInfo = getStatusInfo(contract.status);
            const isExpanded = expandedId === contract.id;
            
            return (
              <PremiumCard key={contract.id} className="overflow-hidden">
                <button 
                  onClick={() => setExpandedId(isExpanded ? null : contract.id)}
                  className="w-full p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-left">
                      <span className="text-sm font-medium">{contract.investor_name}</span>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono">${contract.amount.toLocaleString()}</span>
                        <span>•</span>
                        <span>{contract.profit_share}% share</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold ${statusInfo.bg} ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border/30 p-4 space-y-3 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Type:</span>
                        <span className="font-medium capitalize">{contract.contract_type.replace('-', ' ')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Duration:</span>
                        <span className="font-mono">{contract.duration_days}d</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Shield className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Max DD:</span>
                        <span className="font-mono">{contract.risk_constraint_max_drawdown}%</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-3 h-3 text-muted-foreground" />
                        <span className="text-muted-foreground">Daily Loss:</span>
                        <span className="font-mono">{contract.risk_constraint_max_daily_loss}%</span>
                      </div>
                      {contract.performance_pnl !== null && contract.performance_pnl !== 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-3 h-3 text-oracle-green" />
                          <span className="text-muted-foreground">P&L:</span>
                          <span className={`font-mono ${(contract.performance_pnl || 0) >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                            ${contract.performance_pnl?.toFixed(2)}
                          </span>
                        </div>
                      )}
                      {contract.expires_at && (
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-oracle-orange" />
                          <span className="text-muted-foreground">Expires:</span>
                          <span className="font-mono">{new Date(contract.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions based on status */}
                    <div className="flex gap-2 pt-2">
                      {contract.status === 'created' && (
                        <>
                          <button onClick={() => updateStatus(contract.id, 'sent')} 
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
                            <Send className="w-3 h-3" /> Send
                          </button>
                          <button onClick={() => updateStatus(contract.id, 'rejected')}
                            className="px-3 py-2 rounded-xl bg-destructive/10 text-destructive text-xs font-medium hover:bg-destructive/20 transition-colors">
                            <X className="w-3 h-3" />
                          </button>
                        </>
                      )}
                      {contract.status === 'sent' && (
                        <>
                          <button onClick={() => updateStatus(contract.id, 'accepted')}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-oracle-green/10 text-oracle-green text-xs font-medium hover:bg-oracle-green/20 transition-colors">
                            <Check className="w-3 h-3" /> Accept
                          </button>
                          <button onClick={() => updateStatus(contract.id, 'rejected')}
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-oracle-red/10 text-oracle-red text-xs font-medium hover:bg-oracle-red/20 transition-colors">
                            <X className="w-3 h-3" /> Reject
                          </button>
                        </>
                      )}
                      {contract.status === 'accepted' && (
                        <button onClick={() => updateStatus(contract.id, 'activated')}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-oracle-green/10 text-oracle-green text-xs font-medium hover:bg-oracle-green/20 transition-colors">
                          <Check className="w-3 h-3" /> Activate
                        </button>
                      )}
                      {contract.status === 'expired' && (
                        <button onClick={() => updateStatus(contract.id, 'renewed')}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-oracle-purple/10 text-oracle-purple text-xs font-medium hover:bg-oracle-purple/20 transition-colors">
                          Renew
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </PremiumCard>
            );
          })}
        </div>
      )}
    </div>
  );
};
