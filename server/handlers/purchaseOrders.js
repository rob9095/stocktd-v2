const db = require('../models');
const { validateSchema } = require('../middleware/validator');

function groupBy(objectArray, property) {
 return objectArray.reduce(function (acc, obj) {
   var key = obj[property];
   if (!acc[key]) {
     acc[key] = [];
   }
   acc[key].push(obj);
   return acc;
 }, {});
}

const upsertPurchaseOrders = (config) => {
  let {data, company, user } = config
  return new Promise( async (resolve,reject) => {
    try {
      if (data.length > 7000) {
        reject({
          status: 400,
          message: ['Request to large']
        })
        return
      }
      let poData = data.map((po, i) => ({
        name: po['name'],
        type: po['type'],
        ...po['status'] && {status: po['status']},
        sku: po['sku'],
        quantity: po['quantity'] || 0,
        ...po.scannedQuantity && {scannedQuantity: po.scannedQuantity},
        company,
        skuCompany: `${po['sku']}-${company}`,
        ...po.poRef ? {poRef: po.poRef} : {poRef: `${company}-${po['name']}-${po['type']}`},
      }))
      let validPoData = validateSchema({data: poData, schema: 'poUpdate'})
      if (validPoData.error) {
        reject({
          status: 400,
          message: validPoData.error.details.map(d => d.message),
        })
        return
      }
      let groupedPOs = groupBy(validPoData.value, 'poRef');
      let poUpdates = [];
      let poProductUpdates = [];
      let productUpdates = [];
      for (let po of Object.entries(groupedPOs)) {
        let poRef = po[0]
        let poArr = po[1]
        let qtyArr = poArr.map(line => parseInt(line.quantity))
        let sum = qtyArr.reduce((acc, cv) => (acc + cv), 0)
        let poProductsObj = groupBy(poArr, 'skuCompany')
        poUpdates.push({
          updateOne: {
            filter: { poRef },
            update: {
              name: poArr[0].name,
              type: poArr[0].type,
              ...poArr[0].status && {status: poArr[0].status},
              poRef,
              company: poArr[0].company,
              $inc: { quantity: parseInt(sum) },
              $setOnInsert: { createdOn: new Date(), ...!poArr[0].status && {status: 'processing'} }
            },
            upsert: true
          }
        });
        for (let skuRef of Object.entries(poProductsObj)) {
          let skuArr = skuRef[1]
          let currentSku = skuRef[0]
          let skuSum = skuArr.map(sku => parseInt(sku.quantity)).reduce((acc, cv) => (acc + cv), 0)
          let scannedSkuSum = skuArr.filter(sku => (Number.isInteger(parseInt(sku.scannedQuantity)))).length > 0 ? skuArr.map(sku => parseInt(sku.scannedQuantity)).reduce((acc, cv) => (acc + cv), 0) : undefined
          // pull quantity and scannedQuantity out of product becuase we use $inc to update those
          let {quantity, scannedQuantity, ...product} = skuArr[0]
          if (product.sku) {
            poProductUpdates.push({
              updateOne: {
                filter: { skuCompany: currentSku, poRef },
                update: {
                  ...product,
                  //if scannedSkuSum is defined update scannedQuantity otherwise update quantity
                  $inc: { ...scannedSkuSum ? { scannedQuantity: parseInt(scannedSkuSum) } : {quantity: parseInt(skuSum)} },
                  $setOnInsert: {
                    createdOn: new Date(),
                    //if there is no scannedSkuSum set scannedQuantity to the 0 on insert otherwise set quantity to skuSum
                    ...!scannedSkuSum ? { scannedQuantity: 0 } : { quantity: parseInt(skuSum)},
                  }
                },
                upsert: true
              }
            });
            productUpdates.push({
              updateOne: {
                filter: { skuCompany: currentSku },
                update: {
                  company,
                  sku: product.sku,
                  ...product.barcode && { barcodeCompany: product.barcode + "-" + company },
                  skuCompany: currentSku,
                  $setOnInsert: {
                    createdOn: new Date(),
                    quantityToShip: 0,
                    ...!product.barcode && { barcodeCompany: product.sku + "-" + company },
                    //if we are inserting and scannedSkuSum is not undefined, we need to set an initial qty value
                    ...scannedSkuSum && { quantity: product.type === 'outbound' ? parseInt(-skuSum) : parseInt(skuSum)}
                  },
                  //if scannedSkuSum is undefined we are just updating scannedQuanatity on poProduct so no need ot update quantity
                  ...!scannedSkuSum &&
                  {
                    $inc: product.type === 'outbound' ?
                      { quantity: parseInt(-skuSum) }
                      :
                      { quantity: parseInt(skuSum) }
                  }
                },
                upsert: true,
              }
            })
          }
        }
      }
      let updatedPOs = poUpdates.length > 0 && await db.PurchaseOrder.bulkWrite(poUpdates)
      let updatedPoProducts = poProductUpdates.length > 0 && await db.PoProduct.bulkWrite(poProductUpdates)
      let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates)
      if (updatedPoProducts.nUpserted > 0) {
        //need to add refs for products and pos if we upserted any PoProducts
        let andQuery = Object.values(updatedPoProducts.upsertedIds).map(val => ({ "_id": val }))
        let poProducts = await db.PoProduct.find({ company, $and: [{ $or: andQuery }] })
        let productAndQuery = poProducts.map(doc => ({ skuCompany: doc.skuCompany, company }))
        let products = await db.Product.find({ company, $and: [{ $or: productAndQuery }] })
        let poAndQuery = poProducts.map(doc => ({ company, poRef: doc.poRef }))
        let pos = await db.PurchaseOrder.find({ company, $and: [{ $or: poAndQuery }] })
        poProductUpdates = []
        for (let poProduct of poProducts) {
          poProductUpdates.push({
            updateOne: {
              filter: { _id: poProduct._id },
              update: {
                product: products.find(p => p.skuCompany === poProduct.skuCompany)._id,
                po: pos.find(po => po.poRef === poProduct.poRef)._id,
              },
            }
          })
        }
        updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
      }
      resolve({
        updatedPOs,
        updatedPoProducts,
        updatedProducts,
      })

    } catch(err) {
      console.log(err)
      reject({
        status: 404,
        message: err.toString(),
      })
    }
  })
}

