ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text NOT NULL DEFAULT 'starter';
ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('starter','pro','business'));