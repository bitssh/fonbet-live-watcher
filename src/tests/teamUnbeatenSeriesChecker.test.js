const {describe, it} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {Team1UnbeatenSeriesChecker, Team2UnbeatenSeriesChecker} = require("../seriesChecking/teamUnbeatenSeriesChecker");

config.watchTeamUnbeatenSeries = 7;

describe("Team1UnbeatenSeriesChecker", () => {

    const gameTester = new GameTester(Team1UnbeatenSeriesChecker);

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
    it("6 непроигрышный серий", () => {
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['6:5']});
        gameTester.push({scores: ['1:1']});
        gameTester.push({scores: ['0:0']});
        gameTester.push({scores: ['1:0']});
        gameTester.push({scores: ['2:0']});
        gameTester.push({scores: ['5:4']});
        gameTester.assertSeqCountEquals(6);
    });
    it("пустое оповещение т.к. в в конфиге задана минимальная серия в 7 побед", () => {
        gameTester.assertNotificationText('');
    });
    it("добавили 6ю победу, есть оповещение", () => {
        gameTester.push({scores: ['5:4']});
        gameTester.assertNotificationText('1 команда не проигрывает в 7 матчах');
    });
    it("добавили проигрыш, оборвали серию", () => {
        gameTester.push({scores: ['1:4']});
        gameTester.assertNotificationText('');
    });
});


describe("Team2UnbeatenSeriesChecker", () => {

    const gameTester = new GameTester(Team2UnbeatenSeriesChecker);

    it("7 серий побед", () => {
        gameTester.push({scores: ['7:1']});
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
        gameTester.assertNotificationText('2 команда не проигрывает в 11 матчах');
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
    it("проверка пустого оповещения", () => {
        gameTester.push({scores: ['3:5']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['0:1']});
        gameTester.push({scores: ['1:1']});
        gameTester.push({scores: ['0:4']});
        gameTester.push({scores: ['0:1']});
        gameTester.assertNotificationText('');
    });
});
