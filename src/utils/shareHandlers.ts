import { calculateShares, updateUserShares } from "./shareAccounting";
import { appendToHistory, trackAutoCompound } from "./tracking";

const DEPOSIT_LOCK_HOURS = 7;
const COMPOUND_INTERVAL_MS = 60 * 60 * 1000; // 1 hour

async function incrementTotalDeposits(redis: any, key: string, value: number) {
  let currentValue = parseFloat((await redis.get(key)) || "0");
  currentValue += value;
  await redis.set(key, currentValue.toFixed(8));
}

export async function handleDepositAndCalculateShares(
  walletAddress: string,
  solAmount: number,
  poolState: {
    currentPrice: number;
    totalSOL: number;
    totalTokens: number;
  },
  redis: any
) {
  const solToKeep = solAmount;
  const tokensFromSwap = solToKeep * poolState.currentPrice;
  const swapFee = tokensFromSwap * 0.01; //1% swap fee
  const tokensReceived = tokensFromSwap - swapFee;

  const contributionValue = solToKeep + tokensReceived / poolState.currentPrice;
  const lpValueBefore =
    poolState.totalSOL + poolState.totalTokens / poolState.currentPrice;

  let totalSharePoints =
    parseFloat(await redis.get("pool:totalSharePoints")) || 0;

  const sharePoints = calculateShares(
    contributionValue,
    lpValueBefore,
    totalSharePoints
  );

  const totalSOL = poolState.totalSOL + solToKeep;
  const totalTokens = poolState.totalTokens + tokensReceived;
  const updatedSharePoints = totalSharePoints + sharePoints;

  const userKey = `user:${walletAddress}`;
  const userData = await redis.get(userKey);
  const user = userData ? JSON.parse(userData) : null;

  const oldShares = parseFloat(user?.sharePoints || "0");
  const oldDeposited = parseFloat(user?.totalDeposited || "0");
  const oldEntryPrice = parseFloat(user?.entryPrice || "0");

  const updatedUser = updateUserShares(
    oldShares,
    oldDeposited,
    oldEntryPrice,
    sharePoints,
    solAmount,
    poolState.currentPrice
  );

  const lockUntil = Date.now() + DEPOSIT_LOCK_HOURS * 60 * 60 * 1000;

  await redis.set(
    userKey,
    JSON.stringify({
      ...updatedUser,
      depositHistory: [
        ...(user?.depositHistory || []),
        {
          date: new Date().toISOString(),
          amount: solAmount,
          shares: sharePoints,
          entryPrice: poolState.currentPrice,
        },
      ],
      withdrawHistory: user?.withdrawHistory || [],
      lockUntil,
    })
  );

  await redis.set("pool:totalSOL", totalSOL.toFixed(8));
  await redis.set("pool:totalTokens", totalTokens.toFixed(8));
  await redis.set("pool:totalSharePoints", updatedSharePoints.toFixed(8));

  await incrementTotalDeposits(redis, "stats:totalDeposits", solAmount);

  return {
    shareData: {
      ...updatedUser,
      oldShares,
    },
    totalSOL,
    totalTokens,
    totalSharePoints: updatedSharePoints,
  };
}

