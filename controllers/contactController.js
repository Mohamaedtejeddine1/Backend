const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');

const sendEmail = async (to, subject, text, html) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'meknitej2003@gmail.com',
      pass: 'rwcystwdblflibvu', // App password, not your Gmail password
    },
  });

  const mailOptions = {
    from: 'meknitej2003@gmail.com',
    to, // Now it's dynamic
    subject,
    text,
    html,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { fullName, email, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ msg: 'All fields are required' });
    }

    const newMessage = await ContactMessage.create({ fullName, email, message });

    await sendEmail(
      'meknitej2003@gmail.com', // You (admin) receive the email
      'New Contact Message',
      'You have a new contact message.',
      `<p><strong>Name:</strong> ${fullName}</p><p><strong>Email:</strong> ${email}</p><p><strong>Message:</strong> ${message}</p>`
    );

    res.status(200).json({ msg: 'Message sent successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.getAllMessage =async  (req,res) =>{
    try {
        const messages = await ContactMessage.find();  // 
        res.json(messages);
      } catch (error) {
        res.status(500).json({ message: 'Error fetching messages' });
      }
    };

exports.deleteMessage = async (req, res) => {
  try {
    const deletedMessage = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!deletedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }
    res.status(200).json({ message: 'Message deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
}