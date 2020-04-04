const {GameMap} = require("../game");
const {watchSportsIds} = require("../config");
const assert = require("assert");

class GameTester {

    constructor (checker) {
        this.cachedGames = new GameMap();
        this.checker = checker;
    }

    push(game, sportId = watchSportsIds.football) {
        const result = this.cachedGames.newGame(this.cachedGames.size);
        result.sportId = sportId;
        result.scores = game.scores;
        result.timerSeconds = game.timerSeconds;
        return result;
    }
    assertSeqCountEquals (count) {
        assert.equal(this.calcSeqCount(), count);
    };

    calcSeqCount () {
        return this.checker.calcSeqCount(Array.from(this.cachedGames.values()));
    }

}

exports.GameTester = GameTester;
