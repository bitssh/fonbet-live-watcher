const {describe, it, before, after} = require("mocha");
const {liveWatcher} = require("../liveWatcher.js");
const assert = require("assert");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {NoGoalSeriesChecker, GoalSeriesChecker} = require("../seriesChecking/goalSeriesCheckers");
const {BaseGameSeriesChecker} = require("../seriesChecking/baseSeriesChecking");
const {checkConditionsAndSendNotifications} = require("../liveWatcher");

const cachedGames = liveWatcher.gameFetcher.cachedGames;

describe("NoGoalSeriesChecker", function () {
    const gameTester = new GameTester(NoGoalSeriesChecker);

    before(() => {
        config.watchNoGoalsCount = 3;
        config.watchNoGoalsFromSec = 250;
    });
    it("нет игр - 0 игр без голов", () => {
        gameTester.assertSeqCountEquals(0);
    });
    it("две игры без голов", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 100});
        gameTester.push({scores: ['0:0', '4:4'], timerSeconds: 200});
        gameTester.assertSeqCountEquals(2);
    });
    it("в последней игре был гол вконце  - значит 0 последних игр без голов", () => {
        gameTester.push({scores: ['0:0', '5:5'], timerSeconds: 300});
        gameTester.assertSeqCountEquals(0);
    });
    it("в последней игре был гол, но не вконце - значит 1 последняя игра без голов", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 249});
        gameTester.assertSeqCountEquals(1);
    });
    it("гол в конце игры и последующие 3 игры без голов", () => {
        gameTester.push({scores: ['0:0', '4:4'], timerSeconds: 300});
        gameTester.push({scores: ['5:5'], timerSeconds: 1});
        gameTester.push({scores: ['5:5'], timerSeconds: 1});
        gameTester.push({scores: ['5:5'], timerSeconds: 1});
        gameTester.assertSeqCountEquals(3);
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('нет голов в 3 матчах с 250 секунды');
    });

});


describe("GoalSeriesChecker", function () {
    const gameTester = new GameTester(GoalSeriesChecker);

    before(() => {
        config.watchGoalsCount = 3;
        config.watchGoalsFromSec = 250;
    });
    it("нет игр - 0 игр с голами", () => {
        gameTester.assertSeqCountEquals(0);
    });
    it("две игры с голами", () => {

        gameTester.push({scores: ['4:4'], timerSeconds: 290});
        gameTester.push({scores: ['4:4'], timerSeconds: 250});
        gameTester.assertSeqCountEquals(2);
    });
    it("в последней игре не было гола  - значит 0 последних игр с голами", () => {
        gameTester.push({scores: ['5:5'], timerSeconds: 200});
        gameTester.assertSeqCountEquals(0);
    });
    it("в последней игре был гол в конце - значит 1 последняя игра с голами", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 252});
        gameTester.assertSeqCountEquals(1);
    });
    it("1 игра без голов и последующие 3 игры с голами", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 1});
        gameTester.push({scores: ['5:5'], timerSeconds: 250});
        gameTester.push({scores: ['5:5'], timerSeconds: 300});
        gameTester.push({scores: ['5:5'], timerSeconds: 300});
        gameTester.assertSeqCountEquals(3);
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('голы в 3 матчах с 250 секунды');
    });
});



describe("sendNotifications.notifyAboutNoGoals", function () {
    cachedGames.clear();
    const noGoalGame = {timerSeconds: 1, isNew: () => false};
    const goalGame = {timerSeconds: 270, isNew: () => false};
    const newGame = {scores: ['0:0'], isNew: () => true};
    let notifications = [];
    let sendNotificationFuncBackup;
    before(() => {
        config.watchNoGoalsCount = 3;
        config.watchNoGoalsFromSec = 270;

        sendNotificationFuncBackup = BaseGameSeriesChecker.prototype.sendNotification;
        BaseGameSeriesChecker.prototype.sendNotification = function () {
            notifications.push(this);
        };
    });
    after(() => {
        BaseGameSeriesChecker.prototype.sendNotification = sendNotificationFuncBackup;
    });

    it("2 матча без голов - без оповещений", () => {
        cachedGames.clear();
        cachedGames.set(0, noGoalGame);
        cachedGames.set(1, noGoalGame);
        checkConditionsAndSendNotifications(cachedGames, noGoalGame);
        assert.equal(notifications.length, 0);
    });
    it("новый матч - без оповещений", () => {
        cachedGames.set(2, newGame);
        checkConditionsAndSendNotifications(cachedGames, newGame);
        assert.equal(notifications.length, 0);
    });
    it("3 матча без голов и новый матч - оповещение", () => {
        cachedGames.set(2, noGoalGame);
        cachedGames.set(3, newGame);
        //console.log(newGame);
        checkConditionsAndSendNotifications(cachedGames, newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 3);
    });
    it("проверка текста оповещения о серии без голов", () => {
        assert.equal(notifications[0].notificationText, 'нет голов в 3 матчах с 270 секунды');
    });
    it("повторный новый матч - нет новых оповещений", () => {
        notifications = [];
        cachedGames.set(4, newGame);
        checkConditionsAndSendNotifications(cachedGames, newGame);
        assert.equal(notifications.length, 0);
    });
    it("5 матчей без голов и новый матч - оповещение", () => {
        cachedGames.set(3, noGoalGame);
        cachedGames.set(4, noGoalGame);
        cachedGames.set(5, newGame);
        checkConditionsAndSendNotifications(cachedGames, newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 5);
    });
    it("делаем 2й матч с голом, в итоге 3 матчей без голов и новый матч - оповещение", () => {
        notifications = [];

        cachedGames.set(1, goalGame);
        checkConditionsAndSendNotifications(cachedGames, newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 3);
    });
});
