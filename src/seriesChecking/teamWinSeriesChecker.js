const {BaseTeamTotalSeriesChecker} = require("./baseSeriesChecking");
const config = require("../config.js").common;

class BaseTeamWinChecker extends BaseTeamTotalSeriesChecker {
    get notificationText() {
        return `${this.constructor.teamNumber + 1} команда - победная серия ${this.seqCount} матчей`;
    }
    get seqCountTrigger() {
        return config.watchTeamWinSeries;
    }
}

class Team1WinChecker extends BaseTeamWinChecker {
    static get teamNumber() {
        return 0;
    }
    static getComparedTotalValue(game) {
        return game.getTeamScore(1);
    }
}

class Team2WinChecker extends BaseTeamWinChecker {
    static get teamNumber() {
        return 1;
    }
    static getComparedTotalValue(game) {
        return game.getTeamScore(0);
    }
}

exports.Team1WinChecker = Team1WinChecker;
exports.Team2WinChecker = Team2WinChecker;
