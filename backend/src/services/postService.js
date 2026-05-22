import prisma from "../config/prisma.js";
import { createPostSchema } from "../validators/postValidator.js";

export const createPostService = async (
  userId,
  { title, content, topicId },
) => {
  const { error } = createPostSchema.validate({ title, content, topicId });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const topic = await prisma.topic.findUnique({
    where: {
      id: topicId,
    },
  });

  if (!topic) {
    throw new Error("Topic not found");
  }

  const post = await prisma.post.create({
    data: {
      title,
      content,
      authorId: userId,
      topicId,
    },
    include: {
      author: {
        select: { username: true },
      },
      topic: {
        select: { name: true },
      },
    },
  });

  return post;
};

export const getPostByIdService = async (postId) => {
  const parsedPostId = parseInt(postId);
  const post = await prisma.post.findUnique({
    where: {
      id: parsedPostId,
    },
    include: {
      author: {
        select: {
          username: true,
          firstName: true,
          lastName: true,
        },
      },
      topic: {
        select: { name: true },
      },
    },
  });
  if (!post) {
    throw new Error("Post not found");
  }
  return post;
};
