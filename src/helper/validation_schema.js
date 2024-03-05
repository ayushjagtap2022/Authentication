import Joi from "joi";

const authSchema = Joi.object({
    name:Joi.string().min(2).max(20).required(),
    email: Joi.string().email().lowercase().required(),
    password: Joi.string().pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/).required()
});

export { authSchema };
