const {sendNotification} = require("../notifying");
const config = require("../config.js").common;

class BaseGameSeriesChecker {
    constructor(games) {
        this.games = games.slice();
    }
    get seqCount() {
        if (!this._seqCount) {
            this._seqCount = this.constructor.calcSeqCount(this.games);
        }
        return this._seqCount;
    }
    get seqCountTrigger() {
        return 1;
    }
    get lastGame() {
        return this.games[this.games.length - 1];
    }
    get notificationText() {
        this.constructor.throwMethodNotImplementedError();
    }
    static calcSeqCount() {
        return 0;
    }
    static throwMethodNotImplementedError() {
        // noinspection JSUnresolvedVariable
        throw new Error(`some of ${this.name} class methods is not implemented`);
    }
    sendNotification() {
        let {sportName, matchName} = this.lastGame;
        sendNotification({
            sportName,
            matchName,
            text: this.notificationText
        });
    }
    // TODO написать тесты этого метода вместо переопределения sendNotification
    checkCondition() {
        return this.seqCount >= this.seqCountTrigger;
    }
}

class BaseEachGameSeriesChecker extends BaseGameSeriesChecker {

    constructor(games) {
        super(games);
        this._lastGame = this.games.pop();
    }
    get lastGame() {
        return this._lastGame;
    }
    static checkGameCondition() {
        return false;
    }
    static getSwitchableGameConditionResult(game) {
        return this.checkGameCondition(game) ? 1 : -1;
    }
    static iterateGame(game) {
        let result = Math.sign(this.getSwitchableGameConditionResult(game));
        return {
            [-1]: {doBreak: true, countIncrement: 0},
            [1]: {countIncrement: 1},
            [0]: {countIncrement: 0},
            [NaN]: {countIncrement: 0},
        }[result];
    }
    static calcSeqCount(games) {
        let count = 0;
        for (let game of games.reverse()) {
            let result = this.iterateGame(game);
            if (result.doBreak) {
                break;
            }
            count += result.countIncrement;
        }
        return count;
    }
}

class BaseEachNewGameSeriesChecker extends BaseEachGameSeriesChecker {

    checkCondition() {
        // FIXME
        if (this.lastGame.isNew && !this.lastGame.isNew()) {
            return;
        }
        return super.checkCondition(this.games);
    }
}

class BaseLastGameChecker extends BaseEachGameSeriesChecker {
    constructor(games) {
        super(games);
        this.games = [this.lastGame];
    }
}

const COMPARISON_TYPE = {
    GREATER: 'больше',
    LESS: 'меньше',
};

class BaseTotalSeriesChecker extends BaseEachNewGameSeriesChecker {
    static get totalValueComparisonOperatorType() {
        return null;
    }
    static getComparedTotalValue() {
        this.throwMethodNotImplementedError();
    }
    get seqCountTrigger() {
        return config.watchTotalSeqCount;
    }
    get notificationText() {
        return `тотал ${this.constructor.totalValueComparisonOperatorType} ${this.constructor.getComparedTotalValue()}` +
            ` в ${this.seqCount} матчах подряд`;
    }
    static getCurrentTotal(game) {
        return game.total;
    }
    static getSwitchableGameConditionResult(game) {
        let result = this.getCurrentTotal(game) - this.getComparedTotalValue(game);
        if (this.totalValueComparisonOperatorType === COMPARISON_TYPE.LESS) {
            result = result * - 1;
        }
        return result;
    }
}

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

exports.BaseGameSeriesChecker = BaseGameSeriesChecker;
exports.BaseEachGameSeriesChecker = BaseEachGameSeriesChecker;
exports.BaseEachNewGameSeriesChecker = BaseEachNewGameSeriesChecker;
exports.BaseLastGameChecker = BaseLastGameChecker;
exports.BaseTotalSeriesChecker = BaseTotalSeriesChecker;
exports.BaseTeamTotalSeriesChecker = BaseTeamTotalSeriesChecker;
exports.COMPARISON_TYPE = COMPARISON_TYPE;