/*
* UPDATE/UPSERT Purchase Order, associated PoProducts, and associated Products
* Accepted Values: name, type, status, sku, quantity, company, skuCompany, poRef
* Returns: bulkWrite array result
*/
exports.handlePOImport = async (req, res, next) => {
  try{
    if (req.body.json.length > 7000) {
			return next({
				status: 404,
				message: ['Request to large']
			})
		}
    const company = req.body.company
    let result = await upsertPurchaseOrders({
      data: req.body.json,
      company
    })

    // let poData = req.body.json.map((po,i)=>({
    //   name: po['name'],
    //   type: po['type'],
    //   status: po['status'] || 'complete',
    //   sku: po['sku'],
    //   quantity: po['quantity'] || 0,
    //   company: company,
    //   skuCompany: `${po['sku']}-${company}`,
    //   poRef: `${company}-${po['name']}-${po['type']}`,
    // }))
    // let groupedPOs = groupBy(poData, 'poRef');
    // let poUpdates = [];
    // let poProductUpdates = [];
    // let productUpdates = [];
    // for (let po of Object.entries(groupedPOs)) {
    //   let poRef = po[0]
    //   let poArr = po[1]
    //   let qtyArr = poArr.map(line => parseInt(line.quantity))
    //   let sum = qtyArr.reduce((acc, cv) => (acc + cv), 0)
    //   let poProductsObj = groupBy(poArr, 'skuCompany')
    //   poUpdates.push({
    //     updateOne: {
    //       filter: { poRef },
    //       update: {
    //         name: poArr[0].name,
    //         type: poArr[0].type,
    //         status: poArr[0].status,
    //         poRef,
    //         company: poArr[0].company,
    //         $inc: { quantity: parseInt(sum) },
    //         $setOnInsert: { createdOn: new Date() }
    //       },
    //       upsert: true
    //     }
    //   });
    //   for (let skuRef of Object.entries(poProductsObj)) {
    //     let skuArr = skuRef[1]
    //     let currentSku = skuRef[0]
    //     let skuQtyArr = skuArr.map(sku => parseInt(sku.quantity))
    //     let skuSum = skuQtyArr.reduce((acc, cv) => (acc + cv), 0)
    //     let scannedSkuSum = skuArr.map(sku=> parseInt(sku.scannedQuantity)).reduce((acc,cv => (acc+cv),0))
    //     let product = skuArr[0]
    //     delete product.quantity
    //     if (product.sku) {
    //       poProductUpdates.push({
    //         updateOne: {
    //           filter: { skuCompany: currentSku, poRef },
    //           update: {
    //             ...product,
    //             $inc: { quantity: parseInt(skuSum), ...scannedSkuSum && {scannedQuantity: parseInt(scannedSkuSum)} },
    //             $setOnInsert: {
    //               createdOn: new Date(),
    //               scannedQuantity: 0
    //             }
    //           },
    //           upsert: true
    //         }
    //       });
    //       productUpdates.push({
    //         updateOne: {
    //           filter: { skuCompany: currentSku },
    //           update: {
    //             company,
    //             sku: product.sku,
    //             ...product.barcode && {barcodeCompany: product.barcode + "-" + company},
    //             skuCompany: currentSku,
    //             $setOnInsert: { createdOn: new Date(), quantityToShip: 0, ...!product.barcode && { barcodeCompany: product.sku + "-" + company } },
    //             $inc: product.type === 'outbound' ?
    //               { quantity: parseInt(-skuSum) }
    //               :
    //               { quantity: parseInt(skuSum) }
    //           },
    //           upsert: true,
    //         }
    //       })
    //     }
    //   }
    // }
    // let updatedPOs = await db.PurchaseOrder.bulkWrite(poUpdates)
    // let updatedPoProducts = poProductUpdates.length > 0 && await db.PoProduct.bulkWrite(poProductUpdates)
    // let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates)
    // if (updatedPoProducts.nUpserted > 0) {
    //   console.log(updatedPoProducts)
    //   //need to add refs for products and pos if we upserted any PoProducts
    //   let andQuery = Object.values(updatedPoProducts.upsertedIds).map(val => ({ "_id": val }))
    //   let poProducts = await db.PoProduct.find({ company, $and: [{ $or: andQuery }] })
    //   let productAndQuery = poProducts.map(doc=>({skuCompany: doc.skuCompany, company}))
    //   let products = await db.Product.find({ company, $and: [{ $or: productAndQuery }] })
    //   let poAndQuery = poProducts.map(doc=>({company, poRef: doc.poRef}))
    //   let pos = await db.PurchaseOrder.find({ company, $and: [{ $or: poAndQuery }] })
    //   poProductUpdates = []
    //   for (let poProduct of poProducts) {
    //     poProductUpdates.push({
    //       updateOne: {
    //         filter: {_id: poProduct._id},
    //         update: {
    //           product: products.find(p=>p.skuCompany === poProduct.skuCompany)._id,
    //           po: pos.find(po=>po.poRef === poProduct.poRef)._id,
    //         },
    //       }
    //     })
    //   }
    //   updatedPoProducts = await db.PoProduct.bulkWrite(poProductUpdates)
    // }
    return res.status(200).json({
      ...result,
    })
  } catch(err) {
    return next(err)
  }
}

