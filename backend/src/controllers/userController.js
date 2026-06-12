import {
  updateUserProfileService,
  getUserProfileService,
  getUserDashboardService,
} from "../services/userService.js";

export const updateUserProfile = async (req, res) => {
  try {
    const result = await updateUserProfileService(req.user.userId, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserProfile = async (req, res) => {
  try {
    const result = await getUserProfileService(
      req.user ? req.user.userId : null,
      req.params.username,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

export const getUserDashboard = async (req, res) => {
  try {
    const result = await getUserDashboardService(req.user.userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};
