-- Messages: reply + read receipts
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS reply_to uuid REFERENCES public.messages(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Wallets
CREATE TABLE IF NOT EXISTS public.wallets (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(14,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE ON public.wallets TO authenticated;
GRANT ALL ON public.wallets TO service_role;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallet_owner_select" ON public.wallets;
CREATE POLICY "wallet_owner_select" ON public.wallets FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wallet_owner_insert" ON public.wallets;
CREATE POLICY "wallet_owner_insert" ON public.wallets FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "wallet_owner_update" ON public.wallets;
CREATE POLICY "wallet_owner_update" ON public.wallets FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER wallets_updated_at BEFORE UPDATE ON public.wallets
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Wallet transactions ledger
CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount numeric(14,2) NOT NULL,
  type text NOT NULL CHECK (type IN ('deposit','withdrawal','purchase','refund')),
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending','completed','failed')),
  reference text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.wallet_transactions TO authenticated;
GRANT ALL ON public.wallet_transactions TO service_role;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wtx_owner_select" ON public.wallet_transactions;
CREATE POLICY "wtx_owner_select" ON public.wallet_transactions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "wtx_owner_insert" ON public.wallet_transactions;
CREATE POLICY "wtx_owner_insert" ON public.wallet_transactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS wtx_user_created_idx ON public.wallet_transactions (user_id, created_at DESC);
