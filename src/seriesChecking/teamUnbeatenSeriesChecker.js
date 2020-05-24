const {BaseTeamTotalSeriesChecker} = require("./baseSeriesChecking");

class BaseTeamUnbeatenSeriesChecker extends BaseTeamTotalSeriesChecker {
    get notificationText() {
        return `${this.teamName} не проигрывают в ${this.seqCount} матчах`;
    }
    get seqCountTrigger() {
        return this.config.teamUnbeatenSeries;
    }
    getSwitchableGameConditionResult(game) {
        let result = super.getSwitchableGameConditionResult(game);
        return result === 0 ? 1 : result;
    }
}


class Team1UnbeatenSeriesChecker extends BaseTeamUnbeatenSeriesChecker {
    get teamNumber() {
        return 0;
    }
    getComparedTotalValue(game) {
        return game.score[1];
    }
}

class Team2UnbeatenSeriesChecker extends BaseTeamUnbeatenSeriesChecker {
    get teamNumber() {
        return 1;
    }
    getComparedTotalValue(game) {
        return game.score[0];
    }
}

exports.Team1UnbeatenSeriesChecker = Team1UnbeatenSeriesChecker;
exports.Team2UnbeatenSeriesChecker = Team2UnbeatenSeriesChecker;
