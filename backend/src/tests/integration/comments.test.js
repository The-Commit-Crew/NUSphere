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
import app from "../../app.js";
import prisma from "../../config/prisma.js";
import notificationEmitter from "../../utils/notificationEmitter.js";

jest.spyOn(notificationEmitter, "emit").mockImplementation(() => {});

const timestamp = Date.now();

let authToken1;
let authToken2;
let testUser1Id;
let testUser2Id;
let testTopicId;
let testPost1Id;
let testPost2Id;
let topLevelCommentId;
let replyCommentId;
let user2CommentId;

beforeAll(async () => {
  const bcrypt = await import("bcrypt");
  const password = "Password1";
  const hashed = await bcrypt.default.hash(password, 10);

  const user1 = await prisma.user.create({
    data: {
      firstName: "Comment",
      lastName: "Tester 1",
      username: `commenttester1_${timestamp}`,
      email: `comment1_${timestamp}@u.nus.edu`,
      password: hashed,
      isVerified: true,
    },
  });
  testUser1Id = user1.id;

  const user2 = await prisma.user.create({
    data: {
      firstName: "Comment",
      lastName: "Tester 2",
      username: `commenttester2_${timestamp}`,
      email: `comment2_${timestamp}@u.nus.edu`,
      password: hashed,
      isVerified: true,
    },
  });
  testUser2Id = user2.id;

  const loginRes1 = await request(app)
    .post("/api/auth/login")
    .send({ email: user1.email, password });
  authToken1 = loginRes1.body.token;

  const loginRes2 = await request(app)
    .post("/api/auth/login")
    .send({ email: user2.email, password });
  authToken2 = loginRes2.body.token;

  const topic = await prisma.topic.create({
    data: {
      name: `Comment Integration Topic ${timestamp}`,
      description: "Testing comments",
    },
  });
  testTopicId = topic.id;

  const post1 = await prisma.post.create({
    data: {
      title: "Post 1",
      content: "Content 1",
      topicId: testTopicId,
      authorId: testUser1Id,
    },
  });
  testPost1Id = post1.id;

  const post2 = await prisma.post.create({
    data: {
      title: "Post 2",
      content: "Content 2",
      topicId: testTopicId,
      authorId: testUser1Id,
    },
  });
  testPost2Id = post2.id;
}, 30000);

afterAll(async () => {
  await prisma.post.deleteMany({ where: { topicId: testTopicId } });
  await prisma.topic.deleteMany({ where: { id: testTopicId } });
  await prisma.otpToken.deleteMany({
    where: { userId: { in: [testUser1Id, testUser2Id] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [testUser1Id, testUser2Id] } },
  });
  await prisma.$disconnect();
}, 30000);

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/posts/:id/comments", () => {
  it("should return 401 without token", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPost1Id}/comments`)
      .send({ content: "Testing without auth token." });
    expect(res.status).toBe(401);
  });

  it("should return 400 for non-existent post", async () => {
    const res = await request(app)
      .post("/api/posts/99999/comments")
      .set("Authorization", `Bearer ${authToken1}`)
      .send({ content: "Valid content" });
    expect(res.status).toBe(400);
  });

  it("should return 201 when creating a top-level comment", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPost1Id}/comments`)
      .set("Authorization", `Bearer ${authToken2}`)
      .send({ content: "First top-level comment" });

    expect(res.status).toBe(201);
    expect(res.body.content).toBe("First top-level comment");
    expect(res.body.authorId).toBe(testUser2Id);
    expect(res.body.parentId).toBeNull();

    topLevelCommentId = res.body.id;

    expect(notificationEmitter.emit).toHaveBeenCalledWith(
      "notification",
      expect.objectContaining({
        type: "REPLY",
        message: "Someone commented on your post!",
        postId: testPost1Id,
        userId: testUser1Id,
      }),
    );
  });

  it("should return 400 when parentId belongs to a completely different post", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPost2Id}/comments`)
      .set("Authorization", `Bearer ${authToken1}`)
      .send({
        content: "Trying to reply to a comment on Post 1",
        parentId: topLevelCommentId,
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe(
      "Parent comment does not belong to this post",
    );
  });

  it("should return 201 when creating a nested reply", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPost1Id}/comments`)
      .set("Authorization", `Bearer ${authToken1}`)
      .send({
        content: "This is a reply to the top level comment.",
        parentId: topLevelCommentId,
      });

    expect(res.status).toBe(201);
    expect(res.body.parentId).toBe(topLevelCommentId);

    replyCommentId = res.body.id;

    expect(notificationEmitter.emit).toHaveBeenCalledWith(
      "notification",
      expect.objectContaining({
        type: "REPLY",
        message: "Someone replied to your comment!",
        userId: testUser2Id,
        postId: testPost1Id,
      }),
    );
  });

  it("should return 201 when creating an anonymous comment", async () => {
    const res = await request(app)
      .post(`/api/posts/${testPost1Id}/comments`)
      .set("Authorization", `Bearer ${authToken1}`)
      .send({ content: "Secret comment", isAnonymous: true });

    expect(res.status).toBe(201);
    expect(res.body.isAnonymous).toBe(true);
  });
});

