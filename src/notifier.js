'use strict';
const config = require("./config.js");
const mail = config.config.mail;
const nodemailer = require('nodemailer');

exports.sendMail = async function(message, test) {
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


};



