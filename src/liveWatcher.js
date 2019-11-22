"use strict";
// https://www.fonbet.ru/#!/live/rocket-league
const config = require("./config.js").common;
const notifier = require('./notifier.js');
const fetch = require('node-fetch');
const fs = require('fs');
const getLastLine = require('./fileTools.js').getLastLine
require('colors');

const rlFootballSportID = 44955;
// const rlHockeySportID = 48138;


exports.liveWatcher = {
    subDomains: ['line11', 'line12', 'line16', 'line31'],
    lastPacketVersion: 0,
    games: new Map,
    sportsIDs: new Set,
    cachedGames: new Map(),
    getFetchTimeout() {
        return config.useDummyUrl ? 100 : 2000;
    },
    lastCSVLine: [null, null],

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

        let rocketLeague = responseData.sports.find(sport => sport.name === "Rocket League");
        if (rocketLeague)
            for (let sport of responseData.sports.filter(sport => sport.parentId === rocketLeague.id)) {
                this.sportsIDs.add(sport.id);
            }

        let events = responseData.events.filter(event => this.sportsIDs.has(event.sportId));
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
                const score = miscs.score1 <= miscs.score2
                    ? `${miscs.score1}:${miscs.score2}`
                    : `${miscs.score2}:${miscs.score1}`;
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
            game.isFootball = game.event.sportId === rlFootballSportID;

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


        if (!game.timerSeconds)
            game.timerSeconds = '   ';
        const indent = game.isFootball ? '            ' : '';

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
        if (game.new && game === games[games.length - 1]) {
            const noGoals = this.getNoGoalsLastGamesCount(games);
            if (noGoals >= config.watchNoGoalsCount)
                this.notifyAboutNoGoals(sportName, noGoals);
        }

    },
    getGames(football) {
        return Array.from(this.cachedGames.values()).filter((item) => item.isFootball === football);
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
            if (config.watchScoreSeq.indexOf(score) !== -1) {
                for (let i = games.length - 2; i >= 0; i -= 1) {
                    if (!games[i].score)
                        break;
                    if (games[i].scores.indexOf(score) === -1) {
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


};

