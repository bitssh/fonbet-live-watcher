const {EachGameSequenceChecker} = require("./sequenceChecking");
const config = require("../config.js").common;

class TotalSequenceChecker extends EachGameSequenceChecker {
    get seqCountTrigger () {
        return config.watchTotalSeqCount;
    }
    get notificationText() {
        return  `тотал больше ${this.watchTotalSeqLessThan} в ${this.seqCount} матчах подряд`;
    }
    static checkGameCondition(game) {
        return game.total > config.watchTotalSeqLessThan;
    }
}

exports.TotalSequenceChecker = TotalSequenceChecker;
