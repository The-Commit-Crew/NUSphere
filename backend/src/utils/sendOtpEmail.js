import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export const sendOtpEmail = async (email, otp) => {
  await transporter.sendMail({
    from: `"NUSphere" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: "Your NUSphere verification code",
    html: `
    <p>Your NUSphere verification code is: </p>
    <h2>${otp}</h2>
    <p>This code expires in 10 minutes.</p>
    <p>If you did not request this, please ignore this email.</p>
    `,
  });
};
