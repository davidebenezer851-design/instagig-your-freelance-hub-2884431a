ALTER TABLE public.messages REPLICA IDENTITY FULL;
ALTER TABLE public.conversations REPLICA IDENTITY FULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND schemaname = 'public'
      AND tablename = 'conversations'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
  END IF;
END $$;

ALTER TABLE public.conversations
  ADD COLUMN IF NOT EXISTS hidden_by_a_at timestamp with time zone,
  ADD COLUMN IF NOT EXISTS hidden_by_b_at timestamp with time zone;

DROP POLICY IF EXISTS "Senders delete own messages" ON public.messages;
CREATE POLICY "Senders delete own messages"
ON public.messages
FOR DELETE
TO authenticated
USING (sender_id = auth.uid());

DROP TRIGGER IF EXISTS trg_message_notify ON public.messages;
CREATE TRIGGER trg_message_notify
AFTER INSERT ON public.messages
FOR EACH ROW EXECUTE FUNCTION public.tg_message_notify();