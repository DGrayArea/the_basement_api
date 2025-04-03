"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.swap = exports.dlmmStake = exports.dlmmSwap = void 0;
exports.dlmmBalancePosition = dlmmBalancePosition;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const server_1 = require("../server");
const dlmm_1 = require("../dlmm");
const example_1 = require("../examples/example");
const types_1 = require("../dlmm/types");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
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
    console.log(swapYtoX);
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
