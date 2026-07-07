-- Allow users to delete their own role rows so role switching works.
CREATE POLICY "Users delete own role" ON public.user_roles
FOR DELETE TO authenticated
USING (auth.uid() = user_id);