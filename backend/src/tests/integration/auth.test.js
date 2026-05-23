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
  username: "testuser123",
  email: "testuser@u.nus.edu",
  password: "Password1",
};

async function createTestUser() {
  const existingUser = await prisma.user.findUnique({
    where: { email: testUser.email },
  });

  if (!existingUser) {
    await request(app).post("/api/auth/register").send(testUser);
  }
}

beforeAll(async () => {
  await prisma.otpToken.deleteMany({
    where: {
      user: {
        email: {
          contains: "testuser",
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "testuser",
      },
    },
  });
});

beforeEach(async () => {
  await createTestUser();
});

afterAll(async () => {
  await prisma.otpToken.deleteMany({
    where: {
      user: {
        email: {
          contains: "testuser",
        },
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      email: {
        contains: "testuser",
      },
    },
  });

  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("should fail when registering with the same email again", async () => {
    const res = await request(app).post("/api/auth/register").send(testUser);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("User already exists");
  });

  it("should fail when registering with the same username but different email", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "testuser2@u.nus.edu",
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
        firstName: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail when lastName is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        lastName: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail when username is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail when password is missing", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        password: undefined,
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a password under 8 characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "otherusername",
        email: "testuser2@u.nus.edu",
        password: "Pass1",
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a password containing no numbers", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        username: "otherusername",
        email: "testuser2@u.nus.edu",
        password: "PasswordOnly",
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a username containing special characters", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "testuser2@u.nus.edu",
        username: "test_user!",
      });

    expect(res.status).toBe(400);
  });

  it("should fail with a firstName containing numbers", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({
        ...testUser,
        email: "testuser2@u.nus.edu",
        username: "otherusername",
        firstName: "Test123",
      });

    expect(res.status).toBe(400);
  });
});

describe("POST /api/auth/login", () => {
  it("should return otp_required when user is not verified", async () => {
    await prisma.user.update({
      where: { email: testUser.email },
      data: { isVerified: false },
    });

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
      where: { email: testUser.email },
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
      where: { email: testUser.email },
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
    await prisma.user.update({
      where: { email: testUser.email },
      data: { isVerified: false },
    });

    await request(app).post("/api/auth/resend-otp").send({
      email: testUser.email,
    });

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    expect(otpRecord).not.toBeNull();

    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: otpRecord.token,
    });

    expect(res.status).toBe(200);
    expect(res.body.action).toBe("verified");
    expect(res.body.token).toBeDefined();
  });

  it("should fail when trying to reuse an already used OTP", async () => {
    await prisma.user.update({
      where: { email: testUser.email },
      data: { isVerified: false },
    });

    await request(app).post("/api/auth/resend-otp").send({
      email: testUser.email,
    });

    const user = await prisma.user.findUnique({
      where: { email: testUser.email },
    });

    const otpRecord = await prisma.otpToken.findFirst({
      where: {
        userId: user.id,
        used: false,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // First use
    await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: otpRecord.token,
    });

    // Attempt to reuse
    const res = await request(app).post("/api/auth/verify-otp").send({
      email: testUser.email,
      otp: otpRecord.token,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Invalid or expired OTP");
  });
});

describe("POST /api/auth/resend-otp", () => {
  it("should fail for non-existent email", async () => {
    const res = await request(app).post("/api/auth/resend-otp").send({
      email: "nobody@u.nus.edu",
    });

    expect(res.status).toBe(400);
  });

  it("should fail for an already verified user", async () => {
    // Explicitly set the user to verified to prevent test state bleed
    await prisma.user.update({
      where: { email: testUser.email },
      data: { isVerified: true },
    });

    const res = await request(app).post("/api/auth/resend-otp").send({
      email: testUser.email,
    });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Unable to resend OTP");
  });

  it("should resend OTP for an unverified user", async () => {
    await prisma.user.update({
      where: { email: testUser.email },
      data: { isVerified: false },
    });

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
