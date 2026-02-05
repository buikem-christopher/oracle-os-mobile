import React from 'react';
import { Check, Zap, Crown, Sparkles } from 'lucide-react';

interface SubscriptionPlansProps {
  currentPlan: string;
  onSelectPlan: (plan: string) => void;
}

export const SubscriptionPlans: React.FC<SubscriptionPlansProps> = ({ currentPlan, onSelectPlan }) => {
  const plans = [
    {
      id: 'preview_exp',
      name: 'Preview & Exp',
      price: '$100',
      period: 'one-time',
      icon: Sparkles,
      features: [
        'Access to Preview model',
        'Access to Experimental model',
        '10% profit share',
        'Basic support',
      ],
      profitShare: '10%',
      color: 'primary',
    },
    {
      id: 'rpm_share',
      name: 'RPM Share',
      price: '$100',
      period: 'one-time',
      icon: Zap,
      features: [
        'Access to RPM model',
        'Preview & Exp included',
        '50% profit share',
        'Priority support',
      ],
      profitShare: '50%',
      color: 'oracle-purple',
      popular: true,
    },
    {
      id: 'rpm_lifetime',
      name: 'RPM Lifetime',
      price: '$500',
      period: 'lifetime',
      icon: Crown,
      features: [
        'Unlimited RPM access',
        'All models included',
        'Only 10% profit share',
        'VIP support',
        'Early access to new models',
      ],
      profitShare: '10%',
      color: 'oracle-gold',
    },
  ];

  return (
    <div className="space-y-3">
      {plans.map((plan) => {
        const isActive = currentPlan === plan.id;
        const Icon = plan.icon;
        
        return (
          <div
            key={plan.id}
            className={`glass-card p-4 transition-all ${
              isActive 
                ? `ring-2 ring-${plan.color}/50 bg-${plan.color}/5` 
                : 'hover:bg-muted/30'
            } ${plan.popular ? 'relative' : ''}`}
          >
            {plan.popular && (
              <span className="absolute -top-2 right-4 px-2 py-0.5 bg-oracle-purple text-white text-[10px] font-bold rounded-full">
                POPULAR
              </span>
            )}
            
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-${plan.color}/20 flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 text-${plan.color}`} />
                </div>
                <div>
                  <h3 className="font-medium">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold">{plan.price}</span>
                    <span className="text-xs text-muted-foreground">/{plan.period}</span>
                  </div>
                </div>
              </div>
              <span className={`text-xs px-2 py-1 rounded bg-${plan.color}/20 text-${plan.color} font-medium`}>
                {plan.profitShare} share
              </span>
            </div>

            <ul className="space-y-2 mb-4">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Check className="w-3.5 h-3.5 text-oracle-green" />
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => onSelectPlan(plan.id)}
              disabled={isActive}
              className={`w-full py-2.5 rounded-lg font-medium text-sm transition-all ${
                isActive
                  ? 'bg-muted text-muted-foreground cursor-default'
                  : `bg-${plan.color}/10 text-${plan.color} hover:bg-${plan.color}/20`
              }`}
            >
              {isActive ? 'Current Plan' : 'Select Plan'}
            </button>
          </div>
        );
      })}
    </div>
  );
};
