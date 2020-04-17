const {BaseEachNewGameSeriesChecker} = require("./baseSeriesChecking");

class GoalSeriesChecker extends BaseEachNewGameSeriesChecker {
    get seqCountTrigger () {
        return this.config.goalsSeries;
    }
    get notificationText() {
        return  `голы в ${this.seqCount} матчах с ${this.config.goalsFromSec} секунды`;
    }
    checkGameCondition(game) {
        return game.timerSeconds && game.timerSeconds >= this.config.noGoalsFromSec;
    }
}

class NoGoalSeriesChecker extends BaseEachNewGameSeriesChecker {
    get seqCountTrigger () {
        return this.config.noGoalsSeries;
    }
    get notificationText() {
        return  `нет голов в ${this.seqCount} матчах с ${this.config.noGoalsFromSec} секунды`;
    }
    checkGameCondition(game) {
        // стоит ли учитывать игры вообще без голов?
        return game.timerSeconds && game.timerSeconds < this.config.noGoalsFromSec;
    }
}

exports.NoGoalSeriesChecker = NoGoalSeriesChecker;
exports.GoalSeriesChecker = GoalSeriesChecker;
