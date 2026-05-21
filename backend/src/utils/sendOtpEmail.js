import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = (email, otp) => {
  resend.emails.send({
    from: "NUSphere <onboarding@resend.dev>",
    to: email,
    subject: "Your NUSphere verification code",
    html: `<p>Your OTP is <strong>${otp}</strong>. It expires in 10 minutes. </p>`,
  });
};
