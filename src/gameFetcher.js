const Game = require("./game").Game;
const config = require("./config.js").common;
const fetch = require('node-fetch');

exports.gameFetcher = {
    subDomains: ['line11', 'line12', 'line16', 'line31'],
    lastPacketVersion: 0,
    sportsIDs: new Set,
    cachedGames: new Map(),

    getFetchTimeout() {
        return config.useDummyUrl ? 100 : 2000;
    },

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
                cachedGame = new Game();

                this.cachedGames.set(event.id, cachedGame);
            }
            cachedGame.event = event;
        }

        for (let cachedGame of this.cachedGames.values()) {
            let miscs = responseData.eventMiscs.filter(miscs => cachedGame.event.id === miscs.id)[0];
            if (miscs !== undefined) {
                const score = `${miscs.score1}:${miscs.score2}`;
                if (cachedGame.score !== score) {
                    cachedGame.miscs = miscs;
                    cachedGame.scores.push(score);
                    result.add(cachedGame);
                }
            }

        }
        return result;
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
};
