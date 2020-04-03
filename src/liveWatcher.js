"use strict";
// https://www.fonbet.ru/#!/live/rocket-league

const config = require("./config.js").common;
const notifying = require('./notifying.js');
const Notifier = notifying.Notifier;
const fileTools = require('./fileTools.js');
const {TotalSequenceChecker} = require("./sequenceChecking/TotalSequenceChecker");
const {GoalsChecker} = require("./sequenceChecking/GoalsChecker");
const {SameScoreChecker} = require("./sequenceChecking/SameScoreChecker");
const {NoGoalsChecker} = require("./sequenceChecking/NoGoalsChecker");
const rlBasketballSportID = 54698;
const watchSportIDList = [rlFootballSportID, rlHockeySportID, rlBasketballSportID];
const sportNameByID = {
    [rlFootballSportID]: 'Футбол',
    [rlHockeySportID]: 'Хоккей',
    [rlBasketballSportID]: 'Баскетбол',
};

const sequenceCheckerClasses = [
    SameScoreChecker,
    NoGoalsChecker,
    GoalsChecker,
    TotalSequenceChecker,
];

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
    getCSVFilename (sportName) {
        return `./../csv/${sportName}.csv`;
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
            this.checkSequences(game);
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
        const timerSeconds =  game.timerSeconds ? game.timerSeconds : '   ';
        const indent = game.sportName;

        let seqStr = SameScoreChecker.calcSeqCount(games).count;
        let clnStr = NoGoalsChecker.calcSeqCount(games);
        seqStr =  + seqStr >= config.watchScoreSeqCount - 1 ? String('S' + seqStr).yellow : '  ';
        clnStr =  + clnStr >= config.watchNoGoalsCount - 1 ? String('C' + clnStr).yellow : '  ';

        let logStr = `${game.now} ${indent}${seqStr} ${clnStr} `
            + `${game.event.id}  ${game.event.name} <${game.score}> ${timerSeconds} ${game.timerUpdate} `;
        console.log(game.isNew() ? logStr.grey: logStr );

    },

    checkSequences(game) {
        const games = this.gameFetcher.cachedGames.getGames(game.isFootball);

        const sportName = game.isFootball ? 'Футбол' : 'Хоккей';
        const notifier  = new Notifier(sportName, game.event ? game.event.name : '');

        for (let SequenceCheckerClass of sequenceCheckerClasses) {
            const sequenceChecker = new SequenceCheckerClass(games, game);
            if (sequenceChecker.checkCondition(games, game)) {
                sequenceChecker.sendNotification(notifier);
            }
        }
    },


};

