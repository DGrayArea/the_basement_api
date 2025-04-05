export async function handleDepositAndCalculateShares(
  walletAddress: string,
  solAmount: number,
  poolState: {
    currentPrice: number;
    totalSOL: number;
    totalTokens: number;
    poolId: string; // required
  },
  redis: any
) {
  const solToKeep = solAmount * 0.5;
  const solToSwap = solAmount * 0.5;

  // 🔄 Swap half the SOL into tokens (minus fee)
  const tokensFromSwap = solToSwap * poolState.currentPrice;
  const swapFee = tokensFromSwap * 0.003;
  const tokensReceived = tokensFromSwap - swapFee;

  // 🧮 Calculate value contribution
  const contributionValue = solToKeep + tokensReceived / poolState.currentPrice;

  const lpValueBefore =
    poolState.totalSOL + poolState.totalTokens / poolState.currentPrice;

  let totalSharePoints =
    parseFloat(await redis.get("pool:totalSharePoints")) || 0;

  let sharePoints = 0;
  if (totalSharePoints === 0 || lpValueBefore === 0) {
    sharePoints = contributionValue;
  } else {
    sharePoints = (contributionValue / lpValueBefore) * totalSharePoints;
  }

  // ✅ Update pool state
  const totalSOL = poolState.totalSOL + solToKeep;
  const totalTokens = poolState.totalTokens + tokensReceived;
  const updatedSharePoints = totalSharePoints + sharePoints;

  // 💾 Persist pool state
  await redis.set("pool:totalSOL", totalSOL.toFixed(8));
  await redis.set("pool:totalTokens", totalTokens.toFixed(8));
  await redis.set("pool:totalSharePoints", updatedSharePoints.toFixed(8));

  // 🔢 Track total deposited in SOL
  const userKey = `deposited:${walletAddress}:${poolState.poolId}`;
  const poolKey = `deposited:${poolState.poolId}`;
  await redis.incrbyfloat(userKey, solAmount);
  await redis.incrbyfloat(poolKey, solAmount);

  // 🧾 Record user share updates
  const shareData = await recordUserShares(
    walletAddress,
    {
      sharePoints,
      entryPrice: poolState.currentPrice,
      deposited: solAmount,
      solToSwap,
      solKept: solToKeep,
      tokensReceived,
      swapFee,
      contributionValue,
    },
    redis
  );

  return {
    shareData,
    totalSOL,
    totalTokens,
    totalSharePoints: updatedSharePoints,
  };
}

export const recordUserShares = async (
  walletAddress: string,
  {
    sharePoints,
    entryPrice,
    deposited,
    solToSwap,
    solKept,
    tokensReceived,
    swapFee,
    contributionValue,
  }: {
    sharePoints: number;
    entryPrice: number;
    deposited: number;
    solToSwap: number;
    solKept: number;
    tokensReceived: number;
    swapFee: number;
    contributionValue: number;
  },
  redis: any
) => {
  const userKey = `user:${walletAddress}`;
  const exists = await redis.exists(userKey);

  const depositEntry = {
    date: new Date().toISOString(),
    amount: deposited,
    shares: sharePoints,
    entryPrice,
    solToSwap,
    solKept,
    tokensReceived,
    swapFee,
    contributionValue,
  };

  if (exists) {
    const userData = await redis.get(userKey);
    const user = JSON.parse(userData);

    const oldShares = parseFloat(user.sharePoints || "0");
    const oldDeposited = parseFloat(user.totalDeposited || "0");
    const oldEntryPrice = parseFloat(user.entryPrice || "0");

    const newShareTotal = oldShares + sharePoints;
    const newDepositTotal = oldDeposited + deposited;

    const weightedEntryPrice =
      (oldEntryPrice * oldShares + entryPrice * sharePoints) / newShareTotal;

    const oldHistory = Array.isArray(user.depositHistory)
      ? user.depositHistory
      : (() => {
          try {
            return JSON.parse(user.depositHistory || "[]");
          } catch {
            return [];
          }
        })();

    const updatedUser = {
      sharePoints: newShareTotal.toFixed(8),
      totalDeposited: newDepositTotal.toFixed(8),
      entryPrice: weightedEntryPrice.toFixed(8),
      depositHistory: [...oldHistory, depositEntry],
    };

    await redis.set(userKey, JSON.stringify(updatedUser));

    return {
      ...updatedUser,
      oldShares,
    };
  } else {
    const newUser = {
      sharePoints: sharePoints.toFixed(8),
      totalDeposited: deposited.toFixed(8),
      entryPrice: entryPrice.toFixed(8),
      depositHistory: [depositEntry],
    };

    await redis.set(userKey, JSON.stringify(newUser));

    return {
      ...newUser,
      oldShares: 0,
    };
  }
};

