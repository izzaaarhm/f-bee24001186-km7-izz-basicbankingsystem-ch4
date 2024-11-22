const nodemailer = require('nodemailer');

// Bikin transporter untuk pengaturan email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,  
  port: process.env.SMTP_PORT,  
  secure: true, 
  auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, html) => {
  try {
      await transporter.sendMail({
          from: `"Basic Banking System" <${process.env.EMAIL_USER}>`,
          to,
          subject,
          html,
      });
      return { massage: 'Email berhasil terkirim'};
  } catch (error) {
      throw new Error('Error saat mengirim email:', error);
  }
};

module.exports = {
  sendEmail,
};