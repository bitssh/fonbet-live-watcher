'use strict';
const mail = require("./config.js").mail;
const nodemailer = require('nodemailer');



let mailSender = {
    send: async function (message, test) {
        let transporter = nodemailer.createTransport({
            host: mail.host,
            port: mail.port,
            secure: true, // true for 465, false for other ports
            auth: {
                user: mail.user,
                pass: mail.pass,
            }
        });
        if (test) {
            await transporter.verify();
            return;
        }
        return await transporter.sendMail({
            from: mail.sender,
            to: mail.recipients,
            subject: mail.subject,
            text: message,
        });
    }
};

function sendNotification({sportName, matchName, text}) {
    text = `${sportName} - ${text}` + (matchName ? `, ${matchName}` : '');
    mailSender.send(text)
        .then((info) => console.log('Message sent: '.green + `${text} ${info.messageId} `))
        .catch(err => console.error(text + ' ' + err.message.red));
}

exports.mailSender = mailSender;
exports.sendNotification = sendNotification;


