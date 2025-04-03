"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = require("bn.js");
const fs_1 = __importDefault(require("fs"));
const token_2022_1 = require("../dlmm/helpers/token_2022");
const helper_1 = require("./external/helper");
const program_1 = require("./external/program");
const connection = new web3_js_1.Connection("http://127.0.0.1:8899", "confirmed");
const keypairBuffer = fs_1.default.readFileSync("../keys/localnet/admin-bossj3JvwiNK7pvjr149DqdtJxf2gdygbcmEPTkb2F1.json", "utf-8");
const keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairBuffer)));
const BTCKeypair = web3_js_1.Keypair.generate();
const USDCKeypair = web3_js_1.Keypair.generate();
const BTCWithTransferHook = BTCKeypair.publicKey;
const USDCWithTransferFeeAndHook = USDCKeypair.publicKey;
const transferFeeBps = 500; // 5%
const maxFee = BigInt(100_000);
async function createMintWithExtensions(owner, mintKeypair, extensionWithIx, decimals) {
    const extensions = extensionWithIx.map((e) => e.extensionType);
    const mintLen = (0, spl_token_1.getMintLen)(extensions);
    const minLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
    const transaction = new web3_js_1.Transaction().add(web3_js_1.SystemProgram.createAccount({
        fromPubkey: keypair.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports: minLamports,
        programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
    }));
    for (const { createIx } of extensionWithIx) {
        transaction.add(createIx);
    }
    transaction.add((0, spl_token_1.createInitializeMintInstruction)(mintKeypair.publicKey, decimals, owner.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
    await (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [keypair, mintKeypair], {
        commitment: "confirmed",
    });
}
describe("Token 2022 helper test", () => {
    beforeAll(async () => {
        const signature = await connection.requestAirdrop(keypair.publicKey, 10 * web3_js_1.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(signature, "confirmed");
        const transferHookCounterProgram = (0, program_1.createTransferHookCounterProgram)(new anchor_1.Wallet(keypair), program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID, connection);
        await createMintWithExtensions(keypair, USDCKeypair, [
            {
                createIx: (0, spl_token_1.createInitializeTransferHookInstruction)(USDCKeypair.publicKey, keypair.publicKey, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID, spl_token_1.TOKEN_2022_PROGRAM_ID),
                extensionType: spl_token_1.ExtensionType.TransferHook,
            },
            {
                createIx: (0, spl_token_1.createInitializeTransferFeeConfigInstruction)(USDCKeypair.publicKey, keypair.publicKey, null, transferFeeBps, maxFee, spl_token_1.TOKEN_2022_PROGRAM_ID),
                extensionType: spl_token_1.ExtensionType.TransferFeeConfig,
            },
        ], 6).then(() => {
            return (0, helper_1.createExtraAccountMetaListAndCounter)(transferHookCounterProgram, USDCWithTransferFeeAndHook);
        });
        await createMintWithExtensions(keypair, BTCKeypair, [
            {
                createIx: (0, spl_token_1.createInitializeTransferHookInstruction)(BTCKeypair.publicKey, keypair.publicKey, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID, spl_token_1.TOKEN_2022_PROGRAM_ID),
                extensionType: spl_token_1.ExtensionType.TransferHook,
            },
        ], 6).then(() => {
            return (0, helper_1.createExtraAccountMetaListAndCounter)(transferHookCounterProgram, BTCWithTransferHook);
        });
    });
    it("getExtraAccountMetasForTransferHook return correct accounts", async () => {
        const mintAccount = await connection.getAccountInfo(USDCWithTransferFeeAndHook);
        const extraAccountMetas = await (0, token_2022_1.getExtraAccountMetasForTransferHook)(connection, USDCWithTransferFeeAndHook, mintAccount);
        const counterPda = (0, helper_1.deriveCounter)(USDCWithTransferFeeAndHook, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID);
        expect(extraAccountMetas.length).toBe(3);
        const account0 = extraAccountMetas[0].pubkey.toBase58();
        expect(account0).toBe(counterPda.toBase58());
        const account1 = extraAccountMetas[1].pubkey.toBase58();
        expect(account1).toBe(program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID.toBase58());
        const account2 = extraAccountMetas[2].pubkey.toBase58();
        expect(account2).toBe((0, spl_token_1.getExtraAccountMetaAddress)(USDCWithTransferFeeAndHook, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID).toBase58());
    });
    it("getMultipleMintsExtraAccountMetasForTransferHook return correct accounts", async () => {
        const [usdcMintAccount, btcMintAccount] = await connection.getMultipleAccountsInfo([
            USDCWithTransferFeeAndHook,
            BTCWithTransferHook,
        ]);
        const multipleMintsExtraAccountMetas = await (0, token_2022_1.getMultipleMintsExtraAccountMetasForTransferHook)(connection, [
            {
                mintAddress: USDCWithTransferFeeAndHook,
                mintAccountInfo: usdcMintAccount,
            },
            {
                mintAddress: BTCWithTransferHook,
                mintAccountInfo: btcMintAccount,
            },
        ]);
        for (const [mintAddress, accounts] of multipleMintsExtraAccountMetas) {
            expect(accounts.length).toBe(3);
            const mintKey = new web3_js_1.PublicKey(mintAddress);
            const counterPda = (0, helper_1.deriveCounter)(mintKey, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID);
            const account0 = accounts[0].pubkey.toBase58();
            expect(account0).toBe(counterPda.toBase58());
            const account1 = accounts[1].pubkey.toBase58();
            expect(account1).toBe(program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID.toBase58());
            const account2 = accounts[2].pubkey.toBase58();
            expect(account2).toBe((0, spl_token_1.getExtraAccountMetaAddress)(mintKey, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID).toBase58());
        }
    });
    it("calculateTransferFeeIncludedAmount return more value than original value", async () => {
        const usdcMintAccount = await connection.getAccountInfo(USDCWithTransferFeeAndHook);
        const mint = (0, spl_token_1.unpackMint)(USDCWithTransferFeeAndHook, usdcMintAccount, usdcMintAccount.owner);
        const transferFeeExcludedAmount = new bn_js_1.BN(100_000);
        const transferFeeIncludedAmount = (0, token_2022_1.calculateTransferFeeIncludedAmount)(transferFeeExcludedAmount, mint, 0).amount;
        expect(transferFeeIncludedAmount.gt(transferFeeExcludedAmount)).toBeTruthy();
    });
    it("calculateTransferFeeExcludedAmount return less value than original value", async () => {
        const usdcMintAccount = await connection.getAccountInfo(USDCWithTransferFeeAndHook);
        const mint = (0, spl_token_1.unpackMint)(USDCWithTransferFeeAndHook, usdcMintAccount, usdcMintAccount.owner);
        const transferFeeIncludedAmount = new bn_js_1.BN(100_000);
        const transferFeeExcludedAmount = (0, token_2022_1.calculateTransferFeeExcludedAmount)(transferFeeIncludedAmount, mint, 0).amount;
        expect(transferFeeIncludedAmount.gt(transferFeeExcludedAmount)).toBeTruthy();
    });
});
