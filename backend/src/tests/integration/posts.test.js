import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import prisma from "../../config/prisma.js";

const timestamp = Date.now();

let authToken;
let testUserId;
let testTopicId;
let testPostId;

const testUser = {
  firstName: "Post",
  lastName: "Tester",
  username: `posttester${timestamp}`,
  email: `posttester${timestamp}@u.nus.edu`,
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

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: testUser.email, password: testUser.password });

  authToken = loginRes.body.token;

  const topic = await prisma.topic.create({
    data: {
      name: `Post Integration Topic ${timestamp}`,
      description: "Testing posts",
    },
  });
  testTopicId = topic.id;
}, 30000);

afterAll(async () => {
  await prisma.vote.deleteMany({ where: { userId: testUserId } });
  await prisma.post.deleteMany({ where: { authorId: testUserId } });
  await prisma.topic.deleteMany({ where: { id: testTopicId } });
  await prisma.otpToken.deleteMany({ where: { userId: testUserId } });
  await prisma.user.deleteMany({ where: { id: testUserId } });
  await prisma.$disconnect();
}, 30000);

describe("POST /api/posts", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).post("/api/posts").send({
      title: "Test Post",
      content: "Testing without auth token.",
      topicId: testTopicId,
    });

    expect(res.status).toBe(401);
  });

  it("should return 400 with missing fields", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        content: "This content is long enough but missing fields.",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 with content under 10 characters", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Valid Title",
        content: "Short",
        topicId: testTopicId,
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 with title under 3 characters", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Hi",
        content: "This is valid content for the test.",
        topicId: testTopicId,
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 with non-existent topicId", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Valid Title",
        content: "This is valid content for the test.",
        topicId: 99999,
      });

    expect(res.status).toBe(400);
  });

  it("should return 201 with valid token and valid body", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        title: "Valid Post Title",
        content: "This is valid content for our integration test.",
        topicId: testTopicId,
      });

    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Valid Post Title");
    expect(res.body.authorId).toBe(testUserId);

    testPostId = res.body.id;
  });
});

describe("GET /api/posts/:id", () => {
  it("should return 200 with author and topic details", async () => {
    const res = await request(app).get(`/api/posts/${testPostId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testPostId);
    expect(res.body.author).toBeDefined();
    expect(res.body.author.username).toBe(testUser.username);
    expect(res.body.topic).toBeDefined();
    expect(res.body.topic.name).toBeDefined();
  });

  it("should return 400 for non-existent post", async () => {
    const res = await request(app).get("/api/posts/99999");

    expect(res.status).toBe(400);
  });
});

describe("POST /api/posts/:id/vote", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).post(`/api/posts/${testPostId}/vote`).send({
      voteType: "UP",
    });

    expect(res.status).toBe(401);
  });

  it("should return 400 with invalid voteType", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        voteType: "UPVOTE",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 for non-existent post", async () => {
    const res = await request(app)
      .post("/api/posts/99999/vote")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        voteType: "UP",
      });

    expect(res.status).toBe(400);
  });

  it("should return 200 and increment upvote on New Vote (Scenario A)", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        voteType: "UP",
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testPostId);
    expect(res.body.upvoteCount).toBe(1);
    expect(res.body.downvoteCount).toBe(0);
  });

  it("should return 200 and adjust counts on Switch Vote (Scenario C)", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        voteType: "DOWN",
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testPostId);
    expect(res.body.upvoteCount).toBe(0);
    expect(res.body.downvoteCount).toBe(1);
  });

  it("should return 200 and decrement counts on Toggle Off (Scenario B)", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        voteType: "DOWN",
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testPostId);
    expect(res.body.upvoteCount).toBe(0);
    expect(res.body.downvoteCount).toBe(0);
  });
});
