const {describe, it} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {TotalMoreThanChecker, TotalLessThanChecker} = require("../seriesChecking/totalSeriesCheckers");

config.watchTotalSeqCount = 3;
config.watchTotalSeqLessThan = 7.5;

describe("TotalMoreThanChecker", function () {
    const gameTester = new GameTester(TotalMoreThanChecker);

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
    it("в следующей игре тотал меньше 7.5 - результат 0", () => {
        gameTester.push({scores: ['3:4']});
        gameTester.assertSeqCountEquals(0);
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('тотал больше 7.5 в 0 матчах подряд');
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
