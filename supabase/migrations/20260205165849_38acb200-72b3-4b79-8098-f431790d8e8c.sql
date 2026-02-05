-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  tier TEXT NOT NULL DEFAULT 'free' CHECK (tier IN ('free', 'student', 'pro', 'enterprise')),
  subscription_plan TEXT DEFAULT 'none' CHECK (subscription_plan IN ('none', 'preview_exp', 'rpm_share', 'rpm_lifetime')),
  student_verified BOOLEAN DEFAULT FALSE,
  student_verification_status TEXT DEFAULT 'none' CHECK (student_verification_status IN ('none', 'pending', 'approved', 'rejected')),
  waec_number TEXT,
  institution TEXT,
  country TEXT,
  total_trades INTEGER DEFAULT 0,
  win_rate NUMERIC(5,2) DEFAULT 0,
  best_trade NUMERIC(12,2) DEFAULT 0,
  worst_trade NUMERIC(12,2) DEFAULT 0,
  total_capital NUMERIC(14,2) DEFAULT 1000,
  available_capital NUMERIC(14,2) DEFAULT 1000,
  total_pnl NUMERIC(14,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create user settings table
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  trading_mode TEXT DEFAULT 'semi-agentic',
  default_model TEXT DEFAULT 'preview',
  max_agents INTEGER DEFAULT 6,
  max_balance_per_agent NUMERIC(5,2) DEFAULT 15,
  max_daily_loss NUMERIC(5,2) DEFAULT 10,
  max_drawdown NUMERIC(5,2) DEFAULT 20,
  risk_preset TEXT DEFAULT 'moderate',
  confidence_threshold NUMERIC(5,2) DEFAULT 70,
  volatility_tolerance NUMERIC(5,2) DEFAULT 50,
  stop_loss_percent NUMERIC(5,2) DEFAULT 5,
  take_profit_percent NUMERIC(5,2) DEFAULT 10,
  auto_execute BOOLEAN DEFAULT FALSE,
  confirm_trades BOOLEAN DEFAULT TRUE,
  kill_switch_enabled BOOLEAN DEFAULT TRUE,
  kill_switch_threshold NUMERIC(5,2) DEFAULT 15,
  theme TEXT DEFAULT 'dark',
  glow_intensity INTEGER DEFAULT 60,
  foresight_opacity INTEGER DEFAULT 45,
  compact_mode BOOLEAN DEFAULT FALSE,
  show_pnl_in_header BOOLEAN DEFAULT TRUE,
  sound_enabled BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  email_alerts BOOLEAN DEFAULT FALSE,
  alert_on_profit NUMERIC(10,2) DEFAULT 100,
  alert_on_loss NUMERIC(10,2) DEFAULT 50,
  default_timeframe TEXT DEFAULT '15m',
  session_timeout INTEGER DEFAULT 30,
  debug_mode BOOLEAN DEFAULT FALSE,
  api_rate_limit INTEGER DEFAULT 100,
  data_refresh_rate INTEGER DEFAULT 2,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for settings
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own settings" 
ON public.user_settings FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" 
ON public.user_settings FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" 
ON public.user_settings FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create trade history table
CREATE TABLE public.trade_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agent_id TEXT,
  agent_name TEXT,
  market TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('buy', 'sell')),
  amount NUMERIC(14,2) NOT NULL,
  price NUMERIC(18,8) NOT NULL,
  pnl NUMERIC(14,2),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS for trade history
ALTER TABLE public.trade_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own trades" 
ON public.trade_history FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trades" 
ON public.trade_history FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create watchlist table
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  symbol TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, symbol)
);

-- Enable RLS for watchlist
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own watchlist" 
ON public.watchlist FOR ALL 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for timestamp updates
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
BEFORE UPDATE ON public.user_settings
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'Trader'), NEW.email);
  
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();