describe("GET /api/posts/:id/comments", () => {
  it("should return 200 and a perfectly nested comment tree", async () => {
    const res = await request(app).get(`/api/posts/${testPost1Id}/comments`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const rootComment = res.body.find((c) => c.id === topLevelCommentId);
    expect(rootComment).toBeDefined();
    expect(rootComment.content).toBe("First top-level comment");
    expect(rootComment.author.username).toBeDefined();

    expect(rootComment.replies).toBeDefined();
    expect(Array.isArray(rootComment.replies)).toBe(true);

    const reply = rootComment.replies.find((r) => r.id === replyCommentId);
    expect(reply).toBeDefined();
    expect(reply.content).toBe("This is a reply to the top level comment.");
  });

  it("should mask author identity for anonymous comments", async () => {
    const res = await request(app).get(`/api/posts/${testPost1Id}/comments`);
    const anonComment = res.body.find((c) => c.content === "Secret comment");

    expect(anonComment).toBeDefined();
    expect(anonComment.author.username).toBe("Anonymous");
    expect(anonComment.author.profilePic).toBeNull();
  });
});

describe("PUT /api/comments/:id", () => {
  beforeAll(async () => {
    const res = await request(app)
      .post(`/api/posts/${testPost1Id}/comments`)
      .set("Authorization", `Bearer ${authToken2}`)
      .send({ content: "User 2's original comment" });
    user2CommentId = res.body.id;
  });

  it("should return 401 without token", async () => {
    const res = await request(app)
      .put(`/api/comments/${user2CommentId}`)
      .send({ content: "Hacked update" });
    expect(res.status).toBe(401);
  });

  it("should return 400 when trying to edit someone else's comment", async () => {
    const res = await request(app)
      .put(`/api/comments/${user2CommentId}`)
      .set("Authorization", `Bearer ${authToken1}`)
      .send({ content: "Hacked update" });

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Unauthorized/);
  });

  it("should return 200 when editing own comment", async () => {
    const res = await request(app)
      .put(`/api/comments/${user2CommentId}`)
      .set("Authorization", `Bearer ${authToken2}`)
      .send({ content: "User 2's officially updated comment" });

    expect(res.status).toBe(200);
    expect(res.body.content).toBe("User 2's officially updated comment");
  });
});

describe("DELETE /api/comments/:id", () => {
  it("should return 400 when trying to delete someone else's comment", async () => {
    const res = await request(app)
      .delete(`/api/comments/${user2CommentId}`)
      .set("Authorization", `Bearer ${authToken1}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/Unauthorized/);
  });

  it("should return 200 when deleting own comment", async () => {
    const res = await request(app)
      .delete(`/api/comments/${user2CommentId}`)
      .set("Authorization", `Bearer ${authToken2}`);

    expect(res.status).toBe(200);
  });

  it("should cascade delete replies when a parent comment is deleted", async () => {
    const deleteRes = await request(app)
      .delete(`/api/comments/${topLevelCommentId}`)
      .set("Authorization", `Bearer ${authToken2}`);
    expect(deleteRes.status).toBe(200);

    const cascadeCheck = await prisma.comment.findUnique({
      where: { id: replyCommentId },
    });

    expect(cascadeCheck).toBeNull();
  });
});
