"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSFER_HOOK_COUNTER_PROGRAM_ID = void 0;
exports.createTransferHookCounterProgram = createTransferHookCounterProgram;
const anchor_1 = require("@coral-xyz/anchor");
const transfer_hook_counter_1 = require("./transfer_hook_counter");
exports.TRANSFER_HOOK_COUNTER_PROGRAM_ID = new anchor_1.web3.PublicKey("abcSyangMHdGzUGKhBhKoQzSFdJKUdkPGf5cbXVHpEw");
function createTransferHookCounterProgram(wallet, programId, connection) {
    const provider = new anchor_1.AnchorProvider(connection, wallet, {
        maxRetries: 3,
    });
    const program = new anchor_1.Program(transfer_hook_counter_1.IDL, programId, provider);
    return program;
}
