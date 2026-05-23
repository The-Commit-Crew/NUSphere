import { authenticateToken } from "../middleware/authMiddleware.js";
import { createPost, getPostById } from "../controllers/postController.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/posts:
 *   post:
 *     summary: Create a new post
 *     description: Creates a new post under a specified topic. Requires a valid JWT token in the Authorization header.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreatePostRequest'
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostWithDetails'
 *       400:
 *         description: Validation error or topic not found
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
router.post("/", authenticateToken, createPost);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: Returns a single post along with the author's username, firstName, and lastName, and the topic name.
 *     tags: [Posts]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the post
 *         example: 1
 *     responses:
 *       200:
 *         description: Post with author and topic details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PostWithDetails'
 *       400:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getPostById);

export default router;
