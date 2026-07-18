import prisma from "../config/prisma.js";
import { createTopicSchema } from "../validators/topicValidator.js";
import { evalTopicSubsumption } from "../utils/openaiHelper.js";

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

export const createTopicService = async ({ name, description }) => {
  const { value, error } = createTopicSchema.validate({ name, description });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const existingTopics = await prisma.topic.findMany({
    select: {
      id: true,
      name: true,
      description: true,
    },
  });
  const aiEval = await evalTopicSubsumption(
    value.name,
    value.description,
    existingTopics,
  );
  if (aiEval.isDuplicate) {
    return {
      success: false,
      ...aiEval,
    };
  }
  const newTopic = await prisma.topic.create({
    data: {
      name: value.name,
      description: value.description,
    },
  });
  return {
    success: true,
    isDuplicate: false,
    topic: newTopic,
  };
};
