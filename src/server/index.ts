import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import express from "express";
import { DLMM } from "../dlmm";
import { BinArrayAccount, LbPosition } from "../dlmm/types";
import { BN } from "bn.js";
import { convertToPosition } from "./utils";
import {
  dlmmBalancePosition,
  dlmmStake,
  dlmmSwap,
  swap,
  swapWithJupiter,
} from "../utils";
import { getActiveBin } from "../examples/example";
import { config } from "dotenv";
import redis from "../utils/redis";
// import {
//   autoCompoundRewards,
//   handleDepositAndCalculateShares,
//   handleWithdrawal,
// } from "../utils/shares";
import {
  autoCompoundRewards,
  handleDepositAndCalculateShares,
  handleWithdrawal,
} from "../utils/shareHandlers";

config();
declare global {
  namespace Express {
    export interface Request {
      pool: PublicKey;
      rpc: string;
      connect: Connection;
      redis: any;
    }
  }
}

const app = express();
app.use(express.urlencoded());
app.use(express.json());
app.use(async function (req, res, next) {
  // console.log(req.method, req.url);
  // console.log(req.body);

  // req.pool = new PublicKey(req.headers.pool as string);
  req.pool = new PublicKey("3amFSaAuShi4q7597yr8hvGC44Nck9zvGaT3HPToWHJq");
  // req.rpc = req.headers.rpc as string;
  req.rpc = "https://api.devnet.solana.com";
  req.connect = new Connection(req.rpc, { commitment: "confirmed" });
  req.redis = redis;

  next();
});

app.get("/", async (req, res) => {
  await req.redis.flushDb();
  res.send("Hello World!");
});

export function safeStringify(obj: Record<string, any>): string {
  const seen = new WeakSet();
  return JSON.stringify(obj, (key, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    if (typeof value === "object" && value !== null) {
      if (seen.has(value)) {
        return;
      }
      seen.add(value);
    }
    return value;
  });
}

