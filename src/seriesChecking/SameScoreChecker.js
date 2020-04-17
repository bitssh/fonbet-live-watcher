const {BaseGameSeriesChecker} = require("./baseSeriesChecking");

const reversedScore = (score) => score.split(':').reverse().join(':');

function hasScore(list, score) {
    return list.includes(score) || list.includes(reversedScore(score));
}

class SameScoreChecker extends BaseGameSeriesChecker {
    get seqCountTrigger () {
        return this.config.scoreSeries;
    }
    get notificationText() {
        return `серия из ${this.seqCount.count} матчей ${this.seqCount.score}`;
    }
    calcSeqCount(games) {
        let count = 1;
        let score;
        if (games.length && games[games.length - 1].score) {
            score = games[games.length - 1].score;
            if (hasScore(this.config.scoreSeriesValues, score)) {
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
