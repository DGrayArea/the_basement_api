import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
} from "@solana/web3.js";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { DLMM } from "../dlmm";
import BN from "bn.js";
import { BinLiquidity, LbPosition, StrategyType } from "../dlmm/types";
import { config } from "dotenv";
import { autoFillYByStrategy } from "../dlmm/helpers";

config();

export const user = Keypair.fromSecretKey(
  new Uint8Array(bs58.decode(process.env.USER_PRIVATE_KEY))
);
const RPC = process.env.RPC || "https://api.devnet.solana.com";
const connection = new Connection(RPC, "finalized");

const poolAddress = new PublicKey(
  "3amFSaAuShi4q7597yr8hvGC44Nck9zvGaT3HPToWHJq"
  //WSOL & USDC LB Pair on Devnet 3amFSaAuShi4q7597yr8hvGC44Nck9zvGaT3HPToWHJq
  //Meteora testing LB Pair on Devnet 3W2HKgUa96Z69zzG3LK1g8KdcRAWzAttiLiHfYnKuPw5
);

/** Utils */
export interface ParsedClockState {
  info: {
    epoch: number;
    epochStartTimestamp: number;
    leaderScheduleEpoch: number;
    slot: number;
    unixTimestamp: number;
  };
  type: string;
  program: string;
  space: number;
}

let activeBin: BinLiquidity;
let userPositions: LbPosition[] = [];

const newBalancePosition = new Keypair();
const newImbalancePosition = new Keypair();
const newOneSidePosition = new Keypair();

export async function getActiveBin(dlmmPool: DLMM) {
  // Get pool state
  activeBin = await dlmmPool.getActiveBin();
  // console.log("🚀 ~ activeBin:", activeBin);
  return activeBin;
}

// To create a balance deposit position
export async function createBalancePosition(
  dlmmPool: DLMM,
  baseMint: { amount: number; decimals: number }
) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
  // console.log("🚀 ~ minBinId:", minBinId, "🚀 ~ maxBinId:", maxBinId);
  // const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
  //   Number(activeBin.price)
  // );
  const totalXAmount = new BN(baseMint.amount * 10 ** baseMint.decimals);
  const totalYAmount = autoFillYByStrategy(
    activeBin.binId,
    dlmmPool.lbPair.binStep,
    totalXAmount,
    activeBin.xAmount,
    activeBin.yAmount,
    minBinId,
    maxBinId,
    StrategyType.Spot // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
  );

  // Create Position
  const createPositionTx =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: newBalancePosition.publicKey,
      user: user.publicKey,
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType: StrategyType.Spot,
      },
    });

  try {
    const createBalancePositionTxHash = await sendAndConfirmTransaction(
      connection,
      createPositionTx,
      [user, newBalancePosition]
    );
    console.log(
      "🚀 ~ createBalancePositionTxHash:",
      createBalancePositionTxHash
    );
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  }
}

export async function createImbalancePosition(
  dlmmPool: DLMM,
  baseMint: { amount: number; decimals: number }
) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

  const totalXAmount = new BN(100 * 10 ** baseMint.decimals);
  const totalYAmount = new BN(0.5 * 10 ** 9); // SOL

  // Create Position
  const createPositionTx =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: newImbalancePosition.publicKey,
      user: user.publicKey,
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType: StrategyType.Spot,
      },
    });

  try {
    const createImbalancePositionTxHash = await sendAndConfirmTransaction(
      connection,
      createPositionTx,
      [user, newImbalancePosition]
    );
    console.log(
      "🚀 ~ createImbalancePositionTxHash:",
      createImbalancePositionTxHash
    );
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  }
}

export async function createOneSidePosition(
  dlmmPool: DLMM,
  baseMint: { amount: number; decimals: number }
) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL * 2;

  const totalXAmount = new BN(100 * 10 ** baseMint.decimals);
  const totalYAmount = new BN(0);
  // Create Position
  const createPositionTx =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
      positionPubKey: newOneSidePosition.publicKey,
      user: user.publicKey,
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType: StrategyType.Spot,
      },
    });

  try {
    const createOneSidePositionTxHash = await sendAndConfirmTransaction(
      connection,
      createPositionTx,
      [user, newOneSidePosition]
    );
    console.log(
      "🚀 ~ createOneSidePositionTxHash:",
      createOneSidePositionTxHash
    );
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  }
}

