import {
  registerUserService,
  loginUserService,
  verifyOtpService,
  resendOtpService,
  refreshAccessTokenService,
  logoutService,
  logoutOfAllDevicesService,
  requestPasswordResetService,
  resetPasswordService,
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
    if (result.action === "login") {
      res.cookie("accessToken", result.token, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 15 * 60 * 1000,
      });
      res.cookie("refreshToken", result.refresh, {
        httpOnly: true,
        secure: true,
        sameSite: "none",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
      delete result.token;
      delete result.refresh;
    }
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
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", result.refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    delete result.token;
    delete result.refresh;
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

export const refreshAccessToken = async (req, res) => {
  try {
    const result = await refreshAccessTokenService(req.cookies.refreshToken);
    res.cookie("accessToken", result.token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refreshToken", result.refresh, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    delete result.token;
    delete result.refresh;
    res.status(200).json({
      message: "New access and refresh tokens successfully generated",
    });
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const logout = async (req, res) => {
  try {
    const result = await logoutService(req.cookies.refreshToken);
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const logoutOfAllDevices = async (req, res) => {
  try {
    const result = await logoutOfAllDevicesService(parseInt(req.user.userId));
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const requestPasswordReset = async (req, res) => {
  try {
    const result = await requestPasswordResetService(req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const result = await resetPasswordService(req.params.token, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
