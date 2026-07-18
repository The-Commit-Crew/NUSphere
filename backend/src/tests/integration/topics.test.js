import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import prisma from "../../config/prisma.js";
import * as openaiHelper from "../../utils/openaiHelper.js";
import { loginAndGetCookies } from "./testUtils.js";

const timestamp = Date.now();

let testTopicId;
let validCookies = [];
let validCsrfToken;
let testUserId;

const testUser = {
  firstName: "Topic",
  lastName: "Tester",
  username: `topictester${timestamp}`,
  email: `topictester${timestamp}@u.nus.edu`,
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

  const authData = await loginAndGetCookies(testUser.email, testUser.password);
  validCookies = authData.cookies;
  validCsrfToken = authData.csrfToken;

  const topic = await prisma.topic.create({
    data: {
      name: `Test Topic ${timestamp}`,
      description: "A topic for integration testing",
    },
  });
  testTopicId = topic.id;
}, 30000);

afterAll(async () => {
  await prisma.post.deleteMany({ where: { topicId: testTopicId } });

  await prisma.topic.deleteMany({
    where: {
      OR: [{ id: testTopicId }, { name: "Brand New Topic" }],
    },
  });

  await prisma.refreshToken.deleteMany({ where: { userId: testUserId } });
  await prisma.otpToken.deleteMany({ where: { userId: testUserId } });
  await prisma.user.delete({ where: { id: testUserId } });

  await prisma.$disconnect();
}, 30000);

describe("GET /api/topics", () => {
  it("should return 200 with an array of topics", async () => {
    const res = await request(app).get("/api/topics");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it("should return topics with postCount field", async () => {
    const res = await request(app).get("/api/topics");

    expect(res.status).toBe(200);
    expect(res.body[0]).toHaveProperty("postCount");
  });

  it("should return topics ordered alphabetically by name", async () => {
    const res = await request(app).get("/api/topics");

    expect(res.status).toBe(200);
    const names = res.body.map((t) => t.name);
    const sorted = [...names].sort();
    expect(names).toEqual(sorted);
  });
});

describe("GET /api/topics/:id", () => {
  it("should return 200 with topic details", async () => {
    const res = await request(app).get(`/api/topics/${testTopicId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testTopicId);
    expect(res.body.name).toBe(`Test Topic ${timestamp}`);
  });

  it("should return 400 for non-existent topic", async () => {
    const res = await request(app).get("/api/topics/99999");

    expect(res.status).toBe(400);
  });
});

describe("POST /api/topics", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app)
      .post("/api/topics")
      .set("Cookie", validCookies)
      .send({
        name: "Valid Topic Name",
        description: "This is a valid topic description.",
      });

    expect(res.status).toBe(403);
  });

  it("should return 400 with missing fields", async () => {
    const res = await request(app)
      .post("/api/topics")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        name: "Only Name Provided",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 with name under 3 characters", async () => {
    const res = await request(app)
      .post("/api/topics")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        name: "Hi",
        description: "This description is definitely long enough.",
      });

    expect(res.status).toBe(400);
  });

  it("should return 201 and create topic if AI approves", async () => {
    const res = await request(app)
      .post("/api/topics")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        name: "Brand New Topic",
        description:
          "This is a brand new topic description that is long enough.",
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.isDuplicate).toBe(false);
    expect(res.body.topic).toHaveProperty("id");
    expect(res.body.topic.name).toBe("Brand New Topic");
  });

  it("should return 200 and block creation if AI marks as duplicate", async () => {
    const existingTopic = await prisma.topic.findFirst();

    process.env.MOCK_DUPLICATE_TOPIC_ID = existingTopic.id.toString();

    const res = await request(app)
      .post("/api/topics")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        name: "Redundant Topic",
        description: "This topic should be blocked by our mocked AI.",
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(false);
    expect(res.body.isDuplicate).toBe(true);
    expect(res.body.existingTopicId).toBe(existingTopic.id);
    expect(res.body.reason).toBe("Subsumed by existing topic mock.");

    delete process.env.MOCK_DUPLICATE_TOPIC_ID;
  });
});
