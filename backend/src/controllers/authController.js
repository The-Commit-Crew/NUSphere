import {
  registerUserService,
  loginUserService,
  verifyOtpService,
  resendOtpService,
} from "../services/authService.js";

export const registerUser = async (req, res) => {
  try {
    const result = await registerUserService(req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const result = await loginUserService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const verifyOtp = async (req, res) => {
  try {
    const result = await verifyOtpService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const resendOtp = async (req, res) => {
  try {
    const result = await resendOtpService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
