import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
              Fractional Maritime Ownership
            </h1>
            <p className="mt-6 text-lg text-slate-600">
              Tokenize cargo vessel investments into $200 shares. Earn yield from
              real-world shipping operations.
            </p>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link href="/marketplace">
                <Button size="lg">Explore Vessels</Button>
              </Link>
              <Link href="#how-it-works">
                <Button variant="outline" size="lg">
                  How It Works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Fractional Ownership
              </h3>
              <p className="mt-2 text-slate-600">
                Start with as little as $200. Own a share of real cargo vessels
                and participate in maritime returns.
              </p>
            </Card>
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                Yield Distribution
              </h3>
              <p className="mt-2 text-slate-600">
                Receive monthly payouts from vessel operations. Yield is
                distributed proportionally to NFT holders.
              </p>
            </Card>
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <svg
                  className="h-6 w-6 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                On-Chain Transparency
              </h3>
              <p className="mt-2 text-slate-600">
                Verified ownership on-chain. Every transaction and distribution
                is auditable and immutable.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-3xl font-bold text-slate-900">
            How It Works
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-600">
            Three simple steps to start earning from maritime assets.
          </p>
          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                1
              </div>
              <h3 className="font-semibold text-slate-900">Select a Vessel</h3>
              <p className="mt-2 text-slate-600">
                Browse tokenized cargo ships. Each vessel is divided into $200
                share NFTs.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                2
              </div>
              <h3 className="font-semibold text-slate-900">Purchase Shares</h3>
              <p className="mt-2 text-slate-600">
                Buy NFTs via the marketplace. Your ownership is recorded
                on-chain.
              </p>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
                3
              </div>
              <h3 className="font-semibold text-slate-900">Earn Yield</h3>
              <p className="mt-2 text-slate-600">
                Claim monthly distributions from the yield vault based on your
                holdings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Vessels */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900">
            Featured Vessels
          </h2>
          <p className="mt-4 text-slate-600">
            Explore our tokenized maritime assets.
          </p>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "MSC Aurora",
                type: "Container Ship",
                shares: 5000,
                available: 1200,
                image:
                  "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=250&fit=crop",
              },
              {
                name: "Pacific Navigator",
                type: "Bulk Carrier",
                shares: 3200,
                available: 800,
                image:
                  "https://images.unsplash.com/photo-1565880324317-9656a22a9d84?w=400&h=250&fit=crop",
              },
              {
                name: "Atlantic Spirit",
                type: "Tanker",
                shares: 4200,
                available: 450,
                image:
                  "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400&h=250&fit=crop",
              },
            ].map((ship) => (
              <Link key={ship.name} href="/marketplace">
                <Card className="overflow-hidden transition-shadow hover:shadow-md">
                  <img
                    src={ship.image}
                    alt={ship.name}
                    className="h-40 w-full object-cover"
                  />
                  <div className="p-4">
                    <h3 className="font-semibold text-slate-900">{ship.name}</h3>
                    <p className="mt-1 text-sm text-slate-500">{ship.type}</p>
                    <p className="mt-2 text-sm text-slate-600">
                      {ship.shares} shares · {ship.available} available
                    </p>
                    <span className="mt-3 inline-block text-sm font-medium text-primary">
                      View Collection →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link href="/marketplace">
              <Button size="lg">View All Vessels</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white">
            Start Investing Today
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-blue-100">
            Connect your wallet to browse vessels and purchase your first
            maritime share.
          </p>
          <div className="mt-8">
            <button
              type="button"
              className="rounded-lg border-2 border-white bg-white px-8 py-3 font-medium text-primary transition-colors hover:bg-blue-50"
            >
              Connect Wallet
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
