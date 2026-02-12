import React from 'react';

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'premium' | 'elevated' | 'glass';
  hover3D?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ 
  children, 
  className = '', 
  variant = 'elevated',
  hover3D = true 
}) => {
  const baseClass = variant === 'premium' ? 'card-premium' : 
                     variant === 'glass' ? 'glass-card' : 'card-elevated';

  return (
    <div className={`${baseClass} ${hover3D ? 'card-3d-hover' : ''} ${className}`}>
      {children}
    </div>
  );
};
