import {
  getAllTopicsService,
  getTopicByIdService,
  createTopicService,
} from "../services/topicService.js";

export const getAllTopics = async (req, res) => {
  try {
    const result = await getAllTopicsService();
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const result = await getTopicByIdService(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};

export const createTopic = async (req, res) => {
  try {
    const result = await createTopicService(req.body);
    if (!result.success) {
      return res.status(200).json(result);
    }
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({
      message: error.message,
    });
  }
};
