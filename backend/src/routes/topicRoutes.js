import {
  getAllTopics,
  getTopicById,
  createTopic,
} from "../controllers/topicController.js";
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { moderateContent } from "../middleware/contentModeration.js";
import { moderationLimiter } from "../middleware/rateLimiter.js";

const router = Router();

/**
 * @swagger
 * /api/topics:
 *   get:
 *     summary: Get all topics
 *     description: Returns a list of all discussion topics ordered alphabetically, each with a count of how many posts it contains.
 *     tags: [Topics]
 *     responses:
 *       200:
 *         description: List of all topics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Topic'
 */
router.get("/", getAllTopics);

/**
 * @swagger
 * /api/topics:
 *   post:
 *     summary: Create a new topic
 *     description: >
 *       Proposes a new discussion topic. The request is evaluated by an AI moderator to prevent redundancies.
 *       If subsumed by an existing topic, it returns a 200 OK with the existing topic's ID instead of creating a new one.
 *       Requires a valid JWT token and CSRF token.
 *     tags: [Topics]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateTopicRequest'
 *     responses:
 *       201:
 *         description: Topic created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CreateTopicResponse'
 *       200:
 *         description: Topic creation blocked by AI due to subsumption/duplication
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DuplicateTopicResponse'
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
 *         description: Token invalid, expired, or missing CSRF token
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
  createTopic,
);

/**
 * @swagger
 * /api/topics/{id}:
 *   get:
 *     summary: Get a topic by ID
 *     description: Returns a single topic's details by its ID.
 *     tags: [Topics]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the topic
 *         example: 1
 *     responses:
 *       200:
 *         description: Topic with its posts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TopicById'
 *       400:
 *         description: Topic not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:id", getTopicById);

export default router;
