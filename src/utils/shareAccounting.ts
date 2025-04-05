export const calculateShares = (
  contributionValue: number,
  totalPoolValue: number,
  totalSharePoints: number
): number => {
  if (totalSharePoints === 0 || totalPoolValue === 0) {
    return contributionValue;
  }
  return (contributionValue / totalPoolValue) * totalSharePoints;
};

export const updateUserShares = (
  oldShares: number,
  oldDeposited: number,
  oldEntryPrice: number,
  newShares: number,
  newDeposit: number,
  entryPrice: number
) => {
  const newShareTotal = oldShares + newShares;
  const newDepositTotal = oldDeposited + newDeposit;
  const weightedEntryPrice =
    (oldEntryPrice * oldShares + entryPrice * newShares) / newShareTotal;

  return {
    sharePoints: newShareTotal,
    totalDeposited: newDepositTotal,
    entryPrice: weightedEntryPrice,
  };
};
