"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAmountBidSide = toAmountBidSide;
exports.toAmountAskSide = toAmountAskSide;
exports.toAmountBothSide = toAmountBothSide;
exports.autoFillYByWeight = autoFillYByWeight;
exports.autoFillXByWeight = autoFillXByWeight;
const anchor_1 = require("@coral-xyz/anchor");
const decimal_js_1 = __importDefault(require("decimal.js"));
const token_2022_1 = require("./token_2022");
const weight_1 = require("./weight");
/**
 * Distribute totalAmount to all bid side bins according to given distributions.
 * @param activeId active bin id
 * @param totalAmount total amount of token Y to be distributed
 * @param distributions weight distribution of each bin
 * @param mintY mint of token Y, get from DLMM instance
 * @param clock clock of the program, for calculating transfer fee, get from DLMM instance
 * @returns array of {binId, amount} where amount is the amount of token Y in each bin
 */
function toAmountBidSide(activeId, totalAmount, distributions, mintY, clock) {
    totalAmount = (0, token_2022_1.calculateTransferFeeExcludedAmount)(totalAmount, mintY, clock.epoch.toNumber()).amount;
    // get sum of weight
    const totalWeight = distributions.reduce(function (sum, el) {
        return el.binId > activeId ? sum : sum.add(el.weight); // skip all ask side
    }, new decimal_js_1.default(0));
    if (totalWeight.cmp(new decimal_js_1.default(0)) != 1) {
        throw Error("Invalid parameteres");
    }
    return distributions.map((bin) => {
        if (bin.binId > activeId) {
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(0),
            };
        }
        else {
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(new decimal_js_1.default(totalAmount.toString())
                    .mul(new decimal_js_1.default(bin.weight).div(totalWeight))
                    .floor()
                    .toString()),
            };
        }
    });
}
/**
 * Distribute totalAmount to all ask side bins according to given distributions.
 * @param activeId active bin id
 * @param totalAmount total amount of token Y to be distributed
 * @param distributions weight distribution of each bin
 * @param mintX mint of token X, get from DLMM instance
 * @param clock clock of the program, for calculating transfer fee, get from DLMM instance
 * @returns array of {binId, amount} where amount is the amount of token X in each bin
 */
function toAmountAskSide(activeId, binStep, totalAmount, distributions, mintX, clock) {
    totalAmount = (0, token_2022_1.calculateTransferFeeExcludedAmount)(totalAmount, mintX, clock.epoch.toNumber()).amount;
    // get sum of weight
    const totalWeight = distributions.reduce(function (sum, el) {
        if (el.binId < activeId) {
            return sum;
        }
        else {
            const price = (0, weight_1.getPriceOfBinByBinId)(el.binId, binStep);
            const weightPerPrice = new decimal_js_1.default(el.weight).div(price);
            return sum.add(weightPerPrice);
        }
    }, new decimal_js_1.default(0));
    if (totalWeight.cmp(new decimal_js_1.default(0)) != 1) {
        throw Error("Invalid parameteres");
    }
    return distributions.map((bin) => {
        if (bin.binId < activeId) {
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(0),
            };
        }
        else {
            const price = (0, weight_1.getPriceOfBinByBinId)(bin.binId, binStep);
            const weightPerPrice = new decimal_js_1.default(bin.weight).div(price);
            return {
                binId: bin.binId,
                amount: new anchor_1.BN(new decimal_js_1.default(totalAmount.toString())
                    .mul(weightPerPrice)
                    .div(totalWeight)
                    .floor()
                    .toString()),
            };
        }
    });
}
/**
 * Distributes the given amounts of tokens X and Y to both bid and ask side bins
 * based on the provided weight distributions.
 *
 * @param activeId - The id of the active bin.
 * @param binStep - The step interval between bin ids.
 * @param amountX - Total amount of token X to distribute.
 * @param amountY - Total amount of token Y to distribute.
 * @param amountXInActiveBin - Amount of token X already in the active bin.
 * @param amountYInActiveBin - Amount of token Y already in the active bin.
 * @param distributions - Array of bins with their respective weight distributions.
 * @param mintX - Mint information for token X. Get from DLMM instance.
 * @param mintY - Mint information for token Y. Get from DLMM instance.
 * @param clock - Clock instance. Get from DLMM instance.
 * @returns An array of objects containing binId, amountX, and amountY for each bin.
 */
