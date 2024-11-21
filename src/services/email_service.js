const nodemailer = require('nodemailer');

// Bikin transporter untuk pengaturan email
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'your-email@gmail.com',
    pass: 'your-password' //pake .env buat nyimpen pass
  }
});

// Ngatur opsi email
const mailOptions = {
  from: 'your-email@gmail.com',
  to: 'recipient@example.com', 
  subject: 'Hello from the other siiideeee~',
  text: 'Hello, this is a test email using Nodemailerr'
};

// Mengirim email
transporter.sendMail(mailOptions, function(error, info) {
  if (error) {
    console.log('Error occurred:', error);
  } else {
    console.log('Email sent: ' + info.response);
  }
});
