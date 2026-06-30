import { createFileRoute } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useWallet, formatMoney, type WalletTx } from "@/hooks/useWallet";
import { ArrowDownToLine, ArrowUpFromLine, CreditCard, Building2, Wallet as WalletIcon, Search, ShoppingBag, Sparkles, Zap, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/wallet")({
  head: () => ({ meta: [{ title: "Wallet — InstaGIG" }] }),
  component: WalletPage,
});

const PRESETS = [10, 25, 100];

const SANDBOX = [
  { id: "pro-invoice", name: "Premium Invoice Automation Tool", price: 15, icon: Zap, desc: "Auto-generate, brand & send invoices in one click." },
  { id: "boost-gig", name: "Featured Gig Boost (24h)", price: 8, icon: Sparkles, desc: "Pin your gig to the top of the marketplace." },
  { id: "verify-pro", name: "Verified Pro Badge", price: 25, icon: ShieldCheck, desc: "Stand out with InstaGIG identity verification." },
];

function WalletPage() {
  const { balance, currency, transactions, mutate } = useWallet();
  const [fundOpen, setFundOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [query, setQuery] = useState("");

  const filtered = useMemo(
    () => transactions.filter((t) => `${t.type} ${t.description ?? ""} ${t.reference ?? ""}`.toLowerCase().includes(query.toLowerCase())),
    [transactions, query]
  );

  async function buy(item: typeof SANDBOX[number]) {
    if (item.price > balance) { toast.error("Insufficient Balance — Please Fund Your Wallet"); return; }
    await mutate.mutateAsync({ amount: item.price, type: "purchase", description: item.name });
    toast.success(`Purchased ${item.name}`);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6 md:py-10">
        <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl font-bold md:text-3xl">Wallet</h1>
            <p className="text-sm text-muted-foreground">Fund your account, pay for services, and track every transaction.</p>
          </div>
          <Badge variant="secondary" className="gap-1 px-3 py-1.5 text-sm"><WalletIcon className="h-3.5 w-3.5" /> {currency}</Badge>
        </header>

        {/* Main balance card */}
        <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-card via-card to-primary/10 shadow-[var(--shadow-glow)]">
          <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/30 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-56 w-56 rounded-full bg-primary/20 blur-3xl" />
          <CardContent className="relative grid gap-6 p-6 md:grid-cols-[1fr_auto] md:p-8">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                <WalletIcon className="h-3.5 w-3.5" /> Available Balance
              </div>
              <div className="mt-2 font-display text-4xl font-black tabular-nums text-foreground md:text-6xl">
                {formatMoney(balance, currency)}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">InstaGIG Wallet · Instant settlement</div>
            </div>
            <div className="flex flex-col gap-2 self-end md:items-end">
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setFundOpen(true)} className="font-semibold"><ArrowDownToLine className="h-4 w-4" /> Fund Account</Button>
                <Button onClick={() => setWithdrawOpen(true)} variant="secondary"><ArrowUpFromLine className="h-4 w-4" /> Withdraw</Button>
              </div>
              <div className="text-[10px] uppercase tracking-widest text-muted-foreground">•• 4242 · InstaGIG Lemon</div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase sandbox */}
        <section>
          <h2 className="mb-3 font-display text-lg font-bold">Try your balance — Purchase Sandbox</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SANDBOX.map((it) => (
              <Card key={it.id} className="flex flex-col">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><it.icon className="h-4 w-4" /></div>
                    <CardTitle className="text-base">{it.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col justify-between gap-3">
                  <p className="text-xs text-muted-foreground">{it.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-xl font-bold tabular-nums">{formatMoney(it.price, currency)}</span>
                    <Button size="sm" onClick={() => buy(it)} disabled={mutate.isPending}>
                      <ShoppingBag className="h-3.5 w-3.5" /> Pay with Wallet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Ledger */}
        <section>
          <div className="mb-3 grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 sm:flex sm:items-center sm:justify-between">
            <h2 className="truncate font-display text-lg font-bold">Transaction Ledger</h2>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search" className="h-8 pl-7 text-xs" />
            </div>
          </div>
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/50 text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="hidden px-4 py-3 text-left md:table-cell">Reference</th>
                    <th className="hidden px-4 py-3 text-left sm:table-cell">Date</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} className="px-4 py-10 text-center text-sm text-muted-foreground">No transactions yet. Fund your wallet to get started.</td></tr>
                  )}
                  {filtered.map((t) => <LedgerRow key={t.id} t={t} currency={currency} />)}
                </tbody>
              </table>
            </div>
          </Card>
        </section>
      </main>

      <FundModal open={fundOpen} onOpenChange={setFundOpen} onConfirm={async (amt, method) => {
        await mutate.mutateAsync({ amount: amt, type: "deposit", description: `Deposit via ${method}` });
        toast.success(`Funded ${formatMoney(amt, currency)} via ${method}`);
        setFundOpen(false);
      }} />
      <WithdrawModal open={withdrawOpen} onOpenChange={setWithdrawOpen} balance={balance} currency={currency} onConfirm={async (amt) => {
        try {
          await mutate.mutateAsync({ amount: amt, type: "withdrawal", description: "Payout to bank" });
          toast.success(`Withdrawal of ${formatMoney(amt, currency)} requested`);
          setWithdrawOpen(false);
        } catch (e) { toast.error((e as Error).message); }
      }} />
    </div>
  );
}

