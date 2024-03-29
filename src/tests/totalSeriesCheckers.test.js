const {describe, it} = require("mocha");
const {football} = require("../config");
const {GameTester} = require("./testTools.js");
const {TotalGreaterThanChecker, TotalLessThanChecker} = require("../seriesChecking/totalSeriesCheckers");

football.totalSeries = 6;
football.totalLessThan = 7.5;
football.totalGreaterThan = 7.5;

describe("TotalGreaterThanChecker", function () {
    const gameTester = new GameTester(TotalGreaterThanChecker);

    it("все игры с тоталом меньше 7, результат 0", () => {
        gameTester.push({scores: ['0:7']});
        gameTester.push({scores: ['2:5']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['3:4']});
        gameTester.assertSeqCountEquals(0);
    });
    it("тотал больше 7.5 максимум в двух играх подряд - результат 0 ", () => {
        gameTester.push({scores: ['7:10']});
        gameTester.push({scores: ['12:5']});
        gameTester.push({scores: ['0:7']});
        gameTester.assertSeqCountEquals(0);
        gameTester.push({scores: ['11:11']});
        gameTester.push({scores: ['11:11']});
        gameTester.push({scores: ['0:0']});
        gameTester.assertSeqCountEquals(0);
    });
    it("тотал больше 7.5 в трех играх подряд - результат 3", () => {
        gameTester.push({scores: ['7:10']});
        gameTester.push({scores: ['12:5']});
        gameTester.push({scores: ['1:7']});
        gameTester.assertSeqCountEquals(3);
    });
    it("тотал больше 7.5 ещё в двух играх подряд - результат 5", () => {
        gameTester.push({scores: ['10:10']});
        gameTester.push({scores: ['11:11']});
        gameTester.assertSeqCountEquals(5);
    });
        it("проверка пустого оповещения", () => {
        gameTester.assertNotificationText('');
    });
    it("проверка текста оповещения", () => {
        football.totalSeries = 4;
        gameTester.assertNotificationText('тотал больше 7.5 в 5 матчах подряд');
    });
    it("в следующей игре тотал меньше 7.5 - результат 0", () => {
        gameTester.push({scores: ['3:4']});
        gameTester.assertSeqCountEquals(0);
    });
});

describe("Team1ScoreLessThanChecker", () => {
    const gameTester = new GameTester(TotalLessThanChecker);

    it("все игры с тоталом больше 7.5, результат 0", () => {
        gameTester.push({scores: ['11:7']});
        gameTester.push({scores: ['3:5']});
        gameTester.push({scores: ['6:2']});
        gameTester.push({scores: ['4:4']});
        gameTester.assertSeqCountEquals(0);
    });
    it("тотал меньше 7.5 максимум в двух играх подряд - результат 0 ", () => {
        gameTester.push({scores: ['1:0']});
        gameTester.push({scores: ['0:5']});
        gameTester.push({scores: ['0:8']});
        gameTester.assertSeqCountEquals(0);
        gameTester.push({scores: ['3:4']});
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['11:11']});
        gameTester.assertSeqCountEquals(0);
    });
    it("тотал меньше 7.5 в трех играх подряд - результат 3", () => {
        gameTester.push({scores: ['6:1']});
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['1:1']});
        gameTester.assertSeqCountEquals(3);
    });
    it("в следующей игре тотал больше 7.5 - результат 0", () => {
        gameTester.push({scores: ['4:4']});
        gameTester.assertSeqCountEquals(0);
    });
});
