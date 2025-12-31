const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/kontakt', async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Please fill all required fields.' });
  }

  // Configure Nodemailer for cPanel SMTP
  const transporter = nodemailer.createTransport({
    host: 'mail.kehsef.hr',   // cPanel SMTP server
    port: 465,                // SSL port
    secure: true,             // true for port 465
    auth: {
      user: process.env.MAIL_USER,  // info@kehsef.hr
      pass: process.env.MAIL_PASS   // email password
    }
  });

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: process.env.MAIL_USER,  // your own company email
      subject: subject || 'New Contact Form Message',
      text: message,
    });

    res.json({ success: true });
  } catch (err) {
    console.error('Error sending email:', err);
    res.status(500).json({ error: 'Failed to send email.' });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}/kontakt`);
});
