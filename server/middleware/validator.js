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

const updatePoProductSchema = Joi.array().max(7000).items(Joi.object().keys({
  id: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid id provided`),
  quantity: Joi.number().integer().error(() => `Quantity must be whole a number`),
  scannedQuantity: Joi.number().integer().error(() => `Scanned Quantity must be whole a number`),
}))

//const updatePoProductSchemas = Joi.array().items(updatePoProductSchema)

exports.validateSchema = function (config) {
  try {
    let { data, schema } = config
    switch(schema) {
      case 'user':
        return userSchema.validate(data,{stripUnknown: true});
      case 'updatePoProduct':
        return updatePoProductSchema.validate(data,{stripUnknown: true})
      default :
      throw 'Invalid Schema'
    }
  } catch (message) {
    return {error: {
        message,
      }
    };
  }
};