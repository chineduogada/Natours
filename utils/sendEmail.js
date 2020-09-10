const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  /**
   * Steps
   * 1. Create a Transporter
   *  - the Transporter lets us defined a service that will send the Email. e.g., Gmail, Yahoo, HotMail etc...
   *  - it's not Node.js that will send the email itself
   *
   * 2. define the mailOptions
   * 3. send email
   */

  // For configuring GMAIL
  // Then reason we're not using Gmail is BC, it's not ideal for a production app.
  // you can only send 500 emails per day (you could be marked as a SPAMer!). maybe good for small app scales.
  // const transporter = nodemailer.createTransport({
  //   auth: {
  //     user: process.env.EMAIL_USERNAME,
  //     pass: process.env.EMAIL_PASSWORD,
  //   },
  //   // Activate in gmail app "less secure app" option
  // });

  // For PROD: SendGrid

  // For DEV: MailTrap.io
  // A special DEV service which actually fakes to send email to real addresses.
  // But in reality these emails end trapped in a DEV inbox.
  // So we know how they will look later in PROD.

  // 1.
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  // 2.
  const mailOptions = {
    from: 'Stanley Chinedu Ogada <chineduogada@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.message,
    // html:
  };

  // 3.
  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;

