import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

const MOCK_HOLDINGS = [
  {
    id: "1",
    name: "MSC Aurora",
    shares: 3,
    value: 600,
    yieldAccrued: 12.5,
    imageUrl:
      "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=200&h=120&fit=crop",
  },
  {
    id: "2",
    name: "Pacific Navigator",
    shares: 2,
    value: 400,
    yieldAccrued: 8.2,
    imageUrl:
      "https://images.unsplash.com/photo-1565880324317-9656a22a9d84?w=200&h=120&fit=crop",
  },
];

export default function DashboardPage() {
  const totalValue = MOCK_HOLDINGS.reduce((s, h) => s + h.value, 0);
  const totalYield = MOCK_HOLDINGS.reduce((s, h) => s + h.yieldAccrued, 0);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold text-slate-900">Portfolio</h1>
      <p className="mt-2 text-slate-600">
        Manage your maritime investments and track yield.
      </p>

      {/* Summary Cards */}
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
              {MOCK_HOLDINGS.length}
            </p>
          </div>
          <Link href="/claims">
            <Button size="sm">Claim Yield</Button>
          </Link>
        </Card>
      </div>

      {/* Holdings */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-slate-900">My Holdings</h2>
        <div className="mt-6 space-y-6">
          {MOCK_HOLDINGS.map((holding) => (
            <Card key={holding.id} className="overflow-hidden">
              <div className="flex flex-col sm:flex-row">
                <img
                  src={holding.imageUrl}
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
                      Yield accrued: ${holding.yieldAccrued.toFixed(2)}
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
        {MOCK_HOLDINGS.length === 0 && (
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
