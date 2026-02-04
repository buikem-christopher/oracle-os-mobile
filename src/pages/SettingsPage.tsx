import React from 'react';
import { useOracle } from '@/contexts/OracleContext';
import { 
  Shield, Sliders, Eye, Bot, Zap, Bell, Monitor, 
  Activity, Clock, AlertTriangle, Target, Gauge, 
  Volume2, Mail, Database, Cpu, Sun, Moon, Laptop
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';

export const SettingsPage: React.FC = () => {
  const { settings, updateSettings, demoMode, setDemoMode, isLive, setIsLive } = useOracle();

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
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
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
    onChange: (value: number) => void;
  }> = ({ label, description, value, min, max, step = 1, unit = '', onChange }) => (
    <SettingRow label={label} description={description}>
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 accent-primary h-1.5"
        />
        <span className="font-mono text-sm w-12 text-right">{value}{unit}</span>
      </div>
    </SettingRow>
  );

  return (
    <div className="space-y-4 animate-fade-in pb-8">
      <header className="pt-2">
        <h1 className="text-xl font-bold">Settings</h1>
        <p className="text-xs text-muted-foreground">Configure Oracle OS</p>
      </header>

      {/* Connection Mode */}
      <SettingSection title="Connection" icon={<Database className="w-4 h-4 text-primary" />}>
        <SettingRow label="Live Trading" description="Connect to real exchange API">
          <div className="flex items-center gap-2">
            <span className={`text-xs ${isLive ? 'badge-live' : 'badge-demo'}`}>
              {isLive ? 'LIVE' : 'DEMO'}
            </span>
            <Switch checked={isLive} onCheckedChange={setIsLive} />
          </div>
        </SettingRow>
        <SettingRow label="Demo Mode" description="Simulate all trading activity">
          <Switch checked={demoMode} onCheckedChange={setDemoMode} />
        </SettingRow>
      </SettingSection>

      {/* Trading Mode */}
      <SettingSection title="Trading Mode" icon={<Bot className="w-4 h-4 text-primary" />}>
        <SettingRow label="Mode" description="How agents operate">
          <select
            value={settings.tradingMode}
            onChange={(e) => updateSettings({ tradingMode: e.target.value as any })}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium"
          >
            <option value="manual">Manual</option>
            <option value="semi-agentic">Semi-Agentic</option>
            <option value="full-agentic">Full Agentic</option>
          </select>
        </SettingRow>
        <SettingRow label="Default Model" description="Oracle model for new agents">
          <select
            value={settings.defaultModel}
            onChange={(e) => updateSettings({ defaultModel: e.target.value as any })}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium"
          >
            <option value="preview">Preview</option>
            <option value="exp">Experimental</option>
            <option value="rpm">RPM</option>
          </select>
        </SettingRow>
        <SettingRow label="Default Timeframe" description="Chart interval for analysis">
          <select
            value={settings.defaultTimeframe}
            onChange={(e) => updateSettings({ defaultTimeframe: e.target.value as any })}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium"
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
        <SettingRow label="Risk Preset" description="Pre-configured risk levels">
          <select
            value={settings.riskPreset}
            onChange={(e) => updateSettings({ riskPreset: e.target.value as any })}
            className="bg-muted border-none rounded-lg px-3 py-1.5 text-sm font-medium"
          >
            <option value="conservative">Conservative</option>
            <option value="moderate">Moderate</option>
            <option value="aggressive">Aggressive</option>
            <option value="custom">Custom</option>
          </select>
        </SettingRow>
        <SliderSetting
          label="Max Agents"
          description="Maximum concurrent agents"
          value={settings.maxAgents}
          min={1}
          max={12}
          onChange={(v) => updateSettings({ maxAgents: v })}
        />
        <SliderSetting
          label="Max % per Agent"
          description="Capital allocation limit"
          value={settings.maxBalancePerAgent}
          min={5}
          max={50}
          unit="%"
          onChange={(v) => updateSettings({ maxBalancePerAgent: v })}
        />
        <SliderSetting
          label="Max Daily Loss"
          description="Stop trading after this loss"
          value={settings.maxDailyLoss}
          min={5}
          max={30}
          unit="%"
          onChange={(v) => updateSettings({ maxDailyLoss: v })}
        />
        <SliderSetting
          label="Max Drawdown"
          description="Maximum portfolio drawdown"
          value={settings.maxDrawdown}
          min={10}
          max={50}
          unit="%"
          onChange={(v) => updateSettings({ maxDrawdown: v })}
        />
        <SliderSetting
          label="Stop Loss"
          description="Per-trade stop loss"
          value={settings.stopLossPercent}
          min={1}
          max={20}
          unit="%"
          onChange={(v) => updateSettings({ stopLossPercent: v })}
        />
        <SliderSetting
          label="Take Profit"
          description="Per-trade take profit"
          value={settings.takeProfitPercent}
          min={2}
          max={50}
          unit="%"
          onChange={(v) => updateSettings({ takeProfitPercent: v })}
        />
      </SettingSection>

      {/* Execution */}
      <SettingSection title="Execution" icon={<Zap className="w-4 h-4 text-primary" />}>
        <SliderSetting
          label="Confidence Threshold"
          description="Minimum confidence to trade"
          value={settings.confidenceThreshold}
          min={50}
          max={95}
          unit="%"
          onChange={(v) => updateSettings({ confidenceThreshold: v })}
        />
        <SliderSetting
          label="Volatility Tolerance"
          description="Max market volatility"
          value={settings.volatilityTolerance}
          min={20}
          max={100}
          unit="%"
          onChange={(v) => updateSettings({ volatilityTolerance: v })}
        />
        <SettingRow label="Auto Execute" description="Execute trades without confirmation">
          <Switch 
            checked={settings.autoExecute} 
            onCheckedChange={(v) => updateSettings({ autoExecute: v })} 
          />
        </SettingRow>
        <SettingRow label="Confirm Trades" description="Show confirmation dialog">
          <Switch 
            checked={settings.confirmTrades} 
            onCheckedChange={(v) => updateSettings({ confirmTrades: v })} 
          />
        </SettingRow>
      </SettingSection>

      {/* Kill Switch */}
      <SettingSection title="Kill Switch" icon={<AlertTriangle className="w-4 h-4 text-oracle-red" />}>
        <SettingRow label="Enable Kill Switch" description="Emergency stop all trading">
          <Switch 
            checked={settings.killSwitchEnabled} 
            onCheckedChange={(v) => updateSettings({ killSwitchEnabled: v })} 
          />
        </SettingRow>
        <SliderSetting
          label="Trigger Threshold"
          description="Loss % to activate"
          value={settings.killSwitchThreshold}
          min={5}
          max={30}
          unit="%"
          onChange={(v) => updateSettings({ killSwitchThreshold: v })}
        />
      </SettingSection>

      {/* Display */}
      <SettingSection title="Display" icon={<Monitor className="w-4 h-4 text-primary" />}>
        <SettingRow label="Theme" description="Light or dark mode">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`p-1.5 rounded ${settings.theme === 'light' ? 'bg-background shadow-sm' : ''}`}
            >
              <Sun className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'system' })}
              className={`p-1.5 rounded ${settings.theme === 'system' ? 'bg-background shadow-sm' : ''}`}
            >
              <Laptop className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`p-1.5 rounded ${settings.theme === 'dark' ? 'bg-background shadow-sm' : ''}`}
            >
              <Moon className="w-4 h-4" />
            </button>
          </div>
        </SettingRow>
        <SliderSetting
          label="Foresight Opacity"
          description="XHR dream visualization"
          value={settings.foresightOpacity}
          min={10}
          max={80}
          unit="%"
          onChange={(v) => updateSettings({ foresightOpacity: v })}
        />
        <SliderSetting
          label="Glow Intensity"
          description="Agent card glow effects"
          value={settings.glowIntensity}
          min={20}
          max={100}
          unit="%"
          onChange={(v) => updateSettings({ glowIntensity: v })}
        />
        <SettingRow label="Compact Mode" description="Denser UI layout">
          <Switch 
            checked={settings.compactMode} 
            onCheckedChange={(v) => updateSettings({ compactMode: v })} 
          />
        </SettingRow>
        <SettingRow label="Show P&L in Header" description="Display P&L at top">
          <Switch 
            checked={settings.showPnlInHeader} 
            onCheckedChange={(v) => updateSettings({ showPnlInHeader: v })} 
          />
        </SettingRow>
      </SettingSection>

      {/* Notifications */}
      <SettingSection title="Notifications" icon={<Bell className="w-4 h-4 text-primary" />}>
        <SettingRow label="Sound Effects" description="Audio feedback">
          <Switch 
            checked={settings.soundEnabled} 
            onCheckedChange={(v) => updateSettings({ soundEnabled: v })} 
          />
        </SettingRow>
        <SettingRow label="Push Notifications" description="Browser notifications">
          <Switch 
            checked={settings.pushNotifications} 
            onCheckedChange={(v) => updateSettings({ pushNotifications: v })} 
          />
        </SettingRow>
        <SettingRow label="Email Alerts" description="Critical alerts via email">
          <Switch 
            checked={settings.emailAlerts} 
            onCheckedChange={(v) => updateSettings({ emailAlerts: v })} 
          />
        </SettingRow>
        <SliderSetting
          label="Alert on Profit"
          description="Notify when profit exceeds"
          value={settings.alertOnProfit}
          min={50}
          max={500}
          step={50}
          unit="$"
          onChange={(v) => updateSettings({ alertOnProfit: v })}
        />
        <SliderSetting
          label="Alert on Loss"
          description="Notify when loss exceeds"
          value={settings.alertOnLoss}
          min={25}
          max={250}
          step={25}
          unit="$"
          onChange={(v) => updateSettings({ alertOnLoss: v })}
        />
      </SettingSection>

      {/* Advanced */}
      <SettingSection title="Advanced" icon={<Cpu className="w-4 h-4 text-primary" />}>
        <SliderSetting
          label="Session Timeout"
          description="Auto-logout after inactivity"
          value={settings.sessionTimeout}
          min={5}
          max={120}
          step={5}
          unit=" min"
          onChange={(v) => updateSettings({ sessionTimeout: v })}
        />
        <SliderSetting
          label="Data Refresh Rate"
          description="Market data update interval"
          value={settings.dataRefreshRate}
          min={1}
          max={10}
          unit="s"
          onChange={(v) => updateSettings({ dataRefreshRate: v })}
        />
        <SliderSetting
          label="API Rate Limit"
          description="Requests per minute"
          value={settings.apiRateLimit}
          min={30}
          max={300}
          step={10}
          unit="/min"
          onChange={(v) => updateSettings({ apiRateLimit: v })}
        />
        <SettingRow label="Debug Mode" description="Show technical overlays">
          <Switch 
            checked={settings.debugMode} 
            onCheckedChange={(v) => updateSettings({ debugMode: v })} 
          />
        </SettingRow>
      </SettingSection>

      {/* Version */}
      <div className="text-center text-xs text-muted-foreground py-4">
        <p>Oracle OS v2.0.0</p>
        <p className="mt-1">© 2024 Oracle Trading Intelligence</p>
      </div>
    </div>
  );
};
