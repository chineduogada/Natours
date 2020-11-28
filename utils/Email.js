const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

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

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Stanley C. Ogada <${process.env.EMAIL_FROM}>`;
  }

  createNewTransport() {
    if (process.env.NODE_ENV === 'production') {
      // Send Grid
      return 1;
    }

    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      post: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1. Render an HTML based on a PUG template
    const html = pug.renderFile(`${__dirname}/../views/email/${template}.pug`, {
      firstName: this.firstName,
      url: this.url,
      subject,
    });
    const text = htmlToText.fromString(html);

    // 2. Define the mailOptions
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text,
    };

    // 3. Create a transporter and send email
    const transporter = this.createNewTransport();
    await transporter.sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send('welcome', 'Welcome to the Natours Family.');
  }

  async sendPasswordReset() {
    await this.send(
      'passwordReset',
      'Your password reset token (valid for only 10 minutes!)'
    );
  }
};

