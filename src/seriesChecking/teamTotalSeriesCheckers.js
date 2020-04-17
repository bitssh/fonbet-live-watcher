const {BaseTeamTotalSeriesChecker} = require("./baseSeriesChecking");
const {COMPARISON_TYPE} = require("./baseSeriesChecking");

class BaseTeamScoreLessThanChecker extends BaseTeamTotalSeriesChecker {
    getComparedTotalValue() {
        return this.config.teamTotalLessThan;
    }
    get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.LESS;
    }
}

class BaseTeamScoreGreaterThanChecker extends BaseTeamTotalSeriesChecker {
    getComparedTotalValue() {
        return this.config.teamTotalGreaterThan;
    }
    get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.GREATER;
    }
}

class Team1ScoreLessThanChecker extends BaseTeamScoreLessThanChecker {
    get teamNumber() {
        return 0;
    }
}

class Team2ScoreLessThanChecker extends BaseTeamScoreLessThanChecker {
    get teamNumber() {
        return 1;
    }
}

class Team1ScoreGreaterThanChecker extends BaseTeamScoreGreaterThanChecker {
    get teamNumber() {
        return 0;
    }
}

class Team2ScoreGreaterThanChecker extends BaseTeamScoreGreaterThanChecker {
    get teamNumber() {
        return 1;
    }
}

exports.Team1ScoreLessThanChecker = Team1ScoreLessThanChecker;
exports.Team1ScoreGreaterThanChecker = Team1ScoreGreaterThanChecker;
exports.Team2ScoreLessThanChecker = Team2ScoreLessThanChecker;
exports.Team2ScoreGreaterThanChecker = Team2ScoreGreaterThanChecker;
