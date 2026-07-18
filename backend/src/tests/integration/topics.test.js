import { describe, it, beforeAll, afterAll, expect } from "@jest/globals";
import request from "supertest";
import app from "../../app.js";
import prisma from "../../config/prisma.js";

const timestamp = Date.now();

let testTopicId;

beforeAll(async () => {
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
  await prisma.topic.delete({ where: { id: testTopicId } });
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
