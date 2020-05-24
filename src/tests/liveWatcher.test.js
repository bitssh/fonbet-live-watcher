const {liveWatcher} = require("../liveWatcher.js");
const {describe, it} = require("mocha");
const assert = require("assert");
const {parameters} = require("../config.js");
const {hasScore} = require("../seriesChecking/SameScoreChecker");
const cachedGames = liveWatcher.gameFetcher.cachedGames;

it("getAndCheckUpdates - граббинг тестовых данных", function () {
    cachedGames.clear();
    parameters.fileWritingEnabled = false;
    parameters.useDummyUrl = true;
    liveWatcher.getAndCheckUpdates();
    liveWatcher.getAndCheckUpdates();
    liveWatcher.getAndCheckUpdates();
    assert.equal(cachedGames.get(16156082).scoreStr, '3:0');
    assert.equal(cachedGames.get(16156082).miscs.timerSeconds, 129);
});

it("shrinkCache - удаление первой половины игр", function () {
    cachedGames.clear();
    for (let i = 0; i < 7; i += 1) {
        cachedGames.set(i, null);
    }

    it("загрузили кеш", () => {
        assert.equal(cachedGames.size, 7);
    });

    liveWatcher.gameFetcher.shrinkCache();
    it("удалили половину игр (с округлением в меньшую сторону)", () => {
        assert.equal(cachedGames.size, 4);
    });

    it("убеждаемся что удалили первую половину игр", () => {
        assert.equal(cachedGames.keys().next().value, 3);
    });

    liveWatcher.gameFetcher.shrinkCache();
    it("ещё удалили половину игр", () => {
        assert.equal(cachedGames.size, 2);
        assert.equal(cachedGames.keys().next().value, 5);
    });
});

describe("hasScore - проверка вхождения счета в массиве счетов", () => {
    it("проверка плоследнего счета", () => {
        assert.equal(hasScore(['0:1', '0:2'], '0:2'), true);
    });
    it("проверка плоследнего счета в обратном виде", () => {
        assert.equal(hasScore(['0:1', '0:2'], '2:0'), true);
    });
    it("проверка отсутствующего счета", () => {
        assert.equal(hasScore(['0:1', '0:2'], '1:1'), false);
    });
    it("проверка счета в пустом списке", () => {
        assert.equal(hasScore([], '1:1'), false);
    });
});

