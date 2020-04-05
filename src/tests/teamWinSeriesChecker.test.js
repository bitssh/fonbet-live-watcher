const {describe, it} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {Team1WinChecker, Team2WinChecker} = require("../seriesChecking/teamWinSeriesChecker");

config.watchTeamWinSeries = 5;

describe("Team1WinChecker", () => {

    const gameTester = new GameTester(Team1WinChecker);

    it("несколько игр без 5 серий побед", () => {
        gameTester.push({scores: ['4:10']});
        gameTester.push({scores: ['3:5']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['1:0']});
        gameTester.push({scores: ['0:4']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['0:1']});
        gameTester.assertSeqCountEquals(0);
    });
    it("5 серий побед", () => {
        gameTester.push({scores: ['6:0']});
        gameTester.push({scores: ['6:5']});
        gameTester.push({scores: ['1:1']});
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['1:0']});
        gameTester.push({scores: ['2:0']});
        gameTester.push({scores: ['5:4']});
        gameTester.assertSeqCountEquals(5);
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('1 команда - победная серия 5 матчей');
    });
});

describe("Team2WinChecker", () => {

    const gameTester = new GameTester(Team2WinChecker);

    it("7 серий побед", () => {
        gameTester.push({scores: ['4:10']});
        gameTester.push({scores: ['3:5']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['1:1']});
        gameTester.push({scores: ['0:4']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['0:1']});
        gameTester.assertSeqCountEquals(7);
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('2 команда - победная серия 7 матчей');
    });
    it('оборвали серию', () => {
        gameTester.push({scores: ['6:0']});
        gameTester.push({scores: ['6:5']});
        gameTester.push({scores: ['1:1']});
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['1:0']});
        gameTester.push({scores: ['2:0']});
        gameTester.push({scores: ['5:4']});
        gameTester.assertSeqCountEquals(0);
    });
});
