const {BaseLastGameChecker} = require("./baseSequenceChecking");
const config = require("../config.js").common;

class LastGameTotalChecker extends BaseLastGameChecker {
    get notificationText() {
        return  `до 200 секунды сумма голов 8 ${this.watchTotalSeqLessThan}`;
    }
    static checkGameCondition(game) {
        return (game.timerSeconds < config.watchTotalCountToSec)
            && (game.total === config.watchTotalCount);
    }
}

exports.LastGameTotalChecker = LastGameTotalChecker;
