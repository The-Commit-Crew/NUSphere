import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  applyToProject,
  getProjectApplications,
  updateApplicationStatus,
} from "../controllers/projectController.js";
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
 *               allOf:
 *                 - $ref: '#/components/schemas/Project'
 *                 - type: object
 *                   properties:
 *                     applicationCount:
 *                       type: integer
 *                       description: Total number of applications received
 *                       example: 5
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
 *     description: Creates a new collaboration project. Skills are normalised to title case and created if they do not already exist. Requires a valid JWT token.
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - skills
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: "NLP Research Assistant"
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 example: "Looking for a student to help with sentiment analysis research."
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 example: ["Python", "NLP", "Machine Learning"]
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error
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
router.post("/", authenticateToken, createProject);

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
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 5
 *                 maxLength: 100
 *                 example: "Updated Project Title"
 *               description:
 *                 type: string
 *                 minLength: 20
 *                 example: "Updated description with more details about the project."
 *               status:
 *                 type: string
 *                 enum: [OPEN, IN_PROGRESS, COMPLETED]
 *                 example: "IN_PROGRESS"
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *                 minItems: 1
 *                 example: ["Python", "React"]
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Project'
 *       400:
 *         description: Validation error or project not found
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
router.put("/:id", authenticateToken, updateProject);

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
 *       - bearerAuth: []
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
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 maxLength: 500
 *                 description: Optional message to the project author
 *                 example: "I have 2 years of experience in NLP and would love to contribute."
 *     responses:
 *       201:
 *         description: Application submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Project application successful"
 *       400:
 *         description: Project not found, not open, or user applying to own project
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
router.post("/:id/apply", authenticateToken, applyToProject);

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
 *       - bearerAuth: []
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
 *       - bearerAuth: []
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
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [ACCEPTED, REJECTED]
 *                 example: "ACCEPTED"
 *     responses:
 *       200:
 *         description: Application status updated and email sent to applicant
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Application status updated successfully"
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
