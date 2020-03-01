'use strict';
const config = require("./config.js").common;
const mail = require("./config.js").mail;
const nodemailer = require('nodemailer');

let sender = {
    sendMail: async function(message, test) {
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

class Notifier {
    constructor(sportName, matchName) {
        this.sportName = sportName;
        this.matchName = matchName;
    }

    sendNotification(notificationGetter) {
        this.sendText(notificationGetter.notificationText);
    }

    sendText(text) {
        text = `${this.sportName} - ${text}` + (this.matchName ? `, ${this.matchName}` : '');
        sender.sendMail(text)
            .then((info) => console.log('Message sent: '.green + `${text} ${info.messageId} `))
            .catch(err => console.error(text + ' ' + err.message.red));
    }
}

exports.sender = sender;
exports.Notifier = Notifier;