/*
* UPDATE Purchase Order and associated PoProducts
* Accepted Values: updates obj array in req.body. accepted values include:  [{name, createdOn, type, status}]
* Returns: bulkWrite array result
*/
exports.updatePurchaseOrder = async (req, res, next) => {
  try {
    let { updates, company } = req.body
    //add validation check here, updates is array with id, createdOn cannot be changed moved forward past today's date
    if (updates.length > 3000) {
      return next({
        status: 400,
        message: ['Request to large'],
      })
    }
    if (!updates || updates.length === 0) {
      return({
        status: 400,
        message: ['No updates found']
      })
    }
    //basic update for each po
    let poUpdates = updates.map(po=>{
      let update = {name, createdOn, type, status } = po
      console.log({update})
      return ({
        updateOne: {
          filter: { _id: po.id, company},
          update,
        }
      })
    })
    let poProductUpdates = []
    let productUpdates = []
    //andQuery to grab all products on pos beings in updates
    let andQuery = updates.map(({id})=>({po: id}))
    let poProducts = await db.PoProduct.find({company, $and: [{ $or: andQuery }]}).populate('po')
    //loop each po and find poProducts for 
    if (poProducts.length > 0) {
      for (let poU of updates) {
        let po = { name, createdOn, type, status } = poU
        let products = poProducts.filter(pp => pp.po._id == poU.id)
        //poProduct updates
        let ppUpdates = products.map(poLine => ({
          updateOne: {
            filter: { _id: poLine._id },
            update: { ...po },
          }
        }))
        poProductUpdates.push(...ppUpdates);
        //update quantity on main product if new po.type is different than current poProduct type
        let pUpdates = products.filter(p => p.type !== po.type).map(poLine => ({
          updateOne: {
            filter: { skuCompany: poLine.skuCompany },
            update: {
              $inc: po.type === 'outbound' ?
                { quantity: parseInt(-poLine.quantity) }
                :
                { quantity: parseInt(poLine.quantity) }
            }
          }
        })
        )
        productUpdates.push(...pUpdates)
      }
    }
    let updatedPurchaseOrders = await db.PurchaseOrder.bulkWrite(poUpdates)
    let updatedPoProducts = poProductUpdates.length > 0 && await db.PoProduct.bulkWrite(poProductUpdates)
    let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates);
    return res.status(200).json({
      updatedPurchaseOrders,
      updatedPoProducts,
      updatedProducts,
    });
  } catch(err) {
    console.log({err})
    return next(err)
  }
}

