"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAmountsBothSideByStrategy = toAmountsBothSideByStrategy;
exports.autoFillYByStrategy = autoFillYByStrategy;
exports.autoFillXByStrategy = autoFillXByStrategy;
exports.toStrategyParameters = toStrategyParameters;
const anchor_1 = require("@coral-xyz/anchor");
const types_1 = require("../types");
const weightToAmounts_1 = require("./weightToAmounts");
const DEFAULT_MAX_WEIGHT = 2000;
const DEFAULT_MIN_WEIGHT = 200;
function toWeightSpotBalanced(minBinId, maxBinId) {
    let distributions = [];
    for (let i = minBinId; i <= maxBinId; i++) {
        distributions.push({
            binId: i,
            weight: 1,
        });
    }
    return distributions;
}
function toWeightDecendingOrder(minBinId, maxBinId) {
    let distributions = [];
    for (let i = minBinId; i <= maxBinId; i++) {
        distributions.push({
            binId: i,
            weight: maxBinId - i + 1,
        });
    }
    return distributions;
}
function toWeightAscendingOrder(minBinId, maxBinId) {
    let distributions = [];
    for (let i = minBinId; i <= maxBinId; i++) {
        distributions.push({
            binId: i,
            weight: i - minBinId + 1,
        });
    }
    return distributions;
}
function toWeightCurve(minBinId, maxBinId, activeId) {
    if (activeId < minBinId || activeId > maxBinId) {
        throw "Invalid strategy params";
    }
    let maxWeight = DEFAULT_MAX_WEIGHT;
    let minWeight = DEFAULT_MIN_WEIGHT;
    let diffWeight = maxWeight - minWeight;
    let diffMinWeight = activeId > minBinId ? Math.floor(diffWeight / (activeId - minBinId)) : 0;
    let diffMaxWeight = maxBinId > activeId ? Math.floor(diffWeight / (maxBinId - activeId)) : 0;
    let distributions = [];
    for (let i = minBinId; i <= maxBinId; i++) {
        if (i < activeId) {
            distributions.push({
                binId: i,
                weight: maxWeight - (activeId - i) * diffMinWeight,
            });
        }
        else if (i > activeId) {
            distributions.push({
                binId: i,
                weight: maxWeight - (i - activeId) * diffMaxWeight,
            });
        }
        else {
            distributions.push({
                binId: i,
                weight: maxWeight,
            });
        }
    }
    return distributions;
}
function toWeightBidAsk(minBinId, maxBinId, activeId) {
    if (activeId < minBinId || activeId > maxBinId) {
        throw "Invalid strategy params";
    }
    let maxWeight = DEFAULT_MAX_WEIGHT;
    let minWeight = DEFAULT_MIN_WEIGHT;
    let diffWeight = maxWeight - minWeight;
    let diffMinWeight = activeId > minBinId ? Math.floor(diffWeight / (activeId - minBinId)) : 0;
    let diffMaxWeight = maxBinId > activeId ? Math.floor(diffWeight / (maxBinId - activeId)) : 0;
    let distributions = [];
    for (let i = minBinId; i <= maxBinId; i++) {
        if (i < activeId) {
            distributions.push({
                binId: i,
                weight: minWeight + (activeId - i) * diffMinWeight,
            });
        }
        else if (i > activeId) {
            distributions.push({
                binId: i,
                weight: minWeight + (i - activeId) * diffMaxWeight,
            });
        }
        else {
            distributions.push({
                binId: i,
                weight: minWeight,
            });
        }
    }
    return distributions;
}
/**
 * Given a strategy type and amounts of X and Y, returns the distribution of liquidity.
 * @param activeId The bin id of the active bin.
 * @param binStep The step size of each bin.
 * @param minBinId The min bin id.
 * @param maxBinId The max bin id.
 * @param amountX The amount of X token to deposit.
 * @param amountY The amount of Y token to deposit.
 * @param amountXInActiveBin The amount of X token in the active bin.
 * @param amountYInActiveBin The amount of Y token in the active bin.
 * @param strategyType The strategy type.
 * @param mintX The mint info of X token. Get from DLMM instance.
 * @param mintY The mint info of Y token. Get from DLMM instance.
 * @param clock The clock info. Get from DLMM instance.
 * @returns The distribution of liquidity.
 */
