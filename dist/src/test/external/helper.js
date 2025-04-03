"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createExtraAccountMetaListAndCounter = createExtraAccountMetaListAndCounter;
exports.deriveCounter = deriveCounter;
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
async function createExtraAccountMetaListAndCounter(program, mint) {
    const extraAccountMetaList = (0, spl_token_1.getExtraAccountMetaAddress)(mint, program.programId);
    const counterAccount = deriveCounter(mint, program.programId);
    await program.methods
        .initializeExtraAccountMetaList()
        .accounts({
        mint,
        counterAccount,
        extraAccountMetaList,
    })
        .rpc();
    return [extraAccountMetaList, counterAccount];
}
function deriveCounter(mint, programId) {
    const [counter] = anchor_1.web3.PublicKey.findProgramAddressSync([Buffer.from("counter"), mint.toBuffer()], programId);
    return counter;
}
