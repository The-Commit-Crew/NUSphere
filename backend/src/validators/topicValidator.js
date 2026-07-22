import Joi from "joi";

export const createTopicSchema = Joi.object({
  name: Joi.string().trim().min(3).max(150).required().messages({
    "string.min": "Name must be at least 3 characters",
    "string.max": "Name cannot exceed 150 characters",
    "any.required": "Name is required",
    "string.empty": "Name cannot be empty",
  }),
  description: Joi.string().trim().min(10).required().messages({
    "string.min": "Description must be at least 10 characters",
    "any.required": "Description is required",
    "string.empty": "Description cannot be empty",
  }),
});
