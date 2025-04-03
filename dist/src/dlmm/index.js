"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DLMM = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const spl_token_1 = require("@solana/spl-token");
const web3_js_1 = require("@solana/web3.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
const constants_1 = require("./constants");
const error_1 = require("./error");
const helpers_1 = require("./helpers");
const accountFilters_1 = require("./helpers/accountFilters");
const computeUnit_1 = require("./helpers/computeUnit");
const math_1 = require("./helpers/math");
const positions_1 = require("./helpers/positions");
const token_2022_1 = require("./helpers/token_2022");
const idl_1 = require("./idl");
const types_1 = require("./types");
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
class DLMM {
    pubkey;
    program;
    lbPair;
    binArrayBitmapExtension;
    tokenX;
    tokenY;
    rewards;
    clock;
    opt;
    constructor(pubkey, program, lbPair, binArrayBitmapExtension, tokenX, tokenY, rewards, clock, opt) {
        this.pubkey = pubkey;
        this.program = program;
        this.lbPair = lbPair;
        this.binArrayBitmapExtension = binArrayBitmapExtension;
        this.tokenX = tokenX;
        this.tokenY = tokenY;
        this.rewards = rewards;
        this.clock = clock;
        this.opt = opt;
    }
    /** Static public method */
    /**
     * The function `getLbPairs` retrieves a list of LB pair accounts using a connection and optional
     * parameters.
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param {Opt} [opt] - The `opt` parameter is an optional object that contains additional options
     * for the function. It can have the following properties:
     * @returns The function `getLbPairs` returns a Promise that resolves to an array of
     * `LbPairAccount` objects.
     */
    static async getLbPairs(connection, opt) {
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[opt?.cluster ?? "mainnet-beta"], provider);
        return program.account.lbPair.all();
    }
    /**
     * Retrieves the public key of a LB pair if it exists.
     * @param connection The connection to the Solana cluster.
     * @param tokenX The mint address of token X.
     * @param tokenY The mint address of token Y.
     * @param binStep The bin step of the LB pair.
     * @param baseFactor The base factor of the LB pair.
     * @param baseFeePowerFactor The base fee power factor of the LB pair. It allow small bin step to have bigger fee rate.
     * @param opt Optional parameters.
     * @returns The public key of the LB pair if it exists, or null.
     */
    static async getPairPubkeyIfExists(connection, tokenX, tokenY, binStep, baseFactor, baseFeePowerFactor, opt) {
        const cluster = opt?.cluster || "mainnet-beta";
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
        try {
            const [lbPair2Key] = (0, helpers_1.deriveLbPair2)(tokenX, tokenY, binStep, baseFactor, program.programId);
            const account2 = await program.account.lbPair.fetchNullable(lbPair2Key);
            if (account2)
                return lbPair2Key;
            const [lbPairKey] = (0, helpers_1.deriveLbPair)(tokenX, tokenY, binStep, program.programId);
            const account = await program.account.lbPair.fetchNullable(lbPairKey);
            if (account && account.parameters.baseFactor === baseFactor.toNumber()) {
                return lbPairKey;
            }
            const presetParametersWithIndex = await program.account.presetParameter2.all([
                (0, accountFilters_1.presetParameter2BinStepFilter)(binStep),
                (0, accountFilters_1.presetParameter2BaseFactorFilter)(baseFactor),
                (0, accountFilters_1.presetParameter2BaseFeePowerFactor)(baseFeePowerFactor),
            ]);
            if (presetParametersWithIndex.length > 0) {
                const possibleLbPairKeys = presetParametersWithIndex.map((account) => {
                    return (0, helpers_1.deriveLbPairWithPresetParamWithIndexKey)(account.publicKey, tokenX, tokenY, program.programId)[0];
                });
                const accounts = await (0, helpers_1.chunkedGetMultipleAccountInfos)(program.provider.connection, possibleLbPairKeys);
                for (let i = 0; i < possibleLbPairKeys.length; i++) {
                    const pairKey = possibleLbPairKeys[i];
                    const account = accounts[i];
                    if (account) {
                        return pairKey;
                    }
                }
            }
            return null;
        }
        catch (error) {
            return null;
        }
    }
    static async getCustomizablePermissionlessLbPairIfExists(connection, tokenX, tokenY, opt) {
        const cluster = opt?.cluster || "mainnet-beta";
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
        try {
            const [lpPair] = (0, helpers_1.deriveCustomizablePermissionlessLbPair)(tokenX, tokenY, program.programId);
            const account = await program.account.lbPair.fetchNullable(lpPair);
            if (account)
                return lpPair;
            return null;
        }
        catch (error) {
            return null;
        }
    }
    /**
     * The `create` function is a static method that creates a new instance of the `DLMM` class
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param {PublicKey} dlmm - The PublicKey of LB Pair.
     * @param {Opt} [opt] - The `opt` parameter is an optional object that can contain additional options
     * for the `create` function. It has the following properties:
     * @returns The `create` function returns a `Promise` that resolves to a `DLMM` object.
     */
    static async create(connection, dlmm, opt) {
        const cluster = opt?.cluster || "mainnet-beta";
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
        const binArrayBitMapExtensionPubkey = (0, helpers_1.deriveBinArrayBitmapExtension)(dlmm, program.programId)[0];
        let accountsToFetch = [
            dlmm,
            binArrayBitMapExtensionPubkey,
            web3_js_1.SYSVAR_CLOCK_PUBKEY,
        ];
        const accountsInfo = await (0, helpers_1.chunkedGetMultipleAccountInfos)(connection, accountsToFetch);
        const lbPairAccountInfoBuffer = accountsInfo[0]?.data;
        if (!lbPairAccountInfoBuffer)
            throw new Error(`LB Pair account ${dlmm.toBase58()} not found`);
        const lbPairAccInfo = program.coder.accounts.decode(program.account.lbPair.idlAccount.name, lbPairAccountInfoBuffer);
        const binArrayBitMapAccountInfoBuffer = accountsInfo[1]?.data;
        let binArrayBitMapExtensionAccInfo = null;
        if (binArrayBitMapAccountInfoBuffer) {
            binArrayBitMapExtensionAccInfo = program.coder.accounts.decode(program.account.binArrayBitmapExtension.idlAccount.name, binArrayBitMapAccountInfoBuffer);
        }
        const clockAccountInfoBuffer = accountsInfo[2]?.data;
        if (!clockAccountInfoBuffer)
            throw new Error(`Clock account not found`);
        const clock = types_1.ClockLayout.decode(clockAccountInfoBuffer);
        accountsToFetch = [
            lbPairAccInfo.reserveX,
            lbPairAccInfo.reserveY,
            lbPairAccInfo.tokenXMint,
            lbPairAccInfo.tokenYMint,
            lbPairAccInfo.rewardInfos[0].vault,
            lbPairAccInfo.rewardInfos[1].vault,
            lbPairAccInfo.rewardInfos[0].mint,
            lbPairAccInfo.rewardInfos[1].mint,
        ];
        const [reserveXAccount, reserveYAccount, tokenXMintAccount, tokenYMintAccount, reward0VaultAccount, reward1VaultAccount, reward0MintAccount, reward1MintAccount,] = await (0, helpers_1.chunkedGetMultipleAccountInfos)(program.provider.connection, accountsToFetch);
        let binArrayBitmapExtension;
        if (binArrayBitMapExtensionAccInfo) {
            binArrayBitmapExtension = {
                account: binArrayBitMapExtensionAccInfo,
                publicKey: binArrayBitMapExtensionPubkey,
            };
        }
        const reserveXBalance = spl_token_1.AccountLayout.decode(reserveXAccount.data);
        const reserveYBalance = spl_token_1.AccountLayout.decode(reserveYAccount.data);
        const mintX = (0, spl_token_1.unpackMint)(lbPairAccInfo.tokenXMint, tokenXMintAccount, tokenXMintAccount.owner);
        const mintY = (0, spl_token_1.unpackMint)(lbPairAccInfo.tokenYMint, tokenYMintAccount, tokenYMintAccount.owner);
        const [tokenXTransferHook, tokenYTransferHook, reward0TransferHook, reward1TransferHook,] = await Promise.all([
            (0, token_2022_1.getExtraAccountMetasForTransferHook)(connection, lbPairAccInfo.tokenXMint, tokenXMintAccount),
            (0, token_2022_1.getExtraAccountMetasForTransferHook)(connection, lbPairAccInfo.tokenYMint, tokenYMintAccount),
            reward0MintAccount
                ? (0, token_2022_1.getExtraAccountMetasForTransferHook)(connection, lbPairAccInfo.rewardInfos[0].mint, reward0MintAccount)
                : [],
            reward1MintAccount
                ? (0, token_2022_1.getExtraAccountMetasForTransferHook)(connection, lbPairAccInfo.rewardInfos[1].mint, reward1MintAccount)
                : [],
        ]);
        const tokenX = {
            publicKey: lbPairAccInfo.tokenXMint,
            reserve: lbPairAccInfo.reserveX,
            amount: reserveXBalance.amount,
            mint: mintX,
            owner: tokenXMintAccount.owner,
            transferHookAccountMetas: tokenXTransferHook,
        };
        const tokenY = {
            publicKey: lbPairAccInfo.tokenYMint,
            reserve: lbPairAccInfo.reserveY,
            amount: reserveYBalance.amount,
            mint: mintY,
            owner: tokenYMintAccount.owner,
            transferHookAccountMetas: tokenYTransferHook,
        };
        const reward0 = !lbPairAccInfo.rewardInfos[0].mint.equals(web3_js_1.PublicKey.default)
            ? {
                publicKey: lbPairAccInfo.rewardInfos[0].mint,
                reserve: lbPairAccInfo.rewardInfos[0].vault,
                amount: spl_token_1.AccountLayout.decode(reward0VaultAccount.data).amount,
                mint: (0, spl_token_1.unpackMint)(lbPairAccInfo.rewardInfos[0].mint, reward0MintAccount, reward0MintAccount.owner),
                owner: reward0MintAccount.owner,
                transferHookAccountMetas: reward0TransferHook,
            }
            : null;
        const reward1 = !lbPairAccInfo.rewardInfos[1].mint.equals(web3_js_1.PublicKey.default)
            ? {
                publicKey: lbPairAccInfo.rewardInfos[1].mint,
                reserve: lbPairAccInfo.rewardInfos[1].vault,
                amount: spl_token_1.AccountLayout.decode(reward1VaultAccount.data).amount,
                mint: (0, spl_token_1.unpackMint)(lbPairAccInfo.rewardInfos[1].mint, reward1MintAccount, reward1MintAccount.owner),
                owner: reward1MintAccount.owner,
                transferHookAccountMetas: reward1TransferHook,
            }
            : null;
        return new DLMM(dlmm, program, lbPairAccInfo, binArrayBitmapExtension, tokenX, tokenY, [reward0, reward1], clock, opt);
    }
    /**
     * Similar to `create` function, but it accept multiple lbPairs to be initialized.
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain network.
     * @param dlmmList - An Array of PublicKey of LB Pairs.
     * @param {Opt} [opt] - An optional parameter of type `Opt`.
     * @returns The function `createMultiple` returns a Promise that resolves to an array of `DLMM`
     * objects.
     */
    static async createMultiple(connection, dlmmList, opt) {
        const cluster = opt?.cluster || "mainnet-beta";
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
        const binArrayBitMapExtensions = dlmmList.map((lbPair) => (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]);
        const accountsToFetch = [
            ...dlmmList,
            ...binArrayBitMapExtensions,
            web3_js_1.SYSVAR_CLOCK_PUBKEY,
        ];
        let accountsInfo = await (0, helpers_1.chunkedGetMultipleAccountInfos)(connection, accountsToFetch);
        const clockAccount = accountsInfo.pop();
        const clockAccountInfoBuffer = clockAccount?.data;
        if (!clockAccountInfoBuffer)
            throw new Error(`Clock account not found`);
        const clock = types_1.ClockLayout.decode(clockAccountInfoBuffer);
        const lbPairArraysMap = new Map();
        for (let i = 0; i < dlmmList.length; i++) {
            const lbPairPubKey = dlmmList[i];
            const lbPairAccountInfoBuffer = accountsInfo[i]?.data;
            if (!lbPairAccountInfoBuffer)
                throw new Error(`LB Pair account ${lbPairPubKey.toBase58()} not found`);
            const binArrayAccInfo = program.coder.accounts.decode(program.account.lbPair.idlAccount.name, lbPairAccountInfoBuffer);
            lbPairArraysMap.set(lbPairPubKey.toBase58(), binArrayAccInfo);
        }
        const binArrayBitMapExtensionsMap = new Map();
        for (let i = dlmmList.length; i < accountsInfo.length; i++) {
            const index = i - dlmmList.length;
            const lbPairPubkey = dlmmList[index];
            const binArrayBitMapAccountInfoBuffer = accountsInfo[i]?.data;
            if (binArrayBitMapAccountInfoBuffer) {
                const binArrayBitMapExtensionAccInfo = program.coder.accounts.decode(program.account.binArrayBitmapExtension.idlAccount.name, binArrayBitMapAccountInfoBuffer);
                binArrayBitMapExtensionsMap.set(lbPairPubkey.toBase58(), binArrayBitMapExtensionAccInfo);
            }
        }
        const reservePublicKeys = Array.from(lbPairArraysMap.values())
            .map(({ reserveX, reserveY }) => [reserveX, reserveY])
            .flat();
        const tokenMintPublicKeys = Array.from(lbPairArraysMap.values())
            .map(({ tokenXMint, tokenYMint }) => [tokenXMint, tokenYMint])
            .flat();
        const rewardVaultPublicKeys = Array.from(lbPairArraysMap.values())
            .map(({ rewardInfos }) => rewardInfos.map(({ vault }) => vault))
            .flat();
        const rewardMintPublicKeys = Array.from(lbPairArraysMap.values())
            .map(({ rewardInfos }) => rewardInfos.map(({ mint }) => mint))
            .flat();
        accountsInfo = await (0, helpers_1.chunkedGetMultipleAccountInfos)(program.provider.connection, [
            ...reservePublicKeys,
            ...tokenMintPublicKeys,
            ...rewardVaultPublicKeys,
            ...rewardMintPublicKeys,
        ]);
        const offsetToTokenMint = reservePublicKeys.length;
        const offsetToRewardMint = reservePublicKeys.length +
            tokenMintPublicKeys.length +
            rewardVaultPublicKeys.length;
        const tokenMintAccounts = accountsInfo.slice(offsetToTokenMint, offsetToTokenMint + tokenMintPublicKeys.length);
        const rewardMintAccounts = accountsInfo.slice(offsetToRewardMint, offsetToRewardMint + rewardMintPublicKeys.length);
        const tokenMintsWithAccount = tokenMintPublicKeys
            .map((key, idx) => {
            return {
                mintAddress: key,
                mintAccountInfo: tokenMintAccounts[idx],
            };
        })
            .filter(({ mintAddress }) => mintAddress !== web3_js_1.PublicKey.default);
        const rewardMintsWithAccount = rewardMintPublicKeys
            .map((key, idx) => {
            return {
                mintAddress: key,
                mintAccountInfo: rewardMintAccounts[idx],
            };
        })
            .filter(({ mintAddress }) => mintAddress !== web3_js_1.PublicKey.default);
        const uniqueMintWithAccounts = Array.from(new Set(tokenMintsWithAccount.concat(rewardMintsWithAccount)));
        const mintHookAccountsMap = await (0, token_2022_1.getMultipleMintsExtraAccountMetasForTransferHook)(connection, uniqueMintWithAccounts);
        const lbClmmImpl = dlmmList.map((lbPair, index) => {
            const lbPairState = lbPairArraysMap.get(lbPair.toBase58());
            if (!lbPairState)
                throw new Error(`LB Pair ${lbPair.toBase58()} state not found`);
            const binArrayBitmapExtensionState = binArrayBitMapExtensionsMap.get(lbPair.toBase58());
            const binArrayBitmapExtensionPubkey = binArrayBitMapExtensions[index];
            let binArrayBitmapExtension = null;
            if (binArrayBitmapExtensionState) {
                binArrayBitmapExtension = {
                    account: binArrayBitmapExtensionState,
                    publicKey: binArrayBitmapExtensionPubkey,
                };
            }
            const reserveXAccountInfo = accountsInfo[index * 2];
            const reserveYAccountInfo = accountsInfo[index * 2 + 1];
            let offsetToTokenMint = reservePublicKeys.length;
            const tokenXMintAccountInfo = accountsInfo[offsetToTokenMint + index * 2];
            const tokenYMintAccountInfo = accountsInfo[offsetToTokenMint + index * 2 + 1];
            const offsetToRewardVaultAccountInfos = offsetToTokenMint + tokenMintPublicKeys.length;
            const reward0VaultAccountInfo = accountsInfo[offsetToRewardVaultAccountInfos + index * 2];
            const reward1VaultAccountInfo = accountsInfo[offsetToRewardVaultAccountInfos + index * 2 + 1];
            const offsetToRewardMintAccountInfos = offsetToRewardVaultAccountInfos + rewardVaultPublicKeys.length;
            const reward0MintAccountInfo = accountsInfo[offsetToRewardMintAccountInfos + index * 2];
            const reward1MintAccountInfo = accountsInfo[offsetToRewardMintAccountInfos + index * 2 + 1];
            if (!reserveXAccountInfo || !reserveYAccountInfo)
                throw new Error(`Reserve account for LB Pair ${lbPair.toBase58()} not found`);
            const reserveXBalance = spl_token_1.AccountLayout.decode(reserveXAccountInfo.data);
            const reserveYBalance = spl_token_1.AccountLayout.decode(reserveYAccountInfo.data);
            const mintX = (0, spl_token_1.unpackMint)(lbPairState.tokenXMint, tokenXMintAccountInfo, tokenXMintAccountInfo.owner);
            const mintY = (0, spl_token_1.unpackMint)(lbPairState.tokenYMint, tokenYMintAccountInfo, tokenYMintAccountInfo.owner);
            const tokenX = {
                publicKey: lbPairState.tokenXMint,
                reserve: lbPairState.reserveX,
                mint: mintX,
                amount: reserveXBalance.amount,
                owner: tokenXMintAccountInfo.owner,
                transferHookAccountMetas: mintHookAccountsMap.get(lbPairState.tokenXMint.toBase58()) ?? [],
            };
            const tokenY = {
                publicKey: lbPairState.tokenYMint,
                reserve: lbPairState.reserveY,
                amount: reserveYBalance.amount,
                mint: mintY,
                owner: tokenYMintAccountInfo.owner,
                transferHookAccountMetas: mintHookAccountsMap.get(lbPairState.tokenYMint.toBase58()) ?? [],
            };
            const reward0 = !lbPairState.rewardInfos[0].mint.equals(web3_js_1.PublicKey.default)
                ? {
                    publicKey: lbPairState.rewardInfos[0].mint,
                    reserve: lbPairState.rewardInfos[0].vault,
                    amount: spl_token_1.AccountLayout.decode(reward0VaultAccountInfo.data).amount,
                    mint: (0, spl_token_1.unpackMint)(lbPairState.rewardInfos[0].mint, reward0MintAccountInfo, reward0MintAccountInfo.owner),
                    owner: reward0MintAccountInfo.owner,
                    transferHookAccountMetas: mintHookAccountsMap.get(lbPairState.rewardInfos[0].mint.toBase58()) ?? [],
                }
                : null;
            const reward1 = !lbPairState.rewardInfos[1].mint.equals(web3_js_1.PublicKey.default)
                ? {
                    publicKey: lbPairState.rewardInfos[1].mint,
                    reserve: lbPairState.rewardInfos[1].vault,
                    amount: spl_token_1.AccountLayout.decode(reward1VaultAccountInfo.data).amount,
                    mint: (0, spl_token_1.unpackMint)(lbPairState.rewardInfos[1].mint, reward1MintAccountInfo, reward1MintAccountInfo.owner),
                    owner: reward1MintAccountInfo.owner,
                    transferHookAccountMetas: mintHookAccountsMap.get(lbPairState.rewardInfos[1].mint.toBase58()) ?? [],
                }
                : null;
            return new DLMM(lbPair, program, lbPairState, binArrayBitmapExtension, tokenX, tokenY, [reward0, reward1], clock, opt);
        });
        return lbClmmImpl;
    }
    /**
     * The `getAllPresetParameters` function retrieves all preset parameter accounts
     * for the given DLMM program.
     *
     * @param {Connection} connection - The connection to the Solana cluster.
     * @param {Opt} [opt] - The optional parameters for the function.
     *
     * @returns A promise that resolves to an object containing the preset parameter
     * accounts, with the following properties:
     * - `presetParameter`: The preset parameter accounts for the original `PresetParameter` struct.
     * - `presetParameter2`: The preset parameter accounts for the `PresetParameter2` struct.
     */
    static async getAllPresetParameters(connection, opt) {
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[opt?.cluster ?? "mainnet-beta"], provider);
        const [presetParameter, presetParameter2] = await Promise.all([
            program.account.presetParameter.all(),
            program.account.presetParameter2.all(),
        ]);
        return {
            presetParameter,
            presetParameter2,
        };
    }
    /**
     * The function `getAllLbPairPositionsByUser` retrieves all liquidity pool pair positions for a given
     * user.
     * @param {Connection} connection - The `connection` parameter is an instance of the `Connection`
     * class, which represents the connection to the Solana blockchain.
     * @param {PublicKey} userPubKey - The user's wallet public key.
     * @param {Opt} [opt] - An optional object that contains additional options for the function.
     * @returns The function `getAllLbPairPositionsByUser` returns a `Promise` that resolves to a `Map`
     * object. The `Map` object contains key-value pairs, where the key is a string representing the LB
     * Pair account, and the value is an object of PositionInfo
     */
    static async getAllLbPairPositionsByUser(connection, userPubKey, opt) {
        const cluster = opt?.cluster || "mainnet-beta";
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[cluster], provider);
        const positionsV2 = await program.account.positionV2.all([
            (0, accountFilters_1.positionOwnerFilter)(userPubKey),
        ]);
        const positionWrappers = [
            ...positionsV2.map((p) => new positions_1.PositionV2Wrapper(p.publicKey, p.account)),
        ];
        const binArrayPubkeySetV2 = new Set();
        const lbPairSetV2 = new Set();
        positionWrappers.forEach((p) => {
            const binArrayKeys = p.getBinArrayKeysCoverage(program.programId);
            binArrayKeys.forEach((binArrayKey) => {
                binArrayPubkeySetV2.add(binArrayKey.toBase58());
            });
            lbPairSetV2.add(p.lbPair().toBase58());
        });
        const binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map((pubkey) => new web3_js_1.PublicKey(pubkey));
        const lbPairKeys = Array.from(lbPairSetV2).map((pubkey) => new web3_js_1.PublicKey(pubkey));
        const [clockAccInfo, ...binArraysAccInfo] = await (0, helpers_1.chunkedGetMultipleAccountInfos)(connection, [
            web3_js_1.SYSVAR_CLOCK_PUBKEY,
            ...binArrayPubkeyArrayV2,
            ...lbPairKeys,
        ]);
        const positionBinArraysMapV2 = new Map();
        for (let i = 0; i < binArrayPubkeyArrayV2.length; i++) {
            const binArrayPubkey = binArrayPubkeyArrayV2[i];
            const binArrayAccInfoBufferV2 = binArraysAccInfo[i];
            if (binArrayAccInfoBufferV2) {
                const binArrayAccInfo = program.coder.accounts.decode(program.account.binArray.idlAccount.name, binArrayAccInfoBufferV2.data);
                positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
            }
        }
        const lbPairMap = new Map();
        for (let i = binArrayPubkeyArrayV2.length; i < binArraysAccInfo.length; i++) {
            const lbPairPubkey = lbPairKeys[i - binArrayPubkeyArrayV2.length];
            const lbPairAccInfoBufferV2 = binArraysAccInfo[i];
            if (!lbPairAccInfoBufferV2)
                throw new Error(`LB Pair account ${lbPairPubkey.toBase58()} not found`);
            const lbPairAccInfo = program.coder.accounts.decode(program.account.lbPair.idlAccount.name, lbPairAccInfoBufferV2.data);
            lbPairMap.set(lbPairPubkey.toBase58(), lbPairAccInfo);
        }
        const accountKeys = Array.from(lbPairMap.values())
            .map(({ reserveX, reserveY, tokenXMint, tokenYMint, rewardInfos }) => [
            reserveX,
            reserveY,
            tokenXMint,
            tokenYMint,
            rewardInfos[0].mint,
            rewardInfos[1].mint,
        ])
            .flat();
        const accountInfos = await (0, helpers_1.chunkedGetMultipleAccountInfos)(program.provider.connection, accountKeys);
        const lbPairReserveMap = new Map();
        const lbPairMintMap = new Map();
        lbPairKeys.forEach((lbPair, idx) => {
            const index = idx * 6;
            const reserveXAccount = accountInfos[index];
            const reserveYAccount = accountInfos[index + 1];
            if (!reserveXAccount || !reserveYAccount)
                throw new Error(`Reserve account for LB Pair ${lbPair.toBase58()} not found`);
            const reserveAccX = spl_token_1.AccountLayout.decode(reserveXAccount.data);
            const reserveAccY = spl_token_1.AccountLayout.decode(reserveYAccount.data);
            lbPairReserveMap.set(lbPair.toBase58(), {
                reserveX: reserveAccX.amount,
                reserveY: reserveAccY.amount,
            });
            const mintXAccount = accountInfos[index + 2];
            const mintYAccount = accountInfos[index + 3];
            if (!mintXAccount || !mintYAccount)
                throw new Error(`Mint account for LB Pair ${lbPair.toBase58()} not found`);
            const mintX = (0, spl_token_1.unpackMint)(reserveAccX.mint, mintXAccount, mintXAccount.owner);
            const mintY = (0, spl_token_1.unpackMint)(reserveAccY.mint, mintYAccount, mintYAccount.owner);
            const rewardMint0Account = accountInfos[index + 4];
            const rewardMint1Account = accountInfos[index + 5];
            const lbPairState = lbPairMap.get(lbPair.toBase58());
            let rewardMint0 = null;
            let rewardMint1 = null;
            if (!lbPairState.rewardInfos[0].mint.equals(web3_js_1.PublicKey.default)) {
                rewardMint0 = (0, spl_token_1.unpackMint)(lbPairState.rewardInfos[0].mint, rewardMint0Account, rewardMint0Account.owner);
            }
            if (!lbPairState.rewardInfos[1].mint.equals(web3_js_1.PublicKey.default)) {
                rewardMint1 = (0, spl_token_1.unpackMint)(lbPairState.rewardInfos[1].mint, rewardMint1Account, rewardMint1Account.owner);
            }
            lbPairMintMap.set(lbPair.toBase58(), {
                mintX,
                mintY,
                rewardMint0,
                rewardMint1,
            });
        });
        const clock = types_1.ClockLayout.decode(clockAccInfo.data);
        const positionsMap = new Map();
        for (const position of positionWrappers) {
            const lbPair = position.lbPair();
            const positionPubkey = position.address();
            const version = position.version();
            const lbPairAcc = lbPairMap.get(lbPair.toBase58());
            const { mintX, mintY, rewardMint0, rewardMint1 } = lbPairMintMap.get(lbPair.toBase58());
            const reserveXBalance = lbPairReserveMap.get(lbPair.toBase58())?.reserveX ?? BigInt(0);
            const reserveYBalance = lbPairReserveMap.get(lbPair.toBase58())?.reserveY ?? BigInt(0);
            const { tokenXProgram, tokenYProgram } = (0, helpers_1.getTokenProgramId)(lbPairAcc);
            const tokenX = {
                publicKey: lbPairAcc.tokenXMint,
                reserve: lbPairAcc.reserveX,
                amount: reserveXBalance,
                mint: mintX,
                owner: tokenXProgram,
                transferHookAccountMetas: [], // No need, the TokenReserve created just for processing position info, doesn't require any transaction
            };
            const tokenY = {
                publicKey: lbPairAcc.tokenYMint,
                reserve: lbPairAcc.reserveY,
                amount: reserveYBalance,
                mint: mintY,
                owner: tokenYProgram,
                transferHookAccountMetas: [], // No need, the TokenReserve created just for processing position info, doesn't require any transaction
            };
            const positionData = await DLMM.processPosition(program, lbPairAcc, clock, position, mintX, mintY, rewardMint0, rewardMint1, positionBinArraysMapV2);
            if (positionData) {
                positionsMap.set(lbPair.toBase58(), {
                    publicKey: lbPair,
                    lbPair: lbPairAcc,
                    tokenX,
                    tokenY,
                    lbPairPositionsData: [
                        ...(positionsMap.get(lbPair.toBase58())?.lbPairPositionsData ?? []),
                        {
                            publicKey: positionPubkey,
                            positionData,
                            version,
                        },
                    ],
                });
            }
        }
        return positionsMap;
    }
    static getPricePerLamport(tokenXDecimal, tokenYDecimal, price) {
        return new decimal_js_1.default(price)
            .mul(new decimal_js_1.default(10 ** (tokenYDecimal - tokenXDecimal)))
            .toString();
    }
    static getBinIdFromPrice(price, binStep, min) {
        const binStepNum = new decimal_js_1.default(binStep).div(new decimal_js_1.default(constants_1.BASIS_POINT_MAX));
        const binId = new decimal_js_1.default(price)
            .log()
            .dividedBy(new decimal_js_1.default(1).add(binStepNum).log());
        return (min ? binId.floor() : binId.ceil()).toNumber();
    }
    /**
     * The function `getLbPairLockInfo` retrieves all pair positions that has locked liquidity.
     * @param {number} [lockDurationOpt] - An optional value indicating the minimum position lock duration that the function should return.
     * Depending on the lbPair activationType, the param should be a number of seconds or a number of slots.
     * @returns The function `getLbPairLockInfo` returns a `Promise` that resolves to a `PairLockInfo`
     * object. The `PairLockInfo` object contains an array of `PositionLockInfo` objects.
     */
    async getLbPairLockInfo(lockDurationOpt) {
        const lockDuration = lockDurationOpt | 0;
        const lbPairPositions = await this.program.account.positionV2.all([
            {
                memcmp: {
                    bytes: bytes_1.bs58.encode(this.pubkey.toBuffer()),
                    offset: 8,
                },
            },
        ]);
        // filter positions has lock_release_point > currentTimestamp + lockDurationSecs
        const clockAccInfo = await this.program.provider.connection.getAccountInfo(web3_js_1.SYSVAR_CLOCK_PUBKEY);
        const clock = types_1.ClockLayout.decode(clockAccInfo.data);
        const currentPoint = this.lbPair.activationType == types_1.ActivationType.Slot
            ? clock.slot
            : clock.unixTimestamp;
        const minLockReleasePoint = currentPoint.add(new anchor_1.BN(lockDuration));
        const positionsWithLock = lbPairPositions.filter((p) => p.account.lockReleasePoint.gt(minLockReleasePoint));
        if (positionsWithLock.length == 0) {
            return {
                positions: [],
            };
        }
        const positions = [
            ...positionsWithLock.map((p) => new positions_1.PositionV2Wrapper(p.publicKey, p.account)),
        ];
        const binArrayPubkeySetV2 = new Set();
        positions.forEach((position) => {
            const binArrayKeys = position.getBinArrayKeysCoverage(this.program.programId);
            binArrayKeys.forEach((key) => {
                binArrayPubkeySetV2.add(key.toBase58());
            });
        });
        const binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map((pubkey) => new web3_js_1.PublicKey(pubkey));
        const binArraysAccInfo = await (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, binArrayPubkeyArrayV2);
        const positionBinArraysMapV2 = new Map();
        for (let i = 0; i < binArraysAccInfo.length; i++) {
            const binArrayPubkey = binArrayPubkeyArrayV2[i];
            const binArrayAccBufferV2 = binArraysAccInfo[i];
            if (!binArrayAccBufferV2)
                throw new Error(`Bin Array account ${binArrayPubkey.toBase58()} not found`);
            const binArrayAccInfo = this.program.coder.accounts.decode(this.program.account.binArray.idlAccount.name, binArrayAccBufferV2.data);
            positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
        }
        const positionsLockInfo = await Promise.all(positions.map(async (position) => {
            const positionData = await DLMM.processPosition(this.program, this.lbPair, clock, position, this.tokenX.mint, this.tokenY.mint, this.rewards[0].mint, this.rewards[1].mint, positionBinArraysMapV2);
            return {
                positionAddress: position.address(),
                owner: position.owner(),
                lockReleasePoint: position.lockReleasePoint().toNumber(),
                tokenXAmount: positionData.totalXAmount,
                tokenYAmount: positionData.totalYAmount,
            };
        }));
        return {
            positions: positionsLockInfo,
        };
    }
    /** Public methods */
    /**
     * Create a new customizable permissionless pair. Support both token and token 2022.
     * @param connection A connection to the Solana cluster.
     * @param binStep The bin step for the pair.
     * @param tokenX The mint of the first token.
     * @param tokenY The mint of the second token.
     * @param activeId The ID of the initial active bin. Represent the starting price.
     * @param feeBps The fee rate for swaps in the pair, in basis points.
     * @param activationType The type of activation for the pair.
     * @param hasAlphaVault Whether the pair has an alpha vault.
     * @param creatorKey The public key of the creator of the pair.
     * @param activationPoint The timestamp at which the pair will be activated.
     * @param opt An options object.
     * @returns A transaction that creates the pair.
     */
    static async createCustomizablePermissionlessLbPair2(connection, binStep, tokenX, tokenY, activeId, feeBps, activationType, hasAlphaVault, creatorKey, activationPoint, creatorPoolOnOffControl, opt) {
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[opt.cluster], provider);
        const [tokenBadgeX] = (0, helpers_1.deriveTokenBadge)(tokenX, program.programId);
        const [tokenBadgeY] = (0, helpers_1.deriveTokenBadge)(tokenY, program.programId);
        const [tokenXAccount, tokenYAccount, tokenBadgeXAccount, tokenBadgeYAccount,] = await provider.connection.getMultipleAccountsInfo([
            tokenX,
            tokenY,
            tokenBadgeX,
            tokenBadgeY,
        ]);
        const [lbPair] = (0, helpers_1.deriveCustomizablePermissionlessLbPair)(tokenX, tokenY, program.programId);
        const [reserveX] = (0, helpers_1.deriveReserve)(tokenX, lbPair, program.programId);
        const [reserveY] = (0, helpers_1.deriveReserve)(tokenY, lbPair, program.programId);
        const [oracle] = (0, helpers_1.deriveOracle)(lbPair, program.programId);
        const activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(activeId);
        const binArrayBitmapExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(activeBinArrayIndex)
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]
            : null;
        const [baseFactor, baseFeePowerFactor] = (0, math_1.computeBaseFactorFromFeeBps)(binStep, feeBps);
        const ixData = {
            activeId: activeId.toNumber(),
            binStep: binStep.toNumber(),
            baseFactor: baseFactor.toNumber(),
            activationType,
            activationPoint: activationPoint ? activationPoint : null,
            hasAlphaVault,
            creatorPoolOnOffControl: creatorPoolOnOffControl
                ? creatorPoolOnOffControl
                : false,
            baseFeePowerFactor: baseFeePowerFactor.toNumber(),
            padding: Array(63).fill(0),
        };
        const userTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenX, creatorKey, true, tokenXAccount.owner);
        const userTokenY = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenY, creatorKey, true, tokenYAccount.owner);
        return program.methods
            .initializeCustomizablePermissionlessLbPair2(ixData)
            .accounts({
            tokenBadgeX: tokenBadgeXAccount ? tokenBadgeX : program.programId,
            tokenBadgeY: tokenBadgeYAccount ? tokenBadgeY : program.programId,
            lbPair,
            reserveX,
            reserveY,
            binArrayBitmapExtension,
            tokenMintX: tokenX,
            tokenMintY: tokenY,
            oracle,
            systemProgram: web3_js_1.SystemProgram.programId,
            userTokenX,
            userTokenY,
            funder: creatorKey,
            tokenProgramX: tokenXAccount.owner,
            tokenProgramY: tokenYAccount.owner,
        })
            .transaction();
    }
    /**
     * Create a new customizable permissionless pair. Support only token program.
     * @param connection A connection to the Solana cluster.
     * @param binStep The bin step for the pair.
     * @param tokenX The mint of the first token.
     * @param tokenY The mint of the second token.
     * @param activeId The ID of the initial active bin. Represent the starting price.
     * @param feeBps The fee rate for swaps in the pair, in basis points.
     * @param activationType The type of activation for the pair.
     * @param hasAlphaVault Whether the pair has an alpha vault.
     * @param creatorKey The public key of the creator of the pair.
     * @param activationPoint The timestamp at which the pair will be activated.
     * @param opt An options object.
     * @returns A transaction that creates the pair.
     */
    static async createCustomizablePermissionlessLbPair(connection, binStep, tokenX, tokenY, activeId, feeBps, activationType, hasAlphaVault, creatorKey, activationPoint, creatorPoolOnOffControl, opt) {
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[opt.cluster], provider);
        const [mintXAccount, mintYAccount] = await connection.getMultipleAccountsInfo([tokenX, tokenY]);
        const [lbPair] = (0, helpers_1.deriveCustomizablePermissionlessLbPair)(tokenX, tokenY, program.programId);
        const [reserveX] = (0, helpers_1.deriveReserve)(tokenX, lbPair, program.programId);
        const [reserveY] = (0, helpers_1.deriveReserve)(tokenY, lbPair, program.programId);
        const [oracle] = (0, helpers_1.deriveOracle)(lbPair, program.programId);
        const activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(activeId);
        const binArrayBitmapExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(activeBinArrayIndex)
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]
            : null;
        const [baseFactor, baseFeePowerFactor] = (0, math_1.computeBaseFactorFromFeeBps)(binStep, feeBps);
        if (!baseFeePowerFactor.isZero()) {
            throw "base factor for the give fee bps overflow u16";
        }
        const ixData = {
            activeId: activeId.toNumber(),
            binStep: binStep.toNumber(),
            baseFactor: baseFactor.toNumber(),
            activationType,
            activationPoint: activationPoint ? activationPoint : null,
            hasAlphaVault,
            baseFeePowerFactor: 0,
            creatorPoolOnOffControl: creatorPoolOnOffControl
                ? creatorPoolOnOffControl
                : false,
            padding: Array(63).fill(0),
        };
        const userTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenX, creatorKey);
        const userTokenY = (0, spl_token_1.getAssociatedTokenAddressSync)(tokenY, creatorKey);
        return program.methods
            .initializeCustomizablePermissionlessLbPair(ixData)
            .accounts({
            lbPair,
            reserveX,
            reserveY,
            binArrayBitmapExtension,
            tokenMintX: tokenX,
            tokenMintY: tokenY,
            oracle,
            systemProgram: web3_js_1.SystemProgram.programId,
            userTokenX,
            userTokenY,
            funder: creatorKey,
        })
            .transaction();
    }
    /**
     * Create a new liquidity pair. Support only token program.
     * @param connection A connection to the Solana cluster.
     * @param funder The public key of the funder of the pair.
     * @param tokenX The mint of the first token.
     * @param tokenY The mint of the second token.
     * @param binStep The bin step for the pair.
     * @param baseFactor The base factor for the pair.
     * @param presetParameter The public key of the preset parameter account.
     * @param activeId The ID of the initial active bin. Represent the starting price.
     * @param opt An options object.
     * @returns A transaction that creates the pair.
     * @throws If the pair already exists.
     */
    static async createLbPair(connection, funder, tokenX, tokenY, binStep, baseFactor, presetParameter, activeId, opt) {
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[opt.cluster], provider);
        const existsPool = await this.getPairPubkeyIfExists(connection, tokenX, tokenY, binStep, baseFactor, new anchor_1.BN(0));
        if (existsPool) {
            throw new Error("Pool already exists");
        }
        const [lbPair] = (0, helpers_1.deriveLbPair2)(tokenX, tokenY, binStep, baseFactor, program.programId);
        const [reserveX] = (0, helpers_1.deriveReserve)(tokenX, lbPair, program.programId);
        const [reserveY] = (0, helpers_1.deriveReserve)(tokenY, lbPair, program.programId);
        const [oracle] = (0, helpers_1.deriveOracle)(lbPair, program.programId);
        const activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(activeId);
        const binArrayBitmapExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(activeBinArrayIndex)
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]
            : null;
        return program.methods
            .initializeLbPair(activeId.toNumber(), binStep.toNumber())
            .accounts({
            funder,
            lbPair,
            rent: web3_js_1.SYSVAR_RENT_PUBKEY,
            reserveX,
            reserveY,
            binArrayBitmapExtension,
            tokenMintX: tokenX,
            tokenMintY: tokenY,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            oracle,
            presetParameter,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .transaction();
    }
    /**
     * Create a new liquidity pair. Support both token and token2022 program.
     * @param connection A connection to the Solana cluster.
     * @param funder The public key of the funder of the pair.
     * @param tokenX The mint of the first token.
     * @param tokenY The mint of the second token.
     * @param presetParameter The public key of the preset parameter account.
     * @param activeId The ID of the initial active bin. Represent the starting price.
     * @param opt An options object.
     * @returns A transaction that creates the pair.
     * @throws If the pair already exists.
     */
    static async createLbPair2(connection, funder, tokenX, tokenY, presetParameter, activeId, opt) {
        const provider = new anchor_1.AnchorProvider(connection, {}, anchor_1.AnchorProvider.defaultOptions());
        const program = new anchor_1.Program(idl_1.IDL, opt?.programId ?? constants_1.LBCLMM_PROGRAM_IDS[opt.cluster], provider);
        const [tokenBadgeX] = (0, helpers_1.deriveTokenBadge)(tokenX, program.programId);
        const [tokenBadgeY] = (0, helpers_1.deriveTokenBadge)(tokenY, program.programId);
        const [tokenXAccount, tokenYAccount, tokenBadgeXAccount, tokenBadgeYAccount,] = await provider.connection.getMultipleAccountsInfo([
            tokenX,
            tokenY,
            tokenBadgeX,
            tokenBadgeY,
        ]);
        const presetParameterState = await program.account.presetParameter2.fetch(presetParameter);
        const existsPool = await this.getPairPubkeyIfExists(connection, tokenX, tokenY, new anchor_1.BN(presetParameterState.binStep), new anchor_1.BN(presetParameterState.baseFactor), new anchor_1.BN(presetParameterState.baseFactor));
        if (existsPool) {
            throw new Error("Pool already exists");
        }
        const [lbPair] = (0, helpers_1.deriveLbPairWithPresetParamWithIndexKey)(presetParameter, tokenX, tokenY, program.programId);
        const [reserveX] = (0, helpers_1.deriveReserve)(tokenX, lbPair, program.programId);
        const [reserveY] = (0, helpers_1.deriveReserve)(tokenY, lbPair, program.programId);
        const [oracle] = (0, helpers_1.deriveOracle)(lbPair, program.programId);
        const activeBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(activeId);
        const binArrayBitmapExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(activeBinArrayIndex)
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(lbPair, program.programId)[0]
            : null;
        return program.methods
            .initializeLbPair2({
            activeId: activeId.toNumber(),
            padding: Array(96).fill(0),
        })
            .accounts({
            funder,
            lbPair,
            reserveX,
            reserveY,
            binArrayBitmapExtension,
            tokenMintX: tokenX,
            tokenMintY: tokenY,
            tokenBadgeX: tokenBadgeXAccount ? tokenBadgeX : program.programId,
            tokenBadgeY: tokenBadgeYAccount ? tokenBadgeY : program.programId,
            tokenProgramX: tokenXAccount.owner,
            tokenProgramY: tokenYAccount.owner,
            oracle,
            presetParameter,
            systemProgram: web3_js_1.SystemProgram.programId,
        })
            .transaction();
    }
    /**
     * The function `refetchStates` retrieves and updates various states and data related to bin arrays
     * and lb pairs.
     */
    async refetchStates() {
        const binArrayBitmapExtensionPubkey = (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0];
        const [lbPairAccountInfo, binArrayBitmapExtensionAccountInfo, reserveXAccountInfo, reserveYAccountInfo, mintXAccountInfo, mintYAccountInfo, reward0VaultAccountInfo, reward1VaultAccountInfo, rewardMint0AccountInfo, rewardMint1AccountInfo, clockAccountInfo,] = await (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, [
            this.pubkey,
            binArrayBitmapExtensionPubkey,
            this.lbPair.reserveX,
            this.lbPair.reserveY,
            this.lbPair.tokenXMint,
            this.lbPair.tokenYMint,
            this.lbPair.rewardInfos[0].vault,
            this.lbPair.rewardInfos[1].vault,
            this.lbPair.rewardInfos[0].mint,
            this.lbPair.rewardInfos[1].mint,
            web3_js_1.SYSVAR_CLOCK_PUBKEY,
        ]);
        const lbPairState = this.program.coder.accounts.decode(this.program.account.lbPair.idlAccount.name, lbPairAccountInfo.data);
        if (binArrayBitmapExtensionAccountInfo) {
            const binArrayBitmapExtensionState = this.program.coder.accounts.decode(this.program.account.binArrayBitmapExtension.idlAccount.name, binArrayBitmapExtensionAccountInfo.data);
            if (binArrayBitmapExtensionState) {
                this.binArrayBitmapExtension = {
                    account: binArrayBitmapExtensionState,
                    publicKey: binArrayBitmapExtensionPubkey,
                };
            }
        }
        const reserveXBalance = spl_token_1.AccountLayout.decode(reserveXAccountInfo.data);
        const reserveYBalance = spl_token_1.AccountLayout.decode(reserveYAccountInfo.data);
        const [tokenXTransferHook, tokenYTransferHook, reward0TransferHook, reward1TransferHook,] = await Promise.all([
            (0, token_2022_1.getExtraAccountMetasForTransferHook)(this.program.provider.connection, lbPairState.tokenXMint, mintXAccountInfo),
            (0, token_2022_1.getExtraAccountMetasForTransferHook)(this.program.provider.connection, lbPairState.tokenYMint, mintYAccountInfo),
            rewardMint0AccountInfo
                ? (0, token_2022_1.getExtraAccountMetasForTransferHook)(this.program.provider.connection, lbPairState.rewardInfos[0].mint, rewardMint0AccountInfo)
                : [],
            rewardMint1AccountInfo
                ? (0, token_2022_1.getExtraAccountMetasForTransferHook)(this.program.provider.connection, lbPairState.rewardInfos[1].mint, rewardMint1AccountInfo)
                : [],
        ]);
        const mintX = (0, spl_token_1.unpackMint)(this.tokenX.publicKey, mintXAccountInfo, mintXAccountInfo.owner);
        const mintY = (0, spl_token_1.unpackMint)(this.tokenY.publicKey, mintYAccountInfo, mintYAccountInfo.owner);
        this.tokenX = {
            amount: reserveXBalance.amount,
            mint: mintX,
            publicKey: lbPairState.tokenXMint,
            reserve: lbPairState.reserveX,
            owner: mintXAccountInfo.owner,
            transferHookAccountMetas: tokenXTransferHook,
        };
        this.tokenY = {
            amount: reserveYBalance.amount,
            mint: mintY,
            publicKey: lbPairState.tokenYMint,
            reserve: lbPairState.reserveY,
            owner: mintYAccountInfo.owner,
            transferHookAccountMetas: tokenYTransferHook,
        };
        this.rewards[0] = null;
        this.rewards[1] = null;
        if (!lbPairState.rewardInfos[0].mint.equals(web3_js_1.PublicKey.default)) {
            this.rewards[0] = {
                publicKey: lbPairState.rewardInfos[0].mint,
                reserve: lbPairState.rewardInfos[0].vault,
                mint: (0, spl_token_1.unpackMint)(lbPairState.rewardInfos[0].mint, rewardMint0AccountInfo, rewardMint0AccountInfo.owner),
                amount: spl_token_1.AccountLayout.decode(reward0VaultAccountInfo.data).amount,
                owner: rewardMint0AccountInfo.owner,
                transferHookAccountMetas: reward0TransferHook,
            };
        }
        if (!lbPairState.rewardInfos[1].mint.equals(web3_js_1.PublicKey.default)) {
            this.rewards[1] = {
                publicKey: lbPairState.rewardInfos[1].mint,
                reserve: lbPairState.rewardInfos[1].vault,
                mint: (0, spl_token_1.unpackMint)(lbPairState.rewardInfos[1].mint, rewardMint1AccountInfo, rewardMint1AccountInfo.owner),
                amount: spl_token_1.AccountLayout.decode(reward1VaultAccountInfo.data).amount,
                owner: rewardMint1AccountInfo.owner,
                transferHookAccountMetas: reward1TransferHook,
            };
        }
        const clock = types_1.ClockLayout.decode(clockAccountInfo.data);
        this.clock = clock;
        this.lbPair = lbPairState;
    }
    /**
     * Set the status of a permissionless LB pair to either enabled or disabled. This require pool field `creator_pool_on_off_control` to be true and type `CustomizablePermissionless`.
     * Pool creator can enable/disable the pair anytime before the pool is opened / activated. Once the pool activation time is passed, the pool creator can only enable the pair.
     * Useful for token launches which do not have fixed activation time.
     * @param enable If true, the pair will be enabled. If false, the pair will be disabled.
     * @param creator The public key of the pool creator.
     * @returns a Promise that resolves to the transaction.
     */
    async setPairStatusPermissionless(enable, creator) {
        const status = enable ? 0 : 1; // 0 = enable, 1 = disable
        const tx = await this.program.methods
            .setPairStatusPermissionless(status)
            .accounts({
            lbPair: this.pubkey,
            creator,
        })
            .transaction();
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            feePayer: this.lbPair.creator,
            blockhash,
            lastValidBlockHeight,
        }).add(tx);
    }
    /**
     * The function `getBinArrays` returns an array of `BinArrayAccount` objects
     * @returns a Promise that resolves to an array of BinArrayAccount objects.
     */
    async getBinArrays() {
        return this.program.account.binArray.all([
            (0, accountFilters_1.binArrayLbPairFilter)(this.pubkey),
        ]);
    }
    /**
     * The function `getBinArrayAroundActiveBin` retrieves a specified number of `BinArrayAccount`
     * objects from the blockchain, based on the active bin and its surrounding bin arrays.
     * @param
     *    swapForY - The `swapForY` parameter is a boolean value that indicates whether the swap is using quote token as input.
     *    [count=4] - The `count` parameter is the number of bin arrays to retrieve on left and right respectively. By default, it is set to 4.
     * @returns an array of `BinArrayAccount` objects.
     */
    async getBinArrayForSwap(swapForY, count = 4) {
        await this.refetchStates();
        const binArraysPubkey = new Set();
        let shouldStop = false;
        let activeIdToLoop = this.lbPair.activeId;
        while (!shouldStop) {
            const binArrayIndex = (0, helpers_1.findNextBinArrayIndexWithLiquidity)(swapForY, new anchor_1.BN(activeIdToLoop), this.lbPair, this.binArrayBitmapExtension?.account ?? null);
            if (binArrayIndex === null)
                shouldStop = true;
            else {
                const [binArrayPubKey] = (0, helpers_1.deriveBinArray)(this.pubkey, binArrayIndex, this.program.programId);
                binArraysPubkey.add(binArrayPubKey.toBase58());
                const [lowerBinId, upperBinId] = (0, helpers_1.getBinArrayLowerUpperBinId)(binArrayIndex);
                activeIdToLoop = swapForY
                    ? lowerBinId.toNumber() - 1
                    : upperBinId.toNumber() + 1;
            }
            if (binArraysPubkey.size === count)
                shouldStop = true;
        }
        const accountsToFetch = Array.from(binArraysPubkey).map((pubkey) => new web3_js_1.PublicKey(pubkey));
        const binArraysAccInfoBuffer = await (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, accountsToFetch);
        const binArrays = await Promise.all(binArraysAccInfoBuffer.map(async (accInfo, idx) => {
            const account = this.program.coder.accounts.decode(this.program.account.binArray.idlAccount.name, accInfo.data);
            const publicKey = accountsToFetch[idx];
            return {
                account,
                publicKey,
            };
        }));
        return binArrays;
    }
    /**
     * The function `calculateFeeInfo` calculates the base fee rate percentage and maximum fee rate percentage
     * given the base factor, bin step, and optional base fee power factor.
     * @param baseFactor - The base factor of the pair.
     * @param binStep - The bin step of the pair.
     * @param baseFeePowerFactor - Optional parameter to allow small bin step to have bigger fee rate. Default to 0.
     * @returns an object of type `Omit<FeeInfo, "protocolFeePercentage">` with the following properties: baseFeeRatePercentage and maxFeeRatePercentage.
     */
    static calculateFeeInfo(baseFactor, binStep, baseFeePowerFactor) {
        const baseFeeRate = new anchor_1.BN(baseFactor)
            .mul(new anchor_1.BN(binStep))
            .mul(new anchor_1.BN(10))
            .mul(new anchor_1.BN(10).pow(new anchor_1.BN(baseFeePowerFactor ?? 0)));
        const baseFeeRatePercentage = new decimal_js_1.default(baseFeeRate.toString())
            .mul(new decimal_js_1.default(100))
            .div(new decimal_js_1.default(constants_1.FEE_PRECISION.toString()));
        const maxFeeRatePercentage = new decimal_js_1.default(constants_1.MAX_FEE_RATE.toString())
            .mul(new decimal_js_1.default(100))
            .div(new decimal_js_1.default(constants_1.FEE_PRECISION.toString()));
        return {
            baseFeeRatePercentage,
            maxFeeRatePercentage,
        };
    }
    /**
     * The function `getFeeInfo` calculates and returns the base fee rate percentage, maximum fee rate
     * percentage, and protocol fee percentage.
     * @returns an object of type `FeeInfo` with the following properties: baseFeeRatePercentage, maxFeeRatePercentage, and protocolFeePercentage.
     */
    getFeeInfo() {
        const { baseFactor, protocolShare } = this.lbPair.parameters;
        const { baseFeeRatePercentage, maxFeeRatePercentage } = DLMM.calculateFeeInfo(baseFactor, this.lbPair.binStep, this.lbPair.parameters.baseFeePowerFactor);
        const protocolFeePercentage = new decimal_js_1.default(protocolShare.toString())
            .mul(new decimal_js_1.default(100))
            .div(new decimal_js_1.default(constants_1.BASIS_POINT_MAX));
        return {
            baseFeeRatePercentage,
            maxFeeRatePercentage,
            protocolFeePercentage,
        };
    }
    /**
     * The function calculates and returns a dynamic fee
     * @returns a Decimal value representing the dynamic fee.
     */
    getDynamicFee() {
        let vParameterClone = Object.assign({}, this.lbPair.vParameters);
        let activeId = new anchor_1.BN(this.lbPair.activeId);
        const sParameters = this.lbPair.parameters;
        const currentTimestamp = Date.now() / 1000;
        this.updateReference(activeId.toNumber(), vParameterClone, sParameters, currentTimestamp);
        this.updateVolatilityAccumulator(vParameterClone, sParameters, activeId.toNumber());
        const totalFee = (0, helpers_1.getTotalFee)(this.lbPair.binStep, sParameters, vParameterClone);
        return new decimal_js_1.default(totalFee.toString())
            .div(new decimal_js_1.default(constants_1.FEE_PRECISION.toString()))
            .mul(100);
    }
    /**
     * The function `getEmissionRate` returns the emission rates for two rewards.
     * @returns an object of type `EmissionRate`. The object has two properties: `rewardOne` and
     * `rewardTwo`, both of which are of type `Decimal`.
     */
    getEmissionRate() {
        const now = Date.now() / 1000;
        const [rewardOneEmissionRate, rewardTwoEmissionRate] = this.lbPair.rewardInfos.map(({ rewardRate, rewardDurationEnd }) => now > rewardDurationEnd.toNumber() ? undefined : rewardRate);
        return {
            rewardOne: rewardOneEmissionRate
                ? new decimal_js_1.default(rewardOneEmissionRate.toString()).div(constants_1.PRECISION)
                : undefined,
            rewardTwo: rewardTwoEmissionRate
                ? new decimal_js_1.default(rewardTwoEmissionRate.toString()).div(constants_1.PRECISION)
                : undefined,
        };
    }
    /**
     * The function `getBinsAroundActiveBin` retrieves a specified number of bins to the left and right
     * of the active bin and returns them along with the active bin ID.
     * @param {number} numberOfBinsToTheLeft - The parameter `numberOfBinsToTheLeft` represents the
     * number of bins to the left of the active bin that you want to retrieve. It determines how many
     * bins you want to include in the result that are positioned to the left of the active bin.
     * @param {number} numberOfBinsToTheRight - The parameter `numberOfBinsToTheRight` represents the
     * number of bins to the right of the active bin that you want to retrieve.
     * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
     * value of "this.lbPair.activeId", and the value of "bins" is the result of calling the "getBins"
     * function with the specified parameters.
     */
    async getBinsAroundActiveBin(numberOfBinsToTheLeft, numberOfBinsToTheRight) {
        const lowerBinId = this.lbPair.activeId - numberOfBinsToTheLeft - 1;
        const upperBinId = this.lbPair.activeId + numberOfBinsToTheRight + 1;
        const bins = await this.getBins(this.pubkey, lowerBinId, upperBinId, this.tokenX.mint.decimals, this.tokenY.mint.decimals);
        return { activeBin: this.lbPair.activeId, bins };
    }
    /**
     * The function `getBinsBetweenMinAndMaxPrice` retrieves a list of bins within a specified price
     * range.
     * @param {number} minPrice - The minimum price value for filtering the bins.
     * @param {number} maxPrice - The `maxPrice` parameter is the maximum price value that you want to
     * use for filtering the bins.
     * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
     * active bin ID of the lbPair, and the value of "bins" is an array of BinLiquidity objects.
     */
    async getBinsBetweenMinAndMaxPrice(minPrice, maxPrice) {
        const lowerBinId = this.getBinIdFromPrice(minPrice, true) - 1;
        const upperBinId = this.getBinIdFromPrice(maxPrice, false) + 1;
        const bins = await this.getBins(this.pubkey, lowerBinId, upperBinId, this.tokenX.mint.decimals, this.tokenX.mint.decimals);
        return { activeBin: this.lbPair.activeId, bins };
    }
    /**
     * The function `getBinsBetweenLowerAndUpperBound` retrieves a list of bins between a lower and upper
     * bin ID and returns the active bin ID and the list of bins.
     * @param {number} lowerBinId - The lowerBinId parameter is a number that represents the ID of the
     * lowest bin.
     * @param {number} upperBinId - The upperBinID parameter is a number that represents the ID of the
     * highest bin.
     * @param {BinArray} [lowerBinArrays] - The `lowerBinArrays` parameter is an optional parameter of
     * type `BinArray`. It represents an array of bins that are below the lower bin ID.
     * @param {BinArray} [upperBinArrays] - The parameter `upperBinArrays` is an optional parameter of
     * type `BinArray`. It represents an array of bins that are above the upper bin ID.
     * @returns an object with two properties: "activeBin" and "bins". The value of "activeBin" is the
     * active bin ID of the lbPair, and the value of "bins" is an array of BinLiquidity objects.
     */
    async getBinsBetweenLowerAndUpperBound(lowerBinId, upperBinId, lowerBinArray, upperBinArray) {
        const bins = await this.getBins(this.pubkey, lowerBinId, upperBinId, this.tokenX.mint.decimals, this.tokenY.mint.decimals, lowerBinArray, upperBinArray);
        return { activeBin: this.lbPair.activeId, bins };
    }
    /**
     * The function converts a real price of bin to a lamport value
     * @param {number} price - The `price` parameter is a number representing the price of a token.
     * @returns {string} price per Lamport of bin
     */
    toPricePerLamport(price) {
        return DLMM.getPricePerLamport(this.tokenX.mint.decimals, this.tokenY.mint.decimals, price);
    }
    /**
     * The function converts a price per lamport value to a real price of bin
     * @param {number} pricePerLamport - The parameter `pricePerLamport` is a number representing the
     * price per lamport.
     * @returns {string} real price of bin
     */
    fromPricePerLamport(pricePerLamport) {
        return new decimal_js_1.default(pricePerLamport)
            .div(new decimal_js_1.default(10 ** (this.tokenY.mint.decimals - this.tokenX.mint.decimals)))
            .toString();
    }
    /**
     * The function retrieves the active bin ID and its corresponding price.
     * @returns an object with two properties: "binId" which is a number, and "price" which is a string.
     */
    async getActiveBin() {
        const { activeId } = await this.program.account.lbPair.fetch(this.pubkey);
        const [activeBinState] = await this.getBins(this.pubkey, activeId, activeId, this.tokenX.mint.decimals, this.tokenY.mint.decimals);
        return activeBinState;
    }
    /**
     * The function get bin ID based on a given price and a boolean flag indicating whether to
     * round down or up.
     * @param {number} price - The price parameter is a number that represents the price value.
     * @param {boolean} min - The "min" parameter is a boolean value that determines whether to round
     * down or round up the calculated binId. If "min" is true, the binId will be rounded down (floor),
     * otherwise it will be rounded up (ceil).
     * @returns {number} which is the binId calculated based on the given price and whether the minimum
     * value should be used.
     */
    getBinIdFromPrice(price, min) {
        return DLMM.getBinIdFromPrice(price, this.lbPair.binStep, min);
    }
    /**
     * The function `getPositionsByUserAndLbPair` retrieves positions by user and LB pair, including
     * active bin and user positions.
     * @param {PublicKey} [userPubKey] - The `userPubKey` parameter is an optional parameter of type
     * `PublicKey`. It represents the public key of a user. If no `userPubKey` is provided, the function
     * will return an object with an empty `userPositions` array and the active bin information obtained
     * from the `getActive
     * @returns The function `getPositionsByUserAndLbPair` returns a Promise that resolves to an object
     * with two properties:
     *    - "activeBin" which is an object with two properties: "binId" and "price". The value of "binId"
     *     is the active bin ID of the lbPair, and the value of "price" is the price of the active bin.
     *   - "userPositions" which is an array of Position objects.
     */
    async getPositionsByUserAndLbPair(userPubKey) {
        const promiseResults = await Promise.all([
            this.getActiveBin(),
            userPubKey &&
                this.program.account.positionV2.all([
                    (0, accountFilters_1.positionOwnerFilter)(userPubKey),
                    (0, accountFilters_1.positionLbPairFilter)(this.pubkey),
                ]),
        ]);
        const [activeBin, positionsV2] = promiseResults;
        if (!activeBin) {
            throw new Error("Error fetching active bin");
        }
        if (!userPubKey) {
            return {
                activeBin,
                userPositions: [],
            };
        }
        const positions = [
            ...positionsV2.map((p) => new positions_1.PositionV2Wrapper(p.publicKey, p.account)),
        ];
        if (!positions) {
            throw new Error("Error fetching positions");
        }
        const binArrayPubkeySetV2 = new Set();
        positions.forEach((position) => {
            const binArrayKeys = position.getBinArrayKeysCoverage(this.program.programId);
            binArrayKeys.forEach((key) => {
                binArrayPubkeySetV2.add(key.toBase58());
            });
        });
        const binArrayPubkeyArrayV2 = Array.from(binArrayPubkeySetV2).map((pubkey) => new web3_js_1.PublicKey(pubkey));
        const lbPairAndBinArrays = await (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, [this.pubkey, web3_js_1.SYSVAR_CLOCK_PUBKEY, ...binArrayPubkeyArrayV2]);
        const [lbPairAccInfo, clockAccInfo, ...binArraysAccInfo] = lbPairAndBinArrays;
        const positionBinArraysMapV2 = new Map();
        for (let i = 0; i < binArraysAccInfo.length; i++) {
            const binArrayPubkey = binArrayPubkeyArrayV2[i];
            const binArrayAccBufferV2 = binArraysAccInfo[i];
            if (binArrayAccBufferV2) {
                const binArrayAccInfo = this.program.coder.accounts.decode(this.program.account.binArray.idlAccount.name, binArrayAccBufferV2.data);
                positionBinArraysMapV2.set(binArrayPubkey.toBase58(), binArrayAccInfo);
            }
        }
        if (!lbPairAccInfo)
            throw new Error(`LB Pair account ${this.pubkey.toBase58()} not found`);
        const clock = types_1.ClockLayout.decode(clockAccInfo.data);
        const userPositions = await Promise.all(positions.map(async (position) => {
            return {
                publicKey: position.address(),
                positionData: await DLMM.processPosition(this.program, this.lbPair, clock, position, this.tokenX.mint, this.tokenY.mint, this.rewards[0]?.mint, this.rewards[1]?.mint, positionBinArraysMapV2),
                version: position.version(),
            };
        }));
        return {
            activeBin,
            userPositions,
        };
    }
    async quoteCreatePosition({ strategy }) {
        const { minBinId, maxBinId } = strategy;
        const lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
        const upperBinArrayIndex = anchor_1.BN.max((0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId)), lowerBinArrayIndex.add(new anchor_1.BN(1)));
        const binArraysCount = (await this.binArraysToBeCreate(lowerBinArrayIndex, upperBinArrayIndex)).length;
        const positionCount = Math.ceil((maxBinId - minBinId + 1) / constants_1.MAX_BIN_PER_TX);
        const binArrayCost = binArraysCount * constants_1.BIN_ARRAY_FEE;
        const positionCost = positionCount * constants_1.POSITION_FEE;
        return {
            binArraysCount,
            binArrayCost,
            positionCount,
            positionCost,
        };
    }
    /**
     * Creates an empty position and initializes the corresponding bin arrays if needed.
     * @param param0 The settings of the requested new position.
     * @returns A promise that resolves into a transaction for creating the requested position.
     */
    async createEmptyPosition({ positionPubKey, minBinId, maxBinId, user, }) {
        const createPositionIx = await this.program.methods
            .initializePosition(minBinId, maxBinId - minBinId + 1)
            .accounts({
            payer: user,
            position: positionPubKey,
            lbPair: this.pubkey,
            owner: user,
        })
            .instruction();
        const lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
        const upperBinArrayIndex = anchor_1.BN.max(lowerBinArrayIndex.add(new anchor_1.BN(1)), (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId)));
        const binArrayIndexes = Array.from({ length: upperBinArrayIndex.sub(lowerBinArrayIndex).toNumber() + 1 }, (_, index) => index + lowerBinArrayIndex.toNumber()).map((idx) => new anchor_1.BN(idx));
        const createBinArrayIxs = await this.createBinArraysIfNeeded(binArrayIndexes, user);
        const instructions = [createPositionIx, ...createBinArrayIxs];
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(setCUIx, ...instructions);
    }
    /**
     * The function `getPosition` retrieves position information for a given public key and processes it
     * using various data to return a `LbPosition` object.
     * @param {PublicKey} positionPubKey - The `getPosition` function you provided is an asynchronous
     * function that fetches position information based on a given public key. Here's a breakdown of the
     * parameters used in the function:
     * @returns The `getPosition` function returns a Promise that resolves to an object of type
     * `LbPosition`. The object contains the following properties:
     * - `publicKey`: The public key of the position account
     * - `positionData`: Position Object
     * - `version`: The version of the position (in this case, `Position.V2`)
     */
    async getPosition(positionPubKey) {
        const positionAccountInfo = await this.program.provider.connection.getAccountInfo(positionPubKey);
        if (!positionAccountInfo) {
            throw new Error(`Position account ${positionPubKey.toBase58()} not found`);
        }
        let position = (0, positions_1.wrapPosition)(this.program, positionPubKey, positionAccountInfo);
        const binArrayKeys = position.getBinArrayKeysCoverage(this.program.programId);
        const [clockAccInfo, ...binArrayAccountsInfo] = await (0, helpers_1.chunkedGetMultipleAccountInfos)(this.program.provider.connection, [
            web3_js_1.SYSVAR_CLOCK_PUBKEY,
            ...binArrayKeys,
        ]);
        const clock = types_1.ClockLayout.decode(clockAccInfo.data);
        const binArrayMap = new Map();
        for (let i = 0; i < binArrayAccountsInfo.length; i++) {
            if (binArrayAccountsInfo[i]) {
                const binArrayState = this.program.coder.accounts.decode(this.program.account.binArray.idlAccount.name, binArrayAccountsInfo[i].data);
                binArrayMap.set(binArrayKeys[i].toBase58(), binArrayState);
            }
        }
        return {
            publicKey: positionPubKey,
            positionData: await DLMM.processPosition(this.program, this.lbPair, clock, position, this.tokenX.mint, this.tokenY.mint, this.rewards[0]?.mint, this.rewards[1]?.mint, binArrayMap),
            version: position.version(),
        };
    }
    /**
     * The function `initializePositionAndAddLiquidityByStrategy` function is used to initializes a position and adds liquidity
     * @param {TInitializePositionAndAddLiquidityParamsByStrategy}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `strategy`: The strategy parameters to be used for the liquidity pool (Can use `calculateStrategyParameter` to calculate).
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction>} The function `initializePositionAndAddLiquidityByStrategy` returns a `Promise` that
     * resolves to either a single `Transaction` object.
     */
    async initializePositionAndAddLiquidityByStrategy({ positionPubKey, totalXAmount, totalYAmount, strategy, user, slippage, }) {
        const { maxBinId, minBinId } = strategy;
        const maxActiveBinSlippage = slippage
            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
        const preInstructions = [];
        const initializePositionIx = await this.program.methods
            .initializePosition(minBinId, maxBinId - minBinId + 1)
            .accounts({
            payer: user,
            position: positionPubKey,
            lbPair: this.pubkey,
            owner: user,
        })
            .instruction();
        preInstructions.push(initializePositionIx);
        const binArrayIndexes = (0, positions_1.getBinArrayIndexesCoverage)(new anchor_1.BN(minBinId), new anchor_1.BN(maxBinId));
        const binArrayAccountMetas = (0, positions_1.getBinArrayAccountMetasCoverage)(new anchor_1.BN(minBinId), new anchor_1.BN(maxBinId), this.pubkey, this.program.programId);
        const createBinArrayIxs = await this.createBinArraysIfNeeded(binArrayIndexes, user);
        preInstructions.push(...createBinArrayIxs);
        const [{ ataPubKey: userTokenX, ix: createPayerTokenXIx }, { ataPubKey: userTokenY, ix: createPayerTokenYIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user, this.tokenX.owner),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user, this.tokenY.owner),
        ]);
        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        const postInstructions = [];
        if ([
            this.tokenX.publicKey.toBase58(),
            this.tokenY.publicKey.toBase58(),
        ].includes(spl_token_1.NATIVE_MINT.toBase58())) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        const minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
        const maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
        const useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
        const binArrayBitmapExtension = useExtension
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
            : null;
        const activeId = this.lbPair.activeId;
        const strategyParameters = (0, helpers_1.toStrategyParameters)(strategy);
        const liquidityParams = {
            amountX: totalXAmount,
            amountY: totalYAmount,
            activeId,
            maxActiveBinSlippage,
            strategyParameters,
        };
        const addLiquidityAccounts = {
            position: positionPubKey,
            lbPair: this.pubkey,
            userTokenX,
            userTokenY,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            binArrayBitmapExtension,
            sender: user,
            tokenXProgram: this.tokenX.owner,
            tokenYProgram: this.tokenY.owner,
            memoProgram: types_1.MEMO_PROGRAM_ID,
        };
        const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Liquidity);
        const programMethod = this.program.methods.addLiquidityByStrategy2(liquidityParams, {
            slices,
        });
        const addLiquidityIx = await programMethod
            .accounts(addLiquidityAccounts)
            .remainingAccounts(transferHookAccounts)
            .remainingAccounts(binArrayAccountMetas)
            .instruction();
        const instructions = [
            ...preInstructions,
            addLiquidityIx,
            ...postInstructions,
        ];
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
        instructions.unshift(setCUIx);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(...instructions);
    }
    /**
     * @deprecated Use `initializePositionAndAddLiquidityByStrategy` instead which support both token and token2022.
     * The function `initializePositionAndAddLiquidityByWeight` function is used to initializes a position and adds liquidity
     * @param {TInitializePositionAndAddLiquidityParams}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `xYAmountDistribution`: An array of objects of type `XYAmountDistribution` that represents (can use `calculateSpotDistribution`, `calculateBidAskDistribution` & `calculateNormalDistribution`)
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction|Transaction[]>} The function `initializePositionAndAddLiquidityByWeight` returns a `Promise` that
     * resolves to either a single `Transaction` object (if less than 26bin involved) or an array of `Transaction` objects.
     */
    async initializePositionAndAddLiquidityByWeight({ positionPubKey, totalXAmount, totalYAmount, xYAmountDistribution, user, slippage, }) {
        const { lowerBinId, upperBinId, binIds } = this.processXYAmountDistribution(xYAmountDistribution);
        const maxActiveBinSlippage = slippage
            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
        if (upperBinId >= lowerBinId + constants_1.MAX_BIN_PER_POSITION.toNumber()) {
            throw new Error(`Position must be within a range of 1 to ${constants_1.MAX_BIN_PER_POSITION.toNumber()} bins.`);
        }
        const preInstructions = [];
        const initializePositionIx = await this.program.methods
            .initializePosition(lowerBinId, upperBinId - lowerBinId + 1)
            .accounts({
            payer: user,
            position: positionPubKey,
            lbPair: this.pubkey,
            owner: user,
        })
            .instruction();
        preInstructions.push(initializePositionIx);
        const lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
        const [binArrayLower] = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId);
        const upperBinArrayIndex = anchor_1.BN.max(lowerBinArrayIndex.add(new anchor_1.BN(1)), (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId)));
        const [binArrayUpper] = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId);
        const createBinArrayIxs = await this.createBinArraysIfNeeded([lowerBinArrayIndex, upperBinArrayIndex], user);
        preInstructions.push(...createBinArrayIxs);
        const [{ ataPubKey: userTokenX, ix: createPayerTokenXIx }, { ataPubKey: userTokenY, ix: createPayerTokenYIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user, this.tokenX.owner),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user, this.tokenY.owner),
        ]);
        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        const postInstructions = [];
        if ([
            this.tokenX.publicKey.toBase58(),
            this.tokenY.publicKey.toBase58(),
        ].includes(spl_token_1.NATIVE_MINT.toBase58())) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        const minBinId = Math.min(...binIds);
        const maxBinId = Math.max(...binIds);
        const minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
        const maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
        const useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
        const binArrayBitmapExtension = useExtension
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
            : null;
        const activeId = this.lbPair.activeId;
        const binLiquidityDist = (0, helpers_1.toWeightDistribution)(totalXAmount, totalYAmount, xYAmountDistribution.map((item) => ({
            binId: item.binId,
            xAmountBpsOfTotal: item.xAmountBpsOfTotal,
            yAmountBpsOfTotal: item.yAmountBpsOfTotal,
        })), this.lbPair.binStep);
        if (binLiquidityDist.length === 0) {
            throw new Error("No liquidity to add");
        }
        const liquidityParams = {
            amountX: totalXAmount,
            amountY: totalYAmount,
            binLiquidityDist,
            activeId,
            maxActiveBinSlippage,
        };
        const addLiquidityAccounts = {
            position: positionPubKey,
            lbPair: this.pubkey,
            userTokenX,
            userTokenY,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            binArrayLower,
            binArrayUpper,
            binArrayBitmapExtension,
            sender: user,
            tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
            tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        const oneSideLiquidityParams = {
            amount: totalXAmount.isZero() ? totalYAmount : totalXAmount,
            activeId,
            maxActiveBinSlippage,
            binLiquidityDist,
        };
        const oneSideAddLiquidityAccounts = {
            binArrayLower,
            binArrayUpper,
            lbPair: this.pubkey,
            binArrayBitmapExtension: null,
            sender: user,
            position: positionPubKey,
            reserve: totalXAmount.isZero()
                ? this.lbPair.reserveY
                : this.lbPair.reserveX,
            tokenMint: totalXAmount.isZero()
                ? this.lbPair.tokenYMint
                : this.lbPair.tokenXMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            userToken: totalXAmount.isZero() ? userTokenY : userTokenX,
        };
        const isOneSideDeposit = totalXAmount.isZero() || totalYAmount.isZero();
        const programMethod = isOneSideDeposit
            ? this.program.methods.addLiquidityOneSide(oneSideLiquidityParams)
            : this.program.methods.addLiquidityByWeight(liquidityParams);
        if (xYAmountDistribution.length < constants_1.MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX) {
            const addLiqIx = await programMethod
                .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
                .instruction();
            const instructions = [...preInstructions, addLiqIx, ...postInstructions];
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
            instructions.unshift(setCUIx);
            const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
            return new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...instructions);
        }
        const addLiqIx = await programMethod
            .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
            .instruction();
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, [addLiqIx], user, computeUnit_1.DEFAULT_ADD_LIQUIDITY_CU // The function return multiple transactions that dependent on each other, simulation will fail
        );
        const mainInstructions = [setCUIx, addLiqIx];
        const transactions = [];
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        if (preInstructions.length) {
            const preInstructionsTx = new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...preInstructions);
            transactions.push(preInstructionsTx);
        }
        const mainTx = new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(...mainInstructions);
        transactions.push(mainTx);
        if (postInstructions.length) {
            const postInstructionsTx = new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...postInstructions);
            transactions.push(postInstructionsTx);
        }
        return transactions;
    }
    /**
     * The `addLiquidityByStrategy` function is used to add liquidity to existing position
     * @param {TInitializePositionAndAddLiquidityParamsByStrategy}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `strategy`: The strategy parameters to be used for the liquidity pool (Can use `calculateStrategyParameter` to calculate).
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction>} The function `addLiquidityByWeight` returns a `Promise` that resolves to either a single
     * `Transaction` object
     */
    async addLiquidityByStrategy({ positionPubKey, totalXAmount, totalYAmount, strategy, user, slippage, }) {
        const { maxBinId, minBinId } = strategy;
        const maxActiveBinSlippage = slippage
            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
        const preInstructions = [];
        const minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
        const maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
        const useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
        const binArrayBitmapExtension = useExtension
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
            : null;
        const strategyParameters = (0, helpers_1.toStrategyParameters)(strategy);
        const binArrayIndexes = (0, positions_1.getBinArrayIndexesCoverage)(new anchor_1.BN(minBinId), new anchor_1.BN(maxBinId));
        const binArrayAccountsMeta = (0, positions_1.getBinArrayAccountMetasCoverage)(new anchor_1.BN(minBinId), new anchor_1.BN(maxBinId), this.pubkey, this.program.programId);
        const createBinArrayIxs = await this.createBinArraysIfNeeded(binArrayIndexes, user);
        preInstructions.push(...createBinArrayIxs);
        const [{ ataPubKey: userTokenX, ix: createPayerTokenXIx }, { ataPubKey: userTokenY, ix: createPayerTokenYIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user, this.tokenX.owner),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user, this.tokenY.owner),
        ]);
        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        const postInstructions = [];
        if ([
            this.tokenX.publicKey.toBase58(),
            this.tokenY.publicKey.toBase58(),
        ].includes(spl_token_1.NATIVE_MINT.toBase58())) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        const liquidityParams = {
            amountX: totalXAmount,
            amountY: totalYAmount,
            activeId: this.lbPair.activeId,
            maxActiveBinSlippage,
            strategyParameters,
        };
        const addLiquidityAccounts = {
            position: positionPubKey,
            lbPair: this.pubkey,
            userTokenX,
            userTokenY,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            binArrayBitmapExtension,
            sender: user,
            tokenXProgram: this.tokenX.owner,
            tokenYProgram: this.tokenY.owner,
            memoProgram: types_1.MEMO_PROGRAM_ID,
        };
        const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Liquidity);
        const programMethod = this.program.methods.addLiquidityByStrategy2(liquidityParams, {
            slices,
        });
        const addLiquidityIx = await programMethod
            .accounts(addLiquidityAccounts)
            .remainingAccounts(transferHookAccounts)
            .remainingAccounts(binArrayAccountsMeta)
            .instruction();
        const instructions = [
            ...preInstructions,
            addLiquidityIx,
            ...postInstructions,
        ];
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
        instructions.unshift(setCUIx);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(...instructions);
    }
    /**
     * @deprecated Use `addLiquidityByStrategy` instead which support both token and token2022.
     * The `addLiquidityByWeight` function is used to add liquidity to existing position
     * @param {TInitializePositionAndAddLiquidityParams}
     *    - `positionPubKey`: The public key of the position account. (usually use `new Keypair()`)
     *    - `totalXAmount`: The total amount of token X to be added to the liquidity pool.
     *    - `totalYAmount`: The total amount of token Y to be added to the liquidity pool.
     *    - `xYAmountDistribution`: An array of objects of type `XYAmountDistribution` that represents (can use `calculateSpotDistribution`, `calculateBidAskDistribution` & `calculateNormalDistribution`)
     *    - `user`: The public key of the user account.
     *    - `slippage`: The slippage percentage to be used for the liquidity pool.
     * @returns {Promise<Transaction|Transaction[]>} The function `addLiquidityByWeight` returns a `Promise` that resolves to either a single
     * `Transaction` object (if less than 26bin involved) or an array of `Transaction` objects.
     */
    async addLiquidityByWeight({ positionPubKey, totalXAmount, totalYAmount, xYAmountDistribution, user, slippage, }) {
        const maxActiveBinSlippage = slippage
            ? Math.ceil(slippage / (this.lbPair.binStep / 100))
            : constants_1.MAX_ACTIVE_BIN_SLIPPAGE;
        const positionAccount = await this.program.account.positionV2.fetch(positionPubKey);
        const { lowerBinId, upperBinId, binIds } = this.processXYAmountDistribution(xYAmountDistribution);
        if (lowerBinId < positionAccount.lowerBinId)
            throw new Error(`Lower Bin ID (${lowerBinId}) lower than Position Lower Bin Id (${positionAccount.lowerBinId})`);
        if (upperBinId > positionAccount.upperBinId)
            throw new Error(`Upper Bin ID (${upperBinId}) higher than Position Upper Bin Id (${positionAccount.upperBinId})`);
        const minBinId = Math.min(...binIds);
        const maxBinId = Math.max(...binIds);
        const minBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(minBinId));
        const maxBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(maxBinId));
        const useExtension = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(minBinArrayIndex) ||
            (0, helpers_1.isOverflowDefaultBinArrayBitmap)(maxBinArrayIndex);
        const binArrayBitmapExtension = useExtension
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
            : null;
        const activeId = this.lbPair.activeId;
        const binLiquidityDist = (0, helpers_1.toWeightDistribution)(totalXAmount, totalYAmount, xYAmountDistribution.map((item) => ({
            binId: item.binId,
            xAmountBpsOfTotal: item.xAmountBpsOfTotal,
            yAmountBpsOfTotal: item.yAmountBpsOfTotal,
        })), this.lbPair.binStep);
        if (binLiquidityDist.length === 0) {
            throw new Error("No liquidity to add");
        }
        const lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(positionAccount.lowerBinId));
        const [binArrayLower] = (0, helpers_1.deriveBinArray)(this.pubkey, lowerBinArrayIndex, this.program.programId);
        const upperBinArrayIndex = anchor_1.BN.max(lowerBinArrayIndex.add(new anchor_1.BN(1)), (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(positionAccount.upperBinId)));
        const [binArrayUpper] = (0, helpers_1.deriveBinArray)(this.pubkey, upperBinArrayIndex, this.program.programId);
        const preInstructions = [];
        const createBinArrayIxs = await this.createBinArraysIfNeeded([lowerBinArrayIndex, upperBinArrayIndex], user);
        preInstructions.push(...createBinArrayIxs);
        const [{ ataPubKey: userTokenX, ix: createPayerTokenXIx }, { ataPubKey: userTokenY, ix: createPayerTokenYIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, user, this.tokenX.owner),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, user, this.tokenY.owner),
        ]);
        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
        if (this.tokenX.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalXAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenX, BigInt(totalXAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        if (this.tokenY.publicKey.equals(spl_token_1.NATIVE_MINT) && !totalYAmount.isZero()) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenY, BigInt(totalYAmount.toString()));
            preInstructions.push(...wrapSOLIx);
        }
        const postInstructions = [];
        if ([
            this.tokenX.publicKey.toBase58(),
            this.tokenY.publicKey.toBase58(),
        ].includes(spl_token_1.NATIVE_MINT.toBase58())) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        const liquidityParams = {
            amountX: totalXAmount,
            amountY: totalYAmount,
            binLiquidityDist,
            activeId,
            maxActiveBinSlippage,
        };
        const addLiquidityAccounts = {
            position: positionPubKey,
            lbPair: this.pubkey,
            userTokenX,
            userTokenY,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            binArrayLower,
            binArrayUpper,
            binArrayBitmapExtension,
            sender: user,
            tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
            tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
        };
        const oneSideLiquidityParams = {
            amount: totalXAmount.isZero() ? totalYAmount : totalXAmount,
            activeId,
            maxActiveBinSlippage,
            binLiquidityDist,
        };
        const oneSideAddLiquidityAccounts = {
            binArrayLower,
            binArrayUpper,
            lbPair: this.pubkey,
            binArrayBitmapExtension: null,
            sender: user,
            position: positionPubKey,
            reserve: totalXAmount.isZero()
                ? this.lbPair.reserveY
                : this.lbPair.reserveX,
            tokenMint: totalXAmount.isZero()
                ? this.lbPair.tokenYMint
                : this.lbPair.tokenXMint,
            tokenProgram: spl_token_1.TOKEN_PROGRAM_ID,
            userToken: totalXAmount.isZero() ? userTokenY : userTokenX,
        };
        const isOneSideDeposit = totalXAmount.isZero() || totalYAmount.isZero();
        const programMethod = isOneSideDeposit
            ? this.program.methods.addLiquidityOneSide(oneSideLiquidityParams)
            : this.program.methods.addLiquidityByWeight(liquidityParams);
        if (xYAmountDistribution.length < constants_1.MAX_BIN_LENGTH_ALLOWED_IN_ONE_TX) {
            const addLiqIx = await programMethod
                .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
                .instruction();
            const instructions = [...preInstructions, addLiqIx, ...postInstructions];
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
            instructions.unshift(setCUIx);
            const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
            return new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...instructions);
        }
        const addLiqIx = await programMethod
            .accounts(isOneSideDeposit ? oneSideAddLiquidityAccounts : addLiquidityAccounts)
            .instruction();
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, [addLiqIx], user);
        const mainInstructions = [setCUIx, addLiqIx];
        const transactions = [];
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        if (preInstructions.length) {
            const preInstructionsTx = new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...preInstructions);
            transactions.push(preInstructionsTx);
        }
        const mainTx = new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(...mainInstructions);
        transactions.push(mainTx);
        if (postInstructions.length) {
            const postInstructionsTx = new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...postInstructions);
            transactions.push(postInstructionsTx);
        }
        return transactions;
    }
    /**
     * The `removeLiquidity` function is used to remove liquidity from a position,
     * with the option to claim rewards and close the position.
     * @param
     *    - `user`: The public key of the user account.
     *    - `position`: The public key of the position account.
     *    - `fromBinId`: The ID of the starting bin to remove liquidity from. Must within position range.
     *    - `toBinId`: The ID of the ending bin to remove liquidity from. Must within position range.
     *    - `liquiditiesBpsToRemove`: An array of numbers (percentage) that represent the liquidity to remove from each bin.
     *    - `shouldClaimAndClose`: A boolean flag that indicates whether to claim rewards and close the position.
     * @returns {Promise<Transaction | Transaction[]>}
     */
    async removeLiquidity({ user, position, fromBinId, toBinId, bps, shouldClaimAndClose = false, }) {
        const positionAccount = await this.program.provider.connection.getAccountInfo(position);
        const positionState = (0, positions_1.wrapPosition)(this.program, position, positionAccount);
        const lbPair = positionState.lbPair();
        const owner = positionState.owner();
        const feeOwner = positionState.feeOwner();
        const liquidityShares = positionState.liquidityShares();
        const liqudityShareWithBinId = liquidityShares.map((share, i) => {
            return {
                share,
                binId: positionState.lowerBinId().add(new anchor_1.BN(i)),
            };
        });
        const binIdsWithLiquidity = liqudityShareWithBinId.filter((bin) => {
            return !bin.share.isZero();
        });
        if (binIdsWithLiquidity.length == 0) {
            throw new Error("No liquidity to remove");
        }
        const lowerBinIdWithLiquidity = binIdsWithLiquidity[0].binId.toNumber();
        const upperBinIdWithLiquidity = binIdsWithLiquidity[binIdsWithLiquidity.length - 1].binId.toNumber();
        // Avoid to attempt to load uninitialized bin array on the program
        if (fromBinId < lowerBinIdWithLiquidity) {
            fromBinId = lowerBinIdWithLiquidity;
        }
        if (toBinId > upperBinIdWithLiquidity) {
            toBinId = upperBinIdWithLiquidity;
        }
        const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Liquidity);
        const binArrayAccountsMeta = (0, positions_1.getBinArrayAccountMetasCoverage)(new anchor_1.BN(fromBinId), new anchor_1.BN(toBinId), this.pubkey, this.program.programId);
        const preInstructions = [];
        const walletToReceiveFee = feeOwner.equals(web3_js_1.PublicKey.default)
            ? user
            : feeOwner;
        const [{ ataPubKey: userTokenX, ix: createPayerTokenXIx }, { ataPubKey: userTokenY, ix: createPayerTokenYIx }, { ataPubKey: feeOwnerTokenX, ix: createFeeOwnerTokenXIx }, { ataPubKey: feeOwnerTokenY, ix: createFeeOwnerTokenYIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, owner, this.tokenX.owner, user),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, owner, this.tokenY.owner, user),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, walletToReceiveFee, this.tokenX.owner, user),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, walletToReceiveFee, this.tokenY.owner, user),
        ]);
        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
        if (!walletToReceiveFee.equals(owner)) {
            createFeeOwnerTokenXIx && preInstructions.push(createFeeOwnerTokenXIx);
            createFeeOwnerTokenYIx && preInstructions.push(createFeeOwnerTokenYIx);
        }
        const secondTransactionsIx = [];
        const postInstructions = [];
        if (shouldClaimAndClose) {
            const claimSwapFeeIx = await this.program.methods
                .claimFee2(fromBinId, toBinId, {
                slices,
            })
                .accounts({
                lbPair: this.pubkey,
                sender: user,
                position,
                reserveX: this.lbPair.reserveX,
                reserveY: this.lbPair.reserveY,
                tokenXMint: this.tokenX.publicKey,
                tokenYMint: this.tokenY.publicKey,
                userTokenX: feeOwnerTokenX,
                userTokenY: feeOwnerTokenY,
                tokenProgramX: this.tokenX.owner,
                tokenProgramY: this.tokenY.owner,
                memoProgram: types_1.MEMO_PROGRAM_ID,
            })
                .remainingAccounts(transferHookAccounts)
                .remainingAccounts(binArrayAccountsMeta)
                .instruction();
            postInstructions.push(claimSwapFeeIx);
            for (let i = 0; i < 2; i++) {
                const rewardInfo = this.lbPair.rewardInfos[i];
                if (!rewardInfo || rewardInfo.mint.equals(web3_js_1.PublicKey.default))
                    continue;
                const { ataPubKey, ix: rewardAtaIx } = await (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, rewardInfo.mint, user, this.rewards[i].owner);
                rewardAtaIx && preInstructions.push(rewardAtaIx);
                const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Reward, i);
                const claimRewardIx = await this.program.methods
                    .claimReward2(new anchor_1.BN(i), fromBinId, toBinId, {
                    slices,
                })
                    .accounts({
                    lbPair: this.pubkey,
                    sender: user,
                    position,
                    rewardVault: rewardInfo.vault,
                    rewardMint: rewardInfo.mint,
                    tokenProgram: this.rewards[i].owner,
                    userTokenAccount: ataPubKey,
                    memoProgram: types_1.MEMO_PROGRAM_ID,
                })
                    .remainingAccounts(transferHookAccounts)
                    .remainingAccounts(binArrayAccountsMeta)
                    .instruction();
                secondTransactionsIx.push(claimRewardIx);
            }
            const closePositionIx = await this.program.methods
                .closePositionIfEmpty()
                .accounts({
                rentReceiver: owner, // Must be position owner
                position,
                sender: user,
            })
                .instruction();
            if (secondTransactionsIx.length) {
                secondTransactionsIx.push(closePositionIx);
            }
            else {
                postInstructions.push(closePositionIx);
            }
        }
        if ([
            this.tokenX.publicKey.toBase58(),
            this.tokenY.publicKey.toBase58(),
        ].includes(spl_token_1.NATIVE_MINT.toBase58())) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        const binArrayBitmapExtension = this.binArrayBitmapExtension
            ? this.binArrayBitmapExtension.publicKey
            : this.program.programId;
        const removeLiquidityTx = await this.program.methods
            .removeLiquidityByRange2(fromBinId, toBinId, bps.toNumber(), {
            slices,
        })
            .accounts({
            position,
            lbPair,
            userTokenX,
            userTokenY,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.tokenX.publicKey,
            tokenYMint: this.tokenY.publicKey,
            binArrayBitmapExtension,
            tokenXProgram: this.tokenX.owner,
            tokenYProgram: this.tokenY.owner,
            sender: user,
            memoProgram: types_1.MEMO_PROGRAM_ID,
        })
            .remainingAccounts(transferHookAccounts)
            .remainingAccounts(binArrayAccountsMeta)
            .instruction();
        const instructions = [
            ...preInstructions,
            removeLiquidityTx,
            ...postInstructions,
        ];
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
        instructions.unshift(setCUIx);
        if (secondTransactionsIx.length) {
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, secondTransactionsIx, user);
            const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
            const claimRewardsTx = new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(setCUIx, ...secondTransactionsIx);
            const mainTx = new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...instructions);
            return [mainTx, claimRewardsTx];
        }
        else {
            const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
            return new web3_js_1.Transaction({
                blockhash,
                lastValidBlockHeight,
                feePayer: user,
            }).add(...instructions);
        }
    }
    /**
     * The `closePositionIfEmpty` function closes a position if it is empty. Else, it does nothing.
     */
    async closePositionIfEmpty({ owner, position, }) {
        const closePositionIfEmptyIx = await this.program.methods
            .closePositionIfEmpty()
            .accounts({
            rentReceiver: owner,
            position: position.publicKey,
            sender: owner,
        })
            .instruction();
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, [closePositionIfEmptyIx], owner);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: owner,
        }).add(setCUIx, closePositionIfEmptyIx);
    }
    /**
     * The `closePosition` function closes a position
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction>}
     */
    async closePosition({ owner, position, }) {
        const closePositionIx = await this.program.methods
            .closePosition2()
            .accounts({
            rentReceiver: owner,
            position: position.publicKey,
            sender: owner,
        })
            .instruction();
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, [closePositionIx], owner);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: owner,
        }).add(setCUIx, closePositionIx);
    }
    /**
     * The `swapQuoteExactOut` function returns a quote for a swap
     * @param
     *    - `outAmount`: Amount of lamport to swap out
     *    - `swapForY`: Swap token X to Y when it is true, else reversed.
     *    - `allowedSlippage`: Allowed slippage for the swap. Expressed in BPS. To convert from slippage percentage to BPS unit: SLIPPAGE_PERCENTAGE * 100
     *    - `maxExtraBinArrays`: Maximum number of extra binArrays to return
     * @returns {SwapQuote}
     *    - `inAmount`: Amount of lamport to swap in
     *    - `outAmount`: Amount of lamport to swap out
     *    - `fee`: Fee amount
     *    - `protocolFee`: Protocol fee amount
     *    - `maxInAmount`: Maximum amount of lamport to swap in
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @throws {DlmmSdkError}
     *
     */
    swapQuoteExactOut(outAmount, swapForY, allowedSlippage, binArrays, maxExtraBinArrays = 0) {
        const currentTimestamp = Date.now() / 1000;
        const [inMint, outMint] = swapForY
            ? [this.tokenX.mint, this.tokenY.mint]
            : [this.tokenY.mint, this.tokenX.mint];
        let outAmountLeft = (0, token_2022_1.calculateTransferFeeIncludedAmount)(outAmount, outMint, this.clock.epoch.toNumber()).amount;
        if (maxExtraBinArrays < 0 || maxExtraBinArrays > constants_1.MAX_EXTRA_BIN_ARRAYS) {
            throw new error_1.DlmmSdkError("INVALID_MAX_EXTRA_BIN_ARRAYS", `maxExtraBinArrays must be a value between 0 and ${constants_1.MAX_EXTRA_BIN_ARRAYS}`);
        }
        let vParameterClone = Object.assign({}, this.lbPair.vParameters);
        let activeId = new anchor_1.BN(this.lbPair.activeId);
        const binStep = this.lbPair.binStep;
        const sParameters = this.lbPair.parameters;
        this.updateReference(activeId.toNumber(), vParameterClone, sParameters, currentTimestamp);
        let startBinId = activeId;
        let binArraysForSwap = new Map();
        let actualInAmount = new anchor_1.BN(0);
        let feeAmount = new anchor_1.BN(0);
        let protocolFeeAmount = new anchor_1.BN(0);
        while (!outAmountLeft.isZero()) {
            let binArrayAccountToSwap = (0, helpers_1.findNextBinArrayWithLiquidity)(swapForY, activeId, this.lbPair, this.binArrayBitmapExtension?.account ?? null, binArrays);
            if (binArrayAccountToSwap == null) {
                throw new error_1.DlmmSdkError("SWAP_QUOTE_INSUFFICIENT_LIQUIDITY", "Insufficient liquidity in binArrays");
            }
            binArraysForSwap.set(binArrayAccountToSwap.publicKey, true);
            this.updateVolatilityAccumulator(vParameterClone, sParameters, activeId.toNumber());
            if ((0, helpers_1.isBinIdWithinBinArray)(activeId, binArrayAccountToSwap.account.index)) {
                const bin = (0, helpers_1.getBinFromBinArray)(activeId.toNumber(), binArrayAccountToSwap.account);
                const { amountIn, amountOut, fee, protocolFee } = (0, helpers_1.swapExactOutQuoteAtBin)(bin, binStep, sParameters, vParameterClone, outAmountLeft, swapForY);
                if (!amountOut.isZero()) {
                    outAmountLeft = outAmountLeft.sub(amountOut);
                    actualInAmount = actualInAmount.add(amountIn);
                    feeAmount = feeAmount.add(fee);
                    protocolFeeAmount = protocolFee.add(protocolFee);
                }
            }
            if (!outAmountLeft.isZero()) {
                if (swapForY) {
                    activeId = activeId.sub(new anchor_1.BN(1));
                }
                else {
                    activeId = activeId.add(new anchor_1.BN(1));
                }
            }
        }
        const startPrice = (0, helpers_1.getPriceOfBinByBinId)(startBinId.toNumber(), this.lbPair.binStep);
        const endPrice = (0, helpers_1.getPriceOfBinByBinId)(activeId.toNumber(), this.lbPair.binStep);
        const priceImpact = startPrice
            .sub(endPrice)
            .abs()
            .div(startPrice)
            .mul(new decimal_js_1.default(100));
        actualInAmount = (0, token_2022_1.calculateTransferFeeIncludedAmount)(actualInAmount.add(feeAmount), inMint, this.clock.epoch.toNumber()).amount;
        const maxInAmount = actualInAmount
            .mul(new anchor_1.BN(constants_1.BASIS_POINT_MAX).add(allowedSlippage))
            .div(new anchor_1.BN(constants_1.BASIS_POINT_MAX));
        if (maxExtraBinArrays > 0 && maxExtraBinArrays <= constants_1.MAX_EXTRA_BIN_ARRAYS) {
            const extraBinArrays = new Array();
            while (extraBinArrays.length < maxExtraBinArrays) {
                let binArrayAccountToSwap = (0, helpers_1.findNextBinArrayWithLiquidity)(swapForY, activeId, this.lbPair, this.binArrayBitmapExtension?.account ?? null, binArrays);
                if (binArrayAccountToSwap == null) {
                    break;
                }
                const binArrayAccountToSwapExisted = binArraysForSwap.has(binArrayAccountToSwap.publicKey);
                if (binArrayAccountToSwapExisted) {
                    if (swapForY) {
                        activeId = activeId.sub(new anchor_1.BN(1));
                    }
                    else {
                        activeId = activeId.add(new anchor_1.BN(1));
                    }
                }
                else {
                    extraBinArrays.push(binArrayAccountToSwap.publicKey);
                    const [lowerBinId, upperBinId] = (0, helpers_1.getBinArrayLowerUpperBinId)(binArrayAccountToSwap.account.index);
                    if (swapForY) {
                        activeId = lowerBinId.sub(new anchor_1.BN(1));
                    }
                    else {
                        activeId = upperBinId.add(new anchor_1.BN(1));
                    }
                }
            }
            // save to binArraysForSwap result
            extraBinArrays.forEach((binArrayPubkey) => {
                binArraysForSwap.set(binArrayPubkey, true);
            });
        }
        const binArraysPubkey = Array.from(binArraysForSwap.keys());
        return {
            inAmount: actualInAmount,
            maxInAmount,
            outAmount,
            priceImpact,
            fee: feeAmount,
            protocolFee: protocolFeeAmount,
            binArraysPubkey,
        };
    }
    /**
     * The `swapQuote` function returns a quote for a swap
     * @param
     *    - `inAmount`: Amount of lamport to swap in
     *    - `swapForY`: Swap token X to Y when it is true, else reversed.
     *    - `allowedSlippage`: Allowed slippage for the swap. Expressed in BPS. To convert from slippage percentage to BPS unit: SLIPPAGE_PERCENTAGE * 100
     *    - `binArrays`: binArrays for swapQuote.
     *    - `isPartialFill`: Flag to check whether the the swapQuote is partial fill, default = false.
     *    - `maxExtraBinArrays`: Maximum number of extra binArrays to return
     * @returns {SwapQuote}
     *    - `consumedInAmount`: Amount of lamport to swap in
     *    - `outAmount`: Amount of lamport to swap out
     *    - `fee`: Fee amount
     *    - `protocolFee`: Protocol fee amount
     *    - `minOutAmount`: Minimum amount of lamport to swap out
     *    - `priceImpact`: Price impact of the swap
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @throws {DlmmSdkError}
     */
    swapQuote(inAmount, swapForY, allowedSlippage, binArrays, isPartialFill, maxExtraBinArrays = 0) {
        const currentTimestamp = Date.now() / 1000;
        if (maxExtraBinArrays < 0 || maxExtraBinArrays > constants_1.MAX_EXTRA_BIN_ARRAYS) {
            throw new error_1.DlmmSdkError("INVALID_MAX_EXTRA_BIN_ARRAYS", `maxExtraBinArrays must be a value between 0 and ${constants_1.MAX_EXTRA_BIN_ARRAYS}`);
        }
        const [inMint, outMint] = swapForY
            ? [this.tokenX.mint, this.tokenY.mint]
            : [this.tokenY.mint, this.tokenX.mint];
        let transferFeeExcludedAmountIn = (0, token_2022_1.calculateTransferFeeExcludedAmount)(inAmount, inMint, this.clock.epoch.toNumber()).amount;
        let inAmountLeft = transferFeeExcludedAmountIn;
        let vParameterClone = Object.assign({}, this.lbPair.vParameters);
        let activeId = new anchor_1.BN(this.lbPair.activeId);
        const binStep = this.lbPair.binStep;
        const sParameters = this.lbPair.parameters;
        this.updateReference(activeId.toNumber(), vParameterClone, sParameters, currentTimestamp);
        let startBin = null;
        let binArraysForSwap = new Map();
        let totalOutAmount = new anchor_1.BN(0);
        let feeAmount = new anchor_1.BN(0);
        let protocolFeeAmount = new anchor_1.BN(0);
        let lastFilledActiveBinId = activeId;
        while (!inAmountLeft.isZero()) {
            let binArrayAccountToSwap = (0, helpers_1.findNextBinArrayWithLiquidity)(swapForY, activeId, this.lbPair, this.binArrayBitmapExtension?.account ?? null, binArrays);
            if (binArrayAccountToSwap == null) {
                if (isPartialFill) {
                    break;
                }
                else {
                    throw new error_1.DlmmSdkError("SWAP_QUOTE_INSUFFICIENT_LIQUIDITY", "Insufficient liquidity in binArrays for swapQuote");
                }
            }
            binArraysForSwap.set(binArrayAccountToSwap.publicKey, true);
            this.updateVolatilityAccumulator(vParameterClone, sParameters, activeId.toNumber());
            if ((0, helpers_1.isBinIdWithinBinArray)(activeId, binArrayAccountToSwap.account.index)) {
                const bin = (0, helpers_1.getBinFromBinArray)(activeId.toNumber(), binArrayAccountToSwap.account);
                const { amountIn, amountOut, fee, protocolFee } = (0, helpers_1.swapExactInQuoteAtBin)(bin, binStep, sParameters, vParameterClone, inAmountLeft, swapForY);
                if (!amountIn.isZero()) {
                    inAmountLeft = inAmountLeft.sub(amountIn);
                    totalOutAmount = totalOutAmount.add(amountOut);
                    feeAmount = feeAmount.add(fee);
                    protocolFeeAmount = protocolFee.add(protocolFee);
                    if (!startBin) {
                        startBin = bin;
                    }
                    lastFilledActiveBinId = activeId;
                }
            }
            if (!inAmountLeft.isZero()) {
                if (swapForY) {
                    activeId = activeId.sub(new anchor_1.BN(1));
                }
                else {
                    activeId = activeId.add(new anchor_1.BN(1));
                }
            }
        }
        if (!startBin) {
            // The pool insufficient liquidity
            throw new error_1.DlmmSdkError("SWAP_QUOTE_INSUFFICIENT_LIQUIDITY", "Insufficient liquidity");
        }
        const actualInAmount = transferFeeExcludedAmountIn.sub(inAmountLeft);
        let transferFeeIncludedInAmount = (0, token_2022_1.calculateTransferFeeIncludedAmount)(actualInAmount, inMint, this.clock.epoch.toNumber()).amount;
        transferFeeIncludedInAmount = transferFeeIncludedInAmount.gt(inAmount)
            ? inAmount
            : transferFeeIncludedInAmount;
        const outAmountWithoutSlippage = (0, helpers_1.getOutAmount)(startBin, actualInAmount.sub((0, helpers_1.computeFeeFromAmount)(binStep, sParameters, vParameterClone, actualInAmount)), swapForY);
        const priceImpact = new decimal_js_1.default(totalOutAmount.toString())
            .sub(new decimal_js_1.default(outAmountWithoutSlippage.toString()))
            .div(new decimal_js_1.default(outAmountWithoutSlippage.toString()))
            .mul(new decimal_js_1.default(100));
        const endPrice = (0, helpers_1.getPriceOfBinByBinId)(lastFilledActiveBinId.toNumber(), this.lbPair.binStep);
        if (maxExtraBinArrays > 0 && maxExtraBinArrays <= constants_1.MAX_EXTRA_BIN_ARRAYS) {
            const extraBinArrays = new Array();
            while (extraBinArrays.length < maxExtraBinArrays) {
                let binArrayAccountToSwap = (0, helpers_1.findNextBinArrayWithLiquidity)(swapForY, activeId, this.lbPair, this.binArrayBitmapExtension?.account ?? null, binArrays);
                if (binArrayAccountToSwap == null) {
                    break;
                }
                const binArrayAccountToSwapExisted = binArraysForSwap.has(binArrayAccountToSwap.publicKey);
                if (binArrayAccountToSwapExisted) {
                    if (swapForY) {
                        activeId = activeId.sub(new anchor_1.BN(1));
                    }
                    else {
                        activeId = activeId.add(new anchor_1.BN(1));
                    }
                }
                else {
                    extraBinArrays.push(binArrayAccountToSwap.publicKey);
                    const [lowerBinId, upperBinId] = (0, helpers_1.getBinArrayLowerUpperBinId)(binArrayAccountToSwap.account.index);
                    if (swapForY) {
                        activeId = lowerBinId.sub(new anchor_1.BN(1));
                    }
                    else {
                        activeId = upperBinId.add(new anchor_1.BN(1));
                    }
                }
            }
            // save to binArraysForSwap result
            extraBinArrays.forEach((binArrayPubkey) => {
                binArraysForSwap.set(binArrayPubkey, true);
            });
        }
        const binArraysPubkey = Array.from(binArraysForSwap.keys());
        const transferFeeExcludedAmountOut = (0, token_2022_1.calculateTransferFeeExcludedAmount)(totalOutAmount, outMint, this.clock.epoch.toNumber()).amount;
        const minOutAmount = transferFeeExcludedAmountOut
            .mul(new anchor_1.BN(constants_1.BASIS_POINT_MAX).sub(allowedSlippage))
            .div(new anchor_1.BN(constants_1.BASIS_POINT_MAX));
        return {
            consumedInAmount: transferFeeIncludedInAmount,
            outAmount: transferFeeExcludedAmountOut,
            fee: feeAmount,
            protocolFee: protocolFeeAmount,
            minOutAmount,
            priceImpact,
            binArraysPubkey,
            endPrice,
        };
    }
    async swapExactOut({ inToken, outToken, outAmount, maxInAmount, lbPair, user, binArraysPubkey, }) {
        const preInstructions = [];
        const postInstructions = [];
        const [inTokenProgram, outTokenProgram] = inToken.equals(this.lbPair.tokenXMint)
            ? [this.tokenX.owner, this.tokenY.owner]
            : [this.tokenY.owner, this.tokenX.owner];
        const [{ ataPubKey: userTokenIn, ix: createInTokenAccountIx }, { ataPubKey: userTokenOut, ix: createOutTokenAccountIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, inToken, user, inTokenProgram),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, outToken, user, outTokenProgram),
        ]);
        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
        if (inToken.equals(spl_token_1.NATIVE_MINT)) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenIn, BigInt(maxInAmount.toString()));
            preInstructions.push(...wrapSOLIx);
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        if (outToken.equals(spl_token_1.NATIVE_MINT)) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Liquidity);
        const binArrays = binArraysPubkey.map((pubkey) => {
            return {
                isSigner: false,
                isWritable: true,
                pubkey,
            };
        });
        const swapIx = await this.program.methods
            .swapExactOut2(maxInAmount, outAmount, { slices })
            .accounts({
            lbPair,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            tokenXProgram: this.tokenX.owner,
            tokenYProgram: this.tokenY.owner,
            user,
            userTokenIn,
            userTokenOut,
            binArrayBitmapExtension: this.binArrayBitmapExtension
                ? this.binArrayBitmapExtension.publicKey
                : null,
            oracle: this.lbPair.oracle,
            hostFeeIn: null,
            memoProgram: types_1.MEMO_PROGRAM_ID,
        })
            .remainingAccounts(transferHookAccounts)
            .remainingAccounts(binArrays)
            .instruction();
        const instructions = [...preInstructions, swapIx, ...postInstructions];
        // const setCUIx = await getEstimatedComputeUnitIxWithBuffer(
        //   this.program.provider.connection,
        //   instructions,
        //   user
        // );
        // instructions.unshift(setCUIx);
        instructions.push(web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
            units: 1_400_000,
        }));
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(...instructions);
    }
    /**
     * Returns a transaction to be signed and sent by user performing swap.
     * @param {SwapWithPriceImpactParams}
     *    - `inToken`: The public key of the token to be swapped in.
     *    - `outToken`: The public key of the token to be swapped out.
     *    - `inAmount`: The amount of token to be swapped in.
     *    - `priceImpact`: Accepted price impact bps.
     *    - `lbPair`: The public key of the liquidity pool.
     *    - `user`: The public key of the user account.
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @returns {Promise<Transaction>}
     */
    async swapWithPriceImpact({ inToken, outToken, inAmount, lbPair, user, priceImpact, binArraysPubkey, }) {
        const preInstructions = [];
        const postInstructions = [];
        const [{ ataPubKey: userTokenIn, ix: createInTokenAccountIx }, { ataPubKey: userTokenOut, ix: createOutTokenAccountIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, inToken, user, this.tokenX.owner),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, outToken, user, this.tokenY.owner),
        ]);
        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
        if (inToken.equals(spl_token_1.NATIVE_MINT)) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenIn, BigInt(inAmount.toString()));
            preInstructions.push(...wrapSOLIx);
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        if (outToken.equals(spl_token_1.NATIVE_MINT)) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        // TODO: needs some refinement in case binArray not yet initialized
        const binArrays = binArraysPubkey.map((pubkey) => {
            return {
                isSigner: false,
                isWritable: true,
                pubkey,
            };
        });
        const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Liquidity);
        const swapIx = await this.program.methods
            .swapWithPriceImpact2(inAmount, this.lbPair.activeId, priceImpact.toNumber(), { slices })
            .accounts({
            lbPair,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            tokenXProgram: this.tokenX.owner,
            tokenYProgram: this.tokenY.owner,
            user,
            userTokenIn,
            userTokenOut,
            binArrayBitmapExtension: this.binArrayBitmapExtension
                ? this.binArrayBitmapExtension.publicKey
                : null,
            oracle: this.lbPair.oracle,
            hostFeeIn: null,
            memoProgram: types_1.MEMO_PROGRAM_ID,
        })
            .remainingAccounts(transferHookAccounts)
            .remainingAccounts(binArrays)
            .instruction();
        const instructions = [...preInstructions, swapIx, ...postInstructions];
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
        instructions.unshift(setCUIx);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(...instructions);
    }
    /**
     * Returns a transaction to be signed and sent by user performing swap.
     * @param {SwapParams}
     *    - `inToken`: The public key of the token to be swapped in.
     *    - `outToken`: The public key of the token to be swapped out.
     *    - `inAmount`: The amount of token to be swapped in.
     *    - `minOutAmount`: The minimum amount of token to be swapped out.
     *    - `lbPair`: The public key of the liquidity pool.
     *    - `user`: The public key of the user account.
     *    - `binArraysPubkey`: Array of bin arrays involved in the swap
     * @returns {Promise<Transaction>}
     */
    async swap({ inToken, outToken, inAmount, minOutAmount, lbPair, user, binArraysPubkey, }) {
        const preInstructions = [];
        const postInstructions = [];
        const [inTokenProgram, outTokenProgram] = inToken.equals(this.lbPair.tokenXMint)
            ? [this.tokenX.owner, this.tokenY.owner]
            : [this.tokenY.owner, this.tokenX.owner];
        const [{ ataPubKey: userTokenIn, ix: createInTokenAccountIx }, { ataPubKey: userTokenOut, ix: createOutTokenAccountIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, inToken, user, inTokenProgram),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, outToken, user, outTokenProgram),
        ]);
        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
        if (inToken.equals(spl_token_1.NATIVE_MINT)) {
            const wrapSOLIx = (0, helpers_1.wrapSOLInstruction)(user, userTokenIn, BigInt(inAmount.toString()));
            preInstructions.push(...wrapSOLIx);
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        if (outToken.equals(spl_token_1.NATIVE_MINT)) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(user);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        // TODO: needs some refinement in case binArray not yet initialized
        const binArrays = binArraysPubkey.map((pubkey) => {
            return {
                isSigner: false,
                isWritable: true,
                pubkey,
            };
        });
        const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Liquidity);
        const swapIx = await this.program.methods
            .swap2(inAmount, minOutAmount, { slices })
            .accounts({
            lbPair,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            tokenXProgram: this.tokenX.owner,
            tokenYProgram: this.tokenY.owner,
            user,
            userTokenIn,
            userTokenOut,
            binArrayBitmapExtension: this.binArrayBitmapExtension
                ? this.binArrayBitmapExtension.publicKey
                : null,
            oracle: this.lbPair.oracle,
            hostFeeIn: null,
            memoProgram: types_1.MEMO_PROGRAM_ID,
        })
            .remainingAccounts(transferHookAccounts)
            .remainingAccounts(binArrays)
            .instruction();
        const instructions = [...preInstructions, swapIx, ...postInstructions];
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, user);
        instructions.unshift(setCUIx);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: user,
        }).add(...instructions);
    }
    /**
     * The claimLMReward function is used to claim rewards for a specific position owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction>} Claim LM reward transactions.
     */
    async claimLMReward({ owner, position, }) {
        const claimTransactions = await this.createClaimBuildMethod({
            owner,
            position,
        });
        if (!claimTransactions.length)
            return;
        const instructions = claimTransactions.map((t) => t.instructions).flat();
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, owner);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: owner,
        }).add(setCUIx, ...claimTransactions);
    }
    /**
     * The `claimAllLMRewards` function is used to claim all liquidity mining rewards for a given owner
     * and their positions.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim rewards from.
     * @returns {Promise<Transaction[]>} Array of claim LM reward and fees transactions.
     */
    async claimAllLMRewards({ owner, positions, }) {
        const claimAllTxs = (await Promise.all(positions
            .filter(({ positionData: { rewardOne, rewardTwo } }) => !rewardOne.isZero() || !rewardTwo.isZero())
            .map(async (position, idx) => {
            return await this.createClaimBuildMethod({
                owner,
                position,
            });
        }))).flat();
        const chunkedClaimAllTx = (0, helpers_1.chunks)(claimAllTxs, constants_1.MAX_CLAIM_ALL_ALLOWED);
        if (chunkedClaimAllTx.length === 0)
            return [];
        const chunkedClaimAllTxIx = await Promise.all(chunkedClaimAllTx.map(async (txs) => {
            const ixs = txs.map((t) => t.instructions).flat();
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, ixs, owner);
            return [setCUIx, ...ixs];
        }));
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return Promise.all(chunkedClaimAllTxIx.map(async (claimAllTx) => {
            return new web3_js_1.Transaction({
                feePayer: owner,
                blockhash,
                lastValidBlockHeight,
            }).add(...claimAllTx);
        }));
    }
    async setActivationPoint(activationPoint) {
        const setActivationPointTx = await this.program.methods
            .setActivationPoint(activationPoint)
            .accounts({
            lbPair: this.pubkey,
            admin: this.lbPair.creator,
        })
            .transaction();
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            feePayer: this.lbPair.creator,
            blockhash,
            lastValidBlockHeight,
        }).add(setActivationPointTx);
    }
    async setPairStatus(enabled) {
        const pairStatus = enabled ? 0 : 1;
        const tx = await this.program.methods
            .setPairStatus(pairStatus)
            .accounts({
            lbPair: this.pubkey,
            admin: this.lbPair.creator,
        })
            .transaction();
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            feePayer: this.lbPair.creator,
            blockhash,
            lastValidBlockHeight,
        }).add(tx);
    }
    /**
     * The function `claimSwapFee` is used to claim swap fees for a specific position owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     *    - `binRange`: The bin range to claim swap fees for. If not provided, the function claim swap fees for full range.
     * @returns {Promise<Transaction>} Claim swap fee transactions.
     */
    async claimSwapFee({ owner, position, }) {
        const claimFeeTx = await this.createClaimSwapFeeMethod({ owner, position });
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, claimFeeTx.instructions, owner);
        return new web3_js_1.Transaction({
            blockhash,
            lastValidBlockHeight,
            feePayer: owner,
        }).add(setCUIx, ...claimFeeTx.instructions);
    }
    /**
     * The `claimAllSwapFee` function to claim swap fees for multiple positions owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees from.
     * @returns {Promise<Transaction[]>} Array of claim swap fee transactions.
     */
    async claimAllSwapFee({ owner, positions, }) {
        const claimAllTxs = (await Promise.all(positions
            .filter(({ positionData: { feeX, feeY } }) => !feeX.isZero() || !feeY.isZero())
            .map(async (position) => {
            return await this.createClaimSwapFeeMethod({
                owner,
                position,
            });
        }))).flat();
        const chunkedClaimAllTx = (0, helpers_1.chunks)(claimAllTxs, constants_1.MAX_CLAIM_ALL_ALLOWED);
        if (chunkedClaimAllTx.length === 0)
            return [];
        const chunkedClaimAllTxIxs = await Promise.all(chunkedClaimAllTx.map(async (tx) => {
            const ixs = tx.map((t) => t.instructions).flat();
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, ixs, owner);
            return [setCUIx, ...ixs];
        }));
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return Promise.all(chunkedClaimAllTxIxs.map(async (claimAllTx) => {
            return new web3_js_1.Transaction({
                feePayer: owner,
                blockhash,
                lastValidBlockHeight,
            }).add(...claimAllTx);
        }));
    }
    /**
     * The function `claimAllRewardsByPosition` allows a user to claim all rewards for a specific
     * position.
     * @param
     *    - `owner`: The public key of the owner of the position.
     *    - `position`: The public key of the position account.
     * @returns {Promise<Transaction[]>} Array of claim reward transactions.
     */
    async claimAllRewardsByPosition({ owner, position, }) {
        const claimAllSwapFeeTxs = await this.createClaimSwapFeeMethod({
            owner,
            position,
        });
        const claimAllLMTxs = await this.createClaimBuildMethod({
            owner,
            position,
        });
        const claimAllTxs = (0, helpers_1.chunks)([claimAllSwapFeeTxs, ...claimAllLMTxs], constants_1.MAX_CLAIM_ALL_ALLOWED);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return Promise.all(claimAllTxs.map(async (claimAllTx) => {
            const instructions = claimAllTx.map((t) => t.instructions).flat();
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, owner);
            const tx = new web3_js_1.Transaction({
                feePayer: owner,
                blockhash,
                lastValidBlockHeight,
            }).add(setCUIx, ...instructions);
            return tx;
        }));
    }
    /**
     * The `seedLiquidity` function create multiple grouped instructions. The grouped instructions will be [init ata + send lamport for token provde], [initialize bin array + initialize position instructions] and [deposit instruction]. Each grouped instructions can be executed parallelly.
     * @param
     *    - `owner`: The public key of the positions owner.
     *    - `seedAmount`: Lamport amount to be seeded to the pool.
     *    - `minPrice`: Start price in UI format
     *    - `maxPrice`: End price in UI format
     *    - `base`: Base key
     *    - `txPayer`: Account rental fee payer
     *    - `feeOwner`: Fee owner key. Default to position owner
     *    - `operator`: Operator key
     *    - `lockReleasePoint`: Timelock. Point (slot/timestamp) the position can withdraw the liquidity,
     *    - `shouldSeedPositionOwner` (optional): Whether to send 1 lamport amount of token X to the position owner to prove ownership.
     * @returns {Promise<SeedLiquidityResponse>}
     */
    async seedLiquidity(owner, seedAmount, curvature, minPrice, maxPrice, base, payer, feeOwner, operator, lockReleasePoint, shouldSeedPositionOwner = false) {
        const toLamportMultiplier = new decimal_js_1.default(10 ** (this.tokenY.mint.decimals - this.tokenX.mint.decimals));
        const minPricePerLamport = new decimal_js_1.default(minPrice).mul(toLamportMultiplier);
        const maxPricePerLamport = new decimal_js_1.default(maxPrice).mul(toLamportMultiplier);
        const minBinId = new anchor_1.BN(DLMM.getBinIdFromPrice(minPricePerLamport, this.lbPair.binStep, false));
        const maxBinId = new anchor_1.BN(DLMM.getBinIdFromPrice(maxPricePerLamport, this.lbPair.binStep, true));
        if (minBinId.toNumber() < this.lbPair.activeId) {
            throw new Error("minPrice < current pair price");
        }
        if (minBinId.toNumber() >= maxBinId.toNumber()) {
            throw new Error("Price range too small");
        }
        // Generate amount for each bin
        const k = 1.0 / curvature;
        const binDepositAmount = (0, math_1.generateAmountForBinRange)(seedAmount, this.lbPair.binStep, this.tokenX.mint.decimals, this.tokenY.mint.decimals, minBinId, maxBinId, k);
        const decompressMultiplier = new anchor_1.BN(10 ** this.tokenX.mint.decimals);
        let { compressedBinAmount, compressionLoss } = (0, math_1.compressBinAmount)(binDepositAmount, decompressMultiplier);
        // Distribute loss after compression back to bins based on bin ratio with total deposited amount
        let { newCompressedBinAmount: compressedBinDepositAmount, loss: finalLoss, } = (0, math_1.distributeAmountToCompressedBinsByRatio)(compressedBinAmount, compressionLoss, decompressMultiplier, new anchor_1.BN(2 ** 32 - 1) // u32
        );
        // This amount will be deposited to the last bin without compression
        const positionCount = (0, math_1.getPositionCount)(minBinId, maxBinId.sub(new anchor_1.BN(1)));
        const seederTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, operator, false, this.tokenX.owner);
        const seederTokenY = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenYMint, operator, false, this.tokenY.owner);
        const ownerTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, owner, false, this.tokenX.owner);
        const sendPositionOwnerTokenProveIxs = [];
        const initializeBinArraysAndPositionIxs = [];
        const addLiquidityIxs = [];
        const appendedInitBinArrayIx = new Set();
        if (shouldSeedPositionOwner) {
            const positionOwnerTokenX = await this.program.provider.connection.getAccountInfo(ownerTokenX);
            let requireTokenProve = false;
            if (positionOwnerTokenX) {
                const ownerTokenXState = (0, spl_token_1.unpackAccount)(ownerTokenX, positionOwnerTokenX, this.tokenX.owner);
                requireTokenProve = ownerTokenXState.amount == 0n;
            }
            else {
                requireTokenProve = true;
            }
            if (requireTokenProve) {
                const initPositionOwnerTokenX = (0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(payer, ownerTokenX, owner, this.lbPair.tokenXMint, this.tokenX.owner);
                const proveAmount = (0, token_2022_1.calculateTransferFeeIncludedAmount)(new anchor_1.BN(1), this.tokenX.mint, this.clock.epoch.toNumber()).amount;
                sendPositionOwnerTokenProveIxs.push(initPositionOwnerTokenX);
                const transferIx = (0, spl_token_1.createTransferCheckedInstruction)(seederTokenX, this.lbPair.tokenXMint, ownerTokenX, operator, BigInt(proveAmount.toString()), this.tokenX.mint.decimals, [], this.tokenX.owner);
                transferIx.keys.push(...this.tokenX.transferHookAccountMetas);
                sendPositionOwnerTokenProveIxs.push(transferIx);
            }
        }
        const slices = [
            {
                accountsType: {
                    transferHookX: {},
                },
                length: this.tokenX.transferHookAccountMetas.length,
            },
        ];
        const transferHookAccountMetas = this.tokenX.transferHookAccountMetas;
        for (let i = 0; i < positionCount.toNumber(); i++) {
            const lowerBinId = minBinId.add(constants_1.MAX_BIN_PER_POSITION.mul(new anchor_1.BN(i)));
            const upperBinId = lowerBinId.add(constants_1.MAX_BIN_PER_POSITION).sub(new anchor_1.BN(1));
            const binArrayAccountMetas = (0, positions_1.getBinArrayAccountMetasCoverage)(lowerBinId, upperBinId, this.pubkey, this.program.programId);
            const binArrayIndexes = (0, positions_1.getBinArrayIndexesCoverage)(lowerBinId, upperBinId);
            const [positionPda, _bump] = (0, helpers_1.derivePosition)(this.pubkey, base, lowerBinId, constants_1.MAX_BIN_PER_POSITION, this.program.programId);
            const accounts = await this.program.provider.connection.getMultipleAccountsInfo([
                ...binArrayAccountMetas.map((acc) => acc.pubkey),
                positionPda,
            ]);
            let instructions = [];
            const binArrayAccounts = accounts.splice(0, binArrayAccountMetas.length);
            for (let i = 0; i < binArrayAccountMetas.length; i++) {
                const account = binArrayAccounts[i];
                const pubkey = binArrayAccountMetas[i].pubkey.toBase58();
                const index = binArrayIndexes[i];
                if (!account && !appendedInitBinArrayIx.has(pubkey)) {
                    instructions.push(await this.program.methods
                        .initializeBinArray(index)
                        .accounts({
                        lbPair: this.pubkey,
                        binArray: pubkey,
                        funder: payer,
                    })
                        .instruction());
                }
            }
            const positionAccount = accounts.pop();
            if (!positionAccount) {
                instructions.push(await this.program.methods
                    .initializePositionByOperator(lowerBinId.toNumber(), constants_1.MAX_BIN_PER_POSITION.toNumber(), feeOwner, lockReleasePoint)
                    .accounts({
                    lbPair: this.pubkey,
                    position: positionPda,
                    base,
                    owner,
                    operator,
                    operatorTokenX: seederTokenX,
                    ownerTokenX,
                    systemProgram: web3_js_1.SystemProgram.programId,
                    payer,
                })
                    .instruction());
            }
            // Initialize bin arrays and initialize position account in 1 tx
            if (instructions.length > 1) {
                initializeBinArraysAndPositionIxs.push(instructions);
                instructions = [];
            }
            const positionDeposited = positionAccount &&
                this.program.coder.accounts
                    .decode(this.program.account.positionV2.idlAccount.name, positionAccount.data)
                    .liquidityShares.reduce((total, cur) => total.add(cur), new anchor_1.BN(0))
                    .gt(new anchor_1.BN(0));
            if (!positionDeposited) {
                const cappedUpperBinId = Math.min(upperBinId.toNumber(), maxBinId.toNumber() - 1);
                const bins = [];
                for (let i = lowerBinId.toNumber(); i <= cappedUpperBinId; i++) {
                    bins.push({
                        binId: i,
                        amount: compressedBinDepositAmount.get(i).toNumber(),
                    });
                }
                instructions.push(await this.program.methods
                    .addLiquidityOneSidePrecise2({
                    bins,
                    decompressMultiplier,
                    maxAmount: constants_1.U64_MAX,
                }, {
                    slices,
                })
                    .accounts({
                    position: positionPda,
                    lbPair: this.pubkey,
                    binArrayBitmapExtension: this.binArrayBitmapExtension
                        ? this.binArrayBitmapExtension.publicKey
                        : this.program.programId,
                    userToken: seederTokenX,
                    reserve: this.lbPair.reserveX,
                    tokenMint: this.lbPair.tokenXMint,
                    sender: operator,
                    tokenProgram: this.tokenX.owner,
                })
                    .remainingAccounts([
                    ...transferHookAccountMetas,
                    ...binArrayAccountMetas,
                ])
                    .instruction());
                // Last position
                if (i + 1 >= positionCount.toNumber() && !finalLoss.isZero()) {
                    const finalLossIncludesTransferFee = (0, token_2022_1.calculateTransferFeeIncludedAmount)(finalLoss, this.tokenX.mint, this.clock.epoch.toNumber()).amount;
                    instructions.push(await this.program.methods
                        .addLiquidity2({
                        amountX: finalLossIncludesTransferFee,
                        amountY: new anchor_1.BN(0),
                        binLiquidityDist: [
                            {
                                binId: cappedUpperBinId,
                                distributionX: constants_1.BASIS_POINT_MAX,
                                distributionY: constants_1.BASIS_POINT_MAX,
                            },
                        ],
                    }, {
                        slices,
                    })
                        .accounts({
                        position: positionPda,
                        lbPair: this.pubkey,
                        binArrayBitmapExtension: this.binArrayBitmapExtension
                            ? this.binArrayBitmapExtension.publicKey
                            : this.program.programId,
                        userTokenX: seederTokenX,
                        userTokenY: seederTokenY,
                        reserveX: this.lbPair.reserveX,
                        reserveY: this.lbPair.reserveY,
                        tokenXMint: this.lbPair.tokenXMint,
                        tokenYMint: this.lbPair.tokenYMint,
                        tokenXProgram: this.tokenX.owner,
                        tokenYProgram: this.tokenY.owner,
                        sender: operator,
                    })
                        .remainingAccounts([
                        ...transferHookAccountMetas,
                        ...(0, positions_1.getBinArrayAccountMetasCoverage)(new anchor_1.BN(cappedUpperBinId), new anchor_1.BN(cappedUpperBinId), this.pubkey, this.program.programId),
                    ])
                        .instruction());
                }
                addLiquidityIxs.push([
                    web3_js_1.ComputeBudgetProgram.setComputeUnitLimit({
                        units: computeUnit_1.DEFAULT_ADD_LIQUIDITY_CU,
                    }),
                    ...instructions,
                ]);
            }
        }
        return {
            sendPositionOwnerTokenProveIxs,
            initializeBinArraysAndPositionIxs,
            addLiquidityIxs,
        };
    }
    /**
     * The `seedLiquiditySingleBin` function seed liquidity into a single bin.
     * @param
     *    - `payer`: The public key of the tx payer.
     *    - `base`: Base key
     *    - `seedAmount`: Token X lamport amount to be seeded to the pool.
     *    - `price`: TokenX/TokenY Price in UI format
     *    - `roundingUp`: Whether to round up the price
     *    - `positionOwner`: The owner of the position
     *    - `feeOwner`: Position fee owner
     *    - `operator`: Operator of the position. Operator able to manage the position on behalf of the position owner. However, liquidity withdrawal issue by the operator can only send to the position owner.
     *    - `lockReleasePoint`: The lock release point of the position.
     *    - `shouldSeedPositionOwner` (optional): Whether to send 1 lamport amount of token X to the position owner to prove ownership.
     *
     * The returned instructions need to be executed sequentially if it was separated into multiple transactions.
     * @returns {Promise<TransactionInstruction[]>}
     */
    async seedLiquiditySingleBin(payer, base, seedAmount, price, roundingUp, positionOwner, feeOwner, operator, lockReleasePoint, shouldSeedPositionOwner = false) {
        const pricePerLamport = DLMM.getPricePerLamport(this.tokenX.mint.decimals, this.tokenY.mint.decimals, price);
        const binIdNumber = DLMM.getBinIdFromPrice(pricePerLamport, this.lbPair.binStep, !roundingUp);
        const binId = new anchor_1.BN(binIdNumber);
        const [positionPda] = (0, helpers_1.derivePosition)(this.pubkey, base, binId, new anchor_1.BN(1), this.program.programId);
        const binArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(binId);
        const [binArrayKey] = (0, helpers_1.deriveBinArray)(this.pubkey, binArrayIndex, this.program.programId);
        const preInstructions = [];
        const [{ ataPubKey: userTokenX, ix: createPayerTokenXIx }, { ataPubKey: userTokenY, ix: createPayerTokenYIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, operator, this.tokenX.owner, payer),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, operator, this.tokenY.owner, payer),
        ]);
        // create userTokenX and userTokenY accounts
        createPayerTokenXIx && preInstructions.push(createPayerTokenXIx);
        createPayerTokenYIx && preInstructions.push(createPayerTokenYIx);
        let [binArrayBitmapExtension] = (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId);
        const [binArrayAccount, positionAccount, bitmapExtensionAccount] = await this.program.provider.connection.getMultipleAccountsInfo([
            binArrayKey,
            positionPda,
            binArrayBitmapExtension,
        ]);
        if ((0, helpers_1.isOverflowDefaultBinArrayBitmap)(binArrayIndex)) {
            if (!bitmapExtensionAccount) {
                preInstructions.push(await this.program.methods
                    .initializeBinArrayBitmapExtension()
                    .accounts({
                    binArrayBitmapExtension,
                    funder: payer,
                    lbPair: this.pubkey,
                })
                    .instruction());
            }
        }
        else {
            binArrayBitmapExtension = this.program.programId;
        }
        const operatorTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, operator, true, this.tokenX.owner);
        const positionOwnerTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, positionOwner, true, this.tokenX.owner);
        if (shouldSeedPositionOwner) {
            const positionOwnerTokenXAccount = await this.program.provider.connection.getAccountInfo(positionOwnerTokenX);
            const proveAmount = (0, token_2022_1.calculateTransferFeeIncludedAmount)(new anchor_1.BN(1), this.tokenX.mint, this.clock.epoch.toNumber()).amount;
            if (positionOwnerTokenXAccount) {
                const account = (0, spl_token_1.unpackAccount)(positionOwnerTokenX, positionOwnerTokenXAccount, this.tokenX.owner);
                if (account.amount == BigInt(0)) {
                    // send 1 lamport to position owner token X to prove ownership
                    const transferIx = (0, spl_token_1.createTransferCheckedInstruction)(operatorTokenX, this.lbPair.tokenXMint, positionOwnerTokenX, operator, BigInt(proveAmount.toString()), this.tokenX.mint.decimals, [], this.tokenX.owner);
                    transferIx.keys.push(...this.tokenX.transferHookAccountMetas);
                    preInstructions.push(transferIx);
                }
            }
            else {
                const createPositionOwnerTokenXIx = (0, spl_token_1.createAssociatedTokenAccountIdempotentInstruction)(payer, positionOwnerTokenX, positionOwner, this.lbPair.tokenXMint, this.tokenX.owner);
                preInstructions.push(createPositionOwnerTokenXIx);
                // send 1 lamport to position owner token X to prove ownership
                const transferIx = (0, spl_token_1.createTransferCheckedInstruction)(operatorTokenX, this.lbPair.tokenXMint, positionOwnerTokenX, operator, BigInt(proveAmount.toString()), this.tokenX.mint.decimals, [], this.tokenX.owner);
                transferIx.keys.push(...this.tokenX.transferHookAccountMetas);
                preInstructions.push(transferIx);
            }
        }
        if (!binArrayAccount) {
            preInstructions.push(await this.program.methods
                .initializeBinArray(binArrayIndex)
                .accounts({
                binArray: binArrayKey,
                funder: payer,
                lbPair: this.pubkey,
            })
                .instruction());
        }
        if (!positionAccount) {
            preInstructions.push(await this.program.methods
                .initializePositionByOperator(binId.toNumber(), 1, feeOwner, lockReleasePoint)
                .accounts({
                payer,
                base,
                position: positionPda,
                lbPair: this.pubkey,
                owner: positionOwner,
                operator,
                operatorTokenX,
                ownerTokenX: positionOwnerTokenX,
            })
                .instruction());
        }
        const slices = [
            {
                accountsType: {
                    transferHookX: {},
                },
                length: this.tokenX.transferHookAccountMetas.length,
            },
        ];
        const transferHookAccountMetas = this.tokenX.transferHookAccountMetas;
        const binLiquidityDist = {
            binId: binIdNumber,
            distributionX: constants_1.BASIS_POINT_MAX,
            distributionY: constants_1.BASIS_POINT_MAX,
        };
        const seedAmountIncludeTransferFee = (0, token_2022_1.calculateTransferFeeIncludedAmount)(seedAmount, this.tokenX.mint, this.clock.epoch.toNumber()).amount;
        const addLiquidityParams = {
            amountX: seedAmountIncludeTransferFee,
            amountY: new anchor_1.BN(0),
            binLiquidityDist: [binLiquidityDist],
        };
        const depositLiquidityIx = await this.program.methods
            .addLiquidity2(addLiquidityParams, {
            slices,
        })
            .accounts({
            position: positionPda,
            lbPair: this.pubkey,
            binArrayBitmapExtension,
            userTokenX,
            userTokenY,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenXMint: this.lbPair.tokenXMint,
            tokenYMint: this.lbPair.tokenYMint,
            sender: operator,
            tokenXProgram: spl_token_1.TOKEN_PROGRAM_ID,
            tokenYProgram: spl_token_1.TOKEN_PROGRAM_ID,
        })
            .remainingAccounts([
            ...transferHookAccountMetas,
            {
                pubkey: binArrayKey,
                isSigner: false,
                isWritable: true,
            },
        ])
            .instruction();
        return [...preInstructions, depositLiquidityIx];
    }
    /**
     * Initializes bin arrays for the given bin array indexes if it wasn't initialized.
     *
     * @param {BN[]} binArrayIndexes - An array of bin array indexes to initialize.
     * @param {PublicKey} funder - The public key of the funder.
     * @return {Promise<TransactionInstruction[]>} An array of transaction instructions to initialize the bin arrays.
     */
    async initializeBinArrays(binArrayIndexes, funder) {
        const ixs = [];
        for (const idx of binArrayIndexes) {
            const [binArray] = (0, helpers_1.deriveBinArray)(this.pubkey, idx, this.program.programId);
            const binArrayAccount = await this.program.provider.connection.getAccountInfo(binArray);
            if (binArrayAccount === null) {
                const initBinArrayIx = await this.program.methods
                    .initializeBinArray(idx)
                    .accounts({
                    binArray,
                    funder,
                    lbPair: this.pubkey,
                })
                    .instruction();
                ixs.push(initBinArrayIx);
            }
        }
        if (ixs.length > 0) {
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, ixs, funder);
            ixs.unshift(setCUIx);
        }
        return ixs;
    }
    /**
     *
     * @param
     *    - `lowerBinId`: Lower bin ID of the position. This represent the lowest price of the position
     *    - `positionWidth`: Width of the position. This will decide the upper bin id of the position, which represents the highest price of the position. UpperBinId = lowerBinId + positionWidth
     *    - `owner`: Owner of the position.
     *    - `operator`: Operator of the position. Operator able to manage the position on behalf of the position owner. However, liquidity withdrawal issue by the operator can only send to the position owner.
     *    - `base`: Base key
     *    - `feeOwner`: Owner of the fees earned by the position.
     *    - `payer`: Payer for the position account rental.
     *    - `lockReleasePoint`: The lock release point of the position.
     * @returns
     */
    async initializePositionByOperator({ lowerBinId, positionWidth, owner, feeOwner, base, operator, payer, lockReleasePoint, }) {
        const [positionPda, _bump] = (0, helpers_1.derivePosition)(this.pubkey, base, lowerBinId, positionWidth, this.program.programId);
        const operatorTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, operator, true, this.tokenX.owner);
        const ownerTokenX = (0, spl_token_1.getAssociatedTokenAddressSync)(this.lbPair.tokenXMint, owner, true, this.tokenY.owner);
        const initializePositionByOperatorTx = await this.program.methods
            .initializePositionByOperator(lowerBinId.toNumber(), constants_1.MAX_BIN_PER_POSITION.toNumber(), feeOwner, lockReleasePoint)
            .accounts({
            lbPair: this.pubkey,
            position: positionPda,
            base,
            operator,
            owner,
            ownerTokenX,
            operatorTokenX,
            payer,
        })
            .transaction();
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return new web3_js_1.Transaction({
            feePayer: operator,
            blockhash,
            lastValidBlockHeight,
        }).add(initializePositionByOperatorTx);
    }
    /**
     * The `claimAllRewards` function to claim swap fees and LM rewards for multiple positions owned by a specific owner.
     * @param
     *    - `owner`: The public key of the owner of the positions.
     *    - `positions`: An array of objects of type `PositionData` that represents the positions to claim swap fees and LM rewards from.
     * @returns {Promise<Transaction[]>} Array of claim swap fee and LM reward transactions.
     */
    async claimAllRewards({ owner, positions, }) {
        // Filter only position with fees and/or rewards
        positions = positions.filter(({ positionData: { feeX, feeY, rewardOne, rewardTwo } }) => !feeX.isZero() ||
            !feeY.isZero() ||
            !rewardOne.isZero() ||
            !rewardTwo.isZero());
        const claimAllSwapFeeTxs = (await Promise.all(positions.map(async (position) => {
            return await this.createClaimSwapFeeMethod({
                owner,
                position,
            });
        }))).flat();
        const claimAllLMTxs = (await Promise.all(positions.map(async (position) => {
            return await this.createClaimBuildMethod({
                owner,
                position,
            });
        }))).flat();
        const chunkedClaimAllTx = (0, helpers_1.chunks)([...claimAllSwapFeeTxs, ...claimAllLMTxs], constants_1.MAX_CLAIM_ALL_ALLOWED);
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        return Promise.all(chunkedClaimAllTx.map(async (claimAllTx) => {
            const instructions = claimAllTx.map((t) => t.instructions).flat();
            const setCUIx = await (0, helpers_1.getEstimatedComputeUnitIxWithBuffer)(this.program.provider.connection, instructions, owner);
            const tx = new web3_js_1.Transaction({
                feePayer: owner,
                blockhash,
                lastValidBlockHeight,
            }).add(setCUIx, ...instructions);
            return tx;
        }));
    }
    canSyncWithMarketPrice(marketPrice, activeBinId) {
        const marketPriceBinId = this.getBinIdFromPrice(Number(DLMM.getPricePerLamport(this.tokenX.mint.decimals, this.tokenY.mint.decimals, marketPrice)), false);
        const marketPriceBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(marketPriceBinId));
        const swapForY = marketPriceBinId < activeBinId;
        const toBinArrayIndex = (0, helpers_1.findNextBinArrayIndexWithLiquidity)(swapForY, new anchor_1.BN(activeBinId), this.lbPair, this.binArrayBitmapExtension?.account ?? null);
        if (toBinArrayIndex === null)
            return true;
        return swapForY
            ? marketPriceBinArrayIndex.gt(toBinArrayIndex)
            : marketPriceBinArrayIndex.lt(toBinArrayIndex);
    }
    /**
     * The `syncWithMarketPrice` function is used to sync the liquidity pool with the market price.
     * @param
     *    - `marketPrice`: The market price to sync with.
     *    - `owner`: The public key of the owner of the liquidity pool.
     * @returns {Promise<Transaction>}
     */
    async syncWithMarketPrice(marketPrice, owner) {
        const marketPriceBinId = this.getBinIdFromPrice(Number(DLMM.getPricePerLamport(this.tokenX.mint.decimals, this.tokenY.mint.decimals, marketPrice)), false);
        const activeBin = await this.getActiveBin();
        const activeBinId = activeBin.binId;
        if (!this.canSyncWithMarketPrice(marketPrice, activeBinId)) {
            throw new Error("Unable to sync with market price due to bin with liquidity between current and market price bin");
        }
        const fromBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(activeBinId));
        const swapForY = marketPriceBinId < activeBinId;
        const toBinArrayIndex = (0, helpers_1.findNextBinArrayIndexWithLiquidity)(swapForY, new anchor_1.BN(activeBinId), this.lbPair, this.binArrayBitmapExtension?.account ?? null);
        const marketPriceBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(marketPriceBinId));
        const accountsToFetch = [];
        const binArrayBitMapExtensionPubkey = (0, helpers_1.isOverflowDefaultBinArrayBitmap)(new anchor_1.BN(marketPriceBinArrayIndex))
            ? (0, helpers_1.deriveBinArrayBitmapExtension)(this.pubkey, this.program.programId)[0]
            : null;
        binArrayBitMapExtensionPubkey &&
            accountsToFetch.push(binArrayBitMapExtensionPubkey);
        const [fromBinArrayPubkey] = (0, helpers_1.deriveBinArray)(this.pubkey, fromBinArrayIndex, this.program.programId);
        accountsToFetch.push(fromBinArrayPubkey);
        const toBinArrayPubkey = (() => {
            if (!toBinArrayIndex)
                return null;
            const [toBinArrayPubkey] = (0, helpers_1.deriveBinArray)(this.pubkey, toBinArrayIndex, this.program.programId);
            accountsToFetch.push(toBinArrayPubkey);
            return toBinArrayPubkey;
        })();
        const binArrayAccounts = await this.program.provider.connection.getMultipleAccountsInfo(accountsToFetch);
        const preInstructions = [];
        let fromBinArray = null;
        let toBinArray = null;
        let binArrayBitmapExtension = null;
        if (binArrayBitMapExtensionPubkey) {
            binArrayBitmapExtension = binArrayBitMapExtensionPubkey;
            if (!binArrayAccounts?.[0]) {
                const initializeBitmapExtensionIx = await this.program.methods
                    .initializeBinArrayBitmapExtension()
                    .accounts({
                    binArrayBitmapExtension: binArrayBitMapExtensionPubkey,
                    funder: owner,
                    lbPair: this.pubkey,
                })
                    .instruction();
                preInstructions.push(initializeBitmapExtensionIx);
            }
        }
        if (!!binArrayAccounts?.[1]) {
            fromBinArray = fromBinArrayPubkey;
        }
        if (!!binArrayAccounts?.[2] && !!toBinArrayIndex) {
            toBinArray = toBinArrayPubkey;
        }
        const { blockhash, lastValidBlockHeight } = await this.program.provider.connection.getLatestBlockhash("confirmed");
        const syncWithMarketPriceTx = await this.program.methods
            .goToABin(marketPriceBinId)
            .accounts({
            lbPair: this.pubkey,
            binArrayBitmapExtension,
            fromBinArray,
            toBinArray,
        })
            .preInstructions(preInstructions)
            .transaction();
        return new web3_js_1.Transaction({
            feePayer: owner,
            blockhash,
            lastValidBlockHeight,
        }).add(syncWithMarketPriceTx);
    }
    async getMaxPriceInBinArrays(binArrayAccounts) {
        // Don't mutate
        const sortedBinArrays = [...binArrayAccounts].sort(({ account: { index: indexA } }, { account: { index: indexB } }) => indexA.toNumber() - indexB.toNumber());
        let count = sortedBinArrays.length - 1;
        let binPriceWithLastLiquidity;
        while (count >= 0) {
            const binArray = sortedBinArrays[count];
            if (binArray) {
                const bins = binArray.account.bins;
                if (bins.every(({ amountX }) => amountX.isZero())) {
                    count--;
                }
                else {
                    const lastBinWithLiquidityIndex = bins.findLastIndex(({ amountX }) => !amountX.isZero());
                    binPriceWithLastLiquidity =
                        bins[lastBinWithLiquidityIndex].price.toString();
                    count = -1;
                }
            }
        }
        return this.fromPricePerLamport(Number(binPriceWithLastLiquidity) / (2 ** 64 - 1));
    }
    /**
     *
     * @param swapInitiator Address of the swap initiator
     * @returns
     */
    isSwapDisabled(swapInitiator) {
        if (this.lbPair.status == types_1.PairStatus.Disabled) {
            return true;
        }
        if (this.lbPair.pairType == types_1.PairType.Permissioned) {
            const currentPoint = this.lbPair.activationType == types_1.ActivationType.Slot
                ? this.clock.slot
                : this.clock.unixTimestamp;
            const preActivationSwapPoint = this.lbPair.activationPoint.sub(this.lbPair.preActivationDuration);
            const activationPoint = !this.lbPair.preActivationSwapAddress.equals(web3_js_1.PublicKey.default) &&
                this.lbPair.preActivationSwapAddress.equals(swapInitiator)
                ? preActivationSwapPoint
                : this.lbPair.activationPoint;
            if (currentPoint < activationPoint) {
                return true;
            }
        }
        return false;
    }
    /** Private static method */
    static async getBinArrays(program, lbPairPubkey) {
        return program.account.binArray.all([(0, accountFilters_1.binArrayLbPairFilter)(lbPairPubkey)]);
    }
    static async processPosition(program, lbPair, clock, position, baseMint, quoteMint, rewardMint0, rewardMint1, binArrayMap) {
        const lbPairKey = position.lbPair();
        const lowerBinId = position.lowerBinId();
        const upperBinId = position.upperBinId();
        const posShares = position.liquidityShares();
        const lastUpdatedAt = position.lastUpdatedAt();
        const feeInfos = position.feeInfos();
        const totalClaimedFeeXAmount = position.totalClaimedFeeXAmount();
        const totalClaimedFeeYAmount = position.totalClaimedFeeYAmount();
        const positionRewardInfos = position.rewardInfos();
        const feeOwner = position.feeOwner();
        const bins = this.getBinsBetweenLowerAndUpperBound(lbPairKey, lbPair, lowerBinId.toNumber(), upperBinId.toNumber(), baseMint.decimals, quoteMint.decimals, binArrayMap, program.programId);
        if (!bins.length)
            return null;
        const positionData = [];
        let totalXAmount = new decimal_js_1.default(0);
        let totalYAmount = new decimal_js_1.default(0);
        const ZERO = new anchor_1.BN(0);
        let feeX = ZERO;
        let feeY = ZERO;
        let rewards = [ZERO, ZERO];
        bins.forEach((bin, idx) => {
            const binSupply = bin.supply;
            const posShare = posShares[idx];
            const posBinRewardInfo = positionRewardInfos[idx];
            const positionXAmount = binSupply.eq(ZERO)
                ? ZERO
                : posShare.mul(bin.xAmount).div(binSupply);
            const positionYAmount = binSupply.eq(ZERO)
                ? ZERO
                : posShare.mul(bin.yAmount).div(binSupply);
            totalXAmount = totalXAmount.add(new decimal_js_1.default(positionXAmount.toString()));
            totalYAmount = totalYAmount.add(new decimal_js_1.default(positionYAmount.toString()));
            const feeInfo = feeInfos[idx];
            const newFeeX = (0, math_1.mulShr)(posShares[idx].shrn(constants_1.SCALE_OFFSET), bin.feeAmountXPerTokenStored.sub(feeInfo.feeXPerTokenComplete), constants_1.SCALE_OFFSET, math_1.Rounding.Down);
            const newFeeY = (0, math_1.mulShr)(posShares[idx].shrn(constants_1.SCALE_OFFSET), bin.feeAmountYPerTokenStored.sub(feeInfo.feeYPerTokenComplete), constants_1.SCALE_OFFSET, math_1.Rounding.Down);
            const claimableFeeX = newFeeX.add(feeInfo.feeXPending);
            const claimableFeeY = newFeeY.add(feeInfo.feeYPending);
            feeX = feeX.add(claimableFeeX);
            feeY = feeY.add(claimableFeeY);
            const claimableRewardsInBin = [new anchor_1.BN(0), new anchor_1.BN(0)];
            for (let j = 0; j < claimableRewardsInBin.length; j++) {
                const pairRewardInfo = lbPair.rewardInfos[j];
                if (!pairRewardInfo.mint.equals(web3_js_1.PublicKey.default)) {
                    let rewardPerTokenStored = bin.rewardPerTokenStored[j];
                    if (bin.binId == lbPair.activeId && !bin.supply.isZero()) {
                        const currentTime = new anchor_1.BN(Math.min(clock.unixTimestamp.toNumber(), pairRewardInfo.rewardDurationEnd.toNumber()));
                        const delta = currentTime.sub(pairRewardInfo.lastUpdateTime);
                        const liquiditySupply = bin.supply.shrn(constants_1.SCALE_OFFSET);
                        const rewardPerTokenStoredDelta = pairRewardInfo.rewardRate
                            .mul(delta)
                            .div(new anchor_1.BN(15))
                            .div(liquiditySupply);
                        rewardPerTokenStored = rewardPerTokenStored.add(rewardPerTokenStoredDelta);
                    }
                    const delta = rewardPerTokenStored.sub(posBinRewardInfo.rewardPerTokenCompletes[j]);
                    const newReward = (0, math_1.mulShr)(delta, posShares[idx].shrn(constants_1.SCALE_OFFSET), constants_1.SCALE_OFFSET, math_1.Rounding.Down);
                    const claimableReward = newReward.add(posBinRewardInfo.rewardPendings[j]);
                    claimableRewardsInBin[j] =
                        claimableRewardsInBin[j].add(claimableReward);
                    rewards[j] = rewards[j].add(claimableReward);
                }
            }
            positionData.push({
                binId: bin.binId,
                price: bin.price,
                pricePerToken: bin.pricePerToken,
                binXAmount: bin.xAmount.toString(),
                binYAmount: bin.yAmount.toString(),
                binLiquidity: binSupply.toString(),
                positionLiquidity: posShare.toString(),
                positionXAmount: positionXAmount.toString(),
                positionYAmount: positionYAmount.toString(),
                positionFeeXAmount: claimableFeeX.toString(),
                positionFeeYAmount: claimableFeeY.toString(),
                positionRewardAmount: claimableRewardsInBin.map((amount) => amount.toString()),
            });
        });
        const currentEpoch = clock.epoch.toNumber();
        const feeXExcludeTransferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(feeX, baseMint, currentEpoch).amount;
        const feeYExcludeTransferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(feeY, quoteMint, currentEpoch).amount;
        const rewardOne = rewards[0];
        const rewardTwo = rewards[1];
        let rewardOneExcludeTransferFee = new anchor_1.BN(0);
        let rewardTwoExcludeTransferFee = new anchor_1.BN(0);
        if (rewardMint0) {
            rewardOneExcludeTransferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(rewardOne, rewardMint0, currentEpoch).amount;
        }
        if (rewardMint1) {
            rewardTwoExcludeTransferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(rewardTwo, rewardMint1, currentEpoch).amount;
        }
        const totalXAmountExcludeTransferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(new anchor_1.BN(totalXAmount.floor().toString()), baseMint, currentEpoch).amount;
        const totalYAmountExcludeTransferFee = (0, token_2022_1.calculateTransferFeeExcludedAmount)(new anchor_1.BN(totalYAmount.floor().toString()), quoteMint, currentEpoch).amount;
        return {
            totalXAmount: totalXAmount.toString(),
            totalYAmount: totalYAmount.toString(),
            positionBinData: positionData,
            lastUpdatedAt,
            lowerBinId: lowerBinId.toNumber(),
            upperBinId: upperBinId.toNumber(),
            feeX,
            feeY,
            rewardOne,
            rewardTwo,
            feeOwner,
            totalClaimedFeeXAmount,
            totalClaimedFeeYAmount,
            totalXAmountExcludeTransferFee,
            totalYAmountExcludeTransferFee,
            rewardOneExcludeTransferFee,
            rewardTwoExcludeTransferFee,
            feeXExcludeTransferFee,
            feeYExcludeTransferFee,
            owner: position.owner(),
        };
    }
    static getBinsBetweenLowerAndUpperBound(lbPairKey, lbPair, lowerBinId, upperBinId, baseTokenDecimal, quoteTokenDecimal, binArrayMap, programId) {
        const lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
        const upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
        let bins = [];
        const ZERO = new anchor_1.BN(0);
        for (let binArrayIndex = lowerBinArrayIndex.toNumber(); binArrayIndex <= upperBinArrayIndex.toNumber(); binArrayIndex++) {
            const binArrayIndexBN = new anchor_1.BN(binArrayIndex);
            const binArrayKey = (0, helpers_1.deriveBinArray)(lbPairKey, binArrayIndexBN, programId)[0];
            const [lowerBinIdForBinArray] = (0, helpers_1.getBinArrayLowerUpperBinId)(binArrayIndexBN);
            const binArray = binArrayMap.get(binArrayKey.toBase58());
            for (let i = 0; i < constants_1.MAX_BIN_ARRAY_SIZE.toNumber(); i++) {
                const binId = lowerBinIdForBinArray.toNumber() + i;
                if (binId >= lowerBinId && binId <= upperBinId) {
                    const pricePerLamport = (0, helpers_1.getPriceOfBinByBinId)(binId, lbPair.binStep).toString();
                    if (!binArray) {
                        bins.push({
                            binId,
                            xAmount: ZERO,
                            yAmount: ZERO,
                            supply: ZERO,
                            feeAmountXPerTokenStored: ZERO,
                            feeAmountYPerTokenStored: ZERO,
                            rewardPerTokenStored: [ZERO, ZERO],
                            price: pricePerLamport,
                            version: binArray.version,
                            pricePerToken: new decimal_js_1.default(pricePerLamport)
                                .mul(new decimal_js_1.default(10 ** (baseTokenDecimal - quoteTokenDecimal)))
                                .toString(),
                        });
                    }
                    else {
                        const bin = binArray.bins[i];
                        bins.push({
                            binId,
                            xAmount: bin.amountX,
                            yAmount: bin.amountY,
                            supply: bin.liquiditySupply,
                            feeAmountXPerTokenStored: bin.feeAmountXPerTokenStored,
                            feeAmountYPerTokenStored: bin.feeAmountYPerTokenStored,
                            rewardPerTokenStored: bin.rewardPerTokenStored,
                            price: pricePerLamport,
                            version: binArray.version,
                            pricePerToken: new decimal_js_1.default(pricePerLamport)
                                .mul(new decimal_js_1.default(10 ** (baseTokenDecimal - quoteTokenDecimal)))
                                .toString(),
                        });
                    }
                }
            }
        }
        return bins;
    }
    /** Private method */
    processXYAmountDistribution(xYAmountDistribution) {
        let currentBinId = null;
        const xAmountDistribution = [];
        const yAmountDistribution = [];
        const binIds = [];
        xYAmountDistribution.forEach((binAndAmount) => {
            xAmountDistribution.push(binAndAmount.xAmountBpsOfTotal);
            yAmountDistribution.push(binAndAmount.yAmountBpsOfTotal);
            binIds.push(binAndAmount.binId);
            if (currentBinId && binAndAmount.binId !== currentBinId + 1) {
                throw new Error("Discontinuous Bin ID");
            }
            else {
                currentBinId = binAndAmount.binId;
            }
        });
        return {
            lowerBinId: xYAmountDistribution[0].binId,
            upperBinId: xYAmountDistribution[xYAmountDistribution.length - 1].binId,
            xAmountDistribution,
            yAmountDistribution,
            binIds,
        };
    }
    async getBins(lbPairPubKey, lowerBinId, upperBinId, baseTokenDecimal, quoteTokenDecimal, lowerBinArray, upperBinArray) {
        const lowerBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(lowerBinId));
        const upperBinArrayIndex = (0, helpers_1.binIdToBinArrayIndex)(new anchor_1.BN(upperBinId));
        const hasCachedLowerBinArray = lowerBinArray != null;
        const hasCachedUpperBinArray = upperBinArray != null;
        const isSingleBinArray = lowerBinArrayIndex.eq(upperBinArrayIndex);
        const lowerBinArrayIndexOffset = hasCachedLowerBinArray ? 1 : 0;
        const upperBinArrayIndexOffset = hasCachedUpperBinArray ? -1 : 0;
        const binArrayPubkeys = (0, helpers_1.range)(lowerBinArrayIndex.toNumber() + lowerBinArrayIndexOffset, upperBinArrayIndex.toNumber() + upperBinArrayIndexOffset, (i) => (0, helpers_1.deriveBinArray)(lbPairPubKey, new anchor_1.BN(i), this.program.programId)[0]);
        const fetchedBinArrays = binArrayPubkeys.length !== 0
            ? await this.program.account.binArray.fetchMultiple(binArrayPubkeys)
            : [];
        const binArrays = [
            ...(hasCachedLowerBinArray ? [lowerBinArray] : []),
            ...fetchedBinArrays,
            ...(hasCachedUpperBinArray && !isSingleBinArray ? [upperBinArray] : []),
        ];
        const binsById = new Map(binArrays
            .filter((x) => x != null)
            .flatMap(({ bins, index }) => {
            const [lowerBinId] = (0, helpers_1.getBinArrayLowerUpperBinId)(index);
            return bins.map((b, i) => [lowerBinId.toNumber() + i, b]);
        }));
        const version = binArrays.find((binArray) => binArray != null)?.version ?? 1;
        return Array.from((0, helpers_1.enumerateBins)(binsById, lowerBinId, upperBinId, this.lbPair.binStep, baseTokenDecimal, quoteTokenDecimal, version));
    }
    async binArraysToBeCreate(lowerBinArrayIndex, upperBinArrayIndex) {
        const binArrayIndexes = Array.from({ length: upperBinArrayIndex.sub(lowerBinArrayIndex).toNumber() + 1 }, (_, index) => index + lowerBinArrayIndex.toNumber()).map((idx) => new anchor_1.BN(idx));
        const binArrays = [];
        for (const idx of binArrayIndexes) {
            const [binArrayPubKey] = (0, helpers_1.deriveBinArray)(this.pubkey, idx, this.program.programId);
            binArrays.push(binArrayPubKey);
        }
        const binArrayAccounts = await this.program.provider.connection.getMultipleAccountsInfo(binArrays);
        return binArrayAccounts
            .filter((binArray) => binArray === null)
            .map((_, index) => binArrays[index]);
    }
    async createBinArraysIfNeeded(binArrayIndexes, funder) {
        const ixs = [];
        for (const idx of binArrayIndexes) {
            const [binArrayKey] = (0, helpers_1.deriveBinArray)(this.pubkey, idx, this.program.programId);
            const binArrayAccount = await this.program.provider.connection.getAccountInfo(binArrayKey);
            if (binArrayAccount === null) {
                ixs.push(await this.program.methods
                    .initializeBinArray(idx)
                    .accounts({
                    binArray: binArrayKey,
                    funder,
                    lbPair: this.pubkey,
                })
                    .instruction());
            }
        }
        return ixs;
    }
    updateVolatilityAccumulator(vParameter, sParameter, activeId) {
        const deltaId = Math.abs(vParameter.indexReference - activeId);
        const newVolatilityAccumulator = vParameter.volatilityReference + deltaId * constants_1.BASIS_POINT_MAX;
        vParameter.volatilityAccumulator = Math.min(newVolatilityAccumulator, sParameter.maxVolatilityAccumulator);
    }
    updateReference(activeId, vParameter, sParameter, currentTimestamp) {
        const elapsed = currentTimestamp - vParameter.lastUpdateTimestamp.toNumber();
        if (elapsed >= sParameter.filterPeriod) {
            vParameter.indexReference = activeId;
            if (elapsed < sParameter.decayPeriod) {
                const decayedVolatilityReference = Math.floor((vParameter.volatilityAccumulator * sParameter.reductionFactor) /
                    constants_1.BASIS_POINT_MAX);
                vParameter.volatilityReference = decayedVolatilityReference;
            }
            else {
                vParameter.volatilityReference = 0;
            }
        }
    }
    async createClaimBuildMethod({ owner, position, }) {
        // Avoid to attempt to load uninitialized bin array on the program
        const maybeClaimableBinRange = (0, positions_1.getPositionLowerUpperBinIdWithLiquidity)(position.positionData);
        if (!maybeClaimableBinRange)
            return;
        const { lowerBinId, upperBinId } = maybeClaimableBinRange;
        const binArrayAccountsMeta = (0, positions_1.getBinArrayAccountMetasCoverage)(lowerBinId, upperBinId, this.pubkey, this.program.programId);
        const claimTransactions = [];
        for (let i = 0; i < 2; i++) {
            const rewardInfo = this.lbPair.rewardInfos[i];
            if (!rewardInfo || rewardInfo.mint.equals(web3_js_1.PublicKey.default))
                continue;
            const preInstructions = [];
            const { ataPubKey, ix } = await (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, rewardInfo.mint, owner, this.rewards[i].owner);
            ix && preInstructions.push(ix);
            const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Reward, i);
            const claimTransaction = await this.program.methods
                .claimReward2(new anchor_1.BN(i), lowerBinId.toNumber(), upperBinId.toNumber(), {
                slices,
            })
                .accounts({
                lbPair: this.pubkey,
                sender: owner,
                position: position.publicKey,
                rewardVault: rewardInfo.vault,
                rewardMint: rewardInfo.mint,
                tokenProgram: this.rewards[i].owner,
                userTokenAccount: ataPubKey,
                memoProgram: types_1.MEMO_PROGRAM_ID,
            })
                .remainingAccounts(transferHookAccounts)
                .remainingAccounts(binArrayAccountsMeta)
                .preInstructions(preInstructions)
                .transaction();
            claimTransactions.push(claimTransaction);
        }
        return claimTransactions;
    }
    async createClaimSwapFeeMethod({ owner, position, }) {
        // Avoid to attempt to load uninitialized bin array on the program
        const maybeClaimableBinRange = (0, positions_1.getPositionLowerUpperBinIdWithLiquidity)(position.positionData);
        if (!maybeClaimableBinRange)
            return;
        const { lowerBinId, upperBinId } = maybeClaimableBinRange;
        const binArrayAccountsMeta = (0, positions_1.getBinArrayAccountMetasCoverage)(lowerBinId, upperBinId, this.pubkey, this.program.programId);
        const { feeOwner } = position.positionData;
        const walletToReceiveFee = feeOwner.equals(web3_js_1.PublicKey.default)
            ? owner
            : feeOwner;
        const preInstructions = [];
        const [{ ataPubKey: userTokenX, ix: createInTokenAccountIx }, { ataPubKey: userTokenY, ix: createOutTokenAccountIx },] = await Promise.all([
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenX.publicKey, walletToReceiveFee, this.tokenX.owner, owner),
            (0, helpers_1.getOrCreateATAInstruction)(this.program.provider.connection, this.tokenY.publicKey, walletToReceiveFee, this.tokenY.owner, owner),
        ]);
        createInTokenAccountIx && preInstructions.push(createInTokenAccountIx);
        createOutTokenAccountIx && preInstructions.push(createOutTokenAccountIx);
        const postInstructions = [];
        if ([
            this.tokenX.publicKey.toBase58(),
            this.tokenY.publicKey.toBase58(),
        ].includes(spl_token_1.NATIVE_MINT.toBase58())) {
            const closeWrappedSOLIx = await (0, helpers_1.unwrapSOLInstruction)(owner);
            closeWrappedSOLIx && postInstructions.push(closeWrappedSOLIx);
        }
        const { slices, accounts: transferHookAccounts } = this.getPotentialToken2022IxDataAndAccounts(types_1.ActionType.Liquidity);
        const claimFeeTx = await this.program.methods
            .claimFee2(lowerBinId.toNumber(), upperBinId.toNumber(), {
            slices,
        })
            .accounts({
            lbPair: this.pubkey,
            sender: owner,
            position: position.publicKey,
            reserveX: this.lbPair.reserveX,
            reserveY: this.lbPair.reserveY,
            tokenProgramX: this.tokenX.owner,
            tokenProgramY: this.tokenY.owner,
            tokenXMint: this.tokenX.publicKey,
            tokenYMint: this.tokenY.publicKey,
            userTokenX,
            userTokenY,
            memoProgram: types_1.MEMO_PROGRAM_ID,
        })
            .remainingAccounts(transferHookAccounts)
            .remainingAccounts(binArrayAccountsMeta)
            .preInstructions(preInstructions)
            .postInstructions(postInstructions)
            .transaction();
        return claimFeeTx;
    }
    getPotentialToken2022IxDataAndAccounts(actionType, rewardIndex) {
        if (actionType == types_1.ActionType.Liquidity) {
            return {
                slices: [
                    {
                        accountsType: {
                            transferHookX: {},
                        },
                        length: this.tokenX.transferHookAccountMetas.length,
                    },
                    {
                        accountsType: {
                            transferHookY: {},
                        },
                        length: this.tokenY.transferHookAccountMetas.length,
                    },
                ],
                accounts: this.tokenX.transferHookAccountMetas.concat(this.tokenY.transferHookAccountMetas),
            };
        }
        return {
            slices: [
                {
                    accountsType: {
                        transferHookReward: {},
                    },
                    length: this.rewards[rewardIndex].transferHookAccountMetas.length,
                },
            ],
            accounts: this.rewards[rewardIndex].transferHookAccountMetas,
        };
    }
}
exports.DLMM = DLMM;
