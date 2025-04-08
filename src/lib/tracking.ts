export const appendToHistory = (
  oldHistory: any[] = [],
  newEntry: Record<string, any>
): any[] => {
  return [...oldHistory, { date: new Date().toISOString(), ...newEntry }];
};

export const trackAutoCompound = async (
  redis: any,
  compoundedSOL: number,
  compoundedTokens: number,
  currentPrice: number
) => {
  const oldAuto = JSON.parse(
    (await redis.get("pool:autoCompoundHistory")) || "[]"
  );

  const newEntry = {
    sol: compoundedSOL,
    tokens: compoundedTokens,
    totalValue: compoundedSOL + compoundedTokens / currentPrice,
  };

  const updated = appendToHistory(oldAuto, newEntry);
  await redis.set("pool:autoCompoundHistory", JSON.stringify(updated));

  return updated;
};
