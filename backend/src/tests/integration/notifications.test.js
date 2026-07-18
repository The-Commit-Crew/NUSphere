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
import prisma from "../../config/prisma.js";

jest.mock("../../utils/notificationEmitter.js", () => ({
  default: { emit: jest.fn() },
}));

const timestamp = Date.now();

let validCookies1 = [];
let validCsrfToken1;
let testUser1Id;
let testUser2Id;
let testTopicId;
let testPostId;
let testCommentId;
let unreadNotificationId;
let otherUserNotificationId;

beforeAll(async () => {
  const bcrypt = await import("bcrypt");
  const password = "Password1";
  const hashed = await bcrypt.default.hash(password, 10);

  const user1 = await prisma.user.create({
    data: {
      firstName: "Notif",
      lastName: "Tester 1",
      username: `notiftester1_${timestamp}`,
      email: `notif1_${timestamp}@u.nus.edu`,
      password: hashed,
      isVerified: true,
    },
  });
  testUser1Id = user1.id;

  const user2 = await prisma.user.create({
    data: {
      firstName: "Notif",
      lastName: "Tester 2",
      username: `notiftester2_${timestamp}`,
      email: `notif2_${timestamp}@u.nus.edu`,
      password: hashed,
      isVerified: true,
    },
  });
  testUser2Id = user2.id;

  const authData_validCookies1 = await loginAndGetCookies(user1.email, password);
  validCookies1 = authData_validCookies1.cookies;
  validCsrfToken1 = authData_validCookies1.csrfToken;

  const topic = await prisma.topic.create({
    data: {
      name: `Notification Integration Topic ${timestamp}`,
      description: "Testing notifications",
    },
  });
  testTopicId = topic.id;

  const post = await prisma.post.create({
    data: {
      title: "Notification Test Post",
      content: "Content for testing",
      topicId: testTopicId,
      authorId: testUser1Id,
    },
  });
  testPostId = post.id;

  const comment = await prisma.comment.create({
    data: {
      content: "Notification Test Comment",
      postId: testPostId,
      authorId: testUser2Id,
    },
  });
  testCommentId = comment.id;

  const notif1 = await prisma.notification.create({
    data: {
      userId: testUser1Id,
      type: "REPLY",
      message: "Someone replied to your comment!",
      postId: testPostId,
      commentId: testCommentId,
      isRead: false,
    },
  });
  unreadNotificationId = notif1.id;

  await prisma.notification.create({
    data: {
      userId: testUser1Id,
      type: "VOTE",
      message: "Someone upvoted your post!",
      postId: testPostId,
      isRead: true,
    },
  });

  const notif3 = await prisma.notification.create({
    data: {
      userId: testUser2Id,
      type: "MENTION",
      message: "Someone mentioned you!",
      postId: testPostId,
      isRead: false,
    },
  });
  otherUserNotificationId = notif3.id;
}, 30000);

afterAll(async () => {
  await prisma.notification.deleteMany({
    where: { userId: { in: [testUser1Id, testUser2Id] } },
  });
  await prisma.comment.deleteMany({ where: { postId: testPostId } });
  await prisma.post.deleteMany({ where: { topicId: testTopicId } });
  await prisma.topic.deleteMany({ where: { id: testTopicId } });
  await prisma.refreshToken.deleteMany({
    where: { userId: { in: [testUser1Id, testUser2Id] } },
  });
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

describe("GET /api/notifications", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get("/api/notifications");
    expect(res.status).toBe(401);
  });

  it("should return 200 and a list of notifications with included relational data", async () => {
    const res = await request(app)
      .get("/api/notifications")
      .set("Cookie", validCookies1).set("x-csrf-token", validCsrfToken1);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    const notification = res.body.find((n) => n.id === unreadNotificationId);

    expect(notification).toBeDefined();
    expect(notification.message).toBe("Someone replied to your comment!");
    expect(notification.isRead).toBe(false);
    expect(notification.post.title).toBe("Notification Test Post");
    expect(notification.comment.content).toBe("Notification Test Comment");
  });
});

describe("PATCH /api/notifications/:id/read", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app).patch(
      `/api/notifications/${unreadNotificationId}/read`,
    );
    expect(res.status).toBe(403);
  });

  it("should return 400 for a non-existent notification", async () => {
    const res = await request(app)
      .patch("/api/notifications/999999/read")
      .set("Cookie", validCookies1).set("x-csrf-token", validCsrfToken1);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Notification not found");
  });

  it("should return 400 when trying to mark another user's notification as read", async () => {
    const res = await request(app)
      .patch(`/api/notifications/${otherUserNotificationId}/read`)
      .set("Cookie", validCookies1).set("x-csrf-token", validCsrfToken1);

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Unauthorized to modify this notification");
  });

  it("should return 200 and mark the notification as read", async () => {
    const res = await request(app)
      .patch(`/api/notifications/${unreadNotificationId}/read`)
      .set("Cookie", validCookies1).set("x-csrf-token", validCsrfToken1);

    expect(res.status).toBe(200);
    expect(res.body.isRead).toBe(true);

    const verifyDb = await prisma.notification.findUnique({
      where: { id: unreadNotificationId },
    });
    expect(verifyDb.isRead).toBe(true);
  });
});
