// utils/mailer.js
const nodemailer = require('nodemailer');

// Create a transporter object using your email service (Gmail, SendGrid, etc.)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'meknitej2003@gmail.com',  // your email address
        pass: 'rwcystwdblflibvu'         // your app password (not your regular Gmail password)
    }
});

// Define the sendEmail function
const sendEmail = (to, subject, text, html) => {
    const mailOptions = {
        from: 'meknitej2003@gmail.com',    // sender address
        to:'yahyaouiayoub10@gmail.com',                                // recipient's email
        subject,                           // subject line
        text,                              // plain text body
        html                              // HTML body
    };

    // Send the email
    return transporter.sendMail(mailOptions)
        .then(info => {
            console.log('Email sent: ' + info.response);
            return info;
        })
        .catch(error => {
            console.log('Error sending email:', error);
            throw error; // Rethrow error to be handled later
        });
};

// Export the function
module.exports = sendEmail;