export async function getPositionsState(dlmmPool: DLMM) {
  // Get position state
  const positionsState = await dlmmPool.getPositionsByUserAndLbPair(
    user.publicKey
  );

  userPositions = positionsState.userPositions;
  return userPositions;
}

export async function addLiquidityToExistingPosition(
  dlmmPool: DLMM,
  baseMint: { amount: number; decimals: number },
  activeBinL: BinLiquidity,
  position: LbPosition,
  rangeInterval: number = 10
) {
  const TOTAL_RANGE_INTERVAL = rangeInterval; // 10 bins on each side of the active bin
  // const minBinId = activeBinL.binId - TOTAL_RANGE_INTERVAL;
  // const maxBinId = activeBinL.binId + TOTAL_RANGE_INTERVAL;
  const minBinId = position.positionData.lowerBinId;
  const maxBinId = position.positionData.upperBinId;

  const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    Number(activeBinL.price)
  );
  const totalXAmount = new BN(baseMint.amount * 10 ** baseMint.decimals);
  const totalYAmount = autoFillYByStrategy(
    activeBinL.binId,
    dlmmPool.lbPair.binStep,
    totalXAmount,
    activeBinL.xAmount,
    activeBinL.yAmount,
    minBinId,
    maxBinId,
    StrategyType.Spot // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
  );
  // console.log(
  //   minBinId,
  //   maxBinId,
  //   activeBinPricePerToken,
  //   parseFloat(totalXAmount.toString()),
  //   parseFloat(totalYAmount.toString())
  // );
  // Add Liquidity to existing position
  const addLiquidityTx = await dlmmPool.addLiquidityByStrategy({
    positionPubKey: position.publicKey,
    user: user.publicKey,
    totalXAmount,
    totalYAmount,
    strategy: {
      maxBinId,
      minBinId,
      strategyType: StrategyType.Spot, // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
    },
  });

  try {
    const addLiquidityTxHash = await sendAndConfirmTransaction(
      connection,
      addLiquidityTx,
      [user],
      { skipPreflight: false, preflightCommitment: "confirmed" }
    );
    // console.log("🚀 ~ addLiquidityTxHash:", addLiquidityTxHash);
    return addLiquidityTxHash;
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    return { error: error };
  }
}

export async function removePositionLiquidity(
  dlmmPool: DLMM,
  userPositionsF: LbPosition[]
) {
  // Remove Liquidity
  const removeLiquidityTxs = (
    await Promise.all(
      userPositionsF.map(({ publicKey, positionData }) => {
        const binIdsToRemove = positionData.positionBinData.map(
          (bin) => bin.binId
        );
        return dlmmPool.removeLiquidity({
          position: publicKey,
          user: user.publicKey,
          fromBinId: binIdsToRemove[0],
          toBinId: binIdsToRemove[binIdsToRemove.length - 1],
          bps: new BN(100 * 100),
          shouldClaimAndClose: false, // should claim swap fee and close position together
        });
      })
    )
  ).flat();

  const txHashes: string[] = [];

  try {
    for (let tx of removeLiquidityTxs) {
      const removeBalanceLiquidityTxHash = await sendAndConfirmTransaction(
        connection,
        tx,
        [user],
        { skipPreflight: false, preflightCommitment: "confirmed" }
      );
      // console.log(
      //   "🚀 ~ removeBalanceLiquidityTxHash:",
      //   removeBalanceLiquidityTxHash
      // );
      txHashes.push(removeBalanceLiquidityTxHash); // Collect the hash
    }
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  }
  // console.log("🚀 ~ removeBalanceLiquidityTxHashs:", txHashes);
  return txHashes;
}