export async function handleWithdrawal(
  walletAddress: string,
  sharesToWithdraw: number,
  poolState: {
    currentPrice: number;
    totalSOL: number;
    totalTokens: number;
  },
  redis: any
) {
  const userKey = `user:${walletAddress}`;
  const userData = await redis.get(userKey);
  if (!userData) throw new Error("User not found");

  const user = JSON.parse(userData);

  //   if (Date.now() < user.lockUntil) {
  //     return {
  //       error: "Withdrawal is locked for this user. Try again later.",
  //       withdrawalLocked: true,
  //     };
  //   }

  const userShares = parseFloat(user.sharePoints || "0");
  const totalSharePoints = parseFloat(
    (await redis.get("pool:totalSharePoints")) || "0"
  );

  if (sharesToWithdraw > userShares) {
    return { error: "Insufficient shares" };
  }

  const shareRatio = sharesToWithdraw / totalSharePoints;
  const grossSOL = poolState.totalSOL * shareRatio;
  const grossTokens = poolState.totalTokens * shareRatio;

  const feeSOL = grossSOL * 0.01;
  const feeTokens = grossTokens * 0.01;
  const netSOL = grossSOL - feeSOL;
  const netTokens = grossTokens - feeTokens;

  const newTotalSOL = poolState.totalSOL - grossSOL;
  const newTotalTokens = poolState.totalTokens - grossTokens;
  const newTotalShares = totalSharePoints - sharesToWithdraw;

  await redis.set("pool:totalSOL", newTotalSOL.toFixed(8));
  await redis.set("pool:totalTokens", newTotalTokens.toFixed(8));
  await redis.set("pool:totalSharePoints", newTotalShares.toFixed(8));

  const updatedShares = userShares - sharesToWithdraw;

  const updatedHistory = appendToHistory(user.withdrawHistory, {
    date: new Date().toISOString(),
    shares: sharesToWithdraw,
    receivedSOL: netSOL,
    receivedTokens: netTokens,
    fees: { sol: feeSOL, tokens: feeTokens },
  });

  await redis.set(
    userKey,
    JSON.stringify({
      ...user,
      sharePoints: updatedShares.toFixed(8),
      withdrawHistory: updatedHistory,
    })
  );

  await incrementTotalDeposits(redis, "stats:totalWithdrawals", netSOL);

  return {
    withdrawnShares: sharesToWithdraw,
    netSOL: netSOL.toFixed(8),
    netTokens: netTokens.toFixed(8),
    fees: {
      sol: feeSOL.toFixed(8),
      tokens: feeTokens.toFixed(8),
    },
    updatedPool: {
      totalSOL: newTotalSOL.toFixed(8),
      totalTokens: newTotalTokens.toFixed(8),
      totalSharePoints: newTotalShares.toFixed(8),
    },
    withdrawalLocked: false,
  };
}

export async function autoCompoundRewards(
  redis: any,
  rewardAmountSOL: number,
  rewardAmountTokens: number,
  currentPrice: number
) {
  const now = Date.now();
  const lastCompound = parseInt((await redis.get("stats:lastCompound")) || "0");
  if (now - lastCompound < COMPOUND_INTERVAL_MS) {
    throw new Error("Auto-compounding too frequently. Try again later.");
  }

  const totalSharePoints =
    parseFloat(await redis.get("pool:totalSharePoints")) || 0;
  if (totalSharePoints === 0) {
    throw new Error("No users in pool to distribute rewards.");
  }

  const solFee = rewardAmountSOL * 0.1;
  const tokenFee = rewardAmountTokens * 0.1;

  const compoundedSOL = rewardAmountSOL - solFee;
  const compoundedTokens = rewardAmountTokens - tokenFee;

  const oldSOL = parseFloat(await redis.get("pool:totalSOL")) || 0;
  const oldTokens = parseFloat(await redis.get("pool:totalTokens")) || 0;

  const newTotalSOL = oldSOL + compoundedSOL;
  const newTotalTokens = oldTokens + compoundedTokens;

  await redis.set("pool:totalSOL", newTotalSOL.toFixed(8));
  await redis.set("pool:totalTokens", newTotalTokens.toFixed(8));

  const oldFeeSOL = parseFloat(await redis.get("pool:feeSOL")) || 0;
  const oldFeeTokens = parseFloat(await redis.get("pool:feeTokens")) || 0;

  await redis.set("pool:feeSOL", (oldFeeSOL + solFee).toFixed(8));
  await redis.set("pool:feeTokens", (oldFeeTokens + tokenFee).toFixed(8));

  await redis.set("stats:lastCompound", now.toString());

  await incrementTotalDeposits(redis, "stats:compoundedSOL", compoundedSOL);
  await incrementTotalDeposits(
    redis,
    "stats:compoundedTokens",
    compoundedTokens
  );

  await trackAutoCompound(redis, compoundedSOL, compoundedTokens, currentPrice);

  return {
    compoundedSOL: compoundedSOL.toFixed(8),
    compoundedTokens: compoundedTokens.toFixed(8),
    solFee: solFee.toFixed(8),
    tokenFee: tokenFee.toFixed(8),
    totalSOL: newTotalSOL.toFixed(8),
    totalTokens: newTotalTokens.toFixed(8),
  };
}
