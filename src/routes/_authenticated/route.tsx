import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) throw redirect({ to: "/auth" });
      return { user: data.user };
    } catch (e) {
      // Any auth failure (expired token, network, etc.) → send to sign-in instead of blowing up the route.
      if (e && typeof e === "object" && "to" in e) throw e;
      throw redirect({ to: "/auth" });
    }
  },
  component: () => <Outlet />,
});
