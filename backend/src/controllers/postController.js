import {
  createPostService,
  getPostByIdService,
  castVoteService,
  getAggregatedPostsService,
  deletePostService,
  checkDuplicatesService,
} from "../services/postService.js";

export const createPost = async (req, res) => {
  try {
    const result = await createPostService(req.user.userId, req.body);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getPostById = async (req, res) => {
  try {
    const userId = req.user?.userId;
    const result = await getPostByIdService(req.params.id, userId);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const castVote = async (req, res) => {
  try {
    const result = await castVoteService(
      req.user.userId,
      req.params.id,
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const result = await getAggregatedPostsService(req.query);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const deletePost = async (req, res) => {
  try {
    const result = await deletePostService(
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

export const checkDuplicates = async (req, res) => {
  try {
    const { title, content } = req.body;
    if ((!title && !content) || (title?.length < 5 && content?.length < 10)) {
      return res.status(200).json({ similarPosts: [] });
    }
    const similarPosts = await checkDuplicatesService(title, content);
    res.status(200).json({ similarPosts });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Duplicate check failed: ", error);
    res.status(200).json({ similarPosts: [] });
  }
};
