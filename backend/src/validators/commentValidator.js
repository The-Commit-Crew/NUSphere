import Joi from "joi";

export const createCommentSchema = Joi.object({
  content: Joi.string().trim().max(1000).required().messages({
    "string.empty": "Comment content cannot be empty",
    "string.max": "Comment content cannot exceed 1000 characters",
    "any.required": "Comment content is required",
  }),

  parentId: Joi.number().integer().positive().allow(null).optional().messages({
    "number.base": "Parent ID must be a number",
    "number.integer": "Parent ID must be an integer",
    "number.positive": "Parent ID must be postive",
  }),

  isAnonymous: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Anonymity status should be a Boolean",
  }),
});

export const updateCommentSchema = Joi.object({
  content: Joi.string().trim().max(1000).required().messages({
    "string.empty": "Comment content cannot be empty",
    "string.max": "Comment content cannot exceed 1000 characters",
    "any.required": "Comment content is required",
  }),
  isAnonymous: Joi.boolean().optional().default(false).messages({
    "boolean.base": "Anonymity status should be a Boolean",
  }),
});
