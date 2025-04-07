import { Connection, PublicKey, TransactionInstruction, Transaction, Commitment, Cluster } from '@solana/web3.js';
import { DLMM } from '../dlmm';
import { BN } from '@coral-xyz/anchor';

// Simple sleep function for retry delays
export const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Error types for better error handling
 */
export class DLMMOperationError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message);
    this.name = 'DLMMOperationError';
  }
}

/**
 * Retries a function with exponential backoff
 * @param fn The function to retry
 * @param options Retry options
 * @returns The result of the function
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    onRetry = (attempt, error) => {
      console.warn(`Retry attempt ${attempt} after error: ${error.message}`);
    }
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt === maxRetries) {
        break;
      }

      const delay = Math.min(
        maxDelay,
        baseDelay * Math.pow(2, attempt) * (0.5 + Math.random() * 0.5)
      );

      onRetry(attempt + 1, lastError);
      await sleep(delay);
    }
  }

  throw new DLMMOperationError(`Operation failed after ${maxRetries} retries`, lastError);
}

/**
 * Safely creates a DLMM instance with retries
 * @param connection Solana connection
 * @param dlmmAddress DLMM address
 * @param options Options for DLMM creation
 * @returns DLMM instance
 */
export async function createDLMMSafely(
  connection: Connection, 
  dlmmAddress: PublicKey, 
  options?: {
    cluster?: Cluster | 'localhost';
    programId?: PublicKey;
    retryOptions?: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
    }
  }
): Promise<DLMM> {
  const { cluster, programId, retryOptions } = options || {};
  
  try {
    return await retry(
      () => DLMM.create(connection, dlmmAddress, { cluster, programId }),
      retryOptions
    );
  } catch (error) {
    throw new DLMMOperationError(
      `Failed to create DLMM instance for ${dlmmAddress.toString()}: ${error.message}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Safely get account info with retries
 * @param connection Solana connection
 * @param address Account address
 * @param commitment Commitment level
 * @returns Account info
 */
export async function getAccountInfoSafely(
  connection: Connection,
  address: PublicKey,
  commitment?: Commitment
) {
  try {
    return await retry(() => connection.getAccountInfo(address, commitment));
  } catch (error) {
    throw new DLMMOperationError(
      `Failed to get account info for ${address.toString()}: ${error.message}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Safely executes a swap with error handling and retries
 * @param dlmm DLMM instance 
 * @param params Swap parameters
 * @returns Transaction
 */
export async function swapSafely(
  dlmm: DLMM,
  params: {
    inToken: PublicKey;
    outToken: PublicKey;
    inAmount: BN;
    minOutAmount: BN;
    lbPair: PublicKey;
    user: PublicKey;
    binArraysPubkey: PublicKey[];
    retryOptions?: {
      maxRetries?: number;
      baseDelay?: number;
      maxDelay?: number;
    }
  }
): Promise<Transaction> {
  const { inToken, outToken, inAmount, minOutAmount, lbPair, user, binArraysPubkey, retryOptions } = params;
  
  try {
    // Make sure we have the latest state
    await retry(() => dlmm.refetchStates(), retryOptions);
    
    // Perform the swap with retries
    return await retry(
      () => dlmm.swap({
        inToken,
        outToken,
        inAmount,
        minOutAmount,
        lbPair,
        user,
        binArraysPubkey
      }),
      retryOptions
    );
  } catch (error) {
    throw new DLMMOperationError(
      `Swap operation failed: ${error.message}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Safely gets DLMM position with error handling and retries
 * @param dlmm DLMM instance
 * @param userPubKey User public key
 * @param retryOptions Retry options
 * @returns Position information
 */
export async function getPositionsSafely(
  dlmm: DLMM,
  userPubKey: PublicKey,
  retryOptions?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  }
) {
  try {
    return await retry(
      () => dlmm.getPositionsByUserAndLbPair(userPubKey),
      retryOptions
    );
  } catch (error) {
    throw new DLMMOperationError(
      `Failed to get positions for user ${userPubKey.toString()}: ${error.message}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Safely gets the active bin with error handling and retries
 * @param dlmm DLMM instance
 * @param retryOptions Retry options
 * @returns Active bin information
 */
export async function getActiveBinSafely(
  dlmm: DLMM,
  retryOptions?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
  }
) {
  try {
    return await retry(
      () => dlmm.getActiveBin(),
      retryOptions
    );
  } catch (error) {
    throw new DLMMOperationError(
      `Failed to get active bin: ${error.message}`,
      error instanceof Error ? error : undefined
    );
  }
} 