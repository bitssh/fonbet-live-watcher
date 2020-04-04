const liveWatcherModule = require("../liveWatcher.js");
const liveWatcher = liveWatcherModule.liveWatcher;
const {describe, it} = require("mocha");
const assert = require("assert");
const {watchSportsIds} = require("../config");
const config = require("../config.js").common;
const notifying = require('../notifying.js');
const {hasScore} = require("../seriesChecking/SameScoreChecker");
const cachedGames = liveWatcher.gameFetcher.cachedGames;

let notifications = [];
notifying.sender.sendNotification = (notification) => {
    notifications.push(notification)
};

notifying.Notifier.prototype.sendNotification = (notification) => {
    notifications.push(notification)
};

function pushGame(game, sportId = watchSportsIds.football) {
    const result = cachedGames.newGame(cachedGames.size);
    result.sportId = sportId;
    result.scores = game.scores;
    result.timerSeconds = game.timerSeconds;
    return result;
}

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
    const noGoalGame = {isFootball: true, timerSeconds: 1, isNew: () => false};
    const goalGame = {isFootball: true, timerSeconds: 270, isNew: () => false};
    const newGame = {isFootball: true, scores: ['0:0'], isNew: () => true};

    it("2 матча без голов - без оповещений", () => {
        cachedGames.clear();
        cachedGames.set(0, noGoalGame);
        cachedGames.set(1, noGoalGame);
        liveWatcher.checkSeries(noGoalGame);
        assert.equal(notifications.length, 0);
    });
    it("новый матч - без оповещений", () => {
        cachedGames.set(2, newGame);
        liveWatcher.checkSeries(newGame);
        assert.equal(notifications.length, 0);
    });
    it("3 матча без голов и новый матч - оповещение", () => {
        cachedGames.set(2, noGoalGame);
        cachedGames.set(3, newGame);
        //console.log(newGame);
        liveWatcher.checkSeries(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 3);
    });
    it("проверка текста оповещения о серии без голов", () => {
        assert.equal(notifications[0].notificationText, 'нет голов в 3 матчах с 270 секунды');
    });
    it("повторный новый матч - нет новых оповещений", () => {
        notifications = [];
        cachedGames.set(4, newGame);
        liveWatcher.checkSeries(newGame);
        assert.equal(notifications.length, 0);
    });
    it("5 матчей без голов и новый матч - оповещение", () => {
        cachedGames.set(3, noGoalGame);
        cachedGames.set(4, noGoalGame);
        cachedGames.set(5, newGame);
        liveWatcher.checkSeries(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 5);
        notifications = [];
    });
    it("делаем 2й матч с голом, в итоге 3 матчей без голов и новый матч - оповещение", () => {
        notifications = [];

        cachedGames.set(1, goalGame);
        liveWatcher.checkSeries(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 3);
    });
});

describe("sendNotifications.notifyAboutScoreSeq", function () {
    cachedGames.clear();
    notifications = [];
    config.watchScoreSeqCount = 3;
    const game = pushGame({scores: ['4:4']});
    it("3 серии и не задан массив очков", () => {
        cachedGames.clear();
        config.watchScoreSeq = [];
        config.watchScoreSeqCount = 3;
        notifications = [];

        pushGame({scores: ['4:4']});
        pushGame({scores: ['5:5']});
        pushGame({scores: ['5:5']});
        pushGame({scores: ['5:5']});
        liveWatcher.checkSeries(game);
        assert.equal(notifications.length, 0);
    });
    it("3 серии и задан массив очков", () => {
        notifications = [];
        config.watchScoreSeq = ['4:4'];
        liveWatcher.checkSeries(game);
        assert.equal(notifications.length, 0);
        config.watchScoreSeq = ['4:4', '5:5', '6:6'];
        liveWatcher.checkSeries(game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 3, score: '5:5'});
    });
    it("добавили матч - 4 серии", () => {
        notifications = [];
        pushGame({scores: ['5:5']});
        liveWatcher.checkSeries(game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0].seqCount, {count: 4, score: '5:5'});

    });
    it("добавили 2 матча с другим типом игры - также 4 серии", () => {
        notifications = [];
        pushGame({scores: ['5:5']}, watchSportsIds.hockey);
        pushGame({scores: ['5:5']}, watchSportsIds.hockey);
        liveWatcher.checkSeries(game);
        assert.deepEqual(notifications[0].seqCount, {count: 4, score: '5:5'});

    });
    it("изменили 2 последних матча на футбол - оборвали серию", () => {
        notifications = [];
        cachedGames.set(6, {scores: ['4:4'], sportId: watchSportsIds.football});
        cachedGames.set(7, {scores: ['4:4'], sportId: watchSportsIds.football});
        liveWatcher.checkSeries(game);
        assert.equal(notifications.length, 0);

    });
});
