import {
  describe,
  it,
  beforeAll,
  afterAll,
  beforeEach,
  expect,
} from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import prisma from "../../config/prisma.js";

const testUser = {
  firstName: "Test",
  lastName: "User",
  username: "maintestuser",
  email: "maintestuser@u.nus.edu",
  password: "Password1",
};

let testUserId;

// ─── SETUP AND TEARDOWN ───────────────────────────────────────────────────────

beforeAll(async () => {
  // 1. Clean DB of any lingering test data
  await prisma.otpToken.deleteMany({
    where: { user: { email: { contains: "test" } } },
  });
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "test" } },
        { username: { contains: "test" } },
        { username: "otherusername" },
        { username: "nonexistentuser" },
      ],
    },
  });

  // 2. Register the baseline user exactly ONCE to prevent SMTP rate limits
  await request(app).post("/api/auth/register").send(testUser);

  // 3. Fetch and store the ID for fast DB operations later
  const user = await prisma.user.findUnique({
    where: { email: testUser.email },
  });
  testUserId = user.id;
});

beforeEach(async () => {
  // Reset user to a clean, unverified state before every test
  if (testUserId) {
    await prisma.otpToken.deleteMany({ where: { userId: testUserId } });
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: false },
    });
  }
});

afterAll(async () => {
  await prisma.otpToken.deleteMany({
    where: { user: { email: { contains: "test" } } },
  });
  await prisma.user.deleteMany({
    where: {
      OR: [{ email: { contains: "test" } }, { username: { contains: "test" } }],
    },
  });
  await prisma.$disconnect();
});

// ─── REGISTER TESTS ───────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("should fail when registering with the same email again", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "differentusername", // Isolate email collision
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should fail when registering with the same username but different email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "differentemail@u.nus.edu", // Isolate username collision
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Username already taken");
  });

  it("should fail with a non-NUS email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "test@gmail.com",
        username: "otherusername",
      });

    expect(res.status).toBe(400);
  });

  it("should fail when firstName is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "otherusername1",
        email: "test1@u.nus.edu",
        firstName: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail when lastName is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "otherusername2",
        email: "test2@u.nus.edu",
        lastName: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail when username is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "test3@u.nus.edu",
        username: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "otherusername3",
        email: "test4@u.nus.edu",
        password: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a password under 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "otherusername4",
        email: "test5@u.nus.edu",
        password: "Pass1",
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a password containing no numbers", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "otherusername5",
        email: "test6@u.nus.edu",
        password: "PasswordOnly",
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a username containing special characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "test7@u.nus.edu",
        username: "test_user!",
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a firstName containing numbers", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "test8@u.nus.edu",
        username: "otherusername6",
        firstName: "Test123",
      });

    expect(res.status).toBe(400);
  });
});

// ─── LOGIN TESTS ──────────────────────────────────────────────────────────────

describe("POST /api/auth/login", () => {
  it("should return otp_required when user is not verified", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe("otp_required");
    expect(res.body.email).toBe(testUser.email);
  });

  it("should fail with wrong password", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: "WrongPassword1",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid Credentials");
  });

  it("should fail with non-existent email", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "nobody@u.nus.edu",
      password: "Password1",
    });

    expect(res.status).toBe(400);
  });

  it("should fail with non-existent username", async () => {
    const res = await request(app).post("/api/auth/login").send({
      username: "nonexistentuser",
      password: "Password1",
    });

    expect(res.status).toBe(400);
  });

  it("should fail when neither email nor username is provided", async () => {
    const res = await request(app).post("/api/auth/login").send({
      password: "Password1",
    });

    expect(res.status).toBe(400);
  });

  it("should fail when password is missing", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
    });

    expect(res.status).toBe(400);
  });

  it("should return action login with token when logging in with email", async () => {
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: true },
    });

    const res = await request(app).post("/api/auth/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe("login");
    expect(res.body.token).toBeDefined();
  });

  it("should return action login with token when logging in with username", async () => {
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: true },
    });

    const res = await request(app).post("/api/auth/login").send({
      username: testUser.username,
      password: testUser.password,
    });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe("login");
    expect(res.body.token).toBeDefined();
  });
});

// ─── VERIFY OTP TESTS ─────────────────────────────────────────────────────────

describe("POST /api/auth/verify-otp", () => {
  it("should fail with a wrong OTP", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: "000000",
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid or expired OTP");
  });

  it("should fail with OTP of wrong format", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: "abcdef",
    });

    expect(res.status).toBe(400);
  });

  it("should fail with OTP under 6 digits", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: "12345",
    });

    expect(res.status).toBe(400);
  });

  it("should fail when email is missing", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      otp: "123456",
    });

    expect(res.status).toBe(400);
  });

  it("should fail when OTP is missing", async () => {
    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
    });

    expect(res.status).toBe(400);
  });

  it("should verify a correct OTP and return token", async () => {
    // Insert a valid OTP directly via Prisma to avoid triggering Nodemailer
    const validOtp = "123456";
    await prisma.otpToken.create({
      data: {
        token: validOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 mins from now
        userId: testUserId,
      },
    });

    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: validOtp,
    });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe("verified");
    expect(res.body.token).toBeDefined();
  });

  it("should fail when trying to reuse an already used OTP", async () => {
    const usedOtp = "654321";
    await prisma.otpToken.create({
      data: {
        token: usedOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        userId: testUserId,
        used: true, // Mark it as already used
      },
    });

    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: usedOtp,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid or expired OTP");
  });
});

// ─── RESEND OTP TESTS ─────────────────────────────────────────────────────────

describe("POST /api/auth/resend-otp", () => {
  it("should fail for non-existent email", async () => {
    const res = await request(app).post("/api/auth/resend-otp").send({
      email: "nobody@u.nus.edu",
    });

    expect(res.status).toBe(400);
  });

  it("should fail for an already verified user", async () => {
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: true },
    });

    const res = await request(app).post("/api/auth/resend-otp").send({
      email: testUser.email,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Unable to resend OTP");
  });

  it("should resend OTP for an unverified user", async () => {
    const res = await request(app).post("/api/auth/resend-otp").send({
      email: testUser.email,
    });

    expect(res.status).toBe(200);
    expect(res.body.message).toBeDefined();
  });

  it("should fail with a non-NUS email format", async () => {
    const res = await request(app).post("/api/auth/resend-otp").send({
      email: "testuser@gmail.com",
    });

    expect(res.status).toBe(400);
  });
});
