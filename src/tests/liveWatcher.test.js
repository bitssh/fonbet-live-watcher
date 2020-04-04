const liveWatcherModule = require("../liveWatcher.js");
const liveWatcher = liveWatcherModule.liveWatcher;
const {describe, it, before} = require("mocha");
const assert = require("assert");
const config = require("../config.js").common;
const {BaseGameSeriesChecker} = require("../seriesChecking/baseSeriesChecking");
const {checkConditionsAndSendNotifications} = require("../liveWatcher");
const {hasScore} = require("../seriesChecking/SameScoreChecker");
const cachedGames = liveWatcher.gameFetcher.cachedGames;

it("граббинг тестовых данных", function () {
    cachedGames.clear();
    config.fileWritingEnabled = false;
    config.useDummyUrl = true;
    liveWatcher.grabUpdates();
    liveWatcher.grabUpdates();
    liveWatcher.grabUpdates();
    assert.equal(cachedGames.get(16156082).score, '3:0');
    assert.equal(cachedGames.get(16156082).miscs.timerSeconds, 129);
});

it("удаление первой половины игр", function () {
    cachedGames.clear();
    for (let i = 0; i < 7; i += 1) {
        cachedGames.set(i, null);
    }
    assert.equal(cachedGames.size, 7);
    liveWatcher.gameFetcher.shrinkCache();
    assert.equal(cachedGames.size, 4);
    assert.equal(cachedGames.keys().next().value, 3);
    liveWatcher.gameFetcher.shrinkCache();
    assert.equal(cachedGames.size, 2);
    assert.equal(cachedGames.keys().next().value, 5);
});

it("проверяет вхождение счета в массиве счетов", () => {
    assert.equal(hasScore(['0:1', '0:2'], '0:2'), true);
    assert.equal(hasScore(['0:1', '0:2'], '2:0'), true);
    assert.equal(hasScore(['0:1', '0:2'], '1:1'), false);
    assert.equal(hasScore([], '1:1'), false);
});


describe("sendNotifications.notifyAboutNoGoals", function () {
    config.watchNoGoalsCount = 3;
    config.watchNoGoalsFromSec = 270;
    cachedGames.clear();
    const noGoalGame = {timerSeconds: 1, isNew: () => false};
    const goalGame = {timerSeconds: 270, isNew: () => false};
    const newGame = {scores: ['0:0'], isNew: () => true};
    let notifications = [];

    before(() => {
        BaseGameSeriesChecker.prototype.sendNotification = function () {
            notifications.push(this);
        };
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
        notifications = [];
    });
    it("делаем 2й матч с голом, в итоге 3 матчей без голов и новый матч - оповещение", () => {
        notifications = [];

        cachedGames.set(1, goalGame);
        checkConditionsAndSendNotifications(cachedGames, newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 3);
    });
});
