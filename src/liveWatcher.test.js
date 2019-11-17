const liveWatcher = require("./liveWatcher.js").liveWatcher;
const assert = require("assert");
require("colors");
const cachedGames = liveWatcher.cachedGames;

function pushGame(game, footBall = true) {
    game.isFootBall = footBall;
    game.score =  () => game.scores[game.scores.length - 1];
    cachedGames.set(cachedGames.size, game);
}

class Game {
    constructor (scores, timerSeconds) {
        this.timerSeconds = timerSeconds;
        this.scores = scores;
    }

    score () {
        return this.scores[this.scores.length - 1];
    }
}

it("граббинг тестовых данных", function(){
    liveWatcher.fileWritingEnabled = false;
    liveWatcher.useDummyUrl = true;
    liveWatcher.grabUpdates();
    liveWatcher.grabUpdates();
    liveWatcher.grabUpdates();
    assert.equal(cachedGames.get(16156082).score(), '0:3');
    assert.equal(cachedGames.get(16156082).miscs.timerSeconds, 129);
});

it("удаление первой половины игр", function(){
    cachedGames.clear();
    for (let i = 0; i < 7; i += 1) {
        cachedGames.set(i, null);
    }
    assert.equal(cachedGames.size, 7);
    liveWatcher.shrinkCache();
    assert.equal(cachedGames.size, 4);
    assert.equal(cachedGames.keys().next().value, 3);
    liveWatcher.shrinkCache();
    assert.equal(cachedGames.size, 2);
    assert.equal(cachedGames.keys().next().value, 5);
});


describe("подсчёт количества последних игр с одинаковым .score" , function(){
    let games = [];
    liveWatcher.watchScoreSeq = [];
    let game1 = new Game (['0:0', '0:1', '0:2']);
    games.push(game1);

    it("1 игра, результат = 1", function () {
        assert.equal(liveWatcher.getSameScoreLastGamesCount(games).count, 1);
    });
    let game2 = new Game (['0:0']);
    games.push(game2);
    it("Вторая игра с 0:0, результат = 1", function () {
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games), {count: 1, score: '0:0'});
    });

    it("Задали значения watchScoreSeq, результат = 2", function () {
        liveWatcher.watchScoreSeq = ['5:5', '0:0', '6:6'];
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games), {count: 2, score: '0:0'});
    });

    it("Последний гол поломал последовательность, результат = 1", function () {
        game2.scores.push('0:1');
        game2.scores.push('1:1');
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games).count, 1);
    });

    it("Третья игра, 3 серии из 0:0", function () {
        let game3 = new Game (['0:0']);
        games.push(game3);
        assert.deepEqual(liveWatcher.getSameScoreLastGamesCount(games), {count: 3, score: '0:0'});
    });
});

describe("getNoGoalsLastGamesCount", function() {

    let games = [];
    liveWatcher.watchNoGoalsCount = 3;
    liveWatcher.watchNoGoalsFromSec = 270;

    it("нет игр - 0 игр без голов", function () {
        assert.equal(liveWatcher.getNoGoalsLastGamesCount(games), 0);
    });

    it("две игры без голов", function () {
        games.push({scores: ['4:4'], timerSeconds: 100});
        games.push({scores: ['4:4'], timerSeconds: 200});
        games.push({scores: ['5:5'], timerSeconds: 300});
        assert.equal(liveWatcher.getNoGoalsLastGamesCount(games), 2);
    });

    it("в последней игре был гол вконце  - значит 0 последних игр без голов", function () {
        games.push({scores: ['4:4'], timerSeconds: 269});
        assert.equal(liveWatcher.getNoGoalsLastGamesCount(games), 0);
    });

    it("в последней игре был гол, но не вконце - значит 1 последняя игра без голов", function () {
        games.push({scores: ['4:4'], timerSeconds: 300});
        assert.equal(liveWatcher.getNoGoalsLastGamesCount(games), 1);
    });

    it("гол в конце игры и последующие 3 игры без голов", function () {
        games.push({scores: ['5:5'], timerSeconds: 1});
        games.push({scores: [ '5:5'], timerSeconds: 1});
        games.push({scores: [ '5:5'], timerSeconds: 1});
        games.push({scores: [ '0:0']});
        assert.equal(liveWatcher.getNoGoalsLastGamesCount(games), 3);
    });
});

