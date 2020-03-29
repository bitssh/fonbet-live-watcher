const rlFootballSportID = 44955;
// const rlHockeySportID = 48138;

class Game {

    constructor(scores) {
        this.now = new Date().toLocaleString();
        this.scores = scores ? scores : [];
        this.list = null;
    }
    get score () {
        return this.scores[this.scores.length - 1];
    }
    get total () {
        return this.getTeamTotal(0) + this.getTeamTotal(1);
    }
    getTeamTotal(teamNumber) {
        return Number(this.score.split(':')[teamNumber]);
    }
    get timerSeconds () {
        return this.miscs.timerSeconds;
    }
    set timerSeconds (value) {
        if (!this.miscs) {
            this.miscs = {};
        }
        this.miscs.timerSeconds = value;
    }
    get isFootball () {
        return this.event ? this.event.sportId === rlFootballSportID : true;
    }
    set isFootball (football) {
        if (!this.event) {
            this.event = {};
        }
        this.event.sportId = football ? rlFootballSportID : 0;
    }
    get date() {
        return new Date(this.event.startTime * 1000).toLocaleDateString();
    }
    get timerUpdate() {
        return !this.miscs.timerUpdateTimestamp
            ? ''
            : new Date(this.miscs.timerUpdateTimestamp * 1000).toLocaleTimeString();
    }
    isNew() {
        return this.list ? this.list.isNew(this) : this.score === '0:0';
    }
}

exports.GameMap = class GameMap extends Map {

    getGames(football) {
        return Array.from(this.values()).filter((item) => item.isFootball === football);
    }
    isNew(game) {
        if (game.score !== '0:0')
             return false;
        const sameGames = this.getGames(game.isFootball);
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
