import React, { useMemo } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { Shield } from 'lucide-react';

export const RSLGauge: React.FC = () => {
  const { agents, settings, portfolio } = useOracle();

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

  const riskLevel = riskScore < 20 ? 'Very Low' : riskScore < 40 ? 'Low' : riskScore < 60 ? 'Medium' : riskScore < 80 ? 'High' : 'Very High';
  const riskColor = riskScore < 20 ? 'hsl(var(--oracle-green))' : riskScore < 40 ? 'hsl(var(--oracle-green))' : riskScore < 60 ? 'hsl(var(--oracle-orange))' : riskScore < 80 ? 'hsl(var(--oracle-red))' : 'hsl(var(--oracle-red))';

  // Arc parameters for 90° gauge
  const cx = 100, cy = 100, r = 70;
  const arcStart = Math.PI;
  const arcEnd = 0;
  const needleAngle = arcStart - (riskScore / 100) * Math.PI;

  const arcPath = (startA: number, endA: number, radius: number) => {
    const x1 = cx + radius * Math.cos(startA);
    const y1 = cy + radius * Math.sin(startA);
    const x2 = cx + radius * Math.cos(endA);
    const y2 = cy + radius * Math.sin(endA);
    return `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`;
  };

  // Progress arc from start to current position
  const progressAngle = arcStart - (riskScore / 100) * Math.PI;
  const progressPath = (radius: number) => {
    const x1 = cx + radius * Math.cos(arcStart);
    const y1 = cy + radius * Math.sin(arcStart);
    const x2 = cx + radius * Math.cos(progressAngle);
    const y2 = cy + radius * Math.sin(progressAngle);
    const largeArc = riskScore > 50 ? 1 : 0;
    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  const needleX = cx + (r - 10) * Math.cos(needleAngle);
  const needleY = cy + (r - 10) * Math.sin(needleAngle);

  return (
    <div className="glass-card p-4">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold">Risk System Layer</span>
        <span className="badge-live text-[9px]">RSL</span>
      </div>
      
      <div className="flex items-center justify-center">
        <svg width="200" height="115" viewBox="0 0 200 115">
          {/* Background arc */}
          <path d={arcPath(arcStart, arcEnd, r)} fill="none" stroke="hsl(var(--muted))" strokeWidth="8" strokeLinecap="round" />
          
          {/* Progress arc */}
          <path 
            d={progressPath(r)} 
            fill="none" 
            stroke={riskColor} 
            strokeWidth="8" 
            strokeLinecap="round"
            style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)' }}
          />
          
          {/* Tick marks */}
          {[0, 25, 50, 75, 100].map(tick => {
            const angle = arcStart - (tick / 100) * Math.PI;
            const x1 = cx + (r + 6) * Math.cos(angle);
            const y1 = cy + (r + 6) * Math.sin(angle);
            const x2 = cx + (r + 12) * Math.cos(angle);
            const y2 = cy + (r + 12) * Math.sin(angle);
            return <line key={tick} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(var(--muted-foreground))" strokeWidth="1.5" strokeLinecap="round" opacity={0.4} />;
          })}

          {/* Needle dot */}
          <circle cx={needleX} cy={needleY} r="4" fill={riskColor} style={{ transition: 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)', filter: `drop-shadow(0 0 6px ${riskColor})` }} />
          
          {/* Center value */}
          <text x={cx} y={cy - 8} textAnchor="middle" fontSize="22" fontWeight="700" fontFamily="var(--font-mono)" fill={riskColor} style={{ transition: 'fill 0.5s' }}>
            {riskScore.toFixed(0)}
          </text>
          <text x={cx} y={cy + 10} textAnchor="middle" fontSize="10" fill="hsl(var(--muted-foreground))" fontFamily="var(--font-sans)">
            {riskLevel}
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-2 text-center">
        <div className="text-[10px]">
          <div className="text-muted-foreground uppercase tracking-wider">Exposure</div>
          <div className="font-mono text-xs font-semibold mt-0.5">
            {((1 - portfolio.availableCapital / Math.max(portfolio.totalCapital, 1)) * 100).toFixed(0)}%
          </div>
        </div>
        <div className="text-[10px]">
          <div className="text-muted-foreground uppercase tracking-wider">Max DD</div>
          <div className="font-mono text-xs font-semibold mt-0.5">{settings.maxDrawdown}%</div>
        </div>
        <div className="text-[10px]">
          <div className="text-muted-foreground uppercase tracking-wider">Kill Switch</div>
          <div className="font-mono text-xs font-semibold mt-0.5" style={{ color: settings.killSwitchEnabled ? 'hsl(var(--oracle-green))' : 'hsl(var(--oracle-red))' }}>
            {settings.killSwitchEnabled ? 'ON' : 'OFF'}
          </div>
        </div>
      </div>
    </div>
  );
};
