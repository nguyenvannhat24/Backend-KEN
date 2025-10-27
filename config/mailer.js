const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // email của bạn
    pass: process.env.EMAIL_PASS, // mật khẩu ứng dụng (App Password)
  },
});

async function sendMail(to, subject, html) {
  await transporter.sendMail({
    from: `"Hệ thống KEN" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendMail };
