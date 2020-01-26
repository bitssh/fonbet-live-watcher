'use strict';
const config = require("./config.js").common;
const mail = require("./config.js").mail;
const nodemailer = require('nodemailer');

class baseNotification {
    constructor(seqCount, data) {
        this.seqCount = seqCount;
        this.data = data;
    }
}

exports.noGoalsNotification = class noGoalsNotification extends baseNotification {
    getText() {
        return `нет голов в ${this.seqCount} матчах с ${config.watchNoGoalsFromSec} секунды`;
    }
};

exports.goalsNotification = class extends baseNotification {
    getText() {
        return `голы в ${this.seqCount} матчах с ${config.watchNoGoalsFromSec} секунды`;
    }
};

exports.scoreSeqNotification = class extends baseNotification {
    getText() {
        return `серия из ${this.seqCount} матчей ${this.data}`;
    }
};
function sendText (text) {
    text = `${this.sportName} - ${text}` + this.matchName ? `, ${this.matchName}` : '';
    sendMail(text)
        .then ((info) => console.log('Message sent: '.green + `${text} ${info.messageId} `))
        .catch(err => console.error(text + ' ' + err.message.red));

}

let sender = {
    sendNotification: function (notification) {
        sendText(notification.getText());
    },

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

exports.sender = sender;

exports.Notifier = class {
    constructor (sportName, matchName) {
        this.sportName = sportName;
        this.matchName = matchName;
    }

    send(notification) {
        sender.sendNotification(notification);
    }
};