function toAmountBothSide(activeId, binStep, amountX, amountY, amountXInActiveBin, amountYInActiveBin, distributions, mintX, mintY, clock) {
    // only bid side
    if (activeId > distributions[distributions.length - 1].binId) {
        let amounts = toAmountBidSide(activeId, amountY, distributions, mintY, clock);
        return amounts.map((bin) => {
            return {
                binId: bin.binId,
                amountX: new anchor_1.BN(0),
                amountY: bin.amount,
            };
        });
    }
    // only ask side
    if (activeId < distributions[0].binId) {
        let amounts = toAmountAskSide(activeId, binStep, amountX, distributions, mintX, clock);
        return amounts.map((bin) => {
            return {
                binId: bin.binId,
                amountX: bin.amount,
                amountY: new anchor_1.BN(0),
            };
        });
    }
    amountX = (0, token_2022_1.calculateTransferFeeIncludedAmount)(amountX, mintX, clock.epoch.toNumber()).amount;
    amountY = (0, token_2022_1.calculateTransferFeeIncludedAmount)(amountY, mintY, clock.epoch.toNumber()).amount;
    const activeBins = distributions.filter((element) => {
        return element.binId === activeId;
    });
    if (activeBins.length === 1) {
        const p0 = (0, weight_1.getPriceOfBinByBinId)(activeId, binStep);
        let wx0 = new decimal_js_1.default(0);
        let wy0 = new decimal_js_1.default(0);
        const activeBin = activeBins[0];
        if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
            wx0 = new decimal_js_1.default(activeBin.weight).div(p0.mul(new decimal_js_1.default(2)));
            wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(2));
        }
        else {
            let amountXInActiveBinDec = new decimal_js_1.default(amountXInActiveBin.toString());
            let amountYInActiveBinDec = new decimal_js_1.default(amountYInActiveBin.toString());
            if (!amountXInActiveBin.isZero()) {
                wx0 = new decimal_js_1.default(activeBin.weight).div(p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec)));
            }
            if (!amountYInActiveBin.isZero()) {
                wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(1).add(p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)));
            }
        }
        let totalWeightX = wx0;
        let totalWeightY = wy0;
        distributions.forEach((element) => {
            if (element.binId < activeId) {
                totalWeightY = totalWeightY.add(new decimal_js_1.default(element.weight));
            }
            if (element.binId > activeId) {
                let price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                let weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX = totalWeightX.add(weighPerPrice);
            }
        });
        const kx = new decimal_js_1.default(amountX.toString()).div(totalWeightX);
        const ky = new decimal_js_1.default(amountY.toString()).div(totalWeightY);
        let k = kx.lessThan(ky) ? kx : ky;
        return distributions.map((bin) => {
            if (bin.binId < activeId) {
                const amount = k.mul(new decimal_js_1.default(bin.weight));
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(0),
                    amountY: new anchor_1.BN(amount.floor().toString()),
                };
            }
            if (bin.binId > activeId) {
                const price = (0, weight_1.getPriceOfBinByBinId)(bin.binId, binStep);
                const weighPerPrice = new decimal_js_1.default(bin.weight).div(price);
                const amount = k.mul(weighPerPrice);
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(amount.floor().toString()),
                    amountY: new anchor_1.BN(0),
                };
            }
            const amountXActiveBin = k.mul(wx0);
            const amountYActiveBin = k.mul(wy0);
            return {
                binId: bin.binId,
                amountX: new anchor_1.BN(amountXActiveBin.floor().toString()),
                amountY: new anchor_1.BN(amountYActiveBin.floor().toString()),
            };
        });
    }
    else {
        let totalWeightX = new decimal_js_1.default(0);
        let totalWeightY = new decimal_js_1.default(0);
        distributions.forEach((element) => {
            if (element.binId < activeId) {
                totalWeightY = totalWeightY.add(new decimal_js_1.default(element.weight));
            }
            else {
                let price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                let weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX = totalWeightX.add(weighPerPrice);
            }
        });
        let kx = new decimal_js_1.default(amountX.toString()).div(totalWeightX);
        let ky = new decimal_js_1.default(amountY.toString()).div(totalWeightY);
        let k = kx.lessThan(ky) ? kx : ky;
        return distributions.map((bin) => {
            if (bin.binId < activeId) {
                const amount = k.mul(new decimal_js_1.default(bin.weight));
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(0),
                    amountY: new anchor_1.BN(amount.floor().toString()),
                };
            }
            else {
                let price = (0, weight_1.getPriceOfBinByBinId)(bin.binId, binStep);
                let weighPerPrice = new decimal_js_1.default(bin.weight).div(price);
                const amount = k.mul(weighPerPrice);
                return {
                    binId: bin.binId,
                    amountX: new anchor_1.BN(amount.floor().toString()),
                    amountY: new anchor_1.BN(0),
                };
            }
        });
    }
}
function autoFillYByWeight(activeId, binStep, amountX, amountXInActiveBin, amountYInActiveBin, distributions) {
    const activeBins = distributions.filter((element) => {
        return element.binId === activeId;
    });
    if (activeBins.length === 1) {
        const p0 = (0, weight_1.getPriceOfBinByBinId)(activeId, binStep);
        let wx0 = new decimal_js_1.default(0);
        let wy0 = new decimal_js_1.default(0);
        const activeBin = activeBins[0];
        if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
            wx0 = new decimal_js_1.default(activeBin.weight).div(p0.mul(new decimal_js_1.default(2)));
            wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(2));
        }
        else {
            let amountXInActiveBinDec = new decimal_js_1.default(amountXInActiveBin.toString());
            let amountYInActiveBinDec = new decimal_js_1.default(amountYInActiveBin.toString());
            if (!amountXInActiveBin.isZero()) {
                wx0 = new decimal_js_1.default(activeBin.weight).div(p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec)));
            }
            if (!amountYInActiveBin.isZero()) {
                wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(1).add(p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)));
            }
        }
        let totalWeightX = wx0;
        let totalWeightY = wy0;
        distributions.forEach((element) => {
            if (element.binId < activeId) {
                totalWeightY = totalWeightY.add(new decimal_js_1.default(element.weight));
            }
            if (element.binId > activeId) {
                const price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                const weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX = totalWeightX.add(weighPerPrice);
            }
        });
        const kx = totalWeightX.isZero()
            ? new decimal_js_1.default(1)
            : new decimal_js_1.default(amountX.toString()).div(totalWeightX);
        const amountY = kx.mul(totalWeightY);
        return new anchor_1.BN(amountY.floor().toString());
    }
    else {
        let totalWeightX = new decimal_js_1.default(0);
        let totalWeightY = new decimal_js_1.default(0);
        distributions.forEach((element) => {
            if (element.binId < activeId) {
                totalWeightY = totalWeightY.add(new decimal_js_1.default(element.weight));
            }
            else {
                const price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                const weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX = totalWeightX.add(weighPerPrice);
            }
        });
        const kx = totalWeightX.isZero()
            ? new decimal_js_1.default(1)
            : new decimal_js_1.default(amountX.toString()).div(totalWeightX);
        const amountY = kx.mul(totalWeightY);
        return new anchor_1.BN(amountY.floor().toString());
    }
}
function autoFillXByWeight(activeId, binStep, amountY, amountXInActiveBin, amountYInActiveBin, distributions) {
    const activeBins = distributions.filter((element) => {
        return element.binId === activeId;
    });
    if (activeBins.length === 1) {
        const p0 = (0, weight_1.getPriceOfBinByBinId)(activeId, binStep);
        let wx0 = new decimal_js_1.default(0);
        let wy0 = new decimal_js_1.default(0);
        const activeBin = activeBins[0];
        if (amountXInActiveBin.isZero() && amountYInActiveBin.isZero()) {
            wx0 = new decimal_js_1.default(activeBin.weight).div(p0.mul(new decimal_js_1.default(2)));
            wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(2));
        }
        else {
            let amountXInActiveBinDec = new decimal_js_1.default(amountXInActiveBin.toString());
            let amountYInActiveBinDec = new decimal_js_1.default(amountYInActiveBin.toString());
            if (!amountXInActiveBin.isZero()) {
                wx0 = new decimal_js_1.default(activeBin.weight).div(p0.add(amountYInActiveBinDec.div(amountXInActiveBinDec)));
            }
            if (!amountYInActiveBin.isZero()) {
                wy0 = new decimal_js_1.default(activeBin.weight).div(new decimal_js_1.default(1).add(p0.mul(amountXInActiveBinDec).div(amountYInActiveBinDec)));
            }
        }
        let totalWeightX = wx0;
        let totalWeightY = wy0;
        distributions.forEach((element) => {
            if (element.binId < activeId) {
                totalWeightY = totalWeightY.add(new decimal_js_1.default(element.weight));
            }
            if (element.binId > activeId) {
                const price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                const weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX = totalWeightX.add(weighPerPrice);
            }
        });
        const ky = totalWeightY.isZero()
            ? new decimal_js_1.default(1)
            : new decimal_js_1.default(amountY.toString()).div(totalWeightY);
        const amountX = ky.mul(totalWeightX);
        return new anchor_1.BN(amountX.floor().toString());
    }
    else {
        let totalWeightX = new decimal_js_1.default(0);
        let totalWeightY = new decimal_js_1.default(0);
        distributions.forEach((element) => {
            if (element.binId < activeId) {
                totalWeightY = totalWeightY.add(new decimal_js_1.default(element.weight));
            }
            else {
                const price = (0, weight_1.getPriceOfBinByBinId)(element.binId, binStep);
                const weighPerPrice = new decimal_js_1.default(element.weight).div(price);
                totalWeightX = totalWeightX.add(weighPerPrice);
            }
        });
        const ky = totalWeightY.isZero()
            ? new decimal_js_1.default(1)
            : new decimal_js_1.default(amountY.toString()).div(totalWeightY);
        const amountX = ky.mul(totalWeightX);
        return new anchor_1.BN(amountX.floor().toString());
    }
}
