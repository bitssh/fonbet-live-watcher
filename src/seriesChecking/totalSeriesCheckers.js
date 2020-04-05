const {BaseTotalSeriesChecker, COMPARISON_TYPE} = require("./baseSeriesChecking");
const config = require("../config.js").common;

class TotalMoreThanChecker extends BaseTotalSeriesChecker {
    static getComparedTotalValue() {
        return config.watchTotalSeqMoreThan;
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

exports.TotalMoreThanChecker = TotalMoreThanChecker;
exports.TotalLessThanChecker = TotalLessThanChecker;
