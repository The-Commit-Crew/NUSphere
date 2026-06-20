import prisma from "../config/prisma.js";
import notificationEmitter from "../utils/notificationEmitter.js";

notificationEmitter.on(
  "notification",
  async ({ userId, type, message, postId, commentId }) => {
    try {
      await prisma.notification.create({
        data: {
          userId,
          type,
          message,
          postId,
          commentId,
        },
      });
    } catch (error) {
      console.error("Background Notification Error: ", error.message);
    }
  },
);

export const getUserNotificationsService = async (userId) => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      post: { select: { title: true } },
      comment: { select: { content: true } },
    },
  });
  return notifications;
};

export const markNotificationAsReadService = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });
  if (!notification) {
    throw new Error("Notification not found");
  }
  if (notification.userId != userId) {
    throw new Error("Unauthorized to modify this notification");
  }
  const updatedNotification = await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
  return updatedNotification;
};
