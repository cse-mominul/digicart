const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (options) => {
  const mailOptions = {
    from: `"E-KINUN" <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

const sendOTP = async (email, otp, type = 'verification') => {
  const subject = type === 'verification' ? 'Email Verification OTP' : 'Password Reset OTP';
  const message = `Your OTP for ${type === 'verification' ? 'email verification' : 'password reset'} is: ${otp}. It will expire in 10 minutes.`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e1e1e1; rounded-2xl;">
      <h2 style="color: #2563eb; text-align: center;">E-KINUN</h2>
      <p>Hello,</p>
      <p>Your OTP for <strong>${type === 'verification' ? 'email verification' : 'password reset'}</strong> is:</p>
      <div style="text-align: center; margin: 30px 0;">
        <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2563eb; background: #f0f7ff; padding: 10px 20px; border-radius: 10px;">
          ${otp}
        </span>
      </div>
      <p>This OTP is valid for <strong>10 minutes</strong>. If you did not request this, please ignore this email.</p>
      <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
      <p style="font-size: 12px; color: #666; text-align: center;">© 2025 E-KINUN. All rights reserved.</p>
    </div>
  `;

  await sendEmail({
    email,
    subject,
    message,
    html,
  });
};

module.exports = { sendEmail, sendOTP };
