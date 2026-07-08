import {
  toggleBookmark,
  getUserBookmarks,
} from "../controllers/bookmarkController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/bookmarks/{id}:
 *   post:
 *     summary: Toggle a bookmark on a post
 *     description: Adds a post to the user's bookmarks. If it is already bookmarked, it removes it.
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The numeric ID of the post
 *     responses:
 *       200:
 *         description: Bookmark toggled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 bookmarkStatus:
 *                   type: boolean
 *                   description: True if bookmarked, false if bookmark was removed
 *                   example: true
 *       400:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
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
router.post("/:id", authenticateToken, toggleBookmark);

/**
 * @swagger
 * /api/bookmarks:
 *   get:
 *     summary: Get user's bookmarked posts
 *     description: Retrieves all posts bookmarked by the authenticated user, ordered by most recently saved.
 *     tags: [Bookmarks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: A list of bookmarked posts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 allOf:
 *                   - $ref: '#/components/schemas/PostWithDetails'
 *                   - type: object
 *                     properties:
 *                       bookmarkedAt:
 *                         type: string
 *                         format: date-time
 *                         description: The timestamp when the user bookmarked the post
 *       401:
 *         description: Unauthorized
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
router.get("/", authenticateToken, getUserBookmarks);

export default router;
