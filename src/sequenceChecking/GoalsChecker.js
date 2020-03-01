const {EachGameSequenceChecker} = require("./sequenceChecking");
const config = require("../config.js").common;

class GoalsChecker extends EachGameSequenceChecker {
    get seqCountTrigger () {
        return config.watchNoGoalsCount;
    }
    get notificationText() {
        return  `голы в ${this.seqCount} матчах с ${config.watchGoalsFromSec} секунды`;
    }
    static checkGameCondition(game) {
        return game.timerSeconds && game.timerSeconds >= config.watchNoGoalsFromSec;
    }
}

exports.GoalsChecker = GoalsChecker;
