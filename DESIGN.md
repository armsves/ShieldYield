# ShipYield — Design Specification

## Product Overview

**ShipYield** is a maritime asset tokenization platform. Cargo ships are represented as NFT collections, divided into $200 fractional shares. Holders receive monthly yield distributions claimable from a dedicated yield contract.

---

## Design System

### Tokens (Tailwind)

| Token | Value | Usage |
|-------|-------|--------|
| Primary | `#1155d4` | CTAs, links, accents, brand |
| Background | `bg-slate-50` (`#f8fafc`) | Page background |
| Text Primary | `text-slate-900` (`#0f172a`) | Headings, body |
| Text Secondary | `text-slate-500` (`#64748b`) | Captions, labels |
| Border Radius | `rounded-lg` (8px) | Cards, buttons, inputs |
| Font | Inter, sans-serif | All text |

### CSS Variables

```css
:root {
  --primary: #1155d4;
  --bg-main: #f8fafc;
  --text-primary: #0f172a;
  --text-secondary: #64748b;
  --border-radius: 0.5rem;
}

body {
  font-family: 'Inter', sans-serif;
  background-color: var(--bg-main);
  color: var(--text-primary);
}
```

### Component Styling

- **Buttons**: Primary `bg-[#1155d4]`, hover `bg-[#0d47b8]`, `rounded-lg`, `px-6 py-2.5`
- **Cards**: `bg-white`, `rounded-lg`, `shadow-sm`, `border border-slate-200`
- **Inputs**: `border-slate-300`, `rounded-lg`, `focus:ring-2 focus:ring-[#1155d4]`

---

## Information Architecture

```
/
├── /                    → Landing
├── /create              → Collection Creation (admin)
├── /marketplace         → NFT Marketplace
├── /ships/[id]          → Collection Details (single ship)
├── /dashboard           → User Portfolio
└── /claims              → Yield Claims
```

---

## Page Specifications

### 1. Layout (Global)

#### Navbar
- **Left**: Logo (anchor to `/`)
- **Center**: "ShipYield" brand name
- **Right**: Wallet connection button (Connect Wallet / truncated address)
- Height: ~64px
- Background: `white`, border-bottom `border-slate-200`

#### Footer
- Project name: ShipYield
- Copyright: © 2026 ShipYield. All rights reserved.
- Centered, minimal, `text-slate-500`

---

### 2. Landing Page (`/`)

**Purpose**: Professional introduction to maritime tokenization.

**Sections**:
1. **Hero**
   - Headline: "Fractional Maritime Ownership"
   - Subheadline: Tokenize cargo vessel investments into $200 shares. Earn yield from real-world shipping operations.
   - Primary CTA: "Explore Vessels"
   - Secondary CTA: "How It Works"

2. **Value Props** (3 cards)
   - Fractional Ownership: $200 minimum investment
   - Yield Distribution: Monthly payouts to NFT holders
   - On-Chain Transparency: Verified ownership, auditable

3. **How It Works** (3 steps)
   - Select a Vessel → Purchase Shares → Earn Yield

4. **Featured Vessels** (preview cards)
   - 2–3 ship cards, link to marketplace

5. **CTA Strip**
   - "Start Investing Today" with Connect Wallet

---

### 3. Collection Creation (`/create`)

**Purpose**: Admin interface to tokenize ships into $200 shares.

**Access**: Admin-only (wallet allowlist or role check).

**Form Fields**:
- Ship name
- IMO number (optional)
- Vessel type ( dropdown: Container, Bulk Carrier, Tanker, etc. )
- Ship price (USD) — primary input
- Shares: **auto-calculated** = `floor(price / 200)`
- Description
- Ship image URL (or upload placeholder)
- Treasury address (for yield deposits)

**Actions**:
- "Create Collection" → deploys collection contract, mints NFTs, lists on marketplace

**Validation**:
- Price ≥ 200
- All required fields filled

---

### 4. NFT Marketplace (`/marketplace`)

**Purpose**: Browse all vessel collections.

**Layout**:
- Page title: "Vessel Collections"
- Grid of collection cards (responsive: 1 / 2 / 3 cols)
- Each card:
  - Ship image
  - Ship name
  - Total shares / price
  - Available shares
  - "View Collection" CTA

**Filters** (optional): Vessel type, availability

---

### 5. Collection Details (`/ships/[id]`)

**Purpose**: Data-rich view of a single ship; users purchase available shares.

**Content**:
- Hero: Ship image, name, type
- Stats: Total shares, available, price per share ($200), total value
- Ship info: IMO, description, specs
- **Available NFTs**: Grid of minted NFTs (token IDs) that are for sale
- Per NFT: token ID, "Buy Share" button
- Yield info: Monthly distribution schedule, last payout

**Actions**:
- "Buy Share" → purchase flow (wallet required)

---

### 6. User Dashboard (`/dashboard`)

**Purpose**: Portfolio management; requires wallet connection.

**Content**:
- Connected wallet summary
- **My Holdings**: List of NFT collections owned
  - Per collection: ship name, # of shares, current value, yield accrued
- Total portfolio value
- Quick link to Yield Claims

---

### 7. Yield Claims (`/claims`)

**Purpose**: Claim monthly yield for held NFTs; requires wallet connection.

**Content**:
- Per collection with claimable yield:
  - Ship name
  - Shares held
  - Claimable amount (USD / USDC)
  - "Claim" button
- Aggregate: Total claimable
- Claim history (optional table)

**Flow**:
- User clicks Claim → tx to yield contract → funds sent to wallet

---

## Data Models

### Ship Collection
- `id`: string
- `name`: string
- `imo`: string?
- `vesselType`: string
- `price`: number (USD)
- `shareCount`: number (price / 200)
- `imageUrl`: string
- `description`: string
- `treasuryAddress`: string
- `collectionAddress`: string (contract)
- `yieldContractAddress`: string

### NFT (Share)
- `tokenId`: number
- `collectionId`: string
- `owner`: string (or marketplace)
- `price`: 200 (fixed)
- `forSale`: boolean

### User Position
- `collectionId`: string
- `tokenIds`: number[]
- `shareCount`: number
- `claimableYield`: number

---

## Smart Contract Architecture (High-Level)

1. **ShipCollection**: ERC721 collection per ship. `totalSupply` = shares. Mint all on creation.
2. **Marketplace**: List/buy NFTs. Fixed price $200 per share.
3. **YieldVault**: Holds yield deposits from treasury. `claim(collectionId)` distributes to NFT holders proportionally.

---

## User Flows

### Admin: Create Ship
1. Go to `/create`
2. Fill form (price auto-calculates shares)
3. Submit → deploy + mint → list on marketplace

### User: Buy Share
1. Browse `/marketplace`
2. Open collection `/ships/[id]`
3. Select available NFT → Buy Share → confirm tx

### User: Claim Yield
1. Go to `/claims`
2. See claimable per collection
3. Click Claim → tx → receive funds

---

## Responsive Breakpoints

- Mobile: &lt; 640px
- Tablet: 640–1024px
- Desktop: &gt; 1024px

---

## File Structure (Frontend)

```
frontend/src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Landing
│   ├── create/page.tsx       # Collection creation
│   ├── marketplace/page.tsx
│   ├── ships/[id]/page.tsx
│   ├── dashboard/page.tsx
│   └── claims/page.tsx
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── ui/                   # Reusable UI
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── Input.tsx
│   └── sections/             # Page sections
│       ├── Hero.tsx
│       ├── ShipCard.tsx
│       └── ...
└── lib/
    └── constants.ts          # Design tokens, chain config
```
