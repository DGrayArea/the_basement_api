"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MEMO_PROGRAM_ID = exports.ActionType = exports.PairStatus = exports.ClockLayout = exports.BitmapType = exports.BinLiquidity = exports.ActivationType = exports.StrategyType = exports.Strategy = exports.PairType = exports.PositionVersion = exports.POSITION_V2_DISC = void 0;
const anchor_1 = require("@coral-xyz/anchor");
const helpers_1 = require("../helpers");
const web3_js_1 = require("@solana/web3.js");
const decimal_js_1 = __importDefault(require("decimal.js"));
const borsh_1 = require("@coral-xyz/borsh");
exports.POSITION_V2_DISC = anchor_1.BorshAccountsCoder.accountDiscriminator("positionV2");
var PositionVersion;
(function (PositionVersion) {
    PositionVersion[PositionVersion["V1"] = 0] = "V1";
    PositionVersion[PositionVersion["V2"] = 1] = "V2";
    PositionVersion[PositionVersion["V3"] = 2] = "V3";
})(PositionVersion || (exports.PositionVersion = PositionVersion = {}));
var PairType;
(function (PairType) {
    PairType[PairType["Permissionless"] = 0] = "Permissionless";
    PairType[PairType["Permissioned"] = 1] = "Permissioned";
})(PairType || (exports.PairType = PairType = {}));
exports.Strategy = {
    SpotBalanced: { spotBalanced: {} },
    CurveBalanced: { curveBalanced: {} },
    BidAskBalanced: { bidAskBalanced: {} },
    SpotImBalanced: { spotImBalanced: {} },
    CurveImBalanced: { curveImBalanced: {} },
    BidAskImBalanced: { bidAskImBalanced: {} },
};
var StrategyType;
(function (StrategyType) {
    StrategyType[StrategyType["Spot"] = 0] = "Spot";
    StrategyType[StrategyType["Curve"] = 1] = "Curve";
    StrategyType[StrategyType["BidAsk"] = 2] = "BidAsk";
})(StrategyType || (exports.StrategyType = StrategyType = {}));
var ActivationType;
(function (ActivationType) {
    ActivationType[ActivationType["Slot"] = 0] = "Slot";
    ActivationType[ActivationType["Timestamp"] = 1] = "Timestamp";
})(ActivationType || (exports.ActivationType = ActivationType = {}));
var BinLiquidity;
(function (BinLiquidity) {
    function fromBin(bin, binId, binStep, baseTokenDecimal, quoteTokenDecimal, version) {
        const pricePerLamport = (0, helpers_1.getPriceOfBinByBinId)(binId, binStep).toString();
        return {
            binId,
            xAmount: bin.amountX,
            yAmount: bin.amountY,
            supply: bin.liquiditySupply,
            price: pricePerLamport,
            version,
            pricePerToken: new decimal_js_1.default(pricePerLamport)
                .mul(new decimal_js_1.default(10 ** (baseTokenDecimal - quoteTokenDecimal)))
                .toString(),
            feeAmountXPerTokenStored: bin.feeAmountXPerTokenStored,
            feeAmountYPerTokenStored: bin.feeAmountYPerTokenStored,
            rewardPerTokenStored: bin.rewardPerTokenStored,
        };
    }
    BinLiquidity.fromBin = fromBin;
    function empty(binId, binStep, baseTokenDecimal, quoteTokenDecimal, version) {
        const pricePerLamport = (0, helpers_1.getPriceOfBinByBinId)(binId, binStep).toString();
        return {
            binId,
            xAmount: new anchor_1.BN(0),
            yAmount: new anchor_1.BN(0),
            supply: new anchor_1.BN(0),
            price: pricePerLamport,
            version,
            pricePerToken: new decimal_js_1.default(pricePerLamport)
                .mul(new decimal_js_1.default(10 ** (baseTokenDecimal - quoteTokenDecimal)))
                .toString(),
            feeAmountXPerTokenStored: new anchor_1.BN(0),
            feeAmountYPerTokenStored: new anchor_1.BN(0),
            rewardPerTokenStored: [new anchor_1.BN(0), new anchor_1.BN(0)],
        };
    }
    BinLiquidity.empty = empty;
})(BinLiquidity || (exports.BinLiquidity = BinLiquidity = {}));
var BitmapType;
(function (BitmapType) {
    BitmapType[BitmapType["U1024"] = 0] = "U1024";
    BitmapType[BitmapType["U512"] = 1] = "U512";
})(BitmapType || (exports.BitmapType = BitmapType = {}));
exports.ClockLayout = (0, borsh_1.struct)([
    (0, borsh_1.u64)("slot"),
    (0, borsh_1.i64)("epochStartTimestamp"),
    (0, borsh_1.u64)("epoch"),
    (0, borsh_1.u64)("leaderScheduleEpoch"),
    (0, borsh_1.i64)("unixTimestamp"),
]);
var PairStatus;
(function (PairStatus) {
    PairStatus[PairStatus["Enabled"] = 0] = "Enabled";
    PairStatus[PairStatus["Disabled"] = 1] = "Disabled";
})(PairStatus || (exports.PairStatus = PairStatus = {}));
var ActionType;
(function (ActionType) {
    ActionType[ActionType["Liquidity"] = 0] = "Liquidity";
    ActionType[ActionType["Reward"] = 1] = "Reward";
})(ActionType || (exports.ActionType = ActionType = {}));
exports.MEMO_PROGRAM_ID = new web3_js_1.PublicKey("MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr");
