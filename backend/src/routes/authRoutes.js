import {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
  refreshAccessToken,
  logout,
  logoutOfAllDevices,
  requestPasswordReset,
  resetPassword,
} from "../controllers/authController.js";
import { Router } from "express";
import { authenticateToken } from "../middleware/authMiddleware.js";
import { authLimiter } from "../middleware/rateLimiter.js";
import { generateCsrfToken } from "../config/csrf.js";

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new NUS user
 *     description: Creates a new unverified user and sends an OTP to their NUS email for verification.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *     responses:
 *       201:
 *         description: User created and OTP sent to NUS email
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 action:
 *                   type: string
 *                   example: otp_required
 *                 message:
 *                   type: string
 *                   example: OTP sent to your NUS email
 *       400:
 *         description: Validation error or email/username already taken
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

 */
router.post("/register", authLimiter, registerUser);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login with email or username
 *     description: >
 *       Logs in a user.
 *       - If the user is verified, it sets HttpOnly `accessToken` and `refreshToken` cookies.
 *       - If the user is not verified, it sends an OTP to their email (no cookies set).
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Login successful (with cookies) or OTP required (no cookies).
 *         headers:
 *           Set-Cookie:
 *             description: Sent only if action is 'login'. Contains accessToken and refreshToken.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid credentials or validation error
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

 */
router.post("/login", authLimiter, loginUser);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP to activate account
 *     description: Verifies the OTP and sets HttpOnly cookies (`accessToken`, `refreshToken`) upon success.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/OtpRequest'
 *     responses:
 *       200:
 *         description: OTP verified successfully, authentication cookies set
 *         headers:
 *           Set-Cookie:
 *             description: Contains accessToken and refreshToken cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Invalid or expired OTP
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

 */
router.post("/verify-otp", authLimiter, verifyOtp);

/**
 * @swagger
 * /api/auth/resend-otp:
 *   post:
 *     summary: Resend OTP to unverified user
 *     description: Invalidates any existing unused OTPs and sends a fresh one to the user's NUS email. Only works for unverified users.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResendOtpRequest'
 *     responses:
 *       200:
 *         description: OTP resent successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: OTP resent to your NUS email
 *       400:
 *         description: User not found or already verified
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

 */
router.post("/resend-otp", authLimiter, resendOtp);

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Refresh the short-lived access token
 *     description: Reads the HttpOnly `refreshToken` cookie, rotates it in the database, and returns a new set of cookies.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: New access and refresh tokens successfully generated
 *         headers:
 *           Set-Cookie:
 *             description: Contains updated accessToken and refreshToken cookies
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: New access and refresh tokens successfully generated
 *       400:
 *         description: Refresh token missing, expired, or revoked
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/refresh", refreshAccessToken);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Logout from current device
 *     description: Invalidates the current refresh token in the database and instructs the browser to clear auth cookies.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         headers:
 *           Set-Cookie:
 *             description: Clears accessToken and refreshToken from the browser
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out successfully
 *       400:
 *         description: Something went wrong during logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/logout-all:
 *   post:
 *     summary: Logout from all devices
 *     description: Deletes every active refresh token session for the authenticated user and clears current cookies.
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Logged out of all devices successfully
 *         headers:
 *           Set-Cookie:
 *             description: Clears accessToken and refreshToken from the browser
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Logged out of all devices successfully
 *       400:
 *         description: Something went wrong during global logout
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Access denied. No token provided (from middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Access denied. No token provided
 *       403:
 *         description: Invalid or expired token (from middleware)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid or expired token
 */
router.post("/logout-all", authenticateToken, logoutOfAllDevices);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Request a password reset link
 *     description: Generates a secure, expiring token and sends a magic link to the user's email.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ForgotPasswordRequest'
 *     responses:
 *       200:
 *         description: Reset link sent if account exists
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: If an account exists, a reset link has been sent.
 *       400:
 *         description: Validation error
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

 */
router.post("/forgot-password", authLimiter, requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password/{token}:
 *   patch:
 *     summary: Reset account password
 *     description: Validates the token and updates the user's password. Invalidates all active refresh tokens.
 *     tags: [Auth]
 *     parameters:
 *       - in: path
 *         name: token
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ResetPasswordRequest'
 *     responses:
 *       200:
 *         description: Password updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Password updated successfully
 *       400:
 *         description: Token expired, invalid, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch("/reset-password/:token", resetPassword);

/**
 * @swagger
 * /api/auth/csrf-token:
 *   get:
 *     summary: Fetch a CSRF token for state-changing requests
 *     description: >
 *       Generates and returns a CSRF token that must be included in the `x-csrf-token` header
 *       for all POST, PUT, PATCH, and DELETE requests. Also sets the hidden `csrfToken` HttpOnly cookie.
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: CSRF token successfully generated
 *         headers:
 *           Set-Cookie:
 *             description: The HttpOnly cookie used for the Double Submit CSRF defense.
 *             schema:
 *               type: string
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 csrfToken:
 *                   type: string
 *                   description: The token string to attach to the x-csrf-token header.
 */
router.get("/csrf-token", (req, res) => {
  const token = generateCsrfToken(req, res);
  res.json({ csrfToken: token });
});

export default router;
