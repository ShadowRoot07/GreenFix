import { Wallet } from "lucide-react";
import { useApp } from "../context/AppContext";
import Button from "./ui/Button";

export default function WalletConnect() {
  const { account, connectWallet, disconnectWallet, walletLoading } = useApp();

  if (account) {
    return (
      <Button variant="secondary" onClick={disconnectWallet} className="rounded-full">
        <Wallet size={18} />
        {account.slice(0, 6)}...{account.slice(-4)}
      </Button>
    );
  }

  return (
    <Button onClick={connectWallet} className="rounded-full" disabled={walletLoading}>
      <Wallet size={18} />
      {walletLoading ? "Conectando..." : "Conectar Wallet"}
    </Button>
  );
}
