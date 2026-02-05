import React, { useRef } from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  Shield, Bot, Zap, Bell, Monitor, 
  AlertTriangle, Cpu, Sun, Moon, Laptop, Wifi
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, demoMode, setDemoMode, isLive, setIsLive } = useOracle();
  const containerRef = useRef<HTMLDivElement>(null);

  const handleSettingChange = <T,>(key: string, value: T) => {
    // Prevent scroll reset by using requestAnimationFrame
    const scrollTop = containerRef.current?.scrollTop || 0;
    updateSettings({ [key]: value } as any);
    requestAnimationFrame(() => {
      if (containerRef.current) {
        containerRef.current.scrollTop = scrollTop;
      }
    });
  };

  const SettingSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = 
    ({ title, icon, children }) => (
    <section className="glass-card p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
        <h2 className="font-medium">{title}</h2>
      </div>
      <div className="space-y-0">{children}</div>
    </section>
  );

  const SettingRow: React.FC<{ 
    label: string; 
    description?: string; 
    children: React.ReactNode 
  }> = ({ label, description, children }) => (
    <div className="setting-item">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground truncate">{description}</p>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const SliderSetting: React.FC<{
    label: string;
    description?: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    settingKey: string;
  }> = ({ label, description, value, min, max, step = 1, unit = '', settingKey }) => (
    <SettingRow label={label} description={description}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => handleSettingChange(settingKey, Number(e.target.value))}
          className="w-20 accent-primary h-1.5 cursor-pointer"
        />
        <span className="font-mono text-xs w-12 text-right tabular-nums">{value}{unit}</span>
      </div>
    </SettingRow>
  );

  return (
    <div ref={containerRef} className="space-y-4 animate-fade-in pb-8 overflow-y-auto">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-xs text-muted-foreground">Configure Oracle OS</p>
      </header>

      {/* Connection Mode */}
      <SettingSection title="Connection" icon={<Wifi className="w-4 h-4 text-primary" />}>
        <SettingRow label="Live Trading" description="Connect to exchange API">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isLive ? 'bg-oracle-green/20 text-oracle-green' : 'bg-oracle-purple/20 text-oracle-purple'}`}>
              {isLive ? 'LIVE' : 'DEMO'}
            </span>
            <Switch checked={isLive} onCheckedChange={setIsLive} />
          </div>
        </SettingRow>
        <SettingRow label="Demo Mode" description="Simulate trading activity">
          <Switch checked={demoMode} onCheckedChange={setDemoMode} />
        </SettingRow>
      </SettingSection>

      {/* Trading Mode */}
      <SettingSection title="Trading Mode" icon={<Bot className="w-4 h-4 text-primary" />}>
        <SettingRow label="Mode" description="Agent operation mode">
          <select
            value={settings.tradingMode}
            onChange={(e) => handleSettingChange('tradingMode', e.target.value)}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer"
          >
            <option value="manual">Manual</option>
            <option value="semi-agentic">Semi-Agentic</option>
            <option value="full-agentic">Full Agentic</option>
          </select>
        </SettingRow>
        <SettingRow label="Default Model" description="New agent model">
          <select
            value={settings.defaultModel}
            onChange={(e) => handleSettingChange('defaultModel', e.target.value)}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer"
          >
            <option value="preview">Preview</option>
            <option value="exp">Experimental</option>
            <option value="rpm">RPM</option>
          </select>
        </SettingRow>
        <SettingRow label="Default Timeframe" description="Chart interval">
          <select
            value={settings.defaultTimeframe}
            onChange={(e) => handleSettingChange('defaultTimeframe', e.target.value)}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer"
          >
            <option value="1m">1 min</option>
            <option value="5m">5 min</option>
            <option value="15m">15 min</option>
            <option value="1h">1 hour</option>
            <option value="4h">4 hour</option>
            <option value="1d">1 day</option>
          </select>
        </SettingRow>
      </SettingSection>

      {/* Risk Management */}
      <SettingSection title="Risk System Layer" icon={<Shield className="w-4 h-4 text-primary" />}>
        <SettingRow label="Risk Preset" description="Pre-configured levels">
          <select
            value={settings.riskPreset}
            onChange={(e) => handleSettingChange('riskPreset', e.target.value)}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium cursor-pointer"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
            <option value="custom">Custom</option>
          </select>
        </SettingRow>
        <SliderSetting
          label="Max Agents"
          description="Concurrent agents"
          value={settings.maxAgents}
          min={1}
          max={12}
          settingKey="maxAgents"
        />
        <SliderSetting
          label="Max % per Agent"
          description="Capital allocation"
          value={settings.maxBalancePerAgent}
          min={5}
          max={50}
          unit="%"
          settingKey="maxBalancePerAgent"
        />
        <SliderSetting
          label="Max Daily Loss"
          description="Stop trading limit"
          value={settings.maxDailyLoss}
          min={5}
          max={30}
          unit="%"
          settingKey="maxDailyLoss"
        />
        <SliderSetting
          label="Max Drawdown"
          description="Portfolio drawdown"
          value={settings.maxDrawdown}
          min={10}
          max={50}
          unit="%"
          settingKey="maxDrawdown"
        />
        <SliderSetting
          label="Stop Loss"
          description="Per-trade stop"
          value={settings.stopLossPercent}
          min={1}
          max={20}
          unit="%"
          settingKey="stopLossPercent"
        />
        <SliderSetting
          label="Take Profit"
          description="Per-trade target"
          value={settings.takeProfitPercent}
          min={2}
          max={50}
          unit="%"
          settingKey="takeProfitPercent"
        />
      </SettingSection>

      {/* Execution */}
      <SettingSection title="Execution" icon={<Zap className="w-4 h-4 text-primary" />}>
        <SliderSetting
          label="Confidence Threshold"
          description="Min confidence to trade"
          value={settings.confidenceThreshold}
          min={50}
          max={95}
          unit="%"
          settingKey="confidenceThreshold"
        />
        <SliderSetting
          label="Volatility Tolerance"
          description="Max volatility"
          value={settings.volatilityTolerance}
          min={20}
          max={100}
          unit="%"
          settingKey="volatilityTolerance"
        />
        <SettingRow label="Auto Execute" description="Trade without confirmation">
          <Switch 
            checked={settings.autoExecute} 
            onCheckedChange={(v) => handleSettingChange('autoExecute', v)} 
          />
        </SettingRow>
        <SettingRow label="Confirm Trades" description="Show confirmation">
          <Switch 
            checked={settings.confirmTrades} 
            onCheckedChange={(v) => handleSettingChange('confirmTrades', v)} 
          />
        </SettingRow>
      </SettingSection>

      {/* Kill Switch */}
      <SettingSection title="Kill Switch" icon={<AlertTriangle className="w-4 h-4 text-oracle-red" />}>
        <SettingRow label="Enable Kill Switch" description="Emergency stop">
          <Switch 
            checked={settings.killSwitchEnabled} 
            onCheckedChange={(v) => handleSettingChange('killSwitchEnabled', v)} 
          />
        </SettingRow>
        <SliderSetting
          label="Trigger Threshold"
          description="Loss % to activate"
          value={settings.killSwitchThreshold}
          min={5}
          max={30}
          unit="%"
          settingKey="killSwitchThreshold"
        />
      </SettingSection>

      {/* Display */}
      <SettingSection title="Display" icon={<Monitor className="w-4 h-4 text-primary" />}>
        <SettingRow label="Theme" description="Light or dark mode">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              type="button"
              onClick={() => handleSettingChange('theme', 'light')}
              className={`p-1.5 rounded transition-colors ${settings.theme === 'light' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSettingChange('theme', 'system')}
              className={`p-1.5 rounded transition-colors ${settings.theme === 'system' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleSettingChange('theme', 'dark')}
              className={`p-1.5 rounded transition-colors ${settings.theme === 'dark' ? 'bg-background shadow-sm' : 'hover:bg-background/50'}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </SettingRow>
        <SliderSetting
          label="Foresight Opacity"
          description="XHR visualization"
          value={settings.foresightOpacity}
          min={10}
          max={80}
          unit="%"
          settingKey="foresightOpacity"
        />
        <SliderSetting
          label="Glow Intensity"
          description="Agent card glow"
          value={settings.glowIntensity}
          min={20}
          max={100}
          unit="%"
          settingKey="glowIntensity"
        />
        <SettingRow label="Compact Mode" description="Denser layout">
          <Switch 
            checked={settings.compactMode} 
            onCheckedChange={(v) => handleSettingChange('compactMode', v)} 
          />
        </SettingRow>
        <SettingRow label="Show P&L in Header" description="Display in header">
          <Switch 
            checked={settings.showPnlInHeader} 
            onCheckedChange={(v) => handleSettingChange('showPnlInHeader', v)} 
          />
        </SettingRow>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications" icon={<Bell className="w-4 h-4 text-primary" />}>
        <SettingRow label="Sound Effects" description="Audio feedback">
          <Switch 
            checked={settings.soundEnabled} 
            onCheckedChange={(v) => handleSettingChange('soundEnabled', v)} 
          />
        </SettingRow>
        <SettingRow label="Push Notifications" description="Browser alerts">
          <Switch 
            checked={settings.pushNotifications} 
            onCheckedChange={(v) => handleSettingChange('pushNotifications', v)} 
          />
        </SettingRow>
        <SettingRow label="Email Alerts" description="Critical alerts">
          <Switch 
            checked={settings.emailAlerts} 
            onCheckedChange={(v) => handleSettingChange('emailAlerts', v)} 
          />
        </SettingRow>
        <SliderSetting
          label="Alert on Profit"
          description="Notify above"
          value={settings.alertOnProfit}
          min={50}
          max={500}
          step={50}
          unit="$"
          settingKey="alertOnProfit"
        />
        <SliderSetting
          label="Alert on Loss"
          description="Notify above"
          value={settings.alertOnLoss}
          min={25}
          max={250}
          step={25}
          unit="$"
          settingKey="alertOnLoss"
        />
      </SettingSection>

      {/* Advanced */}
      <SettingSection title="Advanced" icon={<Cpu className="w-4 h-4 text-primary" />}>
        <SliderSetting
          label="Session Timeout"
          description="Auto-logout"
          value={settings.sessionTimeout}
          min={5}
          max={120}
          step={5}
          unit=" min"
          settingKey="sessionTimeout"
        />
        <SliderSetting
          label="Data Refresh"
          description="Update interval"
          value={settings.dataRefreshRate}
          min={1}
          max={10}
          unit="s"
          settingKey="dataRefreshRate"
        />
        <SliderSetting
          label="API Rate Limit"
          description="Requests/min"
          value={settings.apiRateLimit}
          min={30}
          max={300}
          step={10}
          unit="/min"
          settingKey="apiRateLimit"
        />
        <SettingRow label="Debug Mode" description="Technical overlays">
          <Switch 
            checked={settings.debugMode} 
            onCheckedChange={(v) => handleSettingChange('debugMode', v)} 
          />
        </SettingRow>
      </SettingSection>

      {/* Version */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <p className="font-mono">Oracle OS v2.1.0</p>
        <p className="mt-1">© 2024 Oracle Trading Intelligence</p>
      </div>
    </div>
  );
};
