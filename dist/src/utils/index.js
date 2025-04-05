"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserState = exports.recordUserShares = exports.swap = exports.dlmmStake = exports.dlmmSwap = void 0;
exports.dlmmBalancePosition = dlmmBalancePosition;
exports.swapWithJupiter = swapWithJupiter;
exports.handleDepositAndCalculateShares = handleDepositAndCalculateShares;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const server_1 = require("../server");
const dlmm_1 = require("../dlmm");
const example_1 = require("../examples/example");
const types_1 = require("../dlmm/types");
const dotenv_1 = require("dotenv");
const axios_1 = __importDefault(require("axios"));
(0, dotenv_1.config)();
// 9999999999999999999999000000000000000000000
const dlmmSwap = async (req) => {
    try {
        const inToken = new web3_js_1.PublicKey(req.body.inToken);
        const outToken = new web3_js_1.PublicKey(req.body.outToken);
        const inAmount = new bn_js_1.BN(req.body.inAmount);
        const minOutAmount = new bn_js_1.BN(req.body.minOutAmount);
        const lbPair = new web3_js_1.PublicKey(req.body.lbPair);
        const user = new web3_js_1.PublicKey(req.body.userPublicKey);
        const binArraysPubkey = req.body.binArrays.map((bin) => new web3_js_1.PublicKey(bin));
        const poolAddress = req.pool;
        const dlmm = await dlmm_1.DLMM.create(req.connect, poolAddress);
        const swap = await dlmm.swap({
            inToken,
            outToken,
            inAmount,
            minOutAmount,
            lbPair,
            user,
            binArraysPubkey,
        });
        return (0, server_1.safeStringify)(swap);
    }
    catch (error) {
        console.log(error);
        return { error: error };
    }
};
exports.dlmmSwap = dlmmSwap;
const dlmmStake = async (req) => {
    try {
        const positionPublicKey = req.body.positionPubKey;
        const userPublicKey = req.body.userPublicKey;
        const totalXAmount = new bn_js_1.BN(req.body.totalXAmount);
        const totalYAmount = new bn_js_1.BN(req.body.totalYAmount);
        const maxBinId = req.body.maxBinId;
        const minBinId = req.body.minBinId;
        const strategyType = parseInt(req.body.strategyType);
        const data = {
            positionPubKey: new web3_js_1.PublicKey(positionPublicKey),
            user: new web3_js_1.PublicKey(userPublicKey),
            totalXAmount,
            totalYAmount,
            strategy: {
                maxBinId,
                minBinId,
                strategyType,
            },
        };
        const poolAddress = req.pool;
        const dlmm = await dlmm_1.DLMM.create(req.connect, poolAddress);
        const position = await dlmm.addLiquidityByStrategy(data);
        return (0, server_1.safeStringify)(position);
    }
    catch (error) {
        console.log(error);
        return { error: error };
    }
};
exports.dlmmStake = dlmmStake;
const swap = async (dlmmPool, connection, amount, swapYtoX) => {
    const swapAmount = new bn_js_1.BN(amount);
    // Swap quote
    const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);
    const swapQuote = await dlmmPool.swapQuote(swapAmount, swapYtoX, new bn_js_1.BN(10), binArrays);
    // console.log(dlmmPool.tokenX.publicKey, dlmmPool.tokenY.publicKey);
    // console.log("🚀 ~ swapQuote:", swapQuote);
    // Swap
    const swapTx = await dlmmPool.swap({
        inToken: dlmmPool.tokenX.publicKey,
        binArraysPubkey: swapQuote.binArraysPubkey,
        inAmount: swapAmount,
        lbPair: dlmmPool.pubkey,
        user: example_1.user.publicKey,
        minOutAmount: swapQuote.minOutAmount,
        outToken: dlmmPool.tokenY.publicKey,
    });
    try {
        const swapTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [example_1.user], {
            skipPreflight: false,
            preflightCommitment: "confirmed",
        });
        return swapTxHash;
    }
    catch (error) {
        console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
        return { error: error };
    }
};
exports.swap = swap;
async function dlmmBalancePosition(activeBin, dlmmPool, connection, newBalancePosition, amount) {
    const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
    const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
    const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
    // console.log("🚀 ~ minBinId:", minBinId, "🚀 ~ maxBinId:", maxBinId);
    const activeBinPricePerToken = dlmmPool.fromPricePerLamport(Number(activeBin.price));
    // const totalXAmount = new BN(10000000);
    const totalXAmount = new bn_js_1.BN(amount);
    const totalYAmount = totalXAmount.mul(new bn_js_1.BN(Number(activeBinPricePerToken)));
    // new BN(100000000);
    // Create Position
    const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
        positionPubKey: newBalancePosition.publicKey,
        user: example_1.user.publicKey,
        totalXAmount,
        totalYAmount,
        strategy: {
            maxBinId,
            minBinId,
            strategyType: types_1.StrategyType.Spot,
        },
    });
    try {
        const createBalancePositionTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, createPositionTx, [example_1.user, newBalancePosition]);
        console.log("🚀 ~ createBalancePositionTxHash:", createBalancePositionTxHash);
        return createBalancePositionTxHash;
    }
    catch (error) {
        return { error: error };
    }
}
async function swapWithJupiter(connection, tokenAMint, tokenBMint, amount) {
    const SIGNER_ACCOUNT = {
        pubkey: process.env.SIGNER_PUB_KEY,
        fBps: 100,
        fShareBps: 10000,
    };
    const wallet = example_1.user;
    try {
        // Step 1: Get swap quote with 1% fee
        const quoteResponse = await axios_1.default.get(`https://api.jup.ag/v1/quote?inputMint=${tokenAMint}&outputMint=${tokenBMint}&amount=${amount}&slippageBps=50&feeBps=100`);
        const response = await quoteResponse.data;
        // Step 2: Prepare swap transaction
        const swapResponse = await axios_1.default.post("https://api.jup.ag/v1/swap", {
            response,
            userPublicKey: wallet.publicKey,
            referralAccount: SIGNER_ACCOUNT.pubkey,
            feeBps: SIGNER_ACCOUNT.fBps,
            feeShareBps: SIGNER_ACCOUNT.fShareBps,
        }, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        // Step 3: Execute swap
        const swapTransaction = web3_js_1.Transaction.from(Buffer.from(swapResponse.data.swapTransaction, "base64"));
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
        const txid = await connection.sendRawTransaction(swapTransaction.serialize());
        const latestBlockhash = await connection.getLatestBlockhash("finalized");
        await connection.confirmTransaction({
            signature: txid,
            blockhash: latestBlockhash.blockhash,
            lastValidBlockHeight: latestBlockhash.lastValidBlockHeight,
        }, "finalized");
        return txid;
    }
    catch (error) {
        console.error("Swap failed:", error);
        return { error: error };
    }
}
async function handleDepositAndCalculateShares(walletAddress, solAmount, poolState, redis) {
    console.log("Start here");
    const solToKeep = solAmount * 0.5;
    const tokensFromSwap = solToKeep * poolState.currentPrice;
    const swapFee = tokensFromSwap * 0.003;
    const tokensReceived = tokensFromSwap - swapFee;
    const contributionValue = solToKeep + tokensReceived / poolState.currentPrice;
    const lpValueBefore = poolState.totalSOL + poolState.totalTokens / poolState.currentPrice;
    // 🔄 Fetch total share points from Redis
    let totalSharePoints = parseFloat(await redis.get("pool:totalSharePoints")) || 0;
    let sharePoints = 0;
    if (totalSharePoints === 0) {
        sharePoints = contributionValue;
    }
    else {
        sharePoints = (contributionValue / lpValueBefore) * totalSharePoints;
    }
    // Update pool state (off-chain tracking)
    poolState.totalSOL += solToKeep;
    poolState.totalTokens += tokensReceived;
    // ⬆️ Update user shares and total share points in Redis
    const shareData = await (0, exports.recordUserShares)(walletAddress, {
        sharePoints,
        entryPrice: poolState.currentPrice,
        deposited: solAmount,
    }, redis);
    console.log(shareData);
    // 📝 Update Redis total share points
    await redis.set("pool:totalSharePoints", (totalSharePoints +
        parseFloat(shareData.sharePoints) -
        (shareData.oldShares || 0)).toFixed(8));
    return shareData;
}
const recordUserShares = async (walletAddress, { sharePoints, entryPrice, deposited }, redis) => {
    const userKey = `user:${walletAddress}`;
    const exists = await redis.exists(userKey);
    if (exists) {
        const user = await redis.hGetAll(userKey);
        const oldShares = parseFloat(user.sharePoints || "0");
        const oldDeposited = parseFloat(user.totalDeposited || "0");
        const oldEntryPrice = parseFloat(user.entryPrice || "0");
        const newShareTotal = oldShares + sharePoints;
        const newDepositTotal = oldDeposited + deposited;
        const weightedEntryPrice = (oldEntryPrice * oldShares + entryPrice * sharePoints) / newShareTotal;
        const oldHistory = JSON.parse(user.depositHistory || "[]");
        const updatedHistory = [
            ...oldHistory,
            {
                date: new Date().toISOString(),
                amount: deposited,
                shares: sharePoints,
                entryPrice,
            },
        ];
        await redis.hSet(userKey, {
            sharePoints: newShareTotal.toFixed(8),
            totalDeposited: newDepositTotal.toFixed(8),
            entryPrice: weightedEntryPrice.toFixed(8),
            depositHistory: JSON.stringify(updatedHistory),
        });
        return {
            sharePoints: newShareTotal.toFixed(8),
            totalDeposited: newDepositTotal.toFixed(8),
            entryPrice: weightedEntryPrice.toFixed(8),
            depositHistory: JSON.stringify(updatedHistory),
            oldShares,
        };
    }
    else {
        const newUser = {
            sharePoints: sharePoints.toFixed(8),
            totalDeposited: deposited.toFixed(8),
            entryPrice: entryPrice.toFixed(8),
            depositHistory: JSON.stringify([
                {
                    date: new Date().toISOString(),
                    amount: deposited,
                    shares: sharePoints,
                    entryPrice,
                },
            ]),
        };
        await redis.hSet(userKey, newUser);
        return {
            ...newUser,
            oldShares: 0,
        };
    }
};
exports.recordUserShares = recordUserShares;
const getUserState = async (walletAddress, redis) => {
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
exports.getUserState = getUserState;
