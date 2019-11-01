"use strict";

// https://www.fonbet.ru/#!/live/rocket-league
const notifier = require('./notifier.js');
const fetch = require('node-fetch');
const fs = require('fs');
require('colors');

const rlFootballSportID = 44955;
// const rlHockeySportID = 48138;


exports.liveWatcher = {
    subDomains: ['line11', 'line12', 'line16', 'line31'],
    lastPacketVersion: 0,
    games: new Map,
    sportsIDs: new Set,
    cachedGames: new Map(),
    cachedGamesSize: 30,
    useDummyUrl: false,
    fileWritingEnabled: true,
    getFetchTimeout() {
        return this.useDummyUrl ? 100 : 2000;
    },

    watchScoreSeqCount: 3,
    watchScoreSeq: ['1:1', '2:2', '0:2', '0:1', '1:2', '2:3', '1:3', '2:4', '3:4', '3:5', '4:5'],

    watchNoGoalsCount: 3,
    watchNoGoalsFromSec: 280,

    async fetchUpdates() {
        let url = (() => {
            let result;
            if (this.useDummyUrl) {
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
        if (this.useDummyUrl) {
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
                cachedGame = {};


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
                if (cachedGame.score !== score) {
                    cachedGame.miscs = miscs;
                    cachedGame.score = score;
                    cachedGame.timerSeconds = miscs.timerSeconds;
                    result.add(cachedGame);
                }
            }

        }
        return result;
    },

    async grabUpdates() {
        let fetchedGames = await this.fetchUpdates();
        if (!fetchedGames || !fetchedGames.size)
            return;

        for (let game of fetchedGames) {
            if (!game.score) {
                console.error(`score is null for game ${game.event.id}`.red);
                return;
            }
            game.new = game.score === '0:0';
            game.now = new Date().toLocaleString();
            game.timerUpdate = !game.miscs.timerUpdateTimestamp
                ? ''
                : new Date(game.miscs.timerUpdateTimestamp * 1000).toLocaleTimeString();
            game.date = new Date(game.event.startTime * 1000).toLocaleDateString();
            game.isFootBall = game.event.sportId === rlFootballSportID;

            if (this.fileWritingEnabled) {
                const sportName = game.isFootBall ? 'football' : 'hockey';
                this.appendToFile(game, `./../csv/${sportName}.csv`);
            }

            this.appendToConsole(game);

            if (this.cachedGames.size > this.cachedGamesSize) {
                this.shrinkCache();
            }

            this.sendNotifications(game);
        }
    },
    appendToFile(game, filename) {
        let csvRow = [game.now, game.event.name.replace('Матч', 'Match'), "'" + game.score, game.timerSeconds];
        try {
            const fd = fs.openSync(filename, 'a');
            try {
                fs.appendFileSync(fd, csvRow.join(';') + '\r\n');
            } finally {
                fs.closeSync(fd);
            }
        } catch (err) {
            console.error(err.red)
        }

    },
    appendToConsole(game) {
        const games = this.getGames(game.isFootBall);


        if (!game.timerSeconds)
            game.timerSeconds = '   ';
        const indent = game.isFootBall ? '            ' : '';

        let seqStr = this.getSameScoreLastGamesCount(games).count;
        let clnStr = this.getNoGoalsLastGamesCount(games);
        seqStr = seqStr >= this.watchScoreSeqCount - 1 ? String(seqStr).yellow : seqStr;
        clnStr = clnStr >= this.watchNoGoalsCount - 1 ? String(clnStr).yellow : clnStr;

        // TODO show seqStr, clnStr only if they are yellow

        let logStr = `${game.now} ${indent}S${seqStr} C${clnStr} `
            + `${game.event.id}  ${game.event.name} <${game.score}> ${game.timerSeconds} ${game.timerUpdate} `;
        console.log(game.new ? logStr.grey: logStr );

    },
    notifyAboutScoreSeq (sportName, sameScores) {
        this.sendNotification(`${sportName} - серия из ${sameScores.count} матчей ${sameScores.score}`);
    },

    notifyAboutNoGoals (sportName, noGoalsCount) {
        this.sendNotification(`${sportName} - нет голов в ${noGoalsCount} матчах с ${this.watchNoGoalsFromSec} секунды`);
    },

    sendNotification(text) {
        notifier.sendMail(text)
            .then ((info) => console.log('Message sent: '.green + `${text} ${info.messageId} `))
            // FIXME err = undefined
            .catch(err => console.error(text + ' ' + err.red));

    },

    sendNotifications(game) {
        const games = this.getGames(game.isFootBall);
        const sportName = game.isFootBall ? 'Футбол' : 'Хоккей';

        const sameScores = this.getSameScoreLastGamesCount(games);

        if (sameScores.count >= this.watchScoreSeqCount)
            this.notifyAboutScoreSeq(sportName, sameScores);

        // проверяем является ли текущий матч новым
        if (game.new && game === games[games.length - 1]) {
            const noGoals = this.getNoGoalsLastGamesCount(games);
            if (noGoals >= this.watchNoGoalsCount)
                this.notifyAboutNoGoals(sportName, noGoals);
        }

    },
    getGames(footBall) {
        return Array.from(this.cachedGames.values()).filter((item) => item.isFootBall === footBall);
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
        for (let i = games.length - 1; i >= 1; i -= 1) {
            // score у соседних игр должен совпадать и быть равным предопределённым значениям watchScoreSeq
            score = games[i].score;
            if (score !== games[i - 1].score)
                break;
            if (this.watchScoreSeq.indexOf(score) === -1)
                break;
            count += 1;
        }
        return {count, score};
    },

    getNoGoalsLastGamesCount(games) {
        let count = 0;
        // не учитываем текущую игру
        for (let i = games.length - 2; i >= 0; i -= 1) {
            if (!games[i].timerSeconds || games[i].timerSeconds >= this.watchNoGoalsFromSec)
                break;
            count += 1;
        }
        return count;
    },


};

