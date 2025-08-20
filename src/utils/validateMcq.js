const Joi = require('joi');


const validateSubmit = Joi.object(
    {
        score:Joi.number(),
        mcqId:Joi.string(),
        timeInMs:Joi.number()

    }
);

module.exports = {validateSubmit};