export async function handleWithdrawal(
  walletAddress: string,
  sharesToWithdraw: number,
  poolState: {
    currentPrice: number;
    totalSOL: number;
    totalTokens: number;
    poolId: string; // ← Added if not already
  },
  redis: any
) {
  const userKey = `user:${walletAddress}`;
  const userData = await redis.get(userKey);
  if (!userData) throw new Error("User not found");

  const user = JSON.parse(userData);
  const userShares = parseFloat(user.sharePoints || "0");
  const totalSharePoints = parseFloat(
    (await redis.get("pool:totalSharePoints")) || "0"
  );

  if (sharesToWithdraw > userShares) {
    throw new Error("Insufficient shares");
  }

  const shareRatio = sharesToWithdraw / totalSharePoints;

  // Gross amounts before fee
  const grossSOL = poolState.totalSOL * shareRatio;
  const grossTokens = poolState.totalTokens * shareRatio;

  // Apply 1% fee on each
  const feeSOL = grossSOL * 0.01;
  const feeTokens = grossTokens * 0.01;
  const netSOL = grossSOL - feeSOL;
  const netTokens = grossTokens - feeTokens;

  // --- Swap netTokens to SOL ---
  const swappedSOL = netTokens * poolState.currentPrice; // Placeholder
  // TODO: Replace with actual swap logic like `await swapTokensToSOL(netTokens)`

  const totalWithdrawnSOL = netSOL + swappedSOL;

  // Update pool state
  const newTotalSOL = poolState.totalSOL - grossSOL;
  const newTotalTokens = poolState.totalTokens - grossTokens;
  const newTotalShares = totalSharePoints - sharesToWithdraw;

  await redis.set("pool:totalSOL", newTotalSOL.toFixed(8));
  await redis.set("pool:totalTokens", newTotalTokens.toFixed(8));
  await redis.set("pool:totalSharePoints", newTotalShares.toFixed(8));

  // Update total withdrawn in Redis
  const poolId = poolState.poolId;
  const userWithdrawnKey = `withdrawn:${walletAddress}:${poolId}`;
  const poolWithdrawnKey = `withdrawn:${poolId}`;

  await redis.incrbyfloat(userWithdrawnKey, totalWithdrawnSOL);
  await redis.incrbyfloat(poolWithdrawnKey, totalWithdrawnSOL);

  // Update user data
  const updatedShares = userShares - sharesToWithdraw;

  const oldHistory = Array.isArray(user.withdrawHistory)
    ? user.withdrawHistory
    : (() => {
        try {
          return JSON.parse(user.withdrawHistory || "[]");
        } catch (error) {
          console.error("Failed to parse withdrawHistory:", error);
          return [];
        }
      })();

  const updatedHistory = [
    ...oldHistory,
    {
      date: new Date().toISOString(),
      shares: sharesToWithdraw,
      receivedSOL: netSOL,
      receivedTokens: netTokens,
      swappedToSOL: swappedSOL,
      totalSOLWithdrawn: totalWithdrawnSOL,
      fees: { sol: feeSOL, tokens: feeTokens },
    },
  ];

  await redis.set(
    userKey,
    JSON.stringify({
      ...user,
      sharePoints: updatedShares.toFixed(8),
      withdrawHistory: updatedHistory,
    })
  );

  return {
    withdrawnShares: sharesToWithdraw,
    netSOL: netSOL.toFixed(8),
    netTokens: netTokens.toFixed(8),
    swappedToSOL: swappedSOL.toFixed(8),
    totalWithdrawnSOL: totalWithdrawnSOL.toFixed(8),
    fees: {
      sol: feeSOL.toFixed(8),
      tokens: feeTokens.toFixed(8),
    },
    updatedPool: {
      totalSOL: newTotalSOL.toFixed(8),
      totalTokens: newTotalTokens.toFixed(8),
      totalSharePoints: newTotalShares.toFixed(8),
    },
  };
}

export const getUserState = async (walletAddress: string, redis: any) => {
  const userKey = `user:${walletAddress}`;
  const user = await redis.hGetAll(userKey);

  return {
    ...user,
    sharePoints: parseFloat(user.sharePoints || "0"),
    totalDeposited: parseFloat(user.totalDeposited || "0"),
    entryPrice: parseFloat(user.entryPrice || "0"),
    depositHistory: JSON.parse(user.depositHistory || "[]"),
  };
};

export async function autoCompoundRewards(
  redis: any,
  rewardAmountSOL: number,
  rewardAmountTokens: number,
  poolId: string
) {
  const solKey = `pool:${poolId}:totalSOL`;
  const tokenKey = `pool:${poolId}:totalTokens`;
  const shareKey = `pool:${poolId}:totalSharePoints`;
  const feeSOLKey = `pool:${poolId}:feeSOL`;
  const feeTokenKey = `pool:${poolId}:feeTokens`;

  const totalSharePoints = parseFloat(await redis.get(shareKey)) || 0;
  if (totalSharePoints === 0) {
    throw new Error("No users in pool to distribute rewards.");
  }

  const solFee = rewardAmountSOL * 0.1;
  const tokenFee = rewardAmountTokens * 0.1;

  const compoundedSOL = rewardAmountSOL - solFee;
  const compoundedTokens = rewardAmountTokens - tokenFee;

  const oldSOL = parseFloat(await redis.get(solKey)) || 0;
  const oldTokens = parseFloat(await redis.get(tokenKey)) || 0;

  const newTotalSOL = oldSOL + compoundedSOL;
  const newTotalTokens = oldTokens + compoundedTokens;

  await redis.set(solKey, newTotalSOL.toFixed(8));
  await redis.set(tokenKey, newTotalTokens.toFixed(8));

  const oldFeeSOL = parseFloat(await redis.get(feeSOLKey)) || 0;
  const oldFeeTokens = parseFloat(await redis.get(feeTokenKey)) || 0;

  await redis.set(feeSOLKey, (oldFeeSOL + solFee).toFixed(8));
  await redis.set(feeTokenKey, (oldFeeTokens + tokenFee).toFixed(8));

  return {
    compoundedSOL: compoundedSOL.toFixed(8),
    compoundedTokens: compoundedTokens.toFixed(8),
    solFee: solFee.toFixed(8),
    tokenFee: tokenFee.toFixed(8),
    totalSOL: newTotalSOL.toFixed(8),
    totalTokens: newTotalTokens.toFixed(8),
  };
}
