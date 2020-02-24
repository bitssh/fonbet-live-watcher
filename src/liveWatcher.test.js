const liveWatcherModule = require("./liveWatcher.js");
const liveWatcher = liveWatcherModule.liveWatcher;
const Game = require("./game").Game;
const assert = require("assert");
const config = require("./config.js").common;
const notifying = require('./notifying.js');
const Notifier = notifying.Notifier;
require("colors");
const cachedGames = liveWatcher.gameFetcher.cachedGames;

let notifications = [];
notifying.sender.sendNotification = (notification) => {
    notifications.push(notification)
};

function pushGame(game, footBall = true) {
    const result = cachedGames.newGame(cachedGames.size);
    result.isFootball = footBall;
    result.scores = game.scores;
    return result;
}

it("граббинг тестовых данных", function(){
    cachedGames.clear();
    config.fileWritingEnabled = false;
    config.useDummyUrl = true;
    liveWatcher.grabUpdates();
    liveWatcher.grabUpdates();
    liveWatcher.grabUpdates();
    assert.equal(cachedGames.get(16156082).score, '3:0');
    assert.equal(cachedGames.get(16156082).miscs.timerSeconds, 129);
});

it("удаление первой половины игр", function(){
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

it("проверяет вхождение счета в массиве счетов",  () => {
    assert.equal(liveWatcherModule.hasScore(['0:1', '0:2'], '0:2'), true);
    assert.equal(liveWatcherModule.hasScore(['0:1', '0:2'], '2:0'), true);
    assert.equal(liveWatcherModule.hasScore(['0:1', '0:2'], '1:1'), false);
    assert.equal(liveWatcherModule.hasScore([], '1:1'), false);
});


describe("подсчёт количества последних игр с одинаковым .score" , function(){
    let games = [];
    config.watchScoreSeq = [];
    let game1 = new Game (['0:0', '0:1', '0:2']);
    games.push(game1);

    it("1 игра, результат = 1", () => {
        assert.equal(liveWatcher.getSameScoreLastGamesCount(games).count, 1);
    });
    let game2 = new Game (['0:1']);
    games.push(game2);
    it("Вторая игра, результат = 1", () => {
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games), {count: 1, score: '0:1'});
    });

    it("Задали значения watchScoreSeq, результат = 2", () => {
        config.watchScoreSeq = ['5:5', '1:0', '6:6'];
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games), {count: 2, score: '0:1'});
    });

    it("Последний гол поломал последовательность, результат = 1", () => {
        game2.scores.push('0:1');
        game2.scores.push('1:1');
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games).count, 1);
    });

    it("Третья игра, 3 серии из 0:1", () => {
        let game3 = new Game (['1:0']);
        games.push(game3);
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games), {count: 3, score: '1:0'});
    });
});

describe("getNoGoalsLastGamesCount", function() {
    let games = [];
    const checkGoalsCountAssert = (goals) => {
        games.push({scores: ['0:0']});
        assert.equal(liveWatcher.getNoGoalsLastGamesCount(games), goals);
        games.pop();
    };
    config.watchNoGoalsCount = 3;
    config.watchNoGoalsFromSec = 270;

    it("нет игр - 0 игр без голов", () => {
        checkGoalsCountAssert(0);
    });
    it("две игры без голов", () => {
        games.push({scores: ['4:4'], timerSeconds: 100});
        games.push({scores: ['4:4'], timerSeconds: 200});
        checkGoalsCountAssert(2);
    });
    it("в последней игре был гол вконце  - значит 0 последних игр без голов", () => {
        games.push({scores: ['5:5'], timerSeconds: 300});
        checkGoalsCountAssert(0);
    });
    it("в последней игре был гол, но не вконце - значит 1 последняя игра без голов", () => {
        games.push({scores: ['4:4'], timerSeconds: 269});
        checkGoalsCountAssert(1);
    });
    it("гол в конце игры и последующие 3 игры без голов", () => {
        games.push({scores: ['4:4'], timerSeconds: 300});
        games.push({scores: ['5:5'], timerSeconds: 1});
        games.push({scores: [ '5:5'], timerSeconds: 1});
        games.push({scores: [ '5:5'], timerSeconds: 1});
        checkGoalsCountAssert(3);
    });
});


