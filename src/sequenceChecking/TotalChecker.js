const {LastGameChecker} = require("./sequenceChecking");
const config = require("../config.js").common;

class TotalChecker extends LastGameChecker {
    get notificationText() {
        return  `до 200 секунды сумма голов 8 ${this.watchTotalSeqLessThan}`;
    }
    static checkGameCondition(game) {
        return (game.timerSeconds < config.watchTotalCountToSec)
            && (game.total === config.watchTotalCount);
    }
}

exports.TotalChecker = TotalChecker;
