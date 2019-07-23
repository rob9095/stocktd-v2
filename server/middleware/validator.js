const Joi = require('joi');

const validSchemas = {
  //auth routes
  '/api/auth/signup': Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().regex(/^[a-zA-Z0-9]{6,30}$/).required().error(() => `Invalid password provided`),
    company: Joi.string().required(),
    firstName: Joi.string().empty(""),
    lastName: Joi.string().empty(""),
    profileImageUrl: Joi.string().empty(""),
    remember: Joi.boolean(),
  }),

  //po product routes
  '/api/po-products/update': Joi.object().keys({
    company: Joi.string().required(),
    updates: Joi.array().max(7000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).required(),
      quantity: Joi.number().integer(),
      productbarcode: Joi.string(),
      scannedQuantity: Joi.number().integer(),
    })).required(),
  }),

  '/api/po-products/delete': Joi.object().keys({
    company: Joi.string().required(),
    data: Joi.array().max(7000).items(Joi.string().regex(/^[a-f\d]{24}$/i).required()).required(),
  }),

  //model routes
  '/api/models/query': Joi.object().keys({
    model: Joi.string().allow(['Product', 'PoProduct', 'PurchaseOrder', 'Location', 'BoxScan', 'BoxPrefix']).required(),
    company: Joi.string().required(),
    sortBy: Joi.string(),
    sortDirection: Joi.string().lowercase().allow(['asc', 'desc', 'ascending', 'descending', '1', '-1']).default('asc'),
    activePage: Joi.number().integer().default(1),
    rowsPerPage: Joi.number().integer().default(10),
    query: Joi.array().items(
      Joi.string().empty(""),
      Joi.boolean(),
      Joi.number(),
      Joi.array().items(Joi.string().empty(""),Joi.boolean(),Joi.array()),
    ).max(1000).default([]),
    populateArray: Joi.array().max(1000).default([]),
  }),

  '/api/models/get-all': Joi.object().keys({
    company: Joi.string().required(),
    limit: Joi.number().integer().default(10).max(100),
    documentRef: Joi.object(),
    regex: Joi.boolean().default(false),
    populateArray: Joi.array().max(1000).default([]),
    model: Joi.string().allow(['Product', 'PoProduct', 'PurchaseOrder', 'Location', 'BoxScan', 'BoxPrefix']).required(),
  }),

  '/api/models/upsert': Joi.object().keys({
    company: Joi.string().required(),
    model: Joi.string().allow(['Product', 'PoProduct', 'PurchaseOrder', 'Location', 'BoxScan', 'BoxPrefix']).required(),
    filterRef: Joi.string().required(),
    refModel: Joi.string().allow(['Product', 'PoProduct', 'PurchaseOrder', 'Location', 'BoxScan', 'BoxPrefix']),
    refUpdates: Joi.array().max(7000),
    data: Joi.array().max(7000).default([]).items(Joi.object()).required(),
  }),

  '/api/models/delete': Joi.object().keys({
    company: Joi.string().required(),
    model: Joi.string().allow(['Product', 'PoProduct', 'PurchaseOrder', 'Location', 'BoxScan', 'BoxPrefix']).required(),
    data: Joi.array().max(7000).items(Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid id provided`)).required(),
  }),

  //boxscan routes
  '/api/scans': Joi.object().keys({
    company: Joi.string().required(),
    scan: Joi.object().keys({
      barcode: Joi.string().required(),
      sku: Joi.string(),
      scanToPo: Joi.boolean().allow([true,false]).required(),
      currentPOs: Joi.array().items(Joi.object().keys({
        poRef: Joi.string().required(),
        _id: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid user id provided`),
      })),
      name: Joi.string().required(),
      prefix: Joi.string(),
      quantity: Joi.number().integer().required(),
      user: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid user id provided`),
      locations: Joi.array().max(7000).items(Joi.string().required()),
    }),
  }),

  '/api/scans/delete': Joi.object().keys({
    company: Joi.string().required(),
    data: Joi.array().max(7000).items(Joi.string().regex(/^[a-f\d]{24}$/i).required()),
  }),

  '/api/scans/update': Joi.object().keys({
    company: Joi.string().required(),
    data: Joi.array().max(7000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).required(),
      quantity: Joi.number().integer(),
      deleteDoc: Joi.boolean().allow(true,false),
      locations: Joi.array().max(7000).items(Joi.string()),
      name: Joi.string(),
      prefix: Joi.string(),
    }).required()),
    user: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid user id provided`),
  }),

  '/api/scans/import': Joi.object().keys({
    company: Joi.string().required(),
    data: Joi.array().max(7000).items(Joi.object().keys({
      sku: Joi.string().required(),
      'box name': Joi.string().required(),
      quantity: Joi.number().integer().required(),
      locations: Joi.alternatives().try(Joi.array().max(7000).items(Joi.string().allow('').required()),Joi.string().allow('')),
      barcode: Joi.string(),
      prefix: Joi.string(),
      'scan from': Joi.string().lowercase().allow('yes','no',''),
      'po name': Joi.string().allow(''),
      'po type': Joi.string().allow('inbound','outbound',''),
    }).required()),
    user: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid user id provided`),
  }),

  //location routes
  '/api/locations': Joi.object().keys({
    company: Joi.string().required(),
    locations: Joi.array().max(7000).items(Joi.string().required()),
    filterRef: Joi.string(),
  }),

  //product routes
  '/api/products/import-csv': Joi.object().keys({
    company: Joi.string().required(),
    data: Joi.array().max(7000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid id provided`),
      companyId: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Company ID provided`),
      defaultBox: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Default Box ID provided`),
      defaultLocation: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Default Location ID provided`),
      quantity: Joi.number().integer(),
      barcode: Joi.string(),
      sku: Joi.string(),
      title: Joi.string().empty(''),
      supplier: Joi.string().empty(''),
      brand: Joi.string().empty(''),
      asin: Joi.string().empty(''),
      weight: Joi.number().empty('').precision(2),
      price: Joi.number().empty('').precision(2),
      action: Joi.string().lowercase().allow(['delete']),
    })),
  }),

  '/api/products/update': Joi.object().keys({
    company: Joi.string().required(),
    updates: Joi.array().max(7000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid id provided`),
      companyId: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Company ID provided`),
      defaultBox: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Default Box ID provided`),
      defaultLocation: Joi.string().regex(/^[a-f\d]{24}$/i).error(() => `Invalid Default Location ID provided`),
      quantity: Joi.number().integer(),
      barcode: Joi.string(),
      sku: Joi.string(),
      title: Joi.string().empty(''),
      supplier: Joi.string().empty(''),
      brand: Joi.string().empty(''),
      asin: Joi.string().empty(''),
      weight: Joi.number().empty('').precision(2),
      price: Joi.number().empty('').precision(2),
    }))
  }),

  '/api/products/delete': Joi.object().keys({
    company: Joi.string().required(),
    products: Joi.array().max(7000).items(Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid id provided`)),
  }),
  
  //purchase order routes
  '/api/purchase-orders/import-csv': Joi.object().keys({
    company: Joi.string().required(),
    json: Joi.array().max(7000).items(Joi.object().keys({
      name: Joi.string().empty("").default('Generic'),
      type: Joi.string().lowercase().allow(['inbound', 'outbound',]).empty("").default('inbound'),
      status: Joi.string().lowercase().allow(['complete', 'processing',]).empty("").default('processing'),
      sku: Joi.string().required(),
      quantity: Joi.number().integer(),
      barcode: Joi.string(),
      scannedQuantity: Joi.number().integer(),
      poRef: Joi.string(),
    })).required(),
  }),

  '/api/purchase-orders/update': Joi.object().keys({
    company: Joi.string().required(),
    updates: Joi.array().max(3000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid id provided`),
      name: Joi.string(),
      type: Joi.string().lowercase().allow(['inbound', 'outbound']),
      status: Joi.string().lowercase().allow(['complete', 'processing']),
      createdOn: Joi.date().max('now'),      
    })),
  }),

  '/api/purchase-orders/delete': Joi.object().keys({
    company: Joi.string().required(),
    data: Joi.array().max(3000).items(Joi.object().keys({
      id: Joi.string().regex(/^[a-f\d]{24}$/i).required().error(() => `Invalid id provided`),
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
    // switch(schema) {
    //   case 'user':
    //     return userSchema.validate(data,options);
    //   case 'updatePoProduct':
    //     return updatePoProductSchema.validate(data,{stripUnknown: true})
    //   case 'productUpdate':
    //     return productUpdateSchema.validate(data,{stripUnknown: true})
    //   case 'poUpdate':
    //     return poUpdateSchema.validate(data,{stripUnknown: true})
    //   case 'modelQuery':
    //     return modelQuerySchema.validate()
    //   default :
    //     throw 'Invalid Schema'
    // }
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
    console.log({schema, body: req.body})
    let options = {
      stripUnknown: true,
    }
    if (!validSchemas[schema]) {
      //maybe throw err or run default schema check
      throw 'Invalid Schema'
      //return next();
    }
    let result = validSchemas[schema].validate(req.body, options)
    if (result.error){
      return next({
        status: 400,
        message: result.error.details.map(d => d.message),
      })
    }
    req.body = result.value
    return next();
  } catch (message) {
    return next({
      status: 400,
      message: [message || 'Invalid Schema'],
    });
  }
};