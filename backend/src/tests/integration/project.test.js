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
import notificationEmitter from "../../utils/notificationEmitter.js";

jest.spyOn(notificationEmitter, "emit").mockImplementation(() => {});

const timestamp = Date.now();

let authorCookies = [];
let authorCsrfToken;
let applicantCookies = [];
let applicantCsrfToken;
let authorId;
let applicantId;
let testProjectId;
let testAppId;

const testAuthor = {
  firstName: "Project",
  lastName: "Author",
  username: `author${timestamp}`,
  email: `author${timestamp}@u.nus.edu`,
  password: "Password1",
};

const testApplicant = {
  firstName: "Project",
  lastName: "Applicant",
  username: `applicant${timestamp}`,
  email: `applicant${timestamp}@u.nus.edu`,
  password: "Password1",
};

beforeAll(async () => {
  const bcrypt = await import("bcrypt");
  const hashedAuthor = await bcrypt.default.hash(testAuthor.password, 10);
  const hashedApplicant = await bcrypt.default.hash(testApplicant.password, 10);

  const author = await prisma.user.create({
    data: {
      ...testAuthor,
      password: hashedAuthor,
      isVerified: true,
    },
  });
  authorId = author.id;

  const applicant = await prisma.user.create({
    data: {
      ...testApplicant,
      password: hashedApplicant,
      isVerified: true,
    },
  });
  applicantId = applicant.id;

  const authData_authorCookies = await loginAndGetCookies(testAuthor.email, testAuthor.password);
  authorCookies = authData_authorCookies.cookies;
  authorCsrfToken = authData_authorCookies.csrfToken;

  const authData_applicantCookies = await loginAndGetCookies(testApplicant.email, testApplicant.password);
  applicantCookies = authData_applicantCookies.cookies;
  applicantCsrfToken = authData_applicantCookies.csrfToken;

  const project = await prisma.project.create({
    data: {
      title: `Baseline Integration Project ${timestamp}`,
      description: "Testing project routes and applications",
      authorId: authorId,
      status: "OPEN",
    },
  });
  testProjectId = project.id;
}, 30000);

afterAll(async () => {
  await prisma.projectApplication.deleteMany({
    where: { userId: { in: [authorId, applicantId] } },
  });
  await prisma.project.deleteMany({
    where: { authorId: { in: [authorId, applicantId] } },
  });
  await prisma.refreshToken.deleteMany({
    where: { userId: { in: [authorId, applicantId] } },
  });
  await prisma.otpToken.deleteMany({
    where: { userId: { in: [authorId, applicantId] } },
  });
  await prisma.user.deleteMany({
    where: { id: { in: [authorId, applicantId] } },
  });
  await prisma.$disconnect();
}, 30000);

afterEach(() => {
  jest.clearAllMocks();
});

describe("POST /api/projects", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app)
      .post("/api/projects")
      .send({
        title: "Test Project",
        description: "Testing without auth token.",
        skills: ["React"],
      });

    expect(res.status).toBe(403);
  });

  it("should return 400 with missing fields", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({
        description:
          "This content is long enough but missing title and skills.",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 with title under 5 characters", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({
        title: "Bad",
        description: "This is a completely valid description.",
        skills: ["React"],
      });

    expect(res.status).toBe(400);
  });

  it("should return 201 with valid token and valid body", async () => {
    const res = await request(app)
      .post("/api/projects")
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({
        title: "Valid Project Title",
        description: "This is valid content for our integration test.",
        skills: ["Node.js", "Express"],
      });
    expect(res.status).toBe(201);
    expect(res.body.title).toBe("Valid Project Title");
    expect(res.body.authorId).toBe(authorId);
    expect(res.body.skills.length).toBe(2);
  });
});

describe("GET /api/projects", () => {
  it("should return 200 and a list of open projects", async () => {
    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });
});

