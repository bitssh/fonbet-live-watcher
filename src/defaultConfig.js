exports.common = {

    // Подсчёт одинаковых серий голов
    scoreSeries: 6,
    scoreSeriesValues: ['1:1', '0:2', '0:3', '0:4', '2:2', '1:3'],

    // Подсчёт одинаковых серий голов
    scoreSeries2: 2,
    scoreSeriesValues2: ['3:0', '4:0'],

    // Подсчёт одинаковых серий голов
    scoreSeries3: 6,
    scoreSeriesValues3: [],

    // Подсчёт игр без голов после определённой секунды
    noGoalsSeries: 6,
    noGoalsFromSec: 280,

    // Подсчёт игр с голами после определённой секунды
    goalsSeries: 6,
    goalsFromSec: 280,

    // Подсчёт тоталов в конце матча (итоговая сумма голов)
    // например: Футбол - тотал меньше (больше) 7.5 в 5 матчах подряд
    totalSeries: 10,
    totalLessThan: 0.5,
    totalGreaterThan: 17.5,

    // Подсчёт индивидуальных тоталов
    // например: Синие - тотал голов больше 3.5 в 6 матчах подряд
    teamTotalSeries: 10,
    teamTotalLessThan: 0.5,
    teamTotalGreaterThan: 12.5,

    // Победные серии команд
    teamWinSeries: 6,

    // Непроигрышные серии команд
    teamUnbeatenSeries: 6,

    // Если до 200 секунды сумма голов 8 - прислать уведомление
    totalCount: 9,
    totalCountToSec: 1,

    // серия первого гола
    teamFirstGoalSeries: 3,
};

exports.parameters = {
    cachedGamesSize: 200,
    useDummyUrl: false,
    fetchTimeout:  this.useDummyUrl ? 100: 2000,
    fileWritingEnabled: true,
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
