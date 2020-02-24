'use strict';
const config = require("./config.js").common;
const mail = require("./config.js").mail;
const nodemailer = require('nodemailer');

class BaseNotification {
    constructor(seqCount) {
        this.seqCount = seqCount;
    }
    getText() {}
}

class NoGoalsNotification extends BaseNotification {
    getText() {
        return `нет голов в ${this.seqCount} матчах с ${config.watchNoGoalsFromSec} секунды`;
    }
}

class GoalsNotification extends BaseNotification {
    getText() {
        return `голы в ${this.seqCount} матчах с ${config.watchNoGoalsFromSec} секунды`;
    }
}

class ScoreSeqNotification  extends BaseNotification {
    constructor(seqCount, score) {
        super(seqCount);
        this.seqCount = seqCount;
        this.score = score;
    }
    getText() {
        return `серия из ${this.seqCount} матчей ${this.data}`;
    }
}

function sendText (text) {
    text = `${this.sportName} - ${text}` + this.matchName ? `, ${this.matchName}` : '';
    sender.sendMail(text)
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

 class Notifier {
    constructor (sportName, matchName) {
        this.sportName = sportName;
        this.matchName = matchName;
    }

    send(notification) {
        sender.sendNotification(notification);
    }
}

exports.sender = sender;
exports.ScoreSeqNotification = ScoreSeqNotification;
exports.GoalsNotification = GoalsNotification;
exports.NoGoalsNotification = NoGoalsNotification;
exports.Notifier = Notifier;