describe("GET /api/projects/:id", () => {
  it("should return 200 with project details", async () => {
    const res = await request(app).get(`/api/projects/${testProjectId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(testProjectId);
    expect(res.body.author).toBeDefined();
    expect(res.body.applicationCount).toBeDefined();
  });

  it("should return 400 for non-existent project", async () => {
    const res = await request(app).get("/api/projects/99999");

    expect(res.status).toBe(400);
  });
});

describe("PUT /api/projects/:id", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app).put(`/api/projects/${testProjectId}`).send({
      title: "Updated Title",
    });

    expect(res.status).toBe(403);
  });

  it("should return 400 if a different user tries to update the project", async () => {
    const res = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set("Cookie", applicantCookies).set("x-csrf-token", applicantCsrfToken)
      .send({
        title: "Hacked Project Title",
      });

    expect(res.status).toBe(400);
  });

  it("should return 400 with invalid status update", async () => {
    const res = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({
        status: "INVALID_STATUS",
      });

    expect(res.status).toBe(400);
  });

  it("should return 200 and update the project successfully", async () => {
    const res = await request(app)
      .put(`/api/projects/${testProjectId}`)
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({
        title: "Updated Baseline Project Title",
        status: "IN_PROGRESS",
      });

    expect(res.status).toBe(200);
    expect(res.body.title).toBe("Updated Baseline Project Title");
    expect(res.body.status).toBe("IN_PROGRESS");
  });
});

describe("POST /api/projects/:id/apply", () => {
  beforeAll(async () => {
    await prisma.projectApplication.deleteMany({
      where: {
        projectId: testProjectId,
        userId: applicantId,
      },
    });
    await prisma.project.update({
      where: { id: testProjectId },
      data: { status: "OPEN" },
    });
  });

  it("should return 403 without csrf token", async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/apply`)
      .send({ message: "Hello" });

    expect(res.status).toBe(403);
  });

  it("should return 400 if author tries to apply to their own project", async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/apply`)
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({ message: "Applying to myself" });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("You cannot apply to your own project");
  });

  it("should return 400 if message exceeds 500 characters", async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/apply`)
      .set("Cookie", applicantCookies).set("x-csrf-token", applicantCsrfToken)
      .send({ message: "a".repeat(501) });

    expect(res.status).toBe(400);
  });

  it("should return 201 on successful application", async () => {
    const res = await request(app)
      .post(`/api/projects/${testProjectId}/apply`)
      .set("Cookie", applicantCookies).set("x-csrf-token", applicantCsrfToken)
      .send({ message: "I would be a great fit for this project!" });

    expect(res.status).toBe(201);
    expect(res.body.message).toBe("Project application successful");

    expect(notificationEmitter.emit).toHaveBeenCalledTimes(1);
    expect(notificationEmitter.emit).toHaveBeenCalledWith(
      "notification",
      expect.objectContaining({
        userId: authorId,
        type: "PROJECT_APPLICATION",
        message: "Someone applied to your project!",
        postId: null,
        commentId: null,
      }),
    );
  });
});

describe("GET /api/projects/:id/applications", () => {
  it("should return 401 without token", async () => {
    const res = await request(app).get(
      `/api/projects/${testProjectId}/applications`,
    );

    expect(res.status).toBe(401);
  });

  it("should return 400 if requested by a non-author (applicant)", async () => {
    const res = await request(app)
      .get(`/api/projects/${testProjectId}/applications`)
      .set("Cookie", applicantCookies).set("x-csrf-token", applicantCsrfToken);

    expect(res.status).toBe(400);
  });

  it("should return 200 and a list of applications for the author", async () => {
    const res = await request(app)
      .get(`/api/projects/${testProjectId}/applications`)
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(1);
    expect(res.body[0].message).toBe(
      "I would be a great fit for this project!",
    );

    testAppId = res.body[0].id;
  });
});

describe("PUT /api/projects/applications/:appId", () => {
  it("should return 403 without csrf token", async () => {
    const res = await request(app)
      .put(`/api/projects/applications/${testAppId}`)
      .send({ status: "ACCEPTED" });

    expect(res.status).toBe(403);
  });

  it("should return 400 with invalid status", async () => {
    const res = await request(app)
      .put(`/api/projects/applications/${testAppId}`)
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({ status: "MAYBE" });

    expect(res.status).toBe(400);
  });

  it("should return 400 if applicant tries to accept their own application", async () => {
    const res = await request(app)
      .put(`/api/projects/applications/${testAppId}`)
      .set("Cookie", applicantCookies).set("x-csrf-token", applicantCsrfToken)
      .send({ status: "ACCEPTED" });

    expect(res.status).toBe(400);
  });

  it("should return 200 and update status when author accepts", async () => {
    const res = await request(app)
      .put(`/api/projects/applications/${testAppId}`)
      .set("Cookie", authorCookies).set("x-csrf-token", authorCsrfToken)
      .send({ status: "ACCEPTED" });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Application status updated successfully");
  });
});
