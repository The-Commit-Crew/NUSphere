import Joi from "joi";

export const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(150).required().messages({
    "string.min": "Title must be at least 3 characters",
    "string.max": "Title cannot exceed 150 characters",
    "any.required": "Title is required",
    "string.empty": "Title cannot be empty",
  }),
  content: Joi.string().min(10).required().messages({
    "string.min": "Content must be at least 10 characters",
    "any.required": "Content is required",
    "string.empty": "Content cannot be empty",
  }),
  topicId: Joi.number().integer().positive().required().messages({
    "number.base": "Topic is required",
    "number.integer": "Invalid topic selected",
    "number.positive": "Invalid topic selected",
    "any.required": "Please select a topic for your post",
  }),
});
