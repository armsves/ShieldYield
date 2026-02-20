# ShipYield

Maritime asset tokenization platform. Cargo ships are represented as NFT collections, divided into $200 fractional shares. Holders receive monthly yield distributions claimable from a dedicated yield contract.

## Repository Structure

```
ShipYield/
├── contracts/       # Solidity contracts (Foundry)
├── script/          # Deploy scripts
├── test/            # Contract tests
├── frontend/        # Next.js app
└── lib/             # forge-std
```

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

### Redeploy Factory Only

After a ShipNFT change (e.g. `_safeMint` → `_mint` fix):

**Step 1** — Deploy new Factory (any account):
```bash
# .env: MARKETPLACE_ADDRESS, YIELD_VAULT_ADDRESS

forge script script/DeployFactoryOnly.s.sol:DeployFactoryOnlyScript \
  --rpc-url $RPC_URL --broadcast \
  --priority-gas-price 2000000000 --with-gas-price 30000000000
```

**Step 2** — Vault **owner** sets the new factory (use the key that deployed the vault):
```bash
# .env: PRIVATE_KEY = vault owner's key
export NEW_FACTORY=0x3879441B57eF716578efD5E36130BEFe95740417  # from Step 1

forge script script/SetVaultFactory.s.sol:SetVaultFactoryScript \
  --rpc-url $RPC_URL --broadcast \
  --sig "run(address,address)" $YIELD_VAULT_ADDRESS $NEW_FACTORY
```

Then update `NEXT_PUBLIC_FACTORY` in `frontend/.env`.

### Deposit Yield (Treasury)

Yield appears only after the treasury deposits USDC. The deployer is the initial treasury. To add test yield:

```bash
# .env: PRIVATE_KEY (treasury wallet), YIELD_VAULT_ADDRESS, FACTORY_ADDRESS, PAYMENT_TOKEN
export COLLECTION_ID=0          # Which collection (0, 1, 2...)
export DEPOSIT_AMOUNT=1000000000  # 1000 USDC (6 decimals)

forge script script/DepositYield.s.sol:DepositYieldScript \
  --rpc-url $RPC_URL --broadcast
```

The treasury wallet needs USDC balance (e.g. from mock mint at deploy).

### Integration (MetaMask)

- **Buy**: `marketplace.buy(collection, tokenId)` — requires `paymentToken.approve(marketplace, 200e6)` first.
- **Claim**: `yieldVault.claim(collection)` — sends accrued yield to caller.

## Frontend

```bash
cd frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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

