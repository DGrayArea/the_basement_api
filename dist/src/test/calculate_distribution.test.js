"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const babar_1 = __importDefault(require("babar"));
const fs_1 = __importDefault(require("fs"));
const helpers_1 = require("../dlmm/helpers");
const types_1 = require("../dlmm/types");
expect.extend({
    toBeCloseTo(received, expected, precision) {
        const pass = Math.abs(received - expected) <= precision;
        return {
            pass,
            message: () => `expected ${received} to be close to ${expected} with precision ${precision}`,
        };
    },
});
// Print out distribution in console for debugging
function debugDistributionChart(distributions) {
    const bars = [];
    for (const dist of distributions) {
        bars.push([
            dist.binId,
            dist.xAmountBpsOfTotal.add(dist.yAmountBpsOfTotal).toNumber(),
        ]);
    }
    console.log((0, babar_1.default)(bars));
}
const connection = new web3_js_1.Connection("http://127.0.0.1:8899", "confirmed");
const keypairBuffer = fs_1.default.readFileSync("../keys/localnet/admin-bossj3JvwiNK7pvjr149DqdtJxf2gdygbcmEPTkb2F1.json", "utf-8");
const keypair = web3_js_1.Keypair.fromSecretKey(new Uint8Array(JSON.parse(keypairBuffer)));
describe("calculate_distribution", () => {
    const mint = web3_js_1.Keypair.generate();
    const mintWithTransferFee = web3_js_1.Keypair.generate();
    let mintAccount = null;
    let mintWithTransferFeeAccount = null;
    let clock;
    beforeAll(async () => {
        const decimal = 6;
        await connection.requestAirdrop(keypair.publicKey, 10 * web3_js_1.LAMPORTS_PER_SOL);
        // 1. Create mint
        await (0, spl_token_1.createMint)(connection, keypair, keypair.publicKey, null, decimal, mint, {
            commitment: "confirmed",
        }, spl_token_1.TOKEN_PROGRAM_ID);
        // 2. Create mint with transfer fee
        const extensions = [spl_token_1.ExtensionType.TransferFeeConfig];
        const mintLen = (0, spl_token_1.getMintLen)(extensions);
        const feeBasisPoint = 5000;
        const maxFee = BigInt(100_000 * 10 ** decimal);
        const minLamports = await connection.getMinimumBalanceForRentExemption(mintLen);
        const transaction = new web3_js_1.Transaction()
            .add(web3_js_1.SystemProgram.createAccount({
            fromPubkey: keypair.publicKey,
            newAccountPubkey: mintWithTransferFee.publicKey,
            space: mintLen,
            lamports: minLamports,
            programId: spl_token_1.TOKEN_2022_PROGRAM_ID,
        }))
            .add((0, spl_token_1.createInitializeTransferFeeConfigInstruction)(mintWithTransferFee.publicKey, keypair.publicKey, keypair.publicKey, feeBasisPoint, maxFee, spl_token_1.TOKEN_2022_PROGRAM_ID))
            .add((0, spl_token_1.createInitializeMintInstruction)(mintWithTransferFee.publicKey, decimal, keypair.publicKey, null, spl_token_1.TOKEN_2022_PROGRAM_ID));
        await (0, web3_js_1.sendAndConfirmTransaction)(connection, transaction, [keypair, mintWithTransferFee], {
            commitment: "confirmed",
        });
        const accounts = await connection.getMultipleAccountsInfo([mint.publicKey, mintWithTransferFee.publicKey, web3_js_1.SYSVAR_CLOCK_PUBKEY], {
            commitment: "confirmed",
        });
        mintAccount = (0, spl_token_1.unpackMint)(mint.publicKey, accounts[0], spl_token_1.TOKEN_PROGRAM_ID);
        mintWithTransferFeeAccount = (0, spl_token_1.unpackMint)(mintWithTransferFee.publicKey, accounts[1], spl_token_1.TOKEN_2022_PROGRAM_ID);
        clock = types_1.ClockLayout.decode(accounts[2].data);
    });
    describe("consists of only 1 bin id", () => {
        describe("when the deposit bin at the left of the active bin", () => {
            const binIds = [-10000];
            const activeBin = -3333;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(1);
            expect(distributions[0].binId).toBe(binIds[0]);
            expect(distributions[0].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[0].yAmountBpsOfTotal.toNumber()).toBe(10000);
        });
        describe("when the deposit bin at the right of the active bin", () => {
            const binIds = [-2222];
            const activeBin = -3333;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(1);
            expect(distributions[0].binId).toBe(binIds[0]);
            expect(distributions[0].xAmountBpsOfTotal.toNumber()).toBe(10000);
            expect(distributions[0].yAmountBpsOfTotal.toNumber()).toBe(0);
        });
        describe("when the deposit bin is the active bin", () => {
            const binIds = [-3333];
            const activeBin = -3333;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(1);
            expect(distributions[0].binId).toBe(binIds[0]);
            expect(distributions[0].xAmountBpsOfTotal.toNumber()).toBe(10000);
            expect(distributions[0].yAmountBpsOfTotal.toNumber()).toBe(10000);
        });
    });
    describe("spot distribution", () => {
        test("should return correct distribution with equal delta", () => {
            const binIds = [1, 2, 3, 4, 5];
            const activeBin = 3;
            const distributions = (0, helpers_1.calculateSpotDistribution)(activeBin, binIds);
            const yNonActiveBinPct = Math.floor(10_000 / 2.5);
            const xNonActiveBinPct = Math.floor(10_000 / 2.5);
            expect(distributions[0].binId).toBe(1);
            expect(distributions[0].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[0].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[1].binId).toBe(2);
            expect(distributions[1].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[1].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[2].binId).toBe(3);
            expect(distributions[2].yAmountBpsOfTotal.toNumber()).toBe(Math.floor(yNonActiveBinPct * 0.5));
            expect(distributions[2].xAmountBpsOfTotal.toNumber()).toBe(Math.floor(xNonActiveBinPct * 0.5));
            expect(distributions[3].binId).toBe(4);
            expect(distributions[3].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[3].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            expect(distributions[4].binId).toBe(5);
            expect(distributions[4].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[4].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
        });
        test("should return correct distribution with unequal delta", () => {
            const binIds = [1, 2, 3, 4, 5];
            const activeBin = 4;
            const distributions = (0, helpers_1.calculateSpotDistribution)(activeBin, binIds);
            const yNonActiveBinPct = Math.floor(10_000 / 3.5);
            const xNonActiveBinPct = Math.floor(10_000 / 1.5);
            expect(distributions[0].binId).toBe(1);
            expect(distributions[0].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[0].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[1].binId).toBe(2);
            expect(distributions[1].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[1].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[2].binId).toBe(3);
            expect(distributions[2].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[2].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[3].binId).toBe(4);
            // Precision loss added to active bin
            expect(distributions[3].yAmountBpsOfTotal.toNumber()).toBeCloseTo(Math.floor(yNonActiveBinPct * 0.5), 1);
            expect(distributions[3].xAmountBpsOfTotal.toNumber()).toBeCloseTo(Math.floor(xNonActiveBinPct * 0.5), 1);
            expect(distributions[4].binId).toBe(5);
            expect(distributions[4].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[4].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
        });
        test("should return correct distribution with liquidity at the left side of the active bin", () => {
            const binIds = [1, 2, 3, 4, 5];
            const activeBin = 10;
            const distributions = (0, helpers_1.calculateSpotDistribution)(activeBin, binIds);
            const yNonActiveBinPct = Math.floor(10_000 / 5);
            expect(distributions[0].binId).toBe(1);
            expect(distributions[0].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[0].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[1].binId).toBe(2);
            expect(distributions[1].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[1].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[2].binId).toBe(3);
            expect(distributions[2].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[2].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[3].binId).toBe(4);
            expect(distributions[3].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[3].xAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[4].binId).toBe(5);
            expect(distributions[4].yAmountBpsOfTotal.toNumber()).toBe(yNonActiveBinPct);
            expect(distributions[4].xAmountBpsOfTotal.toNumber()).toBe(0);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(0);
            expect(yTokenTotalBps).toBe(10_000);
        });
        test("should return correct distribution with liquidity at the right side of the active bin", () => {
            const binIds = [5, 6, 7, 8, 9];
            const activeBin = 1;
            const distributions = (0, helpers_1.calculateSpotDistribution)(activeBin, binIds);
            const xNonActiveBinPct = Math.floor(10_000 / 5);
            expect(distributions[0].binId).toBe(5);
            expect(distributions[0].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[0].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            expect(distributions[1].binId).toBe(6);
            expect(distributions[1].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[1].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            expect(distributions[2].binId).toBe(7);
            expect(distributions[2].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[2].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            expect(distributions[3].binId).toBe(8);
            expect(distributions[3].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[3].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            expect(distributions[4].binId).toBe(9);
            expect(distributions[4].yAmountBpsOfTotal.toNumber()).toBe(0);
            expect(distributions[4].xAmountBpsOfTotal.toNumber()).toBe(xNonActiveBinPct);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(0);
        });
    });
    describe("curve distribution", () => {
        // Assert correct distribution when liquidity is surrounding the active bin
        function assertDistributionAroundActiveBin(activeBin, distributions) {
            let beforeXBps = undefined;
            let beforeYBps = undefined;
            for (const dist of distributions) {
                const { binId, xAmountBpsOfTotal, yAmountBpsOfTotal } = dist;
                if (binId < activeBin) {
                    expect(xAmountBpsOfTotal.isZero()).toBeTruthy();
                    expect(yAmountBpsOfTotal.isZero()).toBeFalsy();
                    if (beforeYBps != undefined) {
                        // The bps should be increasing
                        expect(beforeYBps < yAmountBpsOfTotal.toNumber()).toBeTruthy();
                    }
                    beforeYBps = yAmountBpsOfTotal.toNumber();
                }
                else if (binId == activeBin) {
                    expect(xAmountBpsOfTotal.isZero()).toBeFalsy();
                    expect(yAmountBpsOfTotal.isZero()).toBeFalsy();
                }
                else {
                    expect(xAmountBpsOfTotal.isZero()).toBeFalsy();
                    expect(yAmountBpsOfTotal.isZero()).toBeTruthy();
                    if (beforeXBps != undefined) {
                        // The bps should be decreasing
                        expect(beforeXBps > xAmountBpsOfTotal.toNumber()).toBeTruthy();
                    }
                    beforeXBps = xAmountBpsOfTotal.toNumber();
                }
            }
        }
        test("should return correct distribution with liquidity concentrated around right side of the active bin", () => {
            const binIds = [
                5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516,
                5517, 5518, 5519, 5520, 5521,
            ];
            const activeBin = 5518;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity concentrated around left side of the active bin", () => {
            const binIds = [
                5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516,
                5517, 5518, 5519, 5520, 5521,
            ];
            const activeBin = 5508;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity concentrated around the active bin", () => {
            const binIds = [
                5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516,
                5517, 5518, 5519, 5520, 5521,
            ];
            const activeBin = 5513;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity to far right of the active bin", () => {
            const binIds = [5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513];
            const activeBin = 3000;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(0);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity to far left of the active bin", () => {
            const binIds = [5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513];
            const activeBin = 8000;
            const distributions = (0, helpers_1.calculateNormalDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(0);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
    });
    describe("bid ask distribution", () => {
        // Assert correct distribution when liquidity is surrounding the active bin
        function assertDistributionAroundActiveBin(activeBin, distributions) {
            let beforeXBps = undefined;
            let beforeYBps = undefined;
            for (const dist of distributions) {
                const { binId, xAmountBpsOfTotal, yAmountBpsOfTotal } = dist;
                if (binId < activeBin) {
                    expect(xAmountBpsOfTotal.isZero()).toBeTruthy();
                    expect(yAmountBpsOfTotal.isZero()).toBeFalsy();
                    if (beforeYBps != undefined) {
                        // The bps should be decreasing
                        expect(beforeYBps > yAmountBpsOfTotal.toNumber()).toBeTruthy();
                    }
                    beforeYBps = yAmountBpsOfTotal.toNumber();
                }
                else if (binId == activeBin) {
                    expect(xAmountBpsOfTotal.isZero()).toBeFalsy();
                    expect(yAmountBpsOfTotal.isZero()).toBeFalsy();
                }
                else {
                    expect(xAmountBpsOfTotal.isZero()).toBeFalsy();
                    expect(yAmountBpsOfTotal.isZero()).toBeTruthy();
                    if (beforeXBps != undefined) {
                        // The bps should be increasing
                        expect(beforeXBps < xAmountBpsOfTotal.toNumber()).toBeTruthy();
                    }
                    beforeXBps = xAmountBpsOfTotal.toNumber();
                }
            }
        }
        test("should return correct distribution with liquidity concentrated around right side of the active bin", () => {
            const binIds = [
                5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516,
                5517, 5518, 5519, 5520, 5521,
            ];
            const activeBin = 5518;
            const distributions = (0, helpers_1.calculateBidAskDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity concentrated around left side of the active bin", () => {
            const binIds = [
                5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516,
                5517, 5518, 5519, 5520, 5521,
            ];
            const activeBin = 5508;
            const distributions = (0, helpers_1.calculateBidAskDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity concentrated around the active bin", () => {
            const binIds = [
                5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513, 5514, 5515, 5516,
                5517, 5518, 5519, 5520, 5521,
            ];
            const activeBin = 5513;
            const distributions = (0, helpers_1.calculateBidAskDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity to far right of the active bin", () => {
            const binIds = [5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513];
            const activeBin = 3000;
            const distributions = (0, helpers_1.calculateBidAskDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(10_000);
            expect(yTokenTotalBps).toBe(0);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("should return correct distribution with liquidity to far left of the active bin", () => {
            const binIds = [5505, 5506, 5507, 5508, 5509, 5510, 5511, 5512, 5513];
            const activeBin = 8000;
            const distributions = (0, helpers_1.calculateBidAskDistribution)(activeBin, binIds);
            expect(distributions.length).toBe(binIds.length);
            const xTokenTotalBps = distributions.reduce((acc, d) => acc + d.xAmountBpsOfTotal.toNumber(), 0);
            const yTokenTotalBps = distributions.reduce((acc, d) => acc + d.yAmountBpsOfTotal.toNumber(), 0);
            expect(xTokenTotalBps).toBe(0);
            expect(yTokenTotalBps).toBe(10_000);
            debugDistributionChart(distributions);
            assertDistributionAroundActiveBin(activeBin, distributions);
        });
        test("to weight distribution", () => {
            const binIds = [
                -3563, -3562, -3561, -3560, -3559, -3558, -3557, -3556, -3555,
            ];
            const activeBin = -3556;
            const distributions = (0, helpers_1.calculateSpotDistribution)(activeBin, binIds);
            let weightDistribution = (0, helpers_1.toWeightDistribution)(new anchor_1.BN(1000000000), new anchor_1.BN(57000000), distributions, 8);
            console.log(weightDistribution);
            const bars = [];
            for (const dist of weightDistribution) {
                bars.push([dist.binId, dist.weight]);
            }
            console.log((0, babar_1.default)(bars));
        });
        test("to amount both side by strategy", () => {
            let activeId = 45;
            let minBinId = 20;
            let maxBinId = 70;
            let binStep = 10;
            let amount = new anchor_1.BN(10000);
            // 1. Without transfer fee
            let amountInBins = (0, helpers_1.toAmountsBothSideByStrategy)(activeId, binStep, minBinId, maxBinId, amount, amount, new anchor_1.BN(0), new anchor_1.BN(0), types_1.StrategyType.Spot, mintAccount, mintAccount, clock);
            let totalAmountX = amountInBins.reduce((total, { amountX }) => {
                return total.add(amountX);
            }, new anchor_1.BN(0));
            let totalAmountY = amountInBins.reduce((total, { amountY }) => {
                return total.add(amountY);
            }, new anchor_1.BN(0));
            // Precision loss
            let diff = amount.sub(totalAmountX);
            expect(diff.lt(new anchor_1.BN(30))).toBeTruthy();
            diff = amount.sub(totalAmountY);
            expect(diff.lt(new anchor_1.BN(30))).toBeTruthy();
            // 2. With transfer fee
            amountInBins = (0, helpers_1.toAmountsBothSideByStrategy)(activeId, binStep, minBinId, maxBinId, amount, amount, new anchor_1.BN(0), new anchor_1.BN(0), types_1.StrategyType.Spot, mintWithTransferFeeAccount, mintAccount, clock);
            totalAmountX = amountInBins.reduce((total, { amountX }) => {
                return total.add(amountX);
            }, new anchor_1.BN(0));
            totalAmountY = amountInBins.reduce((total, { amountY }) => {
                return total.add(amountY);
            }, new anchor_1.BN(0));
            expect(totalAmountX.lt(amount.div(new anchor_1.BN(2)))).toBeTruthy();
            diff = amount.sub(totalAmountY);
            expect(diff.lt(new anchor_1.BN(30))).toBeTruthy();
        });
    });
});
