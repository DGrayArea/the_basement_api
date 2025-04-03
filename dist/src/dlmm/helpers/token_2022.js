"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMultipleMintsExtraAccountMetasForTransferHook = getMultipleMintsExtraAccountMetasForTransferHook;
exports.getExtraAccountMetasForTransferHook = getExtraAccountMetasForTransferHook;
exports.calculateTransferFeeIncludedAmount = calculateTransferFeeIncludedAmount;
exports.calculateTransferFeeExcludedAmount = calculateTransferFeeExcludedAmount;
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
async function getMultipleMintsExtraAccountMetasForTransferHook(connection, mintAddressesWithAccountInfo) {
    const extraAccountMetas = await Promise.all(mintAddressesWithAccountInfo.map(({ mintAddress, mintAccountInfo }) => getExtraAccountMetasForTransferHook(connection, mintAddress, mintAccountInfo)));
    const mintsWithHookAccountMap = new Map();
    for (let i = 0; i < extraAccountMetas.length; i++) {
        const { mintAddress } = mintAddressesWithAccountInfo[i];
        const transferHooks = extraAccountMetas[i];
        mintsWithHookAccountMap.set(mintAddress.toBase58(), transferHooks);
    }
    return mintsWithHookAccountMap;
}
async function getExtraAccountMetasForTransferHook(connection, mintAddress, mintAccountInfo) {
    if (![spl_token_1.TOKEN_PROGRAM_ID.toBase58(), spl_token_1.TOKEN_2022_PROGRAM_ID.toBase58()].includes(mintAccountInfo.owner.toBase58())) {
        return [];
    }
    const mintState = (0, spl_token_1.unpackMint)(mintAddress, mintAccountInfo, mintAccountInfo.owner);
    if (mintAccountInfo.owner.equals(spl_token_1.TOKEN_PROGRAM_ID)) {
        return [];
    }
    const transferHook = (0, spl_token_1.getTransferHook)(mintState);
    if (!transferHook || transferHook.programId.equals(web3_js_1.PublicKey.default)) {
        return [];
    }
    else {
        // We just need the instruction, therefore we do not need source and destination key
        const instruction = (0, spl_token_1.createTransferCheckedInstruction)(web3_js_1.PublicKey.default, mintAddress, web3_js_1.PublicKey.default, web3_js_1.PublicKey.default, BigInt(0), mintState.decimals, [], mintAccountInfo.owner);
        await (0, spl_token_1.addExtraAccountMetasForExecute)(connection, instruction, transferHook.programId, web3_js_1.PublicKey.default, mintAddress, web3_js_1.PublicKey.default, web3_js_1.PublicKey.default, BigInt(0));
        // Only 4 keys needed if it's single signer. https://github.com/solana-labs/solana-program-library/blob/d72289c79a04411c69a8bf1054f7156b6196f9b3/token/js/src/extensions/transferFee/instructions.ts#L251
        const transferHookAccounts = instruction.keys.slice(4);
        // Token 2022 program allow transfer hook program to be invoked without any accounts. https://github.com/solana-program/transfer-hook/blob/e00f3b5c591fd55b4aed6a1e9b1ccc502cb6da05/interface/src/onchain.rs#L37
        if (transferHookAccounts.length == 0) {
            transferHookAccounts.push({
                pubkey: transferHook.programId,
                isSigner: false,
                isWritable: false,
            });
        }
        return transferHookAccounts;
    }
}
function calculatePreFeeAmount(transferFee, postFeeAmount) {
    if (postFeeAmount.isZero()) {
        return new bn_js_1.default(0);
    }
    if (transferFee.transferFeeBasisPoints === 0) {
        return postFeeAmount;
    }
    const maximumFee = new bn_js_1.default(transferFee.maximumFee.toString());
    if (transferFee.transferFeeBasisPoints === spl_token_1.MAX_FEE_BASIS_POINTS) {
        return postFeeAmount.add(maximumFee);
    }
    const ONE_IN_BASIS_POINTS = new bn_js_1.default(spl_token_1.MAX_FEE_BASIS_POINTS);
    const numerator = postFeeAmount.mul(ONE_IN_BASIS_POINTS);
    const denominator = ONE_IN_BASIS_POINTS.sub(new bn_js_1.default(transferFee.transferFeeBasisPoints));
    const rawPreFeeAmount = numerator
        .add(denominator)
        .sub(new bn_js_1.default(1))
        .div(denominator);
    if (rawPreFeeAmount.sub(postFeeAmount).gte(maximumFee)) {
        return postFeeAmount.add(maximumFee);
    }
    return rawPreFeeAmount;
}
function calculateInverseFee(transferFee, postFeeAmount) {
    const preFeeAmount = calculatePreFeeAmount(transferFee, postFeeAmount);
    return new bn_js_1.default((0, spl_token_1.calculateFee)(transferFee, BigInt(preFeeAmount.toString())).toString());
}
function calculateTransferFeeIncludedAmount(transferFeeExcludedAmount, mint, currentEpoch) {
    if (transferFeeExcludedAmount.isZero()) {
        return {
            amount: new bn_js_1.default(0),
            transferFee: new bn_js_1.default(0),
        };
    }
    const transferFeeConfig = (0, spl_token_1.getTransferFeeConfig)(mint);
    if (transferFeeConfig === null) {
        return {
            amount: transferFeeExcludedAmount,
            transferFee: new bn_js_1.default(0),
        };
    }
    const epochFee = (0, spl_token_1.getEpochFee)(transferFeeConfig, BigInt(currentEpoch));
    const transferFee = epochFee.transferFeeBasisPoints == spl_token_1.MAX_FEE_BASIS_POINTS
        ? new bn_js_1.default(epochFee.maximumFee.toString())
        : calculateInverseFee(epochFee, transferFeeExcludedAmount);
    const transferFeeIncludedAmount = transferFeeExcludedAmount.add(transferFee);
    return {
        amount: transferFeeIncludedAmount,
        transferFee,
    };
}
function calculateTransferFeeExcludedAmount(transferFeeIncludedAmount, mint, currentEpoch) {
    const transferFeeConfig = (0, spl_token_1.getTransferFeeConfig)(mint);
    if (transferFeeConfig === null) {
        return {
            amount: transferFeeIncludedAmount,
            transferFee: new bn_js_1.default(0),
        };
    }
    const transferFeeIncludedAmountN = BigInt(transferFeeIncludedAmount.toString());
    const transferFee = (0, spl_token_1.calculateFee)((0, spl_token_1.getEpochFee)(transferFeeConfig, BigInt(currentEpoch)), transferFeeIncludedAmountN);
    const transferFeeExcludedAmount = new bn_js_1.default((transferFeeIncludedAmountN - transferFee).toString());
    return {
        amount: transferFeeExcludedAmount,
        transferFee: new bn_js_1.default(transferFee.toString()),
    };
}
