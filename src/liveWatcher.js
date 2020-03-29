"use strict";
// https://www.fonbet.ru/#!/live/rocket-league
const config = require("./config.js").common;
const notifier = require('./notifier.js');
const fetch = require('node-fetch');
const fs = require('fs');
const getLastLine = require('./fileTools.js').getLastLine;
require('colors');

const rlFootballSportID = 44955;
const rlHockeySportID = 48138;
const rlBasketballSportID = 54698;
const watchSportIDList = [rlFootballSportID, rlHockeySportID, rlBasketballSportID];
const sportNameByID = {
    [rlFootballSportID]: 'Футбол',
    [rlHockeySportID]: 'Хоккей',
    [rlBasketballSportID]: 'Баскетбол',
};


function hasScore(list, score) {
    const reversedScore = () => score.split(':').reverse().join(':');
    return list.includes(score) || list.includes(reversedScore());
}

exports.hasScore = hasScore;

exports.liveWatcher = {
    subDomains: ['line11', 'line12', 'line16', 'line31'],
    lastPacketVersion: 0,
    games: new Map,
    cachedGames: new Map(),
    getFetchTimeout() {
        return config.useDummyUrl ? 100 : 2000;
    },
    lastCSVLine: {},

    async fetchUpdates() {
        let url = (() => {
            let result;
            if (config.useDummyUrl) {
                result = this.lastPacketVersion
                    ? `./../response-test/updatesFromVersion-${this.lastPacketVersion}.json`
                    : './../response-test/currentLine.json';
            } else {
                const subDomain = this.subDomains[Math.floor(Math.random() * this.subDomains.length)];
                result = this.lastPacketVersion
                    ? `https://${subDomain}.bkfon-resource.ru/live/updatesFromVersion/${this.lastPacketVersion}/ru/`
                    : `https://${subDomain}.bkfon-resource.ru/live/currentLine/ru`;
            }
            return result;
        })();

        let responseData;
        if (config.useDummyUrl) {
            responseData = require(url);
        } else {
            let response = await fetch(url);
            if (!response.ok) {
                console.error(`${new Date().toLocaleString()} ${response.status} - ${await response.text()}`.red);
                return;
            }
            responseData = await response.json();
        }

        this.lastPacketVersion = responseData.packetVersion;

        let events = responseData.events.filter(event => watchSportIDList.includes(event.sportId));
        let result = new Set();
        for (let event of events) {
            let cachedGame = this.cachedGames.get(event.id);
            if (cachedGame === undefined) {
                cachedGame = {
                    scores: [],
                };
                cachedGame.score = () => cachedGame.scores[cachedGame.scores.length - 1];

                this.cachedGames.set(event.id, cachedGame);
            }
            cachedGame.event = event;
        }

        for (let cachedGame of this.cachedGames.values()) {
            let miscs = responseData.eventMiscs.filter(miscs => cachedGame.event.id === miscs.id)[0];
            if (miscs !== undefined) {
                const score = `${miscs.score1}:${miscs.score2}`;
                if (cachedGame.score() !== score) {
                    cachedGame.miscs = miscs;
                    cachedGame.scores.push(score);
                    cachedGame.timerSeconds = miscs.timerSeconds;
                    result.add(cachedGame);
                }
            }

        }
        return result;
    },
    initialize() {
        for (let sportName of ['Футбол', 'Хоккей', 'Баскетбол']) {
            getLastLine(this.getCSVFilename(sportName), 1)
                .then((lastLine) => {
                    if (lastLine) {
                        this.lastCSVLine[sportName] = lastLine.split(';');
                    }
                })
                .catch((err) => {
                    console.error(err)
                })
        }

    },
    getCSVFilename (sportName) {
        return `./../csv/${sportName}.csv`;
    },
    async grabUpdates() {
        let fetchedGames = await this.fetchUpdates();
        if (!fetchedGames || !fetchedGames.size)
            return;

        for (let game of fetchedGames) {
            if (!game.score()) {
                console.error(`score is null for game ${game.event.id}`.red);
                return;
            }
            game.new = game.score() === '0:0';
            game.now = new Date().toLocaleString();
            game.timerUpdate = !game.miscs.timerUpdateTimestamp
                ? ''
                : new Date(game.miscs.timerUpdateTimestamp * 1000).toLocaleTimeString();
            game.date = new Date(game.event.startTime * 1000).toLocaleDateString();
            game.isFootball = false; // game.event.sportId === rlFootballSportID;
            game.sportId = game.event.sportId;
            game.sportName = sportNameByID[game.sportId];

            if (config.fileWritingEnabled) {
                this.appendToFile(game);
            }

            this.appendToConsole(game);

            if (this.cachedGames.size > this.cachedGamesSize) {
                this.shrinkCache();
            }

            this.sendNotifications(game);
        }
    },
    appendToFile(game) {
        let csvRow = [game.now, game.event.name.replace('Матч', 'Match'), "'" + game.score(), game.timerSeconds];
        let line = csvRow.join(';');
        let lastLine = this.lastCSVLine[game.sportName];
        if (!lastLine || !(csvRow[1] === lastLine[1] && csvRow[2] === lastLine[2])) {
            this.lastCSVLine[game.sportName] = null;
            try {
                const filename = this.getCSVFilename(game.sportName);
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
        const games = this.getGames(game.sportId);

        if (!game.timerSeconds)
            game.timerSeconds = '   ';
        const indent = game.sportName;

        let seqStr = this.getSameScoreLastGamesCount(games).count;
        let clnStr = this.getNoGoalsLastGamesCount(games);
        seqStr =  + seqStr >= config.watchScoreSeqCount - 1 ? String('S' + seqStr).yellow : '  ';
        clnStr =  + clnStr >= config.watchNoGoalsCount - 1 ? String('C' + clnStr).yellow : '  ';

        let logStr = `${game.now} ${indent}${seqStr} ${clnStr} `
            + `${game.event.id}  ${game.event.name} <${game.score()}> ${game.timerSeconds} ${game.timerUpdate} `;
        console.log(game.new ? logStr.grey: logStr );

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
        const games = this.getGames(game.sportId);
        const sportName = game.sportName;

        const sameScores = this.getSameScoreLastGamesCount(games);

        if (sameScores.count >= config.watchScoreSeqCount)
            this.notifyAboutScoreSeq(sportName, sameScores);

        // проверяем является ли текущий матч новым
        if (game.new && game === games[games.length - 1]) {
            const noGoals = this.getNoGoalsLastGamesCount(games);
            if (noGoals >= config.watchNoGoalsCount)
                this.notifyAboutNoGoals(sportName, noGoals);

            const goals = this.getGoalsLastGamesCount(games);
            if (goals >= config.watchGoalsCount)
                this.notifyAboutGoals(sportName, goals);
        }

    },
    getGames(sportId) {
        return Array.from(this.cachedGames.values()).filter((item) => item.sportId === sportId);
    },

    shrinkCache() {
        let ids = Array.from(this.cachedGames.keys());
        // удаляем половину прошлых игр
        ids = ids.slice(0, Math.floor(ids.length / 2));

        for (const id of ids) {
            this.cachedGames.delete(id);
        }
        console.log(`Cleared cache for events ${ids.join(', ')}`.grey);
    },


    getSameScoreLastGamesCount(games) {
        let count = 1;
        let score;
        if (games[games.length - 1].score) {
            score = games[games.length - 1].score();
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

