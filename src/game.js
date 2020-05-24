const {sportConfigByID} = require("./config");
const _ = require('lodash');

class Game {

    constructor(scores) {

        this.scores = scores ? scores : [];
        this.list = null;
    }
    get score() {
        return this.scores[this.scores.length - 1] || [];
    }
    get scoreStr() {
        return this.score ? this.score.join(':') : '';
    }
    get total() {
        return this.score[0] + this.score[1];
    }
    get timerSeconds() {
        return this.miscs.timerSeconds;
    }
    set timerSeconds(value) {
        if (!this.miscs) {
            this.miscs = {};
        }
        this.miscs.timerSeconds = value;
    }
    get sportId() {
        return this.event.sportId;
    }
    set sportId(val) {
        if (!this.event) {
            this.event = {};
        }
        this.event.sportId = val;
    }
    get sportName() {
        return sportConfigByID[this.sportId].label;
    }
    get timerUpdate() {
        return !this.miscs.timerUpdateTimestamp
            ? ''
            : new Date(this.miscs.timerUpdateTimestamp * 1000).toLocaleTimeString();
    }
    get now() {
        return new Date().toLocaleString();
    }
    get eventName() {
        return this.event ? this.event.name : '';
    }
    set eventName(val) {
        if (!this.event) {
            this.event = {};
        }
        this.event.name = val;
    }
    getTeamName(number) {
        return number === 0 ? this.event.team1 : this.event.team2;
    }
    /**
     *
     * @param {string} score
     * @returns {number[]}
     */
    parseScore(score) {
        return score.split(':').map(item => Number(item));
    }
    addScore(score) {
        this.scores.push(this.parseScore(score));
    }
    /**
     *
     * @param {string} score
     * @returns {* | boolean}
     * @param {boolean} anyOrder
     */
    hasScore(score, anyOrder = true) {
        const arrayHasSubArray = (array, subArray) => _.some(array, (v) => _.isEqual(v, subArray));

        const parsedScore = this.parseScore(score);
        return arrayHasSubArray(this.scores, parsedScore) || (anyOrder && arrayHasSubArray(this.scores, parsedScore.reverse()));

    }
    isNew() {
        return this.list ? this.list.isNew(this) : this.total === 0;
    }
}

exports.GameMap = class GameMap extends Map {

    get games() {
        return Array.from(this.values());
    }
    get lastGame() {
        return this.games[this.games.length - 1];
    }
    getGames(sportId) {
        return this.games.filter((item) => item.sportId === sportId);
    }
    isNew(game) {
        if (game.total !== 0)
            return false;
        const sameGames = this.getGames(game.sportId);
        return !sameGames.length || sameGames[sameGames.length - 1] === game;
    }
    newGame(eventId) {
        const game = new Game();
        game.list = this;
        this.set(eventId, game);
        return game;
    }
};

exports.Game = Game;
