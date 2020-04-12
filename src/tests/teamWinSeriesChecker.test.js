const {describe, it} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {Team1WinChecker, Team2WinChecker} = require("../seriesChecking/teamWinSeriesChecker");

config.watchTeamWinSeries = 6;

describe("Team1WinChecker", () => {

    const gameTester = new GameTester(Team1WinChecker);

    it("несколько игр без 5 серий побед", () => {
        gameTester.push({scores: ['4:10']});
        gameTester.push({scores: ['3:5']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['1:0']});
        gameTester.push({scores: ['0:4']});
        gameTester.push({scores: ['2:1']});
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
    it("пустое оповещение т.к. в в конфиге задана минимальная серия в 6 побед", () => {
        gameTester.assertNotificationText('');
    });
    it("добавили 6ю победу, есть оповещение", () => {
        gameTester.push({scores: ['5:4']});
        gameTester.assertNotificationText('1 команда - победная серия 6 матчей');
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
        gameTester.push({scores: ['0:4']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['0:1']});
        gameTester.assertSeqCountEquals(11);
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('2 команда - победная серия 11 матчей');
    });
    it('оборвали серию в конце', () => {
        gameTester.push({scores: ['6:8']});
        gameTester.push({scores: ['6:5']});
        gameTester.push({scores: ['1:1']});
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['1:4']});
        gameTester.push({scores: ['2:5']});
        gameTester.push({scores: ['6:0']});
        gameTester.assertSeqCountEquals(0);
    });
});