describe("sendNotifications.notifyAboutNoGoals", function() {
    let notifications = [];
    liveWatcher.watchNoGoalsCount = 3;
    liveWatcher.watchNoGoalsFromSec = 270;
    liveWatcher.notifyAboutScoreSeq = () => {};
    liveWatcher.notifyAboutNoGoals = (sportName, noGoalsCount) => {notifications.push(noGoalsCount)};
    cachedGames.clear();
    const noGoalGame = {isFootBall: true, timerSeconds: 1};
    const goalGame = {isFootBall: true, timerSeconds: 270};
    const newGame = {isFootBall: true, scores: ['0:0'], new: true};

    it("2 матча без голов - без оповещений", function () {
        cachedGames.clear();
        cachedGames.set(0, noGoalGame);
        cachedGames.set(1, noGoalGame);
        liveWatcher.sendNotifications(noGoalGame);
        assert.equal(notifications.length, 0);
    });

    it("новый матч - без оповещений", function () {
        cachedGames.set(2, newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 0);
        notifications = [];
    });

    it("3 матча без голов и новый матч - оповещение", function () {
        cachedGames.set(2, noGoalGame);
        cachedGames.set(3, newGame);
        //console.log(newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0], 3);
        notifications = [];
    });


    it("повторный новый матч - нет новых оповещений", function () {
        cachedGames.set(4, newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 0);
    });

    it("5 матчей без голов и новый матч - оповещение", function () {
        cachedGames.set(3, noGoalGame);
        cachedGames.set(4, noGoalGame);
        cachedGames.set(5, newGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0], 5);
        notifications = [];
    });

    it("делаем 2й матч с голом, в итоге 3 матчей без голов и новый матч - оповещение", function () {
        notifications = [];

        cachedGames.set(1, goalGame);
        liveWatcher.sendNotifications(newGame);
        assert.equal(notifications.length, 1);
        assert.equal(notifications[0], 3);
    });




});

describe("sendNotifications.notifyAboutScoreSeq", function() {
    cachedGames.clear();

    liveWatcher.watchScoreSeqCount = 3;

    const game = {scores: [ '4:4'], isFootBall: true};

    it("3 серии и не задан массив очков", function () {
        cachedGames.clear();
        let notifications = [];
        liveWatcher.watchScoreSeq = [];
        liveWatcher.watchScoreSeqCount = 3;
        liveWatcher.notifyAboutScoreSeq = (sportName, sameScores) => {notifications.push(sameScores)};
        liveWatcher.notifyAboutNoGoals = () => {};

        pushGame({scores: [ '4:4']});
        pushGame({scores: [ '4:4']});
        pushGame({scores: [ '5:5']});
        pushGame({scores: [ '5:5']});
        pushGame({scores: [ '5:5']});

        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 0);
    });

    it("3 серии и задан массив очков", function () {
        liveWatcher.notifyAboutScoreSeq = (sportName, sameScores) => {notifications.push(sameScores)};

        let notifications = [];
        liveWatcher.watchScoreSeq = ['4:4'];
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 0);
        liveWatcher.watchScoreSeq = ['4:4', '5:5', '6:6'];
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0], {count: 3, score: '5:5'});

    });

    it("добавили матч - 4 серии", function () {
        liveWatcher.notifyAboutScoreSeq = (sportName, sameScores) => {notifications.push(sameScores)};
        let notifications = [];
        pushGame({scores: [ '5:5']});
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 1);
        assert.deepEqual(notifications[0], {count: 4, score: '5:5'});

    });

    it("добавили 2 матча с другим типом игры - также 4 серии", function () {
        liveWatcher.notifyAboutScoreSeq = (sportName, sameScores) => {notifications.push(sameScores)};
        let notifications = [];
        pushGame({scores: [ '5:5']}, false);
        pushGame({scores: [ '5:5']}, false);
        liveWatcher.sendNotifications(game);
        assert.deepEqual(notifications[0], {count: 4, score: '5:5'});

    });

    it("изменили 2 последних матча на футбол - оборвали серию", function () {
        liveWatcher.notifyAboutScoreSeq = (sportName, sameScores) => {notifications.push(sameScores)};
        let notifications = [];
        cachedGames.set(6, {scores: [ '4:4'], isFootBall: true});
        cachedGames.set(7, {scores: [ '4:4'], isFootBall: true});
        liveWatcher.sendNotifications(game);
        assert.equal(notifications.length, 0);

    });





});
