import {
  describe,
  it,
  beforeAll,
  afterAll,
  afterEach,
  expect,
  jest,
} from "@jest/globals";
import request from "supertest";
import { loginAndGetCookies } from "./testUtils.js";
import app from "../../app.js";
import redisClient from "../../config/redis.js";
import prisma from "../../config/prisma.js";
import notificationEmitter from "../../utils/notificationEmitter.js";

jest.spyOn(notificationEmitter, "emit").mockImplementation(() => {});

const timestamp = Date.now();

let validCookies = [];
let validCsrfToken;
let voterCookies = [];
let voterCsrfToken;
let testUserId;
let testTopicId;
let testPostId;
let anonPostId;
let voterUserId;

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

  const authData_validCookies = await loginAndGetCookies(
    testUser.email,
    testUser.password,
  );
  validCookies = authData_validCookies.cookies;
  validCsrfToken = authData_validCookies.csrfToken;

  const topic = await prisma.topic.create({
    data: {
      name: `Post Integration Topic ${timestamp}`,
      description: "Testing posts",
    },
  });
  testTopicId = topic.id;

  const voterUser = await prisma.user.create({
    data: {
      firstName: "Voter",
      lastName: "Tester",
      username: `voter${timestamp}`,
      email: `voter${timestamp}@u.nus.edu`,
      password: hashed,
      isVerified: true,
    },
  });
  voterUserId = voterUser.id;

  const authData_voterCookies = await loginAndGetCookies(
    voterUser.email,
    testUser.password,
  );
  voterCookies = authData_voterCookies.cookies;
  voterCsrfToken = authData_voterCookies.csrfToken;
}, 30000);

afterAll(async () => {
  await prisma.vote.deleteMany({ where: { userId: testUserId } });
  await prisma.post.deleteMany({ where: { authorId: testUserId } });
  await prisma.topic.deleteMany({ where: { id: testTopicId } });
  await prisma.refreshToken.deleteMany({
    where: { userId: { in: [testUserId, voterUserId] } },
  });
  await prisma.otpToken.deleteMany({
    where: { userId: { in: [testUserId, voterUserId] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [testUserId, voterUserId] } },
  });
  await prisma.$disconnect();
  await redisClient.quit();
}, 30000);

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/posts", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app).post("/api/posts").send({
      title: "Test Post",
      content: "Testing without auth token.",
      topicId: testTopicId,
    });

    expect(res.status).toBe(403);
  });

  it("should return 400 with missing fields", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        content: "This content is long enough but missing fields.",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 with content under 10 characters", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
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
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
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
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
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
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
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

  it("should return 201 when creating an anonymous post", async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        title: "Anonymous Post",
        content: "This is a secret post.",
        topicId: testTopicId,
        isAnonymous: true,
      });

    expect(res.status).toBe(201);
    expect(res.body.isAnonymous).toBe(true);

    anonPostId = res.body.id;
  });
});

describe("GET /api/posts/:id", () => {
  it("should return 200 with author details and null userVoteStatus for guest", async () => {
    const res = await request(app).get(`/api/posts/${testPostId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testPostId);
    expect(res.body.author).toBeDefined();
    expect(res.body.author.username).toBe(testUser.username);
    expect(res.body.topic).toBeDefined();
    expect(res.body.topic.name).toBeDefined();
    expect(res.body.userVoteStatus).toBeNull();
  });

  it("should mask the author identity when fetching an anonymous post", async () => {
    const res = await request(app).get(`/api/posts/${anonPostId}`);

    expect(res.status).toBe(200);
    expect(res.body.author.username).toBe("Anonymous");
    expect(res.body.author.firstName).toBe("Anonymous");
    expect(res.body.author.lastName).toBe("");
  });

  it("should return correct userVoteStatus for authenticated user", async () => {
    let res = await request(app)
      .get(`/api/posts/${testPostId}`)
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken);

    expect(res.status).toBe(200);
    expect(res.body.userVoteStatus).toBeNull();

    await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({ voteType: "UP" });
    res = await request(app)
      .get(`/api/posts/${testPostId}`)
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken);

    expect(res.status).toBe(200);
    expect(res.body.userVoteStatus).toBe("UP");
    await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({ voteType: "UP" });
  });

  it("should return 400 for non-existent post", async () => {
    const res = await request(app).get("/api/posts/99999");

    expect(res.status).toBe(400);
  });
});

describe("POST /api/posts/:id/vote", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app).post(`/api/posts/${testPostId}/vote`).send({
      voteType: "UP",
    });

    expect(res.status).toBe(403);
  });

  it("should return 400 with invalid voteType", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        voteType: "UPVOTE",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 for non-existent post", async () => {
    const res = await request(app)
      .post("/api/posts/99999/vote")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        voteType: "UP",
      });

    expect(res.status).toBe(400);
  });

  it("should return 200 and increment upvote on New Vote (Scenario A)", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Cookie", voterCookies)
      .set("x-csrf-token", voterCsrfToken)
      .send({
        voteType: "UP",
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testPostId);
    expect(res.body.upvoteCount).toBe(1);
    expect(res.body.downvoteCount).toBe(0);

    expect(notificationEmitter.emit).toHaveBeenCalledTimes(1);
    expect(notificationEmitter.emit).toHaveBeenCalledWith(
      "notification",
      expect.objectContaining({
        type: "VOTE",
        postId: testPostId,
        message: "Someone upvoted your post!",
      }),
    );
  });

  it("should return 200 and adjust counts on Switch Vote (Scenario C)", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPostId}/vote`)
      .set("Cookie", voterCookies)
      .set("x-csrf-token", voterCsrfToken)
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
      .set("Cookie", voterCookies)
      .set("x-csrf-token", voterCsrfToken)
      .send({
        voteType: "DOWN",
      });

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testPostId);
    expect(res.body.upvoteCount).toBe(0);
    expect(res.body.downvoteCount).toBe(0);
  });
});

