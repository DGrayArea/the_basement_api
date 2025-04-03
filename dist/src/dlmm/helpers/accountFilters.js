"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.positionLbPairFilter = exports.positionOwnerFilter = exports.binArrayLbPairFilter = exports.presetParameter2BaseFeePowerFactor = exports.presetParameter2BaseFactorFilter = exports.presetParameter2BinStepFilter = void 0;
const bytes_1 = require("@coral-xyz/anchor/dist/cjs/utils/bytes");
const presetParameter2BinStepFilter = (binStep) => {
    return {
        memcmp: {
            bytes: bytes_1.bs58.encode(binStep.toArrayLike(Buffer, "le", 2)),
            offset: 8,
        },
    };
};
exports.presetParameter2BinStepFilter = presetParameter2BinStepFilter;
const presetParameter2BaseFactorFilter = (baseFactor) => {
    return {
        memcmp: {
            bytes: bytes_1.bs58.encode(baseFactor.toArrayLike(Buffer, "le", 2)),
            offset: 8 + 2,
        },
    };
};
exports.presetParameter2BaseFactorFilter = presetParameter2BaseFactorFilter;
const presetParameter2BaseFeePowerFactor = (baseFeePowerFactor) => {
    return {
        memcmp: {
            bytes: bytes_1.bs58.encode(baseFeePowerFactor.toArrayLike(Buffer, "le", 1)),
            offset: 8 + 22,
        },
    };
};
exports.presetParameter2BaseFeePowerFactor = presetParameter2BaseFeePowerFactor;
const binArrayLbPairFilter = (lbPair) => {
    return {
        memcmp: {
            bytes: lbPair.toBase58(),
            offset: 8 + 16,
        },
    };
};
exports.binArrayLbPairFilter = binArrayLbPairFilter;
const positionOwnerFilter = (owner) => {
    return {
        memcmp: {
            bytes: owner.toBase58(),
            offset: 8 + 32,
        },
    };
};
exports.positionOwnerFilter = positionOwnerFilter;
const positionLbPairFilter = (lbPair) => {
    return {
        memcmp: {
            bytes: bytes_1.bs58.encode(lbPair.toBuffer()),
            offset: 8,
        },
    };
};
exports.positionLbPairFilter = positionLbPairFilter;
