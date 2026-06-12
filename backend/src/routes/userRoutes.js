import { Router } from "express";
import {
  authenticateToken,
  optionalAuth,
} from "../middleware/authMiddleware.js";
import {
  updateUserProfile,
  getUserDashboard,
  getUserProfile,
} from "../controllers/userController.js";

const router = Router();

/**
 * @swagger
 * /api/users/me/dashboard:
 *   get:
 *     summary: Get the authenticated user's dashboard
 *     description: Returns the user's core identity data, skills, authored projects (with inbound applications), and the status of outbound applications.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserDashboard'
 *       401:
 *         description: Unauthorized - No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Token is invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/me/dashboard", authenticateToken, getUserDashboard);

/**
 * @swagger
 * /api/users/me:
 *   put:
 *     summary: Update the authenticated user's profile
 *     description: Updates profile fields such as bio, links, and profile picture. Completely replaces the existing skills array with the new one provided. Unprovided fields remain unchanged.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateProfileRequest'
 *     responses:
 *       200:
 *         description: User profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden - Token is invalid or expired
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.put("/me", authenticateToken, updateUserProfile);

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get a user's profile
 *     description: Retrieves a user's public profile based on their username. If the requesting user is the owner of the profile, private data (like email and private applications) is appended to the response.
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *         description: The username of the requested profile
 *         example: "johndoe"
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserProfile'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get("/:username", optionalAuth, getUserProfile);

export default router;
