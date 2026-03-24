const nodemailer = require('nodemailer');
const createTransporter = () =>
  nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    connectionTimeout: 20000,
  });

const sendOTPEmail = async (email, otp, name) => {
  try {
    const transporter = createTransporter();
    await transporter.sendMail({
      from: `"LuxeShop" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Your LuxeShop OTP Verification Code',
      html: `
        <div style="font-family:'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#f7f5f0;border-radius:16px;overflow:hidden">
          <div style="background:#1a1a2e;padding:28px 32px;text-align:center">
            <h1 style="color:white;font-size:22px;margin:0">◆ LUXE<span style="color:#e94560">SHOP</span></h1>
          </div>
          <div style="padding:32px">
            <h2 style="color:#1a1a2e;margin-bottom:8px">Hello ${name || 'there'} 👋</h2>
            <p style="color:#6b6b8a;margin-bottom:24px">Use the OTP below to verify your account. It expires in <strong>10 minutes</strong>.</p>
            <div style="background:#1a1a2e;border-radius:12px;padding:24px;text-align:center;margin-bottom:24px">
              <div style="letter-spacing:12px;font-size:36px;font-weight:700;color:white">${otp}</div>
            </div>
            <p style="color:#6b6b8a;font-size:13px">If you didn't request this, please ignore this email.</p>
          </div>
          <div style="background:#f0ece5;padding:16px 32px;text-align:center">
            <p style="color:#aaa;font-size:12px;margin:0">© 2025 LuxeShop. All rights reserved.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('OTP email error:', err.message);
    throw err;
  }
};

module.exports = { sendOTPEmail };