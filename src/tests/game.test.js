const {Game} = require("../game");
const {describe, it} = require("mocha");
const assert = require("assert");

describe("Game", () => {

    const game = new Game();

    it("добавили 3 scores", () => {
        game.addScore('0:0');
        game.addScore('0:1');
        game.addScore('0:2');
        assert.deepEqual(game.scores.length, 3);
        assert.deepEqual(game.score, [0, 2]);
    });

    it("заменили второй score, всего 2 scores", () => {
        game.addScore('1:0');
        assert.equal(game.scores.length, 2);
    });

    it("заменили все scores тремя новыми", () => {
        game.addScore('0:0');
        game.addScore('0:1');
        game.addScore('1:1');
        assert.equal(game.scores.length, 3);
        assert.deepEqual(game.score, [1, 1]);
        assert.deepEqual(game.scores[1], [0, 1]);

    });



});
