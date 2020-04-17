// noinspection SpellCheckingInspection
const {common} = require("./defaultConfig");
const {parameters} = require("./defaultConfig");
const {mail} = require("./defaultConfig");

const customConfig = Object.assign({}, common, {

});


const football = Object.assign({}, customConfig, {
    sportId: 44955,
    label: 'Футбол',
    color: 'cyan',


});

const hockey = Object.assign({}, customConfig, {
    sportId: 48138,
    label: 'Хоккей',
    color: 'brightGreen',

});

const basketball = Object.assign({}, customConfig, {
    sportId: 54698,
    label: 'Баскетбол',
    color: 'grey',

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


