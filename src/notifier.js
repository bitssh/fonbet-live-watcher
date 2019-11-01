'use strict';
const nodemailer = require('nodemailer');
const recipients = 'ilya0191@ya.ru';

exports.sendMail = async function(message, test) {

    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = {
        user: 'lshtfum.ashf',
        pass: 'ololo&trololo',
    };

    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'smtp.yandex.ru',
        port: 465,


        secure: true, // true for 465, false for other ports
        auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
        }
    });


    if (test) {
        await transporter.verify();
        return;
    }
    // send mail with defined transport object
    return await transporter.sendMail({
        from: 'ilya0191 <lshtfum.ashf@ya.ru>', // sender address
        to: recipients, // list of receivers
        subject: 'Привет! ', // Subject line
        text: message, // plain text body
    });


};



