const {BaseLastGameChecker} = require("./baseSeriesChecking");
const config = require("../config.js").common;

class LastGameTotalChecker extends BaseLastGameChecker {
    get notificationText() {
        return  `до ${config.watchTotalCountToSec} секунды сумма голов ${config.watchTotalCount}`;
    }
    static checkGameCondition(game) {
        return (game.timerSeconds < config.watchTotalCountToSec)
            && (game.total === config.watchTotalCount);
    }
}

exports.LastGameTotalChecker = LastGameTotalChecker;
