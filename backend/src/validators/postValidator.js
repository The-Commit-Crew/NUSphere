import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(150).required(),
  content: Joi.string().min(10).required(),
  topicId: Joi.number().integer().positive().required(),
});
