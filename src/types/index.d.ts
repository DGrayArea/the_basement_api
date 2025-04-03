export interface SwapReq {
  body: {};
  pool: string;
  connect: string;
}

export interface StakeReq {
  body: {
    swap: {
      inToken: string;
      outToken: string;
      inAmount: string;
      minOutAmount: string;
      lbPair: string;
      user: string;
      binArraysPubkey: string[];
    };
    stake: {
      positionPublicKey: string;
      userPublicKey: string;
      totalXAmount: string;
      totalYAmount: string;
      maxBinId: string;
      minBinId: string;
      strategyType: string;
    };
  };
  pool: string;
  connect: string;
}
