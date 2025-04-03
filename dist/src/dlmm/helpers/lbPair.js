"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTokensMintFromPoolAddress = getTokensMintFromPoolAddress;
exports.getTokenProgramId = getTokenProgramId;
const anchor_1 = require("@coral-xyz/anchor");
const web3_js_1 = require("@solana/web3.js");
const idl_1 = require("../idl");
const constants_1 = require("../constants");
const spl_token_1 = require("@solana/spl-token");
/**
 * It fetches the pool account from the AMM program, and returns the mint addresses for the two tokens
 * @param {Connection} connection - Connection - The connection to the Solana cluster
 * @param {string} poolAddress - The address of the pool account.
 * @returns The tokenAMint and tokenBMint addresses for the pool.
 */
async function getTokensMintFromPoolAddress(connection, poolAddress, opt) {
    const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
    const program = new anchor_1.Program(idl_1.IDL, opt.programId ?? constants_1.LBCLMM_PROGRAM_IDS[opt?.cluster ?? "mainnet-beta"], provider);
    const poolAccount = await program.account.lbPair.fetchNullable(new web3_js_1.PublicKey(poolAddress));
    if (!poolAccount)
        throw new Error("Pool account not found");
    return {
        tokenXMint: poolAccount.tokenXMint,
        tokenYMint: poolAccount.tokenYMint,
    };
}
function getTokenProgramId(lbPairState) {
    const getTokenProgramIdByFlag = (flag) => {
        return flag == 0 ? spl_token_1.TOKEN_PROGRAM_ID : spl_token_1.TOKEN_2022_PROGRAM_ID;
    };
    return {
        tokenXProgram: getTokenProgramIdByFlag(lbPairState.tokenMintXProgramFlag),
        tokenYProgram: getTokenProgramIdByFlag(lbPairState.tokenMintYProgramFlag),
    };
}
