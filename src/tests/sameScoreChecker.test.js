const assert = require("assert");

const {describe, it, before, after} = require("mocha");
const {football, hockey} = require("../config");
const {GameTester} = require("./testTools.js");
const {SameScoreChecker,} = require("../seriesChecking/SameScoreChecker");
const {BaseGameSeriesChecker} = require("../seriesChecking/baseSeriesChecking");
const {checkSeriesAndNotify} = require("../liveWatcher");

football.scoreSeries = 4;

describe("SameScoreChecker", () => {

    const gameTester = new GameTester(SameScoreChecker);
    let game;
    football.scoreSeriesValues = [];
    it("1 игра, результат = 1", () => {
        gameTester.push({scores: ['0:0', '0:1', '0:2']});
        gameTester.assertSeqCountDeepEquals({count: 1, score: '0:2'});
    });
    it("Вторая игра, результат = 1", () => {
        game = gameTester.push({scores: ['0:1']});
        gameTester.assertSeqCountDeepEquals({count: 1, score: '0:1'});
    });
    it("Задали значения scoreSeriesValues, результат = 2", () => {
        football.scoreSeriesValues = ['5:5', '1:0', '6:6'];
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
        gameTester.assertNotificationText('');
    });
    it("проверка текста оповещения с актуальным значением в конфиге", () => {
        football.scoreSeries = 3;
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
        football.scoreSeriesValues = [];
        football.scoreSeries = 3;
    });
    after(() => {
        BaseGameSeriesChecker.prototype.sendNotification = sendNotificationFuncBackup;
    });
    it("3 серии и не задан массив очков", () => {
        gameTester.push({scores: ['4:4']});
        gameTester.push({scores: ['5:5']});
        gameTester.push({scores: ['5:5']});
        gameTester.push({scores: ['5:5']});
        checkSeriesAndNotify(gameTester.cachedGames.games);
        assert.equal(notifications.length, 0);
    });
    it("3 серии и задан массив очков", () => {
        notifications = [];
        football.scoreSeriesValues = ['4:4'];
        checkSeriesAndNotify(gameTester.cachedGames.games);
        assert.equal(notifications.length, 0);
        football.scoreSeriesValues = ['4:4', '5:5', '6:6'];
        checkSeriesAndNotify(gameTester.cachedGames.games);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 3, score: '5:5'});
    });
    it("задали подсерию - получили 2 оповещения", () => {
        notifications = [];
        football.scoreSeriesValues2 = ['5:5'];
        checkSeriesAndNotify(gameTester.cachedGames.games);
        assert.equal(notifications.length, 2);
        football.scoreSeriesValues2 = [];
    });
    it("добавили матч - 4 серии", () => {
        notifications = [];
        gameTester.push({scores: ['5:5']});
        checkSeriesAndNotify(gameTester.cachedGames.games);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 4, score: '5:5'});

    });
    it("добавили 2 матча с хоккеем - оповещений нет", () => {
        notifications = [];
        gameTester.push({scores: ['5:5'], sportId: hockey.sportId});
        gameTester.push({scores: ['5:5'], sportId: hockey.sportId});
        checkSeriesAndNotify(gameTester.cachedGames.games);
        assert.equal(notifications.length, 0);

    });
    it("прописали для хоккея подходящие условия, есть оповещение", () => {
        notifications = [];
        hockey.scoreSeriesValues = ['5:5'];
        hockey.scoreSeries = 2;
        checkSeriesAndNotify(gameTester.cachedGames.games);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 6, score: '5:5'});

    });
    it("изменили 2 последних матча на футбол - продолжили серию до 6", () => {
        notifications = [];
        gameTester.gamesArray[5].sportId = football.sportId;
        gameTester.gamesArray[6].sportId = football.sportId;
        checkSeriesAndNotify(gameTester.cachedGames.games, [SameScoreChecker]);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 6, score: '5:5'});
    });
    it("изменили очки 3 матча с конца- оборвали серию", () => {
        notifications = [];
        gameTester.gamesArray[4].scores = ['5:1'];
        checkSeriesAndNotify(gameTester.cachedGames.games, [SameScoreChecker]);
        assert.equal(notifications.length, 0);
    });
});

