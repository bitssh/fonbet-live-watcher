const {describe, it} = require("mocha");
const config = require("../config.js").common;
const {GameTester} = require("./testTools.js");
const {NoGoalsChecker} = require("../sequenceChecking/NoGoalsChecker");
const {GoalsChecker} = require("../sequenceChecking/GoalsChecker");

config.watchNoGoalsCount = 3;
config.watchNoGoalsFromSec = 270;
config.watchGoalsCount = 3;
config.watchGoalsFromSec = 270;

describe("NoGoalsChecker", function () {
    const gameTester = new GameTester(NoGoalsChecker);

    it("нет игр - 0 игр без голов", () => {
        gameTester.checkCountAssert(0);
    });
    it("две игры без голов", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 100});
        gameTester.push({scores: ['0:0', '4:4'], timerSeconds: 200});
        gameTester.checkCountAssert(2);
    });
    it("в последней игре был гол вконце  - значит 0 последних игр без голов", () => {
        gameTester.push({scores: ['0:0', '5:5'], timerSeconds: 300});
        gameTester.checkCountAssert(0);
    });
    it("в последней игре был гол, но не вконце - значит 1 последняя игра без голов", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 269});
        gameTester.checkCountAssert(1);
    });
    it("гол в конце игры и последующие 3 игры без голов", () => {
        gameTester.push({scores: ['0:0', '4:4'], timerSeconds: 300});
        gameTester.push({scores: ['5:5'], timerSeconds: 1});
        gameTester.push({scores: ['5:5'], timerSeconds: 1});
        gameTester.push({scores: ['5:5'], timerSeconds: 1});
        gameTester.checkCountAssert(3);
    });
});


describe("GoalsChecker", function () {
    const gameTester = new GameTester(GoalsChecker);

    it("нет игр - 0 игр с голами", () => {
        gameTester.checkCountAssert(0);
    });
    it("две игры с голами", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 290});
        gameTester.push({scores: ['4:4'], timerSeconds: 270});
        gameTester.checkCountAssert(2);
    });
    it("в последней игре не было гола  - значит 0 последних игр с голами", () => {
        gameTester.push({scores: ['5:5'], timerSeconds: 200});
        gameTester.checkCountAssert(0);
    });
    it("в последней игре был гол в конце - значит 1 последняя игра с голами", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 272});
        gameTester.checkCountAssert(1);
    });
    it("1 игра без голов и последующие 3 игры с голами", () => {
        gameTester.push({scores: ['4:4'], timerSeconds: 1});
        gameTester.push({scores: ['5:5'], timerSeconds: 270});
        gameTester.push({scores: ['5:5'], timerSeconds: 300});
        gameTester.push({scores: ['5:5'], timerSeconds: 300});
        gameTester.checkCountAssert(3);
    });
});

