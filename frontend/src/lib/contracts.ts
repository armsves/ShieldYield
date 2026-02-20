export const CONTRACT_ADDRESSES = {
  paymentToken:
    process.env.NEXT_PUBLIC_PAYMENT_TOKEN ||
    "0x76fD47F23f2D765D644B402BA7C8Cdd69312ed9B",
  marketplace:
    process.env.NEXT_PUBLIC_MARKETPLACE ||
    "0x2e03B3AD8D1cD3AdD5a9fc3156DaCAA24635C177",
  yieldVault:
    process.env.NEXT_PUBLIC_YIELD_VAULT ||
    "0x56b20638B23A4E372AeAAdE24948561f83e68A9A",
  factory:
    process.env.NEXT_PUBLIC_FACTORY ||
    "0xD9A687Ce7Dc2690972f86848cb6A3f7a5D5f58f6",
} as const;

export const CHAIN_ID = 16602; // 0G Testnet
export const RPC_URL = "https://evmrpc-testnet.0g.ai";
export const EXPLORER_URL = "https://chainscan-galileo.0g.ai";
export const SHARE_PRICE = BigInt(200) * BigInt(10 ** 6); // 200e6 USDC decimals

// Minimal ABIs for the functions we use
export const FACTORY_ABI = [
  "function collectionCount() view returns (uint256)",
  "function collections(uint256) view returns (address nft, string name, uint256 shareCount)",
  "function createCollection(string name, string symbol, string baseURI, uint256 shipPriceUsd) returns (address nft, uint256 id)",
] as const;

export const MARKETPLACE_ABI = [
  "function sharePrice() view returns (uint256)",
  "function isListed(address collection, uint256 tokenId) view returns (bool)",
  "function buy(address collection, uint256 tokenId)",
] as const;

export const YIELD_VAULT_ABI = [
  "function pendingReward(address collection, address user) view returns (uint256)",
  "function claim(address collection)",
] as const;

export const ERC721_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function totalSupply() view returns (uint256)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function approve(address to, uint256 tokenId)",
  "function setApprovalForAll(address operator, bool approved)",
] as const;

export const ERC20_ABI = [
  "function balanceOf(address account) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function approve(address spender, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
] as const;

/** MockERC20 faucet - only available when using mock USDC on testnet */
export const MOCK_ERC20_ABI = [
  ...ERC20_ABI,
  "function mint(address to, uint256 amount)",
] as const;

export const FAUCET_AMOUNT = BigInt(1000) * BigInt(10 ** 6); // 1000 USDC
