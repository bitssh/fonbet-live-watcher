class GameSequenceChecker {
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
        throw new Error ('notificationText method must be overridden');
    }
    sendNotification (notifier) {
        notifier.sendNotification(this);
    }
    checkCondition () {
        return this.seqCount >= this.seqCountTrigger;
    }
}

class EachGameSequenceChecker extends GameSequenceChecker{

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

class EachNewGameSequenceChecker extends EachGameSequenceChecker {

    checkCondition () {
        if (!this.lastGame.isNew()) {
            return;
        }
        return super.checkCondition(this.games);
    }
}

class LastGameChecker extends EachGameSequenceChecker {
    constructor(games, lastGame) {
        super([lastGame]);
    }
}



exports.GameSequenceChecker = GameSequenceChecker;
exports.EachGameSequenceChecker = EachGameSequenceChecker;
exports.EachNewGameSequenceChecker = EachNewGameSequenceChecker;
exports.LastGameChecker = LastGameChecker;
