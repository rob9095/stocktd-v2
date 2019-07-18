const Joi = require('joi');

const validSchemas = {
  '/api/auth/signup/': Joi.object().keys({
    email: Joi.string().email().required().error(() => `Invalid email provided`),
    password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required().error(() => `Invalid password provided`),
    company: Joi.string().required().error(()=>`Company must be a string`),
    firstName: Joi.string().empty("").error(() => `First Name must be a string`),
    lastName: Joi.string().empty("").error(() => `Last Name must be a string`),
    profileImageUrl: Joi.string().empty("").error(() => `Profile Image Url must be a string`),
    remember: Joi.boolean().error(() => `Remember must be boolean`),
  }),

  '/api/po-products/update': Joi.object().keys({
    company: Joi.string().required().error(() => `Company must be a string`),
    updates: Joi.array().max(7000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid id provided`),
      quantity: Joi.number().integer().error(() => `Quantity must be whole a number`),
      barcode: Joi.string().error(() => `Barcode must be a string`),
      scannedQuantity: Joi.number().integer().error(() => `Scanned Quantity must be whole a number`),
    })),
  }),

  '/api/models/query/': Joi.object().keys({
    model: Joi.string().required().error(() => `Model must be a string`),
    company: Joi.string().required().error(() => `Company must be a string`),
    sortBy: Joi.string().error(() => `Sort by must be a string`),
    sortDirection: Joi.string().lowercase().allow(['asc', 'desc', 'ascending', 'descending', '1', '-1']).default('asc').error(() => `Invalid sort direction provided`),
    activePage: Joi.number().integer().default(1).error(() => `Active Page must be whole a number`),
    rowsPerPage: Joi.number().integer().default(10).error(() => `Rows Per Page must be whole a number`),
    query: Joi.array().items(
      Joi.string().empty(""),
      Joi.number(),
      Joi.array().items(Joi.string().empty("")),
    ).max(1000).default([]).error(() => `Invalid query provided`),
    populateArray: Joi.array().max(1000).default([]).error(() => `Populate Array must be an array`),
  }),
  //const updatePoProductSchemas = Joi.array().items(updatePoProductSchema)

  '/api/products/import-csv/': Joi.object().keys({
    company: Joi.string().required().error(() => `Company must be a string`),
    data: Joi.array().max(7000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid id provided`),
      companyId: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Company ID provided`),
      defaultBox: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Default Box ID provided`),
      defaultLocation: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Default Location ID provided`),
      quantity: Joi.number().integer().error(() => `Quantity must be whole a number`),
      barcode: Joi.string().error(() => `Barcode must be a string`),
      sku: Joi.string().error(() => `Sku must be a string`),
      title: Joi.string().empty('').error(() => `Title must be a string`),
      supplier: Joi.string().empty('').error(() => `Supplier must be a string`),
      brand: Joi.string().empty('').error(() => `Brand must be a string`),
      asin: Joi.string().empty('').error(() => `ASIN must be a string`),
      weight: Joi.number().empty('').precision(2).error(() => `Weight must be a number with max of 2 decimals`),
      price: Joi.number().empty('').precision(2).error(() => `Price must be a number with max of 2 decimals`),
    })),
  }),

  '/api/purchase-orders/import-csv/': Joi.object().keys({
    company: Joi.string().required().error(() => `Company must be a string`),
    json: Joi.array().max(7000).items(Joi.object().keys({
      name: Joi.string().required().error(() => `PO Name must be a string`),
      type: Joi.string().lowercase().allow(['inbound', 'outbound']).required().error(() => `PO Type must be either "inbound" or "outbound"`),
      status: Joi.string().lowercase().allow(['complete', 'processing']).required().error(() => `PO Status must be either "processing" or "complete"`),
      sku: Joi.string().required().error(() => `Sku must be a string`),
      quantity: Joi.number().integer().error(() => `Quantity must be whole a number`),
      scannedQuantity: Joi.number().integer().error(() => `Quantity must be whole a number`),
      company: Joi.string().required().error(() => `Company must be a string`),
      skuCompany: Joi.string().required().error(() => `Sku Company must be a string`),
      poRef: Joi.string().required().error(() => `PO Ref must be a string`),
    })),
  }),
}

exports.validateSchema = function (config) {
  try {
    let { data, schema, options = {} } = config
    options = {
      stripUnknown: true,
      ...options
    }
    if (!validSchemas[schema]) {
      throw 'Invalid Schema'
    }
    return validSchemas[schema].validate(data,options)
    switch(schema) {
      case 'user':
        return userSchema.validate(data,options);
      case 'updatePoProduct':
        return updatePoProductSchema.validate(data,{stripUnknown: true})
      case 'productUpdate':
        return productUpdateSchema.validate(data,{stripUnknown: true})
      case 'poUpdate':
        return poUpdateSchema.validate(data,{stripUnknown: true})
      case 'modelQuery':
        return modelQuerySchema.validate()
      default :
        throw 'Invalid Schema'
    }
  } catch (message) {
    message = message || 'Invalid Schema'
    return {
      error: {
        details: [{message}],
      }
    };
  }
};

exports.validator = function (req, res, next) {
  try {
    let schema = req.originalUrl
    let options = {
      stripUnknown: true,
    }
    if (!validSchemas[schema]) {
      //maybe throw err or run default schema check
      //throw 'Invalid Schema'
      return next();
    }
    let result = validSchemas[schema].validate(req.body, options)
    if (result.error){
      return next({
        status: 400,
        message: result.error.details.map(d => d.message),
      })
    }
    req.body.data = result.value
    return next();
  } catch (message) {
    return next({
      status: 400,
      message: [message || 'Invalid Schema'],
    });
  }
};