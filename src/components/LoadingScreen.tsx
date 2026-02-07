import React, { useEffect, useState } from 'react';
import oracleLogo from '@/assets/oracle-logo-new.jpg';

interface LoadingScreenProps {
  onComplete: () => void;
  duration?: number;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  onComplete, 
  duration = 2500 
}) => {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState(0);
  
  const phases = [
    'Initializing Oracle Core...',
    'Loading Market Intelligence...',
    'Connecting Neural Networks...',
    'Calibrating Risk Systems...',
    'Oracle OS Ready'
  ];

  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressInterval);
          return 100;
        }
        return prev + 1.2;
      });
    }, duration / 100);

    const phaseInterval = setInterval(() => {
      setPhase(prev => Math.min(prev + 1, phases.length - 1));
    }, duration / phases.length);

    const timeout = setTimeout(() => {
      onComplete();
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearInterval(phaseInterval);
      clearTimeout(timeout);
    };
  }, [duration, onComplete, phases.length]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background">
      {/* Premium background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-oracle-purple/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
      </div>
      
      <div className="relative text-center">
        {/* Orbital rings animation */}
        <div className="relative w-40 h-40 mx-auto mb-8">
          {/* Outer ring */}
          <div 
            className="absolute inset-0 rounded-full border border-primary/20"
            style={{ animation: 'spin 12s linear infinite' }}
          />
          
          {/* Middle ring */}
          <div 
            className="absolute inset-4 rounded-full border border-primary/30"
            style={{ animation: 'spin 10s linear infinite reverse' }}
          />
          
          {/* Inner ring with glow */}
          <div 
            className="absolute inset-8 rounded-full border-2 border-primary/50"
            style={{ animation: 'spin 6s linear infinite' }}
          />

          {/* Orbiting dots */}
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-1/2 left-1/2 w-2 h-2 -mt-1 -ml-1"
              style={{ 
                animation: `orbit ${6 + i * 2}s linear infinite`,
                animationDelay: `${i * 0.5}s`
              }}
            >
              <div className="w-2 h-2 rounded-full bg-primary shadow-lg shadow-primary/50" />
            </div>
          ))}
          
          {/* Logo container */}
          <div className="absolute inset-12 rounded-full overflow-hidden bg-gradient-to-br from-primary/20 to-oracle-purple/20 p-[2px]">
            <div className="w-full h-full rounded-full overflow-hidden bg-background flex items-center justify-center">
              <img 
                src={oracleLogo} 
                alt="Oracle OS" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Oracle Text with gradient */}
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-gradient-oracle">Oracle OS</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-8">v1.1.0</p>

        {/* Progress bar */}
        <div className="w-64 mx-auto mb-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{ 
                width: `${Math.min(progress, 100)}%`,
                background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--oracle-purple)))'
              }}
            />
          </div>
        </div>

        {/* Phase text */}
        <p className="text-xs text-muted-foreground font-mono animate-pulse">
          {phases[phase]}
        </p>

        {/* Progress percentage */}
        <p className="text-xs text-primary font-mono mt-2">
          {Math.round(Math.min(progress, 100))}%
        </p>
      </div>

      {/* Add keyframes for orbit animation */}
      <style>{`
        @keyframes orbit {
          from {
            transform: rotate(0deg) translateX(60px) rotate(0deg);
          }
          to {
            transform: rotate(360deg) translateX(60px) rotate(-360deg);
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};
