const config = require("../config.js").common;

class BaseGameSequenceChecker {
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

class BaseEachGameSequenceChecker extends BaseGameSequenceChecker{

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

class BaseEachNewGameSequenceChecker extends BaseEachGameSequenceChecker {

    checkCondition () {
        if (!this.lastGame.isNew()) {
            return;
        }
        return super.checkCondition(this.games);
    }
}

class BaseLastGameChecker extends BaseEachGameSequenceChecker {
    constructor(games, lastGame) {
        super([lastGame]);
    }
}


const COMPARISON_TYPE = {
    GREATER: 'больше',
    LESS: 'меньше',
};

class BaseTotalSequenceChecker extends BaseEachNewGameSequenceChecker {
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

exports.BaseGameSequenceChecker = BaseGameSequenceChecker;
exports.BaseEachGameSequenceChecker = BaseEachGameSequenceChecker;
exports.BaseEachNewGameSequenceChecker = BaseEachNewGameSequenceChecker;
exports.BaseLastGameChecker = BaseLastGameChecker;
exports.BaseTotalSequenceChecker = BaseTotalSequenceChecker;
exports.COMPARISON_TYPE = COMPARISON_TYPE;
