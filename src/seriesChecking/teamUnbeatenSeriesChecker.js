const {BaseTeamTotalSeriesChecker} = require("./baseSeriesChecking");
const config = require("../config.js").common;

class BaseTeamUnbeatenSeriesChecker extends BaseTeamTotalSeriesChecker {
    get notificationText() {
        return `${this.constructor.teamNumber + 1} команда не проигрывает в ${this.seqCount} матчах`;
    }
    get seqCountTrigger() {
        return config.watchTeamUnbeatenSeries;
    }
    static getSwitchableGameConditionResult(game) {
        let result = super.getSwitchableGameConditionResult(game);
        return result === 0 ? 1 : result;
    }
}


class Team1UnbeatenSeriesChecker extends BaseTeamUnbeatenSeriesChecker {
    static get teamNumber() {
        return 0;
    }
    static getComparedTotalValue(game) {
        return game.getTeamScore(1);
    }
}

class Team2UnbeatenSeriesChecker extends BaseTeamUnbeatenSeriesChecker {
    static get teamNumber() {
        return 1;
    }
    static getComparedTotalValue(game) {
        return game.getTeamScore(0);
    }
}

exports.Team1UnbeatenSeriesChecker = Team1UnbeatenSeriesChecker;
exports.Team2UnbeatenSeriesChecker = Team2UnbeatenSeriesChecker;
