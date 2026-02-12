
-- Investor Contracts Table
CREATE TABLE public.investor_contracts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  investor_name TEXT NOT NULL,
  investor_email TEXT,
  contract_type TEXT NOT NULL DEFAULT 'profit-sharing',
  amount NUMERIC NOT NULL DEFAULT 0,
  profit_share NUMERIC NOT NULL DEFAULT 20,
  capital_limit NUMERIC,
  risk_constraint_max_drawdown NUMERIC DEFAULT 20,
  risk_constraint_max_daily_loss NUMERIC DEFAULT 10,
  duration_days INTEGER DEFAULT 90,
  status TEXT NOT NULL DEFAULT 'created',
  performance_pnl NUMERIC DEFAULT 0,
  performance_trades INTEGER DEFAULT 0,
  activated_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.investor_contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own contracts"
ON public.investor_contracts FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own contracts"
ON public.investor_contracts FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contracts"
ON public.investor_contracts FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contracts"
ON public.investor_contracts FOR DELETE
USING (auth.uid() = user_id);

CREATE TRIGGER update_investor_contracts_updated_at
BEFORE UPDATE ON public.investor_contracts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
