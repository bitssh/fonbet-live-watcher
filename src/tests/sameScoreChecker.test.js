const assert = require("assert");

const {describe, it, before} = require("mocha");
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
    const gameTester = new GameTester(SameScoreChecker);
    let notifications = [];
    const game = gameTester.push({scores: ['4:4']});
    before(() => {
        BaseGameSeriesChecker.prototype.sendNotification = function () {
            notifications.push(this);
        };
        config.watchScoreSeq = [];
        config.watchScoreSeqCount = 3;
    });
    it("3 серии и не задан массив очков", () => {

        gameTester.push({scores: ['4:4']});
        gameTester.push({scores: ['5:5']});
        gameTester.push({scores: ['5:5']});
        gameTester.push({scores: ['5:5']});
        checkConditionsAndSendNotifications(gameTester.cachedGames, game);
        assert.equal(notifications.length, 0);
    });
    it("3 серии и задан массив очков", () => {
        notifications = [];
        config.watchScoreSeq = ['4:4'];
        checkConditionsAndSendNotifications(gameTester.cachedGames, game);
        assert.equal(notifications.length, 0);
        config.watchScoreSeq = ['4:4', '5:5', '6:6'];
        checkConditionsAndSendNotifications(gameTester.cachedGames, game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 3, score: '5:5'});
    });
    it("добавили матч - 4 серии", () => {
        notifications = [];
        gameTester.push({scores: ['5:5']});
        checkConditionsAndSendNotifications(gameTester.cachedGames, game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 4, score: '5:5'});

    });
    it("добавили 2 матча с другим типом игры - также 4 серии", () => {
        notifications = [];
        gameTester.push({scores: ['5:5']}, watchSportsIds.hockey);
        gameTester.push({scores: ['5:5']}, watchSportsIds.hockey);
        checkConditionsAndSendNotifications(gameTester.cachedGames, game);
        assert.deepEqual(notifications[0].seqCount, {count: 4, score: '5:5'});

    });
    it("изменили 2 последних матча на футбол - оборвали серию", () => {
        notifications = [];
        gameTester.cachedGames.set(6, {scores: ['4:4'], sportId: watchSportsIds.football});
        gameTester.cachedGames.set(7, {scores: ['4:4'], sportId: watchSportsIds.football});
        checkConditionsAndSendNotifications(gameTester.cachedGames, game);
        assert.equal(notifications.length, 0);

    });
});

