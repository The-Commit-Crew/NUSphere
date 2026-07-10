import {
  updateUserProfileService,
  getUserProfileService,
  getUserDashboardService,
  updateProfilePhotoService,
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

export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No image file provided." });
    }
    const result = await updateProfilePhotoService(
      req.user.userId,
      req.file.path,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const removeProfilePhoto = async (req, res) => {
  try {
    await updateProfilePhotoService(req.user.userId, null);
    res.status(200).json({ message: "Profile photo removed successfully." });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
