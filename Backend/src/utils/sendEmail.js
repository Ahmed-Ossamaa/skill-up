const axios = require('axios');
const ApiError = require('./ApiError');

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    console.log(`Sending email via Brevo API to ${to}...`);

    const url = 'https://api.brevo.com/v3/smtp/email';
    
    const data = {
      sender: { 
        email: process.env.EMAIL_FROM, 
        name: 'SkillUp'
      },
      to: [
        { email: to }
      ],
      subject: subject,
      htmlContent: html,
      textContent: text
    };

    const config = {
      headers: {
        'accept': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
        'content-type': 'application/json'
      }
    };

    const response = await axios.post(url, data, config);

    console.log('Email sent successfully. Message ID:', response.data.messageId);
    return response.data;
  } catch (error) {
    console.error('Brevo API Error:', error.response?.data || error.message);
    throw  ApiError.internal('Email could not be sent');
  }
};

module.exports = sendEmail;


// const nodemailer = require('nodemailer');
// const ApiError = require('./ApiError');

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   secure: Number(process.env.EMAIL_PORT) === 465,
//   auth: {
//     user: process.env.EMAIL_USERNAME,
//     pass: process.env.EMAIL_PASSWORD,
//   },
//   tls: {
//     ciphers: 'SSLv3',
//     rejectUnauthorized: false
//   },
//   family: 4
// });

// async function sendEmail({ to, subject, html, text }) {
//   try {
//     const mailOptions = {
//       from: process.env.EMAIL_FROM,
//       to,
//       subject,
//       html,
//       text,
//     };

//     const info = await transporter.sendMail(mailOptions);
//     console.log(' Email sent:', info.messageId);
//     return info;
//   } catch (error) {
//     console.error(' Email error:', error);
//     throw  ApiError.internal('Email could not be sent');
//   }
// }

// module.exports = sendEmail;

