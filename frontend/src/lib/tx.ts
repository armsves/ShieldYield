import type { TransactionResponse } from "ethers";
import { EXPLORER_URL } from "./contracts";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function isReceiptRpcError(err: unknown): boolean {
  const s = err instanceof Error ? err.message : String(err);
  const data = err && typeof err === "object" && "data" in err ? (err as { data?: unknown }).data : null;
  const dataStr = data && typeof data === "object" && "message" in data ? String((data as { message?: string }).message) : "";
  return (
    s.includes("no matching receipts") ||
    s.includes("data corruption") ||
    s.includes("UNKNOWN_ERROR") ||
    s.includes("-32603") ||
    s.includes("-32000") ||
    dataStr.includes("no matching receipts")
  );
}

/**
 * Wait for tx confirmation with retry on ADI testnet RPC receipt errors.
 * When the RPC fails to find a receipt (sync/indexing issue), retries a few times.
 * On final failure, throws with a message including the block explorer link.
 */
export async function waitForTx(tx: TransactionResponse): Promise<Awaited<ReturnType<TransactionResponse["wait"]>>> {
  const hash = tx.hash;
  const explorerLink = `${EXPLORER_URL}/tx/${hash}`;
  const maxAttempts = 3;
  let lastError: unknown = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const receipt = await tx.wait();
      return receipt as Awaited<ReturnType<TransactionResponse["wait"]>>;
    } catch (err) {
      lastError = err;
      if (attempt < maxAttempts && isReceiptRpcError(err)) {
        await sleep(2000 * attempt);
        continue;
      }
      if (isReceiptRpcError(err)) {
        throw new Error(
          `Transaction was sent but the RPC could not confirm the receipt (ADI testnet sync issue). Check status: ${explorerLink}`
        );
      }
      throw err;
    }
  }
  throw lastError;
}
