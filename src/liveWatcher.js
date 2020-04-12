"use strict";
// https://www.fonbet.ru/#!/live/rocket-league
require("colors");
const config = require("./config.js").common;
const {sportInfoByID} = require("./config");
const fileTools = require('./fileTools.js');
const {Team2UnbeatenSeriesChecker} = require("./seriesChecking/teamUnbeatenSeriesChecker");
const {Team1UnbeatenSeriesChecker} = require("./seriesChecking/teamUnbeatenSeriesChecker");
const {Team1WinChecker} = require("./seriesChecking/teamWinSeriesChecker");
const {Team2ScoreLessThanChecker} = require("./seriesChecking/teamTotalSeriesCheckers");
const {Team1ScoreLessThanChecker} = require("./seriesChecking/teamTotalSeriesCheckers");
const {Team2ScoreGreaterThanChecker} = require("./seriesChecking/teamTotalSeriesCheckers");
const {Team1ScoreGreaterThanChecker} = require("./seriesChecking/teamTotalSeriesCheckers");
const {LastGameTotalChecker} = require("./seriesChecking/LastGameTotalChecker");
const {Team2WinChecker} = require("./seriesChecking/teamWinSeriesChecker");
const {getLastLine} = require("./fileTools");
const {TotalGreaterThanChecker, TotalLessThanChecker} = require("./seriesChecking/totalSeriesCheckers");
const {SameScoreChecker} = require("./seriesChecking/SameScoreChecker");
const {NoGoalSeriesChecker, GoalSeriesChecker} = require("./seriesChecking/goalSeriesCheckers");

const seriesCheckerClasses = [
    NoGoalSeriesChecker,
    GoalSeriesChecker,
    LastGameTotalChecker,
    SameScoreChecker,
    Team1ScoreGreaterThanChecker,
    Team2ScoreGreaterThanChecker,
    Team1ScoreLessThanChecker,
    Team2ScoreLessThanChecker,
    Team1WinChecker,
    Team2WinChecker,
    Team1UnbeatenSeriesChecker,
    Team2UnbeatenSeriesChecker,
    TotalGreaterThanChecker,
    TotalLessThanChecker,
];

function checkSeriesAndNotify (games, checkerClasses = seriesCheckerClasses) {
    for (let SeriesCheckerClass of checkerClasses) {
        const seriesChecker = new SeriesCheckerClass(games);
        if (seriesChecker.checkCondition()) {
            seriesChecker.sendNotification();
        }
    }
}

exports.liveWatcher = {
    lastCSVLine: {},
    gameFetcher: require("./gameFetcher").gameFetcher,

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
    getCSVFilename(sportName) {
        return `./csv/${sportName}.csv`;
    },
    async getAndCheckUpdates() {
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
            const games = this.gameFetcher.cachedGames.getGames(game.sportId);
            checkSeriesAndNotify(games);
        }
    },
    appendToFile(game) {
        let csvRow = [game.now, game.event.name.replace('Матч', 'Match'), "'" + game.score, game.timerSeconds];
        let lastLine = this.lastCSVLine[game.sportName];
        if (!lastLine || !(csvRow[1] === lastLine[1] && csvRow[2] === lastLine[2])) {
            this.lastCSVLine[game.sportName] = null;
            const line = csvRow.join(';');
            fileTools.appendFile(this.getCSVFilename(game.sportName), line);
        }

    },
    appendToConsole(game) {
        const games = this.gameFetcher.cachedGames.getGames(game.sportId);
        const timerSeconds = game.timerSeconds ? game.timerSeconds : '   ';
        const sportName = game.sportName.padEnd(10, ' ');

        let seqStr = SameScoreChecker.calcSeqCount(games).count;
        let clnStr = NoGoalSeriesChecker.calcSeqCount(games);
        seqStr = +seqStr >= config.watchScoreSeqCount - 1 ? String('S' + seqStr) : '  ';
        clnStr = +clnStr >= config.watchNoGoalsCount - 1 ? String('C' + clnStr) : '  ';

        let logStr = `${game.now} ${sportName}${seqStr} ${clnStr} `
            + `${game.event.id}  ${game.eventName} <${game.score}> ${timerSeconds} ${game.timerUpdate} `;

        const colorName = sportInfoByID[game.sportId].color;
        logStr = logStr[colorName];
        console.log(game.isNew() ? logStr.grey : logStr);

    },


};

exports.checkSeriesAndNotify = checkSeriesAndNotify;
