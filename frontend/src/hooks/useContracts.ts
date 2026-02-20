"use client";

import { useMemo } from "react";
import {
  BrowserProvider,
  Contract,
  JsonRpcProvider,
  type Eip1193Provider,
} from "ethers";
import { useWallet } from "@/context/WalletContext";
import {
  CONTRACT_ADDRESSES,
  FACTORY_ABI,
  MARKETPLACE_ABI,
  YIELD_VAULT_ABI,
  ERC721_ABI,
  ERC20_ABI,
  MOCK_ERC20_ABI,
  RPC_URL,
} from "@/lib/contracts";

export function useContracts() {
  const wallet = useWallet();

  return useMemo(() => {
    const provider = new JsonRpcProvider(RPC_URL);

    const factory = new Contract(
      CONTRACT_ADDRESSES.factory,
      FACTORY_ABI,
      provider
    );
    const marketplace = new Contract(
      CONTRACT_ADDRESSES.marketplace,
      MARKETPLACE_ABI,
      provider
    );
    const yieldVault = new Contract(
      CONTRACT_ADDRESSES.yieldVault,
      YIELD_VAULT_ABI,
      provider
    );
    const paymentToken = new Contract(
      CONTRACT_ADDRESSES.paymentToken,
      ERC20_ABI,
      provider
    );

    return {
      provider,
      factory,
      marketplace,
      yieldVault,
      paymentToken,
      getSignerContracts: async () => {
        if (!wallet?.address || typeof window === "undefined") return null;
        const ethereum = (window as unknown as { ethereum?: Eip1193Provider }).ethereum;
        if (!ethereum) return null;
        const bp = new BrowserProvider(ethereum);
        const signer = await bp.getSigner();
        return {
          factory: new Contract(
            CONTRACT_ADDRESSES.factory,
            FACTORY_ABI,
            signer
          ),
          marketplace: new Contract(
            CONTRACT_ADDRESSES.marketplace,
            MARKETPLACE_ABI,
            signer
          ),
          yieldVault: new Contract(
            CONTRACT_ADDRESSES.yieldVault,
            YIELD_VAULT_ABI,
            signer
          ),
          paymentToken: new Contract(
            CONTRACT_ADDRESSES.paymentToken,
            ERC20_ABI,
            signer
          ),
          /** Mock USDC with mint - for faucet on testnet. Fails if contract has no mint. */
          mockPaymentToken: new Contract(
            CONTRACT_ADDRESSES.paymentToken,
            MOCK_ERC20_ABI,
            signer
          ),
        };
      },
    };
  }, [wallet?.address]);
}
