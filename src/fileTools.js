const fs = require('fs');
const readline = require('readline');
const Stream = require('stream');

exports.getLastLine = (fileName, minLength) => {
    if (!fs.existsSync(fileName))
        return Promise.resolve(null);
    let inStream = fs.createReadStream(fileName);
    let outStream = new Stream;
    return new Promise((resolve, reject) => {
        let rl = readline.createInterface(inStream, outStream);

        let lastLine = '';
        rl.on('line', function (line) {
            if (line.length >= minLength) {
                lastLine = line;
            }
        });

        rl.on('error', reject);

        rl.on('close', function () {
            resolve(lastLine)
        });
    })
};

/**
 *
 * @param {string} filePath
 * @param {Array} lines
 * @param {boolean} appendUtf8BOM
 */
function appendLinesToFile (filePath, lines, appendUtf8BOM) {
    try {
        if (appendUtf8BOM && !fs.existsSync(filePath)) {
            if (!lines.length) {
                lines.push('');
            }
            lines[0] = '\ufeff' + lines[0];
        }
        const fd = fs.openSync(filePath, 'a');
        try {
            for (let line of lines) {
                fs.appendFileSync(fd, line + '\r\n', {encoding: 'utf8'});
            }
        } finally {
            fs.closeSync(fd);
        }
    } catch (err) {
        console.error(err)
    }
}

exports.appendFile = (filePath, data, appendUtf8BOM) => appendLinesToFile(filePath, [data], appendUtf8BOM);
exports.appendLinesToFile = appendLinesToFile;


