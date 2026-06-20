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
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Successfully retrieved the list of notifications.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Access denied. No token provided.
 *       403:
 *         description: Invalid or expired token.
 *       400:
 *         description: Bad request or database error.
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
 *       - bearerAuth: []
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
 *       401:
 *         description: Access denied. No token provided.
 *       403:
 *         description: Invalid or expired token.
 */
router.patch("/:id/read", authenticateToken, markNotificationAsRead);

export default router;
