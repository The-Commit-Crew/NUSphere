import prisma from "../config/prisma.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/commentValidator.js";

export const createCommentService = async (
  postId,
  authorId,
  { content, parentId },
) => {
  const { error, value } = createCommentSchema.validate({ content, parentId });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) {
    throw new Error("Post not found");
  }
  if (parentId) {
    const comment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true },
    });
    if (!comment) {
      throw new Error("Parent comment not found");
    }
    if (comment.postId != postId) {
      throw new Error("Parent comment does not belong to this post");
    }
  }
  const newComment = await prisma.comment.create({
    data: {
      content: value.content,
      postId,
      authorId,
      parentId: parentId ?? null,
    },
  });
  return newComment;
};

export const getPostCommentsService = async (postId) => {
  const comments = await prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "asc" },
    include: {
      author: {
        select: { username: true, profilePic: true },
      },
    },
  });

  const commentMap = {};
  const rootComments = [];
  comments.forEach((comment) => {
    comment.replies = [];
    commentMap[comment.id] = comment;
  });

  comments.forEach((comment) => {
    if (comment.parentId) {
      if (commentMap[comment.parentId]) {
        commentMap[comment.parentId].replies.push(comment);
      }
    } else {
      rootComments.push(comment);
    }
  });

  return rootComments;
};

export const updateCommentService = async (
  commentId,
  authorId,
  { content },
) => {
  const { error, value } = updateCommentSchema.validate({ content });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      authorId: true,
    },
  });
  if (!comment) {
    throw new Error("Comment not found");
  }
  if (comment.authorId != authorId) {
    throw new Error("Unauthorized to edit this comment");
  }
  const updatedComment = await prisma.comment.update({
    where: {
      id: commentId,
    },
    data: {
      content: value.content,
    },
  });
  return updatedComment;
};

export const deleteCommentService = async (commentId, authorId) => {
  const comment = await prisma.comment.findUnique({
    where: {
      id: commentId,
    },
    select: {
      authorId: true,
    },
  });
  if (!comment) {
    throw new Error("Comment not found");
  }
  if (comment.authorId != authorId) {
    throw new Error("Unauthorized to delete this comment");
  }
  await prisma.comment.delete({
    where: {
      id: commentId,
    },
  });
  return {
    message: "Comment deleted successfully",
  };
};
