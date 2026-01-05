import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { User, FileText, Check, X } from 'lucide-react';
import { PortfolioCard } from '@/components/PortfolioCard';

export const ProfilePage: React.FC = () => {
  const { contracts, approveContract, rejectContract } = useOracle();
  const pendingContracts = contracts.filter(c => c.status === 'pending');

  return (
    <div className="space-y-4 animate-fade-in">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Profile</h1>
        <p className="text-xs text-muted-foreground">Capital & Contract Management</p>
      </header>

      <PortfolioCard />

      {/* Contracts */}
      <section>
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Investor Contracts</h2>
        {pendingContracts.length > 0 ? (
          <div className="space-y-2">
            {pendingContracts.map(contract => (
              <div key={contract.id} className="glass-card p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm">{contract.investorName}</span>
                  </div>
                  <span className="badge-exp">Pending</span>
                </div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-mono">${contract.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-muted-foreground">Profit Share</span>
                  <span className="font-mono text-primary">{contract.profitShare}%</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => rejectContract(contract.id)} className="flex-1 p-2 rounded-lg bg-destructive/20 text-destructive text-sm flex items-center justify-center gap-1">
                    <X className="w-4 h-4" /> Reject
                  </button>
                  <button onClick={() => approveContract(contract.id)} className="flex-1 p-2 rounded-lg bg-oracle-green/20 text-oracle-green text-sm flex items-center justify-center gap-1">
                    <Check className="w-4 h-4" /> Approve
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="glass-card p-6 text-center">
            <FileText className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
            <p className="text-sm text-muted-foreground">No pending contracts</p>
          </div>
        )}
      </section>
    </div>
  );
};