describe("GET /api/posts", () => {
  it("should return 200 and a list of posts ordered by newest first", async () => {
    await request(app)
      .post("/api/posts")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        title: "The Newest Post",
        content: "This is a brand new post to test the sorting logic.",
        topicId: testTopicId,
      });

    const res = await request(app).get("/api/posts");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const newestPost = res.body[0];
    const olderPost = res.body[1];

    expect(new Date(newestPost.createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(olderPost.createdAt).getTime(),
    );

    expect(newestPost.title).toBe("The Newest Post");
    expect(newestPost.author).toBeDefined();
    expect(newestPost.author.username).toBeDefined();
    expect(newestPost.author.firstName).toBeDefined();
    expect(newestPost.topic).toBeDefined();
    expect(newestPost.topic.name).toBeDefined();
  });

  it("should mask the author identity for anonymous posts in the global feed", async () => {
    const res = await request(app).get("/api/posts");

    const fetchedAnonPost = res.body.find((p) => p.id === anonPostId);
    expect(fetchedAnonPost).toBeDefined();
    expect(fetchedAnonPost.author.username).toBe("Anonymous");
    expect(fetchedAnonPost.author.firstName).toBe("Anonymous");
    expect(fetchedAnonPost.author.lastName).toBe("");
  });

  it("should apply pagination limits correctly", async () => {
    const res = await request(app).get("/api/posts?limit=1");
    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
  });

  it("should return 200 when sorted by top", async () => {
    const res = await request(app).get("/api/posts?sort=top");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 1) {
      expect(res.body[0].upvoteCount).toBeGreaterThanOrEqual(
        res.body[1].upvoteCount,
      );
    }
  });

  it("should return 200 when sorted by hot", async () => {
    const res = await request(app).get("/api/posts?sort=hot");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return 200 and filter by topicId", async () => {
    const res = await request(app).get(`/api/posts?topicId=${testTopicId}`);
    expect(res.status).toBe(200);
    res.body.forEach((post) => {
      expect(post.topicId).toBe(testTopicId);
    });
  });

  it("should return 200 and filter by search query", async () => {
    const res = await request(app).get("/api/posts?q=Integration");
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should return 400 for invalid query parameters", async () => {
    const res = await request(app).get(
      "/api/posts?sort=invalidSort&limit=1000",
    );
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/posts/:id", () => {
  let postToDeleteId;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/posts")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        title: "Post to delete",
        content: "This post will be deleted during tests.",
        topicId: testTopicId,
      });
    postToDeleteId = res.body.id;
  });

  it("should return 403 without csrf token", async () => {
    const res = await request(app).delete(`/api/posts/${postToDeleteId}`);
    expect(res.status).toBe(403);
  });

  it("should return 400 for non-existent post", async () => {
    const res = await request(app)
      .delete("/api/posts/99999")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken);
    expect(res.status).toBe(400);
  });

  it("should return 400 if user is not the author", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postToDeleteId}`)
      .set("Cookie", voterCookies)
      .set("x-csrf-token", voterCsrfToken);
    expect(res.status).toBe(400);
  });

  it("should return 200 and delete the post", async () => {
    const res = await request(app)
      .delete(`/api/posts/${postToDeleteId}`)
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken);
    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Post deleted successfully");

    const getRes = await request(app).get(`/api/posts/${postToDeleteId}`);
    expect(getRes.status).toBe(400);
  });
});

describe("POST /api/posts/check-duplicates", () => {
  it("should return an empty array if title and content are too short", async () => {
    const res = await request(app)
      .post("/api/posts/check-duplicates")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        title: "Hi",
        content: "Yo",
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.similarPosts).toEqual([]);
  });

  it("should return similar posts for a valid draft", async () => {
    await request(app)
      .post("/api/posts")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        title: "CS2040C Data Structures",
        content: "This module is incredibly difficult.",
        topicId: testTopicId,
      });

    const res = await request(app)
      .post("/api/posts/check-duplicates")
      .set("Cookie", validCookies)
      .set("x-csrf-token", validCsrfToken)
      .send({
        title: "Is CS2040C hard?",
        content: "I am struggling with the assignments.",
      });

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.similarPosts)).toBe(true);

    expect(res.body.similarPosts.length).toBeGreaterThan(0);
    expect(res.body.similarPosts[0]).toHaveProperty("id");
    expect(res.body.similarPosts[0]).toHaveProperty("title");
    expect(res.body.similarPosts[0]).toHaveProperty("similarity");
    expect(res.body.similarPosts[0].similarity).toBe(1);
  });
});
