const Joi = require('joi');

const validateUser = Joi.object({
    username: Joi.string().alphanum().min(3).max(10).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

module.exports = validateUser

