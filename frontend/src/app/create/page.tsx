"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SHARE_PRICE, VESSEL_TYPES } from "@/lib/constants";
import { waitForTx } from "@/lib/tx";
import { useContracts } from "@/hooks/useContracts";
import { useWallet } from "@/context/WalletContext";
import { useRouter } from "next/navigation";


export default function CreateCollectionPage() {
  const router = useRouter();
  const wallet = useWallet();
  const { factory, getSignerContracts } = useContracts();
  const [name, setName] = useState("");
  const [imo, setImo] = useState("");
  const [vesselType, setVesselType] = useState<(typeof VESSEL_TYPES)[number]>(
    VESSEL_TYPES[0]
  );
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const shareCount = useMemo(() => {
    const p = parseFloat(price);
    if (isNaN(p) || p < SHARE_PRICE) return 0;
    return Math.floor(p / SHARE_PRICE);
  }, [price]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet?.address) {
      setError("Connect your wallet first");
      return;
    }
    const shipPrice = Math.floor(parseFloat(price));
    if (shipPrice < SHARE_PRICE || shareCount === 0) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const signerContracts = await getSignerContracts();
      if (!signerContracts) throw new Error("Could not get signer");

      const symbol = name
        .replace(/\s+/g, "")
        .slice(0, 6)
        .toUpperCase();
      // Use placeholder metadata base; imageUrl not stored on-chain
      const baseURI = "https://shipyield.app/meta/";

      const tx = await signerContracts.factory.createCollection(
        name,
        symbol,
        baseURI,
        shipPrice
      );
      await waitForTx(tx);

      const count = await factory.collectionCount();
      const newId = Number(count) - 1;
      router.push(`/ships/${newId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Create Vessel Collection
      </h1>
      <p className="mt-2 text-slate-600">
        Tokenize a cargo ship into $200 shares. Admin only.
      </p>

      <form onSubmit={handleSubmit} className="mt-8">
        <Card className="space-y-6 p-6">
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-slate-700"
            >
              Ship Name *
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. MSC Aurora"
            />
          </div>

          <div>
            <label
              htmlFor="imo"
              className="block text-sm font-medium text-slate-700"
            >
              IMO Number
            </label>
            <input
              id="imo"
              type="text"
              value={imo}
              onChange={(e) => setImo(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. 9234567"
            />
          </div>

          <div>
            <label
              htmlFor="vesselType"
              className="block text-sm font-medium text-slate-700"
            >
              Vessel Type
            </label>
            <select
              id="vesselType"
              value={vesselType}
              onChange={(e) => setVesselType(e.target.value as (typeof VESSEL_TYPES)[number])}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              {VESSEL_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="price"
              className="block text-sm font-medium text-slate-700"
            >
              Ship Price (USD) *
            </label>
            <input
              id="price"
              type="number"
              required
              min={SHARE_PRICE}
              step="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="e.g. 1000000"
            />
            <p className="mt-1 text-xs text-slate-500">
              Minimum ${SHARE_PRICE}. Shares = floor(price / {SHARE_PRICE}).
            </p>
          </div>

          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm font-medium text-slate-700">
              Shares to Mint
            </p>
            <p className="mt-1 text-2xl font-bold text-primary">
              {shareCount > 0 ? shareCount.toLocaleString() : "—"}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {shareCount} NFTs at ${SHARE_PRICE} each = $
              {shareCount > 0 ? (shareCount * SHARE_PRICE).toLocaleString() : "—"}{" "}
              total
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700"
            >
              Description
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="Brief description of the vessel..."
            />
          </div>

          <div>
            <label
              htmlFor="imageUrl"
              className="block text-sm font-medium text-slate-700"
            >
              Ship Image URL
            </label>
            <input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="mt-1 block w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="https://..."
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              disabled={shareCount === 0 || isSubmitting || !wallet?.address}
            >
              {isSubmitting ? "Creating..." : "Create Collection"}
            </Button>
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
              Cancel
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
}
