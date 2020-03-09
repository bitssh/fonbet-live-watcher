const {GameSequenceChecker} = require("./sequenceChecking");
const config = require("../config.js").common;

const reversedScore = (score) => score.split(':').reverse().join(':');

function hasScore(list, score) {
    return list.includes(score) || list.includes(reversedScore(score));
}

class SameScoreChecker extends GameSequenceChecker {
    get seqCountTrigger () {
        return config.watchScoreSeqCount;
    }
    get notificationText() {
        return `серия из ${this.seqCount} матчей ${this.seqCount.score}`;
    }
    static calcSeqCount(games) {
        let count = 1;
        let score;
        if (games[games.length - 1].score) {
            score = games[games.length - 1].score;
            if (hasScore(config.watchScoreSeq, score)) {
                for (let i = games.length - 2; i >= 0; i -= 1) {
                    const game = games[i];
                    if (!game.score)
                        break;
                    if (!hasScore(game.scores, score)) {
                        break;
                    }
                    count += 1;
                }
            }
        }
        return {count, score};
    }

    checkCondition () {
        return this.seqCount.count >= this.seqCountTrigger;
    }
}

exports.SameScoreChecker = SameScoreChecker;
exports.hasScore = hasScore;
