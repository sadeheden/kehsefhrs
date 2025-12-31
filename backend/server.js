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

  // Configure Nodemailer for cPanel SMTP
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
    // Verify connection
    await transporter.verify();
    console.log('✓ SMTP connection verified');

    // Send email to company
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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📧 Email configured for: ${process.env.MAIL_USER}`);
});