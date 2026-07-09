import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import {
  registerSchema,
  loginSchema,
  otpSchema,
} from "../validators/authValidator.js";
import { generateOtp } from "../utils/generateOtp.js";
import { sendOtpEmail } from "../utils/sendEmail.js";
import jwt from "jsonwebtoken";

const issueOtp = async (userId, email) => {
  await prisma.otpToken.updateMany({
    where: { userId, used: false },
    data: { used: true },
  });
  const token = generateOtp();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  await prisma.otpToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });
  await sendOtpEmail(email, token);
};

export const registerUserService = async ({
  firstName,
  lastName,
  email,
  username,
  password,
}) => {
  const normalizedEmail = email.toLowerCase();
  const normalizedUsername = username.toLowerCase();
  const { error } = registerSchema.validate({
    firstName,
    lastName,
    username: normalizedUsername,
    email: normalizedEmail,
    password,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const existingEmail = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
  if (existingEmail) {
    throw new Error("User already exists");
  }

  const existingUsername = await prisma.user.findUnique({
    where: {
      username: normalizedUsername,
    },
  });
  if (existingUsername) {
    throw new Error("Username already taken");
  }
  const hash = await bcrypt.hash(password, 10);
  const newUser = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email: normalizedEmail,
      username: normalizedUsername,
      password: hash,
    },
  });
  await issueOtp(newUser.id, newUser.email);
  return {
    action: "otp_required",
    message: "OTP sent to your NUS email",
  };
};

export const loginUserService = async ({ email, username, password }) => {
  const normalizedEmail = email ? email.toLowerCase() : undefined;
  const normalizedUsername = username ? username.toLowerCase() : undefined;
  const { error } = loginSchema.validate({
    email: normalizedEmail,
    username: normalizedUsername,
    password,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }

  const user = email
    ? await prisma.user.findUnique({ where: { email: normalizedEmail } })
    : await prisma.user.findUnique({ where: { username: normalizedUsername } });

  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
  }
  if (!user.isVerified) {
    await issueOtp(user.id, user.email);
    return {
      action: "otp_required",
      email: user.email,
      message: "Account not verified. A fresh OTP has been sent to your email",
    };
  }
  const { token, refresh } = await generateToken(user.id);
  return {
    action: "login",
    token,
    refresh,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};

export const verifyOtpService = async ({ email, otp }) => {
  const normalizedEmail = email.toLowerCase();
  const { error } = otpSchema.validate({ email, otp });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
  if (!user) {
    throw new Error("User not found");
  }
  const otpRecord = await prisma.otpToken.findFirst({
    where: {
      userId: user.id,
      token: otp,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!otpRecord) {
    throw new Error("Invalid or expired OTP");
  }

  await prisma.$transaction([
    prisma.otpToken.update({
      where: { id: otpRecord.id },
      data: { used: true },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
    }),
  ]);
  const { token, refresh } = await generateToken(user.id);
  return {
    action: "verified",
    token,
    refresh,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    },
  };
};

export const resendOtpService = async ({ email }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user || user.isVerified) {
    throw new Error("Unable to resend OTP");
  }
  await issueOtp(user.id, normalizedEmail);
  return { message: "OTP resent to your NUS email" };
};

export const refreshAccessTokenService = async (oldRefreshToken) => {
  if (!oldRefreshToken) {
    throw new Error("Access denied. No refresh token provided");
  }
  let payload;
  jwt.verify(
    oldRefreshToken,
    process.env.REFRESH_TOKEN_SECRET,
    (error, user) => {
      if (error) {
        throw new Error("Invalid or expired token");
      }
      payload = user;
    },
  );
  const existingToken = await prisma.refreshToken.findUnique({
    where: { token: oldRefreshToken },
  });
  if (!existingToken) {
    throw new Error("Refresh token has been revoked or logged out");
  }
  await prisma.refreshToken.delete({
    where: {
      token: oldRefreshToken,
    },
  });
  return await generateToken(payload.userId);
};

export const logoutService = async (refreshToken) => {
  if (!refreshToken) return;
  try {
    await prisma.refreshToken.delete({
      where: {
        token: refreshToken,
      },
    });
  } catch (error) {}
  return { message: "Logged out successfully" };
};

export const logoutOfAllDevicesService = async (userId) => {
  if (!userId) {
    throw new Error("User ID not provided");
  }
  try {
    await prisma.refreshToken.deleteMany({
      where: {
        userId,
      },
    });
  } catch (error) {}
  return { message: "Logged out of all devices successfully" };
};
