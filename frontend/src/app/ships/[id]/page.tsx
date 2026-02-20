"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useContracts } from "@/hooks/useContracts";
import { useWallet } from "@/context/WalletContext";
import { Contract } from "ethers";
import { ERC721_ABI, SHARE_PRICE, CONTRACT_ADDRESSES } from "@/lib/contracts";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=400&fit=crop";

const BATCH_SIZE = 50;
const MAX_LISTED_FETCH = 500;

export default function ShipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { provider, factory, marketplace, getSignerContracts } = useContracts();
  const wallet = useWallet();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [collection, setCollection] = useState<{
    nft: string;
    name: string;
    shareCount: bigint;
  } | null>(null);
  const [listedIds, setListedIds] = useState<number[]>([]);
  const [buyingId, setBuyingId] = useState<number | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const numId = parseInt(id, 10);
      if (isNaN(numId) || numId < 0) {
        setError("Invalid collection");
        setLoading(false);
        return;
      }

      try {
        const count = await factory.collectionCount();
        if (numId >= Number(count)) {
          setError("Collection not found");
          setLoading(false);
          return;
        }

        const [nft, name, shareCount] = await factory.collections(numId);
        setCollection({ nft, name, shareCount });

        const nftContract = new Contract(nft, ERC721_ABI, provider);
        const supply = Number(await nftContract.totalSupply());
        const listed: number[] = [];
        const toCheck = Math.min(supply, MAX_LISTED_FETCH);

        for (let i = 1; i <= toCheck; i += BATCH_SIZE) {
          const batch = [];
          for (let t = i; t < Math.min(i + BATCH_SIZE, toCheck + 1); t++) {
            batch.push(marketplace.isListed(nft, t));
          }
          const results = await Promise.all(batch);
          results.forEach((ok, idx) => {
            if (ok) listed.push(i + idx);
          });
        }
        setListedIds(listed);
      } catch (err) {
        console.error(err);
        setError("Failed to load collection");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, provider, factory, marketplace]);

  const handleBuy = async (tokenId: number) => {
    if (!wallet?.address || !collection) return;
    setBuyingId(tokenId);
    setTxError(null);

    try {
      const signerContracts = await getSignerContracts();
      if (!signerContracts) throw new Error("Connect wallet");

      const approveTx = await signerContracts.paymentToken.approve(
        CONTRACT_ADDRESSES.marketplace,
        SHARE_PRICE
      );
      await approveTx.wait();

      const buyTx = await signerContracts.marketplace.buy(
        collection.nft,
        tokenId
      );
      await buyTx.wait();

      setListedIds((prev) => prev.filter((id) => id !== tokenId));
    } catch (err) {
      setTxError(err instanceof Error ? err.message : "Purchase failed");
    } finally {
      setBuyingId(null);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-slate-600">Loading...</p>
      </div>
    );
  }

  if (error || !collection) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <p className="text-red-600">{error || "Not found"}</p>
        <Link href="/marketplace" className="mt-4 inline-block text-primary">
          ← Back to Marketplace
        </Link>
      </div>
    );
  }

  const totalShares = Number(collection.shareCount);
  const availableShares = listedIds.length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/marketplace"
        className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-primary"
      >
        ← Back to Marketplace
      </Link>

      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <img
          src={DEFAULT_IMAGE}
          alt={collection.name}
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="p-6 sm:p-8">
          <h1 className="text-3xl font-bold text-slate-900">{collection.name}</h1>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Available Shares
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select an NFT to purchase at $200 per share. Connect wallet to
              buy.
            </p>
            {txError && (
              <p className="mt-2 text-sm text-red-600">{txError}</p>
            )}
            <div className="mt-4 flex flex-wrap gap-3">
              {listedIds.slice(0, 100).map((tokenId) => (
                <button
                  key={tokenId}
                  type="button"
                  onClick={() => handleBuy(tokenId)}
                  disabled={!wallet?.address || buyingId !== null}
                  className="rounded-lg border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  #{tokenId} — Buy $200
                  {buyingId === tokenId ? "..." : ""}
                </button>
              ))}
            </div>
            {listedIds.length > 100 && (
              <p className="mt-2 text-sm text-slate-500">
                + {listedIds.length - 100} more
              </p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Statistics</h3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm text-slate-500">Total Shares</dt>
                <dd className="font-medium text-slate-900">
                  {totalShares.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Available</dt>
                <dd className="font-medium text-slate-900">{availableShares}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Price per Share</dt>
                <dd className="font-medium text-slate-900">$200</dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Yield</h3>
            <p className="mt-2 text-sm text-slate-600">
              Monthly distributions to NFT holders.
            </p>
            <Link href="/claims" className="mt-4 block">
              <Button variant="outline" size="sm" className="w-full">
                Claim Yield
              </Button>
            </Link>
          </Card>
        </div>
      </div>
    </div>
  );
}
