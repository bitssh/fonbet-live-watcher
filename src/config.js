// noinspection SpellCheckingInspection
exports.common = {
    watchScoreSeqCount: 3,
    watchScoreSeq: ['1:1', '2:2', '0:2', '0:3', '0:4'],

    watchNoGoalsCount: 3,
    watchNoGoalsFromSec: 270,

    watchGoalsCount: 3,
    watchGoalsFromSec: 270,

    // Подсчёт тоталов в конце матча (итоговая сумма голов)
    // например: Футбол - тотал меньше 7.5 в 5 матчах подряд
    watchTotalSeqLessThan: 7.5,
    watchTotalSeqCount: 5,

    // Если до 200 секунды сумма голов 8 - прислать уведомление
    watchTotalCountToSec: 200,
    watchTotalCount: 8,

    cachedGamesSize: 200,
    useDummyUrl: false,
    fileWritingEnabled: true,
};

const sportsIds = {
    football: 44955,
    hockey: 48138,
    basketball: 54698,
};
exports.watchSportsIds = sportsIds;

exports.sportInfoByID = {
    [sportsIds.football]: {
        name: 'Футбол',
        color: 'blue',
    },
    [sportsIds.hockey]: {
        name: 'Хоккей',
        color: 'yellow',
    },
    [sportsIds.basketball]: {
        name: 'Баскетбол',
        color: 'green',
    },
};

exports.mail = {
    host: 'smtp.yandex.ru',
    port: 465,
    user: 'lshtfum.ashf',
    pass: 'ololo&trololo',
    subject: 'Fonbet',
    recipients: 'ilya0191@ya.ru',
    from: 'ilya0191 <lshtfum.ashf@ya.ru>',
};

