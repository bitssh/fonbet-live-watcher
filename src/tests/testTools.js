const {GameMap} = require("../game");
const {watchSportsIds} = require("../config");
const assert = require("assert");

const checkGameCountAssert = (checker, gameTester, value) => {
    assert.equal(checker.calcSeqCount(Array.from(gameTester.cachedGames.values())), value);
};

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
    checkCountAssert (count) {
        checkGameCountAssert(this.checker, this, count);
    };

}

exports.GameTester = GameTester;
exports.checkGameCountAssert = checkGameCountAssert;
