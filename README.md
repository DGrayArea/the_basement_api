# DLMM SDK (Dynamic Liquidity Market Making)

A robust Solana SDK for interacting with Dynamic Liquidity Market Making pools, providing decentralized exchange (DEX) functionality with concentrated liquidity features.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Error Handling](#error-handling)
- [Configuration](#configuration)
- [API Reference](#api-reference)
- [Examples](#examples)
- [Contributing](#contributing)
- [License](#license)

## Installation

```bash
# NPM
npm install @meteora-ag/dlmm

# Yarn
yarn add @meteora-ag/dlmm

# PNPM
pnpm add @meteora-ag/dlmm
```

## Quick Start

```typescript
import { Connection, PublicKey } from "@solana/web3.js";
import { DLMM } from "@meteora-ag/dlmm";
import BN from "bn.js";

// Initialize connection
const connection = new Connection("https://api.mainnet-beta.solana.com", "confirmed");

// Create DLMM instance from an existing pool
const dlmmPool = await DLMM.create(
  connection, 
  new PublicKey("your_pool_address_here"),
  { cluster: "mainnet-beta" }
);

// Get active bin information
const activeBin = await dlmmPool.getActiveBin();
console.log(`Active bin ID: ${activeBin.binId}, Price: ${activeBin.price}`);

// Get swap quote
const binArrays = await dlmmPool.getBinArrayForSwap(false);
const swapAmount = new BN(1000000); // 1 USDC with 6 decimals
const swapQuote = dlmmPool.swapQuote(
  swapAmount,       // Input amount
  false,            // swap for Y: false = X→Y, true = Y→X
  new BN(10),       // Slippage in BPS (0.1%)
  binArrays
);

console.log(`Input amount: ${swapAmount.toString()}`);
console.log(`Expected output: ${swapQuote.outAmount.toString()}`);
console.log(`Price impact: ${swapQuote.priceImpact}%`);
```

## Error Handling

The SDK includes enhanced error handling capabilities through utility functions that provide retries and detailed error information:

```typescript
import { 
  createDLMMSafely, 
  getActiveBinSafely, 
  DLMMOperationError 
} from "@meteora-ag/dlmm";

try {
  // Create DLMM instance with automatic retries
  const dlmmPool = await createDLMMSafely(connection, poolAddress, {
    cluster: "devnet",
    retryOptions: {
      maxRetries: 3,
      baseDelay: 1000
    }
  });

  // Get active bin with automatic retries
  const activeBin = await getActiveBinSafely(dlmmPool);
  console.log(`Active bin: ${activeBin.binId}`);
  
} catch (error) {
  if (error instanceof DLMMOperationError) {
    console.error(`Operation failed: ${error.message}`);
    if (error.cause) {
      console.error(`Root cause: ${error.cause.message}`);
    }
  }
}
```

## Configuration

The SDK supports different Solana networks:

```typescript
// Mainnet Beta
const dlmmPool = await DLMM.create(connection, poolAddress, { 
  cluster: "mainnet-beta" 
});

// Devnet
const dlmmPool = await DLMM.create(connection, poolAddress, { 
  cluster: "devnet" 
});

// Custom program ID
const dlmmPool = await DLMM.create(connection, poolAddress, { 
  programId: new PublicKey("your_custom_program_id") 
});
```

## API Reference

### Static functions

| Function                      | Description                                                                        | Return                               |
| ----------------------------- | ---------------------------------------------------------------------------------- | ------------------------------------ |
| `create`                      | Given the DLMM address, create an instance to access the state and functions       | `Promise<DLMM>`                      |
| `createMultiple`              | Given a list of DLMM addresses, create instances to access the state and functions | `Promise<Array<DLMM>>`               |
| `getAllPresetParameters`      | Get all the preset params (use to create DLMM pool)                                | `Promise<PresetParams>`              |
| `createPermissionLbPair`      | Create DLMM Pool                                                                   | `Promise<Transaction>`               |
| `getClaimableLMReward`        | Get Claimable LM reward for a position                                             | `Promise<LMRewards>`                 |
| `getClaimableSwapFee`         | Get Claimable Swap Fee for a position                                              | `Promise<SwapFee>`                   |
| `getAllLbPairPositionsByUser` | Get user's all positions for all DLMM pools                                        | `Promise<Map<string, PositionInfo>>` |

### DLMM instance functions

| Function                                      | Description                                                                                                                   | Return                                                                                             |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `refetchStates`                               | Update onchain state of DLMM instance. It's recommend to call this before interact with the program (Deposit/ Withdraw/ Swap) | `Promise<void>`                                                                                    |
| `getBinArrays`                                | Retrieves List of Bin Arrays                                                                                                  | `Promise<BinArrayAccount[]>`                                                                       |
| `getBinArrayForSwap`                          | Retrieves List of Bin Arrays for swap purpose                                                                                 | `Promise<BinArrayAccount[]>`                                                                       |
| `getFeeInfo`                                  | Retrieves LbPair's fee info including `base fee`, `protocol fee` & `max fee`                                                  | `FeeInfo`                                                                                          |
| `getDynamicFee`                               | Retrieves LbPair's dynamic fee                                                                                                | `Decimal`                                                                                          |
| `getBinsAroundActiveBin`                      | retrieves a specified number of bins to the left and right of the active bin and returns them along with the active bin ID.   | `Promise<{ activeBin: number; bins: BinLiquidity[] }>`                                             |
| `getBinsBetweenMinAndMaxPrice`                | Retrieves a list of bins within a specified price                                                                             | `Promise<{ activeBin: number; bins: BinLiquidity[] }>`                                             |
| `getBinsBetweenLowerAndUpperBound`            | retrieves a list of bins between a lower and upper bin ID and returns the active bin ID and the list of bins.                 | `Promise<{ activeBin: number; bins: BinLiquidity[] }>`                                             |
| `toPricePerLamport`                           | Converts a real price of bin to lamport price                                                                                 | `string`                                                                                           |
| `fromPricePerLamport`                         | converts a price per lamport value to a real price of bin                                                                     | `string`                                                                                           |
| `getActiveBin`                                | Retrieves the active bin ID and its corresponding price                                                                       | `Promise<{ binId: number; price: string }>`                                                        |
| `getPriceOfBinByBinId`                        | Get the price of a bin based on its bin ID                                                                                    | `string`                                                                                           |
| `getBinIdFromPrice`                           | get bin ID based on a given price and a boolean flag indicating whether to round down or up.                                  | `number`                                                                                           |
| `getPositionsByUserAndLbPair`                 | Retrieves positions by user and LB pair, including active bin and user positions.                                             | `Promise<{ activeBin: { binId: any; price: string; }; userPositions: Array<Position>;}>`           |
| `initializePositionAndAddLiquidityByStrategy` | Initializes a position and adds liquidity                                                                                     | `Promise<Transaction\|Transaction[]>`                                                              |
| `addLiquidityByStrategy`                      | Add liquidity to existing position                                                                                            | `Promise<Transaction\|Transaction[]>`                                                              |
| `removeLiquidity`                             | function is used to remove liquidity from a position, with the option to claim rewards and close the position.                | `Promise<Transaction\|Transaction[]>`                                                              |
| `closePosition`                               | Closes a position                                                                                                             | `Promise<Transaction\|Transaction[]>`                                                              |
| `swapQuote`                                   | Quote for a swap                                                                                                              | `SwapQuote`                                                                                        |
| `swap`                                        | Swap token within the LbPair                                                                                                  | `Promise<Transaction>`                                                                             |
| `claimLMReward`                               | Claim rewards for a specific position owned by a specific owner                                                               | `Promise<Transaction>`                                                                             |
| `claimAllLMRewards`                           | Claim all liquidity mining rewards for a given owner and their positions.                                                     | `Promise<Transaction[]>`                                                                           |
| `claimSwapFee`                                | Claim swap fees for a specific position owned by a specific owner                                                             | `Promise<Transaction>`                                                                             |
| `claimAllSwapFee`                             | Claim swap fees for multiple positions owned by a specific owner                                                              | `Promise<Transaction>`                                                                             |
| `claimAllRewards`                             | Claim swap fees and LM rewards for multiple positions owned by a specific owner                                               | `Promise<Transaction[]>`                                                                           |
| `syncWithMarketPrice`                         | Sync the pool current active bin to match nearest market price bin                                                            | `Promise<Transaction>`                                                                             |
| `getPairPubkeyIfExists`                       | Get existing pool address given parameter, if not return null                                                                 | `Promise<PublicKey                                                                       \| null>` |
| `getMaxPriceInBinArrays`                      | Get max price of the last bin that has liquidity given bin arrays                                                             | `Promise<string                                                                       \| null>`    |

## Examples

Look at the examples directory for more usage examples:

- `src/examples/example.ts` - Comprehensive example showing different operations
- `src/examples/swap_quote.ts` - Example of getting a swap quote
- `src/examples/safe_operations.ts` - Example using the enhanced error handling utilities
- `src/examples/fetch_lb_pair_lock_info.ts` - Example of fetching pair lock information

To run an example:

```bash
# First, install dependencies
npm install

# Create a .env file with your configuration
# See .env.example for required variables

# Run an example
npm run example

# Or run a specific example
npx ts-node src/examples/swap_quote.ts
```

## Error Handling Best Practices

When working with the DLMM SDK, follow these best practices for error handling:

1. **Use Safe Operation Wrappers**:
   The SDK provides safe operation wrappers that automatically implement retries and proper error handling. Use these when possible:
   ```typescript
   import { createDLMMSafely, swapSafely } from "@meteora-ag/dlmm";
   
   // Instead of DLMM.create, use:
   const dlmm = await createDLMMSafely(connection, poolAddress, options);
   ```

2. **Update Pool State Before Operations**:
   Always update the pool state before performing operations to ensure you have the latest data:
   ```typescript
   await dlmm.refetchStates();
   ```

3. **Implement Try/Catch Blocks**:
   Wrap operations in try/catch blocks to handle errors gracefully:
   ```typescript
   try {
     // DLMM operations
   } catch (error) {
     if (error instanceof DLMMOperationError) {
       // Handle SDK-specific errors
     } else {
       // Handle other errors
     }
   }
   ```

4. **Set Appropriate Slippage**:
   When performing swaps or adding liquidity, set appropriate slippage values to account for price movements:
   ```typescript
   const allowedSlippage = new BN(50); // 0.5% slippage
   ```

5. **Handle Connection Errors**:
   Be prepared for RPC connection issues by implementing proper retry logic:
   ```typescript
   const options = {
     retryOptions: {
       maxRetries: 3,
       baseDelay: 1000,
       maxDelay: 10000
     }
   };
   ```

## Development Setup

To set up the project for development:

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dlmm-sdk
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the required configuration:
   ```
   RPC=https://api.devnet.solana.com
   USER_PRIVATE_KEY=your_private_key_here
   ```

4. Build the project:
   ```bash
   npm run build
   ```

5. Run tests:
   ```bash
   npm test
   ```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

ISC
