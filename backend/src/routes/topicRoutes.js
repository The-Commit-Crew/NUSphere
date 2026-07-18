import { getAllTopics, getTopicById } from "../controllers/topicController.js";
import { Router } from "express";

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
