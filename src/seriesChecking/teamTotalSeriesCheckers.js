const {BaseTeamTotalSeriesChecker} = require("./baseSeriesChecking");
const config = require("../config.js").common;
const {COMPARISON_TYPE} = require("./baseSeriesChecking");

class BaseTeamScoreLessThanChecker extends BaseTeamTotalSeriesChecker {
    static getComparedTotalValue() {
        return config.watchTeamTotalSeqLessThan;
    }
    static get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.LESS;
    }
}

class BaseTeamScoreGreaterThanChecker extends BaseTeamTotalSeriesChecker {
    static getComparedTotalValue() {
        return config.watchTeamTotalSeqGreaterThan;
    }
    static get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.GREATER;
    }
}

class Team1ScoreLessThanChecker extends BaseTeamScoreLessThanChecker {
    static get teamNumber() {
        return 0;
    }
}

class Team2ScoreLessThanChecker extends BaseTeamScoreLessThanChecker {
    static get teamNumber() {
        return 1;
    }
}

class Team1ScoreGreaterThanChecker extends BaseTeamScoreGreaterThanChecker {
    static get teamNumber() {
        return 0;
    }
}

class Team2ScoreGreaterThanChecker extends BaseTeamScoreGreaterThanChecker {
    static get teamNumber() {
        return 1;
    }
}

exports.Team1ScoreLessThanChecker = Team1ScoreLessThanChecker;
exports.Team1ScoreGreaterThanChecker = Team1ScoreGreaterThanChecker;
exports.Team2ScoreLessThanChecker = Team2ScoreLessThanChecker;
exports.Team2ScoreGreaterThanChecker = Team2ScoreGreaterThanChecker;
