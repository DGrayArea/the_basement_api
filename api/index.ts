import { Connection, PublicKey } from "@solana/web3.js";
import express from "express";
import { config } from "dotenv";
// import {
//   autoCompoundRewards,
//   handleDepositAndCalculateShares,
//   handleWithdrawal,
// } from "../utils/shares";
import DLMM from "../src";
import redis from "../src/utils/redis";
import {
  addLiquidityToExistingPosition,
  getActiveBin,
  getPositionsState,
  removeSinglePositionLiquidity,
} from "../src/examples/example";
import { wSOl } from "../src/utils";
import {
  autoCompoundRewards,
  handleDepositAndCalculateShares,
  handleWithdrawal,
} from "../src/utils/shareHandlers";
import bodyParser from "body-parser";
import cors from "cors";
import winston from "winston";

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

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
  ],
});

const app = express();
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.urlencoded());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use(async function (req, res, next) {
  try {
    // console.log(req.method, req.url);
    // console.log(req.body);

    // req.pool = new PublicKey(req.headers.pool as string);
    req.pool = new PublicKey("3amFSaAuShi4q7597yr8hvGC44Nck9zvGaT3HPToWHJq");
    // req.rpc = req.headers.rpc as string;
    // req.rpc = process.env.RPC || "https://api.devnet.solana.com";
    // req.connect = new Connection(req.rpc, {
    //   commitment: "finalized",
    //   httpHeaders: {
    //     "Content-Type": "application/json",
    //   },
    //   fetchMiddleware: (url, options) => {
    //     const controller = new AbortController();
    //     const timeout = setTimeout(() => controller.abort(), 300000); // 30 seconds timeout

    //     return fetch(url, {
    //       ...options,
    //       signal: controller.signal,
    //     }).finally(() => clearTimeout(timeout));
    //   },
    // });
    req.redis = redis;

    next();
  } catch (error) {
    console.log(error);
  }
});

app.get("/", async (req, res) => {
  // await req.redis.flushDb();
  res.send("Hello World!");
});

