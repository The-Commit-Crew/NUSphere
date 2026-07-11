import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

export const generateToken = async (userId) => {
  const token = jwt.sign({ userId }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });
  const refresh = jwt.sign({ userId }, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  await prisma.refreshToken.create({
    data: {
      userId,
      token: refresh,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  return { token, refresh };
};
