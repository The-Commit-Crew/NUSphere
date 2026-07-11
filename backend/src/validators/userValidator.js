import Joi from "joi";

export const updateProfileSchema = Joi.object({
  bio: Joi.string().max(500).allow(null, "").messages({
    "string.max": "Bio cannot exceed 500 characters",
  }),
  githubLink: Joi.string()
    .uri({ scheme: ["https"] })
    .max(255)
    .allow(null, "")
    .messages({
      "string.uriCustomScheme":
        "GitHub link must be a valid secure URL (https)",
      "string.max": "URL is too long (cannot exceed 255 characters)",
    }),
  linkedinLink: Joi.string()
    .uri({ scheme: ["https"] })
    .max(255)
    .allow(null, "")
    .messages({
      "string.uriCustomScheme":
        "LinkedIn link must be a valid secure URL (https)",
      "string.max": "URL is too long (cannot exceed 255 characters)",
    }),
  skills: Joi.array()
    .items(
      Joi.string().trim().messages({
        "string.empty": "Skill names cannot be empty",
      }),
    )
    .allow(null),
});
