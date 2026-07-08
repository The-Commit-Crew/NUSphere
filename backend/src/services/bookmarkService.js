import prisma from "../config/prisma.js";

export const toggleBookmarkService = async (userId, postId) => {
  const post = await prisma.post.findUnique({
    where: {
      id: postId,
    },
  });
  if (!post) {
    throw new Error("Post not found");
  }
  const bookmark = await prisma.bookmark.findUnique({
    where: {
      userId_postId: { userId, postId },
    },
  });
  let bookmarkStatus;
  if (bookmark) {
    await prisma.bookmark.delete({
      where: {
        userId_postId: { userId, postId },
      },
    });
    bookmarkStatus = false;
  } else {
    await prisma.bookmark.create({
      data: { userId, postId },
    });
    bookmarkStatus = true;
  }
  return { bookmarkStatus: bookmarkStatus };
};

export const getUserBookmarksService = async (userId) => {
  const bookmarks = await prisma.bookmark.findMany({
    where: { userId },
    include: {
      post: {
        include: {
          topic: { select: { name: true } },
          author: {
            select: { firstName: true, lastName: true, username: true },
          },
          _count: { select: { comments: true } },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return bookmarks.map((bookmark) => ({
    ...bookmark.post,
    bookmarkedAt: bookmark.createdAt,
  }));
};
