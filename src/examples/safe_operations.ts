import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { config } from "dotenv";
import { DLMM } from "../dlmm";
import { retry, DLMMOperationError, sleep } from "../utils/safeOperations";

// Load environment variables
config();

/**
 * Safely creates a DLMM instance with retry capability
 */
async function createDLMMWithRetry(
  connection: Connection,
  poolAddress: PublicKey,
  options: {
    cluster?: string;
    maxRetries?: number;
    baseDelay?: number;
  } = {}
) {
  const { cluster = "devnet", maxRetries = 3, baseDelay = 1000 } = options;
  
  try {
    return await retry(
      () => DLMM.create(connection, poolAddress, { cluster: cluster as any }),
      { maxRetries, baseDelay }
    );
  } catch (error) {
    throw new DLMMOperationError(
      `Failed to create DLMM instance for ${poolAddress.toString()}: ${error.message}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Safely gets the active bin with retry capability
 */
async function getActiveBinWithRetry(
  dlmm: DLMM,
  options: {
    maxRetries?: number;
    baseDelay?: number;
  } = {}
) {
  const { maxRetries = 3, baseDelay = 1000 } = options;
  
  try {
    return await retry(() => dlmm.getActiveBin(), { maxRetries, baseDelay });
  } catch (error) {
    throw new DLMMOperationError(
      `Failed to get active bin: ${error.message}`,
      error instanceof Error ? error : undefined
    );
  }
}

/**
 * Example showing how to use safe operations with proper error handling
 */
async function main() {
  // Setup
  const RPC = process.env.RPC || "https://api.devnet.solana.com";
  console.log(`Connecting to ${RPC}...`);
  const connection = new Connection(RPC, "confirmed");
  
  // Use pool address from environment or default
  const poolAddress = new PublicKey(
    process.env.POOL_ADDRESS || "3amFSaAuShi4q7597yr8hvGC44Nck9zvGaT3HPToWHJq" // Example WSOL & USDC LB Pair on Devnet
  );

  try {
    console.log(`Creating DLMM instance for pool ${poolAddress.toString()} with retries...`);
    
    // Create DLMM instance with retry capabilities
    const dlmmPool = await createDLMMWithRetry(connection, poolAddress, {
      cluster: "devnet",
      maxRetries: 3,
      baseDelay: 1000
    });
    
    console.log(`Successfully created DLMM instance`);
    console.log(`Token X: ${dlmmPool.tokenX.publicKey.toString()}`);
    console.log(`Token Y: ${dlmmPool.tokenY.publicKey.toString()}`);
    
    // Get active bin with retry capabilities
    console.log(`Getting active bin with retries...`);
    const activeBin = await getActiveBinWithRetry(dlmmPool, {
      maxRetries: 3,
      baseDelay: 1000
    });
    
    console.log(`Active bin: ${activeBin.binId}, Price: ${activeBin.price}`);
    
    // Demonstrate error handling with an invalid pool address
    try {
      console.log(`\nTrying with invalid pool address to demonstrate error handling...`);
      const invalidPool = new PublicKey("8JsvQtwcwUMKgYJ2DQhC1pzX8ukYhJ2oAGDYYjvHPVz1");
      await createDLMMWithRetry(connection, invalidPool, {
        cluster: "devnet",
        maxRetries: 2,
        baseDelay: 500
      });
    } catch (error) {
      // Display enhanced error information
      if (error instanceof DLMMOperationError) {
        console.error(`\nError demonstration: ${error.message}`);
        if (error.cause) {
          console.error(`Cause: ${error.cause.message}`);
        }
      } else {
        console.error(`\nUnexpected error:`, error);
      }
    }
  } catch (error) {
    // Handle any other errors
    if (error instanceof DLMMOperationError) {
      console.error(`Error: ${error.message}`);
      if (error.cause) {
        console.error(`Cause: ${error.cause.message}`);
      }
    } else {
      console.error(`Unexpected error:`, error);
    }
  }
}

// Run the example
main()
  .then(() => console.log("Example completed"))
  .catch(err => console.error("Error running example:", err)); 