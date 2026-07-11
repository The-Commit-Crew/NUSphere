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
  isAnonymous: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Anonymity status should be a Boolean",
  }),
});

export const voteSchema = Joi.object({
  voteType: Joi.string().valid("UP", "DOWN").required().messages({
    "any.only": "Vote type must be exactly 'UP' or 'DOWN'",
    "any.required": "Vote type is required",
    "string.empty": "Vote type cannot be empty",
    "string.base": "Vote type must be a valid text string",
  }),
});

export const getPostQuerySchema = Joi.object({
  q: Joi.string().allow("").optional().messages({
    "string.base": "Query must be a valid string",
  }),
  sort: Joi.string()
    .valid("new", "top", "hot")
    .optional()
    .default("new")
    .messages({
      "string.base": "Sort query must be a valid string",
      "any.only": "Sort query must be exactly 'new', 'top', or 'hot'",
    }),
  topicId: Joi.number().integer().positive().optional().messages({
    "number.base": "Topic is required",
    "number.integer": "Invalid topic selected",
    "number.positive": "Invalid topic selected",
  }),
  page: Joi.number().integer().positive().default(1).optional().messages({
    "number.base": "Page number is required",
    "number.integer": "Invalid page number",
    "number.positive": "Invalid page number",
  }),
  limit: Joi.number()
    .integer()
    .positive()
    .default(10)
    .max(50)
    .optional()
    .messages({
      "number.base": "Limit is required",
      "number.integer": "Invalid limit",
      "number.positive": "Invalid limit",
    }),
});
