import {
  Connection,
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";
import { BN } from "bn.js";
import { Request } from "express";
import { safeStringify } from "../server";
import { DLMM } from "../dlmm";
import { user } from "../examples/example";
import { BinLiquidity, StrategyType } from "../dlmm/types";
import { config } from "dotenv";
import axios from "axios";

config();

// 9999999999999999999999000000000000000000000
export const dlmmSwap = async (req: Request) => {
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
    return safeStringify(swap);
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

export const dlmmStake = async (req: Request) => {
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
    return safeStringify(position);
  } catch (error) {
    console.log(error);
    return { error: error };
  }
};

export const swap = async (
  dlmmPool: DLMM,
  connection: any,
  amount: number,
  swapYtoX: boolean
) => {
  const swapAmount = new BN(amount);
  // Swap quote
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
    const swapTxHash = await sendAndConfirmTransaction(
      connection,
      swapTx,
      [user],
      {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      }
    );

    return swapTxHash;
  } catch (error) {
    console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    return { error: error };
  }
};

export async function dlmmBalancePosition(
  activeBin: BinLiquidity,
  dlmmPool: DLMM,
  connection: Connection,
  newBalancePosition: Keypair,
  amount: number
) {
  const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
  const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
  const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
  // console.log("🚀 ~ minBinId:", minBinId, "🚀 ~ maxBinId:", maxBinId);
  const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    Number(activeBin.price)
  );
  // const totalXAmount = new BN(10000000);
  const totalXAmount = new BN(amount);
  const totalYAmount = totalXAmount.mul(new BN(Number(activeBinPricePerToken)));
  // new BN(100000000);
  // Create Position
  const createPositionTx =
    await dlmmPool.initializePositionAndAddLiquidityByStrategy({
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
    const createBalancePositionTxHash = await sendAndConfirmTransaction(
      connection,
      createPositionTx,
      [user, newBalancePosition]
    );
    console.log(
      "🚀 ~ createBalancePositionTxHash:",
      createBalancePositionTxHash
    );
    return createBalancePositionTxHash;
  } catch (error) {
    return { error: error };
  }
}

export async function swapWithJupiter(
  connection: Connection,
  tokenAMint: string,
  tokenBMint: string,
  amount: string,
  userPublicKey: string
) {
  const SIGNER_ACCOUNT = {
    pubkey: process.env.SIGNER_PUB_KEY,
    fBps: 100,
    fShareBps: 10000,
  };

  const wallet = user;
  try {
    // Step 1: Get swap quote with 1% fee
    const quoteResponse = await axios.get(
      `https://api.jup.ag/v1/quote?inputMint=${tokenAMint}&outputMint=${tokenBMint}&amount=${amount}&slippageBps=50&feeBps=100`
    );

    const response = await quoteResponse.data;
    // Step 2: Prepare swap transaction
    const swapResponse = await axios.post(
      "https://api.jup.ag/v1/swap",
      {
        response,
        userPublicKey: userPublicKey,
        referralAccount: SIGNER_ACCOUNT.pubkey,
        feeBps: SIGNER_ACCOUNT.fBps,
        feeShareBps: SIGNER_ACCOUNT.fShareBps,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    // Step 3: Execute swap
    const swapTransaction = Transaction.from(
      Buffer.from(swapResponse.data.swapTransaction, "base64")
    );
    // const signedTx = await swapTransaction.sign(wallet);
    // const txid = await connection.sendRawTransaction(signedTx.serialize());
    // const latestBlockhash = await connection.getLatestBlockhash("finalized");
    // await connection.confirmTransaction(
    //   {
    //     signature: signedTx,
    //     blockhash: latestBlockhash.blockhash,
    //     lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
    //   },
    //   "finalized"
    // );

    // return txid;

    swapTransaction.sign(wallet); // For Keypair
    const txid = await connection.sendRawTransaction(
      swapTransaction.serialize()
    );

    const latestBlockhash = await connection.getLatestBlockhash("finalized");
    await connection.confirmTransaction(
      {
        signature: txid,
        blockhash: latestBlockhash.blockhash,
        lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
      },
      "finalized"
    );

    return txid;
  } catch (error) {
    console.error("Swap failed:", error);
    return { error: error };
  }
}
