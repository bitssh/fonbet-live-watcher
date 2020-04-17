const {GameMap} = require("../game");
const {football} = require("../config");
const assert = require("assert");

class GameTester {

    constructor(checkerClass) {
        this.cachedGames = new GameMap();
        this.checkerClass = checkerClass;
    }
    get gamesArray() {
        return Array.from(this.cachedGames.values());
    }
    push(game) {
        const result = this.cachedGames.newGame(this.cachedGames.size);
        result.sportId = game.sportId || football.sportId;
        result.scores = game.scores;
        result.eventName = game.eventName;
        result.timerSeconds = game.timerSeconds;
        return result;
    }
    calcSeqCount() {
        let checker = this.createChecker();
        return checker.calcSeqCount(checker.games);
    }
    assertSeqCountEquals(count) {
        assert.equal(this.calcSeqCount(), count);
    }
    assertSeqCountDeepEquals(object) {
        assert.deepEqual(this.calcSeqCount(), object);
    }
    assertNotificationText(text) {
        let checker = this.createChecker();
        let notificationText = checker.checkCondition() ? checker.notificationText : '';
        assert.equal(notificationText, text);
    }
    createChecker() {
        let checker = new this.checkerClass(this.gamesArray);

        // BaseEachGameSeriesChecker classes removes last game
        // so we need to forcibly push last game duplicate to achieve the same game count
        if (checker.games.length === this.gamesArray.length - 1) {
            const lastNewGame = this.cachedGames.lastGame;
            lastNewGame.isNew = () => true;
            checker = new this.checkerClass([...this.gamesArray, lastNewGame]);
        }
        return checker;
    }
}

exports.GameTester = GameTester;
