import { Connection, PublicKey } from "@solana/web3.js";
import { config } from "dotenv";
import { DLMM } from "../../dlmm";
import {
  addLiquidityToExistingPosition,
  getActiveBin,
  getPositionsState,
  removeSinglePositionLiquidity,
} from "../../examples/example";
import { handleDepositAndCalculateShares } from "../shareHandlers";
import { TransactionState } from "../../types";

config();

export async function processStakeTransaction(
  txId: string,
  params: any,
  poolId: PublicKey,
  redisClient: any
) {
  try {
    const connection = new Connection(
      process.env.RPC || "https://api.devnet.solana.com",
      {
        commitment: "confirmed",
      }
    );
    const dlmmPool = await DLMM.create(connection, poolId, {
      cluster: "devnet",
    });

    const activeBin = await getActiveBin(dlmmPool);
    const position = await getPositionsState(dlmmPool);

    const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
      Number(activeBin.price)
    );

    if (!activeBin) {
      throw new Error("No active bin found");
    }
    if (!position || position.length === 0) {
      throw new Error("No positions found");
    }

    const positionData = position[0].positionData;
    const totalXAmount =
      parseFloat(positionData.totalXAmount) / Math.pow(10, 6);
    const totalYAmount =
      parseFloat(positionData.totalYAmount) / Math.pow(10, 9);

    const poolState = {
      currentPrice: Number(activeBinPricePerToken),
      totalSOL: totalYAmount,
      totalTokens: totalXAmount,
    };

    const amount = Number(params.amount) / 2;

    const stakeResponse = await addLiquidityToExistingPosition(
      dlmmPool,
      {
        amount: amount,
        decimals: Number(params.decimals),
      },
      activeBin,
      position[0]
    );

    if (typeof stakeResponse === "object" && stakeResponse.error) {
      throw new Error(stakeResponse.error);
    }

    const shares = await handleDepositAndCalculateShares(
      params.userPublicKey,
      amount,
      poolState,
      redisClient
    );

    const txState: TransactionState = {
      txId,
      status: "completed",
      type: "stake",
      params,
      result: {
        stakeTx: stakeResponse,
        shares,
      },
      createdAt: JSON.parse(await redisClient.get(`tx:${txId}`)).createdAt,
      updatedAt: Date.now(),
    };

    await redisClient.set(`tx:${txId}`, JSON.stringify(txState));

    // Set expiry for the transaction data (3 days)
    await redisClient.expire(`tx:${txId}`, 60 * 60 * 24 * 3);
  } catch (error) {
    console.error(`Error processing stake transaction ${txId}:`, error);

    // Update transaction state with error
    const txData = await redisClient.get(`tx:${txId}`);
    if (txData) {
      const txState = JSON.parse(txData) as TransactionState;
      txState.status = "failed";
      txState.error = error.message;
      txState.updatedAt = Date.now();

      await redisClient.set(`tx:${txId}`, JSON.stringify(txState));

      // Set expiry for the transaction data (1 day for errors)
      await redisClient.expire(`tx:${txId}`, 60 * 60 * 24);
    }
  }
}

export async function processUnstakeTransaction(
  txId: string,
  params: any,
  poolId: PublicKey,
  redisClient: any
) {
  try {
    const connection = new Connection(
      process.env.RPC || "https://api.devnet.solana.com",
      {
        commitment: "confirmed",
      }
    );
    const dlmmPool = await DLMM.create(connection, poolId, {
      cluster: "devnet",
    });

    const { userPublicKey, unstakePercentage } = params;

    const amountPercentage = Number(unstakePercentage);

    if (amountPercentage <= 0 || amountPercentage > 100) {
      throw new Error("Invalid unstake percentage");
    }

    const activeBin = await getActiveBin(dlmmPool);
    const position = await getPositionsState(dlmmPool);

    if (!activeBin) {
      throw new Error("No active bin found");
    }
    if (!position || position.length === 0) {
      throw new Error("No positions found");
    }

    const positionData = position[0].positionData;
    const totalXAmount =
      parseFloat(positionData.totalXAmount) / Math.pow(10, 6);
    const totalYAmount =
      parseFloat(positionData.totalYAmount) / Math.pow(10, 9);

    const poolState = {
      totalSOL: totalXAmount,
      totalTokens: totalYAmount,
      poolId,
    };

    // Fetch user data
    const userKey = `user:${userPublicKey}`;
    const userData = await redisClient.get(userKey);
    if (!userData) {
      throw new Error("User not found");
    }

    const user = JSON.parse(userData);
    const userShares = parseFloat(user.sharePoints || "0");
    const totalSharePoints =
      parseFloat(await redisClient.get("pool:totalSharePoints")) || 0;

    if (totalSharePoints === 0) {
      throw new Error("No shares in the pool");
    }

    // Calculate user's ownership percentage in the pool
    const userOwnershipPct = userShares / totalSharePoints;

    // Calculate the effective withdrawal percentage relative to the pool
    const effectiveWithdrawalPct = (userOwnershipPct * amountPercentage) / 100;

    // Calculate withdrawal amounts
    const withdrawSOL = poolState.totalSOL * effectiveWithdrawalPct;
    const withdrawTokens = poolState.totalTokens * effectiveWithdrawalPct;

    // Update user shares
    const sharesToWithdraw = (userShares * amountPercentage) / 100;
    const remainingShares = userShares - sharesToWithdraw;
    user.sharePoints = remainingShares;
    await redisClient.set(userKey, JSON.stringify(user));

    // Call `removeSinglePositionLiquidity` with the effective percentage
    const unstakeResponse = await removeSinglePositionLiquidity(
      dlmmPool,
      position,
      position[0].publicKey,
      effectiveWithdrawalPct * 100 // Convert to percentage
    );

    if (!Array.isArray(unstakeResponse) && unstakeResponse.error) {
      throw new Error(unstakeResponse.error);
    }

    // Update transaction state in Redis
    const txState: TransactionState = {
      txId,
      status: "completed",
      type: "unstake",
      params,
      result: {
        unstakeResponse: unstakeResponse[0],
        withdrawSOL: withdrawSOL.toFixed(8),
        withdrawTokens: withdrawTokens.toFixed(8),
        remainingShares: remainingShares.toFixed(8),
      },
      createdAt: JSON.parse(await redisClient.get(`tx:${txId}`)).createdAt,
      updatedAt: Date.now(),
    };

    await redisClient.set(`tx:${txId}`, JSON.stringify(txState));

    // Set expiry for the transaction data (3 days)
    await redisClient.expire(`tx:${txId}`, 60 * 60 * 24 * 3);
  } catch (error) {
    console.error(`Error processing unstake transaction ${txId}:`, error);

    // Update transaction state with error
    const txData = await redisClient.get(`tx:${txId}`);
    if (txData) {
      const txState = JSON.parse(txData) as TransactionState;
      txState.status = "failed";
      txState.error = error.message;
      txState.updatedAt = Date.now();

      await redisClient.set(`tx:${txId}`, JSON.stringify(txState));

      // Set expiry for the transaction data (1 day for errors)
      await redisClient.expire(`tx:${txId}`, 60 * 60 * 24);
    }
  }
}
