const {GameMap} = require("../game");
const {watchSportsIds} = require("../config");
const assert = require("assert");

class GameTester {

    /**
     *
     * @param checkerClass
     */
    constructor (checkerClass) {
        this.cachedGames = new GameMap();
        this.checkerClass = checkerClass;
        this.checker = new checkerClass([]);
    }

    push(game, sportId = watchSportsIds.football) {
        const result = this.cachedGames.newGame(this.cachedGames.size);
        result.sportId = sportId;
        result.scores = game.scores;
        result.timerSeconds = game.timerSeconds;
        this.checker.games.push(result);
        return result;
    }
    calcSeqCount () {
        return this.checkerClass.calcSeqCount(Array.from(this.cachedGames.values()));
    }
    assertSeqCountEquals (count) {
        assert.equal(this.calcSeqCount(), count);
    }
    assertSeqCountDeepEquals (object) {
        assert.deepEqual(this.calcSeqCount(), object);
    }
    assertNotificationText(text) {
        assert.equal(this.checker.notificationText, text);
    }


}

exports.GameTester = GameTester;
