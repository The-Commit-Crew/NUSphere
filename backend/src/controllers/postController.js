import {
  createPostService,
  getPostByIdService,
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
    const result = await getPostByIdService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
