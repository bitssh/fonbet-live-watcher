// noinspection SpellCheckingInspection
exports.common = {
    // Подсчёт одинаковых серий голов
    watchScoreSeqCount: 6,
    watchScoreSeq: ['1:1', '0:2', '0:3', '0:4', '2:2', '1:3'],

    // Подсчёт игр без голов после определённой секунды
    watchNoGoalsCount: 6,
    watchNoGoalsFromSec: 280,

    // Подсчёт игр с голами после определённой секунды
    watchGoalsCount: 6,
    watchGoalsFromSec: 280,

    // Подсчёт тоталов в конце матча (итоговая сумма голов)
    // например: Футбол - тотал меньше (больше) 7.5 в 5 матчах подряд
    watchTotalSeqCount: 10,
    watchTotalSeqLessThan: 0.5,
    watchTotalSeqGreaterThan: 17.5,

    // Подсчёт индивидуальных тоталов
    // например: Синие - тотал голов больше 3.5 в 6 матчах подряд
    watchTeamTotalSeqCount: 10,
    watchTeamTotalSeqLessThan: 0.5,
    watchTeamTotalSeqGreaterThan: 12.5,

    // Победные серии команд
    watchTeamWinSeries: 6,

    // Если до 200 секунды сумма голов 8 - прислать уведомление
    watchTotalCountToSec: 1,
    watchTotalCount: 9,

    cachedGamesSize: 200,
    useDummyUrl: false,
    fetchTimeout:  this.useDummyUrl ? 100: 2000,
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
        color: 'cyan',
    },
    [sportsIds.hockey]: {
        name: 'Хоккей',
        color: 'brightGreen',
    },
    [sportsIds.basketball]: {
        name: 'Баскетбол',
        color: 'grey',
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

