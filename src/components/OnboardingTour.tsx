import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronRight, ChevronLeft, Sparkles, Wallet, MessageCircle, Briefcase, Plus } from "lucide-react";

const STEPS = [
  { icon: Sparkles,    title: "Welcome to InstaGIG 🍋", body: "The neon-fast freelance marketplace. Quick 30-second tour?" },
  { icon: Briefcase,   title: "Browse Gigs & Jobs",       body: "Use the top nav to find services or post your own. Like and save anything to revisit later." },
  { icon: MessageCircle, title: "Chat in real time",      body: "Tap a gig or job, then message the poster. Swipe right on any message to reply — just like WhatsApp." },
  { icon: Wallet,      title: "Your Wallet",              body: "Top up credits, pay for boosts, and track every transaction. The chip in your navbar shows live balance." },
  { icon: Plus,        title: "Post your first listing",  body: "Open your profile menu → Post a Gig or Post a Job to get going." },
];

export function OnboardingTour() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);

  useEffect(() => {
    if (loading || !user) return;
    const key = `instagig:tour:${user.id}`;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(key)) return;
    const t = setTimeout(() => setOpen(true), 800);
    return () => clearTimeout(t);
  }, [user, loading]);

  function finish() {
    if (user) localStorage.setItem(`instagig:tour:${user.id}`, "1");
    setOpen(false);
  }

  const step = STEPS[i];
  const Icon = step.icon;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) finish(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <div className="grain-bg relative bg-gradient-to-br from-card to-primary/10 p-6">
          <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-foreground shadow-[var(--shadow-glow)]">
            <Icon className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold">{step.title}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>

          <div className="mt-6 flex items-center gap-1.5">
            {STEPS.map((_, idx) => (
              <span key={idx} className={`h-1.5 rounded-full transition-all ${idx === i ? "w-6 bg-primary" : "w-1.5 bg-border"}`} />
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-border bg-card p-3">
          <button type="button" onClick={finish} className="text-xs text-muted-foreground hover:text-foreground">Skip tour</button>
          <div className="flex gap-2">
            {i > 0 && <Button size="sm" variant="ghost" onClick={() => setI(i - 1)}><ChevronLeft className="h-4 w-4" /> Back</Button>}
            {i < STEPS.length - 1 ? (
              <Button size="sm" onClick={() => setI(i + 1)}>Next <ChevronRight className="h-4 w-4" /></Button>
            ) : (
              <Button size="sm" asChild onClick={finish}><Link to="/dashboard">Get started</Link></Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
