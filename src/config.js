// noinspection SpellCheckingInspection
exports.config = {
    watchScoreSeqCount: 3,
    watchScoreSeq: ['1:1', '2:2', '0:2', '0:3', '0:4'],

    watchNoGoalsCount: 3,
    watchNoGoalsFromSec: 270,

    cachedGamesSize: 30,
    useDummyUrl: false,
    fileWritingEnabled: true,

    mail: {
        host: 'smtp.yandex.ru',
        port: 465,
        user: 'lshtfum.ashf',
        pass: 'ololo&trololo',
        subject: 'Fonbet',
        recipients: 'ilya0191@ya.ru',
        from: 'ilya0191 <lshtfum.ashf@ya.ru>',
    }
};

