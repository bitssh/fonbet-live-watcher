const {GameMap} = require("../game");
const {watchSportsIds} = require("../config");
const assert = require("assert");

class GameTester {

    /**
     *
     * @param checkerClass
     */
    constructor(checkerClass) {
        this.cachedGames = new GameMap();
        this.checkerClass = checkerClass;
    }
    get gamesArray() {
        return Array.from(this.cachedGames.values());
    }
    push(game) {
        const result = this.cachedGames.newGame(this.cachedGames.size);
        result.sportId = game.sportId || watchSportsIds.football;
        result.scores = game.scores;
        result.matchName = game.matchName;
        result.timerSeconds = game.timerSeconds;
        return result;
    }
    calcSeqCount() {
        return this.checkerClass.calcSeqCount(this.gamesArray);
    }
    assertSeqCountEquals(count) {
        assert.equal(this.calcSeqCount(), count);
    }
    assertSeqCountDeepEquals(object) {
        assert.deepEqual(this.calcSeqCount(), object);
    }
    assertNotificationText(text) {
        assert.equal(this.createChecker().notificationText, text);
    }
    createChecker() {
        let result = new this.checkerClass(this.gamesArray);

        // BaseEachGameSeriesChecker classes removes last game
        // so we need to forcibly push last game duplicate to achieve the same game count
        if (result.games.length === this.gamesArray.length - 1) {
            result = new this.checkerClass([...this.gamesArray, this.cachedGames.lastGame]);
        }
        return result;
    }
}

exports.GameTester = GameTester;