function toAmountsBothSideByStrategy(activeId, binStep, minBinId, maxBinId, amountX, amountY, amountXInActiveBin, amountYInActiveBin, strategyType, mintX, mintY, clock) {
    const isSingleSideX = amountY.isZero();
    switch (strategyType) {
        case types_1.StrategyType.Spot: {
            if (activeId < minBinId || activeId > maxBinId) {
                const weights = toWeightSpotBalanced(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
            }
            const amountsInBin = [];
            if (!isSingleSideX) {
                if (minBinId <= activeId) {
                    const weights = toWeightSpotBalanced(minBinId, activeId);
                    const amounts = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights, mintY, clock);
                    for (let bin of amounts) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId < maxBinId) {
                    const weights = toWeightSpotBalanced(activeId + 1, maxBinId);
                    const amounts = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights, mintX, clock);
                    for (let bin of amounts) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            else {
                if (minBinId < activeId) {
                    const weights = toWeightSpotBalanced(minBinId, activeId - 1);
                    const amountsIntoBidSide = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights, mintY, clock);
                    for (let bin of amountsIntoBidSide) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId <= maxBinId) {
                    const weights = toWeightSpotBalanced(activeId, maxBinId);
                    const amountsIntoAskSide = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights, mintX, clock);
                    for (let bin of amountsIntoAskSide) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            return amountsInBin;
        }
        case types_1.StrategyType.Curve: {
            // ask side
            if (activeId < minBinId) {
                let weights = toWeightDecendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
            }
            // bid side
            if (activeId > maxBinId) {
                const weights = toWeightAscendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
            }
            const amountsInBin = [];
            if (!isSingleSideX) {
                if (minBinId <= activeId) {
                    const weights = toWeightAscendingOrder(minBinId, activeId);
                    const amounts = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights, mintY, clock);
                    for (let bin of amounts) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId < maxBinId) {
                    const weights = toWeightDecendingOrder(activeId + 1, maxBinId);
                    const amounts = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights, mintX, clock);
                    for (let bin of amounts) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            else {
                if (minBinId < activeId) {
                    const weights = toWeightAscendingOrder(minBinId, activeId - 1);
                    const amountsIntoBidSide = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights, mintY, clock);
                    for (let bin of amountsIntoBidSide) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId <= maxBinId) {
                    const weights = toWeightDecendingOrder(activeId, maxBinId);
                    const amountsIntoAskSide = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights, mintX, clock);
                    for (let bin of amountsIntoAskSide) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            return amountsInBin;
        }
        case types_1.StrategyType.BidAsk: {
            // ask side
            if (activeId < minBinId) {
                const weights = toWeightAscendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
            }
            // bid side
            if (activeId > maxBinId) {
                const weights = toWeightDecendingOrder(minBinId, maxBinId);
                return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
            }
            const amountsInBin = [];
            if (!isSingleSideX) {
                if (minBinId <= activeId) {
                    const weights = toWeightDecendingOrder(minBinId, activeId);
                    const amounts = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights, mintY, clock);
                    for (let bin of amounts) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId < maxBinId) {
                    const weights = toWeightAscendingOrder(activeId + 1, maxBinId);
                    const amounts = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights, mintX, clock);
                    for (let bin of amounts) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            else {
                if (minBinId < activeId) {
                    const weights = toWeightDecendingOrder(minBinId, activeId - 1);
                    const amountsIntoBidSide = (0, weightToAmounts_1.toAmountBidSide)(activeId, amountY, weights, mintY, clock);
                    for (let bin of amountsIntoBidSide) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: new anchor_1.BN(0),
                            amountY: bin.amount,
                        });
                    }
                }
                if (activeId <= maxBinId) {
                    const weights = toWeightAscendingOrder(activeId, maxBinId);
                    const amountsIntoAskSide = (0, weightToAmounts_1.toAmountAskSide)(activeId, binStep, amountX, weights, mintX, clock);
                    for (let bin of amountsIntoAskSide) {
                        amountsInBin.push({
                            binId: bin.binId,
                            amountX: bin.amount,
                            amountY: new anchor_1.BN(0),
                        });
                    }
                }
            }
            return amountsInBin;
        }
        case types_1.StrategyType.Spot: {
            let weights = toWeightSpotBalanced(minBinId, maxBinId);
            return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
        }
        case types_1.StrategyType.Curve: {
            let weights = toWeightCurve(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
        }
        case types_1.StrategyType.BidAsk: {
            let weights = toWeightBidAsk(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.toAmountBothSide)(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, weights, mintX, mintY, clock);
        }
    }
}
// only apply for
function autoFillYByStrategy(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, minBinId, maxBinId, strategyType) {
    switch (strategyType) {
        case types_1.StrategyType.Spot: {
            let weights = toWeightSpotBalanced(minBinId, maxBinId);
            return (0, weightToAmounts_1.autoFillYByWeight)(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.Curve: {
            let weights = toWeightCurve(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillYByWeight)(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.BidAsk: {
            let weights = toWeightBidAsk(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillYByWeight)(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, weights);
        }
    }
}
// only apply for balanced deposit
function autoFillXByStrategy(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, minBinId, maxBinId, strategyType) {
    switch (strategyType) {
        case types_1.StrategyType.Spot: {
            let weights = toWeightSpotBalanced(minBinId, maxBinId);
            return (0, weightToAmounts_1.autoFillXByWeight)(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.Curve: {
            let weights = toWeightCurve(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillXByWeight)(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
        case types_1.StrategyType.BidAsk: {
            let weights = toWeightBidAsk(minBinId, maxBinId, activeId);
            return (0, weightToAmounts_1.autoFillXByWeight)(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, weights);
        }
    }
}
// this this function to convert correct type for program
function toStrategyParameters({ maxBinId, minBinId, strategyType, singleSidedX, }) {
    const parameters = [singleSidedX ? 1 : 0, ...new Array(63).fill(0)];
    switch (strategyType) {
        case types_1.StrategyType.Spot: {
            return {
                minBinId,
                maxBinId,
                strategyType: { spotImBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
        case types_1.StrategyType.Curve: {
            return {
                minBinId,
                maxBinId,
                strategyType: { curveImBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
        case types_1.StrategyType.BidAsk: {
            return {
                minBinId,
                maxBinId,
                strategyType: { bidAskImBalanced: {} },
                parameteres: Buffer.from(parameters).toJSON().data,
            };
        }
    }
}
