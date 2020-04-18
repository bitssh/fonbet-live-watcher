const {Team2FirstGoalSeriesChecker} = require("../seriesChecking/FirstGoalSeriesChecker");
const {Team1FirstGoalSeriesChecker} = require("../seriesChecking/FirstGoalSeriesChecker");
const {describe, it} = require("mocha");
const {customConfig} = require("../config");
const {GameTester} = require("./testTools.js");

customConfig.teamFirstGoalSeries = 4;

describe("Team2FirstGoalSeriesChecker", () => {

    const gameTester = new GameTester(Team2FirstGoalSeriesChecker);

    it("несколько игр без серий первых голов", () => {
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['0:1', '1:1', '1:2']});
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['1:0', '1:1', '2:1']});
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['0:1', '1:1', '1:2']});
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['1:0', '0:2', '1:2']});
        gameTester.assertSeqCountEquals(0);
    });
    it("3 серии", () => {
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['0:1', '1:1', '1:2']});
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.assertSeqCountEquals(3);
    });
    it("оповещений нет", () => {
        gameTester.assertNotificationText('');
    });
    it("4 серии - есть оповещение", () => {
        gameTester.push({scores: ['0:1']});
        gameTester.assertNotificationText('Зеленые - первый гол в 4 матчах');
    });
    it("увеличили число в конфиге - оповещений нет", () => {
        customConfig.teamFirstGoalSeries = 5;
        gameTester.assertNotificationText('');
    });
    it("5 серий, но не первый гол - оповещений нет", () => {
        gameTester.push({scores: ['0:1', '0:2']});
        gameTester.assertSeqCountEquals(5);
        gameTester.assertNotificationText('');
    });
});

describe("Team1FirstGoalSeriesChecker", () => {

    const gameTester = new GameTester(Team1FirstGoalSeriesChecker);
    customConfig.teamFirstGoalSeries = 4;

    it("несколько игр, серия из 1 матча", () => {
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['0:1', '1:1', '1:2']});
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['1:0', '1:1', '2:1']});
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['0:1', '1:1', '1:2']});
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['1:0', '0:2', '1:2']});
        gameTester.assertSeqCountEquals(1);
    });
    it("0 серий", () => {
        gameTester.push({scores: ['0:1', '0:2', '1:2']});
        gameTester.push({scores: ['0:1', '1:1', '1:2']});
        gameTester.assertSeqCountEquals(0);
    });
    it("4 серии - есть оповещение", () => {
        customConfig.teamFirstGoalSeries = 4;
        gameTester.push({scores: ['1:0', '0:2', '1:2']});
        gameTester.push({scores: ['1:0', '0:2', '1:2']});
        gameTester.push({scores: ['1:0', '0:2', '1:2']});
        gameTester.push({scores: ['1:0']});
        gameTester.assertNotificationText('Красные - первый гол в 4 матчах');
    });



});
