import React, { useMemo } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  Brain, Radio, Shield, Zap, Activity, TrendingUp, TrendingDown, 
  AlertTriangle, CheckCircle2, XCircle, Clock, BarChart2 
} from 'lucide-react';

export const OIIPanel: React.FC = () => {
  const { markets, selectedMarket, foresight, agents, settings, portfolio } = useOracle();
  const market = markets.find(m => m.symbol === selectedMarket);
  const activeAgents = agents.filter(a => a.state !== 'killed' && a.state !== 'expired');

  // Market Context Packet
  const marketContext = useMemo(() => {
    if (!market) return null;
    const volatility = Math.abs(market.change24h) > 3 ? 'high' : Math.abs(market.change24h) > 1 ? 'moderate' : 'low';
    const regime = market.change24h > 1.5 ? 'trending-up' : market.change24h < -1.5 ? 'trending-down' : 'ranging';
    const momentum = market.change24h > 0 ? 'bullish' : market.change24h < 0 ? 'bearish' : 'neutral';
    const spreadEstimate = market.price * 0.0001;
    
    return {
      symbol: market.symbol,
      price: market.price,
      volatility,
      regime,
      momentum,
      volume24h: market.volume,
      spread: spreadEstimate,
      high24h: market.high24h,
      low24h: market.low24h,
      range: ((market.high24h - market.low24h) / market.low24h * 100),
    };
  }, [market]);

  // Oracle Projection Packet
  const projectionPacket = useMemo(() => {
    if (!foresight) return null;
    const signal = foresight.signals[0];
    return {
      bias: foresight.bias,
      confidence: foresight.confidence,
      horizon: foresight.horizon,
      signalType: signal?.type || 'hold',
      signalStrength: signal?.strength || 0,
      projectedCandles: foresight.projectedCandles.length,
      modelVersion: settings.defaultModel,
    };
  }, [foresight, settings.defaultModel]);

  // Execution Eligibility per agent
  const agentEligibility = useMemo(() => {
    return activeAgents.map(agent => {
      const capitalExposure = agent.capitalAllocated / Math.max(portfolio.totalCapital, 1);
      const drawdownOk = Math.abs(agent.pnlPercent) < settings.maxDrawdown;
      const dailyLossOk = Math.abs(agent.pnl) < (portfolio.totalCapital * settings.maxDailyLoss / 100);
      const confidenceOk = agent.confidence >= settings.confidenceThreshold;
      const killSwitchOk = !settings.killSwitchEnabled || Math.abs(agent.pnlPercent) < settings.killSwitchThreshold;
      const eligible = drawdownOk && dailyLossOk && confidenceOk && killSwitchOk;

      return {
        agentId: agent.id,
        agentName: agent.name,
        market: agent.market,
        state: agent.state,
        eligible,
        checks: {
          drawdown: drawdownOk,
          dailyLoss: dailyLossOk,
          confidence: confidenceOk,
          killSwitch: killSwitchOk,
        },
        capitalExposure: (capitalExposure * 100),
        currentPnl: agent.pnlPercent,
      };
    });
  }, [activeAgents, portfolio.totalCapital, settings]);

  const regimeColor = marketContext?.regime === 'trending-up' ? 'text-oracle-green' 
    : marketContext?.regime === 'trending-down' ? 'text-oracle-red' 
    : 'text-oracle-orange';

  const volColor = marketContext?.volatility === 'high' ? 'text-oracle-red' 
    : marketContext?.volatility === 'moderate' ? 'text-oracle-orange' 
    : 'text-oracle-green';

  return (
    <div className="space-y-3">
      {/* OII Header */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-6 h-6 rounded-lg bg-primary/15 flex items-center justify-center">
            <Brain className="w-3.5 h-3.5 text-primary" />
          </div>
          <span className="text-sm font-bold">Oracle Intelligence Interface</span>
          <span className="badge-live text-[8px] ml-auto">OII</span>
        </div>
        <p className="text-[10px] text-muted-foreground">Central routing layer • Market → Oracle → Agents → RSL</p>
      </div>

      {/* Market Context Packet */}
      {marketContext && (
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <BarChart2 className="w-3.5 h-3.5 text-oracle-cyan" />
            <span className="text-xs font-semibold uppercase tracking-wider">Market Context</span>
            <Radio className="w-2 h-2 text-oracle-green animate-pulse ml-auto" />
          </div>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[11px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Symbol</span>
              <span className="font-mono font-semibold">{marketContext.symbol}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-mono font-semibold">${marketContext.price < 10 ? marketContext.price.toFixed(4) : marketContext.price.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Regime</span>
              <span className={`font-mono font-semibold capitalize ${regimeColor}`}>{marketContext.regime.replace('-', ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Volatility</span>
              <span className={`font-mono font-semibold capitalize ${volColor}`}>{marketContext.volatility}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">24h Range</span>
              <span className="font-mono font-semibold">{marketContext.range.toFixed(2)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Spread</span>
              <span className="font-mono font-semibold">${marketContext.spread.toFixed(4)}</span>
            </div>
          </div>

          {/* Mini regime visualization */}
          <div className="mt-2.5 pt-2 border-t border-border/20">
            <div className="flex items-center gap-1.5">
              <span className="text-[9px] text-muted-foreground uppercase">Momentum</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-700 ${
                    marketContext.momentum === 'bullish' ? 'bg-oracle-green' : 
                    marketContext.momentum === 'bearish' ? 'bg-oracle-red' : 'bg-muted-foreground'
                  }`}
                  style={{ 
                    width: `${Math.min(100, 50 + Math.abs(market?.change24h || 0) * 10)}%`,
                    marginLeft: marketContext.momentum === 'bearish' ? 'auto' : '0'
                  }}
                />
              </div>
              <span className={`text-[9px] font-mono font-bold ${
                marketContext.momentum === 'bullish' ? 'text-oracle-green' : 
                marketContext.momentum === 'bearish' ? 'text-oracle-red' : 'text-muted-foreground'
              }`}>
                {marketContext.momentum === 'bullish' ? '▲' : marketContext.momentum === 'bearish' ? '▼' : '—'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Oracle Projection Packet */}
      {projectionPacket && (
        <div className="glass-card p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Zap className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-wider">Oracle Projection</span>
            <span className={`text-[8px] px-1.5 py-0.5 rounded font-bold ml-auto ${
              projectionPacket.bias === 'bullish' ? 'bg-oracle-green/15 text-oracle-green' :
              projectionPacket.bias === 'bearish' ? 'bg-oracle-red/15 text-oracle-red' :
              'bg-muted text-muted-foreground'
            }`}>
              {projectionPacket.bias.toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-2">
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className="text-[9px] text-muted-foreground uppercase">Confidence</div>
              <div className="font-mono text-sm font-bold text-primary">{projectionPacket.confidence}%</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className="text-[9px] text-muted-foreground uppercase">Signal</div>
              <div className={`font-mono text-sm font-bold capitalize ${
                projectionPacket.signalType === 'buy' ? 'text-oracle-green' : 
                projectionPacket.signalType === 'sell' ? 'text-oracle-red' : 'text-muted-foreground'
              }`}>{projectionPacket.signalType}</div>
            </div>
            <div className="text-center p-2 rounded-lg bg-muted/30">
              <div className="text-[9px] text-muted-foreground uppercase">Horizon</div>
              <div className="font-mono text-sm font-bold">{projectionPacket.horizon}</div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-muted-foreground">Strength: <span className="font-mono text-primary">{(projectionPacket.signalStrength * 100).toFixed(0)}%</span></span>
            <span className="text-muted-foreground">Model: <span className={`badge-${projectionPacket.modelVersion} text-[8px]`}>{projectionPacket.modelVersion.toUpperCase()}</span></span>
          </div>
        </div>
      )}

      {/* Execution Eligibility */}
      <div className="glass-card p-3">
        <div className="flex items-center gap-2 mb-2.5">
          <Shield className="w-3.5 h-3.5 text-oracle-gold" />
          <span className="text-xs font-semibold uppercase tracking-wider">Execution Eligibility</span>
          <span className="text-[9px] text-muted-foreground ml-auto">{agentEligibility.length} agents</span>
        </div>

        {agentEligibility.length === 0 ? (
          <div className="text-center py-4">
            <Activity className="w-6 h-6 mx-auto mb-2 text-muted-foreground/30" />
            <p className="text-[11px] text-muted-foreground">No active agents to evaluate</p>
          </div>
        ) : (
          <div className="space-y-2">
            {agentEligibility.map(agent => (
              <div key={agent.agentId} className={`p-2.5 rounded-lg border transition-all ${
                agent.eligible 
                  ? 'bg-oracle-green/5 border-oracle-green/20' 
                  : 'bg-oracle-red/5 border-oracle-red/20'
              }`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {agent.eligible 
                      ? <CheckCircle2 className="w-3 h-3 text-oracle-green" />
                      : <XCircle className="w-3 h-3 text-oracle-red" />
                    }
                    <span className="text-[11px] font-semibold">{agent.agentName}</span>
                    <span className="text-[9px] text-muted-foreground font-mono">{agent.market}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${
                    agent.eligible ? 'bg-oracle-green/15 text-oracle-green' : 'bg-oracle-red/15 text-oracle-red'
                  }`}>
                    {agent.eligible ? 'ELIGIBLE' : 'BLOCKED'}
                  </span>
                </div>

                {/* RSL check indicators */}
                <div className="flex gap-1.5 flex-wrap">
                  {Object.entries(agent.checks).map(([key, ok]) => (
                    <span key={key} className={`text-[8px] px-1.5 py-0.5 rounded font-mono ${
                      ok ? 'bg-oracle-green/10 text-oracle-green' : 'bg-oracle-red/10 text-oracle-red'
                    }`}>
                      {ok ? '✓' : '✗'} {key.replace(/([A-Z])/g, ' $1').trim()}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between mt-1.5 text-[9px] text-muted-foreground">
                  <span>Exposure: <span className="font-mono">{agent.capitalExposure.toFixed(1)}%</span></span>
                  <span>P&L: <span className={`font-mono ${agent.currentPnl >= 0 ? 'text-oracle-green' : 'text-oracle-red'}`}>
                    {agent.currentPnl >= 0 ? '+' : ''}{agent.currentPnl.toFixed(2)}%
                  </span></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
