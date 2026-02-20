import Link from "next/link";
import { Card } from "@/components/ui/Card";

const MOCK_COLLECTIONS = [
  {
    id: "1",
    name: "MSC Aurora",
    vesselType: "Container Ship",
    totalShares: 5000,
    availableShares: 1200,
    pricePerShare: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=250&fit=crop",
  },
  {
    id: "2",
    name: "Pacific Navigator",
    vesselType: "Bulk Carrier",
    totalShares: 3200,
    availableShares: 800,
    pricePerShare: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1565880324317-9656a22a9d84?w=400&h=250&fit=crop",
  },
  {
    id: "3",
    name: "Atlantic Spirit",
    vesselType: "Tanker",
    totalShares: 4200,
    availableShares: 450,
    pricePerShare: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop",
  },
  {
    id: "4",
    name: "Nordic Pioneer",
    vesselType: "General Cargo",
    totalShares: 1800,
    availableShares: 1200,
    pricePerShare: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1504310574167-3c2d16e3d7d8?w=400&h=250&fit=crop",
  },
  {
    id: "5",
    name: "Indian Ocean Star",
    vesselType: "Container Ship",
    totalShares: 6000,
    availableShares: 2100,
    pricePerShare: 200,
    imageUrl:
      "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?w=400&h=250&fit=crop",
  },
];

export default function MarketplacePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">
        Vessel Collections
      </h1>
      <p className="mt-2 text-slate-600">
        Browse tokenized cargo vessels. Each share represents $200 of ownership.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_COLLECTIONS.map((collection) => (
          <Link key={collection.id} href={`/ships/${collection.id}`}>
            <Card className="overflow-hidden transition-shadow hover:shadow-md">
              <img
                src={collection.imageUrl}
                alt={collection.name}
                className="h-48 w-full object-cover"
              />
              <div className="p-5">
                <h3 className="font-semibold text-slate-900">{collection.name}</h3>
                <p className="mt-1 text-sm text-slate-500">
                  {collection.vesselType}
                </p>
                <div className="mt-4 flex justify-between text-sm">
                  <span className="text-slate-600">
                    {collection.totalShares.toLocaleString()} shares
                  </span>
                  <span className="font-medium text-slate-900">
                    ${collection.pricePerShare}/share
                  </span>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  {collection.availableShares.toLocaleString()} available
                </p>
                <span className="mt-4 inline-block text-sm font-medium text-primary">
                  View Collection →
                </span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
