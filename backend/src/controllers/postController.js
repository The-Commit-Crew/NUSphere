import {
  createPostService,
  getPostByIdService,
  castVoteService,
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
