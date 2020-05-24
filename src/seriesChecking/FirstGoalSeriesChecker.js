const {BaseEachGameSeriesChecker} = require("./baseSeriesChecking");

class FirstGoalSeriesChecker extends BaseEachGameSeriesChecker {

    get watchingScore () {
        return this.teamNumber === 0 ? '1:0' : '0:1';
    }

    get seqCountTrigger () {
        return this.config.teamFirstGoalSeries;
    }

    checkCondition() {
        if (this.lastGame.scoreStr !== this.watchingScore) {
            return;
        }
        return super.checkCondition();
    }
    checkGameCondition(game) {
        return game.hasScore(this.watchingScore, false);
    }

    get notificationText() {
        return `${this.teamName} - первый гол в ${this.seqCount} матчах`;
    }
}

class Team1FirstGoalSeriesChecker extends FirstGoalSeriesChecker {

    get teamNumber() {
        return 0;
    }
}

class Team2FirstGoalSeriesChecker extends FirstGoalSeriesChecker {

    get teamNumber() {
        return 1;
    }
}

exports.Team1FirstGoalSeriesChecker = Team1FirstGoalSeriesChecker;
exports.Team2FirstGoalSeriesChecker = Team2FirstGoalSeriesChecker;
