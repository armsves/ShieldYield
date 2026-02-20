"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useContracts } from "@/hooks/useContracts";
import { useWallet } from "@/context/WalletContext";
import { Contract } from "ethers";
import { ERC721_ABI, ERC20_ABI, CONTRACT_ADDRESSES } from "@/lib/contracts";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=200&h=120&fit=crop";

type Holding = {
  id: number;
  nft: string;
  name: string;
  shares: number;
  value: number;
  yieldAccrued: string;
};

export default function DashboardPage() {
  const wallet = useWallet();
  const { provider, factory, yieldVault } = useContracts();
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHoldings() {
      if (!wallet?.address) {
        setHoldings([]);
        setLoading(false);
        return;
      }

      try {
        const count = await factory.collectionCount();
        const num = Number(count);
        const list: Holding[] = [];

        for (let i = 0; i < num; i++) {
          const [nft, name, shareCount] = await factory.collections(i);
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
            value: balance * 200,
            yieldAccrued: (Number(pending) / 10 ** decimals).toFixed(2),
          });
        }

        setHoldings(list);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHoldings();
  }, [wallet?.address, provider, factory, yieldVault]);

  const totalValue = holdings.reduce((s, h) => s + h.value, 0);
  const totalYield = holdings.reduce(
    (s, h) => s + parseFloat(h.yieldAccrued),
    0
  );

  if (!wallet?.address) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Portfolio</h1>
        <p className="mt-4 text-slate-600">
          Connect your wallet to view your holdings.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Portfolio</h1>
        <p className="mt-8 text-slate-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Portfolio</h1>
      <p className="mt-2 text-slate-600">
        Manage your maritime investments and track yield.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-500">
            Total Portfolio Value
          </p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            ${totalValue.toLocaleString()}
          </p>
        </Card>
        <Card className="p-6">
          <p className="text-sm font-medium text-slate-500">Yield Accrued</p>
          <p className="mt-2 text-3xl font-bold text-primary">
            ${totalYield.toFixed(2)}
          </p>
        </Card>
        <Card className="flex items-center justify-between p-6">
          <div>
            <p className="text-sm font-medium text-slate-500">Collections</p>
            <p className="mt-2 text-2xl font-bold text-slate-900">
              {holdings.length}
            </p>
          </div>
          <Link href="/claims">
            <Button size="sm">Claim Yield</Button>
          </Link>
        </Card>
      </div>

      <div className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">My Holdings</h2>
        <div className="mt-6 space-y-6">
          {holdings.map((holding) => (
            <Card key={holding.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <img
                  src={DEFAULT_IMAGE}
                  alt={holding.name}
                  className="h-32 w-full object-cover sm:h-auto sm:w-48"
                />
                <div className="flex flex-1 flex-col justify-between p-6 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {holding.name}
                    </h3>
                    <p className="mt-1 text-slate-600">
                      {holding.shares} share{holding.shares > 1 ? "s" : ""} · $
                      {holding.value}
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Yield accrued: ${holding.yieldAccrued}
                    </p>
                  </div>
                  <div className="mt-4 flex gap-3 sm:mt-0">
                    <Link href={`/ships/${holding.id}`}>
                      <Button variant="outline" size="sm">
                        View Collection
                      </Button>
                    </Link>
                    <Link href="/claims">
                      <Button size="sm">Claim</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
        {holdings.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-600">No holdings yet.</p>
            <Link href="/marketplace" className="mt-4 inline-block">
              <Button>Browse Vessels</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
}