app.post("/dlmm/stake", async (req, res) => {
  const dlmmPool = await DLMM.create(req.connect, req.pool, {
    cluster: "devnet",
  });

  const activeBin = await getActiveBin(dlmmPool);
  const newOneSidePosition = new Keypair();

  const swapYToX = dlmmPool.tokenY.publicKey.equals(
    new PublicKey("So11111111111111111111111111111111111111112")
  );

  try {
    // const swapResponse = await swap(
    //   dlmmPool,
    //   req.connect,
    //   Number(req.body.swapAmount),
    //   // req.body.swapYtoX
    //   !swapYToX
    // );
    const swapResponse = true;
    // await swapWithJupiter(
    //   req.connect,
    //   req.body.tokenA,
    //   req.body.tokenB,
    //   req.body.swapAmount
    // );
    if (swapResponse) {
      // const stakeResponse = await dlmmBalancePosition(
      //   activeBin,
      //   dlmmPool,
      //   req.connect,
      //   newOneSidePosition,
      //   req.body.stakeAmount
      // );
      // return res.status(400).send({
      //   swapResponse,
      //   stakeResponse,
      // });
      let totalSOL = parseFloat(await redis.get("pool:totalSOL")) || 0;
      let totalTokens = parseFloat(await redis.get("pool:totalTokens")) || 0;
      const amount = Number(req.body.amount);
      const poolState = {
        currentPrice: Number(req.body.poolState.currentPrice),
        totalSOL,
        totalTokens,
        poolId: req.body.poolState.poolId,
      };
      const shares = await handleDepositAndCalculateShares(
        req.body.userPublicKey,
        amount,
        poolState,
        req.redis
      );
      return res.status(200).send({
        shares,
      });
    } else {
      return res.status(400).send({ error: swapResponse });
    }
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/withdraw", async (req, res) => {
  try {
    const { userPublicKey, shares } = req.body;

    const poolState = {
      currentPrice: Number(req.body.poolState.currentPrice),
      totalSOL: parseFloat(await req.redis.get("pool:totalSOL")) || 0,
      totalTokens: parseFloat(await req.redis.get("pool:totalTokens")) || 0,
      poolId: req.body.poolState.poolId,
    };

    const result = await handleWithdrawal(
      userPublicKey,
      parseFloat(shares),
      poolState,
      req.redis
    );

    return res.status(200).json(result);
  } catch (err) {
    console.log(err);
    return res.status(400).json({ error: err.message });
  }
});

app.post("/dlmm/admin/compound", async (req, res) => {
  const { rewardSOL, rewardTokens, poolId } = req.body;

  if (!poolId) {
    return res.status(400).json({ error: "Missing poolId" });
  }

  try {
    const result = await autoCompoundRewards(
      req.redis,
      rewardSOL,
      rewardTokens,
      poolId
    );
    res.status(200).json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/dlmm/user/:walletAddress", async (req, res) => {
  try {
    const walletAddress = req.params.walletAddress;
    const redis = req.redis;

    // Fetch pool state
    const totalSOL = parseFloat(await redis.get("pool:totalSOL")) || 0;
    const totalTokens = parseFloat(await redis.get("pool:totalTokens")) || 0;
    const totalSharePoints =
      parseFloat(await redis.get("pool:totalSharePoints")) || 0;

    const currentPrice = parseFloat(req.query.currentPrice as string); // e.g. /user/<wallet>?currentPrice=125
    if (!currentPrice || isNaN(currentPrice)) {
      return res.status(400).json({ error: "Missing or invalid currentPrice" });
    }

    // Get user data
    const userKey = `user:${walletAddress}`;
    const userData = await redis.get(userKey);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = JSON.parse(userData);
    const userShares = parseFloat(user.sharePoints || "0");

    // Compute user % ownership and value
    const ownershipPct =
      totalSharePoints > 0 ? (userShares / totalSharePoints) * 100 : 0;

    const poolValue = totalSOL + totalTokens / currentPrice;

    const userValue = (ownershipPct / 100) * poolValue;

    const parsedWithdrawHistory = Array.isArray(user.withdrawHistory)
      ? user.withdrawHistory
      : JSON.parse(user.withdrawHistory || "[]");

    const totalWithdrawnSOL = parsedWithdrawHistory.reduce(
      (sum: number, tx: any) => sum + (tx.receivedSOL || 0),
      0
    );
    const totalWithdrawnTokens = parsedWithdrawHistory.reduce(
      (sum: number, tx: any) => sum + (tx.receivedTokens || 0),
      0
    );

    return res.status(200).json({
      pool: {
        totalSOL: totalSOL.toFixed(8),
        totalTokens: totalTokens.toFixed(8),
        totalSharePoints: totalSharePoints.toFixed(8),
        currentPrice,
        poolValue: poolValue.toFixed(8),
      },
      user: {
        walletAddress,
        sharePoints: userShares.toFixed(8),
        ownershipPercent: ownershipPct.toFixed(4),
        estimatedValueInSOL: userValue.toFixed(8),
        totalDeposited: user.totalDeposited,
        entryPrice: user.entryPrice,
        depositHistory: user.depositHistory,
        withdrawHistory: parsedWithdrawHistory,
        totalWithdrawnSOL: totalWithdrawnSOL.toFixed(8),
        totalWithdrawnTokens: totalWithdrawnTokens.toFixed(8),
      },
    });
  } catch (err) {
    console.error("GET /user/:walletAddress error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/dlmm/admin/pool-stats", async (req, res) => {
  try {
    const redis = req.redis;

    // Fetch pool-wide state
    const [totalSOL, totalTokens, totalSharePoints] = await Promise.all([
      parseFloat(await redis.get("pool:totalSOL")) || 0,
      parseFloat(await redis.get("pool:totalTokens")) || 0,
      parseFloat(await redis.get("pool:totalSharePoints")) || 0,
    ]);

    const [feeSOL, feeTokens] = await Promise.all([
      parseFloat(await redis.get("pool:feeSOL")) || 0,
      parseFloat(await redis.get("pool:feeTokens")) || 0,
    ]);

    // Compute total withdrawals
    let totalWithdrawnSOL = 0;
    let totalWithdrawnTokens = 0;

    // Fetch all user keys
    const keys = await redis.keys("user:*");

    // Fetch each user's data
    const userData = await Promise.all(
      keys.map(async (key: any) => {
        const raw = await redis.get(key);
        const data = JSON.parse(raw);
        return {
          wallet: key.replace("user:", ""),
          ...data,
          depositHistory: Array.isArray(data.depositHistory)
            ? data.depositHistory
            : JSON.parse(data.depositHistory || "[]"),
          withdrawHistory: Array.isArray(data.withdrawHistory)
            ? data.withdrawHistory
            : JSON.parse(data.withdrawHistory || "[]"),
        };
      })
    );

    userData.forEach((user: any) => {
      const withdrawals = Array.isArray(user.withdrawHistory)
        ? user.withdrawHistory
        : JSON.parse(user.withdrawHistory || "[]");

      withdrawals.forEach((tx: any) => {
        totalWithdrawnSOL += tx.receivedSOL || 0;
        totalWithdrawnTokens += tx.receivedTokens || 0;
      });
    });

    // Respond with the full data
    return res.status(200).json({
      pool: {
        totalSOL,
        totalTokens,
        totalSharePoints,
        feeSOL: feeSOL.toFixed(8),
        feeTokens: feeTokens.toFixed(8),
        totalWithdrawnSOL: totalWithdrawnSOL.toFixed(8),
        totalWithdrawnTokens: totalWithdrawnTokens.toFixed(8),
      },
      users: userData,
    });
  } catch (err) {
    console.error("Error fetching pool stats:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/dlmm/create", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    return res.status(200).send(safeStringify(dlmm));
  } catch (error) {
    return res.status(400).send(error);
  }
});

// app.get('/dlmm/create-multiple', async (req, res) => {
//   try {
//     const poolAddresses = req.pool;
//     const dlmm = await DLMM.createMultiple(req.connect, poolAddresses);
//     return res.status(200).send(safeStringify(dlmm));
//   }
//   catch (error) {
//     return res.status(400).send(error)
//   }
// })

app.get("/dlmm/get-all-lb-pair-positions-by-user", async (req, res) => {
  try {
    const userPublicKey = new PublicKey(req.body.user);
    const positions = await DLMM.getAllLbPairPositionsByUser(
      req.connect,
      userPublicKey
    );
    return res.status(200).send(safeStringify(positions));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post(
  "/dlmm/create-customizable-permissionless-lb-pair",
  async (req, res) => {
    try {
      const binStep = new BN(req.body.binStep);
      const tokenX = new PublicKey(req.body.tokenX);
      const tokenY = new PublicKey(req.body.tokenY);
      const activeId = new BN(req.body.activeId);
      const feeBps = new BN(req.body.feeBps);
      const activationType = parseInt(req.body.activationType);
      const hasAlphaVault = Boolean(req.body.hasAlphaVault);
      const creatorKey = new PublicKey(req.body.creatorKey);
      const activationPoint =
        req.body.activationPoint !== null
          ? new BN(req.body.activationPoint)
          : null;
      const transaction = DLMM.createCustomizablePermissionlessLbPair(
        req.connect,
        binStep,
        tokenX,
        tokenY,
        activeId,
        feeBps,
        activationType,
        hasAlphaVault,
        creatorKey,
        activationPoint
      );
      return res.status(200).send(safeStringify(transaction));
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  }
);

app.get("/dlmm/get-active-bin", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const activeBin = await dlmm.getActiveBin();
    return res.status(200).send(safeStringify(activeBin));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/from-price-per-lamport", async (req, res) => {
  try {
    const pricePerLamport = req.body.price;

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const from = dlmm.fromPricePerLamport(pricePerLamport);
    return res.status(200).send({ price: from });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/to-price-per-lamport", async (req, res) => {
  try {
    const price = req.body.price;

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const to = dlmm.toPricePerLamport(price);
    return res.status(200).send({ price: to });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post(
  "/dlmm/initialize-position-and-add-liquidity-by-strategy",
  async (req, res) => {
    try {
      const positionPublicKey = req.body.positionPubKey;
      const userPublicKey = req.body.userPublicKey;
      const totalXAmount = new BN(req.body.totalXAmount);
      const totalYAmount = new BN(req.body.totalYAmount);
      const maxBinId = req.body.maxBinId;
      const minBinId = req.body.minBinId;
      const strategyType = parseInt(req.body.strategyType);
      const data = {
        positionPubKey: new PublicKey(positionPublicKey),
        user: new PublicKey(userPublicKey),
        totalXAmount,
        totalYAmount,
        strategy: {
          maxBinId,
          minBinId,
          strategyType,
        },
      };

      const poolAddress = req.pool;
      const dlmm = await DLMM.create(req.connect, poolAddress);
      const position =
        await dlmm.initializePositionAndAddLiquidityByStrategy(data);
      return res.status(200).send(safeStringify(position));
    } catch (error) {
      console.log(error);
      return res.status(400).send(error);
    }
  }
);

app.post("/dlmm/add-liquidity-by-strategy", async (req, res) => {
  try {
    const positionPublicKey = req.body.positionPubKey;
    const userPublicKey = req.body.userPublicKey;
    const totalXAmount = new BN(req.body.totalXAmount);
    const totalYAmount = new BN(req.body.totalYAmount);
    const maxBinId = req.body.maxBinId;
    const minBinId = req.body.minBinId;
    const strategyType = parseInt(req.body.strategyType);
    const data = {
      positionPubKey: new PublicKey(positionPublicKey),
      user: new PublicKey(userPublicKey),
      totalXAmount,
      totalYAmount,
      strategy: {
        maxBinId,
        minBinId,
        strategyType,
      },
    };

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const position = await dlmm.addLiquidityByStrategy(data);
    return res.status(200).send(safeStringify(position));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/get-positions-by-user-and-lb-pair", async (req, res) => {
  try {
    const userPublicKey = req.body.userPublicKey;

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const positions = await dlmm.getPositionsByUserAndLbPair(
      new PublicKey(userPublicKey)
    );
    return res.status(200).send(safeStringify(positions));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/remove-liquidity", async (req, res) => {
  try {
    const positionPublicKey = req.body.positionPubKey;
    const userPublicKey = req.body.userPublicKey;
    const binIds = req.body.binIds;
    const bps = new BN(req.body.bps);
    const shouldClaimAndClose = req.body.shouldClaimAndClose;

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);

    const fromBinId = Math.min(...binIds);
    const toBinId = Math.max(...binIds);

    const removeTxs = await dlmm.removeLiquidity({
      position: new PublicKey(positionPublicKey),
      user: new PublicKey(userPublicKey),
      fromBinId,
      toBinId,
      bps,
      shouldClaimAndClose,
    });
    return res.status(200).send(safeStringify(removeTxs));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/close-position", async (req, res) => {
  try {
    const owner = new PublicKey(req.body.owner);
    const position = convertToPosition(req.body.position);

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const closeTx = await dlmm.closePosition({ owner, position });
    return res.status(200).send(safeStringify(closeTx));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/get-bin-array-for-swap", async (req, res) => {
  try {
    const swapYtoX = Boolean(req.body.swapYtoX);
    const count = parseInt(req.body.count);

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const binArray = (await dlmm.getBinArrayForSwap(swapYtoX, count)).map(
      (bin) => ({
        publicKey: bin.publicKey,
        account: {
          ...bin.account,
          index: bin.account.index.toString("hex"),
          bins: bin.account.bins.map((b) => ({
            amountX: b.amountX.toString("hex"),
            amountXIn: b.amountXIn.toString("hex"),
            amountY: b.amountY.toString("hex"),
            amountYIn: b.amountYIn.toString("hex"),
            feeAmountXPerTokenStored:
              b.feeAmountXPerTokenStored.toString("hex"),
            feeAmountYPerTokenStored:
              b.feeAmountYPerTokenStored.toString("hex"),
            liquiditySupply: b.liquiditySupply.toString("hex"),
            price: b.price.toString("hex"),
            rewardPerTokenStored: b.rewardPerTokenStored.map((r) =>
              r.toString("hex")
            ),
          })),
        },
      })
    );

    return res.status(200).send(safeStringify(binArray));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/swap-quote", async (req, res) => {
  try {
    const swapYtoX = req.body.swapYToX;
    const swapAmount = new BN(req.body.amount);
    const allowedSlippage = new BN(req.body.allowedSlippage);
    const binArrays: BinArrayAccount[] = req.body.binArrays.map((bin) => ({
      publicKey: new PublicKey(bin["publicKey"]),
      account: {
        ...bin["account"],
        index: new BN(bin["account"]["index"], 16),
        lbPair: new PublicKey(bin["account"]["lbPair"]),
        bins: bin["account"]["bins"].map((b) => ({
          amountX: new BN(b["amountX"], 16),
          amountXIn: new BN(b["amountXIn"], 16),
          amountY: new BN(b["amountY"], 16),
          amountYIn: new BN(b["amountYIn"], 16),
          feeAmountXPerTokenStored: new BN(b["feeAmountXPerTokenStored"], 16),
          feeAmountYPerTokenStored: new BN(b["feeAmountYPerTokenStored"], 16),
          liquiditySupply: new BN(b["liquiditySupply"], 16),
          price: new BN(b["price"], 16),
          rewardPerTokenStored: b["rewardPerTokenStored"].map(
            (r) => new BN(r, 16)
          ),
        })),
      },
    }));
    const isPartialFill = req.body.isPartialFilled;

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    // const binArrays = await dlmm.getBinArrayForSwap(swapYtoX, 10); // TEMP SOLUTION
    const quote = dlmm.swapQuote(
      swapAmount,
      swapYtoX,
      allowedSlippage,
      binArrays,
      isPartialFill
    );
    return res.status(200).send(safeStringify(quote));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/swap", async (req, res) => {
  try {
    const inToken = new PublicKey(req.body.inToken);
    const outToken = new PublicKey(req.body.outToken);
    const inAmount = new BN(req.body.inAmount);
    const minOutAmount = new BN(req.body.minOutAmount);
    const lbPair = new PublicKey(req.body.lbPair);
    const user = new PublicKey(req.body.userPublicKey);
    const binArraysPubkey = req.body.binArrays.map(
      (bin: string) => new PublicKey(bin)
    );

    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const swap = await dlmm.swap({
      inToken,
      outToken,
      inAmount,
      minOutAmount,
      lbPair,
      user,
      binArraysPubkey,
    });
    return res.status(200).send(safeStringify(swap));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.get("/dlmm/refetch-states", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    await dlmm.refetchStates();
    return res.status(200).send("Refetched states successfully");
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.get("/dlmm/get-bin-arrays", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const binArray = (await dlmm.getBinArrays()).map((bin) => ({
      publicKey: bin.publicKey,
      account: {
        ...bin.account,
        index: bin.account.index.toString("hex"),
        bins: bin.account.bins.map((b) => ({
          amountX: b.amountX.toString("hex"),
          amountXIn: b.amountXIn.toString("hex"),
          amountY: b.amountY.toString("hex"),
          amountYIn: b.amountYIn.toString("hex"),
          feeAmountXPerTokenStored: b.feeAmountXPerTokenStored.toString("hex"),
          feeAmountYPerTokenStored: b.feeAmountYPerTokenStored.toString("hex"),
          liquiditySupply: b.liquiditySupply.toString("hex"),
          price: b.price.toString("hex"),
          rewardPerTokenStored: b.rewardPerTokenStored.map((r) =>
            r.toString("hex")
          ),
        })),
      },
    }));
    return res.status(200).send(safeStringify(binArray));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.get("/dlmm/get-fee-info", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const feeInfo = dlmm.getFeeInfo();
    return res.status(200).send(safeStringify(feeInfo));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.get("/dlmm/get-dynamic-fee", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const dlmm = await DLMM.create(req.connect, poolAddress);
    const dynamicFee = dlmm.getDynamicFee();
    return res.status(200).send({ fee: dynamicFee.toString() });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/get-bin-id-from-price", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const price = req.body.price;
    const min = Boolean(req.body.min);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const binId = dlmm.getBinIdFromPrice(price, min);
    return res.status(200).send({ binId });
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/get-bins-around-active-bin", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const numberOfBinsToTheLeft = parseInt(req.body.numberOfBinsToTheLeft);
    const numberOfBinsToTheRight = parseInt(req.body.numberOfBinsToTheRight);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const bins = await dlmm.getBinsAroundActiveBin(
      numberOfBinsToTheLeft,
      numberOfBinsToTheRight
    );
    return res.status(200).send(safeStringify(bins));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/get-bins-between-min-and-max-price", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const minPrice = req.body.minPrice;
    const maxPrice = req.body.maxPrice;

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const bins = await dlmm.getBinsBetweenMinAndMaxPrice(minPrice, maxPrice);
    return res.status(200).send(safeStringify(bins));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/get-bins-between-lower-and-upper-bound", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const lowerBound = parseInt(req.body.lowerBound);
    const upperBound = parseInt(req.body.upperBound);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const bins = await dlmm.getBinsBetweenLowerAndUpperBound(
      lowerBound,
      upperBound
    );
    return res.status(200).send(safeStringify(bins));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/claim-lm-reward", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const owner = new PublicKey(req.body.owner);
    const position = convertToPosition(req.body.position);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const tx = await dlmm.claimLMReward({ owner, position });
    return res.status(200).send(safeStringify(tx));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/claim-all-lm-rewards", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const owner = new PublicKey(req.body.owner);
    const positions = req.body.positions.map(convertToPosition);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const tx = await dlmm.claimAllLMRewards({ owner, positions });
    return res.status(200).send(safeStringify(tx));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/claim-swap-fee", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const owner = new PublicKey(req.body.owner);
    const position = convertToPosition(req.body.position);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const tx = await dlmm.claimSwapFee({ owner, position });
    return res.status(200).send(safeStringify(tx));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/claim-all-swap-fee", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const owner = new PublicKey(req.body.owner);
    const positions = req.body.positions.map(convertToPosition);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const tx = await dlmm.claimAllSwapFee({ owner, positions });
    return res.status(200).send(safeStringify(tx));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.post("/dlmm/claim-all-rewards", async (req, res) => {
  try {
    const poolAddress = req.pool;
    const owner = new PublicKey(req.body.owner);
    const positions = req.body.positions.map(convertToPosition);

    const dlmm = await DLMM.create(req.connect, poolAddress);
    const tx = await dlmm.claimAllRewards({ owner, positions });
    return res.status(200).send(safeStringify(tx));
  } catch (error) {
    console.log(error);
    return res.status(400).send(error);
  }
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
