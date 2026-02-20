import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

const MOCK_SHIP: Record<
  string,
  {
    name: string;
    vesselType: string;
    imo: string;
    totalShares: number;
    availableShares: number;
    pricePerShare: number;
    description: string;
    imageUrl: string;
    lastPayout: string;
    availableTokenIds: number[];
  }
> = {
  "1": {
    name: "MSC Aurora",
    vesselType: "Container Ship",
    imo: "9234567",
    totalShares: 5000,
    availableShares: 12,
    pricePerShare: 200,
    description:
      "A modern container vessel operating on the Asia–Europe route. Built in 2019, certified for sustainable shipping.",
    imageUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=400&fit=crop",
    lastPayout: "2026-01-15",
    availableTokenIds: [101, 205, 312, 418, 523, 601, 702, 815, 901, 1002, 1108, 1215],
  },
  "2": {
    name: "Pacific Navigator",
    vesselType: "Bulk Carrier",
    imo: "9345678",
    totalShares: 3200,
    availableShares: 8,
    pricePerShare: 200,
    description: "Capable bulk carrier for grains and minerals. Deployed in Pacific trades.",
    imageUrl:
      "https://images.unsplash.com/photo-1565880324317-9656a22a9d84?w=800&h=400&fit=crop",
    lastPayout: "2026-01-10",
    availableTokenIds: [50, 120, 200, 305, 410, 500, 605, 710],
  },
  "3": {
    name: "Atlantic Spirit",
    vesselType: "Tanker",
    imo: "9456789",
    totalShares: 4200,
    availableShares: 5,
    pricePerShare: 200,
    description: "Crude oil tanker with double hull. Operating in Atlantic basin.",
    imageUrl:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&h=400&fit=crop",
    lastPayout: "2026-01-12",
    availableTokenIds: [100, 250, 400, 550, 700],
  },
  "4": {
    name: "Nordic Pioneer",
    vesselType: "General Cargo",
    imo: "9567890",
    totalShares: 1800,
    availableShares: 15,
    pricePerShare: 200,
    description: "Multi-purpose general cargo ship. Serves Baltic and North Sea ports.",
    imageUrl:
      "https://images.unsplash.com/photo-1504310574167-3c2d16e3d7d8?w=800&h=400&fit=crop",
    lastPayout: "2026-01-08",
    availableTokenIds: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150],
  },
  "5": {
    name: "Indian Ocean Star",
    vesselType: "Container Ship",
    imo: "9678901",
    totalShares: 6000,
    availableShares: 25,
    pricePerShare: 200,
    description: "Large container vessel on Far East–Europe service.",
    imageUrl:
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=800&h=400&fit=crop",
    lastPayout: "2026-01-14",
    availableTokenIds: Array.from({ length: 25 }, (_, i) => i + 1),
  },
};

export default async function ShipDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const ship = MOCK_SHIP[id];
  if (!ship) notFound();

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <Link
        href="/marketplace"
        className="mb-6 inline-flex items-center text-sm text-slate-600 hover:text-primary"
      >
        ← Back to Marketplace
      </Link>

      {/* Hero */}
      <div className="overflow-hidden rounded-lg bg-white shadow-sm">
        <img
          src={ship.imageUrl}
          alt={ship.name}
          className="h-64 w-full object-cover sm:h-80"
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{ship.name}</h1>
              <p className="mt-1 text-slate-600">{ship.vesselType}</p>
              {ship.imo && (
                <p className="mt-1 text-sm text-slate-500">IMO {ship.imo}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">Overview</h2>
            <p className="mt-4 text-slate-600">{ship.description}</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Available Shares
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Select an NFT to purchase at ${ship.pricePerShare} per share
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              {ship.availableTokenIds.map((tokenId) => (
                <button
                  key={tokenId}
                  type="button"
                  className="rounded-lg border-2 border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary"
                >
                  #{tokenId} — Buy $200
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Statistics</h3>
            <dl className="mt-4 space-y-3">
              <div>
                <dt className="text-sm text-slate-500">Total Shares</dt>
                <dd className="font-medium text-slate-900">
                  {ship.totalShares.toLocaleString()}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Available</dt>
                <dd className="font-medium text-slate-900">
                  {ship.availableShares}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Price per Share</dt>
                <dd className="font-medium text-slate-900">${ship.pricePerShare}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Total Value</dt>
                <dd className="font-medium text-slate-900">
                  ${(ship.totalShares * ship.pricePerShare).toLocaleString()}
                </dd>
              </div>
            </dl>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-slate-900">Yield</h3>
            <p className="mt-2 text-sm text-slate-600">
              Monthly distributions to NFT holders.
            </p>
            <p className="mt-2 text-sm text-slate-500">
              Last payout: {ship.lastPayout}
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
