import {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  expect,
  jest,
} from "@jest/globals";
import request from "supertest";
import { loginAndGetCookies } from "./testUtils.js";
import app from "../../app.js";
import prisma from "../../config/prisma.js";
import crypto from "crypto";

jest.mock("../../utils/sendEmail.js", () => ({
  sendOtpEmail: jest.fn(),
  sendPasswordResetEmail: jest.fn(),
}));

const timestamp = Date.now();
const testUser = {
  firstName: "Test",
  lastName: "User",
  username: `testuser${timestamp}`,
  email: `testuser${timestamp}@u.nus.edu`,
  password: "Password1",
};

let testUserId;
let anonCookies = [];
let anonCsrfToken = "";
let skipGlobalReset = false;

beforeAll(async () => {
  const csrfRes = await request(app).get("/api/auth/csrf-token");
  anonCookies = csrfRes.headers["set-cookie"];
  anonCsrfToken = csrfRes.body.csrfToken;
  await prisma.otpToken.deleteMany({
    where: { user: { email: testUser.email } },
  });
  await prisma.passwordResetToken.deleteMany({
    where: { user: { email: testUser.email } },
  });
  await prisma.user.deleteMany({
    where: { email: testUser.email },
  });

  const bcrypt = await import("bcrypt");
  const hashed = await bcrypt.default.hash(testUser.password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      username: testUser.username,
      email: testUser.email,
      password: hashed,
      isVerified: false,
    },
  });

  testUserId = user.id;
}, 30000);

beforeEach(async () => {
  if (!testUserId || skipGlobalReset) return;

  const user = await prisma.user.findUnique({ where: { id: testUserId } });
  if (!user) return;

  await prisma.otpToken.deleteMany({ where: { userId: testUserId } });
  await prisma.passwordResetToken.deleteMany({ where: { userId: testUserId } });
  await prisma.user.update({
    where: { id: testUserId },
    data: { isVerified: false },
  });
});

afterAll(async () => {
  if (testUserId) {
    await prisma.otpToken.deleteMany({ where: { userId: testUserId } });
    await prisma.passwordResetToken.deleteMany({
      where: { userId: testUserId },
    });
    await prisma.refreshToken.deleteMany({ where: { userId: testUserId } });
    await prisma.user.deleteMany({ where: { id: testUserId } });
  }
  await prisma.$disconnect();
}, 30000);

describe("POST /api/auth/register", () => {
  it("should fail when registering with the same email again", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        username: `diffuser${timestamp}`,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should fail when registering with the same username but different email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `diff${timestamp}@u.nus.edu`,
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username already taken");
  });

  it("should fail with a non-NUS email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `other${timestamp}@gmail.com`,
        username: `other${timestamp}`,
      });
    expect(res.status).toBe(400);
  });

  it("should fail when firstName is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `fn${timestamp}@u.nus.edu`,
        username: `fn${timestamp}`,
        firstName: undefined,
      });
    expect(res.status).toBe(400);
  });

  it("should fail when lastName is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `ln${timestamp}@u.nus.edu`,
        username: `ln${timestamp}`,
        lastName: undefined,
      });
    expect(res.status).toBe(400);
  });

  it("should fail when username is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `un${timestamp}@u.nus.edu`,
        username: undefined,
      });
    expect(res.status).toBe(400);
  });

  it("should fail when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `pw${timestamp}@u.nus.edu`,
        username: `pw${timestamp}`,
        password: undefined,
      });
    expect(res.status).toBe(400);
  });

  it("should fail with a password under 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `sh${timestamp}@u.nus.edu`,
        username: `sh${timestamp}`,
        password: "Pass1",
      });
    expect(res.status).toBe(400);
  });

  it("should fail with a password containing no numbers", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `nn${timestamp}@u.nus.edu`,
        username: `nn${timestamp}`,
        password: "PasswordOnly",
      });
    expect(res.status).toBe(400);
  });

  it("should fail with a username containing special characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `sc${timestamp}@u.nus.edu`,
        username: "invalid_user!",
      });
    expect(res.status).toBe(400);
  });

  it("should fail with a firstName containing numbers", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        ...testUser,
        email: `fi${timestamp}@u.nus.edu`,
        username: `fi${timestamp}`,
        firstName: "Test123",
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("should return otp_required when user is not verified", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        password: testUser.password,
      });
    expect(res.status).toBe(200);
    expect(res.body.action).toBe("otp_required");
    expect(res.body.email).toBe(testUser.email);
    expect(res.headers["set-cookie"]).toBeUndefined();
  }, 15000);

  it("should fail with wrong password", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        password: "WrongPassword1",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Credentials");
  });

  it("should fail with non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: "nobody@u.nus.edu",
        password: "Password1",
      });
    expect(res.status).toBe(400);
  });

  it("should fail with non-existent username", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        username: "nonexistentuser",
        password: "Password1",
      });
    expect(res.status).toBe(400);
  });

  it("should fail when neither email nor username is provided", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        password: "Password1",
      });
    expect(res.status).toBe(400);
  });

  it("should fail when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
      });
    expect(res.status).toBe(400);
  });

  it("should return action login and set cookies when logging in with email", async () => {
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: true },
    });

    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe("login");
    expect(res.body.token).toBeUndefined();
    expect(res.body.refresh).toBeUndefined();

    const cookies = res.headers["set-cookie"] || [];
    expect(cookies.length).toBeGreaterThan(0);
    expect(cookies.some((c) => c.includes("accessToken="))).toBe(true);
    expect(cookies.some((c) => c.includes("refreshToken="))).toBe(true);
  });

  it("should return action login and set cookies when logging in with username", async () => {
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: true },
    });

    const res = await request(app)
      .post("/api/auth/login")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        username: testUser.username,
        password: testUser.password,
      });

    if (res.status === 200) {
      expect(res.body.action).toBe("login");
      expect(res.headers["set-cookie"]).toBeDefined();
    } else {
      expect(res.status).toBe(400);
    }
  });
});

