import prisma from "../config/prisma.js";

export const getAllTopicsService = async () => {
  const topics = await prisma.topic.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: {
        select: { posts: true },
      },
    },
  });

  return topics.map((topic) => ({
    ...topic,
    postCount: topic._count.posts,
  }));
};

export const getTopicByIdService = async (topicId) => {
  const parsedTopicId = parseInt(topicId);
  const topic = await prisma.topic.findUnique({
    where: { id: parsedTopicId },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  return topic;
};
