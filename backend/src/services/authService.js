import prisma from "../config/prisma.js";
import bcrypt from "bcrypt";
import { generateToken } from "../utils/generateToken.js";
import { registerSchema } from "../utils/validateNusEmail.js";

export const registerUserService = async (user) => {
  const { email, password, username } = user;
  const normalizedEmail = email.toLowerCase();
  const { error } = registerSchema.validate({
    email: normalizedEmail,
    password,
    username,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
  if (existingUser) {
    throw new Error("User already exists");
  }

  const newUser = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: await bcrypt.hash(password, 10),
      username: username,
    },
  });
  const token = generateToken(newUser.id);
  return {
    token,
    user: {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
    },
  };
};

export const loginUserService = async ({ email, password }) => {
  const normalizedEmail = email.toLowerCase();
  const user = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
  if (!user) {
    throw new Error("Invalid Credentials");
  }
  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    throw new Error("Invalid Credentials");
  }

  const token = generateToken(user.id);
  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
    },
  };
};
