import { Connection, Commitment, ConnectionConfig } from '@solana/web3.js';

// Simple sleep function since it's not exported from dlmm/helpers
const sleep = (ms: number): Promise<void> => new Promise(resolve => setTimeout(resolve, ms));

// Custom error types
export class RPCError extends Error {
  public readonly code: number;
  public readonly originalError: any;

  constructor(message: string, code: number, originalError?: any) {
    super(message);
    this.name = 'RPCError';
    this.code = code;
    this.originalError = originalError;
  }
}

export class TransactionError extends Error {
  public readonly txId?: string;
  public readonly logs?: string[];
  public readonly originalError: any;

  constructor(message: string, txId?: string, logs?: string[], originalError?: any) {
    super(message);
    this.name = 'TransactionError';
    this.txId = txId;
    this.logs = logs;
    this.originalError = originalError;
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

// Retry logic for RPC calls
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    shouldRetry?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any) => void;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    shouldRetry = (error) => {
      // Retry on connection errors or rate limit errors
      if (error instanceof RPCError) {
        return error.code === 429 || // Rate limit
          error.code === 503 || // Service unavailable
          error.code === 504; // Gateway timeout
      }
      return false;
    },
    onRetry = (attempt, error) => {
      console.warn(`Retry attempt ${attempt} after error: ${error.message}`);
    }
  } = options;

  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      attempt++;
      if (attempt > maxRetries || !shouldRetry(error)) {
        throw error;
      }

      // Exponential backoff with jitter
      const delay = Math.min(
        maxDelay,
        baseDelay * Math.pow(2, attempt - 1) * (0.5 + Math.random() * 0.5)
      );

      onRetry(attempt, error);
      await sleep(delay);
    }
  }
}

// Helper to handle RPC responses and standardize errors
export function handleRPCResponse<T>(response: any): T {
  if (response?.jsonrpc !== '2.0') {
    throw new RPCError('Invalid RPC response format', 400, response);
  }

  if (response.error) {
    throw new RPCError(
      response.error.message || 'Unknown RPC error',
      response.error.code || 500,
      response
    );
  }

  return response.result;
}

// Connection wrapper with retry logic
export class ConnectionWithRetry {
  private connection: Connection;

  constructor(endpoint: string, commitment?: Commitment | ConnectionConfig) {
    this.connection = new Connection(endpoint, commitment);
  }

  async getAccountInfo(address: any, commitment?: any) {
    return withRetry(() => this.connection.getAccountInfo(address, commitment));
  }

  async getMultipleAccountsInfo(addresses: any[], commitment?: any) {
    return withRetry(() => 
      this.connection.getMultipleAccountsInfo(addresses, commitment)
    );
  }

  async sendTransaction(transaction: any, signers: any[], options?: any) {
    return withRetry(() => 
      this.connection.sendTransaction(transaction, signers, options)
    );
  }

  async confirmTransaction(signature: string, commitment?: any) {
    return withRetry(() => 
      this.connection.confirmTransaction(signature, commitment)
    );
  }

  // Forward other methods to the original connection
  get rpcEndpoint() {
    return this.connection.rpcEndpoint;
  }

  get commitment() {
    return this.connection.commitment;
  }

  // Add any other methods you commonly use from Connection
}

// Utility function to log errors
export function logError(error: any, context: string = '') {
  if (error instanceof RPCError) {
    console.error(`[${context}] RPC Error (${error.code}): ${error.message}`);
  } else if (error instanceof TransactionError) {
    console.error(`[${context}] Transaction Error: ${error.message}`);
    if (error.txId) {
      console.error(`Transaction ID: ${error.txId}`);
    }
    if (error.logs && error.logs.length > 0) {
      console.error('Logs:', error.logs.join('\n'));
    }
  } else {
    console.error(`[${context}] Error:`, error);
  }
} 