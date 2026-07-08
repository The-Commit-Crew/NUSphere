import prisma from "../config/prisma.js";
import {
  createCommentSchema,
  updateCommentSchema,
} from "../validators/commentValidator.js";
import notificationEmitter from "../utils/notificationEmitter.js";
import { extractMentions } from "../utils/mentionParser.js";

export const createCommentService = async (
  postId,
  authorId,
  { content, parentId, isAnonymous },
) => {
  const { error, value } = createCommentSchema.validate({
    content,
    parentId,
    isAnonymous,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });
  if (!post) {
    throw new Error("Post not found");
  }
  let parentAuthorId = null;
  if (parentId) {
    const comment = await prisma.comment.findUnique({
      where: { id: parentId },
      select: { postId: true, authorId: true },
    });
    if (!comment) {
      throw new Error("Parent comment not found");
    }
    if (comment.postId != postId) {
      throw new Error("Parent comment does not belong to this post");
    }
    parentAuthorId = comment.authorId;
  }
  const newComment = await prisma.comment.create({
    data: {
      content: value.content,
      postId,
      authorId,
      parentId: parentId ?? null,
      isAnonymous: value.isAnonymous,
    },
  });

  let alreadyNotifiedUserId = null;
  if (parentId && parentAuthorId != authorId) {
    alreadyNotifiedUserId = parentAuthorId;
    notificationEmitter.emit("notification", {
      userId: parentAuthorId,
      type: "REPLY",
      message: "Someone replied to your comment!",
      postId,
      commentId: newComment.id,
    });
  } else if (!parentId && post.authorId != authorId) {
    alreadyNotifiedUserId = post.authorId;
    notificationEmitter.emit("notification", {
      userId: post.authorId,
      type: "REPLY",
      message: "Someone commented on your post!",
      postId,
      commentId: newComment.id,
    });
  }

  const mentionedUsernames = extractMentions(content);
  if (mentionedUsernames.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: {
        username: { in: mentionedUsernames },
      },
      select: { id: true },
    });
    mentionedUsers.forEach((user) => {
      if (user.id != authorId && user.id != alreadyNotifiedUserId) {
        notificationEmitter.emit("notification", {
          userId: user.id,
          type: "MENTION",
          message: "Someone mentioned you in a comment!",
          postId: post.id,
          commentId: newComment.id,
        });
      }
    });
  }
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
  comments.forEach((comment) => {
    if (comment.isAnonymous) {
      comment.author = { username: "Anonymous", profilePic: null };
    }
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
  { content, isAnonymous },
) => {
  const { error, value } = updateCommentSchema.validate({
    content,
    isAnonymous,
  });
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
      isAnonymous: value.isAnonymous,
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
