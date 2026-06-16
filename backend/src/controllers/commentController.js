import {
  createCommentService,
  getPostCommentsService,
  updateCommentService,
  deleteCommentService,
} from "../services/commentService.js";

export const createComment = async (req, res) => {
  try {
    const result = await createCommentService(
      parseInt(req.params.id),
      parseInt(req.user.userId),
      req.body,
    );
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getPostComments = async (req, res) => {
  try {
    const result = await getPostCommentsService(parseInt(req.params.id));
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const updateComment = async (req, res) => {
  try {
    const result = await updateCommentService(
      parseInt(req.params.id),
      parseInt(req.user.userId),
      req.body,
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const result = await deleteCommentService(
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
