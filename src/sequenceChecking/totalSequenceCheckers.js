const {BaseEachNewGameSequenceChecker} = require("./baseSequenceChecking");
const config = require("../config.js").common;

class TotalMoreThanChecker extends BaseEachNewGameSequenceChecker {
    get seqCountTrigger () {
        return config.watchTotalSeqCount;
    }
    get notificationText() {
        return  `тотал больше ${this.watchTotalSeqMoreThan} в ${this.seqCount} матчах подряд`;
    }
    static checkGameCondition(game) {
        return game.total > config.watchTotalSeqMoreThan;
    }
}

class TotalLessThanChecker extends BaseEachNewGameSequenceChecker {
    get seqCountTrigger () {
        return config.watchTotalSeqCount;
    }
    get notificationText() {
        return  `тотал меньше ${this.watchTotalSeqLessThan} в ${this.seqCount} матчах подряд`;
    }
    static checkGameCondition(game) {
        return game.total < config.watchTotalSeqLessThan;
    }
}

exports.TotalMoreThanChecker = TotalMoreThanChecker;
exports.TotalLessThanChecker = TotalLessThanChecker;
