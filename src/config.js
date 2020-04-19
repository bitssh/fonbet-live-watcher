// noinspection SpellCheckingInspection
const {common} = require("./defaultConfig");
const {parameters} = require("./defaultConfig");
const {mail} = require("./defaultConfig");

const customConfig = Object.assign({}, common, {
    teamFirstGoalSeries: 1,
});


const football = Object.assign({}, customConfig, {
    sportId: 44955,
    label: 'Футбол',
    color: 'cyan',


    // Подсчёт одинаковых серий голов
    scoreSeries: 3,
    scoreSeriesValues: ['1:1', '0:2', '0:3', '0:4', '2:2', '1:3'],
});

const hockey = Object.assign({}, customConfig, {
    sportId: 48138,
    label: 'Хоккей',
    color: 'brightGreen',

    // Подсчёт одинаковых серий голов
    scoreSeries: 2,
    scoreSeriesValues: ['1:1', '1:3'],

    // Подсчёт одинаковых серий голов
    scoreSeries2: 2,
    scoreSeriesValues2: [],

});

const basketball = Object.assign({}, customConfig, {
    sportId: 54698,
    label: 'Баскетбол',
    color: 'grey',

    // Подсчёт одинаковых серий голов
    scoreSeries: 6,
    scoreSeriesValues: [],

    // Подсчёт одинаковых серий голов
    scoreSeries2: 2,
    scoreSeriesValues2: ['0:2', '1:2'],
});

exports.customConfig = customConfig;
exports.basketball = basketball;
exports.football = football;
exports.hockey = hockey;

exports.sportConfigByID = {
    [basketball.sportId]: basketball,
    [hockey.sportId]: hockey,
    [football.sportId]: football,
};



exports.parameters = Object.assign({}, parameters, {

});

exports.mail = Object.assign({}, mail, {

});


