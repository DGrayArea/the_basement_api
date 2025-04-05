"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.user = void 0;
exports.getActiveBin = getActiveBin;
exports.createBalancePosition = createBalancePosition;
exports.createImbalancePosition = createImbalancePosition;
exports.createOneSidePosition = createOneSidePosition;
exports.getPositionsState = getPositionsState;
exports.addLiquidityToExistingPosition = addLiquidityToExistingPosition;
exports.removePositionLiquidity = removePositionLiquidity;
exports.swap = swap;
const web3_js_1 = require("@solana/web3.js");
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const dlmm_1 = require("../dlmm");
const bn_js_1 = __importDefault(require("bn.js"));
const types_1 = require("../dlmm/types");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
exports.user = web3_js_1.Keypair.fromSecretKey(new Uint8Array(bytes_1.bs58.decode(process.env.USER_PRIVATE_KEY)));
const RPC = process.env.RPC || "https://api.devnet.solana.com";
const connection = new web3_js_1.Connection(RPC, "finalized");
const poolAddress = new web3_js_1.PublicKey("3amFSaAuShi4q7597yr8hvGC44Nck9zvGaT3HPToWHJq"
//WSOL & USDC LB Pair on Devnet 3amFSaAuShi4q7597yr8hvGC44Nck9zvGaT3HPToWHJq
//Meteora testing LB Pair on Devnet 3W2HKgUa96Z69zzG3LK1g8KdcRAWzAttiLiHfYnKuPw5
);
let activeBin;
let userPositions = [];
const newBalancePosition = new web3_js_1.Keypair();
const newImbalancePosition = new web3_js_1.Keypair();
const newOneSidePosition = new web3_js_1.Keypair();
async function getActiveBin(dlmmPool) {
    // Get pool state
    activeBin = await dlmmPool.getActiveBin();
    // console.log("🚀 ~ activeBin:", activeBin);
    return activeBin;
}
// To create a balance deposit position
async function createBalancePosition(dlmmPool) {
    const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
    const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
    const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
    // console.log("🚀 ~ minBinId:", minBinId, "🚀 ~ maxBinId:", maxBinId);
    const activeBinPricePerToken = dlmmPool.fromPricePerLamport(Number(activeBin.price));
    const totalXAmount = new bn_js_1.default(10000000);
    const totalYAmount = totalXAmount.mul(new bn_js_1.default(Number(activeBinPricePerToken)));
    console.log(totalXAmount, totalYAmount, Number(activeBinPricePerToken));
    // new BN(100000000);
    // Create Position
    // const createPositionTx =
    //   await dlmmPool.initializePositionAndAddLiquidityByStrategy({
    //     positionPubKey: newBalancePosition.publicKey,
    //     user: user.publicKey,
    //     totalXAmount,
    //     totalYAmount,
    //     strategy: {
    //       maxBinId,
    //       minBinId,
    //       strategyType: StrategyType.Spot,
    //     },
    //   });
    // try {
    //   const createBalancePositionTxHash = await sendAndConfirmTransaction(
    //     connection,
    //     createPositionTx,
    //     [user, newBalancePosition]
    //   );
    //   console.log(
    //     "🚀 ~ createBalancePositionTxHash:",
    //     createBalancePositionTxHash
    //   );
    // } catch (error) {
    //   console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    // }
}
async function createImbalancePosition(dlmmPool) {
    const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
    const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
    const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
    const totalXAmount = new bn_js_1.default(100);
    const totalYAmount = new bn_js_1.default(50);
    // Create Position
    const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
        positionPubKey: newImbalancePosition.publicKey,
        user: exports.user.publicKey,
        totalXAmount,
        totalYAmount,
        strategy: {
            maxBinId,
            minBinId,
            strategyType: types_1.StrategyType.Spot,
        },
    });
    try {
        const createImbalancePositionTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, createPositionTx, [exports.user, newImbalancePosition]);
        console.log("🚀 ~ createImbalancePositionTxHash:", createImbalancePositionTxHash);
    }
    catch (error) {
        console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    }
}
async function createOneSidePosition(dlmmPool) {
    const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
    const minBinId = activeBin.binId;
    const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL * 2;
    const totalXAmount = new bn_js_1.default(100);
    const totalYAmount = new bn_js_1.default(0);
    // Create Position
    const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
        positionPubKey: newOneSidePosition.publicKey,
        user: exports.user.publicKey,
        totalXAmount,
        totalYAmount,
        strategy: {
            maxBinId,
            minBinId,
            strategyType: types_1.StrategyType.Spot,
        },
    });
    try {
        const createOneSidePositionTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, createPositionTx, [exports.user, newOneSidePosition]);
        console.log("🚀 ~ createOneSidePositionTxHash:", createOneSidePositionTxHash);
    }
    catch (error) {
        console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    }
}
async function getPositionsState(dlmmPool) {
    // Get position state
    const positionsState = await dlmmPool.getPositionsByUserAndLbPair(exports.user.publicKey);
    userPositions = positionsState.userPositions;
    console.log("🚀 ~ userPositions:", userPositions);
}
async function addLiquidityToExistingPosition(dlmmPool) {
    const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
    const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
    const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;
    const activeBinPricePerToken = dlmmPool.fromPricePerLamport(Number(activeBin.price));
    const totalXAmount = new bn_js_1.default(100);
    const totalYAmount = totalXAmount.mul(new bn_js_1.default(Number(activeBinPricePerToken)));
    // Add Liquidity to existing position
    const addLiquidityTx = await dlmmPool.addLiquidityByStrategy({
        positionPubKey: newBalancePosition.publicKey,
        user: exports.user.publicKey,
        totalXAmount,
        totalYAmount,
        strategy: {
            maxBinId,
            minBinId,
            strategyType: types_1.StrategyType.Spot,
        },
    });
    try {
        const addLiquidityTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, addLiquidityTx, [exports.user]);
        console.log("🚀 ~ addLiquidityTxHash:", addLiquidityTxHash);
    }
    catch (error) {
        console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    }
}
async function removePositionLiquidity(dlmmPool) {
    // Remove Liquidity
    const removeLiquidityTxs = (await Promise.all(userPositions.map(({ publicKey, positionData }) => {
        const binIdsToRemove = positionData.positionBinData.map((bin) => bin.binId);
        return dlmmPool.removeLiquidity({
            position: publicKey,
            user: exports.user.publicKey,
            fromBinId: binIdsToRemove[0],
            toBinId: binIdsToRemove[binIdsToRemove.length - 1],
            bps: new bn_js_1.default(100 * 100),
            shouldClaimAndClose: true, // should claim swap fee and close position together
        });
    }))).flat();
    try {
        for (let tx of removeLiquidityTxs) {
            const removeBalanceLiquidityTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [exports.user], { skipPreflight: false, preflightCommitment: "confirmed" });
            console.log("🚀 ~ removeBalanceLiquidityTxHash:", removeBalanceLiquidityTxHash);
        }
    }
    catch (error) {
        console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    }
}
async function swap(dlmmPool) {
    //1000000 = 1
    const swapAmount = new bn_js_1.default(100000);
    // Swap quote
    const swapYtoX = false;
    const binArrays = await dlmmPool.getBinArrayForSwap(swapYtoX);
    const swapQuote = await dlmmPool.swapQuote(swapAmount, swapYtoX, new bn_js_1.default(10), binArrays);
    // console.log(dlmmPool.tokenX.publicKey, dlmmPool.tokenY.publicKey);
    // console.log("🚀 ~ swapQuote:", swapQuote);
    // Swap
    const swapTx = await dlmmPool.swap({
        inToken: dlmmPool.tokenX.publicKey,
        binArraysPubkey: swapQuote.binArraysPubkey,
        inAmount: swapAmount,
        lbPair: dlmmPool.pubkey,
        user: exports.user.publicKey,
        minOutAmount: swapQuote.minOutAmount,
        outToken: dlmmPool.tokenY.publicKey,
    });
    try {
        const swapTxHash = await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [
            exports.user,
        ]);
        console.log("🚀 ~ swapTxHash:", swapTxHash);
    }
    catch (error) {
        console.log("🚀 ~ error:", JSON.parse(JSON.stringify(error)));
    }
}
async function main() {
    const dlmmPool = await dlmm_1.DLMM.create(connection, poolAddress, {
        cluster: "devnet",
    });
    await getActiveBin(dlmmPool);
    // await swap(dlmmPool);
    // await createBalancePosition(dlmmPool);
    // await createImbalancePosition(dlmmPool);
    // await createOneSidePosition(dlmmPool);
    // await getPositionsState(dlmmPool);
    // await addLiquidityToExistingPosition(dlmmPool);
    // await removePositionLiquidity(dlmmPool);
}
main();
