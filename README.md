# ShipYield

Maritime asset tokenization platform. Cargo ships are represented as NFT collections, divided into $200 fractional shares. Holders receive monthly yield distributions claimable from a dedicated yield contract.

## Smart Contracts (Foundry)

Located in `contracts/`:

| Contract | Purpose |
|---------|---------|
| `ShipNFT` | ERC721 per vessel; each token = 1 share ($200) |
| `ShipYieldMarketplace` | Fixed-price ($200) buy/sell in payment token (USDC) |
| `YieldVault` | Treasury deposits; NFT holders claim proportionally |
| `ShipCollectionFactory` | Deploys collections, mints to marketplace |

### Build & Test

```bash
# Install Foundry if needed: curl -L https://foundry.paradigm.xyz | bash && foundryup
forge build
forge test
```

### Deploy

1. Deploy or obtain a payment token (USDC 6 decimals). For local test, deploy `MockERC20`.
2. Create `.env` from `.env.example`:

```bash
PRIVATE_KEY=...
PAYMENT_TOKEN=0x...  # Your test token address
```

3. Run:

```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --verify
```

### Integration (MetaMask)

- **Buy**: `marketplace.buy(collection, tokenId)` — requires `paymentToken.approve(marketplace, 200e6)` first.
- **Claim**: `yieldVault.claim(collection)` — sends accrued yield to caller.

## Design

See [DESIGN.md](./DESIGN.md) for the full design specification.

## Pages

- **Landing** (`/`) — Professional introduction to maritime tokenization
- **Collection Creation** (`/create`) — Admin interface for tokenizing ships into $200 shares
- **Marketplace** (`/marketplace`) — Browse vessel collections
- **Collection Details** (`/ships/[id]`) — View ship data and purchase shares
- **Dashboard** (`/dashboard`) — Portfolio management
- **Yield Claims** (`/claims`) — Claim monthly earnings

## Design System

- Primary: `#1155d4`
- Background: `bg-slate-50`
- Font: Inter

## Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
