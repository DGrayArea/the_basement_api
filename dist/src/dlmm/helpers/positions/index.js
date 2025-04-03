"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBinArrayIndexesCoverage = getBinArrayIndexesCoverage;
exports.getBinArrayKeysCoverage = getBinArrayKeysCoverage;
exports.getBinArrayAccountMetasCoverage = getBinArrayAccountMetasCoverage;
exports.getPositionLowerUpperBinIdWithLiquidity = getPositionLowerUpperBinIdWithLiquidity;
const bn_js_1 = __importDefault(require("bn.js"));
const binArray_1 = require("../binArray");
const derive_1 = require("../derive");
__exportStar(require("./wrapper"), exports);
function getBinArrayIndexesCoverage(lowerBinId, upperBinId) {
    const lowerBinArrayIndex = (0, binArray_1.binIdToBinArrayIndex)(lowerBinId);
    const upperBinArrayIndex = (0, binArray_1.binIdToBinArrayIndex)(upperBinId);
    const binArrayIndexes = [];
    for (let i = lowerBinArrayIndex.toNumber(); i <= upperBinArrayIndex.toNumber(); i++) {
        binArrayIndexes.push(new bn_js_1.default(i));
    }
    return binArrayIndexes;
}
function getBinArrayKeysCoverage(lowerBinId, upperBinId, lbPair, programId) {
    const binArrayIndexes = getBinArrayIndexesCoverage(lowerBinId, upperBinId);
    return binArrayIndexes.map((index) => {
        return (0, derive_1.deriveBinArray)(lbPair, index, programId)[0];
    });
}
function getBinArrayAccountMetasCoverage(lowerBinId, upperBinId, lbPair, programId) {
    return getBinArrayKeysCoverage(lowerBinId, upperBinId, lbPair, programId).map((key) => {
        return {
            pubkey: key,
            isSigner: false,
            isWritable: true,
        };
    });
}
function getPositionLowerUpperBinIdWithLiquidity(position) {
    const binWithLiquidity = position.positionBinData.filter((b) => !new bn_js_1.default(b.binLiquidity).isZero());
    return binWithLiquidity.length > 0
        ? {
            lowerBinId: new bn_js_1.default(binWithLiquidity[0].binId),
            upperBinId: new bn_js_1.default(binWithLiquidity[binWithLiquidity.length - 1].binId),
        }
        : null;
}
