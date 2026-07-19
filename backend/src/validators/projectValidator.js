import Joi from "joi";

export const createProjectSchema = Joi.object({
  title: Joi.string().min(5).max(100).required().messages({
    "string.empty": "Project title is required",
    "string.max": "Project title cannot exceed 100 characters",
    "string.min": "Project title must be at least 5 characters",
    "any.required": "Project title is required",
  }),
  description: Joi.string().min(20).required().messages({
    "string.empty": "Project description is required",
    "string.min": "Project description must be at least 20 characters",
    "any.required": "Project description is required",
  }),
  skills: Joi.array()
    .items(Joi.string().trim().required())
    .min(1)
    .required()
    .messages({
      "array.min": "You must include at least one skill",
      "any.required": "Skills array is required",
    }),
});

export const applyToProjectSchema = Joi.object({
  message: Joi.string().max(500).optional().messages({
    "string.max": "Messaage cannot exceed 500 characters",
  }),
});

export const updateApplicationStatusSchema = Joi.object({
  status: Joi.string().valid("ACCEPTED", "REJECTED").required().messages({
    "any.only": "Status must be exactly 'ACCEPTED' or 'REJECTED'",
    "any.required": "Status is required",
    "string.empty": "Status cannot be empty",
    "string.base": "Status must be a valid text string",
  }),
});

export const updateProjectSchema = Joi.object({
  title: Joi.string().min(5).max(100).optional().messages({
    "string.empty": "Project title cannot be empty if provided",
    "string.max": "Project title cannot exceed 100 characters",
    "string.min": "Project title must be at least 5 characters",
  }),
  description: Joi.string().min(20).optional().messages({
    "string.empty": "Project description cannot be empty if provided",
    "string.min": "Project description must be at least 20 characters",
  }),
  skills: Joi.array()
    .items(Joi.string().trim().required())
    .min(1)
    .optional()
    .messages({
      "array.min":
        "If you are updating skills, you must include at least one skill",
    }),

  status: Joi.string()
    .valid("OPEN", "IN_PROGRESS", "COMPLETED")
    .optional()
    .messages({
      "any.only": "Status must be exactly 'OPEN', 'IN_PROGRESS' or 'COMPLETED'",
      "string.empty": "Status cannot be empty if provided",
      "string.base": "Status must be a valid text string",
    }),
});

export const searchProjectQuerySchema = Joi.object({
  q: Joi.string().allow("").trim().optional().messages({
    "string.base": "Query must be a valid string",
  }),
  skills: Joi.string().allow("").trim().optional().messages({
    "string.base": "Skills query must be a valid string",
  }),
  skillMatch: Joi.string()
    .valid("any", "all")
    .optional()
    .default("any")
    .messages({
      "string.base": "skillMatch must be a valid string",
      "any.only": "skillMatch must be exactly 'any' or 'all'",
    }),

  sortBy: Joi.string()
    .valid("newest", "recommended")
    .optional()
    .default("newest")
    .messages({
      "any.only": "sortBy must be 'newest' or 'recommended'",
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
