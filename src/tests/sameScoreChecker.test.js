const assert = require("assert");

const {describe, it, before, after} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {SameScoreChecker,} = require("../seriesChecking/SameScoreChecker");
const {BaseGameSeriesChecker} = require("../seriesChecking/baseSeriesChecking");
const {checkConditionsAndSendNotifications} = require("../liveWatcher");
const {watchSportsIds} = require("../config");

describe("SameScoreChecker", () => {

    const gameTester = new GameTester(SameScoreChecker);
    let game;
    config.watchScoreSeq = [];
    it("1 игра, результат = 1", () => {
        gameTester.push({scores: ['0:0', '0:1', '0:2']});
        gameTester.assertSeqCountDeepEquals({count: 1, score: '0:2'});
    });
    it("Вторая игра, результат = 1", () => {
        game = gameTester.push({scores: ['0:1']});
        gameTester.assertSeqCountDeepEquals({count: 1, score: '0:1'});
    });
    it("Задали значения watchScoreSeq, результат = 2", () => {
        config.watchScoreSeq = ['5:5', '1:0', '6:6'];
        gameTester.assertSeqCountDeepEquals({count: 2, score: '0:1'});
    });
    it("Последний гол поломал последовательность, результат = 1", () => {
        game.scores.push('0:1');
        game.scores.push('1:1');
        gameTester.assertSeqCountDeepEquals({count: 1, score: '1:1'});
    });
    it("Третья игра, 3 серии из 0:1", () => {
        game = gameTester.push({scores: ['1:0']});
        gameTester.assertSeqCountDeepEquals({count: 3, score: '1:0'});
    });
    it("проверка текста оповещения", () => {
        gameTester.assertNotificationText('серия из 3 матчей 1:0');
    });
});

describe("sendNotifications.notifyAboutScoreSeq", function () {

    // FIXME переписать вот это всё это
    const gameTester = new GameTester(SameScoreChecker);
    let notifications = [];
    let sendNotificationFuncBackup;
    before(() => {
        sendNotificationFuncBackup = BaseGameSeriesChecker.prototype.sendNotification;
        BaseGameSeriesChecker.prototype.sendNotification = function () {
            notifications.push(this);
        };
        config.watchScoreSeq = [];
        config.watchScoreSeqCount = 3;
    });
    after(() => {
        BaseGameSeriesChecker.prototype.sendNotification = sendNotificationFuncBackup;
    });
    it("3 серии и не задан массив очков", () => {
        gameTester.push({scores: ['4:4']});
        gameTester.push({scores: ['5:5']});
        gameTester.push({scores: ['5:5']});
        gameTester.push({scores: ['5:5']});
        checkConditionsAndSendNotifications(gameTester.cachedGames);
        assert.equal(notifications.length, 0);
    });
    it("3 серии и задан массив очков", () => {
        notifications = [];
        config.watchScoreSeq = ['4:4'];
        checkConditionsAndSendNotifications(gameTester.cachedGames);
        assert.equal(notifications.length, 0);
        config.watchScoreSeq = ['4:4', '5:5', '6:6'];
        checkConditionsAndSendNotifications(gameTester.cachedGames);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 3, score: '5:5'});
    });
    it("добавили матч - 4 серии", () => {
        notifications = [];
        gameTester.push({scores: ['5:5']});
        checkConditionsAndSendNotifications(gameTester.cachedGames,);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 4, score: '5:5'});

    });
    it("добавили 2 матча с хоккеем - оповещений нет", () => {
        notifications = [];
        gameTester.push({scores: ['5:5'], sportId: watchSportsIds.hockey});
        gameTester.push({scores: ['5:5'], sportId: watchSportsIds.hockey});
        checkConditionsAndSendNotifications(gameTester.cachedGames);
        assert.equal(notifications.length, 0);

    });
    it("изменили 2 последних матча на футбол - продолжили серию до 6", () => {
        notifications = [];
        gameTester.gamesArray[5].sportId = watchSportsIds.football;
        gameTester.gamesArray[6].sportId = watchSportsIds.football;
        checkConditionsAndSendNotifications(gameTester.cachedGames, [SameScoreChecker]);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 6, score: '5:5'});
    });
    it("изменили очки 3 матча с конца- оборвали серию", () => {
        notifications = [];
        gameTester.gamesArray[4].scores = ['5:1'];
        checkConditionsAndSendNotifications(gameTester.cachedGames, [SameScoreChecker]);
        assert.equal(notifications.length, 0);
    });
});

