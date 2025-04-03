"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const fs_1 = __importDefault(require("fs"));
const dlmm_1 = require("../dlmm");
const constants_1 = require("../dlmm/constants");
const helpers_1 = require("../dlmm/helpers");
const token_2022_1 = require("../dlmm/helpers/token_2022");
const idl_1 = require("../dlmm/idl");
const types_1 = require("../dlmm/types");
const helper_1 = require("./external/helper");
const program_1 = require("./external/program");
const keypairBuffer = fs_1.default.readFileSync("../keys/localnet/admin-bossj3JvwiNK7pvjr149DqdtJxf2gdygbcmEPTkb2F1.json", "utf-8");
const connection = new web3_js_1.Connection("http://127.0.0.1:8899", "confirmed");
const keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairBuffer)));
const btcDecimal = 6;
const usdcDecimal = 6;
const metDecimal = 6;
const BTCKeypair = web3_js_1.Keypair.generate();
const USDCKeypair = web3_js_1.Keypair.generate();
const METKeypair = web3_js_1.Keypair.generate();
const BTC2022 = BTCKeypair.publicKey;
const USDC = USDCKeypair.publicKey;
const MET2022 = METKeypair.publicKey;
const transferFeeBps = 500; // 5%
const maxFee = BigInt(100_000) * BigInt(10 ** btcDecimal);
let presetParameter2Key;
let pairKey;
const provider = new anchor_1.AnchorProvider(connection, new anchor_1.Wallet(keypair), anchor_1.AnchorProvider.defaultOptions());
const program = new anchor_1.Program(idl_1.IDL, constants_1.LBCLMM_PROGRAM_IDS["localhost"], provider);
const positionKeypair0 = web3_js_1.Keypair.generate();
const positionKeypair1 = web3_js_1.Keypair.generate();
const opt = {
    cluster: "localhost",
};
describe("SDK token2022 test", () => {
    // Token setup
    beforeAll(async () => {
        const airdropSig = await connection.requestAirdrop(keypair.publicKey, 10 * web3_js_1.LAMPORTS_PER_SOL);
        await connection.confirmTransaction(airdropSig, "confirmed");
        await (0, spl_token_1.createMint)(connection, keypair, keypair.publicKey, null, usdcDecimal, USDCKeypair, {
            commitment: "confirmed",
        });
        const userUsdcAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, keypair, USDC, keypair.publicKey, true, "confirmed", {
            commitment: "confirmed",
        }, spl_token_1.TOKEN_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        const userUsdcAta = userUsdcAccount.address;
        await (0, spl_token_1.mintTo)(connection, keypair, USDC, userUsdcAta, keypair, BigInt(1_000_000_000) * BigInt(10 ** usdcDecimal), [], {
            commitment: "confirmed",
        }, spl_token_1.TOKEN_PROGRAM_ID);
        const extensions = [
            spl_token_1.ExtensionType.TransferFeeConfig,
            spl_token_1.ExtensionType.TransferHook,
        ];
        const mintLen = (0, spl_token_1.getMintLen)(extensions);
        const minLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
        const createBtcTx = new web3_js_1.Transaction()
            .add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: keypair.publicKey,
            newAccountPubkey: BTCKeypair.publicKey,
            space: mintLen,
            lamports: minLamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }))
            .add((0, spl_token_1.createInitializeTransferFeeConfigInstruction)(BTC2022, keypair.publicKey, keypair.publicKey, transferFeeBps, maxFee, spl_token_1.TOKEN_2022_PROGRAM_ID))
            .add((0, spl_token_1.createInitializeTransferHookInstruction)(BTC2022, keypair.publicKey, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID, spl_token_1.TOKEN_2022_PROGRAM_ID))
            .add((0, spl_token_1.createInitializeMintInstruction)(BTC2022, btcDecimal, keypair.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
        await (0, web3_js_1.sendAndConfirmTransaction)(connection, createBtcTx, [keypair, BTCKeypair], { commitment: "confirmed" });
        const transferHookCounterProgram = (0, program_1.createTransferHookCounterProgram)(new anchor_1.Wallet(keypair), program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID, connection);
        await (0, helper_1.createExtraAccountMetaListAndCounter)(transferHookCounterProgram, BTC2022);
        const userBtcAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, keypair, BTC2022, keypair.publicKey, true, "confirmed", {
            commitment: "confirmed",
        }, spl_token_1.TOKEN_2022_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        const userBtcAta = userBtcAccount.address;
        await (0, spl_token_1.mintTo)(connection, keypair, BTC2022, userBtcAta, keypair, BigInt(1_000_000_000) * BigInt(10 ** btcDecimal), [], {
            commitment: "confirmed",
        }, spl_token_1.TOKEN_2022_PROGRAM_ID);
        const createMetTx = new web3_js_1.Transaction()
            .add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: keypair.publicKey,
            newAccountPubkey: METKeypair.publicKey,
            space: mintLen,
            lamports: minLamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }))
            .add((0, spl_token_1.createInitializeTransferFeeConfigInstruction)(MET2022, keypair.publicKey, keypair.publicKey, transferFeeBps, maxFee, spl_token_1.TOKEN_2022_PROGRAM_ID))
            .add((0, spl_token_1.createInitializeTransferHookInstruction)(MET2022, keypair.publicKey, program_1.TRANSFER_HOOK_COUNTER_PROGRAM_ID, spl_token_1.TOKEN_2022_PROGRAM_ID))
            .add((0, spl_token_1.createInitializeMintInstruction)(MET2022, metDecimal, keypair.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
        await (0, web3_js_1.sendAndConfirmTransaction)(connection, createMetTx, [keypair, METKeypair], { commitment: "confirmed" });
        await (0, helper_1.createExtraAccountMetaListAndCounter)(transferHookCounterProgram, MET2022);
        const userMetAccount = await (0, spl_token_1.getOrCreateAssociatedTokenAccount)(connection, keypair, MET2022, keypair.publicKey, true, "confirmed", {
            commitment: "confirmed",
        }, spl_token_1.TOKEN_2022_PROGRAM_ID, spl_token_1.ASSOCIATED_TOKEN_PROGRAM_ID);
        const userMetAta = userMetAccount.address;
        await (0, spl_token_1.mintTo)(connection, keypair, MET2022, userMetAta, keypair, BigInt(1_000_000_000) * BigInt(10 ** metDecimal), [], {
            commitment: "confirmed",
        }, spl_token_1.TOKEN_2022_PROGRAM_ID);
    });
    // DLMM related setup
    beforeAll(async () => {
        const presetParameter2 = await program.account.presetParameter2.all();
        const idx = presetParameter2.length;
        [presetParameter2Key] = (0, helpers_1.derivePresetParameterWithIndex)(new bn_js_1.default(idx), program.programId);
        await program.methods
            .initializePresetParameter2({
            index: idx,
            binStep: 10,
            baseFactor: 10_000,
            filterPeriod: 30,
            decayPeriod: 600,
            reductionFactor: 5000,
            variableFeeControl: 40000,
            protocolShare: 0,
            maxVolatilityAccumulator: 350000,
            baseFeePowerFactor: 1,
        })
            .accounts({
            presetParameter: presetParameter2Key,
            admin: keypair.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .rpc();
        const [btcTokenBadge] = (0, helpers_1.deriveTokenBadge)(BTC2022, program.programId);
        await program.methods
            .initializeTokenBadge()
            .accounts({
            tokenBadge: btcTokenBadge,
            admin: keypair.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenMint: BTC2022,
        })
            .rpc();
        const [metTokenBadge] = (0, helpers_1.deriveTokenBadge)(MET2022, program.programId);
        await program.methods
            .initializeTokenBadge()
            .accounts({
            tokenBadge: metTokenBadge,
            admin: keypair.publicKey,
            systemProgram: web3_js_1.SystemProgram.programId,
            tokenMint: MET2022,
        })
            .rpc();
    });
    it("getAllPresetParameters return created preset parameter 2", async () => {
        const { presetParameter2 } = await dlmm_1.DLMM.getAllPresetParameters(connection, opt);
        expect(presetParameter2.length).toBeGreaterThan(0);
    });
    describe("Pair", () => {
        it("createLbPair2 with token 2022", async () => {
            const activeId = new bn_js_1.default(0);
            const createLbPair2Tx = await dlmm_1.DLMM.createLbPair2(connection, keypair.publicKey, BTC2022, USDC, presetParameter2Key, activeId, opt);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, createLbPair2Tx, [keypair], {
                commitment: "confirmed",
            });
            [pairKey] = (0, helpers_1.deriveLbPairWithPresetParamWithIndexKey)(presetParameter2Key, BTC2022, USDC, program.programId);
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const feeInfo = dlmm.getFeeInfo();
            expect(feeInfo.baseFeeRatePercentage.toNumber()).toBe(1);
            expect(dlmm.lbPair.binStep).toBe(10);
        });
        it("createCustomizablePermissionlessLbPair2 with token 2022", async () => {
            const binStep = new bn_js_1.default(1);
            const activeId = new bn_js_1.default(0);
            const feeBps = new bn_js_1.default(150);
            const createCustomizablePermissionlessLbPair2Tx = await dlmm_1.DLMM.createCustomizablePermissionlessLbPair2(connection, binStep, BTC2022, USDC, activeId, feeBps, types_1.ActivationType.Timestamp, false, keypair.publicKey, null, false, opt);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, createCustomizablePermissionlessLbPair2Tx, [keypair]);
            const [pairKey] = (0, helpers_1.deriveCustomizablePermissionlessLbPair)(BTC2022, USDC, program.programId);
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const feeInfo = dlmm.getFeeInfo();
            expect(feeInfo.baseFeeRatePercentage.toNumber()).toBe(1.5);
            expect(feeInfo.protocolFeePercentage.toNumber()).toBe(20);
        });
        it("getPairPubkeyIfExists return pair permissionless pair pubkey", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const pairPubkey = await dlmm_1.DLMM.getPairPubkeyIfExists(connection, dlmm.lbPair.tokenXMint, dlmm.lbPair.tokenYMint, new bn_js_1.default(dlmm.lbPair.binStep), new bn_js_1.default(dlmm.lbPair.parameters.baseFactor), new bn_js_1.default(dlmm.lbPair.parameters.baseFeePowerFactor), opt);
            expect(pairPubkey.toBase58()).toBe(pairKey.toBase58());
        });
        it("createMultiple works", async () => {
            const lbPairs = await dlmm_1.DLMM.getLbPairs(connection, opt);
            const dlmms = await dlmm_1.DLMM.createMultiple(connection, lbPairs.map((x) => x.publicKey), opt);
            for (let i = 0; i < lbPairs.length; i++) {
                const dlmm = dlmms[i];
                const lbPair = lbPairs[i];
                expect(dlmm.pubkey.toBase58()).toBe(lbPair.publicKey.toBase58());
                expect(dlmm.tokenX.publicKey.toBase58()).toBe(lbPair.account.tokenXMint.toBase58());
                expect(dlmm.tokenY.publicKey.toBase58()).toBe(lbPair.account.tokenYMint.toBase58());
            }
        });
    });
    describe("Empty position management", () => {
        beforeAll(async () => {
            const rewardIndex = new bn_js_1.default(0);
            const rewardDuration = new bn_js_1.default(300);
            const fundingReward = new bn_js_1.default((BigInt(1_000_000) * BigInt(10 ** metDecimal)).toString());
            const funder = keypair.publicKey;
            const [rewardVault] = (0, helpers_1.deriveRewardVault)(pairKey, rewardIndex, program.programId);
            const metAccount = await connection.getAccountInfo(MET2022);
            const [tokenBadge] = (0, helpers_1.deriveTokenBadge)(MET2022, program.programId);
            await program.methods
                .initializeReward(rewardIndex, rewardDuration, funder)
                .accounts({
                lbPair: pairKey,
                rewardMint: MET2022,
                rewardVault,
                admin: keypair.publicKey,
                tokenBadge,
                tokenProgram: metAccount.owner,
                systemProgram: web3_js_1.SystemProgram.programId,
            })
                .rpc();
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new bn_js_1.default(dlmm.lbPair.activeId));
            const activeBinArrayKey = (0, helpers_1.deriveBinArray)(dlmm.pubkey, activeBinArrayIndex, dlmm.program.programId)[0];
            const initActiveBinArrayIxs = await dlmm.initializeBinArrays([activeBinArrayIndex], funder);
            const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash("confirmed");
            const tx = new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
            }).add(...initActiveBinArrayIxs);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [keypair]);
            const metTransferHookAccountMetas = await (0, token_2022_1.getExtraAccountMetasForTransferHook)(connection, MET2022, metAccount);
            const metAtaKey = (0, spl_token_1.getAssociatedTokenAddressSync)(MET2022, funder, true, metAccount.owner);
            await program.methods
                .fundReward(rewardIndex, fundingReward, true, {
                slices: [
                    {
                        accountsType: {
                            transferHookReward: {},
                        },
                        length: metTransferHookAccountMetas.length,
                    },
                ],
            })
                .accounts({
                lbPair: pairKey,
                rewardMint: MET2022,
                rewardVault,
                funder,
                binArray: activeBinArrayKey,
                funderTokenAccount: metAtaKey,
                tokenProgram: metAccount.owner,
            })
                .remainingAccounts(metTransferHookAccountMetas)
                .rpc();
        });
        it("createEmptyPosition", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const minBinId = -30;
            const maxBinId = 30;
            const createPositionAndBinArraysTx = await dlmm.createEmptyPosition({
                positionPubKey: positionKeypair0.publicKey,
                minBinId,
                maxBinId,
                user: keypair.publicKey,
            });
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, createPositionAndBinArraysTx, [keypair, positionKeypair0]);
            const position = await dlmm.getPosition(positionKeypair0.publicKey);
            expect(position.publicKey.toBase58()).toBe(positionKeypair0.publicKey.toBase58());
            const { positionData } = position;
            expect(positionData.lowerBinId).toBe(minBinId);
            expect(positionData.upperBinId).toBe(maxBinId);
            const binCount = maxBinId - minBinId + 1;
            expect(positionData.positionBinData.length).toBe(binCount);
        });
    });
    describe("Add liquidity", () => {
        it("Add liquidity by strategy", async () => {
            const totalXAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** btcDecimal));
            const totalYAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** usdcDecimal));
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            let position = await dlmm.getPosition(positionKeypair0.publicKey);
            const activeBinInfo = await dlmm.getActiveBin();
            const computedInBinAmount = (0, helpers_1.toAmountsBothSideByStrategy)(dlmm.lbPair.activeId, dlmm.lbPair.binStep, position.positionData.lowerBinId, position.positionData.upperBinId, totalXAmount, totalYAmount, activeBinInfo.xAmount, activeBinInfo.yAmount, types_1.StrategyType.Spot, dlmm.tokenX.mint, dlmm.tokenY.mint, dlmm.clock);
            const addLiquidityTx = await dlmm.addLiquidityByStrategy({
                positionPubKey: positionKeypair0.publicKey,
                totalXAmount,
                totalYAmount,
                user: keypair.publicKey,
                strategy: {
                    strategyType: types_1.StrategyType.Spot,
                    minBinId: position.positionData.lowerBinId,
                    maxBinId: position.positionData.upperBinId,
                },
                slippage: 0,
            });
            const [beforeReserveXAccount, beforeReserveYAccount] = await connection.getMultipleAccountsInfo([
                dlmm.tokenX.reserve,
                dlmm.tokenY.reserve,
            ]);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, addLiquidityTx, [keypair]);
            position = await dlmm.getPosition(positionKeypair0.publicKey);
            const [afterReserveXAccount, afterReserveYAccount] = await connection.getMultipleAccountsInfo([
                dlmm.tokenX.reserve,
                dlmm.tokenY.reserve,
            ]);
            const [computedInAmountX, computedInAmountY] = computedInBinAmount.reduce(([totalXAmount, totalYAmount], { amountX, amountY }) => {
                return [totalXAmount.add(amountX), totalYAmount.add(amountY)];
            }, [new bn_js_1.default(0), new bn_js_1.default(0)]);
            expect(computedInAmountX.lte(totalXAmount)).toBeTruthy();
            expect(computedInAmountY.lte(totalYAmount)).toBeTruthy();
            const beforeReserveX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.reserve, beforeReserveXAccount, beforeReserveXAccount.owner);
            const beforeReserveY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.reserve, beforeReserveYAccount, beforeReserveYAccount.owner);
            const afterReserveX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.reserve, afterReserveXAccount, afterReserveXAccount.owner);
            const afterReserveY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.reserve, afterReserveYAccount, afterReserveYAccount.owner);
            const reserveXReceivedAmount = afterReserveX.amount - beforeReserveX.amount;
            const reserveYReceivedAmount = afterReserveY.amount - beforeReserveY.amount;
            expect(new bn_js_1.default(reserveXReceivedAmount.toString()).toString()).toBe(computedInAmountX.toString());
            expect(new bn_js_1.default(reserveYReceivedAmount.toString()).toString()).toBe(computedInAmountY.toString());
            const positionXAmount = new bn_js_1.default(position.positionData.totalXAmount);
            const positionYAmount = new bn_js_1.default(position.positionData.totalYAmount);
            const xDiff = computedInAmountX.sub(positionXAmount);
            const yDiff = computedInAmountY.sub(positionYAmount);
            expect(xDiff.lte(new bn_js_1.default(1))).toBeTruthy();
            expect(yDiff.lte(new bn_js_1.default(1))).toBeTruthy();
            expect(positionXAmount.add(xDiff).toString()).toBe(computedInAmountX.toString());
            expect(positionYAmount.add(yDiff).toString()).toBe(computedInAmountY.toString());
        });
        it("Initialize position and add liquidity by strategy", async () => {
            const totalXAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** btcDecimal));
            const totalYAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** usdcDecimal));
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const minBinId = dlmm.lbPair.activeId - 30;
            const maxBinId = dlmm.lbPair.activeId + 30;
            const activeBinInfo = await dlmm.getActiveBin();
            const computedInBinAmount = (0, helpers_1.toAmountsBothSideByStrategy)(dlmm.lbPair.activeId, dlmm.lbPair.binStep, minBinId, maxBinId, totalXAmount, totalYAmount, activeBinInfo.xAmount, activeBinInfo.yAmount, types_1.StrategyType.Spot, dlmm.tokenX.mint, dlmm.tokenY.mint, dlmm.clock);
            const initAndAddLiquidityTx = await dlmm.initializePositionAndAddLiquidityByStrategy({
                positionPubKey: positionKeypair1.publicKey,
                totalXAmount,
                totalYAmount,
                strategy: {
                    strategyType: types_1.StrategyType.Spot,
                    minBinId,
                    maxBinId,
                },
                slippage: 0,
                user: keypair.publicKey,
            });
            const [beforeReserveXAccount, beforeReserveYAccount] = await connection.getMultipleAccountsInfo([
                dlmm.tokenX.reserve,
                dlmm.tokenY.reserve,
            ]);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, initAndAddLiquidityTx, [
                keypair,
                positionKeypair1,
            ]);
            const [afterReserveXAccount, afterReserveYAccount] = await connection.getMultipleAccountsInfo([
                dlmm.tokenX.reserve,
                dlmm.tokenY.reserve,
            ]);
            await dlmm.refetchStates();
            const position = await dlmm.getPosition(positionKeypair1.publicKey);
            expect(position.positionData.lowerBinId).toBe(minBinId);
            expect(position.positionData.upperBinId).toBe(maxBinId);
            const [computedInAmountX, computedInAmountY] = computedInBinAmount.reduce(([totalXAmount, totalYAmount], { amountX, amountY }) => {
                return [totalXAmount.add(amountX), totalYAmount.add(amountY)];
            }, [new bn_js_1.default(0), new bn_js_1.default(0)]);
            expect(computedInAmountX.lte(totalXAmount)).toBeTruthy();
            expect(computedInAmountY.lte(totalYAmount)).toBeTruthy();
            const beforeReserveX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.reserve, beforeReserveXAccount, beforeReserveXAccount.owner);
            const beforeReserveY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.reserve, beforeReserveYAccount, beforeReserveYAccount.owner);
            const afterReserveX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.reserve, afterReserveXAccount, afterReserveXAccount.owner);
            const afterReserveY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.reserve, afterReserveYAccount, afterReserveYAccount.owner);
            const reserveXReceivedAmount = afterReserveX.amount - beforeReserveX.amount;
            const reserveYReceivedAmount = afterReserveY.amount - beforeReserveY.amount;
            expect(new bn_js_1.default(reserveXReceivedAmount.toString()).toString()).toBe(computedInAmountX.toString());
            expect(new bn_js_1.default(reserveYReceivedAmount.toString()).toString()).toBe(computedInAmountY.toString());
            const positionXAmount = new bn_js_1.default(position.positionData.totalXAmount);
            const positionYAmount = new bn_js_1.default(position.positionData.totalYAmount);
            const xDiff = computedInAmountX.sub(positionXAmount);
            const yDiff = computedInAmountY.sub(positionYAmount);
            expect(xDiff.lte(new bn_js_1.default(1))).toBeTruthy();
            expect(yDiff.lte(new bn_js_1.default(1))).toBeTruthy();
            expect(positionXAmount.add(xDiff).toString()).toBe(computedInAmountX.toString());
            expect(positionYAmount.add(yDiff).toString()).toBe(computedInAmountY.toString());
        });
    });
    describe("Swap", () => {
        it("SwapExactIn quote X into Y and execute swap", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const inAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** btcDecimal));
            const swapForY = true;
            const bidBinArrays = await dlmm.getBinArrayForSwap(swapForY, 3);
            const quoteResult = dlmm.swapQuote(inAmount, swapForY, new bn_js_1.default(0), bidBinArrays, false);
            const swapTx = await dlmm.swap({
                inAmount,
                inToken: dlmm.tokenX.publicKey,
                outToken: dlmm.tokenY.publicKey,
                minOutAmount: quoteResult.minOutAmount,
                lbPair: pairKey,
                user: keypair.publicKey,
                binArraysPubkey: bidBinArrays.map((b) => b.publicKey),
            });
            const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [keypair]);
            const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            const beforeUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, beforeUserXAccount, beforeUserXAccount.owner);
            const beforeUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, beforeUserYAccount, beforeUserYAccount.owner);
            const afterUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, afterUserXAccount, afterUserXAccount.owner);
            const afterUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, afterUserYAccount, afterUserYAccount.owner);
            const consumedXAmount = new bn_js_1.default((beforeUserX.amount - afterUserX.amount).toString());
            const receivedYAmount = new bn_js_1.default((afterUserY.amount - beforeUserY.amount).toString());
            expect(consumedXAmount.toString()).toBe(quoteResult.consumedInAmount.toString());
            expect(receivedYAmount.toString()).toBe(quoteResult.outAmount.toString());
        });
        it("SwapExactOut quote Y into X and execute swap", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const outAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** btcDecimal));
            const swapForY = false;
            const askBinArrays = await dlmm.getBinArrayForSwap(swapForY, 3);
            const quoteResult = dlmm.swapQuoteExactOut(outAmount, swapForY, new bn_js_1.default(0), askBinArrays);
            console.log(quoteResult.inAmount.toString(), quoteResult.outAmount.toString());
            const swapTx = await dlmm.swapExactOut({
                outAmount,
                inToken: dlmm.tokenY.publicKey,
                outToken: dlmm.tokenX.publicKey,
                maxInAmount: quoteResult.maxInAmount,
                lbPair: pairKey,
                user: keypair.publicKey,
                binArraysPubkey: askBinArrays.map((b) => b.publicKey),
            });
            const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [keypair]);
            const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            const beforeUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, beforeUserXAccount, beforeUserXAccount.owner);
            const beforeUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, beforeUserYAccount, beforeUserYAccount.owner);
            const afterUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, afterUserXAccount, afterUserXAccount.owner);
            const afterUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, afterUserYAccount, afterUserYAccount.owner);
            const consumedYAmount = new bn_js_1.default((beforeUserY.amount - afterUserY.amount).toString());
            const receivedXAmount = new bn_js_1.default((afterUserX.amount - beforeUserX.amount).toString());
            expect(consumedYAmount.toString()).toBe(quoteResult.inAmount.toString());
            expect(receivedXAmount.toString()).toBe(quoteResult.outAmount.toString());
        });
        it("SwapExactOut quote X into Y and execute swap", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const outAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** usdcDecimal));
            const swapForY = true;
            const bidBinArrays = await dlmm.getBinArrayForSwap(swapForY, 3);
            const quoteResult = dlmm.swapQuoteExactOut(outAmount, swapForY, new bn_js_1.default(0), bidBinArrays);
            console.log(quoteResult.inAmount.toString(), quoteResult.outAmount.toString());
            const swapTx = await dlmm.swapExactOut({
                outAmount,
                inToken: dlmm.tokenX.publicKey,
                outToken: dlmm.tokenY.publicKey,
                maxInAmount: quoteResult.maxInAmount,
                lbPair: pairKey,
                user: keypair.publicKey,
                binArraysPubkey: bidBinArrays.map((b) => b.publicKey),
            });
            const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [keypair]);
            const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            const beforeUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, beforeUserXAccount, beforeUserXAccount.owner);
            const beforeUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, beforeUserYAccount, beforeUserYAccount.owner);
            const afterUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, afterUserXAccount, afterUserXAccount.owner);
            const afterUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, afterUserYAccount, afterUserYAccount.owner);
            const consumedXAmount = new bn_js_1.default((beforeUserX.amount - afterUserX.amount).toString());
            const receivedYAmount = new bn_js_1.default((afterUserY.amount - beforeUserY.amount).toString());
            expect(consumedXAmount.toString()).toBe(quoteResult.inAmount.toString());
            expect(receivedYAmount.toString()).toBe(quoteResult.outAmount.toString());
        });
        it("SwapExactIn quote Y into X and execute swap", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const inAmount = new bn_js_1.default(100_000).mul(new bn_js_1.default(10 ** usdcDecimal));
            const swapForY = false;
            const askBinArrays = await dlmm.getBinArrayForSwap(swapForY, 3);
            const quoteResult = dlmm.swapQuote(inAmount, swapForY, new bn_js_1.default(0), askBinArrays, false);
            const swapTx = await dlmm.swap({
                inAmount,
                inToken: dlmm.tokenY.publicKey,
                outToken: dlmm.tokenX.publicKey,
                minOutAmount: quoteResult.minOutAmount,
                lbPair: pairKey,
                user: keypair.publicKey,
                binArraysPubkey: askBinArrays.map((b) => b.publicKey),
            });
            const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [keypair]);
            const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner),
                (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner),
            ]);
            const beforeUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, beforeUserXAccount, beforeUserXAccount.owner);
            const beforeUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, beforeUserYAccount, beforeUserYAccount.owner);
            const afterUserX = (0, spl_token_1.unpackAccount)(dlmm.tokenX.publicKey, afterUserXAccount, afterUserXAccount.owner);
            const afterUserY = (0, spl_token_1.unpackAccount)(dlmm.tokenY.publicKey, afterUserYAccount, afterUserYAccount.owner);
            const consumedYAmount = new bn_js_1.default((beforeUserY.amount - afterUserY.amount).toString());
            const receivedXAmount = new bn_js_1.default((afterUserX.amount - beforeUserX.amount).toString());
            expect(consumedYAmount.toString()).toBe(quoteResult.consumedInAmount.toString());
            expect(receivedXAmount.toString()).toBe(quoteResult.outAmount.toString());
        });
    });
    const generateSwapFees = async () => {
        const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
        // Generate some swap fees
        const inAmount = new bn_js_1.default(100_000);
        for (const [inToken, outToken] of [
            [dlmm.tokenX, dlmm.tokenY],
            [dlmm.tokenY, dlmm.tokenX],
        ]) {
            const binArraysPubkey = await dlmm
                .getBinArrayForSwap(inToken.publicKey.equals(dlmm.tokenX.publicKey), 3)
                .then((b) => b.map((b) => b.publicKey));
            const swapTx = await dlmm.swap({
                inToken: inToken.publicKey,
                outToken: outToken.publicKey,
                inAmount: inAmount.mul(new bn_js_1.default(10 ** inToken.mint.decimals)),
                minOutAmount: new bn_js_1.default(0),
                user: keypair.publicKey,
                lbPair: pairKey,
                binArraysPubkey,
            });
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, swapTx, [keypair]);
            await dlmm.refetchStates();
        }
    };
    describe("Claim fees and rewards", () => {
        let userXAta, userYAta, userRewardAta;
        beforeEach(async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            await generateSwapFees();
            userXAta = (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner);
            userYAta = (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner);
            userRewardAta = (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.rewards[0].publicKey, keypair.publicKey, true, dlmm.rewards[0].owner);
        });
        const assertUserTokenBalanceWithDelta = (beforeAccount, afterAccount, expectedAmount) => {
            const before = (0, spl_token_1.unpackAccount)(web3_js_1.PublicKey.default, beforeAccount, beforeAccount.owner);
            const after = (0, spl_token_1.unpackAccount)(web3_js_1.PublicKey.default, afterAccount, afterAccount.owner);
            const delta = before.amount > after.amount
                ? before.amount - after.amount
                : after.amount - before.amount;
            const deltaBn = new bn_js_1.default(delta.toString());
            expect(deltaBn.toString()).toBe(expectedAmount.toString());
        };
        describe("Claim swap fee", () => {
            it("Claim all swap fees", async () => {
                const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
                const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
                const [beforeWidePosition, beforeTightPosition] = await Promise.all([
                    dlmm.getPosition(positionKeypair0.publicKey),
                    dlmm.getPosition(positionKeypair1.publicKey),
                ]);
                const totalClaimableFeeX = beforeWidePosition.positionData.feeXExcludeTransferFee.add(beforeTightPosition.positionData.feeXExcludeTransferFee);
                const totalClaimableFeeY = beforeWidePosition.positionData.feeYExcludeTransferFee.add(beforeTightPosition.positionData.feeYExcludeTransferFee);
                const claimFeeTxs = await dlmm.claimAllSwapFee({
                    owner: keypair.publicKey,
                    positions: [beforeWidePosition, beforeTightPosition],
                });
                expect(claimFeeTxs.length).toBeGreaterThanOrEqual(1);
                await Promise.all(claimFeeTxs.map((tx) => (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [keypair])));
                const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
                assertUserTokenBalanceWithDelta(beforeUserXAccount, afterUserXAccount, totalClaimableFeeX);
                assertUserTokenBalanceWithDelta(beforeUserYAccount, afterUserYAccount, totalClaimableFeeY);
                const [afterWidePosition, afterTightPosition] = await Promise.all([
                    dlmm.getPosition(positionKeypair0.publicKey),
                    dlmm.getPosition(positionKeypair1.publicKey),
                ]);
                expect(afterWidePosition.positionData.feeX.isZero()).toBeTruthy();
                expect(afterWidePosition.positionData.feeY.isZero()).toBeTruthy();
                expect(afterTightPosition.positionData.feeX.isZero()).toBeTruthy();
                expect(afterTightPosition.positionData.feeY.isZero()).toBeTruthy();
            });
            it("Claim swap fee", async () => {
                const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
                for (const positionKey of [
                    positionKeypair0.publicKey,
                    positionKeypair1.publicKey,
                ]) {
                    const beforePosition = await dlmm.getPosition(positionKey);
                    const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
                    const claimFeeTxs = await dlmm.claimSwapFee({
                        owner: keypair.publicKey,
                        position: beforePosition,
                    });
                    await (0, web3_js_1.sendAndConfirmTransaction)(connection, claimFeeTxs, [keypair]);
                    const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
                    assertUserTokenBalanceWithDelta(beforeUserXAccount, afterUserXAccount, beforePosition.positionData.feeXExcludeTransferFee);
                    assertUserTokenBalanceWithDelta(beforeUserYAccount, afterUserYAccount, beforePosition.positionData.feeYExcludeTransferFee);
                    const afterPosition = await dlmm.getPosition(positionKey);
                    expect(afterPosition.positionData.feeX.isZero()).toBeTruthy();
                    expect(afterPosition.positionData.feeY.isZero()).toBeTruthy();
                }
            });
        });
        describe("Claim rewards", () => {
            beforeEach(async () => {
                // Generate some fees
                await new Promise((res) => setTimeout(res, 1000));
            });
            it("Claim reward", async () => {
                for (const positionKey of [
                    positionKeypair0.publicKey,
                    positionKeypair1.publicKey,
                ]) {
                    const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
                    const position = await dlmm.getPosition(positionKey);
                    const beforeUserRewardAccount = await connection.getAccountInfo(userRewardAta);
                    const claimTxs = await dlmm.claimLMReward({
                        owner: keypair.publicKey,
                        position,
                    });
                    await (0, web3_js_1.sendAndConfirmTransaction)(connection, claimTxs, [keypair]);
                    const afterUserRewardAccount = await connection.getAccountInfo(userRewardAta);
                    const beforeUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, beforeUserRewardAccount, beforeUserRewardAccount.owner);
                    const afterUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, afterUserRewardAccount, afterUserRewardAccount.owner);
                    const claimedReward = new bn_js_1.default((afterUserReward.amount - beforeUserReward.amount).toString());
                    expect(claimedReward.gte(position.positionData.rewardOneExcludeTransferFee)).toBeTruthy();
                }
            });
            it("Claim all rewards", async () => {
                const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
                const beforeUserRewardAccount = await connection.getAccountInfo(userRewardAta);
                const [beforeWidePosition, beforeTightPosition] = await Promise.all([
                    dlmm.getPosition(positionKeypair0.publicKey),
                    dlmm.getPosition(positionKeypair1.publicKey),
                ]);
                const totalClaimableReward0 = beforeWidePosition.positionData.rewardOneExcludeTransferFee.add(beforeTightPosition.positionData.rewardOneExcludeTransferFee);
                const claimTxs = await dlmm.claimAllLMRewards({
                    owner: keypair.publicKey,
                    positions: [beforeWidePosition, beforeTightPosition],
                });
                expect(claimTxs.length).toBeGreaterThanOrEqual(1);
                await Promise.all(claimTxs.map((tx) => (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [keypair])));
                const afterUserRewardAccount = await connection.getAccountInfo(userRewardAta);
                const beforeUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, beforeUserRewardAccount, beforeUserRewardAccount.owner);
                const afterUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, afterUserRewardAccount, afterUserRewardAccount.owner);
                const claimedAmount = new bn_js_1.default((BigInt(afterUserReward.amount) - BigInt(beforeUserReward.amount)).toString());
                expect(claimedAmount.gte(totalClaimableReward0)).toBeTruthy();
                const [afterWidePosition, afterTightPosition] = await Promise.all([
                    dlmm.getPosition(positionKeypair0.publicKey),
                    dlmm.getPosition(positionKeypair1.publicKey),
                ]);
                expect(afterWidePosition.positionData.rewardOneExcludeTransferFee.lt(beforeWidePosition.positionData.rewardOneExcludeTransferFee)).toBeTruthy();
                expect(afterTightPosition.positionData.rewardOneExcludeTransferFee.lt(beforeTightPosition.positionData.rewardOneExcludeTransferFee)).toBeTruthy();
            });
        });
        describe("Claim fees and rewards together", () => {
            beforeEach(async () => {
                // Generate some fees
                await new Promise((res) => setTimeout(res, 1000));
            });
            it("Claim fee and reward by position", async () => {
                for (const positionKey of [
                    positionKeypair0.publicKey,
                    positionKeypair1.publicKey,
                ]) {
                    const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
                    const beforePositionState = await dlmm.getPosition(positionKey);
                    const [beforeUserRewardAccount, beforeUserXAccount, beforeUserYAccount,] = await connection.getMultipleAccountsInfo([
                        userRewardAta,
                        userXAta,
                        userYAta,
                    ]);
                    const claimTxs = await dlmm.claimAllRewardsByPosition({
                        position: beforePositionState,
                        owner: keypair.publicKey,
                    });
                    expect(claimTxs.length).toBeGreaterThanOrEqual(1);
                    await Promise.all(claimTxs.map((tx) => {
                        return (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [keypair]);
                    }));
                    const afterPositionState = await dlmm.getPosition(positionKey);
                    expect(afterPositionState.positionData.feeX.isZero()).toBeTruthy();
                    expect(afterPositionState.positionData.feeY.isZero()).toBeTruthy();
                    const [afterUserRewardAccount, afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([
                        userRewardAta,
                        userXAta,
                        userYAta,
                    ]);
                    const beforeUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, beforeUserRewardAccount, beforeUserRewardAccount.owner);
                    const afterUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, afterUserRewardAccount, afterUserRewardAccount.owner);
                    const actualClaimedReward = new bn_js_1.default((afterUserReward.amount - beforeUserReward.amount).toString());
                    expect(actualClaimedReward.gte(beforePositionState.positionData.rewardOneExcludeTransferFee)).toBeTruthy();
                    const beforeUserX = (0, spl_token_1.unpackAccount)(userXAta, beforeUserXAccount, beforeUserXAccount.owner);
                    const afterUserX = (0, spl_token_1.unpackAccount)(userXAta, afterUserXAccount, afterUserXAccount.owner);
                    const claimedFeeX = new bn_js_1.default((afterUserX.amount - beforeUserX.amount).toString());
                    expect(claimedFeeX.toString()).toBe(beforePositionState.positionData.feeXExcludeTransferFee.toString());
                    const beforeUserY = (0, spl_token_1.unpackAccount)(userYAta, beforeUserYAccount, beforeUserYAccount.owner);
                    const afterUserY = (0, spl_token_1.unpackAccount)(userYAta, afterUserYAccount, afterUserYAccount.owner);
                    const claimedFeeY = new bn_js_1.default((afterUserY.amount - beforeUserY.amount).toString());
                    expect(claimedFeeY.toString()).toBe(beforePositionState.positionData.feeYExcludeTransferFee.toString());
                }
            });
            it("Claim all positions fees and rewards", async () => {
                const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
                const [beforeWidePosition, beforeTightPosition] = await Promise.all([
                    dlmm.getPosition(positionKeypair0.publicKey),
                    dlmm.getPosition(positionKeypair1.publicKey),
                ]);
                const [beforeUserRewardAccount, beforeUserXAccount, beforeUserYAccount,] = await connection.getMultipleAccountsInfo([
                    userRewardAta,
                    userXAta,
                    userYAta,
                ]);
                const totalClaimableFeeX = beforeWidePosition.positionData.feeXExcludeTransferFee.add(beforeTightPosition.positionData.feeXExcludeTransferFee);
                const totalClaimableFeeY = beforeWidePosition.positionData.feeYExcludeTransferFee.add(beforeTightPosition.positionData.feeYExcludeTransferFee);
                const totalClaimableReward = beforeWidePosition.positionData.rewardOneExcludeTransferFee.add(beforeTightPosition.positionData.rewardOneExcludeTransferFee);
                const claimTxs = await dlmm.claimAllRewards({
                    owner: keypair.publicKey,
                    positions: [beforeWidePosition, beforeTightPosition],
                });
                expect(claimTxs.length).toBeGreaterThanOrEqual(1);
                await Promise.all(claimTxs.map((tx) => {
                    return (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [keypair]);
                }));
                const [afterUserRewardAccount, afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([
                    userRewardAta,
                    userXAta,
                    userYAta,
                ]);
                const [afterWidePosition, afterTightPosition] = await Promise.all([
                    dlmm.getPosition(positionKeypair0.publicKey),
                    dlmm.getPosition(positionKeypair1.publicKey),
                ]);
                expect(afterWidePosition.positionData.feeX.isZero()).toBeTruthy();
                expect(afterWidePosition.positionData.feeY.isZero()).toBeTruthy();
                expect(afterTightPosition.positionData.feeX.isZero()).toBeTruthy();
                expect(afterTightPosition.positionData.feeY.isZero()).toBeTruthy();
                const beforeUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, beforeUserRewardAccount, beforeUserRewardAccount.owner);
                const afterUserReward = (0, spl_token_1.unpackAccount)(userRewardAta, afterUserRewardAccount, afterUserRewardAccount.owner);
                const actualClaimedReward = new bn_js_1.default((afterUserReward.amount - beforeUserReward.amount).toString());
                expect(actualClaimedReward.gte(totalClaimableReward)).toBeTruthy();
                const beforeUserX = (0, spl_token_1.unpackAccount)(userXAta, beforeUserXAccount, beforeUserXAccount.owner);
                const afterUserX = (0, spl_token_1.unpackAccount)(userXAta, afterUserXAccount, afterUserXAccount.owner);
                const claimedFeeX = new bn_js_1.default((afterUserX.amount - beforeUserX.amount).toString());
                expect(claimedFeeX.toString()).toBe(totalClaimableFeeX.toString());
                const beforeUserY = (0, spl_token_1.unpackAccount)(userYAta, beforeUserYAccount, beforeUserYAccount.owner);
                const afterUserY = (0, spl_token_1.unpackAccount)(userYAta, afterUserYAccount, afterUserYAccount.owner);
                const claimedFeeY = new bn_js_1.default((afterUserY.amount - beforeUserY.amount).toString());
                expect(claimedFeeY.toString()).toBe(totalClaimableFeeY.toString());
            });
        });
    });
    describe("Position fetcher", () => {
        const pairWithPositionKey = [];
        beforeAll(async () => {
            const pairs = await dlmm_1.DLMM.getLbPairs(connection, opt);
            for (const pair of pairs) {
                const userKeypair = web3_js_1.Keypair.generate();
                const airdropSig = await connection.requestAirdrop(userKeypair.publicKey, 1 * web3_js_1.LAMPORTS_PER_SOL);
                await connection.confirmTransaction(airdropSig, "confirmed");
                const positionKeypair = web3_js_1.Keypair.generate();
                const dlmm = await dlmm_1.DLMM.create(connection, pair.publicKey, opt);
                const minBinId = -30;
                const maxBinId = 30;
                const createPositionAndBinArraysTx = await dlmm.createEmptyPosition({
                    positionPubKey: positionKeypair.publicKey,
                    minBinId,
                    maxBinId,
                    user: userKeypair.publicKey,
                });
                await (0, web3_js_1.sendAndConfirmTransaction)(connection, createPositionAndBinArraysTx, [userKeypair, positionKeypair]);
                pairWithPositionKey.push({
                    pair: pair.publicKey,
                    position: positionKeypair.publicKey,
                    user: userKeypair.publicKey,
                });
            }
        });
        it("Load position by user and pair successfully", async () => {
            for (const { pair, position, user } of pairWithPositionKey) {
                const dlmm = await dlmm_1.DLMM.create(connection, pair, opt);
                const { userPositions } = await dlmm.getPositionsByUserAndLbPair(user);
                expect(userPositions.length).toBe(1);
                expect(userPositions.find((x) => x.publicKey.equals(position))).toBeDefined();
                expect(userPositions.filter((x) => x.positionData.owner.equals(user)).length).toBe(userPositions.length);
            }
        });
        it("Load all positions by user successfully", async () => {
            const pairKeyedPosition = await dlmm_1.DLMM.getAllLbPairPositionsByUser(connection, keypair.publicKey, opt);
            const positionContainers = Array.from(pairKeyedPosition.values());
            const positions = positionContainers.flatMap((x) => x.lbPairPositionsData);
            for (const position of positions) {
                expect(position.positionData.owner.equals(keypair.publicKey)).toBeTruthy();
            }
        });
    });
    describe("Remove liquidity", () => {
        beforeAll(async () => {
            await generateSwapFees();
            // Generate some reward
            await new Promise((res) => setTimeout(res, 1000));
        });
        it("Remove liquidity without claim and close successfully", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const beforePosition = await dlmm.getPosition(positionKeypair0.publicKey);
            const fromBinId = dlmm.lbPair.activeId - 1;
            const toBinId = dlmm.lbPair.activeId + 1;
            let expectedAmountX = new bn_js_1.default(0);
            let expectedAmountY = new bn_js_1.default(0);
            const userXAta = (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner);
            const userYAta = (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner);
            const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
            for (const binData of beforePosition.positionData.positionBinData) {
                if (binData.binId >= fromBinId && binData.binId <= toBinId) {
                    expect(new bn_js_1.default(binData.positionLiquidity).isZero()).toBeFalsy();
                    expectedAmountX = expectedAmountX.add(new bn_js_1.default(binData.positionXAmount));
                    expectedAmountY = expectedAmountY.add(new bn_js_1.default(binData.positionYAmount));
                }
            }
            const expectedAmountXExcludeTranferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(expectedAmountX, dlmm.tokenX.mint, dlmm.clock.epoch.toNumber()).amount;
            const expectedAmountYExcludeTranferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(expectedAmountY, dlmm.tokenY.mint, dlmm.clock.epoch.toNumber()).amount;
            const removeLiquidityTxs = await dlmm.removeLiquidity({
                position: positionKeypair0.publicKey,
                fromBinId,
                toBinId,
                bps: new bn_js_1.default(constants_1.BASIS_POINT_MAX),
                user: keypair.publicKey,
                shouldClaimAndClose: false,
            });
            expect(Array.isArray(removeLiquidityTxs)).toBeFalsy();
            await (0, web3_js_1.sendAndConfirmTransaction)(connection, removeLiquidityTxs, [keypair]);
            const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
            const beforeUserX = (0, spl_token_1.unpackAccount)(userXAta, beforeUserXAccount, beforeUserXAccount.owner);
            const beforeUserY = (0, spl_token_1.unpackAccount)(userYAta, beforeUserYAccount, beforeUserYAccount.owner);
            const afterUserX = (0, spl_token_1.unpackAccount)(userXAta, afterUserXAccount, afterUserXAccount.owner);
            const afterUserY = (0, spl_token_1.unpackAccount)(userYAta, afterUserYAccount, afterUserYAccount.owner);
            const amountX = new bn_js_1.default((afterUserX.amount - beforeUserX.amount).toString());
            const amountY = new bn_js_1.default((afterUserY.amount - beforeUserY.amount).toString());
            expect(amountX.toString()).toBe(expectedAmountXExcludeTranferFee.toString());
            expect(amountY.toString()).toBe(expectedAmountYExcludeTranferFee.toString());
        });
        it("Remove liquidity with claim and close successfully", async () => {
            const dlmm = await dlmm_1.DLMM.create(connection, pairKey, opt);
            const beforePosition = await dlmm.getPosition(positionKeypair0.publicKey);
            const fromBinId = beforePosition.positionData.lowerBinId;
            const toBinId = beforePosition.positionData.upperBinId;
            let expectedAmountX = new bn_js_1.default(0);
            let expectedAmountY = new bn_js_1.default(0);
            const userXAta = (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenX.publicKey, keypair.publicKey, true, dlmm.tokenX.owner);
            const userYAta = (0, spl_token_1.getAssociatedTokenAddressSync)(dlmm.tokenY.publicKey, keypair.publicKey, true, dlmm.tokenY.owner);
            const [beforeUserXAccount, beforeUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
            for (const binData of beforePosition.positionData.positionBinData) {
                if (binData.binId >= fromBinId && binData.binId <= toBinId) {
                    expectedAmountX = expectedAmountX
                        .add(new bn_js_1.default(binData.positionXAmount))
                        .add(new bn_js_1.default(binData.positionFeeXAmount));
                    expectedAmountY = expectedAmountY
                        .add(new bn_js_1.default(binData.positionYAmount))
                        .add(new bn_js_1.default(binData.positionFeeYAmount));
                }
            }
            const expectedAmountXExcludeTranferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(expectedAmountX, dlmm.tokenX.mint, dlmm.clock.epoch.toNumber()).amount;
            const expectedAmountYExcludeTranferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(expectedAmountY, dlmm.tokenY.mint, dlmm.clock.epoch.toNumber()).amount;
            const removeLiquidityTxs = (await dlmm.removeLiquidity({
                position: positionKeypair0.publicKey,
                fromBinId,
                toBinId,
                bps: new bn_js_1.default(constants_1.BASIS_POINT_MAX),
                user: keypair.publicKey,
                shouldClaimAndClose: true,
            }));
            expect(Array.isArray(removeLiquidityTxs)).toBeTruthy();
            expect(removeLiquidityTxs.length).toBeGreaterThan(1);
            for (const tx of removeLiquidityTxs) {
                await (0, web3_js_1.sendAndConfirmTransaction)(connection, tx, [keypair]);
            }
            const [afterUserXAccount, afterUserYAccount] = await connection.getMultipleAccountsInfo([userXAta, userYAta]);
            const beforeUserX = (0, spl_token_1.unpackAccount)(userXAta, beforeUserXAccount, beforeUserXAccount.owner);
            const beforeUserY = (0, spl_token_1.unpackAccount)(userYAta, beforeUserYAccount, beforeUserYAccount.owner);
            const afterUserX = (0, spl_token_1.unpackAccount)(userXAta, afterUserXAccount, afterUserXAccount.owner);
            const afterUserY = (0, spl_token_1.unpackAccount)(userYAta, afterUserYAccount, afterUserYAccount.owner);
            const amountX = new bn_js_1.default((afterUserX.amount - beforeUserX.amount).toString());
            const amountY = new bn_js_1.default((afterUserY.amount - beforeUserY.amount).toString());
            // LTE due to multiple transfer fee round down precision loss
            expect(amountX.lte(expectedAmountXExcludeTranferFee)).toBeTruthy();
            expect(amountY.lte(expectedAmountYExcludeTranferFee)).toBeTruthy();
            const positionAccount = await connection.getAccountInfo(positionKeypair0.publicKey);
            expect(positionAccount).toBeNull();
        });
    });
});
