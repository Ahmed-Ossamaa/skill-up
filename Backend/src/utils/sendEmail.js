const nodemailer = require('nodemailer');
const ApiError = require('./ApiError');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    ciphers: 'SSLv3',
    rejectUnauthorized: false
  },
  family: 4
});

async function sendEmail({ to, subject, html, text }) {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(' Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error(' Email error:', error);
    throw  ApiError.internal('Email could not be sent');
  }
}

module.exports = sendEmail;
