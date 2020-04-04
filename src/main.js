const liveWatcher = require('./liveWatcher.js').liveWatcher;
const config = require("./config.js").common;
require("colors");

console.log('initialized');
liveWatcher.initialize();

(async function watch() {
    try {
        await liveWatcher.getAndCheckUpdates();
    } catch (err) {
        console.error(err.message.red);
    }
    if (!liveWatcher.useDummyUrl) {
        setTimeout(watch, config.fetchTimeout);
    }
})();


