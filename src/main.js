const liveWatcher = require('./liveWatcher.js').liveWatcher;

console.log('initialized');
liveWatcher.grabUpdates();

const timerId = setInterval(() => {
        liveWatcher.grabUpdates().catch((e) => {
            console.error(e.message.red);
            if (liveWatcher.useDummyUrl) {
                clearInterval(timerId)
            }
        })
    },
    liveWatcher.getFetchTimeout()
);