describe("getGoalsLastGamesCount", function() {
    let games = [];
    const checkGoalsCountAssert = (goals) => {
        games.push({scores: ['0:0']});
        assert.equal(liveWatcher.getGoalsLastGamesCount(games), goals);
        games.pop();
    };
    config.watchGoalsCount = 3;
    config.watchGoalsFromSec = 270;

    it("нет игр - 0 игр с голами", () => {
        assert.equal(liveWatcher.getGoalsLastGamesCount(games), 0);
    });
    it("две игры с голами", () => {
        games.push({scores: ['4:4'], timerSeconds: 290});
        games.push({scores: ['4:4'], timerSeconds: 270});
        checkGoalsCountAssert(2);
    });
    it("в последней игре не было гола  - значит 0 последних игр с голами", () => {
        games.push({scores: ['5:5'], timerSeconds: 200});
        checkGoalsCountAssert(0);
    });
    it("в последней игре был гол в конце - значит 1 последняя игра с голами", () => {
        games.push({scores: ['4:4'], timerSeconds: 272});
        checkGoalsCountAssert(1);
    });
    it("1 игра без голов и последующие 3 игры с голами", () => {
        games.push({scores: ['4:4'], timerSeconds: 1});
        games.push({scores: ['5:5'], timerSeconds: 270});
        games.push({scores: [ '5:5'], timerSeconds: 300});
        games.push({scores: [ '5:5'], timerSeconds: 300});
        checkGoalsCountAssert(3);
    });
});

describe("sendNotifications.notifyAboutNoGoals", function() {
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
        liveWatcher.sendNotifications(noGoalGame);
        assert.equal(notifications.length, 0);
    });

    it("новый матч - без оповещений", () => {
        cachedGames.set(2, newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 0);
    });

    it("3 матча без голов и новый матч - оповещение", () => {
        cachedGames.set(2, noGoalGame);
        cachedGames.set(3, newGame);
        //console.log(newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 3);
    });

    it("проверка текста оповещения о серии без голов", () => {
        assert.equal(notifications[0].getText(), 'нет голов в 3 матчах с 270 секунды');
    });


    it("повторный новый матч - нет новых оповещений", () => {
        notifications = [];
        cachedGames.set(4, newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 0);
    });

    it("5 матчей без голов и новый матч - оповещение", () => {
        cachedGames.set(3, noGoalGame);
        cachedGames.set(4, noGoalGame);
        cachedGames.set(5, newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 5);
        notifications = [];
    });

    it("делаем 2й матч с голом, в итоге 3 матчей без голов и новый матч - оповещение", () => {
        notifications = [];

        cachedGames.set(1, goalGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0].seqCount, 3);
    });

});

describe("sendNotifications.notifyAboutScoreSeq", function() {
    cachedGames.clear();
    notifications = [];
    config.watchScoreSeqCount = 3;
    const game = pushGame({scores: [ '4:4']});

    it("3 серии и не задан массив очков", () => {
        cachedGames.clear();
        config.watchScoreSeq = [];
        config.watchScoreSeqCount = 3;
        notifications = [];

        pushGame({scores: [ '4:4']});
        pushGame({scores: [ '5:5']});
        pushGame({scores: [ '5:5']});
        pushGame({scores: [ '5:5']});
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 0);
    });

    it("3 серии и задан массив очков", () => {
        notifications = [];
        config.watchScoreSeq = ['4:4'];
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 0);
        config.watchScoreSeq = ['4:4', '5:5', '6:6'];
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0], {seqCount: 3, score: '5:5'});

    });

    it("добавили матч - 4 серии", () => {
        notifications = [];
        pushGame({scores: [ '5:5']});
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0], {seqCount: 4, score: '5:5'});

    });

    it("добавили 2 матча с другим типом игры - также 4 серии", () => {
        notifications = [];
        pushGame({scores: [ '5:5']}, false);
        pushGame({scores: [ '5:5']}, false);
        liveWatcher.sendNotifications(game);
        assert.deepEqual(notifications[0], {seqCount: 4, score: '5:5'});

    });

    it("изменили 2 последних матча на футбол - оборвали серию", () => {
        notifications = [];
        cachedGames.set(6, {scores: [ '4:4'], isFootball: true});
        cachedGames.set(7, {scores: [ '4:4'], isFootball: true});
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 0);

    });





});
