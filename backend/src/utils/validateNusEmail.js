import Joi from Joi;

export const registerSchema = Joi.object({
    email: Joi.string().email().pattern(/(@u\.nus\.edu|@nus\.edu\.sg)$/).required(),
    password: Joi.string().min(6).required(),
    username: Joi.string().min(3),
});