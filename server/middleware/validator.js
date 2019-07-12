const Joi = require('joi');

const userSchema = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required(),
  company: Joi.string().required(),
  firstName: Joi.string(),
  lastName: Joi.string(),
  profileImageUrl: Joi.string(),
  remember: Joi.boolean(),
})

const userWriteSchemas =  Joi.array().items(userSchema)

exports.validateSchema = function (config) {
  try {
    let { data, schema } = config
    switch(schema) {
      case 'user':
        return userSchema.validate(data);
      default :
      throw 'Invalid Schema'
    }
  } catch (message) {
    return {error: {
        status: 400,
        message,
      }
    };
  }
};