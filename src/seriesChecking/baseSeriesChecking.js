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
        throw new Error(`some of ${this.name} class method is not implemented`);
    }
    sendNotification() {
        let {sportName, matchName} = this.lastGame;
        sendNotification({
            sportName,
            matchName,
            text: this.notificationText
        });
    }
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
    static calcSeqCount(games) {
        let count = 0;
        for (let game of games.reverse()) {
            if (this.checkGameCondition(game)) {
                count += 1;
            } else {
                break;
            }
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
    constructor(games, lastGame) {
        super([lastGame]);
    }
}

const COMPARISON_TYPE = {
    GREATER: 'больше',
    LESS: 'меньше',
};

class BaseTotalSeriesChecker extends BaseEachNewGameSeriesChecker {
    static get totalValueComparisonOperatorType() {
        this.throwMethodNotImplementedError();
    }
    static get totalValueCondition() {
        this.throwMethodNotImplementedError();
    }
    get seqCountTrigger() {
        return config.watchTotalSeqCount;
    }
    get notificationText() {
        return `тотал ${this.constructor.totalValueComparisonOperatorType} ${this.constructor.totalValueCondition}` +
            ` в ${this.seqCount} матчах подряд`;
    }
    static getCurrentTotal(game) {
        return game.total;
    }
    static checkGameCondition(game) {
        return (this.totalValueComparisonOperatorType) === COMPARISON_TYPE.GREATER
            ? this.getCurrentTotal(game) > this.totalValueCondition
            : this.getCurrentTotal(game) < this.totalValueCondition;
    }
}

exports.BaseGameSeriesChecker = BaseGameSeriesChecker;
exports.BaseEachGameSeriesChecker = BaseEachGameSeriesChecker;
exports.BaseEachNewGameSeriesChecker = BaseEachNewGameSeriesChecker;
exports.BaseLastGameChecker = BaseLastGameChecker;
exports.BaseTotalSeriesChecker = BaseTotalSeriesChecker;
exports.COMPARISON_TYPE = COMPARISON_TYPE;
