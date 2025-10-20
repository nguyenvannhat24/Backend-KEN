const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER || 'nhat.nguyen@software.codegym.vn', // email của bạn
    pass: process.env.EMAIL_PASS||'vzik wopx sclk ylpq' // mật khẩu ứng dụng (App Password)
  },
});

async function sendMail(to, subject, html) {
  await transporter.sendMail({
    from: `"Hệ thống CodeGym" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}

module.exports = { sendMail };
