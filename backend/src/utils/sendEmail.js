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

export const sendProjectUpdateEmail = async (
  email,
  name,
  projectTitle,
  status,
) => {
  const isAccepted = status === "ACCEPTED";
  const subject = isAccepted
    ? `Congratulations! You've been accepted to ${projectTitle}`
    : `Update on your application for ${projectTitle}`;
  const message = isAccepted
    ? `<p>Hi ${name},</p>
       <p>Great news! The project creator has <strong>accepted</strong> your application to join <strong>${projectTitle}</strong>.</p>
       <p>Head over to the NUSphere platform to connect with your new team and start collaborating!</p>`
    : `<p>Hi ${name},</p>
       <p>Thank you for applying to <strong>${projectTitle}</strong>.</p>
       <p>Unfortunately, the project creator has decided not to move forward with your application at this time. Don't let this discourage you—there are many other open projects on NUSphere looking for your exact skills!</p>`;

  await transporter.sendMail({
    from: `"NUSphere" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: subject,
    html: `
      ${message}
      <br/>
      <p>Best regards,</p>
      <p>The NUSphere Team</p>
    `,
  });
};
