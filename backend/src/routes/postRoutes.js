import {
  authenticateToken,
  optionalAuth,
} from "../middleware/authMiddleware.js";
import { moderateContent } from "../middleware/contentModeration.js";
import {
  createPost,
  getPostById,
  castVote,
  getAllPosts,
  deletePost,
  checkDuplicates,
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
 *       - cookieAuth: []
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
 *         description: Validation error, topic not found, or content flagged by moderation
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
 *       500:
 *         description: Internal server error or content moderation failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/", authenticateToken, moderateContent, createPost);

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
 * /api/posts/check-duplicates:
 *   post:
 *     summary: Check for semantically similar posts
 *     description: >
 *       Evaluates a drafted post's title and content against the database using vector embeddings.
 *       Returns up to 3 historically similar posts to prevent duplicate questions.
 *       Does not require authentication, allowing it to run freely while a user types.
 *     tags: [Posts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The drafted title of the post
 *                 example: "Is CS2040C hard?"
 *               content:
 *                 type: string
 *                 description: The drafted body content of the post
 *                 example: "I am struggling with the assignments."
 *     responses:
 *       200:
 *         description: Successfully checked for duplicates. Returns an array of similar posts (empty array if none found).
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 similarPosts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 42
 *                       title:
 *                         type: string
 *                         example: "CS2040C workload is crazy"
 *                       content:
 *                         type: string
 *                         example: "Does anyone else find the data structures hard?"
 *                       similarity:
 *                         type: number
 *                         format: float
 *                         description: Semantic similarity score (1.0 is a perfect match)
 *                         example: 0.88
 *       500:
 *         description: Internal server error (e.g., AI embedding generation failed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/check-duplicates", checkDuplicates);

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
 *       - cookieAuth: []
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
 *                     bookmarkStatus:
 *                       type: boolean
 *                       nullable: true
 *                       description: >
 *                         Whether the current user has bookmarked this post.
 *                         null if unauthenticated, true/false if logged in.
 *                       example: true
 *
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
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
 *               isAnonymous:
 *                 type: boolean
 *                 nullable: true
 *                 example: false
 *     responses:
 *       201:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Comment'
 *       400:
 *         description: Validation error, post not found, parent comment mismatch, or content flagged by moderation
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
 *       500:
 *         description: Internal server error or content moderation failure
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/:id/comments", authenticateToken, moderateContent, createComment);

export default router;
