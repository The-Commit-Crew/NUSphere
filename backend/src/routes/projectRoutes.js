import { authenticateToken } from "../middleware/authMiddleware.js";
import { moderateContent } from "../middleware/contentModeration.js";
import { moderationLimiter } from "../middleware/rateLimiter.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  applyToProject,
  getProjectApplications,
  updateApplicationStatus,
  getAllSkills,
  searchProjects,
} from "../controllers/projectController.js";
import { optionalAuth } from "../middleware/authMiddleware.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/projects:
 *   get:
 *     summary: Get all open projects
 *     description: Returns a list of all projects with status OPEN, ordered by newest first. Each project includes the required skills and author details.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all open projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getAllProjects);

/**
 * @swagger
 * /api/projects/skills:
 *   get:
 *     summary: Get all available skills
 *     description: Returns a list of all skills currently in the database, ordered alphabetically.
 *     tags: [Projects]
 *     responses:
 *       200:
 *         description: List of all skills
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Skill'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/skills", getAllSkills);

/**
 * @swagger
 * /api/projects/search:
 *   get:
 *     summary: Search and filter projects
 *     description: Search projects by title/description, filter by skills, and apply custom sorting and pagination. If the user is authenticated, the 'recommended' sort will personalize results based on the user's skills.
 *     tags: [Projects]
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *         description: Search term for project title or description
 *       - in: query
 *         name: skills
 *         schema:
 *           type: string
 *         description: Comma-separated list of skills to filter by (e.g., 'React,Node')
 *       - in: query
 *         name: skillMatch
 *         schema:
 *           type: string
 *           enum: [any, all]
 *           default: any
 *         description: Determines if the project should have 'any' or 'all' of the requested skills
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [newest, recommended]
 *           default: newest
 *         description: Sort order for the results
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of projects per page
 *     responses:
 *       200:
 *         description: A paginated list of matching projects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/search", optionalAuth, searchProjects);

/**
 * @swagger
 * /api/projects/{id}:
 *   get:
 *     summary: Get a project by ID
 *     description: Returns a single project with its skills, author details, and total application count.
 *     tags: [Projects]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the project
 *         example: 1
 *     responses:
 *       200:
 *         description: Project with skills, author, and application count
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectWithDetails'
 *       400:
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getProjectById);

/**
 * @swagger
 * /api/projects:
 *   post:
 *     summary: Create a new project
 *     description: Creates a new collaboration project. Skills are normalised to uppercase and created if they do not already exist. Requires a valid JWT token.
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectRequest'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error or content flagged by moderation
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ModerationError'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests, rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 *       500:
 *         description: Internal server error or content moderation failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/",
  authenticateToken,
  moderationLimiter,
  moderateContent,
  createProject,
);

/**
 * @swagger
 * /api/projects/{id}:
 *   put:
 *     summary: Update a project
 *     description: >
 *       Updates an existing project. Only the project author can update it.
 *       All fields are optional — only provided fields are updated.
 *       If skills are provided, the entire skills list is replaced.
 *       Requires a valid JWT token.
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the project to update
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProjectRequest'
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error, project not found, or content flagged by moderation
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ModerationError'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests, rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 *       500:
 *         description: Internal server error or content moderation failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put(
  "/:id",
  authenticateToken,
  moderationLimiter,
  moderateContent,
  updateProject,
);

/**
 * @swagger
 * /api/projects/{id}/apply:
 *   post:
 *     summary: Apply to a project
 *     description: >
 *       Submits an application to an open project. Users cannot apply to
 *       their own projects. Each user can only apply once per project.
 *       Requires a valid JWT token.
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the project to apply to
 *         example: 1
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ApplyToProjectRequest'
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Project not found, not open, user applying to own project, or content flagged by moderation
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ModerationError'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Too many requests, rate limit exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RateLimitError'
 *       500:
 *         description: Internal server error or content moderation failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  "/:id/apply",
  authenticateToken,
  moderationLimiter,
  moderateContent,
  applyToProject,
);

/**
 * @swagger
 * /api/projects/{id}/applications:
 *   get:
 *     summary: Get all applications for a project
 *     description: >
 *       Returns all applications for a specific project. Only the project
 *       author can view applications. Each application includes the
 *       applicant's username, name, and email. Requires a valid JWT token.
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the project
 *         example: 1
 *     responses:
 *       200:
 *         description: List of applications for the project
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ProjectApplication'
 *       400:
 *         description: Project not found or user is not the project author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/applications", authenticateToken, getProjectApplications);

/**
 * @swagger
 * /api/projects/applications/{appId}:
 *   put:
 *     summary: Update an application status
 *     description: >
 *       Accepts or rejects a project application. Only the project author
 *       can update application statuses. On status update, an email
 *       notification is sent to the applicant. Requires a valid JWT token.
 *     tags: [Projects]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: appId
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the application
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateApplicationStatusRequest'
 *     responses:
 *       200:
 *         description: Application status updated and email sent to applicant
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Application not found or user is not the project author
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Token invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/applications/:appId", authenticateToken, updateApplicationStatus);

export default router;
