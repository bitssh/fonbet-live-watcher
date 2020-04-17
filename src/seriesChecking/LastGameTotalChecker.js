const {BaseLastGameChecker} = require("./baseSeriesChecking");

class LastGameTotalChecker extends BaseLastGameChecker {
    get notificationText() {
        return  `до ${this.config.totalCountToSec} секунды сумма голов ${this.config.totalCount}`;
    }
    checkGameCondition(game) {
        return (game.timerSeconds < this.config.totalCountToSec)
            && (game.total === this.config.totalCount);
    }
}

exports.LastGameTotalChecker = LastGameTotalChecker;
