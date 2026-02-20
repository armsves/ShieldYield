"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useContracts } from "@/hooks/useContracts";
import { useWallet } from "@/context/WalletContext";
import { Contract } from "ethers";
import {
  ERC721_ABI,
  SHARE_PRICE,
  CONTRACT_ADDRESSES,
  FAUCET_AMOUNT,
} from "@/lib/contracts";
import { waitForTx } from "@/lib/tx";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=400&fit=crop";

const BATCH_SIZE = 50;
const MAX_LISTED_FETCH = 500;

export default function ShipDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { provider, factory, marketplace, paymentToken, getSignerContracts } =
    useContracts();
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
  const [usdcBalance, setUsdcBalance] = useState<bigint | null>(null);
  const [faucetLoading, setFaucetLoading] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const numId = parseInt(id, 10);
      if (isNaN(numId) || numId < 0) {
        setError("Invalid collection ID");
        setLoading(false);
        return;
      }

      try {
        const count = await factory.collectionCount();
        const countNum = Number(count);
        if (countNum === 0) {
          setError("No collections yet. Create one first!");
          setLoading(false);
          return;
        }
        if (numId >= countNum) {
          setError(`Collection #${numId} not found. There are ${countNum} collection(s).`);
          setLoading(false);
          return;
        }

        const result = await factory.collections(numId);
        const nft = typeof result.nft === "string" ? result.nft : result[0];
        const name = typeof result.name === "string" ? result.name : result[1];
        const shareCount = result.shareCount ?? result[2];

        if (!nft || nft === "0x0000000000000000000000000000000000000000") {
          setError("Collection has no NFT contract");
          setLoading(false);
          return;
        }

        setCollection({ nft, name, shareCount });

        const nftContract = new Contract(nft, ERC721_ABI, provider);
        const supply = Number(await nftContract.totalSupply());
        const listed: number[] = [];

        if (supply > 0) {
          const toCheck = Math.min(supply, MAX_LISTED_FETCH);
          try {
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
          } catch {
            // Listed ids fetch can fail on RPC limits; show collection anyway
          }
        }
        setListedIds(listed);
      } catch (err) {
        console.error("Collection load error:", err);
        const msg = err instanceof Error ? err.message : String(err);
        setError(
          msg.includes("network") || msg.includes("fetch")
            ? "Network error. Check your connection and try again."
            : `Failed to load collection: ${msg.slice(0, 80)}`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [id, provider, factory, marketplace]);

  useEffect(() => {
    if (!wallet?.address || !paymentToken) return;
    paymentToken
      .balanceOf(wallet.address)
      .then(setUsdcBalance)
      .catch(() => setUsdcBalance(null));
  }, [wallet?.address, paymentToken]);

  const handleFaucet = async () => {
    if (!wallet?.address) return;
    setFaucetLoading(true);
    setTxError(null);
    try {
      const signerContracts = await getSignerContracts();
      if (!signerContracts?.mockPaymentToken) throw new Error("Connect wallet");
      const tx = await signerContracts.mockPaymentToken.mint(
        wallet.address,
        FAUCET_AMOUNT
      );
      await waitForTx(tx);
      const bal = await paymentToken.balanceOf(wallet.address);
      setUsdcBalance(bal);
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Faucet failed";
      setTxError(msg.includes("mint") ? "Faucet only works with test mock USDC." : msg);
    } finally {
      setFaucetLoading(false);
    }
  };

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
      await waitForTx(approveTx);

      const buyTx = await signerContracts.marketplace.buy(
        collection.nft,
        tokenId
      );
      await waitForTx(buyTx);

      setListedIds((prev) => prev.filter((id) => id !== tokenId));
      const bal = await paymentToken.balanceOf(wallet.address);
      setUsdcBalance(bal);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Purchase failed";
      const isInsufficientBalance =
        msg.includes("e450d38c") ||
        msg.includes("InsufficientBalance") ||
        msg.includes("insufficient balance");
      setTxError(
        isInsufficientBalance
          ? "Insufficient USDC. You need 200 USDC. Use the faucet below to get test USDC."
          : msg
      );
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
        <div className="mt-4 flex gap-4">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="text-sm font-medium text-primary hover:underline"
          >
            Retry
          </button>
          <Link href="/marketplace" className="text-sm font-medium text-primary hover:underline">
            ← Back to Marketplace
          </Link>
        </div>
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
            {wallet?.address && usdcBalance !== null && (
              <p className="mt-2 text-sm text-slate-600">
                Your USDC balance:{" "}
                <span
                  className={
                    usdcBalance < SHARE_PRICE ? "font-medium text-amber-600" : ""
                  }
                >
                  ${(Number(usdcBalance) / 1e6).toLocaleString()}
                </span>
                {usdcBalance < SHARE_PRICE && (
                  <span className="ml-2 text-amber-600">
                    — get test USDC below
                  </span>
                )}
              </p>
            )}
            {txError && (
              <p className="mt-2 text-sm text-red-600">{txError}</p>
            )}
            {wallet?.address && (
              <div className="mt-2">
                <button
                  type="button"
                  onClick={handleFaucet}
                  disabled={faucetLoading}
                  className="rounded-md border border-slate-300 bg-slate-50 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {faucetLoading ? "Minting…" : "Get 1000 test USDC"}
                </button>
              </div>
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
