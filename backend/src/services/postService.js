import prisma from "../config/prisma.js";
import {
  createPostSchema,
  voteSchema,
  getPostQuerySchema,
} from "../validators/postValidator.js";
import notificationEmitter from "../utils/notificationEmitter.js";
import { extractMentions } from "../utils/mentionParser.js";

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
  const mentionedUsernames = extractMentions(content);
  if (mentionedUsernames.length > 0) {
    const mentionedUsers = await prisma.user.findMany({
      where: {
        username: { in: mentionedUsernames },
      },
      select: { id: true },
    });
    mentionedUsers.forEach((user) => {
      if (user.id != userId) {
        notificationEmitter.emit("notification", {
          userId: user.id,
          type: "MENTION",
          message: "Someone mentioned you in a post!",
          postId: post.id,
          commentId: null,
        });
      }
    });
  }
  return post;
};

export const getPostByIdService = async (postId, userId = null) => {
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
  let userVoteStatus = null;

  if (userId) {
    const vote = await prisma.vote.findUnique({
      where: { userId_postId: { userId, postId: parsedPostId } },
    });
    if (vote) {
      userVoteStatus = vote.voteType;
    }
  }
  return { ...post, userVoteStatus };
};

export const castVoteService = async (userId, postId, { voteType }) => {
  const { error } = voteSchema.validate({ voteType });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const parsedPostId = parseInt(postId);

  const post = await prisma.post.findUnique({ where: { id: parsedPostId } });
  if (!post) {
    throw new Error("Post not found");
  }

  const existingVote = await prisma.vote.findUnique({
    where: { userId_postId: { userId, postId: parsedPostId } },
  });

  let updatedPost;
  if (!existingVote) {
    [, updatedPost] = await prisma.$transaction([
      prisma.vote.create({
        data: { voteType, userId, postId: parsedPostId },
      }),
      prisma.post.update({
        where: {
          id: parsedPostId,
        },
        data:
          voteType === "UP"
            ? { upvoteCount: { increment: 1 } }
            : { downvoteCount: { increment: 1 } },
      }),
    ]);
  } else if (existingVote.voteType === voteType) {
    [, updatedPost] = await prisma.$transaction([
      prisma.vote.delete({
        where: { userId_postId: { userId, postId: parsedPostId } },
      }),
      prisma.post.update({
        where: { id: parsedPostId },
        data:
          voteType === "UP"
            ? { upvoteCount: { decrement: 1 } }
            : { downvoteCount: { decrement: 1 } },
      }),
    ]);
  } else {
    [, updatedPost] = await prisma.$transaction([
      prisma.vote.update({
        where: { userId_postId: { userId, postId: parsedPostId } },
        data: { voteType },
      }),
      prisma.post.update({
        where: { id: parsedPostId },
        data:
          voteType === "UP"
            ? {
                upvoteCount: { increment: 1 },
                downvoteCount: { decrement: 1 },
              }
            : {
                upvoteCount: { decrement: 1 },
                downvoteCount: { increment: 1 },
              },
      }),
    ]);
  }
  if (
    voteType == "UP" &&
    post.authorId != userId &&
    (!existingVote || existingVote.voteType == "DOWN")
  ) {
    notificationEmitter.emit("notification", {
      userId: post.authorId,
      type: "VOTE",
      message: "Someone upvoted your post!",
      postId: parsedPostId,
      commentId: null,
    });
  }
  return {
    id: updatedPost.id,
    upvoteCount: updatedPost.upvoteCount,
    downvoteCount: updatedPost.downvoteCount,
  };
};

export const getAggregatedPostsService = async ({
  q,
  sort,
  topicId,
  page,
  limit,
}) => {
  const { error, value } = getPostQuerySchema.validate({
    q,
    sort,
    topicId,
    page,
    limit,
  });
  if (error) {
    throw new Error(error.details[0].message);
  }
  const skip = (value.page - 1) * value.limit;
  const whereClause = {};
  if (value.topicId) {
    whereClause.topicId = value.topicId;
  }
  if (q && q.trim() !== "") {
    const formattedQuery = value.q.trim().split(/\s+/).join(" | ");
    whereClause.OR = [
      { title: { search: formattedQuery } },
      { content: { search: formattedQuery } },
    ];
  }
  if (value.sort === "new" || value.sort === "top") {
    return await prisma.post.findMany({
      skip: skip,
      take: value.limit,
      where: whereClause,
      orderBy:
        value.sort === "new"
          ? {
              createdAt: "desc",
            }
          : {
              upvoteCount: "desc",
            },
      include: {
        author: {
          select: {
            username: true,
            firstName: true,
            lastName: true,
          },
        },
        topic: { select: { name: true } },
      },
    });
  } else {
    let sqlWhere = `1=1`;
    if (value.topicId) {
      sqlWhere += ` AND p."topicId" = ${value.topicId}`;
    }
    if (q && q.trim() !== "") {
      const formattedQuery = value.q.trim().split(/\s+/).join(" | ");
      const safeQuery = formattedQuery.replace(/'/g, "''");
      sqlWhere += ` AND to_tsvector('english', p.title || ' ' || p.content) @@ to_tsquery('english', '${safeQuery}')`;
    }
    const rawPosts = await prisma.$queryRawUnsafe(`
      SELECT p.*,
             t.name as "topicName",
             u.username as "authorUsername",
             u."firstName" as "authorFirstName",
             u."lastName" as "authorLastName",
             (p."upvoteCount" - p."downvoteCount") / POWER(EXTRACT(EPOCH FROM (NOW() - p."createdAt"))/3600 + 2, 1.5) AS "hotScore"
      FROM "Post" p
      JOIN "Topic" t ON p."topicId" = t.id
      JOIN "User" u ON p."authorId" = u.id
      WHERE ${sqlWhere}
      ORDER BY "hotScore" DESC
      LIMIT ${value.limit} OFFSET ${skip}
   `);
    return rawPosts.map((post) => ({
      id: post.id,
      title: post.title,
      content: post.content,
      upvoteCount: post.upvoteCount,
      downvoteCount: post.downvoteCount,
      topicId: post.topicId,
      authorId: post.authorId,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
      author: {
        username: post.authorUsername,
        firstName: post.authorFirstName,
        lastName: post.authorLastName,
      },
      topic: {
        name: post.topicName,
      },
    }));
  }
};
