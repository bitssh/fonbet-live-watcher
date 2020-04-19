const {LastGameTotalChecker} = require("../seriesChecking/LastGameTotalChecker");
const {GameTester} = require("./testTools");
const {describe, it, before} = require("mocha");
const assert = require("assert");
const notifying = require('../notifying.js');
const {hockey} = require("../config");
//
// it("проверка авторизации почтовой учётки на stmp" , function(done){
//
//     sendMail(`test`, true)
//         .then(() => done())
//         .catch(error => console.error (error.message.red));
//
// });

// it("проверка отправки письма" , function(done){
//     sendMail('всё ок', false)
//         .then(() => done())
//         .catch(error => console.error (error.message.red));
//
// });

describe("sendNotification", function () {

    let sentText;
    before(() => {
        notifying.mailSender.send = (text) => {
            sentText = text;
            return Promise.resolve({messageId: ''});
        }
    });

    it("проверка текста письма", function () {
        const gameTester = new GameTester(LastGameTotalChecker);

        gameTester.push({
            scores: ['1:2'],
            timerSeconds: 49,
            sportId: hockey.sportId,
            eventName: 'Красные - зеленые'
        });
        hockey.totalCount = 3;
        hockey.totalCountToSec = 50;
        let checker = gameTester.createChecker();
        assert.equal(checker.checkCondition(), true);
        checker.sendNotification();
        assert.equal(sentText, 'Хоккей - до 50 секунды сумма голов 3, Красные - зеленые');
    });
});



