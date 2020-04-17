const {BaseTeamTotalSeriesChecker} = require("./baseSeriesChecking");

class BaseTeamWinChecker extends BaseTeamTotalSeriesChecker {
    get notificationText() {
        return `${this.teamNumber + 1} команда - победная серия ${this.seqCount} матчей`;
    }
    get seqCountTrigger() {
        return this.config.teamWinSeries;
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