/*
* DELETE Purchase Order and associated PoProducts, update assocaited Products
* Accepted Values: data obj array in req.body. ex:  [{_id,poRef}]
* Returns: bulkWrite array result
*/
exports.removePurchaseOrder = async (req, res, next) => {
  try {
    let { data, company } = req.body
    if (data.length > 3000) {
      return next({
        status: 400,
        message: ['Request to large'],
      })
    }
    if (!data || data.length === 0) {
      return ({
        status: 400,
        message: ['No removals found']
      })
    }
    
    let poRemovals = data.map(po => ({
      deleteOne: {
        filter: {_id: po.id}
      }
    }))
    let andQuery = data.map(({id})=>({po: id}))
    let poProducts = await db.PoProduct.find({company, $and: [{$or: andQuery}]}).populate('po')
    let poProductRemovals = poProducts.map(p=>{
      return ({
        deleteOne: {
          filter: {_id: p._id},
        }
      })
    })
    let productUpdates = poProducts.map(p => {
      return({
        updateOne: {
          filter: {_id: p.product},
          update: {
            $inc: p.po.type === 'outbound' ?
              { quantity: parseInt(p.quantity) }
              :
              { quantity: parseInt(-p.quantity) },
          }
        }
      })
    })
    let removedPos = await db.PurchaseOrder.bulkWrite(poRemovals)
    let removedPoProducts = poProductRemovals.length> 0 && await db.PoProduct.bulkWrite(poProductRemovals)
    let updatedProducts = productUpdates.length > 0 && await db.Product.bulkWrite(productUpdates)
    return res.status(200).json({
      removedPos,
      removedPoProducts,
      updatedProducts,
    })
  } catch(err) {
    return next(err)
  }
}

exports.upsertPurchaseOrders = upsertPurchaseOrders