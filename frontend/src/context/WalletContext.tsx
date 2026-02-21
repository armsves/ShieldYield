"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type WalletContextType = {
  address: string | null;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
};

const WalletContext = createContext<WalletContextType | null>(null);

export function truncateAddress(addr: string) {
  return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(async () => {
    if (typeof window === "undefined") return;

    const ethereum = (window as unknown as { ethereum?: { request: (args: { method: string }) => Promise<string[]> } }).ethereum;
    if (!ethereum) {
      setError("MetaMask not installed");
      window.open("https://metamask.io/download/", "_blank");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      if (accounts && accounts.length > 0) {
        setAddress(accounts[0]);

        // Switch to 0G Testnet (16602) if not already
        const chainId = (await (ethereum as { request: (args: unknown) => Promise<unknown> }).request({ method: "eth_chainId" })) as string;
        if (chainId !== "0x40da") {
          try {
            await (ethereum as { request: (args: unknown) => Promise<unknown> }).request({
              method: "wallet_switchEthereumChain",
              params: [{ chainId: "0x40da" }],
            });
          } catch {
            try {
              await (ethereum as { request: (args: unknown) => Promise<unknown> }).request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: "0x1869f", // 99999 in hex
                    chainName: "ADI Testnet",
                    nativeCurrency: { name: "ADI", symbol: "ADI", decimals: 18 },
                    rpcUrls: ["https://rpc.ab.testnet.adifoundation.ai"],
                    blockExplorerUrls: ["https://explorer.ab.testnet.adifoundation.ai/"],
                  },
                ],
              });
            } catch {
              // User may have rejected
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnect = useCallback(() => {
    setAddress(null);
    setError(null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const ethereum = (window as unknown as { ethereum?: { on: (event: string, handler: (accounts: string[]) => void) => void } }).ethereum;
    if (!ethereum) return;

    const handleAccountsChanged = (accounts: string[]) => {
      setAddress(accounts && accounts.length > 0 ? accounts[0] : null);
    };

    ethereum.on("accountsChanged", handleAccountsChanged);
  }, []);

  return (
    <WalletContext.Provider
      value={{ address, isConnecting, error, connect, disconnect }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet(): WalletContextType | null {
  return useContext(WalletContext);
}