describe("POST /api/auth/verify-otp", () => {
  it("should fail with a wrong OTP", async () => {
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        otp: "000000",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid or expired OTP");
  });

  it("should fail with OTP of wrong format", async () => {
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        otp: "abcdef",
      });
    expect(res.status).toBe(400);
  });

  it("should fail with OTP under 6 digits", async () => {
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        otp: "12345",
      });
    expect(res.status).toBe(400);
  });

  it("should fail when email is missing", async () => {
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        otp: "123456",
      });
    expect(res.status).toBe(400);
  });

  it("should fail when OTP is missing", async () => {
    const res = await request(app)
      .post("/api/auth/verify-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
      });
    expect(res.status).toBe(400);
  });

  it("should verify a correct OTP and set cookies", async () => {
    const validOtp = "123456";
    await prisma.otpToken.create({
      data: {
        token: validOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        userId: testUserId,
      },
    });

    const res = await request(app)
      .post("/api/auth/verify-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        otp: validOtp,
      });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe("verified");
    expect(res.body.token).toBeUndefined();
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should fail when trying to reuse an already used OTP", async () => {
    const usedOtp = "654321";
    await prisma.otpToken.create({
      data: {
        token: usedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        userId: testUserId,
        used: true,
      },
    });

    const res = await request(app)
      .post("/api/auth/verify-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
        otp: usedOtp,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid or expired OTP");
  });
});

describe("POST /api/auth/resend-otp", () => {
  it("should fail for non-existent email", async () => {
    const res = await request(app)
      .post("/api/auth/resend-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: "nobody@u.nus.edu",
      });
    expect(res.status).toBe(400);
  });

  it("should fail for an already verified user", async () => {
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: true },
    });

    const res = await request(app)
      .post("/api/auth/resend-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: testUser.email,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Unable to resend OTP");
  });

  it("should resend OTP for an unverified user", async () => {
    const res = await request(app)
      .post("/api/auth/resend-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send(
        {
          email: testUser.email,
        },
        15000,
      );

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  }, 10000);

  it("should fail with a non-NUS email format", async () => {
    const res = await request(app)
      .post("/api/auth/resend-otp")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({
        email: "testuser@gmail.com",
      });
    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/forgot-password", () => {
  it("should fail when neither email nor username is provided", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({});
    expect(res.status).toBe(400);
  });

  it("should fail with a non-NUS email", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({ email: "testuser@gmail.com" });
    expect(res.status).toBe(400);
  });

  it("should return success for a valid existing email", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({ email: testUser.email });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe(
      "If an account exists, a reset link has been sent.",
    );
  });

  it("should fail for a non-existent username", async () => {
    const res = await request(app)
      .post("/api/auth/forgot-password")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({ username: "nonexistentuser" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Credentials");
  });
});

