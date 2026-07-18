import { authenticateToken } from "../middleware/authMiddleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
} from "../controllers/notificationController.js";
import { Router } from "express";

const router = Router();

/**
 * @swagger
 * /api/notifications:
 *   get:
 *     summary: Retrieve user notifications
 *     description: Fetches a list of notifications for the authenticated user, ordered from newest to oldest.
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request or database error.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Access denied. No token provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/", authenticateToken, getUserNotifications);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   patch:
 *     summary: Mark a notification as read
 *     description: Updates the isRead status of a specific notification belonging to the authenticated user to true.
 *     tags: [Notifications]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The unique ID of the notification to update.
 *     responses:
 *       200:
 *         description: Notification successfully marked as read.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Bad request, notification not found, or user unauthorized.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Access denied. No token provided.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Invalid or expired token.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/:id/read", authenticateToken, markNotificationAsRead);

export default router;
