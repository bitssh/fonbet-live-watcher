const {describe, it} = require("mocha");
const {football} = require("../config");
const {GameTester} = require("./testTools.js");
const {Team1ScoreLessThanChecker, Team2ScoreGreaterThanChecker} = require("../seriesChecking/teamTotalSeriesCheckers");

football.teamTotalSeries = 5;
football.teamTotalLessThan = 3.5;
football.teamTotalGreaterThan = 6.5;

describe("Team1ScoreLessThanChecker", () => {

    const gameTester = new GameTester(Team1ScoreLessThanChecker);

    it("тотал меньше 3.5 максимум в двух играх подряд - результат 0 ", () => {
        gameTester.push({scores: ['0:10']});
        gameTester.push({scores: ['3:5']});
        gameTester.push({scores: ['4:0']});
        gameTester.assertSeqCountEquals(0);
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['11:0']});
        gameTester.assertSeqCountEquals(0);
    });
    it("все игры тоталом меньше 3.5, результат 4", () => {
        gameTester.push({scores: ['0:7']});
        gameTester.push({scores: ['2:5']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['3:4']});
        gameTester.assertSeqCountEquals(4);
    });
    it("проверка несрабатывания оповещения", () => {
        gameTester.assertNotificationText('');
    });
    it("проверка текста оповещения", () => {
        football.teamTotalSeries = 4;
        gameTester.assertNotificationText('Красные - тотал меньше 3.5 в 4 матчах подряд');
    });
    it("в следующей игре тотал больше 3.5 - результат 0", () => {
        gameTester.push({scores: ['4:4']});
        gameTester.assertSeqCountEquals(0);
    });
});

describe("Team2ScoreGreaterThanChecker", () => {

    const gameTester = new GameTester(Team2ScoreGreaterThanChecker);

    it("все игры тоталом больше 6.5, результат 4", () => {
        gameTester.push({scores: ['0:7']});
        gameTester.push({scores: ['2:8']});
        gameTester.push({scores: ['0:9']});
        gameTester.push({scores: ['3:13']});
        gameTester.assertSeqCountEquals(4);
    });
    it("тотал больше 6.5 максимум в двух играх подряд - результат 0 ", () => {
        gameTester.push({scores: ['7:10']});
        gameTester.push({scores: ['4:7']});
        gameTester.push({scores: ['0:3']});
        gameTester.assertSeqCountEquals(0);
        gameTester.push({scores: ['11:11']});
        gameTester.push({scores: ['11:11']});
        gameTester.push({scores: ['20:6']});
        gameTester.assertSeqCountEquals(0);
    });
    it("тотал больше 6.5 в трех играх подряд - результат 3", () => {
        gameTester.push({scores: ['7:10']});
        gameTester.push({scores: ['12:7']});
        gameTester.push({scores: ['4:7']});
        gameTester.assertSeqCountEquals(3);
    });
    it("проверка несрабатывания оповещения", () => {
        gameTester.assertNotificationText('');
    });
    it("проверка текста оповещения", () => {
        football.teamTotalSeries = 3;
        gameTester.assertNotificationText('Зеленые - тотал больше 6.5 в 3 матчах подряд');
    });
    it("в следующей игре тотал меньше 6.5 - результат 0", () => {
        gameTester.push({scores: ['3:6']});
        gameTester.assertSeqCountEquals(0);
    });
});
