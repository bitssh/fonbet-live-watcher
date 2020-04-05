const {BaseTotalSeriesChecker, COMPARISON_TYPE} = require("./baseSeriesChecking");
const config = require("../config.js").common;

class TotalGreaterThanChecker extends BaseTotalSeriesChecker {
    static getComparedTotalValue() {
        return config.watchTotalSeqGreaterThan;
    }
    static get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.GREATER;
    }
}

class TotalLessThanChecker extends BaseTotalSeriesChecker {
    static getComparedTotalValue() {
        return config.watchTotalSeqLessThan;
    }
    static get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.LESS;
    }
}

exports.TotalGreaterThanChecker = TotalGreaterThanChecker;
exports.TotalLessThanChecker = TotalLessThanChecker;