export async function removeSinglePositionLiquidity(
  dlmmPool: DLMM,
  userPositionsF: LbPosition[],
  position: PublicKey,
  amountInPercent: number = 1 // 100% (range from 0 to 1)
) {
  const userPosition = userPositionsF.find(({ publicKey }) =>
    publicKey.equals(position)
  );
  // Remove Liquidity
  const binIdsToRemove = userPosition.positionData.positionBinData.map(
    (bin) => bin.binId
  );
  const removeLiquidityTx = await dlmmPool.removeLiquidity({
    position: userPosition.publicKey,
    user: user.publicKey,
    fromBinId: binIdsToRemove[0],
    toBinId: binIdsToRemove[binIdsToRemove.length - 1],
    bps: new BN(amountInPercent * 100), // 100% (range from 0 to 100)
    shouldClaimAndClose: false, // should claim swap fee and close position together
  });

  const txHashes: string[] = []; // Array to store transaction hashes

  try {
    if (Array.isArray(removeLiquidityTx)) {
      // If it's an array of transactions, loop through and send each one
      for (const tx of removeLiquidityTx) {
        const removeBalanceLiquidityTxHash = await sendAndConfirmTransaction(
          connection,
          tx,
          [user],
          { skipPreflight: false, preflightCommitment: "confirmed" }
        );
        // console.log(
        //   "🚀 ~ removeBalanceLiquidityTxHash:",
        //   removeBalanceLiquidityTxHash
        // );
        txHashes.push(removeBalanceLiquidityTxHash);
      }
    } else {
      // If it's a single transaction, send it directly
      const removeBalanceLiquidityTxHash = await sendAndConfirmTransaction(
        connection,
        removeLiquidityTx,
        [user],
        { skipPreflight: false, preflightCommitment: "confirmed" }
      );
      // console.log(
      //   "🚀 ~ removeBalanceLiquidityTxHash:",
      //   removeBalanceLiquidityTxHash
      // );
      txHashes.push(removeBalanceLiquidityTxHash);
    }
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    return { error: error };
  }

  return txHashes;
}

export async function swap(dlmmPool: DLMM) {
  const swapAmount = new BN(0.1 * 10 ** 9);
  // Swap quote
  const swapYtoX = true;
  const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);

  const swapQuote = await dlmmPool.swapQuote(
    swapAmount,
    swapYtoX,
    new BN(1),
    binArrays
  );

  // Swap
  const swapTx = await dlmmPool.swap({
    inToken: dlmmPool.tokenX.publicKey,
    binArraysPubkey: swapQuote.binArraysPubkey,
    inAmount: swapAmount,
    lbPair: dlmmPool.pubkey,
    user: user.publicKey,
    minOutAmount: swapQuote.minOutAmount,
    outToken: dlmmPool.tokenY.publicKey,
  });

  try {
    const swapTxHash = await sendAndConfirmTransaction(connection, swapTx, [
      user,
    ]);
    return swapTxHash;
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    return { error: error };
  }
}

async function claimFee(dlmmPool: DLMM, position: LbPosition) {
  const claimFeeTx = await dlmmPool.claimSwapFee({
    owner: user.publicKey,
    position: position,
  });

  try {
    const claimFeeTxHash = await sendAndConfirmTransaction(
      connection,
      claimFeeTx,
      [user],
      { skipPreflight: false, preflightCommitment: "confirmed" }
    );
    return claimFeeTxHash;
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    return { error: error };
  }
}

async function main() {
  const dlmmPool = await DLMM.create(connection, poolAddress, {
    cluster: "devnet",
  });

  const activeBin = await getActiveBin(dlmmPool);
  // console.log("🚀 ~ activeBin:", activeBin);
  // await swap(dlmmPool);
  // await createBalancePosition(dlmmPool);
  // await createImbalancePosition(dlmmPool);
  // await createOneSidePosition(dlmmPool);
  const positions = await getPositionsState(dlmmPool);
  // console.log("🚀 ~ positions:", positions);
  // const adddHash = await addLiquidityToExistingPosition(
  //   dlmmPool,
  //   {
  //     amount: 1,
  //     decimals: 6,
  //   },
  //   activeBin,
  //   positions[0]
  // );
  // console.log("🚀 ~ addHash:", adddHash);
  // const claimTx = await claimFee(dlmmPool, positions[0]);
  // console.log("🚀 ~ claimTx:", claimTx);
  // const removeHash = await removeSinglePositionLiquidity(
  //   dlmmPool,
  //   positions,
  //   positions[0].publicKey,
  //   2
  // );
  // console.log("🚀 ~ removeHash:", removeHash[0]);
  // await removePositionLiquidity(dlmmPool);
}

// main();
