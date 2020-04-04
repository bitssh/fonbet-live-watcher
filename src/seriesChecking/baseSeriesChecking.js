const config = require("../config.js").common;

class BaseGameSeriesChecker {
    constructor (games) {
        this.games = games.slice();
    }
    static calcSeqCount () {
        return 0;
    }
    get seqCount () {
        if (!this._seqCount) {
            this._seqCount = this.constructor.calcSeqCount(this.games);
        }
        return this._seqCount;
    }
    get seqCountTrigger () {
        return 1;
    }
    get notificationText () {
        this.constructor.throwMethodNotImplementedError();
    }
    sendNotification (notifier) {
        notifier.sendNotification(this);
    }
    checkCondition () {
        return this.seqCount >= this.seqCountTrigger;
    }
    static throwMethodNotImplementedError() {
        // noinspection JSUnresolvedVariable
        throw new Error (`some of ${this.name} class method is not implemented`);
    }


}

class BaseEachGameSeriesChecker extends BaseGameSeriesChecker{

    constructor(games, lastGame) {
        super(games);
        this.games.pop();
        this.lastGame = lastGame;
    }
    static checkGameCondition () {
        return false;
    }
    static calcSeqCount(games) {
        let count = 0;
        for (let game of games.slice().reverse()) {
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

    checkCondition () {
        if (!this.lastGame.isNew()) {
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
    get seqCountTrigger() {
        return config.watchTotalSeqCount;
    }
    get notificationText() {
        return `тотал ${this.constructor.totalValueComparisonOperatorType} 
        ${this.watchTotalSeqMoreThan} в ${this.seqCount} матчах подряд`;
    }
    static getCurrentTotal(game) {
        return game.total;
    }
    static get totalValueCondition() {
        this.throwMethodNotImplementedError();
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
