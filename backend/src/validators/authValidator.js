import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.min": "First name must be at least 2 characters",
      "string.max": "First name cannot exceed 50 characters",
      "string.pattern.base": "First name can only contain letters and spaces",
      "any.required": "First name is required",
      "string.empty": "First name cannot be empty",
    }),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required()
    .messages({
      "string.min": "Last name must be at least 2 characters",
      "string.max": "Last name cannot exceed 50 characters",
      "string.pattern.base": "Last name can only contain letters and spaces",
      "any.required": "Last name is required",
      "string.empty": "Last name cannot be empty",
    }),

  username: Joi.string().alphanum().min(3).max(50).required().messages({
    "string.alphanum": "Username can only contain letters and numbers",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 20 characters",
    "any.required": "Username is required",
    "string.empty": "Username cannot be empty",
  }),

  email: Joi.string()
    .email()
    .pattern(/(@u\.nus\.edu|@nus\.edu\.sg)$/)
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.pattern.base":
        "Please use your NUS email address (@u.nus.edu or @nus.edu.sg)",
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
    }),

  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/)
    .messages({
      "string.min": "Password must be at least 8 characters",
      "string.pattern.base":
        "Password must contain at least one letter and one number",
      "any.required": "Password is required",
      "string.empty": "Password cannot be empty",
    }),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/(@u\.nus\.edu|@nus\.edu\.sg)$/)
    .optional()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.pattern.base":
        "Please use your NUS email address (@u.nus.edu or @nus.edu.sg)",
    }),

  username: Joi.string().alphanum().min(3).max(50).optional().messages({
    "string.alphanum": "Username can only contain letters and numbers",
    "string.min": "Username must be at least 3 characters",
    "string.max": "Username cannot exceed 20 characters",
  }),

  password: Joi.string().required().messages({
    "any.required": "Password is required",
    "string.empty": "Password cannot be empty",
  }),
})
  .or("email", "username")
  .messages({
    "object.missing": "Please provide either your email or username to log in",
  });

export const otpSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/(@u\.nus\.edu|@nus\.edu\.sg)$/)
    .required()
    .messages({
      "string.email": "Please enter a valid email address",
      "string.pattern.base":
        "Please use your NUS email address (@u.nus.edu or @nus.edu.sg)",
      "any.required": "Email is required",
      "string.empty": "Email cannot be empty",
    }),
  otp: Joi.string().length(6).pattern(/^\d+$/).required().messages({
    "string.length": "Verification code must be exactly 6 digits",
    "string.pattern.base": "Verification code must contain numbers only",
    "any.required": "Verification code is required",
    "string.empty": "Verification code cannot be empty",
  }),
});
