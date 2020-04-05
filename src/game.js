const {sportInfoByID} = require("./config");

class Game {

    constructor(scores) {
        this.scores = scores ? scores : [];
        this.list = null;
    }
    get score() {
        return this.scores[this.scores.length - 1];
    }
    get total() {
        return this.getTeamScore(0) + this.getTeamScore(1);
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
        return sportInfoByID[this.sportId].name;
    }
    get timerUpdate() {
        return !this.miscs.timerUpdateTimestamp
            ? ''
            : new Date(this.miscs.timerUpdateTimestamp * 1000).toLocaleTimeString();
    }
    get now () {
        return new Date().toLocaleString();
    }
    getTeamScore(teamNumber) {
        return Number(this.score.split(':')[teamNumber]);
    }
    isNew() {
        return this.list ? this.list.isNew(this) : this.score === '0:0';
    }
}

exports.GameMap = class GameMap extends Map {

    getGames(sportId) {
        return this.games.filter((item) => item.sportId === sportId);
    }
    isNew(game) {
        if (game.score !== '0:0')
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
    get games () {
        return Array.from(this.values());
    }
    get lastGame () {
        return this.games[this.games.length - 1];
    }
};

exports.Game = Game;
