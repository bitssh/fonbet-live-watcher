const rlFootballSportID = 44955;
// const rlHockeySportID = 48138;

exports.Game = class Game {

    constructor(scores) {
        this.now = new Date().toLocaleString();
        this.scores = scores ? scores : [];
    }

    get score () {
        return this.scores[this.scores.length - 1];
    }

    get timerSeconds () {
        return this.miscs.timerSeconds;
    }

    get isFootball () {
        return this.event.sportId === rlFootballSportID;
    }

    set isFootball (football) {
        if (!this.event) {
            this.event = {};
        }
        this.event.sportId = football ? rlFootballSportID : 0;
    }

    get isNew () {
        return this.score === '0:0';
    }

    get date() {
        return new Date(this.event.startTime * 1000).toLocaleDateString();
    }

    get timerUpdate() {
        return !this.miscs.timerUpdateTimestamp
            ? ''
            : new Date(this.miscs.timerUpdateTimestamp * 1000).toLocaleTimeString();
    }


}
