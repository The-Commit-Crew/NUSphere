import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import prisma from "../../config/prisma.js";

const timestamp = Date.now();

let ownerCookies = [];
let ownerId;
let ownerUsername = `owner${timestamp}`;

let guestCookies = [];
let guestId;

beforeAll(async () => {
  const bcrypt = await import("bcrypt");
  const hashed = await bcrypt.default.hash("Password1", 10);

  const owner = await prisma.user.create({
    data: {
      firstName: "Profile",
      lastName: "Owner",
      username: ownerUsername,
      email: `owner${timestamp}@u.nus.edu`,
      password: hashed,
      isVerified: true,
    },
  });
  ownerId = owner.id;

  const ownerLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: owner.email, password: "Password1" });
  ownerCookies = ownerLogin.headers["set-cookie"] || [];

  const guest = await prisma.user.create({
    data: {
      firstName: "Profile",
      lastName: "Guest",
      username: `guest${timestamp}`,
      email: `guest${timestamp}@u.nus.edu`,
      password: hashed,
      isVerified: true,
    },
  });
  guestId = guest.id;

  const guestLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: guest.email, password: "Password1" });
  guestCookies = guestLogin.headers["set-cookie"] || [];
}, 30000);

afterAll(async () => {
  await prisma.projectApplication.deleteMany({
    where: { userId: { in: [ownerId, guestId] } },
  });
  await prisma.project.deleteMany({
    where: { authorId: { in: [ownerId, guestId] } },
  });
  await prisma.refreshToken.deleteMany({
    where: { userId: { in: [ownerId, guestId] } },
  });
  await prisma.otpToken.deleteMany({
    where: { userId: { in: [ownerId, guestId] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [ownerId, guestId] } },
  });
  await prisma.$disconnect();
}, 30000);

describe("PUT /api/users/me", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).put("/api/users/me").send({
      bio: "Trying to update without auth",
    });

    expect(res.status).toBe(401);
  });

  it("should return 400 with invalid URL fields", async () => {
    const res = await request(app)
      .put("/api/users/me")
      .set("Cookie", ownerCookies)
      .send({
        githubLink: "invalid-url",
      });

    expect(res.status).toBe(400);
  });

  it("should return 200 and normalize skills properly on valid update", async () => {
    const res = await request(app)
      .put("/api/users/me")
      .set("Cookie", ownerCookies)
      .send({
        bio: "Updated bio for testing.",
        githubLink: "https://github.com/test",
        skills: ["reAcT", "node.js", "PRISMA"],
      });

    expect(res.status).toBe(200);
    expect(res.body.bio).toBe("Updated bio for testing.");
    expect(res.body.githubLink).toBe("https://github.com/test");

    const skillNames = res.body.skills.map((s) => s.name);
    expect(skillNames).toContain("REACT");
    expect(skillNames).toContain("NODE.JS");
    expect(skillNames).toContain("PRISMA");
  });
});

describe("GET /api/users/me/dashboard", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/users/me/dashboard");
    expect(res.status).toBe(401);
  });

  it("should return 200 with complete private data for authenticated user", async () => {
    const res = await request(app)
      .get("/api/users/me/dashboard")
      .set("Cookie", ownerCookies);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(ownerId);
    expect(res.body.email).toBeDefined();
    expect(res.body.authoredProjects).toBeDefined();
    expect(res.body.applications).toBeDefined();
  });
});

describe("GET /api/users/:username", () => {
  it("should return 404 for non-existent user", async () => {
    const res = await request(app).get("/api/users/thisuserdoesnotexist123");
    expect(res.status).toBe(404);
  });

  it("should return 200 PUBLIC data for an unauthenticated guest", async () => {
    const res = await request(app).get(`/api/users/${ownerUsername}`);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(ownerUsername);
    expect(res.body.bio).toBe("Updated bio for testing.");
    expect(res.body.email).toBeUndefined();
    expect(res.body.applications).toBeUndefined();
  });

  it("should return 200 PUBLIC data when logged in as a DIFFERENT user", async () => {
    const res = await request(app)
      .get(`/api/users/${ownerUsername}`)
      .set("Cookie", guestCookies);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(ownerUsername);
    expect(res.body.email).toBeUndefined();
    expect(res.body.applications).toBeUndefined();
  });

  it("should return 200 MERGED data when logged in as the profile OWNER", async () => {
    const res = await request(app)
      .get(`/api/users/${ownerUsername}`)
      .set("Cookie", ownerCookies);

    expect(res.status).toBe(200);
    expect(res.body.username).toBe(ownerUsername);
    expect(res.body.email).toBeDefined();
    expect(res.body.applications).toBeDefined();
  });
});
