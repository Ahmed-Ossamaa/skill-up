require('dotenv').config();
const sendEmail = require('./src/utils/sendEmail');

(async () => {
    try {
        const res = await sendEmail({
            to: 'aossama2015@gmail.com', 
            subject: 'Test from SkillUp',
            text: 'If you received this, SMTP is working.',
            html: '<p>If you received this, <strong>SMTP is working</strong>.</p>'
        });
        console.log('Send result:', res);
    } catch (err) {
        console.error('Send failed:', err.message);
    }
})();
