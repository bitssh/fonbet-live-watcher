const {BaseTeamTotalSeriesChecker} = require("./baseSeriesChecking");

class BaseTeamWinChecker extends BaseTeamTotalSeriesChecker {
    get notificationText() {
        return `${this.teamName} - победная серия ${this.seqCount} матчей`;
    }
    get seqCountTrigger() {
        return this.config.teamWinSeries;
    }

    getSwitchableGameConditionResult(game) {
        let result = super.getSwitchableGameConditionResult(game);
        return result === 0 ? -1 : result;
    }
}

class Team1WinChecker extends BaseTeamWinChecker {
    get teamNumber() {
        return 0;
    }
    getComparedTotalValue(game) {
        return game.getTeamScore(1);
    }
}

class Team2WinChecker extends BaseTeamWinChecker {
    get teamNumber() {
        return 1;
    }
    getComparedTotalValue(game) {
        return game.getTeamScore(0);
    }
}

exports.Team1WinChecker = Team1WinChecker;
exports.Team2WinChecker = Team2WinChecker;
