// noinspection SpellCheckingInspection
exports.common = {
    // Подсчёт одинаковых серий голов
    watchScoreSeqCount: 3,
    watchScoreSeq: ['1:1', '2:2', '0:2', '0:3', '0:4'],

    // Подсчёт игр без голов после определённой секунды
    watchNoGoalsCount: 3,
    watchNoGoalsFromSec: 270,

    // Подсчёт игр с голами после определённой секунды
    watchGoalsCount: 3,
    watchGoalsFromSec: 270,

    // Подсчёт тоталов в конце матча (итоговая сумма голов)
    // например: Футбол - тотал меньше (больше) 7.5 в 5 матчах подряд
    watchTotalSeqCount: 5,
    watchTotalSeqLessThan: 7.5,
    watchTotalSeqMoreThan: 7.5,

    // Подсчёт индивидуальных тоталов
    // например: Синие - тотал голов больше 3.5 в 6 матчах подряд
    watchTeamTotalSeqCount: 5,
    watchTeamTotalSeqLessThan: 3.5,
    watchTeamTotalSeqMoreThan: 3.5,

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

// noinspection SpellCheckingInspection
exports.mail = {
    host: 'smtp.yandex.ru',
    port: 465,
    user: 'lshtfum.ashf',
    pass: 'ololo&trololo',
    subject: 'Fonbet',
    recipients: 'ilya0191@ya.ru',
    from: 'ilya0191 <lshtfum.ashf@ya.ru>',
};

