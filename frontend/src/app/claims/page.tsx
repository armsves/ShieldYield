"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useContracts } from "@/hooks/useContracts";
import { useWallet } from "@/context/WalletContext";
import { Contract } from "ethers";
import { ERC721_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";
import { waitForTx } from "@/lib/tx";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=120&h=80&fit=crop";

type Claimable = {
  id: number;
  nft: string;
  name: string;
  shares: number;
  claimable: string;
};

export default function ClaimsPage() {
  const wallet = useWallet();
  const { provider, factory, yieldVault, getSignerContracts } = useContracts();
  const [claims, setClaims] = useState<Claimable[]>([]);
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchClaims() {
      if (!wallet?.address) {
        setClaims([]);
        setLoading(false);
        return;
      }

      try {
        const count = await factory.collectionCount();
        const num = Number(count);
        const list: Claimable[] = [];

        for (let i = 0; i < num; i++) {
          const [nft, name] = await factory.collections(i);
          const nftContract = new Contract(nft, ERC721_ABI, provider);
          const balance = Number(await nftContract.balanceOf(wallet.address));
          if (balance === 0) continue;

          const pending = await yieldVault.pendingReward(nft, wallet.address);
          const paymentToken = new Contract(
            CONTRACT_ADDRESSES.paymentToken,
            ERC20_ABI,
            provider
          );
          const decimals = Number(await paymentToken.decimals());

          list.push({
            id: i,
            nft,
            name,
            shares: balance,
            claimable: (Number(pending) / 10 ** decimals).toFixed(2),
          });
        }

        setClaims(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchClaims();
  }, [wallet?.address, provider, factory, yieldVault]);

  const totalClaimable = claims.reduce(
    (s, c) => s + parseFloat(c.claimable),
    0
  );
  const hasSharesNoYield =
    claims.length > 0 && claims.every((c) => parseFloat(c.claimable) === 0);

  const handleClaim = async (collectionId: number) => {
    const c = claims.find((x) => x.id === collectionId);
    if (!c || !wallet?.address) return;
    setClaimingId(collectionId);
    setError(null);

    try {
      const signerContracts = await getSignerContracts();
      if (!signerContracts) throw new Error("Connect wallet");

      const tx = await signerContracts.yieldVault.claim(c.nft);
      await waitForTx(tx);

      setClaims((prev) =>
        prev.map((x) =>
          x.id === collectionId ? { ...x, claimable: "0.00" } : x
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Claim failed");
    } finally {
      setClaimingId(null);
    }
  };

  if (!wallet?.address) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Yield Claims</h1>
        <p className="mt-4 text-slate-600">
          Connect your wallet to view and claim yield.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Yield Claims</h1>
        <p className="mt-8 text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Yield Claims</h1>
      <p className="mt-2 text-slate-600">
        Claim your monthly earnings from vessel operations.
      </p>

      <Card className="mt-8 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Claimable
            </p>
            <p className="mt-1 text-3xl font-bold text-primary">
              ${totalClaimable.toFixed(2)}
            </p>
            {hasSharesNoYield && (
              <p className="mt-2 text-sm text-slate-500">
                You hold shares. Yield will appear after the treasury deposits monthly vessel earnings.
              </p>
            )}
          </div>
        </div>
      </Card>

      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">By Collection</h2>
        {claims.map((claim) => (
          <Card key={claim.id} className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={DEFAULT_IMAGE}
                  alt={claim.name}
                  className="h-16 w-24 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-semibold text-slate-900">{claim.name}</h3>
                  <p className="text-sm text-slate-500">
                    {claim.shares} share{claim.shares > 1 ? "s" : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-8">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Claimable</p>
                  <p className="font-semibold text-primary">
                    ${claim.claimable}
                  </p>
                  {parseFloat(claim.claimable) === 0 && (
                    <p className="mt-1 text-xs text-slate-400">
                      Yield appears when treasury deposits
                    </p>
                  )}
                </div>
                <Button
                  size="sm"
                  onClick={() => handleClaim(claim.id)}
                  disabled={claimingId !== null || parseFloat(claim.claimable) <= 0}
                >
                  {claimingId === claim.id ? "Claiming..." : "Claim"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
        {error && <p className="text-sm text-red-600">{error}</p>}
        {claims.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-600">No vessel shares in your wallet.</p>
            <p className="mt-2 text-sm text-slate-500">
              Buy shares from the marketplace to receive yield distributions.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
