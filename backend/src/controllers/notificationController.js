import {
  getUserNotificationsService,
  markNotificationAsReadService,
} from "../services/notificationService.js";

export const getUserNotifications = async (req, res) => {
  try {
    const result = await getUserNotificationsService(parseInt(req.user.userId));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const result = await markNotificationAsReadService(
      parseInt(req.params.id),
      parseInt(req.user.userId),
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
