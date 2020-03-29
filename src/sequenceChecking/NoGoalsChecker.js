const {EachNewGameSequenceChecker} = require("./sequenceChecking");
const config = require("../config.js").common;

class NoGoalsChecker extends EachNewGameSequenceChecker {
    get seqCountTrigger () {
        return config.watchNoGoalsCount;
    }
    get notificationText() {
        return  `нет голов в ${this.seqCount} матчах с ${config.watchNoGoalsFromSec} секунды`;
    }
    static checkGameCondition(game) {
        // стоит ли учитывать игры вообще без голов?
        return game.timerSeconds && game.timerSeconds < config.watchNoGoalsFromSec;
    }
}

exports.NoGoalsChecker = NoGoalsChecker;