function LedgerRow({ t, currency }: { t: WalletTx; currency: string }) {
  const positive = t.type === "deposit" || t.type === "refund";
  return (
    <tr className="border-t border-border">
      <td className="px-4 py-3 capitalize">{t.type}</td>
      <td className="px-4 py-3 text-muted-foreground">{t.description ?? "—"}</td>
      <td className={`px-4 py-3 text-right font-semibold tabular-nums ${positive ? "text-primary" : "text-destructive"}`}>
        {positive ? "+" : "−"}{formatMoney(t.amount, currency)}
      </td>
      <td className="hidden px-4 py-3 font-mono text-xs text-muted-foreground md:table-cell">{t.reference}</td>
      <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">{new Date(t.created_at).toLocaleString()}</td>
      <td className="px-4 py-3"><Badge variant={t.status === "completed" ? "default" : "secondary"} className="capitalize">{t.status}</Badge></td>
    </tr>
  );
}

function FundModal({ open, onOpenChange, onConfirm }: { open: boolean; onOpenChange: (b: boolean) => void; onConfirm: (amt: number, method: string) => void | Promise<void> }) {
  const [amount, setAmount] = useState<number>(25);
  const [custom, setCustom] = useState("");
  const [method, setMethod] = useState("Credit Card");
  const final = custom ? Number(custom) : amount;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowDownToLine className="h-4 w-4 text-primary" /> Fund Account</DialogTitle>
          <DialogDescription>Add credit to your InstaGIG wallet.</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Quick Amount</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {PRESETS.map((p) => (
                <button key={p} type="button" onClick={() => { setAmount(p); setCustom(""); }}
                  className={`rounded-lg border px-3 py-2 text-sm font-semibold tabular-nums transition ${!custom && amount === p ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                  ${p}
                </button>
              ))}
              <Input value={custom} onChange={(e) => setCustom(e.target.value.replace(/[^\d.]/g, ""))} placeholder="Custom" inputMode="decimal" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Payment Method</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[{ k: "Credit Card", i: CreditCard }, { k: "Bank Transfer", i: Building2 }, { k: "Virtual Account", i: WalletIcon }].map(({ k, i: I }) => (
                <button key={k} type="button" onClick={() => setMethod(k)}
                  className={`flex items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition ${method === k ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/40"}`}>
                  <I className="h-3.5 w-3.5" />{k}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => final > 0 && onConfirm(final, method)} disabled={!(final > 0)}>Confirm Deposit · ${final || 0}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function WithdrawModal({ open, onOpenChange, balance, currency, onConfirm }: { open: boolean; onOpenChange: (b: boolean) => void; balance: number; currency: string; onConfirm: (amt: number) => void | Promise<void> }) {
  const [val, setVal] = useState("");
  const n = Number(val);
  const over = n > balance;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><ArrowUpFromLine className="h-4 w-4 text-primary" /> Withdraw Funds</DialogTitle>
          <DialogDescription>Available: <span className="font-semibold text-foreground">{formatMoney(balance, currency)}</span></DialogDescription>
        </DialogHeader>
        <div>
          <label className="text-xs font-semibold text-muted-foreground">Amount</label>
          <Input value={val} onChange={(e) => setVal(e.target.value.replace(/[^\d.]/g, ""))} placeholder="0.00" inputMode="decimal" className="mt-2 text-lg" />
          {over && <p className="mt-2 text-xs text-destructive">Amount exceeds your available balance.</p>}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={() => n > 0 && !over && onConfirm(n)} disabled={!(n > 0) || over}>Withdraw</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
