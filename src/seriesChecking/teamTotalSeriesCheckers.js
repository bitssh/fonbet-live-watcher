const {BaseTotalSeriesChecker} = require("./baseSeriesChecking");
const config = require("../config.js").common;
const {COMPARISON_TYPE} = require("./baseSeriesChecking");

class BaseTeamTotalSeriesChecker extends BaseTotalSeriesChecker {
    static get teamNumber() {
        this.throwMethodNotImplementedError();
    }
    get seqCountTrigger() {
        return config.watchTeamTotalSeqCount;
    }
    get notificationText() {
        return `${this.constructor.teamNumber + 1} команда - ${super.notificationText}`;
    }
    static getCurrentTotal(game) {
        return game.getTeamScore(this.teamNumber);
    }
}

class BaseTeamScoreLessThanChecker extends BaseTeamTotalSeriesChecker {
    static get totalValueCondition() {
        return config.watchTeamTotalSeqLessThan;
    }
    static get totalValueComparisonOperatorType() {
        return COMPARISON_TYPE.LESS;
    }
}

class BaseTeamScoreMoreThanChecker extends BaseTeamTotalSeriesChecker {
    static get totalValueCondition() {
        return config.watchTeamTotalSeqMoreThan;
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

class Team1ScoreMoreThanChecker extends BaseTeamScoreMoreThanChecker {
    static get teamNumber() {
        return 0;
    }
}

class Team2ScoreMoreThanChecker extends BaseTeamScoreMoreThanChecker {
    static get teamNumber() {
        return 1;
    }
}

exports.Team1ScoreLessThanChecker = Team1ScoreLessThanChecker;
exports.Team1ScoreMoreThanChecker = Team1ScoreMoreThanChecker;
exports.Team2ScoreLessThanChecker = Team2ScoreLessThanChecker;
exports.Team2ScoreMoreThanChecker = Team2ScoreMoreThanChecker;
