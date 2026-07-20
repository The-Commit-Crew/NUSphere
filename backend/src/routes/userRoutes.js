import { Router } from "express";
import {
  authenticateToken,
  optionalAuth,
} from "../middleware/authMiddleware.js";
import {
  moderateContent,
  moderateImageContent,
} from "../middleware/contentModeration.js";
import { moderationLimiter } from "../middleware/rateLimiter.js";
import { uploadProfilePic } from "../middleware/uploadMiddleware.js";
import {
  updateUserProfile,
  getUserDashboard,
  getUserProfile,
  updateProfilePhoto,
  removeProfilePhoto,
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
 *       - cookieAuth: []
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
 *       - cookieAuth: []
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
 *         description: Validation error or content flagged by moderation
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ModerationError'
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
router.put(
  "/me",
  authenticateToken,
  moderationLimiter,
  moderateContent,
  updateUserProfile,
);

/**
 * @swagger
 * /api/users/{username}:
 *   get:
 *     summary: Get a user's profile
 *     description: Retrieves a user's public profile based on their username. If the requesting user is the owner of the profile, private data (like email and private applications) is appended to the response.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
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

/**
 * @swagger
 * /api/users/me/photo:
 *   patch:
 *     summary: Upload a new profile photo
 *     description: Accepts a multipart/form-data image, uploads it to Cloudinary, and updates the user's profile.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/UploadProfileImageRequest'
 *     responses:
 *       200:
 *         description: Profile photo successfully updated.
 *       400:
 *         description: No file provided, invalid file format/size, or image flagged by moderation.
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - $ref: '#/components/schemas/Error'
 *                 - $ref: '#/components/schemas/ModerationError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Forbidden (CSRF token missing/invalid)
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
router.patch(
  "/me/photo",
  authenticateToken,
  moderationLimiter,
  uploadProfilePic.single("profileImage"),
  moderateImageContent,
  updateProfilePhoto,
);

/**
 * @swagger
 * /api/users/me/photo:
 *   delete:
 *     summary: Remove profile photo
 *     description: Deletes the user's profile photo by setting the database field to null. Requires CSRF token.
 *     tags: [Users]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Profile photo removed successfully.
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden (CSRF token missing/invalid)
 */
router.delete("/me/photo", authenticateToken, removeProfilePhoto);

export default router;
