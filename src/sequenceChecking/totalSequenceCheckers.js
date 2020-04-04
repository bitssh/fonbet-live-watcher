const {BaseTotalSequenceChecker, COMPARISON_TYPE} = require("./baseSequenceChecking");
const config = require("../config.js").common;

class TotalMoreThanChecker extends BaseTotalSequenceChecker {
    static get totalValueCondition() {
        return config.watchTotalSeqMoreThan;
    }
    static get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.GREATER;
    }
}

class TotalLessThanChecker extends BaseTotalSequenceChecker {
    static get totalValueCondition() {
        return config.watchTotalSeqLessThan;
    }
    static get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.LESS;
    }
}

exports.TotalMoreThanChecker = TotalMoreThanChecker;
exports.TotalLessThanChecker = TotalLessThanChecker;
