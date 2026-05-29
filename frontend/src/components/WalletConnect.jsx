import { Wallet, Coins } from "lucide-react";
import { useApp } from "../context/AppContext";
import Button from "./ui/Button";

export default function WalletConnect() {
  const { account, connectWallet, disconnectWallet, walletLoading, usdcBalance, requestFaucet, txPending } = useApp();

  if (account) {
    return (
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm font-bold text-primary">
          <Coins size={16} />
          {usdcBalance.toLocaleString()} USDC
        </span>

        <Button variant="secondary" onClick={() => requestFaucet(5000)} className="rounded-full" disabled={txPending}>
          Faucet
        </Button>

        <Button variant="secondary" onClick={disconnectWallet} className="rounded-full">
          <Wallet size={18} />
          {account.slice(0, 6)}...{account.slice(-4)}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={connectWallet} className="rounded-full" disabled={walletLoading}>
      <Wallet size={18} />
      {walletLoading ? "Conectando..." : "Conectar Wallet"}
    </Button>
  );
}
