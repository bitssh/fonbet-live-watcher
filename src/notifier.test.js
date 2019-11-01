const notifier = require('./notifier.js');


it("проверка авторизации почтовой учётки на stmp" , function(done){

    notifier.sendMail(`test`, true)
        .then(() => done())
        .catch(error => console.error (error.message.red));

});

// it("проверка отправки письма" , function(done){
//     notifier.sendMail('всё ок', false)
//         .then(() => done())
//         .catch(error => console.error (error.message.red));
//
// });



