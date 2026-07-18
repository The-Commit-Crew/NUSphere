import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";
import request from "supertest";
import { loginAndGetCookies } from "./testUtils.js";
import app from "../../app.js";
import redisClient from "../../config/redis.js";
import prisma from "../../config/prisma.js";

const timestamp = Date.now();

let validCookies;
let validCsrfToken;
let testUserId;
let testTopicId;
let testPostId;

const testUser = {
  firstName: "Bookmark",
  lastName: "Tester",
  username: `bookmarktester${timestamp}`,
  email: `bookmarktester${timestamp}@u.nus.edu`,
  password: "Password1",
};

beforeAll(async () => {
  const bcrypt = await import("bcrypt");
  const hashed = await bcrypt.default.hash(testUser.password, 10);

  const user = await prisma.user.create({
    data: {
      firstName: testUser.firstName,
      lastName: testUser.lastName,
      username: testUser.username,
      email: testUser.email,
      password: hashed,
      isVerified: true,
    },
  });
  testUserId = user.id;

  const authData_validCookies = await loginAndGetCookies(testUser.email, testUser.password);
  validCookies = authData_validCookies.cookies;
  validCsrfToken = authData_validCookies.csrfToken;

  const topic = await prisma.topic.create({
    data: {
      name: `Bookmark Topic ${timestamp}`,
      description: "Testing bookmarks",
    },
  });
  testTopicId = topic.id;

  const post = await prisma.post.create({
    data: {
      title: "Post to Bookmark",
      content: "This is a test post for the bookmark feature.",
      topicId: testTopicId,
      authorId: testUserId,
    },
  });
  testPostId = post.id;
}, 30000);

afterAll(async () => {
  await prisma.bookmark.deleteMany({ where: { userId: testUserId } });
  await prisma.post.deleteMany({ where: { authorId: testUserId } });
  await prisma.topic.deleteMany({ where: { id: testTopicId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
  await redisClient.quit();
}, 30000);

describe("POST /api/bookmarks/:id", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app).post(`/api/bookmarks/${testPostId}`);
    expect(res.status).toBe(403);
  });

  it("should return 400 for a non-existent post", async () => {
    const res = await request(app)
      .post("/api/bookmarks/999999")
      .set("Cookie", validCookies).set("x-csrf-token", validCsrfToken);
    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Post not found");
  });

  it("should return 200 and bookmarkStatus: true when toggling ON", async () => {
    const res = await request(app)
      .post(`/api/bookmarks/${testPostId}`)
      .set("Cookie", validCookies).set("x-csrf-token", validCsrfToken);

    expect(res.status).toBe(200);
    expect(res.body.bookmarkStatus).toBe(true);
  });

  it("should return 200 and bookmarkStatus: false when toggling OFF", async () => {
    const res = await request(app)
      .post(`/api/bookmarks/${testPostId}`)
      .set("Cookie", validCookies).set("x-csrf-token", validCsrfToken);

    expect(res.status).toBe(200);
    expect(res.body.bookmarkStatus).toBe(false);
  });
});

describe("GET /api/bookmarks", () => {
  beforeAll(async () => {
    await request(app)
      .post(`/api/bookmarks/${testPostId}`)
      .set("Cookie", validCookies).set("x-csrf-token", validCsrfToken);
  });

  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/bookmarks");
    expect(res.status).toBe(401);
  });

  it("should return 200 and a list of bookmarked posts", async () => {
    const res = await request(app)
      .get("/api/bookmarks")
      .set("Cookie", validCookies).set("x-csrf-token", validCsrfToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);

    const bookmarkedPost = res.body[0];

    expect(bookmarkedPost.id).toBe(testPostId);
    expect(bookmarkedPost.title).toBe("Post to Bookmark");

    expect(bookmarkedPost.topic).toBeDefined();
    expect(bookmarkedPost.topic.name).toBeDefined();
    expect(bookmarkedPost.author).toBeDefined();
    expect(bookmarkedPost.author.username).toBeDefined();
    expect(bookmarkedPost._count).toBeDefined();
    expect(bookmarkedPost._count.comments).toBe(0);
    expect(bookmarkedPost.bookmarkedAt).toBeDefined();
  });
});
