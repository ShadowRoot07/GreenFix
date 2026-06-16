import { useApp } from "../context/AppContext";
import { Wallet2, Power, Coins } from "lucide-react";
import Button from "./ui/Button";
import { useState } from "react";

export default function WalletConnect() {
  const {
    account,
    usdcBalance,
    connectWallet,
    disconnectWallet,
    requestUsdcFaucet,
  } = useApp();

  const [fauceting, setFauceting] = useState(false);

  // Formatea la dirección para mostrarla corta (ej: 0x1234...abcd)
  const formatAddress = (addr) => {
    if (!addr) return "";
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const handleFaucet = async () => {
    try {
      setFauceting(true);
      await requestUsdcFaucet();
    } catch (err) {
      console.error("Error ejecutando Faucet:", err);
    } finally {
      setFauceting(false);
    }
  };

  if (!account) {
    return (
      <Button onClick={connectWallet} variant="primary" className="gap-2">
        <Wallet2 size={18} />
        Conectar Wallet
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center">
      {/* Balance de USDC */}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white">
        <Coins size={16} className="text-emerald-400" />
        <span className="font-semibold">{Number(usdcBalance).toFixed(2)}</span>
        <span className="text-xs font-bold text-emerald-400">USDC</span>
        
        {/* Botón Faucet */}
        <button
          onClick={handleFaucet}
          disabled={fauceting}
          className="ml-2 rounded-lg bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-500/20 transition-all hover:bg-emerald-500/20 disabled:opacity-50"
          title="Pedir 10,000 USDC de prueba"
        >
          {fauceting ? "Minteando..." : "Faucet"}
        </button>
      </div>

      {/* Info de la Cuenta + Desconectar */}
      <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.04] pl-4 pr-2 py-1.5 text-sm text-text-secondary">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase tracking-wider text-text-muted">Conectado</span>
          <span className="font-mono text-xs text-white" title={account}>
            {formatAddress(account)}
          </span>
        </div>
        
        <button
          onClick={disconnectWallet}
          className="rounded-xl p-2 text-text-muted hover:bg-red-500/10 hover:text-red-400 transition-colors"
          title="Desconectar Wallet"
        >
          <Power size={16} />
        </button>
      </div>
    </div>
  );
}
