const liveWatcher = require('./liveWatcher.js').liveWatcher;
const {parameters} = require("./config.js");
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
        setTimeout(watch, parameters.fetchTimeout);
    }
})();


