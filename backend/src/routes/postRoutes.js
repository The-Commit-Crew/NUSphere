import {
  authenticateToken,
  optionalAuth,
} from "../middleware/authMiddleware.js";
import {
  createPost,
  getPostById,
  castVote,
} from "../controllers/postController.js";
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
 *     description: >
 *       Returns a single post along with the author's username, firstName,
 *       and lastName, and the topic name. If a valid JWT token is provided,
 *       also returns the authenticated user's current vote status on the post.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *       - {}
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
 *         description: Post with author and topic details, plus optional vote status
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/PostWithDetails'
 *                 - type: object
 *                   properties:
 *                     userVoteStatus:
 *                       type: string
 *                       nullable: true
 *                       enum: [UP, DOWN]
 *                       description: >
 *                         The current user's vote on this post.
 *                         null if unauthenticated or not yet voted.
 *                       example: "UP"
 *       400:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", optionalAuth, getPostById);

/**
 * @swagger
 * /api/posts/{id}/vote:
 *   post:
 *     summary: Cast a vote on a post
 *     description: Upvotes or downvotes a specific post. If the user has already cast the same vote, it acts as a toggle and removes the vote. If they
 *       switch their vote, it updates their choice. Requires a valid JWT token.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the post to vote on
 *         example: 42
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - voteType
 *             properties:
 *               voteType:
 *                 type: string
 *                 enum: [UP, DOWN]
 *                 description: The type of vote to cast
 *                 example: "UP"
 *     responses:
 *       200:
 *         description: Vote processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 42
 *                 upvoteCount:
 *                   type: integer
 *                   example: 15
 *                 downvoteCount:
 *                   type: integer
 *                   example: 3
 *       400:
 *         description: Validation error or post not found
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
router.post("/:id/vote", authenticateToken, castVote);

export default router;
