"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useContracts } from "@/hooks/useContracts";
import { Contract } from "ethers";

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=250&fit=crop";

type Collection = {
  id: number;
  nft: string;
  name: string;
  shareCount: bigint;
  imageUrl: string;
};

export default function MarketplacePage() {
  const { provider, factory, marketplace } = useContracts();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [listedCounts, setListedCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    async function fetchCollections() {
      try {
        const count = await factory.collectionCount();
        const num = Number(count);
        const list: Collection[] = [];

        for (let i = 0; i < num; i++) {
          const [nft, name, shareCount] = await factory.collections(i);
          list.push({
            id: i,
            nft,
            name,
            shareCount,
            imageUrl: DEFAULT_IMAGE,
          });
        }

        setCollections(list);

        // Fetch listed counts in parallel (sample first 100 tokens per collection)
        const counts: Record<number, number> = {};
        await Promise.all(
          list.map(async (c) => {
            const nftContract = new Contract(
              c.nft,
              ["function totalSupply() view returns (uint256)"],
              provider
            );
            const supply = Number(await nftContract.totalSupply());
            let listed = 0;
            const maxCheck = Math.min(supply, 200);
            for (let t = 1; t <= maxCheck; t++) {
              const ok = await marketplace.isListed(c.nft, t);
              if (ok) listed++;
            }
            if (maxCheck < supply) listed = Math.floor((listed / maxCheck) * supply);
            counts[c.id] = listed;
          })
        );
        setListedCounts(counts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, [provider, factory, marketplace]);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-slate-900">Vessel Collections</h1>
        <p className="mt-8 text-slate-500">Loading collections...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Vessel Collections</h1>
      <p className="mt-2 text-slate-600">
        Browse tokenized cargo vessels. Each share represents $200 of ownership.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/ships/${collection.id}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              <img
                src={collection.imageUrl}
                alt={collection.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-slate-900">{collection.name}</h3>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-slate-600">
                    {Number(collection.shareCount).toLocaleString()} shares
                  </span>
                  <span className="font-medium text-slate-900">$200/share</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {listedCounts[collection.id] ?? "—"} available
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  View Collection →
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>

      {collections.length === 0 && (
        <p className="mt-8 text-slate-500">No collections yet. Create one!</p>
      )}
    </div>
  );
}
