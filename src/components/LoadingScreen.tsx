import React, { useEffect, useState } from 'react';
import oracleLogo from '@/assets/oracle-logo.jpg';

interface LoadingScreenProps {
  onComplete: () => void;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);

  const phases = [
    'Initializing Oracle...',
    'Loading market data...',
    'Connecting to intelligence layer...',
    'Ready',
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 15 + 5;
        if (next >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 500);
          return 100;
        }
        return next;
      });
    }, 200);

    return () => clearInterval(interval);
  }, [onComplete]);

  useEffect(() => {
    if (progress < 25) setPhase(0);
    else if (progress < 50) setPhase(1);
    else if (progress < 80) setPhase(2);
    else setPhase(3);
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 via-transparent to-transparent animate-pulse" />
          <div 
            className="absolute inset-0 border border-primary/20 rounded-full animate-spin"
            style={{ animationDuration: '20s' }}
          />
          <div 
            className="absolute inset-8 border border-oracle-purple/20 rounded-full animate-spin"
            style={{ animationDuration: '15s', animationDirection: 'reverse' }}
          />
          <div 
            className="absolute inset-16 border border-primary/10 rounded-full animate-spin"
            style={{ animationDuration: '25s' }}
          />
        </div>
      </div>

      {/* Logo with glow */}
      <div className="relative z-10 mb-8">
        <div className="absolute inset-0 blur-2xl bg-primary/30 rounded-full animate-pulse" />
        <div className="relative w-28 h-28 rounded-2xl overflow-hidden shadow-2xl shadow-primary/30 animate-float">
          <img src={oracleLogo} alt="Oracle OS" className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Title */}
      <h1 className="relative z-10 text-3xl font-bold mb-2 bg-gradient-to-r from-primary via-oracle-purple to-primary bg-clip-text text-transparent animate-shimmer bg-[length:200%_100%]">
        Oracle OS
      </h1>
      <p className="relative z-10 text-sm text-muted-foreground mb-8">
        Trading Intelligence Platform
      </p>

      {/* Progress bar */}
      <div className="relative z-10 w-64">
        <div className="h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-oracle rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground animate-pulse">
            {phases[phase]}
          </span>
          <span className="font-mono text-xs text-primary">
            {Math.round(progress)}%
          </span>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-primary/30 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
};
