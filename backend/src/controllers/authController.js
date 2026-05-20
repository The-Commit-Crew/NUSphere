import {
  registerUserService,
  loginUserService,
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
    res.status(401).json({
      message: error.message,
    });
  }
};
