"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimulationComputeUnits = exports.MAX_CU_BUFFER = exports.MIN_CU_BUFFER = exports.DEFAULT_ADD_LIQUIDITY_CU = void 0;
const web3_js_1 = require("@solana/web3.js");
// https://solscan.io/tx/4ryJKTB1vYmGU6YnUWwbLps18FaJjiTwgRozcgdP8RFcwp7zUZi85vgWE7rARNx2NvzDJiM9CUWArqzY7LHv38WL
exports.DEFAULT_ADD_LIQUIDITY_CU = 800_000;
exports.MIN_CU_BUFFER = 50_000;
exports.MAX_CU_BUFFER = 200_000;
const getSimulationComputeUnits = async (connection, instructions, payer, lookupTables, commitment = "confirmed") => {
    const testInstructions = [
        // Set an arbitrarily high number in simulation
        // so we can be sure the transaction will succeed
        // and get the real compute units used
        web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({ units: 1_400_000 }),
        ...instructions,
    ];
    const testTransaction = new web3_js_1.VersionedTransaction(new web3_js_1.TransactionMessage({
        instructions: testInstructions,
        payerKey: payer,
        // RecentBlockhash can by any public key during simulation
        // since 'replaceRecentBlockhash' is set to 'true' below
        recentBlockhash: web3_js_1.PublicKey.default.toString(),
    }).compileToV0Message(lookupTables));
    const rpcResponse = await connection.simulateTransaction(testTransaction, {
        replaceRecentBlockhash: true,
        sigVerify: false,
        commitment,
    });
    if (rpcResponse?.value?.err) {
        const logs = rpcResponse.value.logs?.join("\n  • ") || "No logs available";
        throw new Error(`Transaction simulation failed:\n  •${logs}` +
            JSON.stringify(rpcResponse?.value?.err));
    }
    return rpcResponse.value.unitsConsumed || null;
};
exports.getSimulationComputeUnits = getSimulationComputeUnits;
