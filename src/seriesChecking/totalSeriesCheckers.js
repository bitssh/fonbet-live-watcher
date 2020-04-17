const {BaseTotalSeriesChecker, COMPARISON_TYPE} = require("./baseSeriesChecking");

class TotalGreaterThanChecker extends BaseTotalSeriesChecker {
    getComparedTotalValue() {
        return this.config.totalGreaterThan;
    }
    get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.GREATER;
    }
}

class TotalLessThanChecker extends BaseTotalSeriesChecker {
    getComparedTotalValue() {
        return this.config.totalLessThan;
    }
    get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.LESS;
    }
}

exports.TotalGreaterThanChecker = TotalGreaterThanChecker;
exports.TotalLessThanChecker = TotalLessThanChecker;
