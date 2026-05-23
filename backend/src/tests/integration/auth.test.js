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

const cleanupTestData = async () => {
  await prisma.otpToken.deleteMany({
    where: { user: { email: { contains: "maintestuser" } } },
  });
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: { contains: "maintestuser" } },
        { email: { contains: "otherusername" } },
        { username: "otherusername" },
        { username: "otherusername1" },
        { username: "otherusername2" },
        { username: "otherusername3" },
        { username: "otherusername4" },
        { username: "otherusername5" },
        { username: "otherusername6" },
      ],
    },
  });
};

beforeAll(async () => {
  await cleanupTestData();

  await request(app).post("/api/auth/register").send(testUser);

  const user = await prisma.user.findUnique({
    where: { email: testUser.email },
  });
  testUserId = user.id;
});

beforeEach(async () => {
  // Only reset if user still exists
  const user = await prisma.user.findUnique({
    where: { id: testUserId },
  });
  if (user) {
    await prisma.otpToken.deleteMany({ where: { userId: testUserId } });
    await prisma.user.update({
      where: { id: testUserId },
      data: { isVerified: false },
    });
  }
});

afterAll(async () => {
  await cleanupTestData();
  await prisma.$disconnect();
});

// ─── REGISTER TESTS ───────────────────────────────────────────────────────────

describe("POST /api/auth/register", () => {
  it("should fail when registering with the same email again", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "differentusername",
      });
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should fail when registering with the same username but different email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "differentemail@u.nus.edu",
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
        email: "otherusername1@u.nus.edu",
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
        email: "otherusername2@u.nus.edu",
        lastName: undefined,
      });
    expect(res.status).toBe(400);
  });

  it("should fail when username is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "otherusername3@u.nus.edu",
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
        email: "otherusername3@u.nus.edu",
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
        email: "otherusername4@u.nus.edu",
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
        email: "otherusername5@u.nus.edu",
        password: "PasswordOnly",
      });
    expect(res.status).toBe(400);
  });

  it("should fail with a username containing special characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "otherusername6@u.nus.edu",
        username: "test_user!",
      });
    expect(res.status).toBe(400);
  });

  it("should fail with a firstName containing numbers", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "otherusername7@u.nus.edu",
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
    // Set verified directly in DB — no OTP flow needed
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
    const validOtp = "123456";
    await prisma.otpToken.create({
      data: {
        token: validOtp,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
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
        used: true,
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
    // Set verified AFTER beforeEach has already reset to unverified
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
    // beforeEach already ensures user is unverified — no setup needed
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
