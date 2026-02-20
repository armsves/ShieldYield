export const CONTRACT_ADDRESSES = {
  paymentToken:
    process.env.NEXT_PUBLIC_PAYMENT_TOKEN ||
    "0x610178dA211FEF7D417bC0e6FeD39F05609AD788",
  marketplace:
    process.env.NEXT_PUBLIC_MARKETPLACE ||
    "0xA51c1fc2f0D1a1b8494Ed1FE312d7C3a78Ed91C0",
  yieldVault:
    process.env.NEXT_PUBLIC_YIELD_VAULT ||
    "0x0DCd1Bf9A1b36cE34237eEaFef220932846BCD82",
  factory:
    process.env.NEXT_PUBLIC_FACTORY ||
    "0x0B306BF915C4d645ff596e518fAf3F9669b97016",
} as const;

export const CHAIN_ID = 16602; // 0G Testnet
export const RPC_URL = "https://evmrpc-testnet.0g.ai";
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
