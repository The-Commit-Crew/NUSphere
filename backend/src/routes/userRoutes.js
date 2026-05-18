import { createUser } from "../controllers/userController.js";
import { Router } from "express";

const router = Router();

router.post("/register", createUser);

export default router;
