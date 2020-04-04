const {describe, it} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {LastGameTotalChecker} = require("../seriesChecking/LastGameTotalChecker");

config.watchTotalCount = 8;
config.watchTotalCountToSec = 200;

describe("LastGameTotalChecker", function () {
    let game;

    const gameTester = new GameTester(LastGameTotalChecker);

    it("новая игра", () => {
        game = gameTester.push({scores: []});
        gameTester.checkCountAssert(0);
    });
    it("первый гол", () => {
        game.scores.push('0:1');
        game.timerSeconds = 10;
        gameTester.checkCountAssert(0);
    });
    it("тотал = 7 до 200 секунды", () => {
        game.scores.push('6:1');
        game.timerSeconds = 190;
        gameTester.checkCountAssert(0);
    });
    it("тотал = 8 до 200 секунды, триггер срабатывает", () => {
        game.scores.push('6:2');
        game.timerSeconds = 190;
        gameTester.checkCountAssert(1);
    });
    it("увеличиваем время гола, триггер не срабатывает", () => {
        game.timerSeconds = 210;
        gameTester.checkCountAssert(0);
    });
});
