import { Connection, Keypair, PublicKey } from "@solana/web3.js";
import express from "express";
import { config } from "dotenv";
// import {
//   autoCompoundRewards,
//   handleDepositAndCalculateShares,
//   handleWithdrawal,
// } from "../utils/shares";
import DLMM from "../src";
import redis from "../src/utils/redis";
import { getActiveBin } from "../src/examples/example";
import { wSOl } from "../src/utils";
import {
  autoCompoundRewards,
  handleDepositAndCalculateShares,
  handleWithdrawal,
} from "../src/utils/shareHandlers";

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
  req.connect = new Connection(req.rpc, { commitment: "finalized" });
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

  const swapYToX = dlmmPool.tokenY.publicKey.equals(new PublicKey(wSOl));

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

app.post("/dlmm/unstake", async (req, res) => {
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const gracefulShutdown = async () => {
  console.log("SIGTERM signal received: closing HTTP server");

  try {
    () => {
      console.log("HTTP server closed");
      process.exit(0);
    };
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
