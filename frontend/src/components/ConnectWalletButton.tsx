"use client";

import { useWallet, truncateAddress } from "@/context/WalletContext";

interface ConnectWalletButtonProps {
  variant?: "primary" | "outline-light";
  className?: string;
}

export function ConnectWalletButton({
  variant = "primary",
  className = "",
}: ConnectWalletButtonProps) {
  const wallet = useWallet();
  if (!wallet) return null;

  if (wallet.address) {
    return (
      <div className={`flex items-center gap-3 ${className}`}>
        <span className="text-sm font-medium text-inherit opacity-90">
          {truncateAddress(wallet.address)}
        </span>
        <button
          type="button"
          onClick={wallet.disconnect}
          className="rounded-lg border border-white/50 bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
        >
          Disconnect
        </button>
      </div>
    );
  }

  const base =
    "rounded-lg px-8 py-3 font-medium transition-colors disabled:opacity-70";
  const variants = {
    primary:
      "border-2 border-primary bg-primary text-white hover:bg-[#0d47b8]",
    "outline-light":
      "border-2 border-white bg-white text-primary hover:bg-blue-50",
  };

  return (
    <button
      type="button"
      onClick={wallet.connect}
      disabled={wallet.isConnecting}
      className={`${base} ${variants[variant]} ${className}`}
    >
      {wallet.isConnecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
