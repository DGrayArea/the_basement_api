"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PositionV2Wrapper = void 0;
exports.wrapPosition = wrapPosition;
const bn_js_1 = __importDefault(require("bn.js"));
const types_1 = require("../../types");
const binArray_1 = require("../binArray");
const derive_1 = require("../derive");
function wrapPosition(program, key, account) {
    const disc = account.data.subarray(0, 8);
    if (disc.equals(types_1.POSITION_V2_DISC)) {
        const state = program.coder.accounts.decode(program.account.positionV2.idlAccount.name, account.data);
        return new PositionV2Wrapper(key, state);
    }
    else {
        throw new Error("Unknown position account");
    }
}
class PositionV2Wrapper {
    positionAddress;
    inner;
    constructor(positionAddress, inner) {
        this.positionAddress = positionAddress;
        this.inner = inner;
    }
    address() {
        return this.positionAddress;
    }
    totalClaimedRewards() {
        return this.inner.totalClaimedRewards;
    }
    feeOwner() {
        return this.inner.feeOwner;
    }
    lockReleasePoint() {
        return this.inner.lockReleasePoint;
    }
    operator() {
        return this.inner.operator;
    }
    totalClaimedFeeYAmount() {
        return this.inner.totalClaimedFeeYAmount;
    }
    totalClaimedFeeXAmount() {
        return this.inner.totalClaimedFeeXAmount;
    }
    lbPair() {
        return this.inner.lbPair;
    }
    lowerBinId() {
        return new bn_js_1.default(this.inner.lowerBinId);
    }
    upperBinId() {
        return new bn_js_1.default(this.inner.upperBinId);
    }
    liquidityShares() {
        return this.inner.liquidityShares;
    }
    rewardInfos() {
        return this.inner.rewardInfos;
    }
    feeInfos() {
        return this.inner.feeInfos;
    }
    lastUpdatedAt() {
        return this.inner.lastUpdatedAt;
    }
    getBinArrayIndexesCoverage() {
        const lowerBinArrayIndex = (0, binArray_1.binIdToBinArrayIndex)(this.lowerBinId());
        const upperBinArrayIndex = lowerBinArrayIndex.add(new bn_js_1.default(1));
        return [lowerBinArrayIndex, upperBinArrayIndex];
    }
    getBinArrayKeysCoverage(programId) {
        return this.getBinArrayIndexesCoverage().map((index) => (0, derive_1.deriveBinArray)(this.lbPair(), index, programId)[0]);
    }
    version() {
        return types_1.PositionVersion.V2;
    }
    owner() {
        return this.inner.owner;
    }
}
exports.PositionV2Wrapper = PositionV2Wrapper;
