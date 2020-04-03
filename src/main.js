const liveWatcher = require('./liveWatcher.js').liveWatcher;
require("colors");

console.log('initialized');
liveWatcher.initialize();
liveWatcher.grabUpdates();

const timerId = setInterval(() => {
        liveWatcher.grabUpdates().catch((e) => {
            console.error(e.message.red);
            if (liveWatcher.useDummyUrl) {
                clearInterval(timerId)
            }
        })
    },
    liveWatcher.gameFetcher.getFetchTimeout()
);


