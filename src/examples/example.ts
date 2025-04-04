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
export async function createBalancePosition(dlmmPool: DLMM) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
  // console.log("🚀 ~ minBinId:", minBinId, "🚀 ~ maxBinId:", maxBinId);
  const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    Number(activeBin.price)
  );
  const totalXAmount = new BN(10000000);
  const totalYAmount = totalXAmount.mul(new BN(Number(activeBinPricePerToken)));
  console.log(totalXAmount, totalYAmount, Number(activeBinPricePerToken));
  // new BN(100000000);
  // Create Position
  // const createPositionTx =
  //   await dlmmPool.initializePositionAndAddLiquidityByStrategy({
  //     positionPubKey: newBalancePosition.publicKey,
  //     user: user.publicKey,
  //     totalXAmount,
  //     totalYAmount,
  //     strategy: {
  //       maxBinId,
  //       minBinId,
  //       strategyType: StrategyType.Spot,
  //     },
  //   });

  // try {
  //   const createBalancePositionTxHash = await sendAndConfirmTransaction(
  //     connection,
  //     createPositionTx,
  //     [user, newBalancePosition]
  //   );
  //   console.log(
  //     "🚀 ~ createBalancePositionTxHash:",
  //     createBalancePositionTxHash
  //   );
  // } catch (error) {
  //   console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  // }
}

export async function createImbalancePosition(dlmmPool: DLMM) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

  const totalXAmount = new BN(100);
  const totalYAmount = new BN(50);

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

export async function createOneSidePosition(dlmmPool: DLMM) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL * 2;

  const totalXAmount = new BN(100);
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
  console.log("🚀 ~ userPositions:", userPositions);
}

export async function addLiquidityToExistingPosition(dlmmPool: DLMM) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

  const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    Number(activeBin.price)
  );
  const totalXAmount = new BN(100);
  const totalYAmount = totalXAmount.mul(new BN(Number(activeBinPricePerToken)));

  // Add Liquidity to existing position
  const addLiquidityTx = await dlmmPool.addLiquidityByStrategy({
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
    const addLiquidityTxHash = await sendAndConfirmTransaction(
      connection,
      addLiquidityTx,
      [user]
    );
    console.log("🚀 ~ addLiquidityTxHash:", addLiquidityTxHash);
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  }
}

export async function removePositionLiquidity(dlmmPool: DLMM) {
  // Remove Liquidity
  const removeLiquidityTxs = (
    await Promise.all(
      userPositions.map(({ publicKey, positionData }) => {
        const binIdsToRemove = positionData.positionBinData.map(
          (bin) => bin.binId
        );
        return dlmmPool.removeLiquidity({
          position: publicKey,
          user: user.publicKey,
          fromBinId: binIdsToRemove[0],
          toBinId: binIdsToRemove[binIdsToRemove.length - 1],
          bps: new BN(100 * 100),
          shouldClaimAndClose: true, // should claim swap fee and close position together
        });
      })
    )
  ).flat();

  try {
    for (let tx of removeLiquidityTxs) {
      const removeBalanceLiquidityTxHash = await sendAndConfirmTransaction(
        connection,
        tx,
        [user],
        { skipPreflight: false, preflightCommitment: "confirmed" }
      );
      console.log(
        "🚀 ~ removeBalanceLiquidityTxHash:",
        removeBalanceLiquidityTxHash
      );
    }
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  }
}

export async function swap(dlmmPool: DLMM) {
  //1000000 = 1
  const swapAmount = new BN(100000);
  // Swap quote
  const swapYtoX = false;
  const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);

  const swapQuote = await dlmmPool.swapQuote(
    swapAmount,
    swapYtoX,
    new BN(10),
    binArrays
  );
  // console.log(dlmmPool.tokenX.publicKey, dlmmPool.tokenY.publicKey);
  // console.log("🚀 ~ swapQuote:", swapQuote);

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
    console.log("🚀 ~ swapTxHash:", swapTxHash);
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
  }
}

async function main() {
  const dlmmPool = await DLMM.create(connection, poolAddress, {
    cluster: "devnet",
  });

  await getActiveBin(dlmmPool);
  // await swap(dlmmPool);
  // await createBalancePosition(dlmmPool);
  // await createImbalancePosition(dlmmPool);
  // await createOneSidePosition(dlmmPool);
  // await getPositionsState(dlmmPool);
  // await addLiquidityToExistingPosition(dlmmPool);
  // await removePositionLiquidity(dlmmPool);
}

main();