app.get("/health", async (req, res) => {
  try {
    const version = 1.0;
    res.status(200).json({ status: "ok", solanaVersion: version });
  } catch (error) {
    console.error("Health check failed:", error);
    res.status(500).json({ status: "error", error: error.message });
  }
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
  try {
    const connection = new Connection(
      process.env.RPC || "https://api.devnet.solana.com",
      {
        commitment: "confirmed",
      }
    );
    const dlmmPool = await DLMM.create(connection, req.pool, {
      cluster: "devnet",
    });

    const activeBin = await getActiveBin(dlmmPool);
    const position = await getPositionsState(dlmmPool);

    const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
      Number(activeBin.price)
    );

    if (!activeBin) {
      return res.status(400).json({ error: "No active bin found" });
    }
    if (!position || position.length === 0) {
      return res.status(400).json({ error: "No positions found" });
    }

    const positionData = position[0].positionData;
    const totalXAmount =
      parseFloat(positionData.totalXAmount) / Math.pow(10, 6); // Token X
    const totalYAmount =
      parseFloat(positionData.totalYAmount) / Math.pow(10, 9); // SOL

    const poolState = {
      currentPrice: Number(activeBinPricePerToken),
      totalSOL: totalYAmount,
      totalTokens: totalXAmount,
    };

    const amount = Number(req.body.amount) / 2;

    const stakeResponse = await addLiquidityToExistingPosition(
      dlmmPool,
      {
        amount: amount,
        decimals: Number(req.body.decimals),
      },
      activeBin,
      position[0]
    );

    if (typeof stakeResponse === "object" && stakeResponse.error) {
      return res.status(400).send({ error: stakeResponse.error });
    }

    const shares = await handleDepositAndCalculateShares(
      req.body.userPublicKey,
      amount,
      poolState,
      req.redis
    );

    return res.status(200).send({
      stakeTx: stakeResponse,
      shares,
    });
  } catch (error) {
    console.error("Error in /dlmm/stake:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/dlmm/unstake", async (req, res) => {
  try {
    const connection = new Connection(
      process.env.RPC || "https://api.devnet.solana.com",
      {
        commitment: "confirmed",
      }
    );
    const dlmmPool = await DLMM.create(connection, req.pool, {
      cluster: "devnet",
    });

    const { userPublicKey, unstakePercentage } = req.body;

    const amountPercentage = Number(unstakePercentage);

    if (amountPercentage <= 0 || amountPercentage > 100) {
      return res.status(400).json({ error: "Invalid unstake percentage" });
    }

    const activeBin = await getActiveBin(dlmmPool);
    const position = await getPositionsState(dlmmPool);

    if (!activeBin) {
      return res.status(400).json({ error: "No active bin found" });
    }
    if (!position || position.length === 0) {
      return res.status(400).json({ error: "No positions found" });
    }

    const positionData = position[0].positionData;
    const totalXAmount =
      parseFloat(positionData.totalXAmount) / Math.pow(10, 6);
    const totalYAmount =
      parseFloat(positionData.totalYAmount) / Math.pow(10, 9);

    const poolState = {
      totalSOL: totalXAmount,
      totalTokens: totalYAmount,
      poolId: req.pool,
    };

    // Fetch user data
    const userKey = `user:${userPublicKey}`;
    const userData = await req.redis.get(userKey);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = JSON.parse(userData);
    const userShares = parseFloat(user.sharePoints || "0");
    const totalSharePoints =
      parseFloat(await req.redis.get("pool:totalSharePoints")) || 0;

    if (totalSharePoints === 0) {
      return res.status(400).json({ error: "No shares in the pool" });
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
    await req.redis.set(userKey, JSON.stringify(user));

    // Call `removeSinglePositionLiquidity` with the effective percentage
    const unstakeResponse = await removeSinglePositionLiquidity(
      dlmmPool,
      position,
      position[0].publicKey,
      effectiveWithdrawalPct * 100 // Convert to percentage
    );

    if (!Array.isArray(unstakeResponse) && unstakeResponse.error) {
      return res.status(400).send({ error: unstakeResponse.error });
    }

    return res.status(200).json({
      unstakeResponse: unstakeResponse[0],
      withdrawSOL: withdrawSOL.toFixed(8),
      withdrawTokens: withdrawTokens.toFixed(8),
      remainingShares: remainingShares.toFixed(8),
    });
  } catch (err) {
    console.error("Error in /dlmm/unstake:", err);
    return res.status(500).json({ error: "Internal server error" });
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
    const connection = new Connection(
      process.env.RPC || "https://api.devnet.solana.com",
      {
        commitment: "confirmed",
      }
    );

    const walletAddress = req.params.walletAddress;
    const dlmmPool = await DLMM.create(connection, req.pool, {
      cluster: "devnet",
    });

    // Fetch user's positions
    const positions = await getPositionsState(dlmmPool);
    if (!positions || positions.length === 0) {
      return res.status(404).json({ error: "No positions found for user" });
    }

    // Calculate pool totals from position data

    const positionData = positions[0].positionData;
    const totalTokens = parseFloat(positionData.totalXAmount) / Math.pow(10, 6); // Token X
    const totalSOL = parseFloat(positionData.totalYAmount) / Math.pow(10, 9); // SOL

    // Fetch user's share points
    const userKey = `user:${walletAddress}`;
    const userData = await req.redis.get(userKey);
    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = JSON.parse(userData);
    const userShares = parseFloat(user.sharePoints || "0");

    // Calculate total share points from Redis
    const totalSharePoints =
      parseFloat(await req.redis.get("pool:totalSharePoints")) || 0;

    if (totalSharePoints === 0) {
      return res.status(400).json({ error: "No shares in the pool" });
    }

    // Calculate user's ownership percentage and value
    const ownershipPct = (userShares / totalSharePoints) * 100;
    const currentPrice = totalSOL / totalTokens; // SOL per token
    const poolValue = totalSOL + totalTokens * currentPrice;
    const userValue = (ownershipPct / 100) * poolValue;

    // Parse user's withdrawal history
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
        currentPrice: currentPrice.toFixed(8),
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
    const dlmmPool = await DLMM.create(req.connect, req.pool, {
      cluster: "devnet",
    });

    // Fetch all user positions
    const positions = await getPositionsState(dlmmPool);

    if (!positions || positions.length === 0) {
      return res.status(404).json({ error: "No positions found in the pool" });
    }

    // Calculate pool totals from position data
    const positionData = positions[0].positionData;
    const totalTokens = parseFloat(positionData.totalXAmount) / Math.pow(10, 6); // Token X
    const totalSOL = parseFloat(positionData.totalYAmount) / Math.pow(10, 9); // SOL

    // Fetch total share points from Redis
    const totalSharePoints =
      parseFloat(await req.redis.get("pool:totalSharePoints")) || 0;

    // Fetch all user keys
    const keys = await req.redis.keys("user:*");

    // Fetch each user's data
    const userData = await Promise.all(
      keys.map(async (key: any) => {
        const raw = await req.redis.get(key);
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

    // Compute total withdrawals
    let totalWithdrawnSOL = 0;
    let totalWithdrawnTokens = 0;

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
        totalSOL: totalSOL.toFixed(8),
        totalTokens: totalTokens.toFixed(8),
        totalSharePoints: totalSharePoints.toFixed(8),
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
  logger.info("Server is running");
});

const gracefulShutdown = async () => {
  console.log("SIGTERM signal received: closing HTTP server");

  try {
    // if (req.redis) {
    //   await req.redis.quit();
    //   console.log("Redis connection closed");
    // }
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    logger.error("Error occurred");
    process.exit(1);
  }
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);

export default app;
