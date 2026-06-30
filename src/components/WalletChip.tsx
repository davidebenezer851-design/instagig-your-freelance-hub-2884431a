import { Link } from "@tanstack/react-router";
import { Wallet as WalletIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useWallet, formatMoney } from "@/hooks/useWallet";

export function WalletChip() {
  const { balance, currency } = useWallet();
  const [pulse, setPulse] = useState(false);
  const prev = useRef(balance);
  useEffect(() => {
    if (prev.current !== balance) {
      setPulse(true);
      const t = setTimeout(() => setPulse(false), 700);
      prev.current = balance;
      return () => clearTimeout(t);
    }
  }, [balance]);
  return (
    <Link
      to="/wallet"
      data-tour="wallet"
      className={`group hidden md:inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary transition hover:bg-primary/15 ${pulse ? "wallet-pulse" : ""}`}
      aria-label="Wallet balance"
    >
      <WalletIcon className="h-3.5 w-3.5" />
      <span className="tabular-nums">{formatMoney(balance, currency)}</span>
    </Link>
  );
}
