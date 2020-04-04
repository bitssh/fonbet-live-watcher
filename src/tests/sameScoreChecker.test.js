const {describe, it} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {SameScoreChecker,} = require("../seriesChecking/SameScoreChecker");

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
});
