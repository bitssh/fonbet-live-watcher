const {describe, it} = require("mocha");
const {GameTester} = require("./testTools.js");
const {football} = require("../config");
const {LastGameTotalChecker} = require("../seriesChecking/LastGameTotalChecker");

football.totalCount = 8;
football.totalCountToSec = 200;

describe("LastGameTotalChecker", function () {
    let game;

    const gameTester = new GameTester(LastGameTotalChecker);

    it("новая игра", () => {
        game = gameTester.push({scores: []});
        gameTester.assertSeqCountEquals(0);
    });
    it("первый гол", () => {
        game.addScore('0:1');
        game.timerSeconds = 10;
        gameTester.assertSeqCountEquals(0);
    });
    it("тотал = 7 до 200 секунды", () => {
        game.addScore('6:1');
        game.timerSeconds = 190;
        gameTester.assertSeqCountEquals(0);
    });
    it("тотал = 8 до 200 секунды, триггер срабатывает", () => {
        game.addScore('6:2');
        game.timerSeconds = 190;
        gameTester.assertSeqCountEquals(1);
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('до 200 секунды сумма голов 8');
    });
    it("увеличиваем время гола, триггер не срабатывает", () => {
        game.timerSeconds = 210;
        gameTester.assertSeqCountEquals(0);
    });
});
