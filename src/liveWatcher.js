"use strict";
// https://www.fonbet.ru/#!/live/rocket-league

const config = require("./config.js").common;
const notifier = require('./notifier.js');
const fs = require('fs');
const getLastLine = require('./fileTools.js').getLastLine;
require('colors');

function hasScore(list, score) {
    const reversedScore = () => score.split(':').reverse().join(':');
    return list.includes(score) || list.includes(reversedScore());
}

exports.hasScore = hasScore;

exports.liveWatcher = {
    lastCSVLine: [null, null],
    gameFetcher: require("./gameFetcher").gameFetcher,

    initialize() {
        for (let bool of [false, true]) {
            getLastLine(this.getCSVFilename(bool), 1)
                .then((lastLine) => {
                    this.lastCSVLine[bool] = lastLine.split(';');
                })
                .catch((err) => {
                    console.error(err)
                })
        }

    },
    getCSVFilename (football) {
        const sportName = football ? 'football' : 'hockey';
        return `./csv/${sportName}.csv`;
    },
    async grabUpdates() {
        let fetchedGames = await this.gameFetcher.fetchUpdates();
        if (!fetchedGames || !fetchedGames.size)
            return;
        if (this.gameFetcher.cachedGames.size > config.cachedGamesSize) {
            this.gameFetcher.shrinkCache();
        }
        for (let game of fetchedGames) {
            if (!game.score) {
                console.error(`score is null for game ${game.event.id}`.red);
                return;
            }
            if (config.fileWritingEnabled) {
                this.appendToFile(game);
            }
            this.appendToConsole(game);
            this.sendNotifications(game);
        }
    },
    appendToFile(game) {
        let csvRow = [game.now, game.event.name.replace('Матч', 'Match'), "'" + game.score, game.timerSeconds];
        let line = csvRow.join(';');
        let lastLine = this.lastCSVLine[game.isFootball];
        if (!lastLine || !(csvRow[1] === lastLine[1] && csvRow[2] === lastLine[2])) {
            this.lastCSVLine[game.isFootball] = null;
            try {
                const filename = this.getCSVFilename(game.isFootball);
                const fd = fs.openSync(filename, 'a');
                try {
                    fs.appendFileSync(fd, line + '\r\n');
                } finally {
                    fs.closeSync(fd);
                }
            } catch (err) {
                console.error(err.red)
            }
        }

    },
    appendToConsole(game) {
        const games = this.getGames(game.isFootball);
        const timerSeconds =  game.timerSeconds ? game.timerSeconds : '   ';
        const indent = game.isFootball ? '            ' : '';

        let seqStr = this.getSameScoreLastGamesCount(games).count;
        let clnStr = this.getNoGoalsLastGamesCount(games);
        seqStr =  + seqStr >= config.watchScoreSeqCount - 1 ? String('S' + seqStr).yellow : '  ';
        clnStr =  + clnStr >= config.watchNoGoalsCount - 1 ? String('C' + clnStr).yellow : '  ';

        let logStr = `${game.now} ${indent}${seqStr} ${clnStr} `
            + `${game.event.id}  ${game.event.name} <${game.score}> ${timerSeconds} ${game.timerUpdate} `;
        console.log(game.isNew ? logStr.grey: logStr );

    },
    notifyAboutScoreSeq (sportName, sameScores) {
        this.sendNotification(`${sportName} - серия из ${sameScores.count} матчей ${sameScores.score}`);
    },

    notifyAboutNoGoals (sportName, noGoalsCount) {
        this.sendNotification(`${sportName} - нет голов в ${noGoalsCount} матчах с ${config.watchNoGoalsFromSec} секунды`);
    },

    notifyAboutGoals (sportName, goalsCount) {
        this.sendNotification(`${sportName} - голы в ${goalsCount} матчах с ${config.watchGoalsFromSec} секунды`);
    },

    sendNotification(text) {
        notifier.sendMail(text)
            .then ((info) => console.log('Message sent: '.green + `${text} ${info.messageId} `))
            // FIXME err = undefined
            .catch(err => console.error(text + ' ' + err.red));

    },

    sendNotifications(game) {
        const games = this.getGames(game.isFootball);
        const sportName = game.isFootball ? 'Футбол' : 'Хоккей';
        const sameScores = this.getSameScoreLastGamesCount(games);

        if (sameScores.count >= config.watchScoreSeqCount)
            this.notifyAboutScoreSeq(sportName, sameScores);

        // проверяем является ли текущий матч новым
        if (game.isNew && game === games[games.length - 1]) {
            const noGoals = this.getNoGoalsLastGamesCount(games);
            if (noGoals >= config.watchNoGoalsCount)
                this.notifyAboutNoGoals(sportName, noGoals);

            const goals = this.getGoalsLastGamesCount(games);
            if (goals >= config.watchGoalsCount)
                this.notifyAboutGoals(sportName, goals);
        }

    },
    getGames(football) {
        return Array.from(this.gameFetcher.cachedGames.values()).filter((item) => item.isFootball === football);
    },

    getSameScoreLastGamesCount(games) {
        let count = 1;
        let score;
        if (games[games.length - 1].score) {
            score = games[games.length - 1].score;
            if (hasScore(config.watchScoreSeq, score)) {
                for (let i = games.length - 2; i >= 0; i -= 1) {
                    if (!games[i].score)
                        break;
                    if (!hasScore(games[i].scores, score)) {
                        break;
                    }
                    count += 1;
                }
            }
        }
        return {count, score};
    },

    getNoGoalsLastGamesCount(games) {
        let count = 0;
        // не учитываем текущую игру
        for (let i = games.length - 2; i >= 0; i -= 1) {
            if (!games[i].timerSeconds || games[i].timerSeconds >= config.watchNoGoalsFromSec)
                break;
            count += 1;
        }
        return count;
    },

    getGoalsLastGamesCount(games) {
        let count = 0;
        // не учитываем текущую игру
        for (let i = games.length - 2; i >= 0; i -= 1) {
            if (!games[i].timerSeconds || games[i].timerSeconds < config.watchGoalsFromSec)
                break;
            count += 1;
        }
        return count;
    },


};

