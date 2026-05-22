import { authenticateToken } from "../middleware/authMiddleware.js";
import { createPost, getPostById } from "../controllers/postController.js";
import { Router } from "express";

const router = Router();

router.post("/", authenticateToken, createPost);
router.get("/:id", getPostById);

export default router;
