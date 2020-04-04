const {BaseEachNewGameSeriesChecker} = require("./baseSeriesChecking");
const config = require("../config.js").common;

class GoalSeriesChecker extends BaseEachNewGameSeriesChecker {
    get seqCountTrigger () {
        return config.watchGoalsCount;
    }
    get notificationText() {
        return  `голы в ${this.seqCount} матчах с ${config.watchGoalsFromSec} секунды`;
    }
    static checkGameCondition(game) {
        return game.timerSeconds && game.timerSeconds >= config.watchNoGoalsFromSec;
    }
}

class NoGoalSeriesChecker extends BaseEachNewGameSeriesChecker {
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

exports.NoGoalSeriesChecker = NoGoalSeriesChecker;
exports.GoalSeriesChecker = GoalSeriesChecker;