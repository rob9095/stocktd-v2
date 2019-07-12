const Joi = require('joi');

const userSchema = Joi.object().keys({
  username: Joi.string().alphanum().min(3).max(30).required(),
  password: Joi.string().regex(/^[a-zA-Z0-9]{3,30}$/),
  access_token: [Joi.string(), Joi.number()],
  birthyear: Joi.number().integer().min(1900).max(2013),
  email: Joi.string().email()
}).with('username', 'birthyear').without('password', 'access_token');

exports.validateSchema = function (req, res, next) {
  try {

    const result = Joi.validate({ username: 'abc', birthyear: 1994 }, schema);
    return result
  } catch (err) {
    return next({
      status: 400,
      message: err,
    });
  }
};