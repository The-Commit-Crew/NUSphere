import Joi from "joi";

export const registerSchema = Joi.object({
  firstName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required(),

  lastName: Joi.string()
    .min(2)
    .max(50)
    .pattern(/^[a-zA-Z\s]+$/)
    .required(),

  username: Joi.string().alphanum().min(3).max(50).required(),

  email: Joi.string()
    .email()
    .pattern(/(@u\.nus\.edu|@nus\.edu\.sg)$/)
    .required(),

  password: Joi.string()
    .min(8)
    .required()
    .pattern(/^(?=.*[a-zA-Z])(?=.*\d)/),
});

export const loginSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/(@u\.nus\.edu|@nus\.edu\.sg)$/)
    .optional(),

  username: Joi.string().alphanum().min(3).max(50).optional(),

  password: Joi.string().required(),
}).or("email", "username");

export const otpSchema = Joi.object({
  email: Joi.string()
    .email()
    .pattern(/(@u\.nus\.edu|@nus\.edu\.sg)$/)
    .required(),
  otp: Joi.string().length(6).pattern(/^\d+$/).required(),
});