describe("PATCH /api/auth/reset-password/:token", () => {
  it("should fail with a password under 8 characters", async () => {
    const res = await request(app)
      .patch("/api/auth/reset-password/some-token")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({ newPassword: "Pass1" });

    expect(res.status).toBe(400);
  });

  it("should fail with a password containing no numbers", async () => {
    const res = await request(app)
      .patch("/api/auth/reset-password/some-token")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({ newPassword: "PasswordOnly" });

    expect(res.status).toBe(400);
  });

  it("should fail with an invalid or expired reset token", async () => {
    const res = await request(app)
      .patch("/api/auth/reset-password/invalid-token")
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({ newPassword: "NewPassword1" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Password reset request denied");
  });

  it("should reset the password successfully with a valid token", async () => {
    const rawToken = "valid-reset-token-123";
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: {
        userId: testUserId,
        token: hashedToken,
        expiresAt,
      },
    });

    const res = await request(app)
      .patch(`/api/auth/reset-password/${rawToken}`)
      .set("Cookie", anonCookies)
      .set("x-csrf-token", anonCsrfToken)
      .send({ newPassword: "NewPassword1" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Password updated successfully");

    const updatedUser = await prisma.user.findUnique({
      where: { id: testUserId },
    });
    const bcrypt = await import("bcrypt");
    const isPasswordUpdated = await bcrypt.default.compare(
      "NewPassword1",
      updatedUser.password,
    );

    expect(isPasswordUpdated).toBe(true);

    const remainingTokens = await prisma.refreshToken.findMany({
      where: { userId: testUserId },
    });
    expect(remainingTokens).toHaveLength(0);
  });
});

describe("Token Refresh & Logout Flow", () => {
  let validCookies = [];
  let validCsrfToken;

  beforeAll(() => {
    skipGlobalReset = true;
  });

  afterAll(() => {
    skipGlobalReset = false;
  });

  beforeEach(async () => {
    await prisma.refreshToken.deleteMany({ where: { userId: testUserId } });
    await prisma.passwordResetToken.deleteMany({
      where: { userId: testUserId },
    });

    const bcrypt = await import("bcrypt");
    const hashedPassword = await bcrypt.default.hash(testUser.password, 10);

    await prisma.user.update({
      where: { id: testUserId },
      data: {
        isVerified: true,
        password: hashedPassword,
      },
    });

    const authData_validCookies = await loginAndGetCookies(
      testUser.email,
      testUser.password,
    );
    validCookies = authData_validCookies.cookies;
    validCsrfToken = authData_validCookies.csrfToken;
  });

  describe("POST /api/auth/refresh", () => {
    it("should fail if no cookies are provided", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", anonCookies)
        .set("x-csrf-token", anonCsrfToken);
      expect(res.status).toBe(400);
    });

    it("should succeed and set new cookies with a valid refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", anonCookies)
        .set("x-csrf-token", anonCsrfToken)
        .set("Cookie", validCookies)
        .set("x-csrf-token", validCsrfToken);

      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();
      expect(
        res.headers["set-cookie"].some((c) => c.includes("accessToken=")),
      ).toBe(true);
    });

    it("should fail with an invalid/forged refresh token", async () => {
      const res = await request(app)
        .post("/api/auth/refresh")
        .set("Cookie", anonCookies)
        .set("x-csrf-token", anonCsrfToken)
        .set("Cookie", [
          ...anonCookies,
          "refreshToken=forged_invalid_token_123",
        ])
        .set("x-csrf-token", anonCsrfToken);

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/auth/logout", () => {
    it("should clear cookies and return 200", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Cookie", anonCookies)
        .set("x-csrf-token", anonCsrfToken)
        .set("Cookie", validCookies)
        .set("x-csrf-token", validCsrfToken);

      expect(res.status).toBe(200);

      const responseCookies = res.headers["set-cookie"] || [];
      expect(responseCookies.length).toBeGreaterThan(0);

      const cookieStr = responseCookies.join(";");
      expect(cookieStr).toMatch(/Expires=|Max-Age=/i);
    });
  });

  describe("POST /api/auth/logout-all", () => {
    it("should fail with 401 if no cookies/tokens are provided", async () => {
      const res = await request(app)
        .post("/api/auth/logout-all")
        .set("Cookie", anonCookies)
        .set("x-csrf-token", anonCsrfToken);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Access denied. No token provided");
    });

    it("should clear cookies and delete all refresh tokens successfully", async () => {
      const res = await request(app)
        .post("/api/auth/logout-all")
        .set("Cookie", anonCookies)
        .set("x-csrf-token", anonCsrfToken)
        .set("Cookie", validCookies)
        .set("x-csrf-token", validCsrfToken);

      expect(res.status).toBe(200);
      expect(res.headers["set-cookie"]).toBeDefined();

      const dbTokens = await prisma.refreshToken.findMany({
        where: { userId: testUserId },
      });
      expect(dbTokens.length).toBe(0);
    });
  });
});
