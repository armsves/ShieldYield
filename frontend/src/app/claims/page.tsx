import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const MOCK_CLAIMS = [
  {
    id: "1",
    name: "MSC Aurora",
    shares: 3,
    claimable: 12.5,
    imageUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=120&h=80&fit=crop",
  },
  {
    id: "2",
    name: "Pacific Navigator",
    shares: 2,
    claimable: 8.2,
    imageUrl:
      "https://images.unsplash.com/photo-1565880324317-9656a22a9d84?w=120&h=80&fit=crop",
  },
];

export default function ClaimsPage() {
  const totalClaimable = MOCK_CLAIMS.reduce((s, c) => s + c.claimable, 0);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Yield Claims</h1>
      <p className="mt-2 text-slate-600">
        Claim your monthly earnings from vessel operations.
      </p>

      {/* Total */}
      <Card className="mt-8 p-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Total Claimable
            </p>
            <p className="mt-1 text-3xl font-bold text-primary">
              ${totalClaimable.toFixed(2)}
            </p>
          </div>
          <Button size="lg" disabled={totalClaimable === 0}>
            Claim All
          </Button>
        </div>
      </Card>

      {/* Per-Collection Claims */}
      <div className="mt-8 space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">
          By Collection
        </h2>
        {MOCK_CLAIMS.map((claim) => (
          <Card key={claim.id} className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <img
                  src={claim.imageUrl}
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
              <div className="flex items-center justify-between sm:gap-8">
                <div className="text-right">
                  <p className="text-sm text-slate-500">Claimable</p>
                  <p className="font-semibold text-primary">
                    ${claim.claimable.toFixed(2)}
                  </p>
                </div>
                <Button size="sm">Claim</Button>
              </div>
            </div>
          </Card>
        ))}
        {MOCK_CLAIMS.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-slate-600">No claimable yield.</p>
            <p className="mt-2 text-sm text-slate-500">
              Hold vessel shares to receive monthly distributions.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
