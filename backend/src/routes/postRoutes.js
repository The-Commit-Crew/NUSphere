import {
  authenticateToken,
  optionalAuth,
} from "../middleware/authMiddleware.js";
import {
  createPost,
  getPostById,
  castVote,
  getAllPosts,
  deletePost,
} from "../controllers/postController.js";
import {
  createComment,
  getPostComments,
} from "../controllers/commentController.js";
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
 * /api/posts:
 *   get:
 *     summary: Get all posts
 *     description: Retrieves a global feed of all posts across all topics, ordered by the newest first.
 *     tags: [Posts]
 *     responses:
 *       200:
 *         description: A list of all posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PostWithDetails'
 *       400:
 *         description: Failed to fetch posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", getAllPosts);

/**
 * @swagger
 * /api/posts/{id}:
 *   get:
 *     summary: Get a post by ID
 *     description: >
 *       Returns a single post along with the author's username, firstName,
 *       and lastName, the topic name and comment content. If a valid JWT token is provided,
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
 * /api/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     description: Deletes a specific post if the authenticated user is the author. Requires a valid JWT token.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the post to delete
 *         example: 1
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Post deleted successfully"
 *       400:
 *         description: Post not found or user is not authorized to delete it
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
router.delete("/:id", authenticateToken, deletePost);

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

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   get:
 *     summary: Get all comments for a post
 *     description: Retrieves a completely nested tree structure of all comments and replies associated with a specific post.
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
 *         description: A nested array of comment objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommentWithReplies'
 *       400:
 *         description: Post not found or invalid ID format
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id/comments", getPostComments);

/**
 * @swagger
 * /api/posts/{id}/comments:
 *   post:
 *     summary: Add a comment or reply to a post
 *     description: Creates a new top-level comment, or a nested reply if a valid `parentId` is provided. Requires a valid JWT token.
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the post
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 description: The text content of the comment (max 1000 characters)
 *                 example: "This is a great point!"
 *               parentId:
 *                 type: integer
 *                 nullable: true
 *                 description: The ID of the comment being replied to. Omit or set to null for top-level comments.
 *                 example: null
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error, post not found, or parent comment mismatch
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
router.post("/:id/comments", authenticateToken, createComment);

export default router;
