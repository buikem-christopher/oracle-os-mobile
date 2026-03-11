import React, { useMemo, useState, useEffect } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { Shield, Activity, AlertTriangle, Zap } from 'lucide-react';

export const RSLGauge: React.FC = () => {
  const { agents, settings, portfolio } = useOracle();
  const [animatedScore, setAnimatedScore] = useState(15);
  const [pulseIntensity, setPulseIntensity] = useState(0);

  const riskScore = useMemo(() => {
    const activeAgents = agents.filter(a => a.state === 'active' || a.state === 'executing');
    if (activeAgents.length === 0) return 15;

    const avgDrawdown = activeAgents.reduce((s, a) => s + Math.abs(Math.min(0, a.pnlPercent)), 0) / activeAgents.length;
    const capitalExposure = (1 - portfolio.availableCapital / Math.max(portfolio.totalCapital, 1)) * 100;
    const agentLoad = (activeAgents.length / settings.maxAgents) * 100;
    const volatileCount = activeAgents.filter(a => a.performance === 'volatile' || a.performance === 'loss').length;
    const volatileRatio = (volatileCount / Math.max(activeAgents.length, 1)) * 100;

    const score = (avgDrawdown * 2) + (capitalExposure * 0.3) + (agentLoad * 0.2) + (volatileRatio * 0.3);
    return Math.min(100, Math.max(0, score));
  }, [agents, settings, portfolio]);

  // Smooth animation
  useEffect(() => {
    const diff = riskScore - animatedScore;
    if (Math.abs(diff) < 0.5) { setAnimatedScore(riskScore); return; }
    const timer = setTimeout(() => {
      setAnimatedScore(prev => prev + diff * 0.12);
    }, 16);
    return () => clearTimeout(timer);
  }, [riskScore, animatedScore]);

  // Pulse effect near threshold
  useEffect(() => {
    const threshold = settings.killSwitchThreshold || 80;
    const proximity = Math.max(0, 1 - Math.abs(riskScore - threshold) / 20);
    setPulseIntensity(proximity);
  }, [riskScore, settings.killSwitchThreshold]);

  const riskLevel = animatedScore < 20 ? 'Very Low' : animatedScore < 40 ? 'Low' : animatedScore < 60 ? 'Medium' : animatedScore < 80 ? 'High' : 'Critical';
  
  const getColor = (score: number) => {
    if (score < 20) return { main: 'hsl(var(--oracle-green))', glow: 'hsl(142 71% 45% / 0.3)' };
    if (score < 40) return { main: 'hsl(var(--oracle-green))', glow: 'hsl(142 71% 45% / 0.2)' };
    if (score < 60) return { main: 'hsl(var(--oracle-orange))', glow: 'hsl(38 92% 50% / 0.3)' };
    if (score < 80) return { main: 'hsl(var(--oracle-red))', glow: 'hsl(0 84% 60% / 0.3)' };
    return { main: 'hsl(var(--oracle-red))', glow: 'hsl(0 84% 60% / 0.5)' };
  };

  const colors = getColor(animatedScore);

  // Arc geometry - 180° sweep
  const cx = 120, cy = 105, r = 80, r2 = 68, r3 = 56;
  const arcStart = Math.PI;
  const needleAngle = arcStart - (animatedScore / 100) * Math.PI;

  const arcPath = (startA: number, endA: number, radius: number) => {
    const x1 = cx + radius * Math.cos(startA);
    const y1 = cy + radius * Math.sin(startA);
    const x2 = cx + radius * Math.cos(endA);
    const y2 = cy + radius * Math.sin(endA);
    const large = Math.abs(endA - startA) > Math.PI ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  const progressArc = (radius: number, score: number) => {
    const endAngle = arcStart - (score / 100) * Math.PI;
    const x1 = cx + radius * Math.cos(arcStart);
    const y1 = cy + radius * Math.sin(arcStart);
    const x2 = cx + radius * Math.cos(endAngle);
    const y2 = cy + radius * Math.sin(endAngle);
    const large = score > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${large} 1 ${x2} ${y2}`;
  };

  // Needle tip
  const needleLen = r - 12;
  const nx = cx + needleLen * Math.cos(needleAngle);
  const ny = cy + needleLen * Math.sin(needleAngle);

  // Segment colors for the background arc
  const segments = [
    { from: 0, to: 20, color: 'hsl(142 71% 45%)' },
    { from: 20, to: 40, color: 'hsl(142 71% 45%)' },
    { from: 40, to: 60, color: 'hsl(38 92% 50%)' },
    { from: 60, to: 80, color: 'hsl(0 84% 60%)' },
    { from: 80, to: 100, color: 'hsl(0 84% 60%)' },
  ];

  const exposurePercent = ((1 - portfolio.availableCapital / Math.max(portfolio.totalCapital, 1)) * 100);
  const activeCount = agents.filter(a => a.state === 'active' || a.state === 'executing').length;

  return (
    <div className="glass-card p-4 relative overflow-hidden">
      {/* Ambient glow */}
      <div 
        className="absolute inset-0 rounded-2xl transition-all duration-1000"
        style={{ 
          background: `radial-gradient(ellipse at 50% 80%, ${colors.glow}, transparent 70%)`,
          opacity: 0.4 + pulseIntensity * 0.4,
        }}
      />

      <div className="relative">
        {/* Header */}
        <div className="flex items-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
            <Shield className="w-4 h-4 text-primary" />
          </div>
          <div>
            <span className="text-sm font-bold">Risk System Layer</span>
            <div className="flex items-center gap-1.5">
              <span className="badge-live text-[7px]">RSL</span>
              {pulseIntensity > 0.5 && (
                <span className="text-[8px] text-oracle-red flex items-center gap-0.5 animate-pulse">
                  <AlertTriangle className="w-2.5 h-2.5" /> THRESHOLD
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Multi-layer gauge */}
        <div className="flex items-center justify-center">
          <svg width="240" height="130" viewBox="0 0 240 130">
            <defs>
              <filter id="rslGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <filter id="rslNeedleGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="rslGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="hsl(142 71% 45%)" />
                <stop offset="40%" stopColor="hsl(38 92% 50%)" />
                <stop offset="70%" stopColor="hsl(0 84% 60%)" />
                <stop offset="100%" stopColor="hsl(0 84% 60%)" />
              </linearGradient>
            </defs>

            {/* Outer background arc (faint segments) */}
            {segments.map((seg, i) => {
              const startAngle = arcStart - (seg.from / 100) * Math.PI;
              const endAngle = arcStart - (seg.to / 100) * Math.PI;
              return (
                <path key={i} d={arcPath(startAngle, endAngle, r)}
                  fill="none" stroke={seg.color} strokeWidth="3" strokeLinecap="round" opacity={0.12} />
              );
            })}

            {/* Middle track (muted) */}
            <path d={arcPath(arcStart, 0, r2)}
              fill="none" stroke="hsl(var(--muted))" strokeWidth="6" strokeLinecap="round" opacity={0.4} />

            {/* Inner track (muted) */}
            <path d={arcPath(arcStart, 0, r3)}
              fill="none" stroke="hsl(var(--muted))" strokeWidth="3" strokeLinecap="round" opacity={0.2} />

            {/* Middle progress arc */}
            <path d={progressArc(r2, animatedScore)}
              fill="none" stroke={colors.main} strokeWidth="6" strokeLinecap="round"
              filter="url(#rslGlow)"
              style={{ transition: 'stroke 0.5s' }} />

            {/* Inner progress arc (lagged for depth) */}
            <path d={progressArc(r3, Math.max(0, animatedScore - 5))}
              fill="none" stroke={colors.main} strokeWidth="3" strokeLinecap="round" opacity={0.5}
              style={{ transition: 'stroke 0.5s' }} />

            {/* Outer progress arc (thin leading edge) */}
            <path d={progressArc(r, animatedScore)}
              fill="none" stroke={colors.main} strokeWidth="2" strokeLinecap="round" opacity={0.7}
              style={{ transition: 'stroke 0.5s' }} />

            {/* Tick marks with labels */}
            {[0, 20, 40, 60, 80, 100].map(tick => {
              const angle = arcStart - (tick / 100) * Math.PI;
              const x1 = cx + (r + 4) * Math.cos(angle);
              const y1 = cy + (r + 4) * Math.sin(angle);
              const x2 = cx + (r + 10) * Math.cos(angle);
              const y2 = cy + (r + 10) * Math.sin(angle);
              const lx = cx + (r + 17) * Math.cos(angle);
              const ly = cy + (r + 17) * Math.sin(angle);
              return (
                <g key={tick}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2}
                    stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" opacity={0.35} />
                  <text x={lx} y={ly + 3} textAnchor="middle" fontSize="7"
                    fill="hsl(var(--muted-foreground))" opacity={0.5} fontFamily="var(--font-mono)">
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* Minor ticks */}
            {Array.from({ length: 21 }, (_, i) => i * 5).filter(t => t % 20 !== 0).map(tick => {
              const angle = arcStart - (tick / 100) * Math.PI;
              const x1 = cx + (r + 4) * Math.cos(angle);
              const y1 = cy + (r + 4) * Math.sin(angle);
              const x2 = cx + (r + 7) * Math.cos(angle);
              const y2 = cy + (r + 7) * Math.sin(angle);
              return (
                <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="hsl(var(--muted-foreground))" strokeWidth="0.75" strokeLinecap="round" opacity={0.2} />
              );
            })}

            {/* Needle */}
            <line x1={cx} y1={cy} x2={nx} y2={ny}
              stroke={colors.main} strokeWidth="2" strokeLinecap="round"
              filter="url(#rslNeedleGlow)"
              style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }} />

            {/* Needle hub */}
            <circle cx={cx} cy={cy} r="5" fill={colors.main} opacity={0.8}
              style={{ transition: 'fill 0.5s', filter: `drop-shadow(0 0 6px ${colors.glow})` }} />
            <circle cx={cx} cy={cy} r="2.5" fill="hsl(var(--background))" />

            {/* Needle tip dot */}
            <circle cx={nx} cy={ny} r="3.5" fill={colors.main}
              filter="url(#rslNeedleGlow)"
              style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
              {pulseIntensity > 0.3 && (
                <animate attributeName="r" values="3.5;5;3.5" dur="1.5s" repeatCount="indefinite" />
              )}
            </circle>

            {/* Center value */}
            <text x={cx} y={cy - 18} textAnchor="middle" fontSize="28" fontWeight="800"
              fontFamily="var(--font-mono)" fill={colors.main}
              style={{ transition: 'fill 0.5s' }}>
              {animatedScore.toFixed(0)}
            </text>
            <text x={cx} y={cy - 4} textAnchor="middle" fontSize="9"
              fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)" fontWeight="600" letterSpacing="1">
              {riskLevel.toUpperCase()}
            </text>
          </svg>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-4 gap-2 mt-1">
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <Activity className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Exposure</div>
            <div className="font-mono text-xs font-bold mt-0.5">{exposurePercent.toFixed(0)}%</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <Zap className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Max DD</div>
            <div className="font-mono text-xs font-bold mt-0.5">{settings.maxDrawdown}%</div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <Shield className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Kill</div>
            <div className="font-mono text-xs font-bold mt-0.5" style={{ color: settings.killSwitchEnabled ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))' }}>
              {settings.killSwitchEnabled ? 'ON' : 'OFF'}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-muted/20">
            <Activity className="w-3 h-3 mx-auto mb-1 text-muted-foreground" />
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider">Agents</div>
            <div className="font-mono text-xs font-bold mt-0.5">{activeCount}/{settings.maxAgents}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
