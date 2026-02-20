"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Logo - Left */}
        <Link
          href="/"
          className="flex items-center gap-2 text-slate-900 transition-opacity hover:opacity-80"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="white"
              className="h-5 w-5"
            >
              <path d="M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z" />
            </svg>
          </div>
          <span className="hidden font-semibold sm:inline">Ship</span>
        </Link>

        {/* Brand + Links - Center */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-8">
          <Link
            href="/"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            ShipYield
          </Link>
          <div className="hidden items-center gap-6 md:flex">
            <Link
              href="/marketplace"
              className="text-sm font-medium text-slate-600 hover:text-primary"
            >
              Marketplace
            </Link>
            <Link
              href="/create"
              className="text-sm font-medium text-slate-600 hover:text-primary"
            >
              Create
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-slate-600 hover:text-primary"
            >
              Dashboard
            </Link>
            <Link
              href="/claims"
              className="text-sm font-medium text-slate-600 hover:text-primary"
            >
              Claims
            </Link>
          </div>
        </div>

        {/* Wallet - Right */}
        <div className="flex items-center gap-4">
          <button
            type="button"
            className="rounded-lg border-2 border-primary bg-primary px-5 py-2 text-sm font-medium text-white transition-colors hover:bg-[#0d47b8]"
          >
            Connect Wallet
          </button>
        </div>
      </nav>
    </header>
  );
}
