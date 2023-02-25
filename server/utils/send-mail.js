
const nodemailer = require('nodemailer')

async function sendMail (from, to, subject, message, options) {
  const transporter = nodemailer.createTransport(options)
  const info = await transporter.sendMail({
    from,
    to,
    subject,
    text: message
  })

  console.log("Email sent: %s", info.messageId)
}

module.exports = sendMail
