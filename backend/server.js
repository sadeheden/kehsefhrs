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
    return res.status(400).json({ error: 'Molimo ispunite sva obavezna polja.' });
  }

  const transporter = nodemailer.createTransport({
    host: 'mail.kehsef.hr',
    port: 587,
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });

  try {
    await transporter.verify();
    console.log('✓ SMTP connection verified');

    await transporter.sendMail({
      from: `"${name}" <${process.env.MAIL_USER}>`,
      replyTo: email,
      to: process.env.MAIL_USER,
      subject: subject || 'Nova poruka s kontakt forme',
      html: `
        <h2>Nova poruka s web forme</h2>
        <p><strong>Ime:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Predmet:</strong> ${subject || 'Nije naveden'}</p>
        <hr>
        <p><strong>Poruka:</strong></p>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
      text: `Nova poruka s web forme\n\nIme: ${name}\nEmail: ${email}\nPredmet: ${subject || 'Nije naveden'}\n\nPoruka:\n${message}`
    });

    console.log(`✓ Email sent from ${name} (${email})`);

    res.json({ 
      success: true,
      message: 'Poruka uspješno poslana!'
    });

  } catch (err) {
    console.error('✗ Error sending email:', err.message);
    res.status(500).json({ 
      error: 'Greška pri slanju emaila. Molimo pokušajte ponovno ili nas kontaktirajte direktno.',
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// For Vercel
module.exports = app;