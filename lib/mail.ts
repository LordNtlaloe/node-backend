const nodemailer = require("nodemailer");

// Read SMTP config from environment variables
const transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST || "smtp.mailtrap.io",
    port: Number(process.env.MAIL_PORT) || 2525,
    auth: {
        user: process.env.MAIL_USER || "your_mailtrap_user",
        pass: process.env.MAIL_PASS || "your_mailtrap_pass",
    },
});

/**
 * Send an email
 * @param to recipient email
 * @param subject email subject
 * @param text plain text body
 */
function sendEmail(to: string, subject: string, text: string) {
    return transporter.sendMail({
        from: 'ntlal0e182@gmail.com',
        to,
        subject,
        text,
    });
}

module.exports = { sendEmail };
