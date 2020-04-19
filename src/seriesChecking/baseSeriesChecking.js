const {sportConfigByID} = require("../config");
const {sendNotification} = require("../notifying");

class BaseGameSeriesChecker {
    constructor(games) {
        this.games = games.slice();
        this.initLastGame();

        if (this.lastGame) {
            this.config = sportConfigByID[this.lastGame.sportId];
        } else {
            console.warn(`lastGame is not defined for ${this.constructor.name}`);
        }
    }

    initLastGame () {
    }

    get seqCount() {
        if (!this._seqCount) {
            this._seqCount = this.calcSeqCount(this.games);
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
        this.throwMethodNotImplementedError();
    }
    calcSeqCount() {
        return 0;
    }
    throwMethodNotImplementedError() {
        // noinspection JSUnresolvedVariable
        throw new Error(`some of ${this.name} class methods is not implemented`);
    }
    sendNotification() {
        let {sportName, eventName} = this.lastGame;
        sendNotification({
            sportName,
            eventName,
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
    }

    initLastGame () {
        this._lastGame = this.games.pop();
    }

    get lastGame() {
        return this._lastGame;
    }
    checkGameCondition() {
        return false;
    }
    getSwitchableGameConditionResult(game) {
        return this.checkGameCondition(game) ? 1 : -1;
    }
    iterateGame(game) {
        let result = Math.sign(this.getSwitchableGameConditionResult(game));
        return {
            [-1]: {doBreak: true, countIncrement: 0},
            [1]: {countIncrement: 1},
            [0]: {countIncrement: 0},
            [NaN]: {countIncrement: 0},
        }[result];
    }
    calcSeqCount(games) {
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
    get teamNumber() {
        this.throwMethodNotImplementedError();
        return 0;
    }
    get teamName() {
        return this.lastGame.getTeamName(this.teamNumber);
    }
}

class BaseEachNewGameSeriesChecker extends BaseEachGameSeriesChecker {

    checkCondition() {
        if (!this.lastGame.isNew()) {
            return;
        }
        return super.checkCondition();
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
    get totalValueComparisonOperatorType() {
        return null;
    }
    getComparedTotalValue() {
        this.throwMethodNotImplementedError();
    }
    get seqCountTrigger() {
        return this.config.totalSeries;
    }
    get notificationText() {
        return `тотал ${this.totalValueComparisonOperatorType} ${this.getComparedTotalValue()}` +
            ` в ${this.seqCount} матчах подряд`;
    }
    getCurrentTotal(game) {
        return game.total;
    }
    getSwitchableGameConditionResult(game) {
        let result = this.getCurrentTotal(game) - this.getComparedTotalValue(game);
        if (this.totalValueComparisonOperatorType === COMPARISON_TYPE.LESS) {
            result = result * - 1;
        }
        return result;
    }
}

class BaseTeamTotalSeriesChecker extends BaseTotalSeriesChecker {
    get seqCountTrigger() {
        return this.config.teamTotalSeries;
    }
    get notificationText() {
        return `${this.teamName} - ${super.notificationText}`;
    }
    getCurrentTotal(game) {
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
