import {
  registerUser,
  loginUser,
  verifyOtp,
  resendOtp,
} from "../controllers/authController.js";
import { Router } from "express";

const router = Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);

export default router;
