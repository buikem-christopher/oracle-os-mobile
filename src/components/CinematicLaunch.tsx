import React, { useState, useEffect } from 'react';
import { Rocket, Bot, Shield, Activity, Eye } from 'lucide-react';

interface CinematicLaunchProps {
  isLaunching: boolean;
  progress: number;
  maxAgents: number;
}

const AGENT_NAMES = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Epsilon', 'Zeta'];

export const CinematicLaunch: React.FC<CinematicLaunchProps> = ({ 
  isLaunching, progress, maxAgents 
}) => {
  const [spawnedCount, setSpawnedCount] = useState(0);
  const [phase, setPhase] = useState<'init' | 'deploy' | 'scan' | 'converge' | 'ready'>('init');

  useEffect(() => {
    if (!isLaunching) {
      setSpawnedCount(0);
      setPhase('init');
      return;
    }
    if (progress < 20) setPhase('init');
    else if (progress < 50) setPhase('deploy');
    else if (progress < 75) setPhase('scan');
    else if (progress < 95) setPhase('converge');
    else setPhase('ready');

    const agentCount = Math.min(Math.floor(progress / (100 / maxAgents)), maxAgents);
    setSpawnedCount(agentCount);
  }, [isLaunching, progress, maxAgents]);

  if (!isLaunching) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center animate-fade-in">
      {/* Dark backdrop */}
      <div className="absolute inset-0 bg-background/98 backdrop-blur-md" />

      {/* Particle field - CSS only */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-0.5 h-0.5 rounded-full bg-primary/30 animate-float"
            style={{ 
              left: `${Math.random() * 100}%`, 
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.4}s`,
              animationDuration: `${3 + Math.random() * 3}s`,
            }}
          />
        ))}
      </div>

      {/* Light streaks */}
      {phase !== 'init' && (
        <div className="absolute inset-0 overflow-hidden">
          {[0, 1, 2].map(i => (
            <div
              key={`streak-${i}`}
              className="absolute h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent animate-shimmer"
              style={{ width: '60%', top: `${30 + i * 15}%`, left: '20%', animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="relative z-10 text-center max-w-sm w-full px-6">
        {/* Central icon with rings */}
        <div className="relative w-32 h-32 mx-auto mb-8">
          {/* Outer pulse rings */}
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="absolute inset-0 rounded-full border border-primary/20"
              style={{
                animation: 'ping 2.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                animationDelay: `${i * 0.5}s`,
              }}
            />
          ))}

          {/* Rotating ring */}
          <div className="absolute inset-4 rounded-full border border-dashed border-primary/30 animate-spin-slow" />

          {/* Progress ring */}
          <svg className="absolute inset-0 w-full h-full -rotate-90">
            <circle cx="64" cy="64" r="56" fill="none" stroke="hsl(var(--muted))" strokeWidth="2" />
            <circle
              cx="64" cy="64" r="56" fill="none"
              stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 56}
              strokeDashoffset={2 * Math.PI * 56 * (1 - progress / 100)}
              className="transition-all duration-100"
            />
          </svg>

          {/* Center */}
          <div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-oracle-purple/20 flex items-center justify-center animate-pulse-subtle">
            <Rocket className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* Phase text */}
        <h2 className="text-xl font-bold mb-2">
          <span className="text-gradient-oracle">
            {phase === 'init' && 'Initializing Systems'}
            {phase === 'deploy' && 'Deploying Agents'}
            {phase === 'scan' && 'Scanning Markets'}
            {phase === 'converge' && 'Converging Intelligence'}
            {phase === 'ready' && 'Systems Online'}
          </span>
        </h2>

        <p className="text-sm text-muted-foreground mb-6">
          {phase === 'deploy' && `${spawnedCount}/${maxAgents} agents deployed`}
          {phase === 'scan' && 'Oracle foresight initializing...'}
          {phase === 'converge' && 'Optimal markets identified'}
          {phase === 'ready' && 'Full Agentic Mode Active'}
          {phase === 'init' && 'Preparing launch sequence...'}
        </p>

        {/* Agent spawn indicators */}
        {phase !== 'init' && (
          <div className="flex justify-center gap-2 mb-6">
            {AGENT_NAMES.slice(0, maxAgents).map((name, i) => (
              <div
                key={name}
                className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-all duration-300 ${
                  i < spawnedCount 
                    ? 'bg-primary/10 border border-primary/20 opacity-100 scale-100' 
                    : 'bg-muted/30 border border-border/30 opacity-30 scale-90'
                }`}
                style={{ transitionDelay: `${i * 150}ms` }}
              >
                <Bot className={`w-3.5 h-3.5 ${i < spawnedCount ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className="text-[9px] font-mono">{name[0]}</span>
              </div>
            ))}
          </div>
        )}

        {/* Progress bar */}
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{ 
              width: `${progress}%`,
              background: 'linear-gradient(90deg, hsl(var(--primary)), hsl(var(--oracle-purple)))'
            }}
          />
        </div>
        <p className="text-xs text-muted-foreground mt-2 font-mono">{progress}%</p>

        {/* Status line */}
        <div className="flex items-center justify-center gap-4 mt-4 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Shield className="w-3 h-3 text-oracle-green" /> RSL Active
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3 text-primary" /> XHR Ready
          </span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3 text-oracle-cyan" /> Live
          </span>
        </div>
      </div>
    </div>
  );
};
